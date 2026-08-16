import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageBackground } from "@/components/page-background";
import pageBg from "@/assets/faqs-bg.asset.json";

const faqs = [
  {
    q: "What is MHT-CET CAP counselling?",
    a: "CAP (Centralised Admission Process) is the common admission process run by the Maharashtra State CET Cell. Instead of applying to each college separately, you register once, get a merit number, fill your college-and-branch preferences, and seats are allotted centrally based on your merit, category, and seat availability.",
  },
  {
    q: "What is a CAP round?",
    a: "A CAP round is one stage of seat allotment. In each round, the system allots available seats to candidates based on their merit and locked preferences. If seats remain vacant after a round, they are carried forward to the next round.",
  },
  {
    q: "What is choice filling?",
    a: "Choice filling is where you list the college-and-branch combinations you want, in your true order of preference, and lock them. The system always tries to give you the highest preference your merit allows, so order your choices honestly.",
  },
  {
    q: "What is a provisional merit list?",
    a: "The provisional merit list is a draft ranking published before the final list. You should check your merit number, category, and other details. If you spot a mistake, you can raise an objection during the given window.",
  },
  {
    q: "What does closing percentile mean?",
    a: "Closing percentile is the percentile of the last candidate who got a seat in a particular college, branch, category, and round. It is only a historical indicator and changes every year based on applicants, seats, and preferences.",
  },
  {
    q: "What is the difference between OPEN and reserved categories?",
    a: "OPEN seats are filled purely on merit and are open to all candidates. Reserved categories such as SC, ST, OBC, EWS, and others have a fixed percentage of seats as per state policy. You need valid, verified certificates to claim a reserved seat.",
  },
  {
    q: "What happens after seat allotment?",
    a: "If you are allotted a seat, accept it online within the deadline, pay the seat acceptance fee, and choose whether to freeze the seat or continue for a better option. Then report to the allotted institute with original documents.",
  },
  {
    q: "Can I participate in later CAP rounds?",
    a: "Yes, if you are eligible and have not taken admission or frozen a seat, you can usually participate in later rounds. Each round may open a fresh preference window where you can update your choices.",
  },
  {
    q: "What happens if I do not get a seat?",
    a: "If you do not get a seat in one round, your application remains active for the next round. You can update your preferences and try again. Any remaining seats may also be filled through institute-level rounds.",
  },
  {
    q: "Where should I verify official CAP dates?",
    a: "Always verify official dates and notices on the Maharashtra State CET Cell website (cetcell.mahacet.org) or the official CAP portal for the current admission year. This site helps you understand the process, but the official notification is final.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "MHT-CET CAP Counselling FAQ — Maharashtra CAP Guide | MHT-CET Counselling Help" },
      {
        name: "description",
        content:
          "A simple student-friendly guide to Maharashtra MHT-CET CAP counselling, with college details, CAP process steps, important dates, and FAQs for students and parents.",
      },
      { property: "og:title", content: "MHT-CET CAP Counselling FAQ — Maharashtra CAP Guide | MHT-CET Counselling Help" },
      {
        property: "og:description",
        content:
          "A simple student-friendly guide to Maharashtra MHT-CET CAP counselling, with college details, CAP process steps, important dates, and FAQs for students and parents.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="theme-accent-coffee mx-auto max-w-3xl px-4 py-10">
      <PageBackground image={pageBg.url} />
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Frequently asked questions
      </h1>
      <p className="mt-2 text-base leading-relaxed text-muted-foreground sm:text-lg">
        Simple answers to the questions students and parents ask most about
        Maharashtra MHT-CET CAP counselling.
      </p>

      <Accordion type="single" collapsible className="mt-8">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.q} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
