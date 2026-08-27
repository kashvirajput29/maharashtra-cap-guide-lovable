import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, X, MapPin, Loader2, ClipboardList } from "lucide-react";
import { getRecommendOptions, getRecommendations } from "@/lib/cap.functions";
import { RiskBadge } from "@/components/status-badge";
import { CutoffNote } from "@/components/cutoff-note";
import { Card, CardContent } from "@/components/ui/card";
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
import pageHero from "@/assets/hero-sunlit-forest-trail-study-nook.asset.json";
import pageBg from "@/assets/colleges-bg.asset.json";
import { addOptions } from "@/lib/option-form-store";

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

const TITLE = "College Matchmaker — Maharashtra CAP Guide | MHT-CET Counselling Help";
const DESC =
  "Enter your MHT-CET percentile, category and preferred branches to see Maharashtra engineering colleges ranked as Safe, Moderate or Ambitious using official 2026 CAP cutoffs."

export const Route = createFileRoute("/recommend")({
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
  component: RecommendPage,
});

type Rec = Awaited<ReturnType<typeof getRecommendations>>[number];


function splitList(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function RecommendPage() {
  const { data: options } = useSuspenseQuery(optionsQuery);
  const navigate = useNavigate();

  const [percentile, setPercentile] = useState("");
  const [category, setCategory] = useState<string>("OPEN");
  const [candidature, setCandidature] = useState<string>("State Level");
  const [branchText, setBranchText] = useState("");
  const [districtText, setDistrictText] = useState("");
  const [homeUniversity, setHomeUniversity] = useState("any");

  const [results, setResults] = useState<Rec[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addTo = (current: string, value: string) => {
    const list = splitList(current);
    if (list.some((v) => v.toLowerCase() === value.toLowerCase())) return current;
    return [...list, value].join(", ");
  };
  const removeFrom = (current: string, value: string) =>
    splitList(current)
      .filter((v) => v !== value)
      .join(", ");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const p = Number(percentile);
    if (!Number.isFinite(p) || p < 0 || p > 100) {
      setError("Enter a valid percentile between 0 and 100.");
      return;
    }
    const branches = splitList(branchText);
    if (branches.length === 0) {
      setError("Add at least one preferred branch.");
      return;
    }
    setLoading(true);
    try {
      const data = await getRecommendations({
        data: {
          percentile: p,
          category,
          candidatureType: candidature,
          branches: branches.slice(0, 15),
          districts: splitList(districtText).slice(0, 20),
        },
      });
      setResults(data);
    } catch {
      setError("Could not load recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const branchChips = splitList(branchText);
  const districtChips = splitList(districtText);

  return (
    <div className="theme-accent-campus mx-auto max-w-6xl px-4 py-10">
      <PageBackground image={pageBg.url} />

      <PageHero
        className="-mt-10 mb-8"
        image={pageHero.url}
        title="College Matchmaker"
        subtitle="See colleges ranked by how realistic they are, based on published official 2026 CAP closing percentiles."
      />

      <Card className="mt-6 border-border/70">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="percentile">MHT-CET percentile</Label>
                <Input
                  id="percentile"
                  type="number"
                  min={0}
                  max={100}
                  step="0.0001"
                  inputMode="decimal"
                  value={percentile}
                  onChange={(e) => setPercentile(e.target.value)}
                  placeholder="e.g. 92.45"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
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

              <div className="grid gap-2">
                <Label htmlFor="candidature">Candidature type</Label>
                <Select value={candidature} onValueChange={setCandidature}>
                  <SelectTrigger id="candidature">
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
              <Label htmlFor="branches">Preferred branches</Label>
              <Input
                id="branches"
                value={branchText}
                onChange={(e) => setBranchText(e.target.value)}
                placeholder="Computer Science and Engineering, Information Technology"
              />
              {options.branches.length > 0 && (
                <Select value="" onValueChange={(v) => setBranchText((t) => addTo(t, v))}>
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
                      onClick={() => setBranchText((t) => removeFrom(t, b))}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {b}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="districts">Preferred districts (optional)</Label>
                <Input
                  id="districts"
                  value={districtText}
                  onChange={(e) => setDistrictText(e.target.value)}
                  placeholder="Pune, Mumbai City"
                />
                {options.districts.length > 0 && (
                  <Select
                    value=""
                    onValueChange={(v) => setDistrictText((t) => addTo(t, v))}
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
                        onClick={() => setDistrictText((t) => removeFrom(t, d))}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {d}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="home-university">Home university (optional)</Label>
                <Select value={homeUniversity} onValueChange={setHomeUniversity}>
                  <SelectTrigger id="home-university">
                    <SelectValue placeholder="Home university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Not specified</SelectItem>
                    {options.universities.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Used only to help you pick the right candidature type above.
                </p>
              </div>
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <div>
              <Button type="submit" size="lg" disabled={loading} className="rounded-lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Find Colleges
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6">
        <CutoffNote />
      </div>

      {results !== null && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Recommended colleges
          </h2>
          {results.length === 0 ? (
            <p className="mt-3 rounded-xl border border-border bg-card/80 p-4 text-sm text-muted-foreground">
              No published 2026 CAP cutoffs match these preferences. Try more branches, a
              different candidature type, or remove the district filter.
            </p>
          ) : (
            <>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing top {results.length} matches, sorted Safe first.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => {
                    addOptions(Array.from(new Set(results.map((r) => r.collegeName))));
                    navigate({ to: "/option-form" });
                  }}
                >
                  <ClipboardList className="mr-2 h-4 w-4" /> Use these colleges in Option
                  Form
                </Button>
              </div>

              {/* Mobile cards */}
              <div className="mt-4 grid gap-3 md:hidden">
                {results.map((r) => (
                  <Card key={r.key} className="border-border/70">
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          to="/colleges/$collegeName"
                          params={{ collegeName: r.collegeName }}
                          className="text-sm font-semibold text-foreground hover:text-primary"
                        >
                          {r.collegeName}
                        </Link>
                        <RiskBadge label={r.label} className="shrink-0" />
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {[r.city, r.district].filter(Boolean).join(", ") || "—"}
                      </p>
                      <p className="mt-2 text-sm text-foreground">{r.branch}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Closing percentile:{" "}
                        <span className="font-semibold text-foreground">
                          {r.closingPercentile}
                        </span>
                        {r.capRound ? ` · ${r.capRound}` : ""}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop table */}
              <div className="mt-4 hidden overflow-x-auto rounded-xl border border-border bg-card/80 md:block">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">College</th>
                      <th className="px-4 py-3 font-semibold">City / District</th>
                      <th className="px-4 py-3 font-semibold">Branch</th>
                      <th className="px-4 py-3 font-semibold">Closing percentile</th>
                      <th className="px-4 py-3 font-semibold">Chance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.key} className="border-t border-border/70">
                        <td className="px-4 py-3">
                          <Link
                            to="/colleges/$collegeName"
                            params={{ collegeName: r.collegeName }}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {r.collegeName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {[r.city, r.district].filter(Boolean).join(", ") || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.branch}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {r.closingPercentile}
                        </td>
                        <td className="px-4 py-3">
                          <RiskBadge label={r.label} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
