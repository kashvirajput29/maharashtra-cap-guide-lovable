import { queryOptions } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { getOfficialCollege } from "@/lib/cap.functions";

export const collegeQuery = (collegeName: string) =>
  queryOptions({
    queryKey: ["college-official-2026", collegeName],
    queryFn: async () => {
      const result = await getOfficialCollege({ data: { collegeName } });
      if (!result.college) throw notFound();
      return result;
    },
  });
