import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchCollegesTool from "./tools/search-colleges";
import getCutoffsTool from "./tools/get-cutoffs";
import getImportantDatesTool from "./tools/get-important-dates";

// The OAuth issuer must be the direct Supabase host; the project ref is the
// only Supabase value that survives publish unchanged.
const projectRef =
  import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "maharashtra-cap-guide",
  title: "Maharashtra CAP Guide",
  version: "0.1.0",
  instructions:
    "Tools for Maharashtra CAP Guide, an MHT-CET engineering CAP counselling reference. Use `search_colleges` to find colleges by name, city or tier, `get_cutoffs` for a college's closing percentiles by year/branch/category/round, and `get_important_dates` for the CAP schedule.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchCollegesTool, getCutoffsTool, getImportantDatesTool],
});
