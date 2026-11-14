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
import { collegeKey, getOfficialColleges, getOfficialCutoffs, getDirectoryClassifications } from "@/lib/cap.functions";
import { CutoffNote } from "@/components/cutoff-note";
import { ListPageSkeleton } from "@/components/skeletons";
import { DataMeta } from "@/components/data-meta";
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
import pageHero from "@/assets/hero-library-reading-nook.asset.json";
import pageBg from "@/assets/colleges-bg.asset.json";
import {
  MAX_COMPARE,
  toggleCompare,
  useCompareSelection,
} from "@/lib/compare-store";

import { filterDirectory, verifiedBranches, managementType } from "@/lib/college-directory";
import { CollegeComparisonTray } from "@/components/college-comparison-tray";

const branchesQuery = queryOptions({ queryKey: ["directory-verified-cutoffs"], queryFn: () => getOfficialCutoffs() });
const classificationsQuery = queryOptions({ queryKey: ["directory-classifications"], queryFn: () => getDirectoryClassifications() });
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: pageHero.url },
      { name: "twitter:image", content: pageHero.url },
      { property: "og:title", content: "Engineering Colleges — Maharashtra CAP Guide | MHT-CET Counselling Help" },
      {
        property: "og:description",
        content:
          "A simple student-friendly guide to Maharashtra MHT-CET CAP counselling, with college details, CAP process steps, important dates, and FAQs for students and parents.",
      },
    ],
  }),
  loader: ({ context }) => {
    return Promise.all([context.queryClient.ensureQueryData(collegesQuery), context.queryClient.ensureQueryData(branchesQuery), context.queryClient.ensureQueryData(classificationsQuery)]);
  },
  component: CollegesPage,
  pendingMs: 200,
  pendingComponent: () => <ListPageSkeleton variant="cards" />,
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
  const { data: branchRecords } = useSuspenseQuery(branchesQuery);
  const { data: classifications } = useSuspenseQuery(classificationsQuery);
  const [management, setManagement] = useState("all");
  const enriched = useMemo(() => colleges.map((c) => ({ ...c, management_type: managementType(classifications.filter((r) => r.college_name === c.college_name)) })), [colleges, classifications]);
  const managementOptions = useMemo(() => [...new Set(enriched.map((c) => c.management_type).filter((v): v is string => Boolean(v)))].sort(), [enriched]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [affiliation, setAffiliation] = useState("all");
  const [sort, setSort] = useState("verified");
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

  const affiliations = useMemo(() => [...new Set(colleges.map((c) => c.university_affiliation).filter((v): v is string => Boolean(v?.trim())))].sort(), [colleges]);
  const allBranches = useMemo(() => [...new Set(colleges.flatMap((c) => verifiedBranches(c, branchRecords)))].sort(), [colleges, branchRecords]);
  const filtered = useMemo(() => filterDirectory(enriched, branchRecords, { search, city, district, affiliation, management, branches: selectedBranches, sort }), [enriched, branchRecords, search, city, district, affiliation, management, selectedBranches, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, city, district, affiliation, management, selectedBranches, sort]);

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages));
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasFilters = search.trim() !== "" || city !== "all" || district !== "all" || affiliation !== "all" || management !== "all" || selectedBranches.length > 0;
  const clearFilters = () => {
    setSearch("");
    setCity("all");
    setDistrict("all");
    setAffiliation("all");
    setManagement("all");
    setSelectedBranches([]);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="theme-accent-campus mx-auto max-w-6xl px-4 py-10 pb-72">
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


        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select value={affiliation} onValueChange={setAffiliation}><SelectTrigger aria-label="Filter by affiliation"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All affiliations</SelectItem>{affiliations.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={setSort}><SelectTrigger aria-label="Sort colleges"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="verified">Recently verified</SelectItem><SelectItem value="name">College name (A–Z)</SelectItem><SelectItem value="city">City (A–Z)</SelectItem><SelectItem value="district">District (A–Z)</SelectItem></SelectContent></Select>
        </div>
        <fieldset className="mt-4"><legend className="mb-2 text-sm font-medium">Branch</legend><div className="flex flex-wrap gap-2">{allBranches.map((b) => <label key={b} className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"><Checkbox checked={selectedBranches.includes(b)} onCheckedChange={() => setSelectedBranches((previous) => previous.includes(b) ? previous.filter((v) => v !== b) : [...previous, b])} aria-label={`Branch: ${b}`} /><span className="break-words">{b}</span></label>)}</div>{allBranches.length === 0 && <p className="text-sm text-muted-foreground">Not published yet</p>}</fieldset>
        {managementOptions.length > 0 ? <Select value={management} onValueChange={setManagement}><SelectTrigger className="mt-3" aria-label="Filter by institute type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All institute types / management</SelectItem>{managementOptions.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}<SelectItem value="Autonomous">Autonomous</SelectItem></SelectContent></Select> : <p className="mt-3 text-xs text-muted-foreground">Institute type filter unavailable until official data is provided.</p>}
        {hasFilters && <div aria-label="Active filters" className="mt-3 flex flex-wrap gap-2">{[
          ...(search.trim() ? [{ label: `Search: ${search}`, clear: () => setSearch("") }] : []),
          ...(city !== "all" ? [{ label: `City: ${city}`, clear: () => setCity("all") }] : []),
          ...(district !== "all" ? [{ label: `District: ${district}`, clear: () => setDistrict("all") }] : []),
          ...(affiliation !== "all" ? [{ label: `Affiliation: ${affiliation}`, clear: () => setAffiliation("all") }] : []),
          ...(management !== "all" ? [{ label: `Management: ${management}`, clear: () => setManagement("all") }] : []),
          ...selectedBranches.map((b) => ({ label: b, clear: () => setSelectedBranches((v) => v.filter((x) => x !== b)) })),
        ].map((chip) => <Button key={chip.label} size="sm" variant="secondary" className="h-auto min-h-9 max-w-full whitespace-normal" onClick={chip.clear}>{chip.label}<X className="ml-1 h-3 w-3 shrink-0" /></Button>)}</div>}

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
            Clear all filters
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
              const branches = verifiedBranches(c, branchRecords);
              const identifier = collegeKey(c);
              const checked = selection.includes(identifier);
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
                        {c.city?.trim() || "Not published yet"}, {c.district?.trim() || "Not published yet"}
                      </span>
                    </p>
                    <p className="mt-1 break-words text-xs uppercase tracking-wide text-muted-foreground">
                      {c.university_affiliation?.trim() || "Not published yet"}
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">Institute type / management: {c.management_type || "Not published yet"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Verified branches: {branches.length}</p>
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
                      {c.official_website_url?.trim() ? (
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
                          Not published yet
                        </p>
                      )}
                    </div>

                    <DataMeta
                      className="mt-3"
                      instituteCode={c.institute_code}
                      status={c.data_status}
                      lastVerified={c.last_verified?.trim() || "Not published yet"}
                      sourceUrl={c.official_source_url}
                    />


                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <Link
                        to="/colleges/$collegeName"
                        params={{ collegeName: identifier }}
                        className="inline-flex items-center gap-1 text-base font-semibold text-aqua hover:underline"
                      >
                        View details <ArrowRight className="h-4 w-4" />
                      </Link>

                      <Button size="sm" variant={checked ? "secondary" : "outline"} disabled={limitReached} onClick={() => toggleCompare(identifier)} aria-label={`${checked ? "Remove" : "Add"} ${c.college_name} ${checked ? "from" : "to"} comparison`}><GitCompare className="mr-1 h-4 w-4" />{checked ? "Remove from Compare" : "Add to Compare"}</Button>
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

      <CollegeComparisonTray colleges={colleges} />
    </TooltipProvider>
  );
}
