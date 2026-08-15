import { Info } from "lucide-react";

export function CutoffNote({ className }: { className?: string }) {
  return (
    <div
      className={`flex gap-3 rounded-lg border border-border/70 bg-secondary/30 p-4 text-sm text-muted-foreground ${className ?? ""}`}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />
      <p className="leading-relaxed">
        Cutoff note: Previous cutoffs are only a reference, not a guarantee of admission.
        Actual allotment depends on percentile, category, candidature type, preferences, seat
        availability, and CAP-round rules.
      </p>
    </div>
  );
}
