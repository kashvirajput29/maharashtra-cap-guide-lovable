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
