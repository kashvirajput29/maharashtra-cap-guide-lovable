import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function getPublicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export const getColleges = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("colleges")
    .select(
      "id, college_name, city, district, university_affiliation, tier_tag, short_description",
    )
    .order("college_name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getCollege = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ collegeName: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    const supabase = getPublicClient();
    const [collegeRes, cutoffRes] = await Promise.all([
      supabase
        .from("colleges")
        .select(
          "id, college_name, city, district, university_affiliation, branches_offered, tier_tag, website_link, short_description",
        )
        .eq("college_name", input.collegeName)
        .maybeSingle(),
      supabase
        .from("cutoffs")
        .select("id, year, branch, category, round, closing_percentile")
        .eq("college_name", input.collegeName)
        .order("year", { ascending: false }),
    ]);

    if (collegeRes.error) throw new Error(collegeRes.error.message);
    if (cutoffRes.error) throw new Error(cutoffRes.error.message);

    return { college: collegeRes.data, cutoffs: cutoffRes.data ?? [] };
  });

export const getImportantDates = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("important_dates")
    .select("id, activity, round, start_date, end_date, status, link")
    .order("start_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

/**
 * Single source of truth for the headline counts shown across the site.
 * Every number is read live from the official tables — nothing is hard-coded.
 */
export const getHomeStats = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const [colleges, verified, cutoffs, dates] = await Promise.all([
    supabase.from("colleges_official_2026").select("*", { count: "exact", head: true }),
    supabase
      .from("colleges_official_2026")
      .select("*", { count: "exact", head: true })
      .eq("data_status", "Verified"),
    supabase
      .from("cutoffs_official_2026")
      .select("*", { count: "exact", head: true })
      .eq("data_status", "Published")
      .not("closing_percentile", "is", null),
    supabase.from("important_dates").select("*", { count: "exact", head: true }),
  ]);
  if (colleges.error) throw new Error(colleges.error.message);
  if (cutoffs.error) throw new Error(cutoffs.error.message);
  if (dates.error) throw new Error(dates.error.message);
  return {
    colleges: colleges.count ?? 0,
    verifiedColleges: verified.count ?? 0,
    cutoffs: cutoffs.count ?? 0,
    dates: dates.count ?? 0,
  };
});

/* ---------- Official 2026 verified data (source of truth) ---------- */

const COLLEGE_COLUMNS =
  "id, institute_code, college_name, city, district, university_affiliation, branches_offered, official_website_url, official_source_url, last_verified, data_status";

const CUTOFF_COLUMNS =
  "id, institute_code, college_name, academic_year, cap_round, branch, category, candidature_type, closing_percentile, source_url, last_verified, data_status";

/** Defensive de-duplication so a stray duplicate row can never surface twice. */
function dedupeBy<T>(rows: T[], key: (row: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    const k = key(row);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(row);
  }
  return out;
}

/** Unique identity of a college: official institute code when known, else name. */
export function collegeKey(row: { institute_code?: string | null; college_name: string }) {
  return (row.institute_code?.trim() || row.college_name.trim()).toLowerCase();
}

/** Unique identity of a cutoff record (official CAP key). */
export function cutoffKey(row: {
  institute_code?: string | null;
  college_name: string;
  branch?: string | null;
  academic_year?: string | null;
  cap_round?: string | null;
  category?: string | null;
  candidature_type?: string | null;
}) {
  return [
    row.institute_code?.trim() || row.college_name.trim(),
    row.branch ?? "",
    row.academic_year ?? "",
    row.cap_round ?? "",
    row.category ?? "",
    row.candidature_type ?? "",
  ]
    .join("||")
    .toLowerCase();
}

export const getOfficialColleges = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("colleges_official_2026")
    .select(COLLEGE_COLUMNS)
    .order("college_name", { ascending: true });
  if (error) throw new Error(error.message);
  return dedupeBy(data ?? [], collegeKey);
});

export const getOfficialCollege = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ collegeName: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    const supabase = getPublicClient();
    const [collegeRes, cutoffRes, classRes] = await Promise.all([
      supabase
        .from("colleges_official_2026")
        .select(COLLEGE_COLUMNS)
        .eq("college_name", input.collegeName)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("cutoffs_official_2026")
        .select(CUTOFF_COLUMNS)
        .eq("college_name", input.collegeName)
        .neq("data_status", "Not published yet")
        .not("closing_percentile", "is", null)
        .order("branch", { ascending: true }),
      supabase
        .from("college_classifications_verified")
        .select(
          "id, official_indicator, indicator_value, source_url, last_verified, classification_status",
        )
        .eq("college_name", input.collegeName)
        .order("official_indicator", { ascending: true }),
    ]);

    if (collegeRes.error) throw new Error(collegeRes.error.message);
    if (cutoffRes.error) throw new Error(cutoffRes.error.message);
    if (classRes.error) throw new Error(classRes.error.message);

    return {
      college: collegeRes.data,
      cutoffs: dedupeBy(cutoffRes.data ?? [], cutoffKey),
      classifications: dedupeBy(
        classRes.data ?? [],
        (r) => `${r.official_indicator ?? ""}||${r.indicator_value ?? ""}`.toLowerCase(),
      ),
    };
  });

