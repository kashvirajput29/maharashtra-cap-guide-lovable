import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Check = {
  id: string;
  label: string;
  detail: string;
  count: number;
  samples: string[];
};

const CUTOFF_KEY_FIELDS =
  "Institute code + Branch + Academic year + CAP round + Category + Candidature type";

/**
 * Admin-only live data-quality audit. Runs as the signed-in user (RLS applies)
 * and refuses to return anything unless that user holds the `admin` role.
 */
export const getDataQualityReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase;

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    const [collegesRes, cutoffsRes, datesRes] = await Promise.all([
      supabase
        .from("colleges_official_2026")
        .select(
          "id, institute_code, college_name, city, district, university_affiliation, branches_offered, official_website_url, official_source_url, last_verified, data_status",
        ),
      supabase
        .from("cutoffs_official_2026")
        .select(
          "id, institute_code, college_name, academic_year, cap_round, branch, category, candidature_type, closing_percentile, source_url, last_verified, data_status",
        )
        .limit(5000),
      supabase
        .from("important_dates")
        .select("id, activity, round, start_date, end_date, status, link"),
    ]);
    if (collegesRes.error) throw new Error(collegesRes.error.message);
    if (cutoffsRes.error) throw new Error(cutoffsRes.error.message);
    if (datesRes.error) throw new Error(datesRes.error.message);

    const colleges = collegesRes.data ?? [];
    const cutoffs = cutoffsRes.data ?? [];
    const dates = datesRes.data ?? [];

    const blank = (v: unknown) => typeof v !== "string" || v.trim() === "";
    const identity = (r: { institute_code?: string | null; college_name: string }) =>
      (r.institute_code?.trim() || r.college_name.trim()).toLowerCase();

    const groupDupes = <T>(rows: T[], key: (r: T) => string, label: (r: T) => string) => {
      const map = new Map<string, string[]>();
      for (const r of rows) {
        const k = key(r);
        map.set(k, [...(map.get(k) ?? []), label(r)]);
      }
      return [...map.entries()].filter(([, v]) => v.length > 1);
    };

    const collegeDupes = groupDupes(colleges, identity, (r) => r.college_name);
    const cutoffDupes = groupDupes(
      cutoffs,
      (r) =>
        [
          identity(r),
          r.branch ?? "",
          r.academic_year ?? "",
          r.cap_round ?? "",
          r.category ?? "",
          r.candidature_type ?? "",
        ]
          .join("||")
          .toLowerCase(),
      (r) => `${r.college_name} — ${r.branch ?? "?"} / ${r.category ?? "?"}`,
    );

    const brokenColleges = colleges.filter(
      (r) => blank(r.college_name) || blank(r.city) || blank(r.university_affiliation) || blank(r.branches_offered),
    );
    const brokenCutoffs = cutoffs.filter(
      (r) =>
        blank(r.college_name) ||
        blank(r.branch) ||
        blank(r.academic_year) ||
        r.closing_percentile === null,
    );
    const brokenDates = dates.filter(
      (r) => blank(r.activity) || blank(r.round) || blank(r.start_date) || blank(r.end_date),
    );

    const mk = (
      id: string,
      label: string,
      detail: string,
      rows: string[],
    ): Check => ({ id, label, detail, count: rows.length, samples: rows.slice(0, 8) });

    const checks: Check[] = [
      mk(
        "dup-colleges",
        "Duplicate colleges",
        "Identity = official institute code (falls back to college name until codes are published).",
        collegeDupes.map(([, names]) => `${names[0]} (${names.length} rows)`),
      ),
      mk(
        "dup-cutoffs",
        "Duplicate cutoff records",
        `Uniqueness key: ${CUTOFF_KEY_FIELDS}.`,
        cutoffDupes.map(([, labels]) => `${labels[0]} (${labels.length} rows)`),
      ),
      mk(
        "missing-college-codes",
        "Colleges missing an institute code",
        "Official AICTE/DTE institute code not yet published in our dataset.",
        colleges.filter((r) => blank(r.institute_code)).map((r) => r.college_name),
      ),
      mk(
        "missing-cutoff-codes",
        "Cutoff records missing an institute code",
        "Cutoff rows that cannot yet be keyed by official institute code.",
        cutoffs.filter((r) => blank(r.institute_code)).map((r) => `${r.college_name} — ${r.branch ?? "?"}`),
      ),
      mk(
        "missing-college-sources",
        "Colleges missing an official source URL",
        "Every college record should link to the official document it was verified against.",
        colleges.filter((r) => blank(r.official_source_url)).map((r) => r.college_name),
      ),
      mk(
        "missing-cutoff-sources",
        "Cutoff records missing a source URL",
        "Every cutoff record should link to the official CAP cutoff document.",
        cutoffs.filter((r) => blank(r.source_url)).map((r) => `${r.college_name} — ${r.branch ?? "?"}`),
      ),
      mk(
        "missing-college-verified",
        "Colleges missing a verification date",
        "last_verified is empty.",
        colleges.filter((r) => blank(r.last_verified)).map((r) => r.college_name),
      ),
      mk(
        "missing-cutoff-verified",
        "Cutoff records missing a verification date",
        "last_verified is empty.",
        cutoffs.filter((r) => blank(r.last_verified)).map((r) => `${r.college_name} — ${r.branch ?? "?"}`),
      ),
      mk(
        "broken-colleges",
        "Broken or empty college records",
        "Missing name, city, affiliation or branches.",
        brokenColleges.map((r) => r.college_name || r.id),
      ),
      mk(
        "broken-cutoffs",
        "Broken or empty cutoff records",
        "Missing college, branch, academic year or closing percentile.",
        brokenCutoffs.map((r) => `${r.college_name || r.id} — ${r.branch ?? "?"}`),
      ),
      mk(
        "broken-dates",
        "Broken or empty important-date records",
        "Missing activity, round, start or end date.",
        brokenDates.map((r) => r.activity || r.id),
      ),
    ];

    return {
      generatedAt: new Date().toISOString(),
      totals: {
        colleges: colleges.length,
        cutoffs: cutoffs.length,
        dates: dates.length,
        distinctColleges: new Set(colleges.map(identity)).size,
      },
      cutoffKeyFields: CUTOFF_KEY_FIELDS,
      checks,
    };
  });
