// Mesin simulasi rangkaian untuk Lab Rangkaian (tanpa DOM, dipakai juga oleh npm run check).
// Metode: analisis nodal termodifikasi (MNA). Kabel menyatukan terminal menjadi satu simpul.
// Sumber tegangan punya hambatan dalam kecil (setara Norton) sehingga korsleting tetap terhitung.
// Nilai AC dihitung sebagai nilai efektif (RMS) dengan beban resistif, jadi trafo ideal bisa dipakai.

const G_MIN = 1e-9;      // konduktansi sangat kecil ke acuan agar simpul mengambang tetap terdefinisi
const R_CLOSED = 1e-3;   // hambatan saklar/MCB tertutup (Ω)

// ---------- pustaka komponen ----------
// terminals: posisi relatif terhadap pojok kiri atas komponen, kind menentukan warna kabel
export const PARTS = {
  baterai: {
    name: 'Baterai 12 V', w: 110, h: 64, info: 'Sumber DC 12 V',
    terminals: [{ id: 'p', x: 110, y: 20, kind: 'pos', name: '+' }, { id: 'n', x: 110, y: 46, kind: 'neg', name: '−' }],
    elements: () => [{ k: 'V', a: 'p', b: 'n', v: 12, r: 0.05 }],
  },
  psu12: {
    name: 'Adaptor 12 V DC', w: 110, h: 64, info: 'Catu daya 12 V / 5 A',
    terminals: [{ id: 'p', x: 110, y: 20, kind: 'pos', name: '+12V' }, { id: 'n', x: 110, y: 46, kind: 'neg', name: 'GND' }],
    elements: () => [{ k: 'V', a: 'p', b: 'n', v: 12, r: 0.02 }],
  },
  pln: {
    name: 'Sumber PLN 220 V', w: 110, h: 70, info: 'Listrik rumah AC 220 V',
    terminals: [{ id: 'L', x: 110, y: 22, kind: 'ac', name: 'L' }, { id: 'N', x: 110, y: 52, kind: 'neg', name: 'N' }],
    elements: () => [{ k: 'V', a: 'L', b: 'N', v: 220, r: 0.3 }],
  },
  generator: {
    name: 'Generator 11 kV', w: 120, h: 76, info: 'Pembangkit AC 11 kV (nilai efektif)',
    terminals: [{ id: 'L', x: 120, y: 24, kind: 'ac', name: 'L' }, { id: 'N', x: 120, y: 54, kind: 'neg', name: 'N' }],
    elements: () => [{ k: 'V', a: 'L', b: 'N', v: 11000, r: 0.5 }],
  },
  saklar: {
    name: 'Saklar', w: 90, h: 50, toggle: true, info: 'Klik untuk menyalakan/mematikan',
    terminals: [{ id: 'a', x: 0, y: 30, kind: 'sig', name: '' }, { id: 'b', x: 90, y: 30, kind: 'sig', name: '' }],
    elements: (c) => [{ k: 'SW', a: 'a', b: 'b', closed: !!c.on }],
  },
  mcb: {
    name: 'MCB 6 A', w: 70, h: 80, toggle: true, rating: 6, info: 'Pemutus otomatis: trip jika arus > 6 A',
    terminals: [{ id: 'in', x: 35, y: 0, kind: 'sig', name: 'in' }, { id: 'out', x: 35, y: 80, kind: 'sig', name: 'out' }],
    elements: (c) => [{ k: 'SW', a: 'in', b: 'out', closed: !!c.on && !c.tripped, guard: 'mcb' }],
  },
  pmt: {
    name: 'PMT (pemutus tenaga)', w: 80, h: 80, toggle: true, rating: 600, info: 'Circuit breaker gardu: trip jika arus > 600 A',
    terminals: [{ id: 'in', x: 40, y: 0, kind: 'sig', name: 'in' }, { id: 'out', x: 40, y: 80, kind: 'sig', name: 'out' }],
    elements: (c) => [{ k: 'SW', a: 'in', b: 'out', closed: !!c.on && !c.tripped, guard: 'mcb' }],
  },
  lampu: {
    name: 'Lampu 12 V 6 W', w: 80, h: 90, vr: 12, pr: 6, info: 'R = V²/P = 24 Ω',
    terminals: [{ id: 'a', x: 20, y: 90, kind: 'sig', name: '' }, { id: 'b', x: 60, y: 90, kind: 'sig', name: '' }],
    elements: (c, d) => (c.blown ? [] : [{ k: 'R', a: 'a', b: 'b', r: (d.vr * d.vr) / d.pr, load: true }]),
  },
  lampu220: {
    name: 'Lampu 220 V 100 W', w: 80, h: 90, vr: 220, pr: 100, info: 'R = 220²/100 = 484 Ω',
    terminals: [{ id: 'a', x: 20, y: 90, kind: 'sig', name: 'L' }, { id: 'b', x: 60, y: 90, kind: 'sig', name: 'N' }],
    elements: (c, d) => (c.blown ? [] : [{ k: 'R', a: 'a', b: 'b', r: (d.vr * d.vr) / d.pr, load: true }]),
  },
  motor: {
    name: 'Motor DC 12 V', w: 100, h: 80, vr: 12, ir: 2.5, info: '12 V · 2,5 A (R ≈ 4,8 Ω)',
    terminals: [{ id: 'p', x: 0, y: 26, kind: 'pos', name: '+' }, { id: 'n', x: 0, y: 56, kind: 'neg', name: '−' }],
    elements: (c, d) => [{ k: 'R', a: 'p', b: 'n', r: d.vr / d.ir, load: true }],
  },
  saluran: {
    name: 'Saluran transmisi 20 Ω', w: 150, h: 60, info: 'Kawat panjang 60 km, R = 20 Ω',
    terminals: [{ id: 'a', x: 0, y: 34, kind: 'ac', name: '' }, { id: 'b', x: 150, y: 34, kind: 'ac', name: '' }],
    elements: () => [{ k: 'R', a: 'a', b: 'b', r: 20, line: true }],
  },
  kota: {
    name: 'Beban kota 11 kV 5 MW', w: 120, h: 84, vr: 11000, pr: 5e6, info: 'Gardu distribusi kota: 5 MW pada 11 kV',
    terminals: [{ id: 'a', x: 0, y: 30, kind: 'ac', name: 'L' }, { id: 'b', x: 0, y: 60, kind: 'neg', name: 'N' }],
    elements: (c, d) => [{ k: 'R', a: 'a', b: 'b', r: (d.vr * d.vr) / d.pr, load: true }],
  },
  trafoNaik: {
    name: 'Trafo step-up 11/150 kV', w: 110, h: 90, n: 150 / 11, info: 'Ns/Np = 150/11 ≈ 13,6',
    terminals: [{ id: 'p1', x: 0, y: 28, kind: 'ac', name: 'P' }, { id: 'p2', x: 0, y: 66, kind: 'neg', name: 'P' }, { id: 's1', x: 110, y: 28, kind: 'ac', name: 'S' }, { id: 's2', x: 110, y: 66, kind: 'neg', name: 'S' }],
    elements: (c, d) => [{ k: 'XF', p1: 'p1', p2: 'p2', s1: 's1', s2: 's2', n: d.n }],
  },
  trafoTurun: {
    name: 'Trafo step-down 150/11 kV', w: 110, h: 90, n: 11 / 150, info: 'Ns/Np = 11/150',
    terminals: [{ id: 'p1', x: 0, y: 28, kind: 'ac', name: 'P' }, { id: 'p2', x: 0, y: 66, kind: 'neg', name: 'P' }, { id: 's1', x: 110, y: 28, kind: 'ac', name: 'S' }, { id: 's2', x: 110, y: 66, kind: 'neg', name: 'S' }],
    elements: (c, d) => [{ k: 'XF', p1: 'p1', p2: 'p2', s1: 's1', s2: 's2', n: d.n }],
  },
  trafoDist: {
    name: 'Trafo distribusi 11 kV/220 V', w: 110, h: 90, n: 220 / 11000, info: 'Ns/Np = 220/11.000 = 1/50',
    terminals: [{ id: 'p1', x: 0, y: 28, kind: 'ac', name: 'P' }, { id: 'p2', x: 0, y: 66, kind: 'neg', name: 'P' }, { id: 's1', x: 110, y: 28, kind: 'ac', name: 'S' }, { id: 's2', x: 110, y: 66, kind: 'neg', name: 'S' }],
    elements: (c, d) => [{ k: 'XF', p1: 'p1', p2: 'p2', s1: 's1', s2: 's2', n: d.n }],
  },
  buck: {
    name: 'Step-down 12→5 V', w: 110, h: 70, info: 'Modul buck: keluaran 5 V jika masukan ≥ 7 V',
    terminals: [{ id: 'ip', x: 0, y: 22, kind: 'pos', name: 'IN+' }, { id: 'in', x: 0, y: 50, kind: 'neg', name: 'IN−' }, { id: 'op', x: 110, y: 22, kind: 'pos', name: '5V' }, { id: 'on', x: 110, y: 50, kind: 'neg', name: 'GND' }],
    elements: (c, d, st) => [{ k: 'R', a: 'ip', b: 'in', r: 2000 }, ...(st.on ? [{ k: 'V', a: 'op', b: 'on', v: 5, r: 0.05 }] : [])],
    update: (c, rd) => ({ on: rd.v('ip', 'in') >= 7 }),
  },
  esp32: {
    name: 'ESP32 (Wi-Fi)', w: 130, h: 90, info: 'Mikrokontroler IoT: VIN 5 V, GPIO 3,3 V maks 40 mA',
    terminals: [{ id: 'vin', x: 0, y: 24, kind: 'pos', name: 'VIN' }, { id: 'gnd', x: 0, y: 62, kind: 'neg', name: 'GND' }, { id: 'd26', x: 130, y: 44, kind: 'sig', name: 'D26' }],
    elements: (c, d, st, g) => [
      { k: 'R', a: 'vin', b: 'gnd', r: 50 },
      ...(st.on ? [{ k: 'V', a: 'd26', b: 'gnd', v: g.cmd ? 3.3 : 0, r: 25, gpio: true }] : []),
    ],
    update: (c, rd) => ({ on: rd.v('vin', 'gnd') >= 4.5 }),
  },
  relay: {
    name: 'Modul relay 5 V', w: 120, h: 96, info: 'Aktif HIGH: IN > 2 V menutup kontak COM–NO',
    terminals: [{ id: 'vcc', x: 0, y: 20, kind: 'pos', name: 'VCC' }, { id: 'gnd', x: 0, y: 48, kind: 'neg', name: 'GND' }, { id: 'in', x: 0, y: 76, kind: 'sig', name: 'IN' }, { id: 'com', x: 120, y: 30, kind: 'sig', name: 'COM' }, { id: 'no', x: 120, y: 66, kind: 'sig', name: 'NO' }],
    elements: (c, d, st) => [
      { k: 'R', a: 'vcc', b: 'gnd', r: 70 },
      { k: 'R', a: 'in', b: 'gnd', r: 10000 },
      { k: 'SW', a: 'com', b: 'no', closed: !!st.on },
    ],
    update: (c, rd) => ({ on: rd.v('vcc', 'gnd') >= 4 && rd.v('in', 'gnd') >= 2 }),
  },
};

