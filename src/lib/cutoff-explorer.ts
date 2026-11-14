import { managementType, type Classification, type DirectoryCollege } from './college-directory';

export type ExplorerRow = {
  id: string; institute_code?: string | null; college_name: string;
  branch?: string | null; academic_year?: string | null; cap_round?: string | null;
  category?: string | null; candidature_type?: string | null;
  closing_percentile?: number | null; source_url?: string | null; last_verified?: string | null;
  district?: string | null; institute_type?: string | null;
};
export function enrichCutoffs<T extends ExplorerRow>(rows: T[], colleges: DirectoryCollege[], classifications: Classification[]) {
  const seen = new Set<string>();
  return rows.filter(r => {
    const key = JSON.stringify([r.institute_code?.trim() || r.college_name.trim(), r.branch, r.academic_year, r.cap_round, r.category, r.candidature_type].map(v => (v ?? '').trim().toLowerCase()));
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).map(r => {
    const code = r.institute_code?.trim();
    const college = colleges.find(c => code ? c.institute_code?.trim() === code : !c.institute_code?.trim() && c.college_name.trim().toLowerCase() === r.college_name.trim().toLowerCase());
    return { ...r, district: college?.district ?? null, institute_type: managementType(classifications.filter(c => c.college_name === (college?.college_name ?? r.college_name))) };
  });
}
export const FILTER_FIELDS = ['academic_year', 'cap_round', 'college_name', 'branch', 'category', 'candidature_type', 'district', 'institute_type'] as const;
export type FilterField = typeof FILTER_FIELDS[number];
export function filterCutoffs<T extends ExplorerRow>(rows: T[], search: string, filters: Partial<Record<FilterField, string>>, sort: string) {
  return rows.filter(r => r.college_name.toLowerCase().includes(search.trim().toLowerCase()) && FILTER_FIELDS.every(k => !filters[k] || r[k] === filters[k])).sort((a,b) => {
    if (sort === 'closing_percentile') return (b.closing_percentile ?? -Infinity) - (a.closing_percentile ?? -Infinity) || a.college_name.localeCompare(b.college_name);
    if (sort === 'last_verified') {
      const date = (v?: string | null) => v && Number.isFinite(Date.parse(v)) ? Date.parse(v) : -Infinity;
      const left = date(a.last_verified), right = date(b.last_verified);
      if (left !== right) return left > right ? -1 : 1;
    }
    const field = sort === 'branch' ? 'branch' : sort === 'cap_round' ? 'cap_round' : 'college_name';
    return (a[field] ?? '').localeCompare(b[field] ?? '', undefined, { numeric: true }) || a.college_name.localeCompare(b.college_name);
  });
}
// Near is an arithmetic display band, not a probability or admission prediction.
export function comparePercentile(input: string, cutoff?: number | null) {
  if (!input.trim() || cutoff == null || !Number.isFinite(cutoff)) return null;
  const value = Number(input);
  if (!Number.isFinite(value) || value < 0 || value > 100) return null;
  const difference = Number((value - cutoff).toFixed(4));
  return { difference, label: Math.abs(difference) <= 0.5 ? 'Near cutoff' : difference > 0 ? 'Higher than cutoff' : 'Lower than cutoff' };
}
export function cutoffCsv(rows: ExplorerRow[]) {
  const columns = ['college_name','institute_code','branch','closing_percentile','category','candidature_type','cap_round','academic_year','source_url','last_verified'] as const;
  const cell = (value: unknown) => {
    let text = value == null || value === '' ? 'Not published yet' : String(value);
    if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  return '\uFEFF' + [columns.join(','), ...rows.map(r => columns.map(k => cell(r[k])).join(','))].join('\r\n');
}