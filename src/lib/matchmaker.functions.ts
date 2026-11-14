import { createServerFn } from "@tanstack/react-start";
import { matchProfileSchema, matchRecords } from "./matchmaker";
export const getMatchmakerData = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicMatchData } = await import("./matchmaker.server");
  return getPublicMatchData();
});
export const findVerifiedMatches = createServerFn({ method: "POST" })
  .inputValidator((input) => matchProfileSchema.parse(input))
  .handler(async ({ data }) => {
    const { getPublicMatchData } = await import("./matchmaker.server");
    const records = await getPublicMatchData();
    return matchRecords(data, records.cutoffs, records.colleges, records.classifications);
  });
