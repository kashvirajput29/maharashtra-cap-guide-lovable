import { describe, expect, test } from "bun:test";
import { filterDirectory, verifiedBranches, managementType } from "./college-directory.ts";
const colleges = [
  { college_name: "Zeta", institute_code: "123", city: "Pune", district: "Pune", university_affiliation: "University A", last_verified: "2026-08-16" },
  { college_name: "Alpha", city: "Mumbai", district: "Mumbai", university_affiliation: "University B", last_verified: "2026-09-20" },
  { college_name: "Beta", city: "Pune", district: "Pune", university_affiliation: "University A", last_verified: null },
];
const base = { data_status: "Published", source_url: "https://fe2026.mahacet.org", last_verified: "2026-08-16", closing_percentile: 90 };
const records = [
  { ...base, college_name: "Old name", institute_code: "123", branch: "Computer Engineering" },
  { ...base, college_name: "Old name", institute_code: "123", branch: "Computer Engineering" },
  { ...base, college_name: "Zeta", institute_code: "999", branch: "Civil Engineering" },
  { ...base, college_name: "Alpha", branch: "Civil Engineering" },
  { ...base, college_name: "Beta", branch: "Mechanical Engineering", last_verified: null },
];
const filters = { search: "", city: "all", district: "all", affiliation: "all", branches: [], sort: "verified" };
describe("College directory rules", () => {
  test("management uses sourced classifications only; autonomous must be explicit", () => {
    const row = { official_indicator: "Government/Aided Status", indicator_value: "Government Un-Aided Autonomous", source_url: base.source_url, last_verified: base.last_verified };
    expect(managementType([row])).toBe("Government Un-Aided Autonomous");
    expect(managementType([{ ...row, source_url: null }])).toBeNull();
    expect(filterDirectory([{ ...colleges[0], management_type: row.indicator_value }, colleges[1]], records, { ...filters, management: "Autonomous" }).length).toBe(1);
  });
  test("official code matches despite name change, counts distinct verified branches only", () => {
    expect(verifiedBranches(colleges[0], records)).toEqual(["Computer Engineering"]);
    expect(verifiedBranches(colleges[2], records)).toEqual([]);
  });
  test("name fallback works only when college code is absent", () => expect(verifiedBranches(colleges[1], records)).toEqual(["Civil Engineering"]));
  test("search, city, district, affiliation and branch combine with AND", () => {
    expect(filterDirectory(colleges, records, { ...filters, search: "Zet", city: "Pune", district: "Pune", affiliation: "University A", branches: ["Computer Engineering"] }).map((c) => c.college_name)).toEqual(["Zeta"]);
    expect(filterDirectory(colleges, records, { ...filters, search: "Zet", city: "Mumbai" })).toEqual([]);
  });
  test("multi-selected branches match any selected branch", () => expect(filterDirectory(colleges, records, { ...filters, branches: ["Computer Engineering", "Civil Engineering"] }).length).toBe(2));
  test("default recent verification sorts descending with missing dates last", () => expect(filterDirectory(colleges, records, filters).map((c) => c.college_name)).toEqual(["Alpha", "Zeta", "Beta"]));
  test("name, city and district sort alphabetically", () => {
    for (const sort of ["name", "city", "district"]) expect(filterDirectory(colleges, records, { ...filters, sort }).map((c) => c.college_name)).toEqual(["Alpha", "Beta", "Zeta"]);
  });
});