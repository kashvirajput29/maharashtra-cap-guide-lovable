import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GitCompare, X, Loader2, MapPin } from "lucide-react";
import { getRecommendOptions, getWhatIfScenario } from "@/lib/cap.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBackground } from "@/components/page-background";
import { PageHero } from "@/components/page-hero";
import pageHero from "@/assets/hero-starlit-observatory-study-night.asset.json";
import pageBg from "@/assets/colleges-bg.asset.json";

const optionsQuery = queryOptions({
  queryKey: ["recommend-options"],
  queryFn: () => getRecommendOptions(),
});

const CATEGORIES = ["OPEN", "OBC", "SC", "ST", "EWS", "Other"] as const;
const CANDIDATURE = [
  "State Level",
  "Home University",
  "Other Than Home University",
] as const;

const TITLE = "Compare Scenarios — Maharashtra CAP Guide | MHT-CET Counselling Help";
const DESC =
  "Compare two MHT-CET CAP scenarios side-by-side. Change percentile, category or candidature type to see how your Safe, Moderate and Ambitious college options change."

export const Route = createFileRoute("/what-if")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(optionsQuery);
  },
  component: WhatIfPage,
});

type ScenarioResult = Awaited<ReturnType<typeof getWhatIfScenario>>;

type ScenarioState = {
  percentile: string;
  category: string;
  candidature: string;
  branchText: string;
  districtText: string;
};

const initialScenario: ScenarioState = {
  percentile: "",
  category: "OPEN",
  candidature: "State Level",
  branchText: "",
  districtText: "",
};


