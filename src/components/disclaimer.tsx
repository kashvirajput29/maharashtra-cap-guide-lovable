const DISCLAIMER_TEXT =
  "Maharashtra CAP Guide is an independent student guidance website and is not affiliated with or operated by the Maharashtra State CET Cell or Directorate of Technical Education, Maharashtra. Students should verify important admission dates, notices, seat allotments and official instructions on the official CET Cell / DTE websites before taking admission-related action.";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <aside
      aria-label="Disclaimer"
      className={`rounded-lg border border-border/70 bg-muted/40 px-4 py-3 ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Disclaimer
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {DISCLAIMER_TEXT}
      </p>
    </aside>
  );
}
