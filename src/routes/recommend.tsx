import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { HelpCircle, Sparkles, Save, RotateCcw, GitCompare, Plus, Loader2, X } from "lucide-react";
import { getMatchmakerData, findVerifiedMatches } from "@/lib/matchmaker.functions";
import { matchProfileSchema, type MatchProfile } from "@/lib/matchmaker";
import { managementType } from "@/lib/college-directory";
import { toggleCompare, useCompareSelection, MAX_COMPARE } from "@/lib/compare-store";
import { addCollegeBranch } from "@/lib/option-branch-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHero } from "@/components/page-hero";
import { PageBackground } from "@/components/page-background";
import pageHero from "@/assets/hero-sunlit-forest-trail-study-nook.asset.json";
import pageBg from "@/assets/colleges-bg.asset.json";
const dataQuery = queryOptions({
  queryKey: ["matchmaker-verified-data"],
  queryFn: () => getMatchmakerData(),
});
const TITLE = "College Matchmaker — Maharashtra CAP Guide";
const DESC =
  "Build a balanced engineering preference list from verified Maharashtra CAP historical cutoff references, with official sources.";
export const Route = createFileRoute("/recommend")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: pageHero.url },
      { name: "twitter:image", content: pageHero.url },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dataQuery),
  component: RecommendPage,
});
type Result = Awaited<ReturnType<typeof findVerifiedMatches>>[number];
const KEY = "cap-matchmaker-profile";
const empty = {
  percentile: "",
  category: "",
  candidatureType: "",
  homeUniversity: "",
  branches: [] as string[],
  locations: [] as string[],
  instituteType: "",
};
function FieldLabel({ id, title, help }: { id: string; title: string; help: string }) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id}>{title}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={`About ${title}`}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{help}</TooltipContent>
      </Tooltip>
    </div>
  );
}
function RecommendPage() {
  const { data } = useSuspenseQuery(dataQuery);
  const find = useServerFn(findVerifiedMatches);
  const [form, setForm] = useState(empty);
  const [results, setResults] = useState<Result[] | null>(null);
  const [submitted, setSubmitted] = useState<MatchProfile | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const selection = useCompareSelection();
  const unique = (values: (string | null | undefined)[]) =>
    [...new Set(values.filter((v): v is string => Boolean(v?.trim())))].sort();
  const published = data.cutoffs.filter(
    (r) => r.source_url?.trim() && r.last_verified && r.closing_percentile != null,
  );
  const categories = unique(published.map((r) => r.category));
  const candidatures = unique(published.map((r) => r.candidature_type));
  const branches = unique(published.map((r) => r.branch));
  const locations = unique(data.colleges.flatMap((c) => [c.city, c.district]));
  const universities = unique(data.colleges.map((c) => c.university_affiliation));
  const types = unique(
    data.colleges.map((c) =>
      managementType(data.classifications.filter((k) => k.college_name === c.college_name)),
    ),
  );
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = matchProfileSchema.safeParse(JSON.parse(raw));
      if (parsed.success) {
        setForm({ ...parsed.data, percentile: String(parsed.data.percentile) });
        setNotice("Saved profile restored.");
      }
    } catch {
      /* unavailable storage */
    }
  }, []);
  const input = () => ({
    ...form,
    percentile: form.percentile.trim() ? Number(form.percentile) : NaN,
  });
  const validate = () => {
    if (!form.percentile.trim()) {
      setError("Enter your MHT-CET percentile.");
      return null;
    }
    const parsed = matchProfileSchema.safeParse(input());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Complete the required fields.");
      return null;
    }
    if (
      !categories.includes(parsed.data.category) ||
      !candidatures.includes(parsed.data.candidatureType) ||
      parsed.data.branches.some((b) => !branches.includes(b)) ||
      parsed.data.locations.some((l) => !locations.includes(l)) ||
      (parsed.data.homeUniversity && !universities.includes(parsed.data.homeUniversity)) ||
      (parsed.data.instituteType && !types.includes(parsed.data.instituteType))
    ) {
      setError("Choose values from the available official lists.");
      return null;
    }
    if (
      !published.some(
        (r) =>
          r.category === parsed.data.category && r.candidature_type === parsed.data.candidatureType,
      )
    ) {
      setError(
        "This category and candidature combination has no verified records. Choose another combination.",
      );
      return null;
    }
    return parsed.data;
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const profile = validate();
    if (!profile) return;
    setLoading(true);
    try {
      const rows = await find({ data: profile });
      setResults(rows);
      setSubmitted(profile);
    } catch {
      setError("Could not load verified matches. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const update = (key: keyof typeof empty, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setResults(null);
    setError("");
    setNotice("");
  };
  const picker = (
    id: string,
    title: string,
    help: string,
    values: string[],
    key: "category" | "candidatureType" | "homeUniversity" | "instituteType",
    optional = false,
  ) => (
    <div className="grid min-w-0 gap-1">
      <FieldLabel id={id} title={title} help={help} />
      <Select
        value={form[key] || "__none__"}
        onValueChange={(v) => {
          update(key, v === "__none__" ? "" : v);
          if (key === "candidatureType")
            setForm((previous) => ({ ...previous, homeUniversity: "" }));
        }}
      >
        <SelectTrigger id={id} aria-label={title} className="w-full min-w-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">
            {optional ? "Not specified / not applicable" : "Choose " + title.toLowerCase()}
          </SelectItem>
          {values.map((v) => (
            <SelectItem value={v} key={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  const multiple = (
    id: string,
    title: string,
    help: string,
    values: string[],
    key: "branches" | "locations",
  ) => (
    <div className="grid min-w-0 gap-2">
      <FieldLabel id={id} title={title} help={help} />
      <Select
        value=""
        onValueChange={(v) => {
          setForm((previous) => ({
            ...previous,
            [key]: previous[key].includes(v) ? previous[key] : [...previous[key], v],
          }));
          setResults(null);
        }}
      >
        <SelectTrigger id={id} aria-label={title} className="min-w-0">
          <SelectValue placeholder={"Choose " + title.toLowerCase()} />
        </SelectTrigger>
        <SelectContent>
          {values.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex flex-wrap gap-2">
        {form[key].map((v) => (
          <Button
            variant="outline"
            size="sm"
            type="button"
            key={v}
            className="h-auto max-w-full whitespace-normal text-left"
            onClick={() => {
              setForm((previous) => ({ ...previous, [key]: previous[key].filter((x) => x !== v) }));
              setResults(null);
            }}
          >
            {v}
            <X className="h-3 w-3 shrink-0" />
          </Button>
        ))}
      </div>
    </div>
  );
  return (
    <TooltipProvider delayDuration={300}>
      <div className="theme-accent-campus mx-auto max-w-6xl px-4 py-10">
        <PageBackground image={pageBg.url} />
        <PageHero
          className="-mt-10 mb-8"
          image={pageHero.url}
          title="College Matchmaker"
          subtitle="Historical cutoff references from verified official records."
        />
        <form onSubmit={submit} noValidate className="mt-6 grid gap-6">
          <section
            aria-label="Your CAP details"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="grid gap-1">
              <FieldLabel
                id="percentile"
                title="MHT-CET percentile"
                help="Enter your official MHT-CET percentile from 0 to 100, not marks or rank."
              />
              <Input
                id="percentile"
                aria-label="MHT-CET percentile"
                type="number"
                min={0}
                max={100}
                step="0.0001"
                value={form.percentile}
                onChange={(e) => update("percentile", e.target.value)}
                placeholder="Your percentile"
              />
            </div>
            {picker(
              "category",
              "Category",
              "Select the exact seat category code from official cutoff records; it is not an eligibility certificate.",
              categories,
              "category",
            )}
            {picker(
              "candidature",
              "Candidature type",
              "Choose the official seat pool applicable to your candidature. Check your eligibility in the CET Cell brochure.",
              candidatures,
              "candidatureType",
            )}
            {picker(
              "home-university",
              "Home University",
              "Required for Home University and Other Than Home University pools. Matching uses verified university affiliation only; this does not determine your eligibility.",
              universities,
              "homeUniversity",
              true,
            )}
            {picker(
              "institute-type",
              "Institute type preference",
              "Optional. These management labels come only from sourced official classifications.",
              types,
              "instituteType",
              true,
            )}
          </section>
          <section aria-label="Your preferences" className="grid gap-4 sm:grid-cols-2">
            {multiple(
              "branches",
              "Preferred branches",
              "Choose one or more branches from verified cutoff records, up to 15.",
              branches,
              "branches",
            )}
            {multiple(
              "locations",
              "Preferred districts or cities",
              "Optional. Choose up to 20 locations; a college matches any selected city or district.",
              locations,
              "locations",
            )}
          </section>
          <p className="text-sm text-muted-foreground">
            Build a balanced list using ambitious, competitive, and safer choices.
          </p>
          <p className="text-sm text-muted-foreground">
            Groups reflect percentile differences only: Safer ≥ +1.5 points; Competitive between
            −1.5 and +1.5; Ambitious ≤ −1.5. This is not a guarantee of admission.
          </p>
          <p className="text-sm text-muted-foreground">
            One reference per college and branch: newest academic year, then latest verification
            date and CAP round.
          </p>
          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm text-primary">
              {notice}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Loading…" : "Find Colleges"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError("");
                const profile = validate();
                if (!profile) return;
                try {
                  localStorage.setItem(KEY, JSON.stringify(profile));
                  setNotice("Profile saved on this device.");
                } catch {
                  setError("Your browser could not save this profile.");
                }
              }}
            >
              <Save className="h-4 w-4" />
              Save profile locally
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setForm(empty);
                setResults(null);
                setSubmitted(null);
                setError("");
                setNotice("");
                try {
                  localStorage.removeItem(KEY);
                } catch {
                  /* unavailable */
                }
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Start a new search
            </Button>
          </div>
        </form>
        {results !== null && (
          <section className="mt-8" aria-label="Verified matches">
            <h2 className="text-xl font-semibold">Historical cutoff matches ({results.length})</h2>
            {results.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No verified matches were found for these filters. Try changing the branch, district,
                category, or percentile.
              </p>
            ) : (
              ["Ambitious", "Competitive", "Safer"].map((group) => (
                <section key={group} className="mt-8">
                  <h3 className="mb-3 text-lg font-semibold">
                    {group} ({results.filter((r) => r.group === group).length})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {results
                      .filter((r) => r.group === group)
                      .map((r) => (
                        <Card
                          key={r.identifier + "||" + r.branch}
                          className="min-w-0 border-border/70"
                        >
                          <CardContent className="p-5">
                            <Link
                              to="/colleges/$collegeName"
                              params={{ collegeName: r.identifier }}
                              className="break-words font-semibold text-primary hover:underline"
                            >
                              {r.college_name}
                            </Link>
                            <p className="mt-2 font-medium">{r.branch}</p>
                            <Badge variant="outline" className="mt-2">
                              {r.group}
                            </Badge>
                            <p className="mt-3 text-xs text-muted-foreground">
                              Historical cutoff reference.
                            </p>
                            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                              {[
                                ["Relevant cutoff", r.closing_percentile],
                                ["Student percentile", submitted?.percentile],
                                [
                                  "Percentile difference",
                                  (r.difference > 0 ? "+" : "") + r.difference.toFixed(4),
                                ],
                                ["CAP round", r.cap_round],
                                ["Category", r.category],
                                ["Candidature type", r.candidature_type],
                                ["Academic year", r.academic_year],
                                ["Last verified date", r.last_verified],
                                ["Institute code", r.institute_code],
                              ].map(([label, value]) => (
                                <div key={String(label)} className="min-w-0">
                                  <dt className="text-muted-foreground">{label}</dt>
                                  <dd className="break-words font-medium">
                                    {value ?? "Not published yet"}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                            <a
                              href={r.source_url ?? undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                            >
                              Official source
                            </a>
                            <p className="mt-2 text-xs text-muted-foreground">
                              This is not a guarantee of admission.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                  !selection.includes(r.identifier) &&
                                  selection.length >= MAX_COMPARE
                                }
                                onClick={() => toggleCompare(r.identifier)}
                              >
                                <GitCompare className="h-4 w-4" />
                                {selection.includes(r.identifier)
                                  ? "Remove from comparison"
                                  : "Add to comparison"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (!r.branch) return;
                                  addCollegeBranch(r.identifier, r.branch);
                                  setNotice("College and branch added to your option form.");
                                }}
                              >
                                <Plus className="h-4 w-4" />
                                Add to option form
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </section>
              ))
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link to="/compare">
                  Open comparison ({selection.length}/{MAX_COMPARE})
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/option-form">Open option form</Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </TooltipProvider>
  );
}