// ---------- aljabar linear: eliminasi Gauss dengan pivot parsial ----------
function solveLinear(A, b) {
  const n = b.length;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (Math.abs(A[p][c]) < 1e-18) return null;
    [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c];
      if (!f) continue;
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k];
    x[r] = s / A[r][r];
  }
  return x;
}

// Menyatukan terminal yang terhubung kabel. Mengembalikan fungsi root(terminalKey).
export function netsOf(board) {
  const parent = {};
  const add = (k) => { if (!parent[k]) parent[k] = k; };
  const find = (k) => { add(k); while (parent[k] !== k) { parent[k] = parent[parent[k]]; k = parent[k]; } return k; };
  for (const c of board.comps) for (const t of PARTS[c.type].terminals) add(`${c.id}.${t.id}`);
  for (const [a, b] of board.wires) { add(a); add(b); const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }
  return find;
}

// Satu kali analisis untuk keadaan logika tertentu.
function analyse(board, states, g) {
  const root = netsOf(board);
  const idx = new Map();
  const node = (key) => { const r = root(key); if (!idx.has(r)) idx.set(r, idx.size); return idx.get(r); };
  const els = [];
  for (const c of board.comps) {
    const d = PARTS[c.type];
    for (const e of d.elements(c, d, states[c.id] || {}, g)) {
      const map = (t) => node(`${c.id}.${t}`);
      els.push({ ...e, comp: c.id, na: e.a && map(e.a), nb: e.b && map(e.b), np1: e.p1 && map(e.p1), np2: e.p2 && map(e.p2), ns1: e.s1 && map(e.s1), ns2: e.s2 && map(e.s2) });
    }
  }
  // pastikan semua terminal punya indeks simpul
  for (const c of board.comps) for (const t of PARTS[c.type].terminals) node(`${c.id}.${t.id}`);
  const N = idx.size, xfs = els.filter((e) => e.k === 'XF'), M = N + xfs.length;
  const A = Array.from({ length: M }, () => new Array(M).fill(0)), rhs = new Array(M).fill(0);
  const cond = (a, b, gg) => { A[a][a] += gg; A[b][b] += gg; A[a][b] -= gg; A[b][a] -= gg; };
  for (let i = 0; i < N; i++) A[i][i] += G_MIN;
  for (const e of els) {
    if (e.k === 'R') cond(e.na, e.nb, 1 / e.r);
    else if (e.k === 'SW') { if (e.closed) cond(e.na, e.nb, 1 / R_CLOSED); }
    else if (e.k === 'V') { cond(e.na, e.nb, 1 / e.r); rhs[e.na] += e.v / e.r; rhs[e.nb] -= e.v / e.r; }
  }
  xfs.forEach((e, j) => {
    const m = N + j;
    A[e.ns1][m] += 1; A[e.ns2][m] -= 1; A[e.np1][m] -= e.n; A[e.np2][m] += e.n;
    A[m][e.ns1] += 1; A[m][e.ns2] -= 1; A[m][e.np1] -= e.n; A[m][e.np2] += e.n;
  });
  const x = solveLinear(A, rhs) || new Array(M).fill(0);
  const V = (n) => x[n] || 0;
  for (const e of els) {
    if (e.k === 'R') { e.vd = V(e.na) - V(e.nb); e.i = e.vd / e.r; }
    else if (e.k === 'SW') { e.vd = V(e.na) - V(e.nb); e.i = e.closed ? e.vd / R_CLOSED : 0; }
    else if (e.k === 'V') { e.vd = V(e.na) - V(e.nb); e.i = (e.v - e.vd) / e.r; }
  }
  xfs.forEach((e, j) => { e.vp = V(e.np1) - V(e.np2); e.vs = V(e.ns1) - V(e.ns2); e.i = x[N + j]; });
  const v = (cid, a, b) => V(node(`${cid}.${a}`)) - V(node(`${cid}.${b}`));
  return { els, v, root };
}

