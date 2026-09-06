import { queryOptions } from "@tanstack/react-query";
import { getHomeStats } from "@/lib/cap.functions";

/**
 * Single shared source of truth for every count shown in the UI
 * (colleges, cutoff records, schedule entries). Never hard-code these.
 */
export const statsQuery = queryOptions({
  queryKey: ["home-stats"],
  queryFn: () => getHomeStats(),
  staleTime: 60_000,
});
