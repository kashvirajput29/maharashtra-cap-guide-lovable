import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "green" | "blue" | "gray" | "red" | "amber";

const toneClass: Record<Tone, string> = {
  green:
    "border-emerald-500/45 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  blue: "border-sky-500/45 bg-sky-500/12 text-sky-700 dark:text-sky-300",
  gray: "border-border bg-muted text-muted-foreground",
  red: "border-red-500/45 bg-red-500/12 text-red-700 dark:text-red-300",
  amber: "border-amber-500/45 bg-amber-500/12 text-amber-700 dark:text-amber-400",
};

const dotClass: Record<Tone, string> = {
  green: "bg-emerald-500",
  blue: "bg-sky-500",
  gray: "bg-muted-foreground/60",
  red: "bg-red-500",
  amber: "bg-amber-500",
};

const base =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold transition-transform duration-200 hover:scale-105";

/** Normalises a free-text status into a tone + animation decision. */
export function statusTone(status: string): { tone: Tone; pulse: boolean } {
  const s = status.toLowerCase();
  if (s.includes("ongoing") || s.includes("active") || s.includes("in process"))
    return { tone: "green", pulse: true };
  if (s.includes("upcoming") || s.includes("scheduled"))
    return { tone: "blue", pulse: true };
  if (s.includes("not published")) return { tone: "gray", pulse: false };
  if (s.includes("published")) return { tone: "green", pulse: false };
  return { tone: "gray", pulse: false };
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  const s = status.toLowerCase();
  const { tone, pulse } = statusTone(status);
  const text = label ?? status;

  const icon =
    s.includes("not published") ? (
      <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
    ) : s.includes("published") ? (
      <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
    ) : (
      <span
        aria-hidden="true"
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          dotClass[tone],
          pulse && "status-pulse",
        )}
      />
    );

  return (
    <span className={cn(base, toneClass[tone], className)}>
      {icon}
      {text}
    </span>
  );
}

/** Safe / Moderate / Ambitious recommendation badge. */
export function RiskBadge({
  label,
  className,
}: {
  label: "Safe" | "Moderate" | "Ambitious";
  className?: string;
}) {
  const tone: Tone =
    label === "Safe" ? "green" : label === "Moderate" ? "amber" : "red";
  return (
    <span className={cn(base, toneClass[tone], className)}>
      <span
        aria-hidden="true"
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          dotClass[tone],
          label === "Ambitious" && "status-pulse-soft",
        )}
      />
      {label}
    </span>
  );
}