// Simulasi lengkap: mengulang sampai keadaan logika (modul, MCB trip, lampu putus) stabil.
export function simulate(board, g = {}) {
  const comps = board.comps.map((c) => ({ ...c }));
  const b = { comps, wires: board.wires };
  const states = {};
  const events = [];
  let res;
  for (let it = 0; it < 12; it++) {
    res = analyse(b, states, g);
    let changed = false;
    for (const c of comps) {
      const d = PARTS[c.type];
      if (d.update) {
        const s = d.update(c, { v: (a, bb) => res.v(c.id, a, bb) });
        const old = states[c.id] || {};
        if (Object.keys(s).some((k) => s[k] !== old[k])) { states[c.id] = s; changed = true; }
      }
      const mine = res.els.filter((e) => e.comp === c.id);
      if (d.rating && !c.tripped && mine.some((e) => e.guard && Math.abs(e.i) > d.rating)) {
        c.tripped = true; changed = true; events.push(`${d.name} trip (arus melebihi ${d.rating} A)`);
      }
      if (d.pr && !c.blown && (c.type === 'lampu' || c.type === 'lampu220')) {
        const p = mine.reduce((s, e) => s + Math.abs(e.vd * e.i), 0);
        if (p > 2.2 * d.pr) { c.blown = true; changed = true; events.push(`${d.name} putus (daya ${fmtSI(p, 'W')} jauh di atas ${d.pr} W)`); }
      }
    }
    if (!changed) break;
  }
  // ringkas hasil per komponen
  const out = {};
  for (const c of comps) {
    const d = PARTS[c.type], mine = res.els.filter((e) => e.comp === c.id);
    const main = mine[0];
    const r = { comp: c, state: states[c.id] || {}, v: 0, i: 0, p: 0 };
    if (main?.k === 'XF') { r.vp = Math.abs(main.vp); r.vs = Math.abs(main.vs); r.is = Math.abs(main.i); r.ip = Math.abs(main.i * main.n); r.v = r.vs; r.i = r.is; }
    else if (main) { r.v = Math.abs(main.vd); r.i = Math.abs(main.i); r.p = mine.filter((e) => e.k === 'R').reduce((s, e) => s + Math.abs(e.vd * e.i), 0); }
    if (d.vr && d.pr) r.level = r.p / d.pr;
    if (c.type === 'motor') { r.p = Math.abs(main.vd * main.i); r.level = r.v / d.vr; }
    if (c.type === 'kota') r.level = r.v / d.vr;
    const src = mine.find((e) => e.k === 'V');
    if (src && !src.gpio) { r.v = Math.abs(src.vd); r.i = Math.abs(src.i); r.p = src.vd * src.i; }
    const gp = mine.find((e) => e.gpio);
    if (gp) { r.gpioI = Math.abs(gp.i); if (r.gpioI > 0.04) events.push(`GPIO D26 ESP32 kelebihan arus: ${fmtSI(r.gpioI, 'A')} (maks 40 mA). Pin bisa rusak, pakai relay/transistor.`); }
    if (d.terminals.length && (c.type === 'baterai' || c.type === 'psu12') && r.i > 30) events.push(`Korsleting di ${d.name}: arus ${fmtSI(r.i, 'A')}! Periksa kabel + dan − yang tersambung langsung.`);
    if (c.type === 'pln' && r.i > 100) events.push(`Korsleting pada sumber PLN: arus ${fmtSI(r.i, 'A')}! Kabel L dan N tersambung langsung.`);
    if (c.type === 'generator' && r.i > 3000) events.push(`Korsleting di generator: arus ${fmtSI(r.i, 'A')}.`);
    if (mine.some((e) => e.line)) r.loss = r.p;
    // buang sisa numerik sangat kecil (akibat konduktansi G_MIN) agar alat ukur menampilkan 0
    for (const k of ['v', 'vp', 'vs']) if (r[k] != null && Math.abs(r[k]) < 1e-3) r[k] = 0;
    for (const k of ['i', 'ip', 'is']) if (r[k] != null && Math.abs(r[k]) < 1e-6) r[k] = 0;
    if (Math.abs(r.p) < 1e-5) r.p = 0;
    if (r.level != null && r.level < 1e-6) r.level = 0;
    out[c.id] = r;
  }
  return { parts: out, events, comps };
}

