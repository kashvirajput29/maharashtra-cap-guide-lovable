import { createFileRoute, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, ExternalLink, Clock, AlertCircle } from "lucide-react";
import { getImportantDates } from "@/lib/cap.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/disclaimer";

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

type DateRecord = Awaited<ReturnType<typeof getImportantDates>>[number];

function statusRank(status: string): number {
  const s = status.toLowerCase();
  if (s.includes("active")) return 0;
  if (s.includes("upcoming")) return 1;
  if (s.includes("declared")) return 2;
  return 3;
}

function statusClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("active"))
    return "border-primary/40 bg-primary/10 text-primary shadow-[0_0_0_1px_var(--color-primary)]";
  if (s.includes("upcoming"))
    return "border-aqua/45 bg-aqua/12 text-aqua";
  if (s.includes("declared"))
    return "border-chart-2/40 bg-chart-2/15 text-foreground";
  return "border-border bg-muted/60 text-muted-foreground";
}

function dotClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("active")) return "bg-primary ring-4 ring-primary/20";
  if (s.includes("upcoming")) return "bg-aqua ring-4 ring-aqua/20";
  if (s.includes("declared")) return "bg-chart-2 ring-4 ring-chart-2/20";
  return "bg-muted-foreground ring-4 ring-muted";
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

function isHappeningNow(start: string, end: string) {
  const now = new Date();
  const startTime = new Date(start);
  const endTime = new Date(end);
  endTime.setHours(23, 59, 59, 999);
  return now >= startTime && now <= endTime;
}

function groupByRound(dates: DateRecord[]) {
  const map = new Map<string, DateRecord[]>();
  for (const item of dates) {
    const list = map.get(item.round) ?? [];
    list.push(item);
    map.set(item.round, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => {
      const rankDiff = statusRank(a.status) - statusRank(b.status);
      if (rankDiff !== 0) return rankDiff;
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });
  }
  return Array.from(map.entries()).map(([round, items]) => ({ round, items }));
}

function ImportantDatesPage() {
  const { data: dates } = useSuspenseQuery(datesQuery);

  const grouped = groupByRound(dates);
  const activeCount = dates.filter((d) =>
    d.status.toLowerCase().includes("active"),
  ).length;
  const upcomingCount = dates.filter((d) =>
    d.status.toLowerCase().includes("upcoming"),
  ).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Important dates
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The CAP schedule grouped by round. Activities are sorted by status and
        then chronologically. Always confirm deadlines on the official notice
        before acting.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-primary/20" />
          Active
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-aqua ring-2 ring-aqua/20" />
          Upcoming
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground ring-2 ring-muted" />
          Closed / Declared
        </span>
      </div>

      {activeCount > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-primary">
              {activeCount} active {activeCount === 1 ? "window" : "windows"}
            </p>
            <p className="text-xs text-primary/80">
              These activities are open right now. Check the official notice for
              exact timings.
            </p>
          </div>
        </div>
      )}

      {dates.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No schedule activities have been published yet.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-12">
          {grouped.map((group) => (
            <section key={group.round}>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {group.round}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {group.items.length} activit
                  {group.items.length === 1 ? "y" : "ies"}
                </span>
              </div>

              <ol className="relative mt-5 space-y-6 border-l-2 border-border pl-8">
                {group.items.map((item) => {
                  const nowActive =
                    item.status.toLowerCase().includes("active") &&
                    isHappeningNow(item.start_date, item.end_date);
                  return (
                    <li key={item.id} className="relative">
                      <span
                        className={`absolute -left-[39px] top-1 flex h-5 w-5 items-center justify-center rounded-full ${dotClass(item.status)}`}
                      />
                      <Card
                        className={`border-border/80 transition-shadow ${
                          item.status.toLowerCase().includes("active")
                            ? "shadow-sm ring-1 ring-primary/10"
                            : item.status.toLowerCase().includes("upcoming")
                              ? "shadow-sm ring-1 ring-aqua/15"
                              : ""
                        }`}
                      >
                        <CardContent className="p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <h3 className="text-base font-semibold leading-snug text-foreground">
                              {item.activity}
                            </h3>
                            <Badge
                              variant="outline"
                              className={statusClass(item.status)}
                            >
                              {item.status}
                            </Badge>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-4 w-4" />
                              {formatDate(item.start_date)}
                              <span className="text-border">&ndash;</span>
                              {formatDate(item.end_date)}
                            </span>
                            {nowActive && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                                <Clock className="h-3.5 w-3.5" />
                                Happening now
                              </span>
                            )}
                          </div>

                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-aqua hover:underline"
                          >
                            Official notice{" "}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}

      {upcomingCount > 0 && (
        <p className="mt-10 text-center text-xs text-muted-foreground">
          {upcomingCount} upcoming {upcomingCount === 1 ? "activity" : "activities"}{" "}
          scheduled. Dates may shift — keep checking the official site.
        </p>
      )}

      <Disclaimer className="mt-10" />
    </div>

  );
}
