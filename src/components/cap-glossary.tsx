import { useState } from "react";
import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const TERMS = [
  { term: "CAP", full: "Centralised Admission Process" },
  { term: "MHT-CET", full: "Maharashtra Health & Technical Common Entrance Test" },
  { term: "CET Cell", full: "Maharashtra State Common Entrance Test Cell" },
  { term: "DTE", full: "Directorate of Technical Education, Maharashtra" },
  { term: "ARC", full: "Application Receipt Centre (document verification centre)" },
  { term: "FC", full: "Facilitation Centre for form filling and scrutiny" },
  { term: "HU", full: "Home University (candidature within your own university region)" },
  { term: "OHU", full: "Other Than Home University candidature" },
  { term: "AI", full: "All India seat quota" },
  { term: "ACAP / ILS", full: "Institute Level Seats filled after CAP rounds" },
  { term: "TFWS", full: "Tuition Fee Waiver Scheme seats" },
] as const;

export function CapGlossary() {
  const [open, setOpen] = useState(false);

  return (
    <div className="print:hidden">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5"
          aria-label="Open CAP glossary"
        >
          <BookOpen className="h-4 w-4" /> CAP Glossary
        </button>
      ) : (
        <div className="fixed bottom-5 right-5 z-50 w-[min(22rem,calc(100vw-2.5rem))] rounded-2xl border border-border bg-card p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">CAP Glossary</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close glossary"
              className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <dl className="mt-3 max-h-[50vh] space-y-2.5 overflow-y-auto pr-1 text-sm">
            {TERMS.map((t) => (
              <div key={t.term}>
                <dt className="font-semibold text-foreground">{t.term}</dt>
                <dd className="text-muted-foreground">{t.full}</dd>
              </div>
            ))}
          </dl>
          <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
            Got it
          </Button>
        </div>
      )}
    </div>
  );
}
