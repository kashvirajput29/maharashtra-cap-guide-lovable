import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, MapPin, X, Filter, ShieldCheck } from "lucide-react";
import { CutoffNote } from "@/components/cutoff-note";
import { DataMeta } from "@/components/data-meta";
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
import { collegeQuery } from "@/lib/college-query";
import { collegeKey } from "@/lib/cap.functions";
import { verifiedBranches, managementType } from "@/lib/college-directory";
import { CollegeComparisonTray } from "@/components/college-comparison-tray";
import { CollegeProfileActions } from "@/components/college-profile-actions";


export const Route = createFileRoute("/colleges/$collegeName")({
  head: ({ params }) => {
    const name = decodeURIComponent(params.collegeName);
    return {
      meta: [
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
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
  const college = data.college;
  const cutoffs = data.cutoffs;
  const classifications = data.classifications.filter((c) => c.source_url?.trim() && c.last_verified?.trim());

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

  if (!college) return <CollegeNotFound />;
  const branches = verifiedBranches(college, cutoffs);
  const missing = (value: string | null | undefined) => value?.trim() || "Not published yet";

  return (
    <div className="theme-accent-library mx-auto max-w-6xl px-4 py-8 pb-72 sm:py-10 sm:pb-64">
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
            {missing(college.city)}, {missing(college.district)}, Maharashtra
          </span>
        </p>
        <DataMeta
          className="mt-3"
          instituteCode={college.institute_code}
          status={college.data_status}
          lastVerified={missing(college.last_verified)}
          sourceUrl={college.official_source_url}
        />

      </div>

      <CollegeProfileActions identifier={collegeKey(college)} name={college.college_name} branches={branches} />
      <section className="mt-10" aria-labelledby="overview-title">
        <h2 id="overview-title" className="text-2xl font-semibold text-foreground">Overview</h2>
        <dl className="mt-4 grid gap-5 border-b border-border pb-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Official college name", college.college_name],
            ["Institute code", college.institute_code],
            ["City", college.city],
            ["District", college.district],
            ["State", "Maharashtra"],
            ["Institute type / management", managementType(classifications)],
            ["University affiliation", college.university_affiliation],
            ["Autonomous status", classifications.find((c) => /autonom/i.test(c.official_indicator ?? "") || /\bautonomous\b/i.test(c.indicator_value ?? ""))?.indicator_value],
            ["Last verified", college.last_verified],
          ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs uppercase text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm text-foreground">{missing(value)}</dd></div>)}
        </dl>
      </section>
      <section className="mt-8" aria-labelledby="branches-title">
        <h2 id="branches-title" className="text-2xl font-semibold text-foreground">Available branches</h2>
        <div className="mt-3 flex flex-wrap gap-2">{branches.map((b) => <Badge key={b} variant="secondary" className="max-w-full whitespace-normal break-words">{b}</Badge>)}</div>
        {!branches.length && <p className="mt-3 text-sm text-muted-foreground">Not published yet</p>}
      </section>
      <section className="mt-8" aria-labelledby="links-title">
        <h2 id="links-title" className="text-2xl font-semibold text-foreground">Official links</h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">{[["Official website", college.official_website_url], ["Official source", college.official_source_url]].map(([label, url]) => <div key={label} className="min-w-0"><dt className="text-xs uppercase text-muted-foreground">{label}</dt><dd className="mt-1 text-sm">{url?.trim() ? <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-start gap-1 break-all text-aqua hover:underline">{url}<ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" /></a> : "Not published yet"}</dd></div>)}</dl>
      </section>
      <section className="mt-8" aria-labelledby="verification-title">
        <h2 id="verification-title" className="text-2xl font-semibold text-foreground">Verification information</h2>
        <DataMeta className="mt-3" instituteCode={college.institute_code} status={college.data_status} lastVerified={missing(college.last_verified)} sourceUrl={college.official_source_url} />
      </section>

      {/* Classification */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Verified classification
        </h2>
        {classifications.length === 0 ? (
          <Card className="mt-4 border-dashed">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Not published yet
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
            Cutoffs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            {cutoffs.length} official cutoff records
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Official 2026 CAP data | Verified: {cutoffVerified ?? "Not published yet"}
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
      <CollegeComparisonTray colleges={[college]} />
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
