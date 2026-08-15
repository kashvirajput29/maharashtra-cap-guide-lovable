import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_important_dates",
  title: "Get important dates",
  description:
    "Get the MHT-CET CAP counselling schedule: activities with round, start date, end date, status and official notice link.",
  inputSchema: {
    round: z.string().optional().describe("Filter to one CAP round, e.g. Round 1."),
    status: z.string().optional().describe("Filter by status, e.g. Active or Upcoming."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ round, status }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let builder = supabase.from("important_dates").select("*").limit(500);
    if (round) builder = builder.eq("round", round);
    if (status) builder = builder.eq("status", status);

    const { data, error } = await builder;
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { count: data?.length ?? 0, dates: data ?? [] },
    };
  },
});
