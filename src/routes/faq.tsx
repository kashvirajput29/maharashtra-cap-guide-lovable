import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "MHT-CET CAP Counselling FAQ — Maharashtra CAP Guide" },
      {
        name: "description",
        content:
          "Answers to 10 common questions about Maharashtra MHT-CET CAP counselling: rounds, merit lists, choice filling, percentiles and categories.",
      },
      { property: "og:title", content: "MHT-CET CAP Counselling FAQ" },
      {
        property: "og:description",
        content:
          "Clear answers on CAP rounds, merit lists, choice filling, closing percentiles and reserved categories.",
      },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "What is CAP counselling?",
    a: "CAP (Centralised Admission Process) is the common admission process run by the Maharashtra State CET Cell. Instead of applying college by college, you register once, get a merit number, fill your college-and-branch preferences, and seats are allotted centrally based on merit, category and seat availability.",
  },
  {
    q: "What is the difference between CAP Round 1 and Round 2?",
    a: "Round 1 allots seats from the full pool of available seats to all eligible candidates in the final merit list. Round 2 works on the seats left vacant after Round 1 — including seats released by candidates who did not accept or report. Because the seat pool shrinks, cutoffs in later rounds usually move, and eligible candidates normally get a fresh preference-filling window.",
  },
  {
    q: "What is a CAP merit list?",
    a: "The merit list ranks all verified candidates using MHT-CET percentile and the tie-breaking rules. A provisional list is published first so you can raise objections about your data; the final list then gives you the merit number used for every allotment.",
  },
  {
    q: "What is choice filling?",
    a: "Choice filling (preference filling) is where you list the college-and-branch combinations you want, in your true order of preference, and lock them. The allotment engine always tries to give you the highest preference your merit number and category can reach, so ordering honestly matters more than guessing cutoffs.",
  },
  {
    q: "Can I change my preferences?",
    a: "Yes, but only while the preference-filling window for that round is open and before you lock your choices. Once the window closes, the locked list is final for that round. Later rounds usually open a fresh window where you can add, remove or reorder options.",
  },
  {
    q: "What happens if I do not get my first preference?",
    a: "You are considered for your next preferences in order, so you may be allotted a lower choice. You can accept that seat and continue to later rounds hoping for a better option, or accept and freeze it. Nothing is lost by listing an ambitious first preference — it is only tried first.",
  },
  {
    q: "What does a closing percentile mean?",
    a: "The closing percentile is the percentile of the last candidate who got a seat in that college, branch, category and round. It is a historical indicator, not a guaranteed threshold — it changes every year with the number of applicants, seat intake and preference patterns.",
  },
  {
    q: "What is the difference between OPEN and reserved categories?",
    a: "OPEN seats are available to all candidates on pure merit. Reserved categories (such as SC, ST, VJ/DT, NT, OBC, SEBC, EWS) have seats set aside as per state policy, and their cutoffs are computed separately. Claiming a reserved seat requires valid, verified certificates; without them you are considered under OPEN only.",
  },
  {
    q: "What happens after seat allotment?",
    a: "You must accept the allotted seat online within the deadline, pay the seat acceptance fee, choose whether to freeze or stay in the process, and then report to the institute with your original documents. Missing any of these steps cancels the allotment.",
  },
  {
    q: "Where should students verify official dates?",
    a: "Always verify on the State CET Cell website (cetcell.mahacet.org) and the official CAP portal notices for the current admission year. This site organises the information for easier understanding, but the official notification is always the final word.",
  },
];

function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Frequently asked questions
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        The questions students and parents ask most about Maharashtra MHT-CET CAP
        counselling.
      </p>

      <Accordion type="single" collapsible className="mt-8">
        {faqs.map((faq) => (
          <AccordionItem key={faq.q} value={faq.q}>
            <AccordionTrigger className="text-left text-base font-medium">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
