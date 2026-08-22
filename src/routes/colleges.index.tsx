import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin,
  Search,
  ArrowRight,
  X,
  ExternalLink,
  Info,
  ChevronLeft,
  ChevronRight,
  GitCompare,
} from "lucide-react";
import { getOfficialColleges } from "@/lib/cap.functions";
import { CutoffNote } from "@/components/cutoff-note";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBackground } from "@/components/page-background";
import { PageHero } from "@/components/page-hero";
import pageHero from "@/assets/hero-gothic-cloister.png.asset.json";
import pageBg from "@/assets/colleges-bg.asset.json";
import {
  MAX_COMPARE,
  clearCompare,
  toggleCompare,
  useCompareSelection,
} from "@/lib/compare-store";

const PAGE_SIZE = 15;

const collegesQuery = queryOptions({
  queryKey: ["colleges-official-2026"],
  queryFn: () => getOfficialColleges(),
});

export const Route = createFileRoute("/colleges/")({
  head: () => ({
    meta: [
      { title: "Engineering Colleges — Maharashtra CAP Guide | MHT-CET Counselling Help" },
      {
        name: "description",
        content:
          "A simple student-friendly guide to Maharashtra MHT-CET CAP counselling, with college details, CAP process steps, important dates, and FAQs for students and parents.",
      },
      { property: "og:title", content: "Engineering Colleges — Maharashtra CAP Guide | MHT-CET Counselling Help" },
      {
        property: "og:description",
        content:
          "A simple student-friendly guide to Maharashtra MHT-CET CAP counselling, with college details, CAP process steps, important dates, and FAQs for students and parents.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(collegesQuery);
  },
  component: CollegesPage,
});

function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

function CollegesPage() {
  const { data: colleges } = useSuspenseQuery(collegesQuery);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [district, setDistrict] = useState("all");
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const selection = useCompareSelection();

  const cities = useMemo(
    () => Array.from(new Set(colleges.map((c) => c.city).filter((v): v is string => !!v))).sort(),
    [colleges],
  );
  const districts = useMemo(
    () => Array.from(new Set(colleges.map((c) => c.district).filter((v): v is string => !!v))).sort(),
    [colleges],
  );

  const filtered = useMemo(
    () =>
      colleges.filter((c) => {
        const matchesSearch = c.college_name
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        const matchesCity = city === "all" || c.city === city;
        const matchesDistrict = district === "all" || c.district === district;
        return matchesSearch && matchesCity && matchesDistrict;
      }),
    [colleges, search, city, district],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, city, district]);

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages));
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasFilters = search.trim() !== "" || city !== "all" || district !== "all";
  const clearFilters = () => {
    setSearch("");
    setCity("all");
    setDistrict("all");
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="theme-accent-campus mx-auto max-w-6xl px-4 py-10 pb-28">
        <PageBackground image={pageBg.url} />
        <PageHero
          className="-mt-10 mb-8"
          image={pageHero.url}
          title="Engineering Colleges"
          subtitle="Browse official 2026 engineering college records across Maharashtra."
        />
        <p className="mt-2 flex max-w-2xl items-start gap-2 text-base leading-relaxed text-muted-foreground">
          <span>Verified official 2026 college records.</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                role="note"
                aria-label="About this data"
                className="mt-1 inline-flex shrink-0 cursor-help text-muted-foreground"
              >
                <Info className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Open a college to see its official CAP cutoffs and verified classification
              indicators. Select up to {MAX_COMPARE} colleges to compare them side by side.
            </TooltipContent>
          </Tooltip>
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-[1fr_200px_200px]">
          <div className="relative sm:col-span-2 md:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by college name"
              className="pl-9"
              aria-label="Search by college name"
            />
          </div>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger aria-label="Filter by city">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger aria-label="Filter by district">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All districts</SelectItem>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">{pageItems.length}</span> of{" "}
            {filtered.length} matching colleges ({colleges.length} total)
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        </div>

        <div ref={listRef} className="scroll-mt-24" />

        {filtered.length === 0 ? (
          <Card className="mt-6 border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              No colleges match these filters. Try clearing the search or choosing another
              city.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {pageItems.map((c) => {
              const branches = (c.branches_offered ?? "")
                .split(/[,;|]/)
                .map((b) => b.trim())
                .filter(Boolean);
              const checked = selection.includes(c.college_name);
              const limitReached = !checked && selection.length >= MAX_COMPARE;
              return (
                <Card
                  key={c.id}
                  className="h-full border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <CardContent className="flex h-full flex-col p-5 sm:p-6">
                    <h2 className="min-w-0 break-words text-base font-semibold leading-snug text-foreground">
                      {c.college_name}
                    </h2>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="min-w-0 break-words">
                        {c.city}, {c.district}
                      </span>
                    </p>
                    <p className="mt-1 break-words text-xs uppercase tracking-wide text-muted-foreground">
                      {c.university_affiliation}
                    </p>

                    {branches.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {branches.map((b) => (
                          <span
                            key={b}
                            className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4">
                      {c.official_website_url ? (
                        <a
                          href={c.official_website_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-aqua hover:underline"
                        >
                          Visit official website
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Official website not verified yet
                        </p>
                      )}
                    </div>

                    {c.last_verified ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Last verified: {c.last_verified}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <Link
                        to="/colleges/$collegeName"
                        params={{ collegeName: c.college_name }}
                        className="inline-flex items-center gap-1 text-base font-semibold text-aqua hover:underline"
                      >
                        View details <ArrowRight className="h-4 w-4" />
                      </Link>

                      <label
                        className={`inline-flex items-center gap-2 text-sm font-medium ${
                          limitReached
                            ? "cursor-not-allowed text-muted-foreground"
                            : "cursor-pointer text-foreground"
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={limitReached}
                          onCheckedChange={() => toggleCompare(c.college_name)}
                          aria-label={`Compare ${c.college_name}`}
                        />
                        Compare
                      </label>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Colleges pagination"
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            {pageWindow(currentPage, totalPages).map((p, i) =>
              p === "gap" ? (
                <span key={`gap-${i}`} className="px-1 text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === currentPage ? "default" : "outline"}
                  size="sm"
                  aria-current={p === currentPage ? "page" : undefined}
                  onClick={() => goToPage(p)}
                  className="min-w-9"
                >
                  {p}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        )}

        <CutoffNote className="mt-8" />
      </div>

      {selection.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              Compare Selected ({selection.length}/{MAX_COMPARE})
              {selection.length < 2 ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  Select at least 2 colleges
                </span>
              ) : null}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearCompare} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Clear Comparison
              </Button>
              {selection.length < 2 ? (
                <Button size="sm" disabled className="gap-1.5">
                  <GitCompare className="h-4 w-4" /> Compare
                </Button>
              ) : (
                <Button size="sm" asChild className="gap-1.5">
                  <Link to="/compare">
                    <GitCompare className="h-4 w-4" /> Compare
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}
