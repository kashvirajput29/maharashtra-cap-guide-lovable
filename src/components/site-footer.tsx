import { Disclaimer } from "./disclaimer";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Maharashtra CAP Guide</p>
        <p className="mt-2 max-w-2xl leading-relaxed">
          An independent guidance resource for MHT-CET engineering CAP counselling. Always
          confirm schedules, rules and cutoffs with the official State CET Cell website
          before taking any decision.
        </p>
        <a
          href="https://cetcell.mahacet.org"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-block font-medium text-aqua underline-offset-4 hover:underline"
        >
          cetcell.mahacet.org
        </a>
        <Disclaimer className="mt-6 max-w-4xl" />
      </div>
    </footer>
  );
}