export const getOfficialCutoffs = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("cutoffs_official_2026")
    .select(CUTOFF_COLUMNS)
    .eq("data_status", "Published")
    .not("closing_percentile", "is", null)
    .order("closing_percentile", { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);
  return dedupeBy(data ?? [], cutoffKey);
});

export const getPostCapUpdates = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("post_cap_updates_official")
    .select(
      "id, college_name, update_title, update_type, status, published_date, notice_url, last_verified",
    )
    .order("college_name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPostCapUpdatesPage = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({ page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(50).default(10) })
      .parse(input ?? {}),
  )
  .handler(async ({ data: input }) => {
    const supabase = getPublicClient();
    const from = (input.page - 1) * input.pageSize;
    const { data, error, count } = await supabase
      .from("post_cap_updates_official")
      .select(
        "id, college_name, update_title, update_type, status, published_date, notice_url, last_verified",
        { count: "exact" },
      )
      .order("college_name", { ascending: true })
      .range(from, from + input.pageSize - 1);
    if (error) throw new Error(error.message);
    return { rows: data ?? [], total: count ?? 0, page: input.page, pageSize: input.pageSize };
});

/* ---------- College recommendation (rule-based) ---------- */

export const getRecommendOptions = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const [collegeRes, cutoffRes] = await Promise.all([
    supabase.from("colleges_official_2026").select("district, university_affiliation"),
    supabase
      .from("cutoffs_official_2026")
      .select("branch, candidature_type")
      .ilike("academic_year", "%2026%")
      .eq("data_status", "Published"),
  ]);
  if (collegeRes.error) throw new Error(collegeRes.error.message);
  if (cutoffRes.error) throw new Error(cutoffRes.error.message);

  const uniq = (values: (string | null)[]) =>
    Array.from(new Set(values.filter((v): v is string => !!v && v.trim() !== ""))).sort();

  return {
    districts: uniq((collegeRes.data ?? []).map((r) => r.district)),
    universities: uniq((collegeRes.data ?? []).map((r) => r.university_affiliation)),
    branches: uniq((cutoffRes.data ?? []).map((r) => r.branch)),
    candidatureTypes: uniq((cutoffRes.data ?? []).map((r) => r.candidature_type)),
  };
});

export const getRecommendations = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        percentile: z.number().min(0).max(100),
        category: z.string().min(1).max(40),
        candidatureType: z.string().min(1).max(80),
        branches: z.array(z.string().min(1).max(120)).min(1).max(15),
        districts: z.array(z.string().min(1).max(80)).max(20).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data: input }) => {
    const supabase = getPublicClient();
    const [cutoffRes, collegeRes] = await Promise.all([
      supabase
        .from("cutoffs_official_2026")
        .select(
          "id, college_name, academic_year, cap_round, branch, category, candidature_type, closing_percentile, source_url",
        )
        .ilike("academic_year", "%2026%")
        .eq("data_status", "Published")
        .ilike("candidature_type", input.candidatureType)
        .not("closing_percentile", "is", null),
      supabase
        .from("colleges_official_2026")
        .select("college_name, city, district"),
    ]);
    if (cutoffRes.error) throw new Error(cutoffRes.error.message);
    if (collegeRes.error) throw new Error(collegeRes.error.message);

    const collegeMap = new Map(
      (collegeRes.data ?? []).map((c) => [c.college_name, c] as const),
    );
    const categoryToken = input.category.trim().toUpperCase();
    const wanted = input.branches.map((b) => b.toLowerCase().trim()).filter(Boolean);
    const districtSet = new Set(input.districts.map((d) => d.toLowerCase().trim()));

    type Row = {
      key: string;
      collegeName: string;
      city: string | null;
      district: string | null;
      branch: string;
      capRound: string | null;
      closingPercentile: number;
      label: "Safe" | "Moderate" | "Ambitious";
    };

    const best = new Map<string, Row>();

    for (const row of cutoffRes.data ?? []) {
      const branch = (row.branch ?? "").toLowerCase();
      if (!branch) continue;
      const matches = wanted.some((w) => branch.includes(w) || w.includes(branch));
      if (!matches) continue;

      const rowCategory = (row.category ?? "").toUpperCase();
      if (categoryToken !== "OTHER" && !rowCategory.includes(categoryToken)) continue;

      const college = collegeMap.get(row.college_name);
      if (districtSet.size > 0) {
        const d = (college?.district ?? "").toLowerCase();
        if (!d || !districtSet.has(d)) continue;
      }

      const cp = Number(row.closing_percentile);
      if (!Number.isFinite(cp)) continue;

      const label: Row["label"] =
        input.percentile >= cp + 1.5
          ? "Safe"
          : input.percentile > cp - 1.5
            ? "Moderate"
            : "Ambitious";

      const key = `${row.college_name}||${row.branch}`;
      const existing = best.get(key);
      if (!existing || cp < existing.closingPercentile) {
        best.set(key, {
          key,
          collegeName: row.college_name,
          city: college?.city ?? null,
          district: college?.district ?? null,
          branch: row.branch!,
          capRound: row.cap_round ?? null,
          closingPercentile: cp,
          label,
        });
      }
    }

    const order = { Safe: 0, Moderate: 1, Ambitious: 2 } as const;
    return Array.from(best.values())
      .sort(
        (a, b) =>
          order[a.label] - order[b.label] || b.closingPercentile - a.closingPercentile,
      )
      .slice(0, 20);
  });

