import { z } from "zod";
import { managementType, type Classification, type DirectoryCollege } from "./college-directory";
import type { ExplorerRow } from "./cutoff-explorer";
const text = z.string().trim().min(1).max(200);
export const matchProfileSchema = z
  .object({
    percentile: z.number().finite().min(0).max(100),
    category: text,
    candidatureType: text,
    homeUniversity: z.string().trim().max(200).default(""),
    branches: z.array(text).min(1, "Choose at least one preferred branch.").max(15),
    locations: z.array(text).max(20).default([]),
    instituteType: z.string().trim().max(200).default(""),
  })
  .superRefine((v, ctx) => {
    if (/home university/i.test(v.candidatureType) && !v.homeUniversity)
      ctx.addIssue({
        code: "custom",
        path: ["homeUniversity"],
        message: "Choose your Home University for university-area candidature.",
      });
    if (/state level/i.test(v.candidatureType) && v.homeUniversity)
      ctx.addIssue({
        code: "custom",
        path: ["homeUniversity"],
        message: "Home University does not apply to State Level. Select Not applicable.",
      });
  });
export type MatchProfile = z.infer<typeof matchProfileSchema>;
export type MatchCollege = DirectoryCollege & {
  official_source_url?: string | null;
  data_status?: string | null;
};
export type MatchCutoff = ExplorerRow & { data_status?: string | null };
const normalized = (v?: string | null) => (v ?? "").trim().toLowerCase();
export function matchRecords(
  input: MatchProfile,
  cutoffs: MatchCutoff[],
  colleges: MatchCollege[],
  classifications: Classification[],
) {
  const p = matchProfileSchema.parse(input);
  const best = new Map<
    string,
    MatchCutoff & {
      identifier: string;
      city: string | null;
      district: string | null;
      studentPercentile: number;
      difference: number;
      group: "Ambitious" | "Competitive" | "Safer";
    }
  >();
  const ordered = [...cutoffs].sort(
    (a, b) =>
      (b.academic_year ?? "").localeCompare(a.academic_year ?? "", undefined, { numeric: true }) ||
      (b.last_verified ?? "").localeCompare(a.last_verified ?? "") ||
      (b.cap_round ?? "").localeCompare(a.cap_round ?? "", undefined, { numeric: true }) ||
      a.id.localeCompare(b.id),
  );
  for (const r of ordered) {
    if (
      !["published", "verified"].includes(normalized(r.data_status)) ||
      !r.source_url?.trim() ||
      !r.last_verified ||
      !Number.isFinite(Date.parse(r.last_verified)) ||
      r.closing_percentile == null ||
      !Number.isFinite(r.closing_percentile) ||
      r.closing_percentile < 0 ||
      r.closing_percentile > 100 ||
      !r.branch?.trim()
    )
      continue;
    const code = normalized(r.institute_code);
    const c = colleges.find((c) =>
      code
        ? normalized(c.institute_code) === code
        : !normalized(c.institute_code) &&
          normalized(c.college_name) === normalized(r.college_name),
    );
    if (
      !c ||
      !["verified", "published"].includes(normalized(c.data_status)) ||
      !c.official_source_url?.trim() ||
      !c.last_verified ||
      !Number.isFinite(Date.parse(c.last_verified))
    )
      continue;
    if (
      r.category !== p.category ||
      r.candidature_type !== p.candidatureType ||
      !p.branches.includes(r.branch)
    )
      continue;
    if (p.locations.length && !p.locations.some((l) => l === c.city || l === c.district)) continue;
    if (p.homeUniversity) {
      if (!c.university_affiliation) continue;
      const same = c.university_affiliation === p.homeUniversity;
      if (/other than/i.test(p.candidatureType) ? same : !same) continue;
    }
    if (
      p.instituteType &&
      managementType(classifications.filter((k) => k.college_name === c.college_name)) !==
        p.instituteType
    )
      continue;
    const identifier = code || normalized(c.college_name);
    const key = identifier + "||" + normalized(r.branch);
    if (best.has(key)) continue;
    const difference = Number((p.percentile - r.closing_percentile).toFixed(4));
    best.set(key, {
      ...r,
      identifier,
      city: c.city ?? null,
      district: c.district ?? null,
      studentPercentile: p.percentile,
      difference,
      group: difference >= 1.5 ? "Safer" : difference <= -1.5 ? "Ambitious" : "Competitive",
    });
  }
  return [...best.values()].sort(
    (a, b) =>
      a.college_name.localeCompare(b.college_name) ||
      (a.branch ?? "").localeCompare(b.branch ?? ""),
  );
}
