import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import { collegeKey, getOfficialCutoffs, getOfficialColleges, getDirectoryClassifications } from "@/lib/cap.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { enrichCutoffs, filterCutoffs, comparePercentile, cutoffCsv, FILTER_FIELDS, type FilterField } from "@/lib/cutoff-explorer";
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
  queryKey: ["cutoff-explorer-enriched"],
  queryFn: async () => {
    const [rows, colleges, classifications] = await Promise.all([getOfficialCutoffs(), getOfficialColleges(), getDirectoryClassifications()]);
    return enrichCutoffs(rows, colleges, classifications);
  },
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
      { property: "og:image", content: pageHero.url },
      { name: "twitter:image", content: pageHero.url },
    ],
  }),
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(cutoffsQuery);
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
  const [filters, setFilters] = useState<Partial<Record<FilterField, string>>>({});
  const [sort, setSort] = useState("closing_percentile");
  const [percentile, setPercentile] = useState("");
  const [page, setPage] = useState(1);
  const options = useMemo(() => Object.fromEntries(FILTER_FIELDS.map(k => [k, uniq(rows.map(r => r[k] ?? null))])), [rows]);
  const filtered = useMemo(() => filterCutoffs(rows, search, filters, sort), [rows, search, filters, sort]);
  const labels: Record<FilterField, string> = {academic_year: "Academic year", cap_round: "CAP round", college_name: "College", branch: "Branch", category: "Category", candidature_type: "Candidature type", district: "District", institute_type: "Institute type"};
  const comparison = (cutoff: number | null | undefined) => {
    const result = comparePercentile(percentile, cutoff);
    return result ? <p className="mt-2 text-sm text-foreground"><Badge variant="outline">{result.label}</Badge><span className="ml-2">{result.difference > 0 ? "+" : ""}{result.difference.toFixed(4)} percentile points</span></p> : null;
  };
  const exportResults = () => {
    const url = URL.createObjectURL(new Blob([cutoffCsv(filtered)], {type: "text/csv;charset=utf-8"}));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "maharashtra-cap-cutoffs.csv"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const reset = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const clearFilters = () => { setSearch(""); setFilters({}); setPage(1); };
  const hasFilters = search.trim() !== "" || Object.values(filters).some(Boolean);

  return (
    <div className="theme-accent-desk mx-auto max-w-6xl px-4 py-10">
      <PageBackground image={pageBg.url} />

      <PageHero
        className="-mt-10 mb-8"
        image={pageHero.url}
        title="Official CAP Cutoffs"
        subtitle="Published closing percentiles from the official CAP cutoff documents — filter by branch, category, candidature type and CAP round."
      />

      <section className="mt-6" aria-label="Percentile comparison">
        <label htmlFor="student-percentile" className="text-sm font-medium">Your percentile</label>
        <Input id="student-percentile" type="number" min="0" max="100" step="0.0001" value={percentile} onChange={e => setPercentile(e.target.value)} placeholder="Enter percentile" className="mt-2 max-w-sm" />
        {percentile !== "" && comparePercentile(percentile, 0) === null && <p role="alert" className="mt-2 text-sm text-destructive">Enter a percentile between 0 and 100.</p>}
        <p className="mt-2 text-sm text-muted-foreground">Near cutoff means within ±0.5 percentile points; this is not an admission likelihood.</p>
        <p className="mt-3 text-sm font-medium text-foreground">Cutoffs are historical references and do not guarantee admission. Always verify the current official CAP data.</p>
      </section>
      <details className="mt-5 border-y border-border py-3">
        <summary className="cursor-pointer font-medium">Understanding CAP cutoffs</summary>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          {[
            ["Closing percentile", "The percentile of the last allotted candidate in the published college, branch, category and round. It is a historical reference, not a future threshold."],
            ["CAP round", "A numbered stage of centralized seat allotment. Compare records within the same academic year and round."],
            ["Category codes", "Codes identify the seat pool. OPEN refers to open-category seats; G and L commonly denote general and ladies seats, while H, O and S denote Home University, Other Than Home University and State-level pools. Consult the official document legend for the full code, reservations and eligibility."],
            ["Home University", "The university-area seat pool determined under the official candidature rules; it is not simply the university you prefer."],
            ["Other Than Home University", "The seat pool for eligible candidates outside the institute’s Home University area, as defined in the official rules."],
            ["State-level candidature", "State-level seats are allotted at state level rather than through a Home University area pool. Eligibility depends on the official brochure."]
          ].map(([title, text]) => <div key={title}><dt className="font-semibold">{title}</dt><dd className="mt-1 text-muted-foreground">{text}</dd></div>)}
        </dl>
        <a href="https://fe2026.mahacet.org/StaticPages/HomePage" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-primary hover:underline">Official CET Cell rules and documents</a>
      </details>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => reset(() => setSearch(e.target.value))} placeholder="Search college name" className="pl-9" aria-label="Search college name" /></div>
        {FILTER_FIELDS.map(field => <Select key={field} value={filters[field] || ALL} onValueChange={v => reset(() => setFilters(previous => ({...previous, [field]: v === ALL ? "" : v})))} disabled={!options[field]?.length}>
          <SelectTrigger aria-label={labels[field]}><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>All — {labels[field]}</SelectItem>{(options[field] ?? []).map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
        </Select>)}
        <Select value={sort} onValueChange={v => reset(() => setSort(v))}><SelectTrigger aria-label="Sort cutoffs"><SelectValue /></SelectTrigger><SelectContent>
          {([['college_name','College (A–Z)'],['branch','Branch (A–Z)'],['closing_percentile','Closing percentile (highest first)'],['cap_round','CAP round (ascending)'],['last_verified','Last verified (newest first)']] as const).map(([value,label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
        </SelectContent></Select>
        <Button variant="outline" onClick={clearFilters} disabled={!hasFilters}>Clear filters</Button>
        <Button variant="outline" onClick={exportResults} disabled={!filtered.length}><Download className="h-4 w-4" />Export filtered CSV</Button>
      </div>
      {!options['institute_type']?.length && <p className="mt-2 text-sm text-muted-foreground">Institute type filter unavailable until official data is provided.</p>}
      {!options['district']?.length && <p className="mt-2 text-sm text-muted-foreground">District filter unavailable until official data is provided.</p>}

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
                    params={{ collegeName: collegeKey(r) }}
                    className="break-words text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {r.college_name}
                  </Link>
                  <p className="mt-1 break-words text-sm text-foreground">{r.branch || "Not published yet"}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Academic year: {r.academic_year || "Not published yet"}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{r.category || "Not published yet"}</Badge>
                    <Badge variant="outline">{r.candidature_type || "Not published yet"}</Badge>
                    <Badge variant="outline">{r.cap_round || "Not published yet"}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Closing percentile:{" "}
                    <span className="font-semibold text-foreground">
                      {r.closing_percentile == null ? "Not published yet" : Number(r.closing_percentile).toFixed(4)}
                    </span>
                  </p>
                  {comparison(r.closing_percentile)}
                  <DataMeta
                    className="mt-3"
                    instituteCode={r.institute_code}
                    status={r.data_status}
                    lastVerified={r.last_verified || "Not published yet"}
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
                  <th className="px-4 py-3 font-semibold">Academic year</th>
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
                        params={{ collegeName: collegeKey(r) }}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {r.college_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground">{r.branch || "Not published yet"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.category || "Not published yet"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.candidature_type || "Not published yet"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.cap_round || "Not published yet"}</td>
                    <td className="px-4 py-3">{r.academic_year || "Not published yet"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {r.closing_percentile == null ? "Not published yet" : Number(r.closing_percentile).toFixed(4)}
                      {comparison(r.closing_percentile)}
                    </td>
                    <td className="px-4 py-3">
                      <DataMeta
                        instituteCode={r.institute_code}
                        status={r.data_status}
                        lastVerified={r.last_verified || "Not published yet"}
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
