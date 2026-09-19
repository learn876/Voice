// Merge 8 findings JSON files into a ranked master table
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '.agents/findings';
const files = readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
const all = [];
for (const f of files) {
  try {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const arr = Array.isArray(raw) ? raw : (raw.defects || raw.findings || []);
    for (const x of arr) {
      x.__slice = f.replace('.json', '');
      x.severity = String(x.severity || '').toUpperCase();
      x.pattern = x.pattern || x.title || '';
      x.evidence = x.evidence || x.affected_scenarios || [];
      x.frequency = x.frequency ?? x.affected_count ?? (Array.isArray(x.evidence) ? x.evidence.length : undefined);
      x.demo_blocking = x.demo_blocking ?? (x.severity === 'CRITICAL');
      all.push(x);
    }
  } catch (e) {
    console.warn(`Skipped ${f}: ${e.message}`);
  }
}

const sev = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
all.sort((a, b) => (sev[b.severity] || 0) - (sev[a.severity] || 0)
                 || (b.demo_blocking ? 1 : 0) - (a.demo_blocking ? 1 : 0)
                 || (b.frequency || 0) - (a.frequency || 0));

const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
for (const x of all) counts[x.severity] = (counts[x.severity] || 0) + 1;

const md = [];
md.push('# Failure Triage v2 — Independent 693-Scenario Analysis');
md.push('');
md.push(`_Generated 2026-09-19. Slices: ${files.length}. Total defects: ${all.length}._`);
md.push('');
md.push(`- **CRITICAL**: ${counts.CRITICAL||0}`);
md.push(`- **HIGH**: ${counts.HIGH||0}`);
md.push(`- **MEDIUM**: ${counts.MEDIUM||0}`);
md.push(`- **LOW**: ${counts.LOW||0}`);
md.push('');
md.push('## Master Defect Table (severity DESC, demo-blocking first)');
md.push('');
md.push('| # | Sev | ID | Pattern | Freq | Root | Demo? | Slice |');
md.push('|---|---|---|---|---|---|---|---|');
all.forEach((x, i) => {
  const p = (x.pattern || '').replace(/\|/g, '\\|').slice(0, 100);
  md.push(`| ${i+1} | ${x.severity} | ${x.defect_id||'-'} | ${p} | ${x.frequency||'-'} | ${x.root_cause||'-'} | ${x.demo_blocking?'✔':'–'} | ${x.__slice} |`);
});
md.push('');
md.push('## Full details per defect');
md.push('');
for (const x of all) {
  md.push(`### [${x.severity}] ${x.defect_id || '-'} — ${x.pattern || ''}`);
  md.push(`*Slice*: \`${x.__slice}\` | *Root*: \`${x.root_cause}\` | *Freq*: ${x.frequency || '-'} | *Demo-blocking*: ${x.demo_blocking?'yes':'no'}`);
  md.push('');
  if (x.evidence && x.evidence.length) {
    md.push('**Evidence:**');
    for (const e of x.evidence.slice(0, 3)) {
      if (typeof e === 'string' || typeof e === 'number') { md.push(`- \`${e}\``); continue; }
      const q = (e.quote || e.excerpt || '').toString().replace(/\n/g, ' ').slice(0, 220);
      md.push(`- \`${e.scenario || e.id || '?'}\`: ${q}`);
    }
  }
  md.push('');
  md.push(`**Fix:** ${x.proposed_fix || '-'}`);
  md.push('');
  md.push('---');
  md.push('');
}
writeFileSync('.agents/failure_triage_v2.md', md.join('\n'), 'utf8');
console.log(`Wrote failure_triage_v2.md — ${all.length} defects`);
console.log(counts);
