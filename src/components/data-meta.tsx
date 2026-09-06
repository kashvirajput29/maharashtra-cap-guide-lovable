import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ALLOWED = ["Verified", "Awaiting verification", "Not published yet"] as const;
type Allowed = (typeof ALLOWED)[number];

function normalizeStatus(status?: string | null): Allowed | null {
  const s = (status ?? "").trim().toLowerCase();
  if (!s) return null;
  if (s === "verified" || s === "published") return "Verified";
  if (s === "not published yet") return "Not published yet";
  if (s === "awaiting verification") return "Awaiting verification";
  return null;
}

export function DataStatusBadge({ status }: { status: string | null | undefined }) {
  const value = normalizeStatus(status);
  if (!value) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Awaiting verification
      </Badge>
    );
  }
  const tone =
    value === "Verified"
      ? "border-teal/40 bg-teal/12 text-teal"
      : value === "Awaiting verification"
        ? "border-amber-500/40 bg-amber-500/12 text-amber-600 dark:text-amber-400"
        : "border-border bg-muted text-muted-foreground";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}>{value}</span>;
}

/**
 * Data-provenance strip: official institute code, data status, last verified
 * date and official source URL. Missing values render an explicit
 * "not published" / "not recorded" state — never invented data.
 */
export function DataMeta({
  instituteCode,
  status,
  lastVerified,
  sourceUrl,
  className = "",
}: {
  instituteCode: string | null | undefined;
  status: string | null | undefined;
  lastVerified: string | null | undefined;
  sourceUrl: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground ${className}`}>
      <span>
        Institute code:{" "}
        <span className="font-medium text-foreground">
          {instituteCode?.trim() ? instituteCode : "Not published yet"}
        </span>
      </span>
      <DataStatusBadge status={status} />
      <span>Last verified: {lastVerified ?? "Not recorded"}</span>
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 font-medium text-aqua hover:underline"
        >
          Official source <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span>Official source not recorded</span>
      )}
    </div>
  );
}
