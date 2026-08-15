import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_cutoffs",
  title: "Get cutoffs",
  description:
    "Get MHT-CET CAP closing percentile cutoffs for a college, optionally filtered by year, branch, category or CAP round.",
  inputSchema: {
    college_name: z
      .string()
      .describe("Exact college name as returned by search_colleges."),
    year: z.number().int().optional().describe("CAP year, e.g. 2024."),
    branch: z.string().optional().describe("Branch name, e.g. Computer Engineering."),
    category: z.string().optional().describe("Reservation category, e.g. OPEN or OBC."),
    round: z.string().optional().describe("CAP round, e.g. Round 1."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ college_name, year, branch, category, round }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let builder = supabase
      .from("cutoffs")
      .select("college_name, year, branch, category, round, closing_percentile")
      .eq("college_name", college_name)
      .order("year", { ascending: false })
      .limit(500);

    if (year !== undefined) builder = builder.eq("year", year);
    if (branch) builder = builder.eq("branch", branch);
    if (category) builder = builder.eq("category", category);
    if (round) builder = builder.eq("round", round);

    const { data, error } = await builder;
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data || data.length === 0)
      return {
        content: [
          { type: "text", text: "No cutoff data available for the selected filters." },
        ],
        structuredContent: { count: 0, cutoffs: [] },
      };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { count: data.length, cutoffs: data },
    };
  },
});
