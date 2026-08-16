import { createFileRoute, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarDays, ExternalLink, Info, AlertTriangle } from "lucide-react";
import { getImportantDates } from "@/lib/cap.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Disclaimer } from "@/components/disclaimer";
import { PageBackground } from "@/components/page-background";
import pageBg from "@/assets/important-dates-bg.asset.json";

const datesQuery = queryOptions({
  queryKey: ["important-dates"],
  queryFn: () => getImportantDates(),
});

export const Route = createFileRoute("/important-dates")({
  head: () => ({
    meta: [
      { title: "Important CAP Dates & Deadlines — Maharashtra CAP Guide | MHT-CET Counselling Help" },
      {
        name: "description",
        content:
          "A simple student-friendly guide to Maharashtra MHT-CET CAP counselling, with college details, CAP process steps, important dates, and FAQs for students and parents.",
      },
      { property: "og:title", content: "Important CAP Dates & Deadlines — Maharashtra CAP Guide | MHT-CET Counselling Help" },
      {
        property: "og:description",
        content:
          "A simple student-friendly guide to Maharashtra MHT-CET CAP counselling, with college details, CAP process steps, important dates, and FAQs for students and parents.",
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
type Phase = "ongoing" | "upcoming" | "completed";
type Filter = "all" | Phase;

function endOfDay(value: string) {
  const d = new Date(value);
  d.setHours(23, 59, 59, 999);
  return d;
}

function derivePhase(item: DateRecord): Phase {
  const now = new Date();
  const start = new Date(item.start_date);
  const end = endOfDay(item.end_date);
  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    if (now > end) return "completed";
    if (now >= start) return "ongoing";
    return "upcoming";
  }
  const s = item.status.toLowerCase();
  if (s.includes("active")) return "ongoing";
  if (s.includes("upcoming")) return "upcoming";
  return "completed";
}

function isUrgent(item: DateRecord, phase: Phase) {
  if (phase !== "ongoing") return false;
  const end = endOfDay(item.end_date);
  if (Number.isNaN(end.getTime())) return false;
  const hoursLeft = (end.getTime() - Date.now()) / 3_600_000;
  return hoursLeft <= 48;
}

const phaseLabel: Record<Phase, string> = {
  ongoing: "Ongoing",
  upcoming: "Upcoming",
  completed: "Completed",
};

function badgeClass(phase: Phase, urgent: boolean) {
  if (urgent) return "border-destructive/50 bg-destructive/10 text-destructive";
  if (phase === "ongoing") return "border-aqua/50 bg-aqua/12 text-aqua";
  if (phase === "upcoming")
    return "border-amber-500/50 bg-amber-500/12 text-amber-600 dark:text-amber-400";
  return "border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300";
}

function railClass(phase: Phase, urgent: boolean) {
  if (urgent) return "bg-destructive";
  if (phase === "ongoing") return "bg-aqua";
  if (phase === "upcoming") return "bg-amber-500";
  return "bg-teal-500/70";
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

function monthKey(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Scheduled";
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function ImportantDatesPage() {
  const { data: dates } = useSuspenseQuery(datesQuery);
  const [filter, setFilter] = useState<Filter>("all");

  const enriched = useMemo(() => {
    return dates
      .map((item) => {
        const phase = derivePhase(item);
        return { item, phase, urgent: isUrgent(item, phase) };
      })
      .sort(
        (a, b) =>
          new Date(a.item.start_date).getTime() - new Date(b.item.start_date).getTime(),
      );
  }, [dates]);

  const counts = useMemo(
    () => ({
      all: enriched.length,
      ongoing: enriched.filter((e) => e.phase === "ongoing").length,
      upcoming: enriched.filter((e) => e.phase === "upcoming").length,
      completed: enriched.filter((e) => e.phase === "completed").length,
    }),
    [enriched],
  );

  const visible = enriched.filter((e) => filter === "all" || e.phase === filter);

  const months = useMemo(() => {
    const map = new Map<string, typeof visible>();
    for (const entry of visible) {
      const key = monthKey(entry.item.start_date);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [visible]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "ongoing", label: "Ongoing" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="theme-accent-night mx-auto max-w-4xl px-4 py-10">
        <PageBackground image={pageBg.url} />

        <div className="flex items-start gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            CAP date tracker
          </h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                role="note"
                aria-label="About these dates"
                className="mt-2 inline-flex cursor-help text-muted-foreground"
              >
                <Info className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Dates come from the official CAP schedule and may shift. Always confirm each
              deadline on the official notice before acting.
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Every published CAP activity in chronological order, with its round, date range
          and status.
        </p>

        <div
          role="group"
          aria-label="Filter activities by status"
          className="mt-6 flex flex-wrap gap-2"
        >
          {filters.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? "default" : "outline"}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">{counts[f.key]}</span>
            </Button>
          ))}
        </div>

        {visible.length === 0 ? (
          <Card className="mt-8 border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              No activities in this view yet.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 space-y-10">
            {months.map(([month, entries]) => (
              <section key={month}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {month}
                </h2>
                <div className="mt-3 space-y-3">
                  {entries.map(({ item, phase, urgent }) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden border-border/80 transition-shadow duration-200 hover:shadow-md"
                    >
                      <CardContent className="flex gap-0 p-0">
                        <span
                          aria-hidden="true"
                          className={`w-1.5 shrink-0 ${railClass(phase, urgent)}`}
                        />
                        <div className="flex-1 p-4 sm:p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {item.round}
                              </p>
                              <h3 className="mt-1 break-words text-base font-semibold leading-snug text-foreground">
                                {item.activity}
                              </h3>
                              <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4 shrink-0" />
                                {formatDate(item.start_date)}
                                <span className="text-border">&ndash;</span>
                                {formatDate(item.end_date)}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              <Badge variant="outline" className={badgeClass(phase, urgent)}>
                                {urgent ? (
                                  <span className="inline-flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> Closing soon
                                  </span>
                                ) : (
                                  phaseLabel[phase]
                                )}
                              </Badge>
                              {item.status ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span
                                      tabIndex={0}
                                      aria-label={`Official status: ${item.status}`}
                                      className="inline-flex cursor-help text-muted-foreground"
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Official status: {item.status}
                                  </TooltipContent>
                                </Tooltip>
                              ) : null}
                            </div>
                          </div>

                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-aqua hover:underline"
                            >
                              View Official Notice{" "}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <Disclaimer className="mt-10" />
      </div>
    </TooltipProvider>
  );
}
