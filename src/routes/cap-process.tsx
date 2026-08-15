import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Step = {
  title: string;
  studentAction: string;
  whatHappensNext: string;
};

const steps: Step[] = [
  {
    title: "CAP Registration",
    studentAction:
      "Create your CAP account on the State CET Cell portal. Fill in your personal details, academic information, category, and reservation claims. Upload the required documents and pay the registration fee.",
    whatHappensNext:
      "You receive login credentials and your application moves to document verification. The details you enter now decide which seat types you are eligible for.",
  },
  {
    title: "Document Verification",
    studentAction:
      "Visit the assigned Facilitation Centre with original documents, or complete online verification as instructed. Carry proof for category, EWS, TFWS, defence, minority, or other reservation claims.",
    whatHappensNext:
      "The CAP Cell verifies your documents. If everything is correct, you are marked eligible. If corrections are needed, you get a window to fix them.",
  },
  {
    title: "Provisional Merit List",
    studentAction:
      "Check the provisional merit list and confirm your merit number, category, and reservation status. Report any mistakes or missing details during the objection window.",
    whatHappensNext:
      "Submitted objections are reviewed. The final merit list is prepared after all corrections are processed.",
  },
  {
    title: "Final Merit List",
    studentAction:
      "Download the final merit list and note your final merit number and category rank. This rank is used for seat allotment.",
    whatHappensNext:
      "Choice filling opens. You can now enter your preferred colleges and branches in order of priority.",
  },
  {
    title: "Preference / Choice Filling",
    studentAction:
      "Log in and enter your college-and-branch preferences in genuine order of preference. Lock your choices before the deadline and take a printout for reference.",
    whatHappensNext:
      "The CAP Cell runs the seat allotment process based on your merit, category, seat type, and locked preferences.",
  },
  {
    title: "CAP Seat Allotment",
    studentAction:
      "Check the CAP round allotment result. See whether you have been allotted a college, branch, and seat category.",
    whatHappensNext:
      "If you receive a seat, proceed to seat acceptance and fee payment within the given deadline. If not, you can wait for the next round.",
  },
  {
    title: "Seat Acceptance",
    studentAction:
      "If allotted a seat, accept it online and pay the seat acceptance fee. Choose the correct option: freeze the seat, or stay in the process hoping for a better seat in later rounds.",
    whatHappensNext:
      "After accepting, you must report to the allotted institute with original documents to complete admission.",
  },
  {
    title: "Reporting to Institute",
    studentAction:
      "Report physically to the allotted institute within the deadline with all original documents. Complete the admission formalities and pay the remaining fees.",
    whatHappensNext:
      "Your admission is confirmed. If you do not report in time, the allotted seat may be cancelled.",
  },
  {
    title: "Further CAP Rounds",
    studentAction:
      "If you did not get a seat or want a better option, participate in further CAP rounds as per your eligibility. Update preferences if allowed.",
    whatHappensNext:
      "Vacant seats are filled in subsequent rounds. Any remaining seats may move to institute-level counselling.",
  },
];

export const Route = createFileRoute("/cap-process")({
  head: () => ({
    meta: [
      { title: "CAP Process Step by Step — Maharashtra CAP Guide" },
      {
        name: "description",
        content:
          "Every stage of Maharashtra MHT-CET CAP counselling explained in order: registration, verification, merit lists, choice filling, seat allotment, acceptance, reporting and further rounds.",
      },
      { property: "og:title", content: "CAP Process Step by Step" },
      {
        property: "og:description",
        content:
          "A simple vertical timeline of the MHT-CET CAP counselling stages, showing what students must do and what happens next.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CapProcessPage,
});

function CapProcessPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="space-y-3">
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/10 text-primary"
        >
          For first-time MHT-CET students
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          The CAP process, step by step
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Centralised Admission Process (CAP) runs in fixed stages. Follow the
          timeline below to understand what you need to do at each step and what
          happens next.
        </p>
      </div>

      <ol className="relative mt-10 space-y-8 border-l border-border pl-7 sm:pl-9">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.title} className="relative">
              <span
                className="absolute -left-[39px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-bold text-primary-foreground shadow-sm sm:-left-[47px] sm:h-9 sm:w-9 sm:text-sm"
                aria-label={`Step ${stepNumber}`}
              >
                {stepNumber}
              </span>

              <Card className="overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                          {step.title}
                        </h2>
                        <Badge
                          variant="outline"
                          className="border-primary/25 bg-primary/10 text-primary"
                        >
                          Student action
                        </Badge>
                      </div>

                      <div className="grid gap-4 rounded-xl bg-muted/40 p-4 sm:p-5">
                        <div>
                          <h3 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            What you do
                          </h3>
                          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {step.studentAction}
                          </p>
                        </div>

                        <div className="border-t border-border/60 pt-4">
                          <h3 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            What happens next
                          </h3>
                          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {step.whatHappensNext}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isLast && (
                <div className="absolute -bottom-6 left-0 h-6 w-px bg-border sm:-bottom-7" />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-10 rounded-xl border border-border/80 bg-muted/30 p-5 text-center text-sm text-muted-foreground">
        <p>
          Tip: Always download and save a copy of every form, receipt, merit
          list, and allotment result. Missing a deadline can cancel your seat.
        </p>
      </div>
    </div>
  );
}
