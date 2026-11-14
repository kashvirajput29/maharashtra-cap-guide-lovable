import { createClient } from "@supabase/supabase-js";
export async function getPublicMatchData() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Official data connection unavailable");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
          headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const [a, b, c] = await Promise.all([
    client
      .from("cutoffs_official_2026")
      .select(
        "id,institute_code,college_name,academic_year,cap_round,branch,category,candidature_type,closing_percentile,source_url,last_verified,data_status",
      )
      .eq("data_status", "Published")
      .not("source_url", "is", null)
      .not("last_verified", "is", null)
      .not("closing_percentile", "is", null),
    client
      .from("colleges_official_2026")
      .select(
        "college_name,institute_code,city,district,university_affiliation,official_source_url,last_verified,data_status",
      ),
    client
      .from("college_classifications_verified")
      .select("college_name,official_indicator,indicator_value,source_url,last_verified"),
  ]);
  if (a.error || b.error || c.error) throw new Error("Could not load verified records.");
  return { cutoffs: a.data ?? [], colleges: b.data ?? [], classifications: c.data ?? [] };
}
