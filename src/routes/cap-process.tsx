import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/cap-process")({
  head: () => ({
    meta: [
      { title: "CAP Process Step by Step — Maharashtra CAP Guide" },
      {
        name: "description",
        content:
          "Every stage of Maharashtra MHT-CET CAP counselling explained in order, showing what students must do and what the CAP Cell does.",
      },
      { property: "og:title", content: "CAP Process Step by Step" },
      {
        property: "og:description",
        content:
          "Registration, document verification, merit list, choice filling, allotment, seat acceptance and reporting — explained simply.",
      },
    ],
  }),
  component: CapProcessPage,
});

type Actor = "Student" | "CAP Cell";

const steps: { title: string; actor: Actor; body: string }[] = [
  {
    title: "Registration",
    actor: "Student",
    body: "Create your CAP account on the State CET Cell portal, fill personal, academic and category details carefully, upload documents and pay the application fee. Details entered here decide which seat types you are eligible for.",
  },
  {
    title: "Document verification",
    actor: "CAP Cell",
    body: "Your uploaded documents are scrutinised online, or physically at a Facilitation Centre. Claims for category, EWS, TFWS, defence, minority or reservation benefits are approved or marked for correction here.",
  },
  {
    title: "Merit list",
    actor: "CAP Cell",
    body: "A provisional merit list is published based on verified data and MHT-CET percentile. Raise grievances during the objection window; after that the final merit list with your merit number is declared.",
  },
  {
    title: "Preference / choice filling",
    actor: "Student",
    body: "Fill your college-and-branch choices in genuine order of preference and lock them. Put your most wanted option first — the system always tries to give you the highest possible preference your merit allows.",
  },
  {
    title: "CAP Round result",
    actor: "CAP Cell",
    body: "Seat allotment for the round is declared based on merit number, category, seat type and the preferences you locked.",
  },
  {
    title: "Seat acceptance",
    actor: "Student",
    body: "If a seat is allotted, accept it within the deadline and pay the seat acceptance fee online. Choose the correct option — freeze, or stay in the process for a better seat in later rounds.",
  },
  {
    title: "Reporting to institute",
    actor: "Student",
    body: "Report to the allotted institute with original documents inside the given window and complete admission formalities. Not reporting cancels the allotted seat.",
  },
  {
    title: "Further CAP rounds",
    actor: "CAP Cell",
    body: "Vacant and newly created seats go to the next CAP round, followed by institute-level rounds for any seats still unfilled. Fresh or revised preferences may be allowed for eligible candidates.",
  },
];

function CapProcessPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        The CAP process, step by step
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Centralised Admission Process (CAP) runs in fixed stages. Each step below is marked
        with who is responsible — you, or the CAP Cell.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Student action
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" /> CAP Cell action
        </span>
      </div>

      <ol className="mt-8 space-y-4 border-l border-border pl-6">
        {steps.map((step, i) => {
          const isStudent = step.actor === "Student";
          return (
            <li key={step.title} className="relative">
              <span
                className={`absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isStudent
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {i + 1}
              </span>
              <Card className="border-border/70">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-base font-semibold text-foreground">
                      {step.title}
                    </h2>
                    <Badge
                      variant="outline"
                      className={
                        isStudent
                          ? "border-primary/25 bg-primary/10 text-primary"
                          : "border-accent/30 bg-accent/15 text-accent-foreground"
                      }
                    >
                      {step.actor} action
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
