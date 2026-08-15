import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, ListChecks, School, ArrowRight } from "lucide-react";
import { getHomeStats } from "@/lib/cap.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const statsQuery = queryOptions({
  queryKey: ["home-stats"],
  queryFn: () => getHomeStats(),
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
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(statsQuery);
  },
  component: Home,
});

function Home() {
  const { data: stats } = useSuspenseQuery(statsQuery);

  return (
    <div>
      <section className="border-b border-border/70 bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <span className="inline-flex items-center rounded-full border border-teal/30 bg-teal/12 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal">
            For MHT-CET students &amp; parents
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Your Maharashtra CAP Counselling, Simplified.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            MHT-CET CAP counselling can be confusing because students have to understand
            colleges, branches, cutoffs, categories, rounds and deadlines across many
            different sources. Maharashtra CAP Guide brings the important information into
            one simple place.
          </p>

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
              <Link to="/important-dates">
                <CalendarDays className="h-4 w-4" />
                Important Dates
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Colleges listed", value: stats.colleges, to: "/colleges" as const },
            { label: "Cutoff records", value: stats.cutoffs, to: "/colleges" as const },
            {
              label: "Schedule activities",
              value: stats.dates,
              to: "/important-dates" as const,
            },
          ].map((item) => (
            <Card key={item.label} className="border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-6">
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {item.value}
                </p>
                <p className="mt-1 text-base text-muted-foreground">{item.label}</p>
                <Link
                  to={item.to}
                  className="mt-4 inline-flex items-center gap-1 text-base font-semibold text-aqua hover:underline"
                >
                  Explore <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          What you can do here
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Compare colleges",
              body: "Browse colleges with city, district, university affiliation and tier, then search or filter to shortlist quickly.",
            },
            {
              title: "Read real cutoffs",
              body: "Open any college to see closing percentiles by year, branch, category and CAP round.",
            },
            {
              title: "Never miss a deadline",
              body: "Follow the CAP schedule round by round, with clear Active, Upcoming, Closed and Declared statuses.",
            },
          ].map((card) => (
            <Card key={card.title} className="border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
