import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, ListChecks, School, ArrowRight, ExternalLink } from "lucide-react";
import { getHomeStats, getImportantDates } from "@/lib/cap.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageBackground } from "@/components/page-background";
import { PageHero } from "@/components/page-hero";
import { ScrollReveal } from "@/components/scroll-reveal";
import { CountUp } from "@/components/count-up";
import heroHome from "@/assets/hero-campus-greenery.asset.json";
import homeBg from "@/assets/home-bg.asset.json";
import { formatScheduleDate, getScheduleStatus, isPublishedDate, type ScheduleEvent } from "@/lib/schedule";


const statsQuery = queryOptions({
  queryKey: ["home-stats"],
  queryFn: () => getHomeStats(),
});

const homeScheduleQuery = queryOptions({
  queryKey: ["important-dates"],
  queryFn: () => getImportantDates(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maharashtra CAP Guide | MHT-CET Counselling Help" },
      {
        name: "description",
        content:
          "A simple student-friendly guide to Maharashtra MHT-CET CAP counselling, with college details, CAP process steps, important dates, and FAQs for students and parents.",
      },
      {
        property: "og:title",
        content: "Maharashtra CAP Guide | MHT-CET Counselling Help",
      },
      {
        property: "og:description",
        content:
          "A simple student-friendly guide to Maharashtra MHT-CET CAP counselling, with college details, CAP process steps, important dates, and FAQs for students and parents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(statsQuery),
    context.queryClient.ensureQueryData(homeScheduleQuery),
  ]),
  component: Home,
});

