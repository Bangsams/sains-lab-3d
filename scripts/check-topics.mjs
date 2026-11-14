// Pemeriksaan struktur semua topik. Jalankan: npm run check
// three.js tidak dimuat; hanya data dan fungsi compute yang diuji.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import FIGS from '../src/lib/figures-data.js';
import { build } from 'esbuild';
import { PARTS, boardFrom, runner } from '../src/lib/circuit.js';

const out = await build({
  stdin: { contents: "export * from './src/topics/index.js';", resolveDir: '.', loader: 'js' },
  bundle: true, format: 'esm', write: false, platform: 'node', logLevel: 'error',
  plugins: [{ name: 'stub-three', setup(b) { b.onResolve({ filter: /^three/ }, () => ({ path: 'three', namespace: 'stub' })); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default {}; export const MeshStandardMaterial = class {};' })); } }],
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const { TOPICS, SUBJECTS, TAGS, GROUPS, STEM } = mod;
const errors = [];
const ids = new Set();
const files = readdirSync('src/topics').filter((f) => f !== 'index.js' && f !== 'stem-extra.js');
if (files.length !== TOPICS.length) errors.push(`Ada ${files.length} file topik tetapi ${TOPICS.length} terdaftar di index.js`);
for (const t of TOPICS) {
  const where = `[${t.id}]`;
  if (ids.has(t.id)) errors.push(`${where} id ganda`);
  ids.add(t.id);
  if (!/^[a-z0-9-]+$/.test(t.id)) errors.push(`${where} id hanya boleh huruf kecil, angka, dan tanda hubung`);
  if (!SUBJECTS[t.subject]) errors.push(`${where} subject tidak dikenal: ${t.subject}`);
  t.tags.forEach((g) => TAGS[g] || errors.push(`${where} tag tidak dikenal: ${g}`));
  if (t.reading) {
    if (!t.article || !t.period || !t.minutes) errors.push(`${where} bacaan: article, period, dan minutes wajib diisi`);
    if (t.params?.length || t.equations?.length || t.scene) errors.push(`${where} bacaan tidak boleh berisi rumus, parameter, atau simulasi`);
    t.questions.forEach((q, i) => {
      if (q.type !== 'mcq') errors.push(`${where} soal ${i + 1}: bacaan hanya boleh soal pilihan ganda dari teks`);
      if (!(q.answer >= 0 && q.answer < q.options.length)) errors.push(`${where} soal ${i + 1}: indeks jawaban salah`);
      if (!q.explain) errors.push(`${where} soal ${i + 1}: pembahasan kosong`);
    });
    if (t.questions.length < 3) errors.push(`${where} bacaan butuh minimal 3 soal`);
    continue;
  }
  if (!t.equations?.length) errors.push(`${where} equations (rumus + artinya) wajib ada`);
  (t.equations || []).forEach((e, i) => {
    if (!e.f || !e.meaning || !e.symbols?.length) errors.push(`${where} rumus ${i + 1}: f, meaning, dan symbols wajib diisi`);
  });
  if (typeof t.scene !== 'function') errors.push(`${where} scene() wajib ada`);
  if (t.lab) {
    const n = t.lab.code.split('\n').length;
    if (n > 100) errors.push(`${where} Lab Kode ${n} baris, maksimal 100`);
    if (!t.lab.file || !t.lab.tasks?.length || !t.lab.source) errors.push(`${where} lab: file, tasks, dan source wajib diisi`);
  }
  if (t.wiring) {
    for (const task of t.wiring.tasks) {
      const w = `${where} lab rangkaian "${task.id}"`;
      const ids = new Set(task.parts.map((p) => p.id));
      task.parts.forEach((p) => PARTS[p.type] || errors.push(`${w}: komponen ${p.type} tidak dikenal`));
      for (const s of task.steps) for (const k of [s.a, s.b]) {
        const [cid, tid] = k.split('.');
        const part = task.parts.find((p) => p.id === cid);
        if (!ids.has(cid) || !PARTS[part.type].terminals.some((x) => x.id === tid)) errors.push(`${w}: terminal ${k} tidak ada`);
      }
      // rangkaian contoh harus lulus, papan kosong harus gagal
      const sol = boardFrom({ parts: task.parts, solution: task.steps.map((s) => [s.a, s.b]) });
      const good = task.check(runner(sol, { cmd: true }), sol);
      if (!good.ok) errors.push(`${w}: rangkaian contoh tidak lulus pemeriksaan: ${good.msg}`);
      const empty = { comps: sol.comps, wires: [] };
      if (task.check(runner(empty, { cmd: true }), empty).ok) errors.push(`${w}: papan tanpa kabel ikut lulus`);
    }
  }
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
    if (!STEM[q.stem]) errors.push(`${w}: label STEM (S/T/E/M) wajib diisi`);
  });
}
Object.keys(SUBJECTS).forEach((k) => GROUPS.some((g) => g.subjects.includes(k)) || errors.push(`bidang ${k} belum masuk GROUPS`));
TOPICS.filter((t) => !t.reading).forEach((t) => { const have = new Set(t.questions.map((q) => q.stem)); ['S', 'T', 'E', 'M'].forEach((k) => have.has(k) || errors.push(`[${t.id}] belum punya soal ${STEM[k].name}`)); });
for (const [k, f] of Object.entries(FIGS)) {
  if (!existsSync(f.src)) errors.push(`gambar sejarah ${k}: file ${f.src} tidak ada`);
  if (!f.license || !f.page) errors.push(`gambar sejarah ${k}: lisensi dan sumber wajib diisi`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK: ${TOPICS.length} topik (${TOPICS.filter((t) => t.reading).length} bacaan sejarah), ${TOPICS.reduce((n, t) => n + t.questions.length, 0)} soal, ${TOPICS.filter((t) => t.lab).length} lab kode, ${TOPICS.reduce((n, t) => n + (t.wiring?.tasks.length || 0), 0)} percobaan lab rangkaian.`);
