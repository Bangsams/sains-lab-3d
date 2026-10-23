// Pemeriksaan struktur semua topik. Jalankan: npm run check
// three.js tidak dimuat; hanya data dan fungsi compute yang diuji.
import { readdirSync, readFileSync } from 'node:fs';
import { build } from 'esbuild';

const out = await build({
  stdin: { contents: "export * from './src/topics/index.js';", resolveDir: '.', loader: 'js' },
  bundle: true, format: 'esm', write: false, platform: 'node', logLevel: 'error',
  plugins: [{ name: 'stub-three', setup(b) { b.onResolve({ filter: /^three/ }, () => ({ path: 'three', namespace: 'stub' })); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default {}; export const MeshStandardMaterial = class {};' })); } }],
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const { TOPICS, SUBJECTS, TAGS } = mod;
const errors = [];
const ids = new Set();
const files = readdirSync('src/topics').filter((f) => f !== 'index.js');
if (files.length !== TOPICS.length) errors.push(`Ada ${files.length} file topik tetapi ${TOPICS.length} terdaftar di index.js`);
for (const t of TOPICS) {
  const where = `[${t.id}]`;
  if (ids.has(t.id)) errors.push(`${where} id ganda`);
  ids.add(t.id);
  if (!/^[a-z0-9-]+$/.test(t.id)) errors.push(`${where} id hanya boleh huruf kecil, angka, dan tanda hubung`);
  if (!SUBJECTS[t.subject]) errors.push(`${where} subject tidak dikenal: ${t.subject}`);
  t.tags.forEach((g) => TAGS[g] || errors.push(`${where} tag tidak dikenal: ${g}`));
  if (typeof t.scene !== 'function') errors.push(`${where} scene() wajib ada`);
  const keys = new Set(t.params.map((p) => p.key));
  for (const p of t.params) {
    if (p.type !== 'select' && (p.value < p.min || p.value > p.max)) errors.push(`${where} nilai awal ${p.key} di luar rentang`);
  }
  const defaults = Object.fromEntries(t.params.map((p) => [p.key, p.value]));
  const rows = t.compute(defaults);
  rows.forEach((r) => !r.text && !Number.isFinite(r.value) && errors.push(`${where} keluaran "${r.label}" bukan angka`));
  t.questions.forEach((q, i) => {
    const w = `${where} soal ${i + 1}`;
    Object.keys(q.preset || {}).forEach((k) => keys.has(k) || errors.push(`${w}: preset ${k} bukan parameter`));
    for (const [k, v] of Object.entries(q.preset || {})) {
      const p = t.params.find((x) => x.key === k);
      if (p && p.type !== 'select' && (v < p.min || v > p.max)) errors.push(`${w}: preset ${k}=${v} di luar rentang slider`);
    }
    if (q.type === 'mcq' && !(q.answer >= 0 && q.answer < q.options.length)) errors.push(`${w}: indeks jawaban salah`);
    if (q.type === 'num' && !(Number.isFinite(q.answer) && q.tolerance >= 0)) errors.push(`${w}: jawaban/toleransi angka tidak valid`);
    if (!q.explain) errors.push(`${w}: pembahasan kosong`);
  });
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK: ${TOPICS.length} topik, ${TOPICS.reduce((n, t) => n + t.questions.length, 0)} soal.`);
