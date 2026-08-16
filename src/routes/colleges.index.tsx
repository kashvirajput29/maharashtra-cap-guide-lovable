import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Search, ArrowRight, X, ExternalLink } from "lucide-react";
import { getOfficialColleges } from "@/lib/cap.functions";
import { CutoffNote } from "@/components/cutoff-note";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBackground } from "@/components/page-background";
import pageBg from "@/assets/colleges-bg.asset.json";

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

function CollegesPage() {
  const { data: colleges } = useSuspenseQuery(collegesQuery);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [district, setDistrict] = useState("all");

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

  const hasFilters = search.trim() !== "" || city !== "all" || district !== "all";
  const clearFilters = () => {
    setSearch("");
    setCity("all");
    setDistrict("all");
  };

  return (
    <div className="theme-accent-campus mx-auto max-w-6xl px-4 py-10">
      <PageBackground image={pageBg.url} />
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Engineering Colleges
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Verified official 2026 college records. Open a college to see its official CAP
        cutoffs and verified classification indicators.
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
          Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          of {colleges.length} colleges
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

      {filtered.length === 0 ? (
        <Card className="mt-6 border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No colleges match these filters. Try clearing the search or choosing another
            city.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((c) => {
            const branches = (c.branches_offered ?? "")
              .split(/[,;|]/)
              .map((b) => b.trim())
              .filter(Boolean);
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
                        {c.official_website_url}
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

                  <Link
                    to="/colleges/$collegeName"
                    params={{ collegeName: c.college_name }}
                    className="mt-4 inline-flex items-center gap-1 text-base font-semibold text-aqua hover:underline"
                  >
                    View cutoffs <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CutoffNote className="mt-8" />
    </div>
  );
}