function Home() {
  const { data: stats } = useSuspenseQuery(statsQuery);
  const { data: schedule } = useSuspenseQuery(homeScheduleQuery);
  const scheduleWithStatus = schedule.map((event) => ({
    event: event as ScheduleEvent,
    status: getScheduleStatus(event),
  }));
  const currentEvent = scheduleWithStatus
    .filter(({ status }) => status === "Ongoing")
    .sort((a, b) => (b.event.end_date ?? "").localeCompare(a.event.end_date ?? ""))[0];
  const nextDeadline = scheduleWithStatus
    .filter(({ event, status }) => status === "Upcoming" && isPublishedDate(event.end_date) && Boolean(event.link))
    .sort((a, b) => (a.event.end_date ?? "").localeCompare(b.event.end_date ?? ""))[0];

  const statCards = [
    {
      value: stats.colleges,
      label: "Engineering Colleges",
      sub: "Across Maharashtra",
      to: "/colleges" as const,
    },
    {
      value: stats.cutoffs,
      label: "Official Cutoff Records",
      sub: "CAP Round-wise published data",
      to: "/cutoffs" as const,
    },
    {
      value: stats.dates,
      label: "Key CAP Dates",
      sub: "Schedule, deadlines, and rounds",
      to: "/schedule" as const,
    },
  ];

  const features = [
    {
      title: "College Matchmaker",
      body: "Get personalized college recommendations based on your MHT-CET percentile, branch, and category.",
      to: "/recommend" as const,
    },
    {
      title: "Compare Colleges",
      body: `Browse ${stats.colleges} engineering colleges across Maharashtra with city, district, and affiliation.`,
      to: "/colleges" as const,
    },
    {
      title: "Check Cutoffs",
      body: "View official 2026 CAP Round II closing percentiles by branch, category, and candidature type.",
      to: "/cutoffs" as const,
    },
    {
      title: "Track Deadlines",
      body: "Follow the CAP schedule with clear Ongoing, Upcoming, and Completed statuses.",
      to: "/schedule" as const,
    },
    {
      title: "Compare Scenarios",
      body: "See how changing your category or percentile affects your college options side-by-side.",
      to: "/what-if" as const,
    },
    {
      title: "Download Your Options",
      body: "Generate a printable option form with your recommended colleges in priority order.",
      to: "/option-form" as const,
    },
  ];

  return (
    <div className="theme-accent-sunrise">
      <PageBackground image={homeBg.url} />
      <PageHero
        image={heroHome.url}
        title="Your One-Stop Guide to Navigate Maharashtra CAP Admissions with Clarity and Confidence"
        subtitle="Find the right college, understand your cutoffs, and never miss a deadline — all in one place."
      />
      <section className="border-b border-border/70 bg-gradient-to-b from-secondary/25 to-transparent">

        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <span className="inline-flex items-center rounded-full border border-teal/30 bg-teal/12 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal">
            For Every MHT-CET Aspirant, Parent, and Counsellor
          </span>


          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/colleges">
                <School className="h-4 w-4" />
                View Colleges
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/cap-process">
                <ListChecks className="h-4 w-4" />
                CAP Process
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/schedule">
                <CalendarDays className="h-4 w-4" />
                Important Dates
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {statCards.map((item, i) => (
            <ScrollReveal key={item.label} variant="fade-up" delay={(i % 3) * 100}>
              <Card className="h-full border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    <CountUp value={item.value} />
                  </p>
                  <p className="mt-1 text-base font-medium text-foreground">{item.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.sub}</p>
                  <Link
                    to={item.to}
                    className="mt-4 inline-flex items-center gap-1 text-base font-semibold text-aqua hover:underline"
                  >
                    Explore <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <ScrollReveal variant="fade-up">
          <Card className="border-border/70">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-aqua" />
                <h2 className="text-2xl font-semibold text-foreground">Current CAP Status</h2>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current active event</p>
                  <p className="mt-1 font-semibold text-foreground">{currentEvent?.event.activity ?? "No CAP round is currently ongoing."}</p>
                  {currentEvent ? <p className="mt-1 text-sm text-muted-foreground">Ends {formatScheduleDate(currentEvent.event.end_date)}</p> : null}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next upcoming verified deadline</p>
                  <p className="mt-1 font-semibold text-foreground">{nextDeadline?.event.activity ?? "No upcoming verified deadlines."}</p>
                  {nextDeadline ? <p className="mt-1 text-sm text-muted-foreground">Deadline {formatScheduleDate(nextDeadline.event.end_date)}</p> : null}
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button asChild><Link to="/schedule"><CalendarDays className="h-4 w-4" />View full schedule</Link></Button>
                <Button asChild variant="outline"><a href="https://fe2026.mahacet.org/StaticPages/HomePage" target="_blank" rel="noreferrer noopener"><ExternalLink className="h-4 w-4" />Official CET Cell source</a></Button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <ScrollReveal variant="slide-left">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            What you can do here
          </h2>
        </ScrollReveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((card, i) => (
            <ScrollReveal key={card.title} variant="fade-up" delay={(i % 3) * 100} className="h-full">
              <Card className="h-full border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="flex h-full flex-col p-6">
                  <h3 className="font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-2 flex-1 text-base leading-relaxed text-muted-foreground">
                    {card.body}
                  </p>
                  <Link
                    to={card.to}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-aqua hover:underline"
                  >
                    Open <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-4 pb-16">
        <Card className="border-border/70 bg-muted/40">
          <CardContent className="p-6 md:p-8">
            <ScrollReveal variant="slide-left">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                About this guide
              </h2>
            </ScrollReveal>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Maharashtra CAP Guide is a student-built, non-commercial reference
              tool. It is not affiliated with the Maharashtra State CET Cell, any
              university, or any college.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              All core data is sourced from official websites and documents,
              including the Maharashtra State CET Cell FE Engineering Portal (
              <a
                href="https://fe2026.mahacet.org"
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-aqua underline-offset-4 hover:underline"
              >
                fe2026.mahacet.org
              </a>
              ) and official college websites. Where official 2026 data is not
              yet published, the guide explicitly marks it as “Not published
              yet” rather than using predictions or unofficial numbers.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Users are encouraged to cross-check critical information
              (especially cutoffs, deadlines, and admission procedures) directly
              on the CET Cell portal and the official websites of the relevant
              colleges or universities.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link to="/about">Read our methodology</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
