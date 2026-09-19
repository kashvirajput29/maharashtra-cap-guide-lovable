import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { getDataQualityReport } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TITLE = "Data Quality (Admin) | Maharashtra CAP Guide";

export const Route = createFileRoute("/_authenticated/admin/data-quality")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content:
          "Internal admin-only data-quality checks for the Maharashtra CAP Guide official 2026 dataset.",
      },
      { property: "og:title", content: TITLE },
      {
        property: "og:description",
        content: "Internal admin-only data-quality checks for the official 2026 dataset.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DataQualityPage,
});

function DataQualityPage() {
  const fetchReport = useServerFn(getDataQualityReport);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-data-quality"],
    queryFn: () => fetchReport(),
    retry: false,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Data quality (admin)
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Re-run checks
              </>
            )}
          </Button>
          <Button variant="secondary" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>

      {isPending ? (
        <p className="mt-8 text-sm text-muted-foreground">Running live checks…</p>
      ) : error ? (
        <Card className="mt-8 border-destructive/40">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-destructive">
              You do not have access to this page.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Only signed-in maintainers with the admin role can view data-quality checks.
            </p>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              ["Colleges", data.totals.colleges],
              ["Distinct colleges", data.totals.distinctColleges],
              ["Cutoff records", data.totals.cutoffs],
              ["Important dates", data.totals.dates],
            ].map(([label, value]) => (
              <Card key={String(label)} className="border-border/70">
                <CardContent className="p-5">
                  <p className="text-2xl font-bold text-foreground">{String(value)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{String(label)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Cutoff uniqueness key: {data.cutoffKeyFields}. Generated{" "}
            {new Date(data.generatedAt).toLocaleString()}.
          </p>

          <div className="mt-6 space-y-3">
            {data.checks.map((check) => {
              const ok = check.count === 0;
              return (
                <Card
                  key={check.id}
                  className={ok ? "border-teal/40" : "border-amber-500/50"}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      {ok ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          {check.label} —{" "}
                          <span className={ok ? "text-teal" : "text-amber-600 dark:text-amber-400"}>
                            {ok ? "Pass" : `${check.count} issue${check.count === 1 ? "" : "s"}`}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{check.detail}</p>
                        {check.samples.length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {check.samples.map((s) => (
                              <li key={s} className="break-words">
                                {s}
                              </li>
                            ))}
                            {check.count > check.samples.length ? (
                              <li>+{check.count - check.samples.length} more…</li>
                            ) : null}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
