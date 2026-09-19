// Slice 693 E2E scenarios into 8 balanced intent-based category CSVs.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = join(__dirname, '..', 'e2e_tester', 'e2e_test_report.csv');
const OUT = join(__dirname, 'slices');

function parseCSV(src) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"') { if (src[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else {
      if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}
function ser(r) { return r.map(x => { const s = String(x ?? ''); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(','); }

const rows = parseCSV(readFileSync(CSV_PATH, 'utf8'));
const header = rows[0];
const data = rows.slice(1).filter(r => r[1] && r[1].startsWith('Scenario'));

// Extract intent from name like "Scenario N: <Intent> - ..."
function intent(name) { const m = name.match(/^Scenario \d+: ([^-]+?)\s*-/); return m ? m[1].trim() : 'Unknown'; }

// 8 slice definitions, ordered — first match wins
const SLICES = [
  { key: '01_booking_flow',        intents: new Set(['Booking','Booking_No_Service_Named','Booking_Cancel_Text','Booking_Then_Complaint','Booking_Confirm_Services_Check','Late_Slot_5Pm','Late_Slot_6Pm','Late_Slot_8Pm']) },
  { key: '02_modification_reschedule', intents: new Set(['Modification']) },
  { key: '03_pricing_payment',      intents: new Set(['Discount','Payment_Method']) },
  { key: '04_complaint_escalation', intents: new Set(['Complaint','Refund','Legal_Threat','Emergency_Legal','Abusive_Language']) },
  { key: '05_guardrails_privacy',   intents: new Set(['Out_Of_Bounds','Off_Topic','Privacy_Refusal','Otp_Sharing','Aadhaar_Pan_Sharing']) },
  { key: '06_intent_multi_part',    intents: new Set(['Vague','Multi_Part','Repeated_Question','Nudge_Repeat_Test']) },
  { key: '07_facts_service_info',   intents: new Set(['Address','Home_Pickup','Google_Maps_Link','Service_Duration','Multi_Service_Feasibility','Process_Question','Competitor_Comparison','Working_Hour_Deflection','Headlight_Restoration']) },
  // Everything else lands in slice 08
];

const buckets = new Map(SLICES.map(s => [s.key, []]));
buckets.set('08_media_meta_edge', []);

for (const r of data) {
  const it = intent(r[1]);
  let placed = false;
  for (const s of SLICES) {
    if (s.intents.has(it)) { buckets.get(s.key).push(r); placed = true; break; }
  }
  if (!placed) buckets.get('08_media_meta_edge').push(r);
}

const summary = [];
for (const [key, rs] of buckets) {
  const out = [ser(header), ...rs.map(ser)].join('\n') + '\n';
  writeFileSync(join(OUT, key + '.csv'), out, 'utf8');
  const kb = (out.length / 1024).toFixed(1);
  summary.push({ slice: key, rows: rs.length, kb });
}
console.log('Slice sizes:');
for (const s of summary) console.log(`  ${s.slice}: ${s.rows} rows, ${s.kb} KB`);
console.log('Total placed:', summary.reduce((a, b) => a + b.rows, 0));