// Rakit papan dari daftar solusi (dipakai tombol "pasang contoh" dan pemeriksaan otomatis).
export function boardFrom(task, mode = 'solution') {
  const comps = task.parts.map((p, i) => ({ id: p.id, type: p.type, x: p.x ?? 40 + (i % 5) * 180, y: p.y ?? 60 + Math.floor(i / 5) * 170, on: p.on ?? true }));
  const wires = mode === 'solution' ? task.solution.map((w) => [...w]) : [];
  return { comps, wires };
}

// Format angka dengan awalan SI (k, M, m) dalam gaya Indonesia.
export function fmtSI(v, unit) {
  const a = Math.abs(v);
  const [s, p] = a >= 1e6 ? [1e-6, 'M'] : a >= 1e3 ? [1e-3, 'k'] : a >= 1 || a === 0 ? [1, ''] : a >= 1e-3 ? [1e3, 'm'] : [1e6, 'µ'];
  const n = v * s;
  return `${n.toLocaleString('id-ID', { maximumFractionDigits: Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 10 ? 1 : 2 })} ${p}${unit}`;
}

// run(masukan, ubah) mensimulasikan papan dengan keadaan tertentu, mis. run({}, { S1: { on: false } }).
export const runner = (board, g = {}) => (gg = {}, set = {}) => simulate({ comps: board.comps.map((c) => ({ ...c, ...(set[c.id] || {}) })), wires: board.wires }, { ...g, ...gg });
