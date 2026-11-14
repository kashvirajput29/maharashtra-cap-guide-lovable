import { test, expect } from "bun:test";
import { matchProfileSchema, matchRecords } from "./matchmaker";
const c = {
  college_name: "Official College",
  institute_code: "123",
  city: "Pune",
  district: "Pune",
  university_affiliation: "University A",
  data_status: "Verified",
  official_source_url: "https://example.org",
  last_verified: "2026-08-01",
};
const r = {
  id: "1",
  college_name: c.college_name,
  institute_code: "123",
  branch: "Computer",
  category: "GOPENS",
  candidature_type: "State Level",
  closing_percentile: 90,
  data_status: "Published",
  source_url: "https://example.org",
  last_verified: "2026-08-01",
  academic_year: "2026-27",
  cap_round: "CAP Round I",
};
const p = {
  percentile: 90,
  category: "GOPENS",
  candidatureType: "State Level",
  branches: ["Computer"],
  homeUniversity: "",
  locations: [],
  instituteType: "",
};
test("high medium low use historical difference bands without predicted values", () => {
  for (const [value, group] of [
    [99, "Safer"],
    [90, "Competitive"],
    [20, "Ambitious"],
    [91.5, "Safer"],
    [88.5, "Ambitious"],
  ]) {
    const result = matchRecords({ ...p, percentile: value }, [r], [c], [])[0];
    expect(result.group).toBe(group);
    expect(result.closing_percentile).toBe(90);
    expect(result.difference).toBe(value - 90);
  }
});
test("no match and unverified records are excluded", () => {
  expect(matchRecords({ ...p, branches: ["Civil"] }, [r], [c], [])).toEqual([]);
  expect(matchRecords(p, [{ ...r, source_url: null }], [c], [])).toEqual([]);
  expect(matchRecords(p, [r], [{ ...c, last_verified: null }], [])).toEqual([]);
  expect(matchRecords({ ...p, locations: ["Mumbai"] }, [r], [c], [])).toEqual([]);
});
test("deduplication retains newest sourced institute and branch record", () => {
  const result = matchRecords(
    p,
    [
      r,
      {
        ...r,
        id: "2",
        college_name: "Renamed",
        last_verified: "2026-09-01",
        closing_percentile: 92,
      },
    ],
    [c],
    [],
  );
  expect(result.length).toBe(1);
  expect(result[0].closing_percentile).toBe(92);
});
test("schema blocks incomplete, invalid and incompatible inputs", () => {
  for (const input of [
    { ...p, percentile: 101 },
    { ...p, branches: [] },
    { ...p, category: "" },
    { ...p, homeUniversity: "University A" },
    { ...p, candidatureType: "Home University" },
  ])
    expect(matchProfileSchema.safeParse(input).success).toBe(false);
});
test("home university and sourced institute type constrain matches", () => {
  const classifications = [
    {
      college_name: c.college_name,
      official_indicator: "Government/Aided Status",
      indicator_value: "Government",
      source_url: "https://example.org",
      last_verified: "2026-08-01",
    },
  ];
  expect(
    matchRecords(
      {
        ...p,
        candidatureType: "Home University",
        homeUniversity: "University A",
        instituteType: "Government",
      },
      [{ ...r, candidature_type: "Home University" }],
      [c],
      classifications,
    ).length,
  ).toBe(1);
  expect(
    matchRecords(
      { ...p, candidatureType: "Other Than Home University", homeUniversity: "University A" },
      [{ ...r, candidature_type: "Other Than Home University" }],
      [c],
      [],
    ).length,
  ).toBe(0);
});
