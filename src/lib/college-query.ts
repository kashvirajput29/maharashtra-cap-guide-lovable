import { queryOptions } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { getOfficialCollege } from "@/lib/cap.functions";

export const collegeQuery = (collegeIdentifier: string) =>
  queryOptions({
    queryKey: ["college-official-2026", collegeIdentifier],
    queryFn: async () => {
      const result = await getOfficialCollege({ data: { collegeIdentifier } });
      if (!result.college) throw notFound();
      return result;
    },
  });
