import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, ShieldCheck, X } from "lucide-react";
import { getOfficialCollege } from "@/lib/cap.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CutoffNote } from "@/components/cutoff-note";
import { PageBackground } from "@/components/page-background";
import pageBg from "@/assets/college-detail-bg.asset.json";
import {
  MAX_COMPARE,
  clearCompare,
  removeFromCompare,
  useCompareSelection,
} from "@/lib/compare-store";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Colleges — Maharashtra CAP Guide | MHT-CET Counselling Help" },
      {
        name: "description",
        content:
          "Compare Maharashtra engineering colleges side by side using verified official 2026 CAP data: location, affiliation, branches, official indicators and cutoffs.",
      },
      {
        property: "og:title",
        content: "Compare Colleges — Maharashtra CAP Guide | MHT-CET Counselling Help",
      },
      {
        property: "og:description",
        content:
          "Compare Maharashtra engineering colleges side by side using verified official 2026 CAP data.",
      },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const selection = useCompareSelection();

  const results = useQueries({
    queries: selection.map((name) => ({
      queryKey: ["college-official-2026", name],
      queryFn: () => getOfficialCollege({ data: { collegeName: name } }),
    })),
  });

  return (
    <div className="theme-accent-library mx-auto max-w-6xl px-4 py-10">
      <PageBackground image={pageBg.url} />

      <Link
        to="/colleges"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to colleges
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Compare colleges
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Side-by-side view of verified official 2026 records only ({selection.length}/
            {MAX_COMPARE} selected).
          </p>
        </div>
        {selection.length > 0 && (
          <Button variant="outline" onClick={clearCompare} className="gap-1.5">
            <X className="h-4 w-4" /> Clear Comparison
          </Button>
        )}
      </div>

      {selection.length < 2 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Select at least 2 colleges (up to {MAX_COMPARE}) from the Colleges page to start
            a comparison.
            <div className="mt-4">
              <Button asChild size="sm">
                <Link to="/colleges">Choose colleges</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {selection.map((name, index) => {
            const result = results[index];
            const college = result?.data?.college ?? null;
            const cutoffs = result?.data?.cutoffs ?? [];
            const classifications = result?.data?.classifications ?? [];
            const branches = (college?.branches_offered ?? "")
              .split(/[,;|]/)
              .map((b) => b.trim())
              .filter(Boolean);

            return (
              <Card key={name} className="border-border/70">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="min-w-0 break-words text-base font-semibold leading-snug text-foreground">
                      {name}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${name} from comparison`}
                      onClick={() => removeFromCompare(name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {result?.isPending ? (
                    <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
                  ) : !college ? (
                    <p className="mt-4 text-sm text-muted-foreground">
                      No official record found for this college.
                    </p>
                  ) : (
                    <dl className="mt-4 space-y-4 text-sm">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          City / District
                        </dt>
                        <dd className="mt-1 break-words text-foreground">
                          {college.city ?? "—"}, {college.district ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          University affiliation
                        </dt>
                        <dd className="mt-1 break-words text-foreground">
                          {college.university_affiliation ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          Branches offered
                        </dt>
                        <dd className="mt-1 flex flex-wrap gap-1.5">
                          {branches.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            branches.map((b) => (
                              <span
                                key={b}
                                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                              >
                                {b}
                              </span>
                            ))
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          Verified official indicators
                        </dt>
                        <dd className="mt-1 space-y-1.5">
                          {classifications.length === 0 ? (
                            <span className="text-muted-foreground">
                              No official indicator found.
                            </span>
                          ) : (
                            classifications.map((c) => (
                              <div
                                key={c.id}
                                className="flex flex-wrap items-center gap-1.5 text-foreground"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-aqua" />
                                <span className="break-words">
                                  {c.official_indicator}: {c.indicator_value ?? "—"}
                                </span>
                                {c.source_url ? (
                                  <a
                                    href={c.source_url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-aqua hover:underline"
                                  >
                                    View source
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : null}
                              </div>
                            ))
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          Official 2026 cutoffs
                        </dt>
                        <dd className="mt-1">
                          {cutoffs.length === 0 ? (
                            <span className="text-muted-foreground">
                              No official 2026 cutoff published yet.
                            </span>
                          ) : (
                            <div className="space-y-1.5">
                              <Badge variant="outline" className="border-aqua/45 text-aqua">
                                {cutoffs.length} published record
                                {cutoffs.length === 1 ? "" : "s"}
                              </Badge>
                              <ul className="space-y-1">
                                {cutoffs.slice(0, 4).map((c) => (
                                  <li key={c.id} className="break-words text-foreground">
                                    {c.branch} · {c.category} · {c.cap_round} —{" "}
                                    <span className="font-semibold">
                                      {c.closing_percentile}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              {cutoffs.length > 4 ? (
                                <p className="text-xs text-muted-foreground">
                                  +{cutoffs.length - 4} more on the college page
                                </p>
                              ) : null}
                            </div>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          Official website
                        </dt>
                        <dd className="mt-1">
                          {college.official_website_url ? (
                            <a
                              href={college.official_website_url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-aqua hover:underline"
                            >
                              Visit Official Website
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">
                              Official website not verified yet
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  )}

                  <div className="mt-5">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/colleges/$collegeName" params={{ collegeName: name }}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CutoffNote className="mt-10" />
    </div>
  );
}
