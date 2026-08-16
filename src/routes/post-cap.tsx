import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangle, ExternalLink, FileText } from "lucide-react";
import { getPostCapUpdates } from "@/lib/cap.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageBackground } from "@/components/page-background";
import pageBg from "@/assets/post-cap-bg.asset.json";

const updatesQuery = queryOptions({
  queryKey: ["post-cap-updates-official"],
  queryFn: () => getPostCapUpdates(),
});

const TITLE = "Post-CAP Process — Maharashtra CAP Guide | MHT-CET Counselling Help";
const DESCRIPTION =
  "Official post-CAP (ACAP/ILS) institute notices, vacancy updates and admission links for Maharashtra engineering colleges, with verification dates and official sources.";

export const Route = createFileRoute("/post-cap")({
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
    context.queryClient.ensureQueryData(updatesQuery);
  },
  component: PostCapPage,
});

function PostCapPage() {
  const { data: updates } = useSuspenseQuery(updatesQuery);

  return (
    <div className="theme-accent-desk mx-auto max-w-6xl px-4 py-10">
      <PageBackground image={pageBg.url} />
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Post-CAP Process
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Official institute notices published after the CAP rounds — including ACAP/ILS
        admissions against vacancy seats.
      </p>

      <div className="mt-6 flex gap-3 rounded-lg border border-border/70 bg-secondary/30 p-4 text-sm text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />
        <p className="leading-relaxed">
          ACAP/ILS rules, vacancy positions, dates, and eligibility vary by institute.
          Always confirm directly with the college&apos;s official notice.
        </p>
      </div>

      {updates.length === 0 ? (
        <Card className="mt-6 border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No official post-CAP updates are available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {updates.map((u) => (
            <Card
              key={u.id}
              className="border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardContent className="flex h-full flex-col p-5 sm:p-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <h2 className="min-w-0 break-words text-base font-semibold leading-snug text-foreground">
                    {u.college_name}
                  </h2>
                  {u.update_type ? (
                    <Badge
                      variant="outline"
                      className="shrink-0 whitespace-nowrap border-teal/30 bg-teal/12 text-teal"
                    >
                      {u.update_type}
                    </Badge>
                  ) : null}
                </div>

                <p className="mt-2 flex items-start gap-1.5 break-words text-sm text-muted-foreground">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0">{u.update_title}</span>
                </p>

                {u.status ? (
                  <p className="mt-3">
                    <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {u.status}
                    </span>
                  </p>
                ) : null}

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <div>
                    <dt className="uppercase tracking-wide">Published</dt>
                    <dd className="mt-0.5 text-foreground">
                      {u.published_date ?? "Not stated"}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wide">Last verified</dt>
                    <dd className="mt-0.5 text-foreground">
                      {u.last_verified ?? "Not stated"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5">
                  {u.notice_url ? (
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <a href={u.notice_url} target="_blank" rel="noreferrer noopener">
                        View Official Notice <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Official notice link not verified yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