function splitList(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function useScenario() {
  const [state, setState] = useState<ScenarioState>(initialScenario);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof ScenarioState>(key: K, value: ScenarioState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const addTo = (key: "branchText" | "districtText", value: string) => {
    setState((s) => {
      const list = splitList(s[key]);
      if (list.some((v) => v.toLowerCase() === value.toLowerCase())) return s;
      return { ...s, [key]: [...list, value].join(", ") };
    });
  };

  const removeFrom = (key: "branchText" | "districtText", value: string) => {
    setState((s) => ({
      ...s,
      [key]: splitList(s[key])
        .filter((v) => v !== value)
        .join(", "),
    }));
  };

  const run = async () => {
    setError(null);
    const p = Number(state.percentile);
    if (!Number.isFinite(p) || p < 0 || p > 100) {
      setError("Enter a valid percentile between 0 and 100.");
      return;
    }
    const branches = splitList(state.branchText);
    if (branches.length === 0) {
      setError("Add at least one preferred branch.");
      return;
    }
    setLoading(true);
    try {
      const data = await getWhatIfScenario({
        data: {
          percentile: p,
          category: state.category,
          candidatureType: state.candidature,
          branches: branches.slice(0, 15),
          districts: splitList(state.districtText).slice(0, 20),
        },
      });
      setResult(data);
    } catch {
      setError("Could not run the simulation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { state, set, addTo, removeFrom, result, error, loading, run };
}

function ScenarioPanel({
  title,
  scenario,
  options,
}: {
  title: string;
  scenario: ReturnType<typeof useScenario>;
  options: Awaited<ReturnType<typeof getRecommendOptions>>;
}) {
  const { state, set, addTo, removeFrom, result, error, loading, run } = scenario;
  const branchChips = splitList(state.branchText);
  const districtChips = splitList(state.districtText);

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`percentile-${title}`}>Percentile</Label>
              <Input
                id={`percentile-${title}`}
                type="number"
                min={0}
                max={100}
                step="0.0001"
                inputMode="decimal"
                value={state.percentile}
                onChange={(e) => set("percentile", e.target.value)}
                placeholder="e.g. 92.45"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`category-${title}`}>Category</Label>
              <Select value={state.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger id={`category-${title}`}>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor={`candidature-${title}`}>Candidature type</Label>
              <Select
                value={state.candidature}
                onValueChange={(v) => set("candidature", v)}
              >
                <SelectTrigger id={`candidature-${title}`}>
                  <SelectValue placeholder="Candidature type" />
                </SelectTrigger>
                <SelectContent>
                  {CANDIDATURE.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`branches-${title}`}>Preferred branches</Label>
            <Input
              id={`branches-${title}`}
              value={state.branchText}
              onChange={(e) => set("branchText", e.target.value)}
              placeholder="Computer Science and Engineering, Information Technology"
            />
            {options.branches.length > 0 && (
              <Select
                value=""
                onValueChange={(v) => addTo("branchText", v)}
              >
                <SelectTrigger aria-label="Add a branch from the official list">
                  <SelectValue placeholder="Add a branch from the official list" />
                </SelectTrigger>
                <SelectContent>
                  {options.branches.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {branchChips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {branchChips.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => removeFrom("branchText", b)}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {b}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`districts-${title}`}>Preferred districts (optional)</Label>
            <Input
              id={`districts-${title}`}
              value={state.districtText}
              onChange={(e) => set("districtText", e.target.value)}
              placeholder="Pune, Mumbai City"
            />
            {options.districts.length > 0 && (
              <Select
                value=""
                onValueChange={(v) => addTo("districtText", v)}
              >
                <SelectTrigger aria-label="Add a district">
                  <SelectValue placeholder="Add a district" />
                </SelectTrigger>
                <SelectContent>
                  {options.districts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {districtChips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {districtChips.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => removeFrom("districtText", d)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {d}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <div>
            <Button onClick={run} size="lg" disabled={loading} className="rounded-lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  <GitCompare className="mr-2 h-4 w-4" />
                  Run {title}
                </>
              )}
            </Button>
          </div>
        </div>

        {result && (
          <div className="mt-6 border-t border-border/70 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Results
            </h3>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {result.counts.Safe}
                </p>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Safe
                </p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {result.counts.Moderate}
                </p>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Moderate
                </p>
              </div>
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {result.counts.Ambitious}
                </p>
                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                  Ambitious
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold text-foreground">
                Top 5 Safe colleges
              </h4>
              {result.topSafe.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No Safe colleges for this scenario. Try a higher percentile or
                  broader branch/district choices.
                </p>
              ) : (
                <div className="mt-2 divide-y divide-border/70 rounded-xl border border-border bg-card/80">
                  {result.topSafe.map((r) => (
                    <div
                      key={r.key}
                      className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <Link
                          to="/colleges/$collegeName"
                          params={{ collegeName: r.collegeName }}
                          className="text-sm font-semibold text-foreground hover:text-primary"
                        >
                          {r.collegeName}
                        </Link>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {[r.city, r.district].filter(Boolean).join(", ") || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">{r.branch}</p>
                      </div>
                      <div className="mt-1 text-right sm:mt-0">
                        <p className="text-sm font-semibold text-foreground">
                          {r.closingPercentile}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Closing percentile
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WhatIfPage() {
  const { data: options } = useSuspenseQuery(optionsQuery);
  const scenarioA = useScenario();
  const scenarioB = useScenario();

  return (
    <div className="theme-accent-campus mx-auto max-w-6xl px-4 py-10">
      <PageBackground image={pageBg.url} />

      <PageHero
        className="-mt-10 mb-8"
        image={pageHero.url}
        title="Compare Scenarios"
        subtitle="Change your percentile, category or candidature type to see how your college options change."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScenarioPanel title="Scenario A" scenario={scenarioA} options={options} />
        <ScenarioPanel title="Scenario B" scenario={scenarioB} options={options} />
      </div>

      <Card className="mt-6 border-border/70">
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This simulator uses officially published 2026 CAP cutoffs from the
            Maharashtra State CET Cell. Actual admission chances depend on many
            factors including round, category shifts, and number of seats.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
