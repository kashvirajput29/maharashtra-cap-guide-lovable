import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_colleges",
  title: "Search colleges",
  description:
    "Search Maharashtra engineering colleges participating in MHT-CET CAP counselling. Optionally filter by name text, city or tier tag (Top Tier, Good Tier, Emerging).",
  inputSchema: {
    query: z.string().optional().describe("Text to match against the college name."),
    city: z.string().optional().describe("Exact city name, e.g. Mumbai or Pune."),
    tier: z
      .string()
      .optional()
      .describe("Tier tag: Top Tier, Good Tier or Emerging."),
    limit: z.number().int().optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, city, tier, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let builder = supabase
      .from("colleges")
      .select(
        "college_name, city, district, university_affiliation, tier_tag, branches_offered, website_link, short_description",
      )
      .order("college_name", { ascending: true })
      .limit(Math.min(Math.max(limit ?? 25, 1), 100));

    if (query) builder = builder.ilike("college_name", `%${query}%`);
    if (city) builder = builder.eq("city", city);
    if (tier) builder = builder.eq("tier_tag", tier);

    const { data, error } = await builder;
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { count: data?.length ?? 0, colleges: data ?? [] },
    };
  },
});
