export type DirectoryCollege = {
  institute_code?: string | null;
  college_name: string;
  city?: string | null;
  district?: string | null;
  university_affiliation?: string | null;
  last_verified?: string | null;
  management_type?: string | null;
};
export type BranchRecord = {
  institute_code?: string | null;
  college_name: string;
  branch?: string | null;
  data_status?: string | null;
  source_url?: string | null;
  last_verified?: string | null;
  closing_percentile?: number | null;
};
export function verifiedBranches(college: DirectoryCollege, rows: BranchRecord[]) {
  const code = college.institute_code?.trim();
  return [...new Set(rows.filter((r) => {
    const matches = code ? r.institute_code?.trim() === code : r.college_name === college.college_name;
    return matches && ["published", "verified"].includes((r.data_status ?? "").toLowerCase())
      && Boolean(r.source_url?.trim() && r.last_verified?.trim() && r.branch?.trim())
      && r.closing_percentile != null;
  }).map((r) => r.branch?.trim() ?? ""))].sort();
}
export type Classification = { college_name?: string; official_indicator?: string | null; indicator_value?: string | null; source_url?: string | null; last_verified?: string | null };
export function managementType(rows: Classification[]) {
  return rows.find((r) => /management|government\/aided|institute type/i.test(r.official_indicator ?? "") && r.source_url?.trim() && r.last_verified?.trim())?.indicator_value?.trim() || null;
}
export type DirectoryFilters = { search: string; city: string; district: string; affiliation: string; management?: string; branches: string[]; sort: string };
export function filterDirectory<T extends DirectoryCollege>(colleges: T[], rows: BranchRecord[], filters: DirectoryFilters): T[] {
  const query = filters.search.trim().toLowerCase();
  return colleges.filter((c) =>
    c.college_name.toLowerCase().includes(query)
    && (filters.city === "all" || c.city === filters.city)
    && (filters.district === "all" || c.district === filters.district)
    && (filters.affiliation === "all" || c.university_affiliation === filters.affiliation)
    && (!filters.management || filters.management === "all" || (filters.management === "Autonomous" ? /\bautonomous\b/i.test(c.management_type ?? "") : c.management_type === filters.management))
    && (filters.branches.length === 0 || filters.branches.some((b) => verifiedBranches(c, rows).includes(b)))
  ).sort((a, b) => {
    if (filters.sort === "verified") {
      const date = (value?: string | null) => value && Number.isFinite(Date.parse(value)) ? Date.parse(value) : -Infinity;
      const left = date(a.last_verified), right = date(b.last_verified);
      if (left !== right) return left > right ? -1 : 1;
    } else if (filters.sort === "city" || filters.sort === "district") {
      const field = filters.sort;
      const left = a[field]?.trim(), right = b[field]?.trim();
      if (!left && right) return 1;
      if (left && !right) return -1;
      const order = (left ?? "").localeCompare(right ?? "");
      if (order) return order;
    }
    return a.college_name.localeCompare(b.college_name);
  });
}