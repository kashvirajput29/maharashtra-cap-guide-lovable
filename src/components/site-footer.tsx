export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Maharashtra CAP Guide</p>
        <p className="mt-3 max-w-4xl leading-relaxed">
          Disclaimer: Maharashtra CAP Guide is an independent student-built MVP created by
          Kashvi Rajput for the Outskill AI for Students Bootcamp. It currently includes a
          curated sample of 50 engineering colleges in Maharashtra. Information is for
          guidance only and may be incomplete or change. Always verify eligibility,
          documents, dates, seat availability, cutoffs, and admission decisions on the{" "}
          <a
            href="https://fe2026.mahacet.org/"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-aqua underline-offset-4 hover:underline"
          >
            official Maharashtra State CET Cell CAP portal
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