/* ---------- What-If simulator (two-scenario comparison) ---------- */

export const getWhatIfScenario = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        percentile: z.number().min(0).max(100),
        category: z.string().min(1).max(40),
        candidatureType: z.string().min(1).max(80),
        branches: z.array(z.string().min(1).max(120)).min(1).max(15),
        districts: z.array(z.string().min(1).max(80)).max(20).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data: input }) => {
    const supabase = getPublicClient();
    const [cutoffRes, collegeRes] = await Promise.all([
      supabase
        .from("cutoffs_official_2026")
        .select(
          "id, college_name, academic_year, cap_round, branch, category, candidature_type, closing_percentile, source_url",
        )
        .ilike("academic_year", "%2026%")
        .eq("data_status", "Published")
        .ilike("candidature_type", input.candidatureType)
        .not("closing_percentile", "is", null),
      supabase
        .from("colleges_official_2026")
        .select("college_name, city, district"),
    ]);
    if (cutoffRes.error) throw new Error(cutoffRes.error.message);
    if (collegeRes.error) throw new Error(collegeRes.error.message);

    const collegeMap = new Map(
      (collegeRes.data ?? []).map((c) => [c.college_name, c] as const),
    );
    const categoryToken = input.category.trim().toUpperCase();
    const wanted = input.branches.map((b) => b.toLowerCase().trim()).filter(Boolean);
    const districtSet = new Set(input.districts.map((d) => d.toLowerCase().trim()));

    type Row = {
      key: string;
      collegeName: string;
      city: string | null;
      district: string | null;
      branch: string;
      capRound: string | null;
      closingPercentile: number;
      label: "Safe" | "Moderate" | "Ambitious";
    };

    const best = new Map<string, Row>();

    for (const row of cutoffRes.data ?? []) {
      const branch = (row.branch ?? "").toLowerCase();
      if (!branch) continue;
      const matches = wanted.some((w) => branch.includes(w) || w.includes(branch));
      if (!matches) continue;

      const rowCategory = (row.category ?? "").toUpperCase();
      if (categoryToken !== "OTHER" && !rowCategory.includes(categoryToken)) continue;

      const college = collegeMap.get(row.college_name);
      if (districtSet.size > 0) {
        const d = (college?.district ?? "").toLowerCase();
        if (!d || !districtSet.has(d)) continue;
      }

      const cp = Number(row.closing_percentile);
      if (!Number.isFinite(cp)) continue;

      const label: Row["label"] =
        input.percentile >= cp + 1.5
          ? "Safe"
          : input.percentile > cp - 1.5
            ? "Moderate"
            : "Ambitious";

      const key = `${row.college_name}||${row.branch}`;
      const existing = best.get(key);
      if (!existing || cp < existing.closingPercentile) {
        best.set(key, {
          key,
          collegeName: row.college_name,
          city: college?.city ?? null,
          district: college?.district ?? null,
          branch: row.branch!,
          capRound: row.cap_round ?? null,
          closingPercentile: cp,
          label,
        });
      }
    }

    const counts = { Safe: 0, Moderate: 0, Ambitious: 0 };
    for (const row of best.values()) {
      counts[row.label]++;
    }

    const topSafe = Array.from(best.values())
      .filter((r) => r.label === "Safe")
      .sort((a, b) => b.closingPercentile - a.closingPercentile)
      .slice(0, 5);

    return { counts, topSafe, total: best.size };
  });
