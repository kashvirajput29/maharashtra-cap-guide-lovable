import { createFileRoute, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, ExternalLink } from "lucide-react";
import { getImportantDates } from "@/lib/cap.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const datesQuery = queryOptions({
  queryKey: ["important-dates"],
  queryFn: () => getImportantDates(),
});

export const Route = createFileRoute("/important-dates")({
  head: () => ({
    meta: [
      { title: "Important CAP Dates & Deadlines — Maharashtra CAP Guide" },
      {
        name: "description",
        content:
          "Round-wise MHT-CET CAP counselling schedule with start and end dates, live status and official links for every activity.",
      },
      { property: "og:title", content: "Important CAP Dates & Deadlines" },
      {
        property: "og:description",
        content:
          "Track registration, verification, choice filling and allotment windows round by round.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(datesQuery);
  },
  component: ImportantDatesPage,
  errorComponent: DatesError,
});

function DatesError() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">
        Couldn&apos;t load the schedule
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Please try again in a moment.
      </p>
      <Button className="mt-4" onClick={() => router.invalidate()}>
        Try again
      </Button>
    </div>
  );
}

function statusClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("active")) return "border-primary/30 bg-primary/10 text-primary";
  if (s.includes("upcoming")) return "border-accent/30 bg-accent/15 text-accent-foreground";
  if (s.includes("declared"))
    return "border-chart-2/40 bg-chart-2/15 text-foreground";
  return "border-border bg-secondary text-muted-foreground";
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ImportantDatesPage() {
  const { data: dates } = useSuspenseQuery(datesQuery);

  const rounds = Array.from(new Set(dates.map((d) => d.round)));
  const grouped = rounds.map((round) => ({
    round,
    items: dates.filter((d) => d.round === round),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Important dates
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The CAP schedule grouped by round. Statuses update as the process moves forward —
        always confirm on the official notice before acting.
      </p>

      {dates.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No schedule activities have been published yet.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-10">
          {grouped.map((group) => (
            <section key={group.round}>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {group.round}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {group.items.length} activit{group.items.length === 1 ? "y" : "ies"}
                </span>
              </div>

              <ol className="mt-4 space-y-4 border-l border-border pl-6">
                {group.items.map((item) => (
                  <li key={item.id} className="relative">
                    <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                    </span>
                    <Card className="border-border/70">
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <h3 className="text-base font-semibold leading-snug text-foreground">
                            {item.activity}
                          </h3>
                          <Badge variant="outline" className={statusClass(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {formatDate(item.start_date)} &ndash; {formatDate(item.end_date)}
                        </p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          Official notice <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
