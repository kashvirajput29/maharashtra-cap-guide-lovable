import { createFileRoute, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarDays, Download, ExternalLink, Info, RotateCcw } from "lucide-react";
import { getImportantDates } from "@/lib/cap.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Disclaimer } from "@/components/disclaimer";
import { StatusBadge } from "@/components/status-badge";
import { PageBackground } from "@/components/page-background";
import { PageHero } from "@/components/page-hero";
import {
  downloadCalendarEvent,
  formatScheduleDate,
  getScheduleStatus,
  isPublishedDate,
  SCHEDULE_STATUSES,
  type ScheduleEvent,
  type ScheduleStatus,
} from "@/lib/schedule";
import pageHero from "@/assets/hero-sunrise-study-by-lake.asset.json";
import pageBg from "@/assets/important-dates-bg.asset.json";

export const datesQuery = queryOptions({
  queryKey: ["important-dates"],
  queryFn: () => getImportantDates(),
});

export const Route = createFileRoute("/important-dates")({
  head: () => ({
    meta: [
      { title: "Important CAP Dates & Deadlines — Maharashtra CAP Guide | MHT-CET Counselling Help" },
      { name: "description", content: "Track official Maharashtra MHT-CET CAP dates with automatically calculated status, sources, and calendar reminders." },
      { property: "og:title", content: "Important CAP Dates & Deadlines — Maharashtra CAP Guide" },
      { property: "og:description", content: "Track official Maharashtra MHT-CET CAP dates, deadlines, and current status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(datesQuery),
  component: ImportantDatesPage,
  errorComponent: DatesError,
});

function DatesError() {
  const router = useRouter();
  return <div className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-2xl font-semibold text-foreground">Couldn&apos;t load the schedule</h1><p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p><Button className="mt-4" onClick={() => router.invalidate()}>Try again</Button></div>;
}

type FilterStatus = "All" | ScheduleStatus;

function monthKey(value: string | null) {
  if (!isPublishedDate(value)) return "Dates not published";
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function ImportantDatesPage() {
  const { data: dates } = useSuspenseQuery(datesQuery);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [roundFilter, setRoundFilter] = useState("All");

  const enriched = useMemo(() => dates.map((item) => ({
    item: item as ScheduleEvent,
    status: getScheduleStatus(item),
  })).sort((a, b) => {
    if (!isPublishedDate(a.item.start_date)) return 1;
    if (!isPublishedDate(b.item.start_date)) return -1;
    return a.item.start_date.localeCompare(b.item.start_date);
  }), [dates]);

  const rounds = useMemo(() => Array.from(new Set(dates.map((item) => item.round).filter(Boolean))).sort(), [dates]);
  const visible = enriched.filter(({ item, status }) =>
    (statusFilter === "All" || status === statusFilter) &&
    (roundFilter === "All" || item.round === roundFilter));
  const groups = useMemo(() => {
    const map = new Map<string, typeof visible>();
    for (const entry of visible) map.set(monthKey(entry.item.start_date), [...(map.get(monthKey(entry.item.start_date)) ?? []), entry]);
    return Array.from(map.entries());
  }, [visible]);
  const clearFilters = () => { setStatusFilter("All"); setRoundFilter("All"); };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="theme-accent-night mx-auto max-w-4xl px-4 py-10">
        <PageBackground image={pageBg.url} />
        <PageHero className="-mt-10 mb-8" image={pageHero.url} title="CAP date tracker" subtitle="Follow official CAP dates with one automatically calculated status for every activity." />
        <div className="flex items-start gap-2">
          <h2 className="text-2xl font-semibold text-foreground">Schedule</h2>
          <Tooltip><TooltipTrigger asChild><span tabIndex={0} className="mt-2 inline-flex cursor-help text-muted-foreground"><Info className="h-4 w-4" /></span></TooltipTrigger><TooltipContent className="max-w-xs">Statuses use today&apos;s date in Maharashtra and each published start and end date.</TooltipContent></Tooltip>
        </div>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">Confirm critical deadlines using the official source shown on every activity.</p>

        <div className="mt-6 grid gap-3 rounded-xl border bg-card/90 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <label className="space-y-1.5 text-sm font-medium text-foreground">Status
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All statuses</SelectItem>{SCHEDULE_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select>
          </label>
          <label className="space-y-1.5 text-sm font-medium text-foreground">CAP round
            <Select value={roundFilter} onValueChange={setRoundFilter}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All rounds</SelectItem>{rounds.map((round) => <SelectItem key={round} value={round}>{round}</SelectItem>)}</SelectContent></Select>
          </label>
          <Button type="button" variant="outline" className="h-11 self-end" onClick={clearFilters} disabled={statusFilter === "All" && roundFilter === "All"}><RotateCcw className="h-4 w-4" />Clear filters</Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Showing {visible.length} of {dates.length} events</p>

        {visible.length === 0 ? <Card className="mt-8 border-dashed"><CardContent className="p-10 text-center text-sm text-muted-foreground">No schedule events match these filters.</CardContent></Card> : (
          <div className="mt-8 space-y-10">
            {groups.map(([month, entries]) => <section key={month}><h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{month}</h2><div className="mt-3 space-y-3">
              {entries.map(({ item, status }) => {
                const calendarEnabled = status !== "Not published yet";
                return <Card key={item.id} className="overflow-hidden border-border/80"><CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-xs font-medium uppercase text-muted-foreground">{item.round}</p><h3 className="mt-1 break-words text-base font-semibold leading-snug text-foreground">{item.activity}</h3></div><StatusBadge status={status} /></div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div><dt className="text-muted-foreground">Start date</dt><dd className="mt-0.5 font-medium text-foreground">{formatScheduleDate(item.start_date)}</dd></div>
                    <div><dt className="text-muted-foreground">End date</dt><dd className="mt-0.5 font-medium text-foreground">{formatScheduleDate(item.end_date)}</dd></div>
                    <div><dt className="text-muted-foreground">Last checked</dt><dd className="mt-0.5 font-medium text-foreground">{formatScheduleDate(item.last_checked)}</dd></div>
                  </dl>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button asChild size="sm" variant="outline" className="w-full sm:w-auto"><a href={item.link} target="_blank" rel="noreferrer noopener"><ExternalLink className="h-4 w-4" />Official source</a></Button>
                    {calendarEnabled ? <Button type="button" size="sm" variant="secondary" className="w-full sm:w-auto" onClick={() => downloadCalendarEvent(item)}><Download className="h-4 w-4" />Add to calendar</Button> : null}
                  </div>
                </CardContent></Card>;
              })}
            </div></section>)}
          </div>
        )}
        <Disclaimer className="mt-10" />
      </div>
    </TooltipProvider>
  );
}