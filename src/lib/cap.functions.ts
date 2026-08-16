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

export const getHomeStats = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const [colleges, cutoffs, dates] = await Promise.all([
    supabase.from("colleges").select("*", { count: "exact", head: true }),
    supabase.from("cutoffs").select("*", { count: "exact", head: true }),
    supabase.from("important_dates").select("*", { count: "exact", head: true }),
  ]);
  return {
    colleges: colleges.count ?? 0,
    cutoffs: cutoffs.count ?? 0,
    dates: dates.count ?? 0,
  };
});

/* ---------- Official 2026 verified data (source of truth) ---------- */

export const getOfficialColleges = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("colleges_official_2026")
    .select(
      "id, college_name, city, district, university_affiliation, branches_offered, official_website_url, official_source_url, last_verified",
    )
    .order("college_name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getOfficialCollege = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ collegeName: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    const supabase = getPublicClient();
    const [collegeRes, cutoffRes, classRes] = await Promise.all([
      supabase
        .from("colleges_official_2026")
        .select(
          "id, college_name, city, district, university_affiliation, branches_offered, official_website_url, official_source_url, last_verified",
        )
        .eq("college_name", input.collegeName)
        .maybeSingle(),
      supabase
        .from("cutoffs_official_2026")
        .select(
          "id, academic_year, cap_round, branch, category, candidature_type, closing_percentile, source_url, last_verified, data_status",
        )
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
      cutoffs: cutoffRes.data ?? [],
      classifications: classRes.data ?? [],
    };
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
