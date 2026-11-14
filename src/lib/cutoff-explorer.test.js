import { test, expect } from 'bun:test';
import { enrichCutoffs, filterCutoffs, comparePercentile, cutoffCsv } from './cutoff-explorer';
const row = {id:'1',college_name:'College A',institute_code:'123',branch:'Computer',academic_year:'2026',cap_round:'Round 1',category:'GOPENS',candidature_type:'State',closing_percentile:90,last_verified:'2026-08-01',source_url:'https://example.org/official'};
test('all eight filters combine with search and deduplication respects official code', () => {
  const rows = enrichCutoffs([row,{...row,id:'2',college_name:'Renamed'}, {...row,id:'3',category:'LOPENS'}],[{college_name:'College A',institute_code:'123',district:'Pune'}],[{college_name:'College A',official_indicator:'Government/Aided Status',indicator_value:'Government',source_url:'https://example.org',last_verified:'2026-08-01'}]);
  expect(rows.length).toBe(2);
  expect(filterCutoffs(rows,'college',{academic_year:'2026',cap_round:'Round 1',college_name:'College A',branch:'Computer',category:'GOPENS',candidature_type:'State',district:'Pune',institute_type:'Government'},'college_name').length).toBe(1);
  expect(filterCutoffs(rows,'college',{district:'Mumbai'},'college_name').length).toBe(0);
});
test('comparison is arithmetic and handles band boundaries and invalid input', () => {
  expect(comparePercentile('91',90)).toEqual({difference:1,label:'Higher than cutoff'});
  expect(comparePercentile('89',90).label).toBe('Lower than cutoff');
  expect(comparePercentile('90.5',90).label).toBe('Near cutoff');
  expect(comparePercentile('89.5',90).label).toBe('Near cutoff');
  expect(comparePercentile('101',90)).toBeNull();
  expect(comparePercentile('',90)).toBeNull();
  expect(comparePercentile('90',null)).toBeNull();
});
test('all sorting fields order concrete values correctly', () => {
  const rows = [row,{...row,id:'2',college_name:'College B',branch:'Civil',cap_round:'Round 2',closing_percentile:95,last_verified:'2026-09-01'},{...row,id:'3',college_name:'College C',cap_round:'Round 10',last_verified:null}];
  expect(filterCutoffs(rows,'',{},'college_name')[0].id).toBe('1');
  expect(filterCutoffs(rows,'',{},'branch')[0].id).toBe('2');
  expect(filterCutoffs(rows,'',{},'closing_percentile')[0].id).toBe('2');
  expect(filterCutoffs(rows,'',{},'cap_round').map(r=>r.id)).toEqual(['1','2','3']);
  expect(filterCutoffs(rows,'',{},'last_verified').map(r=>r.id)).toEqual(['2','1','3']);
});
test('CSV retains verified values and escapes quotes and spreadsheet formulas', () => {
  const csv = cutoffCsv([{...row,college_name:'=unsafe',branch:'A "quoted" branch'}]);
  expect(csv).toContain('"\'=unsafe"');
  expect(csv).toContain('"A ""quoted"" branch"');
  expect(csv).toContain('"90"');
  expect(csv.split('\r\n').length).toBe(2);
});