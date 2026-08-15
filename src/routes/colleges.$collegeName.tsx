import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, MapPin, X, Filter } from "lucide-react";
import { getCollege } from "@/lib/cap.functions";
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

const collegeQuery = (collegeName: string) =>
  queryOptions({
    queryKey: ["college", collegeName],
    queryFn: async () => {
      const result = await getCollege({ data: { collegeName } });
      if (!result.college) throw notFound();
      return result;
    },
  });

export const Route = createFileRoute("/colleges/$collegeName")({
  head: ({ params }) => {
    const name = decodeURIComponent(params.collegeName);
    return {
      meta: [
        { title: `${name} — CAP Cutoffs | Maharashtra CAP Guide` },
        {
          name: "description",
          content: `Details and MHT-CET CAP closing percentiles for ${name}, filterable by year, branch, category and round.`,
        },
        { property: "og:title", content: `${name} — CAP Cutoffs` },
        {
          property: "og:description",
          content: `Branch-wise CAP cutoff percentiles and college details for ${name}.`,
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
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to colleges
      </Link>
    </div>
  );
}

function CollegeDetail() {
  const { collegeName } = Route.useParams();
  const { data } = useSuspenseQuery(collegeQuery(collegeName));
  const college = data.college!;
  const cutoffs = data.cutoffs;

  const [year, setYear] = useState("all");
  const [branch, setBranch] = useState("all");
  const [category, setCategory] = useState("all");
  const [round, setRound] = useState("all");

  const options = useMemo(
    () => ({
      years: Array.from(new Set(cutoffs.map((c) => String(c.year)))).sort().reverse(),
      branches: Array.from(new Set(cutoffs.map((c) => c.branch))).sort(),
      categories: Array.from(new Set(cutoffs.map((c) => c.category))).sort(),
      rounds: Array.from(new Set(cutoffs.map((c) => c.round))).sort(),
    }),
    [cutoffs],
  );

  const filtered = useMemo(
    () =>
      cutoffs.filter(
        (c) =>
          (year === "all" || String(c.year) === year) &&
          (branch === "all" || c.branch === branch) &&
          (category === "all" || c.category === category) &&
          (round === "all" || c.round === round),
      ),
    [cutoffs, year, branch, category, round],
  );

  const hasFilters = year !== "all" || branch !== "all" || category !== "all" || round !== "all";
  const clearFilters = () => {
    setYear("all");
    setBranch("all");
    setCategory("all");
    setRound("all");
  };

  const branches = college.branches_offered
    .split(/[,;|]/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Link
        to="/colleges"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All colleges
      </Link>

      <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="max-w-3xl break-words text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            {college.college_name}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">
              {college.city}, {college.district}
            </span>
          </p>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 whitespace-nowrap border-primary/25 bg-primary/10 text-primary"
        >
          {college.tier_tag}
        </Badge>
      </div>


      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 md:col-span-2">
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
            {college.short_description ? (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {college.short_description}
              </p>
            ) : null}
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

        <Card className="border-border/70">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Official website
            </p>
            <a
              href={college.website_link}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-flex items-center gap-1.5 break-all text-sm font-medium text-aqua hover:underline"
            >
              {college.website_link}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <p className="mt-6 text-sm text-muted-foreground">
              {cutoffs.length} cutoff record{cutoffs.length === 1 ? "" : "s"} available for
              this college.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            CAP cutoffs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            {cutoffs.length} cutoff records
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

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filter by:</span>
      </div>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label="Year"
          plural="All years"
          value={year}
          onChange={setYear}
          options={options.years}
        />
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
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-6 border-dashed">
          <CardContent className="p-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No cutoff data available for the selected filters.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try clearing the filters or selecting different values.
            </p>
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
              <Card key={c.id} className="border-border/70">
                <CardContent className="p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="min-w-0 text-sm font-semibold leading-snug text-foreground">
                      {c.branch}
                    </p>
                    <Badge
                      variant="outline"
                      className="shrink-0 whitespace-nowrap border-primary/25 bg-primary/10 text-primary"
                    >
                      {c.year}
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
                      <dd className="mt-0.5 break-words text-foreground">{c.round}</dd>
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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tablet and up: full table, horizontally scrollable if needed */}
          <Card className="mt-6 hidden overflow-hidden border-border/70 sm:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-24 text-foreground">Year</TableHead>
                    <TableHead className="min-w-[180px] text-foreground">Branch</TableHead>
                    <TableHead className="text-foreground">Category</TableHead>
                    <TableHead className="text-foreground">Round</TableHead>
                    <TableHead className="min-w-[160px] text-right text-foreground">
                      Closing percentile
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c, index) => (
                    <TableRow
                      key={c.id}
                      className={index % 2 === 1 ? "bg-muted/30" : undefined}
                    >
                      <TableCell className="font-medium text-foreground">{c.year}</TableCell>
                      <TableCell>{c.branch}</TableCell>
                      <TableCell>{c.category}</TableCell>
                      <TableCell>{c.round}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-foreground">
                        {Number(c.closing_percentile).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
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
