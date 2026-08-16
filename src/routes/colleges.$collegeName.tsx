import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, MapPin, X, Filter, ShieldCheck } from "lucide-react";
import { getOfficialCollege } from "@/lib/cap.functions";
import { CutoffNote } from "@/components/cutoff-note";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageBackground } from "@/components/page-background";
import pageBg from "@/assets/college-detail-bg.asset.json";

const collegeQuery = (collegeName: string) =>
  queryOptions({
    queryKey: ["college-official-2026", collegeName],
    queryFn: async () => {
      const result = await getOfficialCollege({ data: { collegeName } });
      if (!result.college) throw notFound();
      return result;
    },
  });

export const Route = createFileRoute("/colleges/$collegeName")({
  head: ({ params }) => {
    const name = decodeURIComponent(params.collegeName);
    return {
      meta: [
        { title: `${name} — CAP Cutoffs | Maharashtra CAP Guide | MHT-CET Counselling Help` },
        {
          name: "description",
          content:
            "A simple student-friendly guide to Maharashtra MHT-CET CAP counselling, with college details, CAP process steps, important dates, and FAQs for students and parents.",
        },
        { property: "og:title", content: `${name} — CAP Cutoffs | Maharashtra CAP Guide | MHT-CET Counselling Help` },
        {
          property: "og:description",
          content:
            "A simple student-friendly guide to Maharashtra MHT-CET CAP counselling, with college details, CAP process steps, important dates, and FAQs for students and parents.",
        },
      ],
    };
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(collegeQuery(params.collegeName)),
  component: CollegeDetail,
  notFoundComponent: CollegeNotFound,
  errorComponent: CollegeError,
});

function CollegeNotFound() {
  return (
    <Shell title="College not found">
      <p className="text-sm text-muted-foreground">
        We couldn&apos;t find this college. It may have been renamed or removed.
      </p>
    </Shell>
  );
}

function CollegeError() {
  const router = useRouter();
  return (
    <Shell title="Couldn't load this college">
      <p className="text-sm text-muted-foreground">
        Something went wrong while loading the cutoff data.
      </p>
      <Button className="mt-4" onClick={() => router.invalidate()}>
        Try again
      </Button>
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <div className="mt-3">{children}</div>
      <Link
        to="/colleges"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-aqua hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to colleges
      </Link>
    </div>
  );
}

const NOT_PUBLISHED =
  "Official 2026 cutoff not published yet. Check the Maharashtra State CET Cell portal.";

function CollegeDetail() {
  const { collegeName } = Route.useParams();
  const { data } = useSuspenseQuery(collegeQuery(collegeName));
  const college = data.college!;
  const cutoffs = data.cutoffs;
  const classifications = data.classifications;

  const [branch, setBranch] = useState("all");
  const [category, setCategory] = useState("all");
  const [round, setRound] = useState("all");
  const [candidature, setCandidature] = useState("all");

  const uniq = (values: (string | null)[]) =>
    Array.from(new Set(values.filter((v): v is string => !!v))).sort();

  const options = useMemo(
    () => ({
      branches: uniq(cutoffs.map((c) => c.branch)),
      categories: uniq(cutoffs.map((c) => c.category)),
      rounds: uniq(cutoffs.map((c) => c.cap_round)),
      candidatures: uniq(cutoffs.map((c) => c.candidature_type)),
    }),
    [cutoffs],
  );

  const filtered = useMemo(
    () =>
      cutoffs.filter(
        (c) =>
          (branch === "all" || c.branch === branch) &&
          (category === "all" || c.category === category) &&
          (round === "all" || c.cap_round === round) &&
          (candidature === "all" || c.candidature_type === candidature),
      ),
    [cutoffs, branch, category, round, candidature],
  );

  const hasFilters =
    branch !== "all" || category !== "all" || round !== "all" || candidature !== "all";
  const clearFilters = () => {
    setBranch("all");
    setCategory("all");
    setRound("all");
    setCandidature("all");
  };

  const cutoffVerified = cutoffs.find((c) => c.last_verified)?.last_verified ?? null;

  const branches = (college.branches_offered ?? "")
    .split(/[,;|]/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="theme-accent-library mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <PageBackground image={pageBg.url} />
      <Link
        to="/colleges"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All colleges
      </Link>

      <div className="mt-4">
        <h1 className="max-w-3xl break-words text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
          {college.college_name}
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="min-w-0 break-words">
            {college.city}, {college.district}
          </span>
        </p>
        {college.last_verified ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Last verified: {college.last_verified}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:col-span-2">
          <CardContent className="p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  University affiliation
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {college.university_affiliation}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  District
                </dt>
                <dd className="mt-1 text-sm text-foreground">{college.district}</dd>
              </div>
            </dl>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Branches offered
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {branches.map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Official website
            </p>
            {college.official_website_url ? (
              <a
                href={college.official_website_url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-flex items-center gap-1.5 break-all text-sm font-medium text-aqua hover:underline"
              >
                {college.official_website_url}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Official website not verified yet
              </p>
            )}
            {college.official_source_url ? (
              <a
                href={college.official_source_url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-aqua hover:underline"
              >
                Official source <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Classification */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Verified classification
        </h2>
        {classifications.length === 0 ? (
          <Card className="mt-4 border-dashed">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Classification: No official tier classification found.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {classifications.map((c) => (
              <Card
                key={c.id}
                className="border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {c.official_indicator}
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-foreground">
                        {c.indicator_value}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {c.source_url ? (
                      <a
                        href={c.source_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-xs font-medium text-aqua hover:underline"
                      >
                        Source <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                    {c.last_verified ? (
                      <span className="text-xs text-muted-foreground">
                        Verified: {c.last_verified}
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Official 2026 CAP cutoffs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            {cutoffs.length} official cutoff records
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Official 2026 CAP data | Verified: {cutoffVerified ?? "not available"}
          </p>
        </div>
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

      {cutoffs.length === 0 ? (
        <Card className="mt-6 border-dashed">
          <CardContent className="p-10 text-center">
            <p className="text-sm font-medium text-foreground">{NOT_PUBLISHED}</p>
            <a
              href="https://fe2026.mahacet.org/StaticPages/HomePage"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-aqua hover:underline"
            >
              Maharashtra State CET Cell portal <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filter by:</span>
          </div>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Branch"
              plural="All branches"
              value={branch}
              onChange={setBranch}
              options={options.branches}
            />
            <FilterSelect
              label="Category"
              plural="All categories"
              value={category}
              onChange={setCategory}
              options={options.categories}
            />
            <FilterSelect
              label="Round"
              plural="All rounds"
              value={round}
              onChange={setRound}
              options={options.rounds}
            />
            <FilterSelect
              label="Candidature"
              plural="All candidature types"
              value={candidature}
              onChange={setCandidature}
              options={options.candidatures}
            />
          </div>

          {filtered.length === 0 ? (
            <Card className="mt-6 border-dashed">
              <CardContent className="p-10 text-center">
                <p className="text-sm font-medium text-foreground">{NOT_PUBLISHED}</p>
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 gap-1.5">
                    <X className="h-3.5 w-3.5" />
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile: stacked record cards so no column is hidden */}
              <div className="mt-6 grid gap-3 sm:hidden">
                {filtered.map((c) => (
                  <Card key={c.id} className="border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <p className="min-w-0 text-sm font-semibold leading-snug text-foreground">
                          {c.branch}
                        </p>
                        <Badge
                          variant="outline"
                          className="shrink-0 whitespace-nowrap border-teal/30 bg-teal/12 text-teal"
                        >
                          {c.academic_year}
                        </Badge>
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="min-w-0">
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            Category
                          </dt>
                          <dd className="mt-0.5 break-words text-foreground">{c.category}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            Round
                          </dt>
                          <dd className="mt-0.5 break-words text-foreground">{c.cap_round}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            Candidature
                          </dt>
                          <dd className="mt-0.5 break-words text-foreground">
                            {c.candidature_type}
                          </dd>
                        </div>
                        <div className="col-span-2 border-t border-border/60 pt-2">
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            Closing percentile
                          </dt>
                          <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
                            {Number(c.closing_percentile).toFixed(2)}
                          </dd>
                        </div>
                      </dl>
                      {c.source_url ? (
                        <a
                          href={c.source_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-aqua hover:underline"
                        >
                          Source <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tablet and up: full table, horizontally scrollable if needed */}
              <Card className="mt-6 hidden overflow-hidden border-border/70 transition-all duration-200 hover:shadow-md sm:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-28 text-foreground">Year</TableHead>
                        <TableHead className="min-w-[180px] text-foreground">Branch</TableHead>
                        <TableHead className="text-foreground">Category</TableHead>
                        <TableHead className="text-foreground">Candidature</TableHead>
                        <TableHead className="text-foreground">Round</TableHead>
                        <TableHead className="min-w-[150px] text-right text-foreground">
                          Closing percentile
                        </TableHead>
                        <TableHead className="text-foreground">Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((c, index) => (
                        <TableRow
                          key={c.id}
                          className={index % 2 === 1 ? "bg-muted/30" : undefined}
                        >
                          <TableCell className="font-medium text-foreground">
                            {c.academic_year}
                          </TableCell>
                          <TableCell>{c.branch}</TableCell>
                          <TableCell>{c.category}</TableCell>
                          <TableCell>{c.candidature_type}</TableCell>
                          <TableCell>{c.cap_round}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums text-foreground">
                            {Number(c.closing_percentile).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {c.source_url ? (
                              <a
                                href={c.source_url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-1 text-xs font-medium text-aqua hover:underline"
                              >
                                Official <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      <CutoffNote className="mt-8" />
    </div>
  );
}

function FilterSelect({
  label,
  plural,
  value,
  onChange,
  options,
}: {
  label: string;
  plural: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={`Filter by ${label.toLowerCase()}`}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{plural}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
