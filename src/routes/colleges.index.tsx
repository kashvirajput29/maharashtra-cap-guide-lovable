import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Search, ArrowRight, X } from "lucide-react";
import { getColleges } from "@/lib/cap.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const collegesQuery = queryOptions({
  queryKey: ["colleges"],
  queryFn: () => getColleges(),
});

const TIERS = ["Top Tier", "Good Tier", "Emerging"];

export const Route = createFileRoute("/colleges/")({
  head: () => ({
    meta: [
      { title: "Engineering Colleges — Maharashtra CAP Guide" },
      {
        name: "description",
        content:
          "Browse Maharashtra engineering colleges by city and tier, search by name, and open any college for branch-wise CAP cutoffs.",
      },
      { property: "og:title", content: "Engineering Colleges — Maharashtra CAP Guide" },
      {
        property: "og:description",
        content:
          "Search and filter Maharashtra engineering colleges by city and tier, with CAP cutoff data for each college.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(collegesQuery);
  },
  component: CollegesPage,
});

export function tierVariant(tier: string) {
  const t = tier.toLowerCase();
  if (t.includes("top")) return "bg-primary/10 text-primary border-primary/25";
  if (t.includes("good")) return "bg-accent/15 text-accent-foreground border-accent/30";
  return "bg-secondary text-secondary-foreground border-border";
}

function CollegesPage() {
  const { data: colleges } = useSuspenseQuery(collegesQuery);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [tier, setTier] = useState("all");

  const cities = useMemo(
    () => Array.from(new Set(colleges.map((c) => c.city))).sort(),
    [colleges],
  );

  const filtered = useMemo(
    () =>
      colleges.filter((c) => {
        const matchesSearch = c.college_name
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        const matchesCity = city === "all" || c.city === city;
        const matchesTier = tier === "all" || c.tier_tag === tier;
        return matchesSearch && matchesCity && matchesTier;
      }),
    [colleges, search, city, tier],
  );

  const hasFilters = search.trim() !== "" || city !== "all" || tier !== "all";
  const clearFilters = () => {
    setSearch("");
    setCity("all");
    setTier("all");
  };



  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Engineering Colleges
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Shortlist colleges by city and tier, then open a college to study its branch-wise
        CAP closing percentiles.
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
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger aria-label="Filter by tier">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            {TIERS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
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
          {filtered.map((c) => (
            <Link
              key={c.id}
              to="/colleges/$collegeName"
              params={{ collegeName: c.college_name }}
              className="group"
            >
              <Card className="h-full border-border/70 transition-colors group-hover:border-primary/40">
                <CardContent className="flex h-full flex-col p-5 sm:p-6">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <h2 className="min-w-0 break-words text-base font-semibold leading-snug text-foreground">
                      {c.college_name}
                    </h2>
                    <Badge
                      variant="outline"
                      className={`shrink-0 whitespace-nowrap ${tierVariant(c.tier_tag)}`}
                    >
                      {c.tier_tag}
                    </Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 break-words">
                      {c.city}, {c.district}
                    </span>
                  </p>
                  <p className="mt-1 break-words text-xs uppercase tracking-wide text-muted-foreground">
                    {c.university_affiliation}
                  </p>

                  {c.short_description ? (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {c.short_description}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    View cutoffs <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
