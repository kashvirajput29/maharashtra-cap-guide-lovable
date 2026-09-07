import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { getOfficialCutoffs } from "@/lib/cap.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListPageSkeleton } from "@/components/skeletons";
import { DataMeta } from "@/components/data-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBackground } from "@/components/page-background";
import { PageHero } from "@/components/page-hero";
import pageHero from "@/assets/hero-cozy-study-desk.asset.json";
import pageBg from "@/assets/colleges-bg.asset.json";

const cutoffsQuery = queryOptions({
  queryKey: ["cutoffs-official-2026"],
  queryFn: () => getOfficialCutoffs(),
});

const TITLE = "Official CAP Cutoffs 2026 | Maharashtra CAP Guide";
const DESCRIPTION =
  "Browse official MHT-CET CAP 2026 closing percentiles by college, branch, category, candidature type and CAP round, with links to the official cutoff documents.";

export const Route = createFileRoute("/cutoffs")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(cutoffsQuery);
  },
  component: CutoffsPage,
  pendingMs: 200,
  pendingComponent: () => <ListPageSkeleton variant="table" />,
});

const ALL = "__all__";
const PAGE_SIZE = 25;

function uniq(values: (string | null)[]) {
  return Array.from(
    new Set(values.filter((v): v is string => !!v && v.trim() !== "")),
  ).sort();
}

function CutoffsPage() {
  const { data: rows } = useSuspenseQuery(cutoffsQuery);

  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [round, setRound] = useState(ALL);
  const [candidature, setCandidature] = useState(ALL);
  const [page, setPage] = useState(1);

  const options = useMemo(
    () => ({
      branches: uniq(rows.map((r) => r.branch)),
      categories: uniq(rows.map((r) => r.category)),
      rounds: uniq(rows.map((r) => r.cap_round)),
      candidatures: uniq(rows.map((r) => r.candidature_type)),
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !(r.college_name ?? "").toLowerCase().includes(q)) return false;
      if (branch !== ALL && r.branch !== branch) return false;
      if (category !== ALL && r.category !== category) return false;
      if (round !== ALL && r.cap_round !== round) return false;
      if (candidature !== ALL && r.candidature_type !== candidature) return false;
      return true;
    });
  }, [rows, search, branch, category, round, candidature]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const reset = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setBranch(ALL);
    setCategory(ALL);
    setRound(ALL);
    setCandidature(ALL);
    setPage(1);
  };

  const hasFilters =
    search.trim() !== "" ||
    branch !== ALL ||
    category !== ALL ||
    round !== ALL ||
    candidature !== ALL;

  return (
    <div className="theme-accent-desk mx-auto max-w-6xl px-4 py-10">
      <PageBackground image={pageBg.url} />

      <PageHero
        className="-mt-10 mb-8"
        image={pageHero.url}
        title="Official CAP Cutoffs"
        subtitle="Published closing percentiles from the official CAP cutoff documents — filter by branch, category, candidature type and CAP round."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => reset(() => setSearch(e.target.value))}
            placeholder="Search college name"
            className="pl-9"
            aria-label="Search college name"
          />
        </div>

        <Select value={branch} onValueChange={(v) => reset(() => setBranch(v))}>
          <SelectTrigger aria-label="Branch">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All branches</SelectItem>
            {options.branches.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={(v) => reset(() => setCategory(v))}>
          <SelectTrigger aria-label="Category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {options.categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={round} onValueChange={(v) => reset(() => setRound(v))}>
          <SelectTrigger aria-label="CAP round">
            <SelectValue placeholder="CAP round" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All rounds</SelectItem>
            {options.rounds.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={candidature}
          onValueChange={(v) => reset(() => setCandidature(v))}
        >
          <SelectTrigger aria-label="Candidature type">
            <SelectValue placeholder="Candidature type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All candidature types</SelectItem>
            {options.candidatures.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="w-full sm:w-auto"
          >
            Clear filters
          </Button>
        </div>
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        {filtered.length} cutoff record{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <Card className="mt-4 border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No cutoff data available for the selected filters.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="mt-4 grid gap-3 md:hidden">
            {visible.map((r) => (
              <Card key={r.id} className="border-border/70">
                <CardContent className="p-4">
                  <Link
                    to="/colleges/$collegeName"
                    params={{ collegeName: r.college_name }}
                    className="break-words text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {r.college_name}
                  </Link>
                  <p className="mt-1 break-words text-sm text-foreground">{r.branch}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.category ? <Badge variant="outline">{r.category}</Badge> : null}
                    {r.candidature_type ? (
                      <Badge variant="outline">{r.candidature_type}</Badge>
                    ) : null}
                    {r.cap_round ? <Badge variant="outline">{r.cap_round}</Badge> : null}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Closing percentile:{" "}
                    <span className="font-semibold text-foreground">
                      {Number(r.closing_percentile).toFixed(4)}
                    </span>
                  </p>
                  <DataMeta
                    className="mt-3"
                    instituteCode={r.institute_code}
                    status={r.data_status}
                    lastVerified={r.last_verified}
                    sourceUrl={r.source_url}
                  />

                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-border/70 bg-card md:block">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">College</th>
                  <th className="px-4 py-3 font-semibold">Branch</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Candidature</th>
                  <th className="px-4 py-3 font-semibold">Round</th>
                  <th className="px-4 py-3 text-right font-semibold">Closing %ile</th>
                  <th className="px-4 py-3 font-semibold">Data &amp; source</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <Link
                        to="/colleges/$collegeName"
                        params={{ collegeName: r.college_name }}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {r.college_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground">{r.branch}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.candidature_type}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.cap_round}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {Number(r.closing_percentile).toFixed(4)}
                    </td>
                    <td className="px-4 py-3">
                      <DataMeta
                        instituteCode={r.institute_code}
                        status={r.data_status}
                        lastVerified={r.last_verified}
                        sourceUrl={r.source_url}
                      />
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <nav
              aria-label="Cutoffs pagination"
              className="mt-8 flex flex-col items-center gap-3"
            >
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(current - 1)}
                  disabled={current === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(current + 1)}
                  disabled={current === totalPages}
                >
                  Next
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Page {current} of {totalPages}
              </p>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
