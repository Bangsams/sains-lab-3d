import { mat, mesh, ground, label } from '../lib/helpers.js';

const opTime = (p) => (p.plan - p.down) * 60;                 // detik operasi
const av = (p) => (p.plan - p.down) / p.plan;
const perf = (p) => Math.min(1, (p.ideal * p.out) / opTime(p));
const qual = (p) => (p.out - p.defect) / p.out;
const oee = (p) => av(p) * perf(p) * qual(p);
const wn = (p) => p.obs * (p.rating / 100);
const wb = (p) => wn(p) * (1 + p.allow / 100);
const pct = (v) => `${(v * 100).toFixed(1).replace('.', ',')}%`;

export default {
  id: 'oee-studi-kerja',
  subject: 'industri',
  // Soal disusun ulang (maks. 6); kunci progres baru agar progres lama tidak menempel ke soal yang salah.
  progressKey: 'oee-studi-kerja-v2',
  title: 'OEE & Pengukuran Waktu Kerja',
  tags: ['industri'],
  summary: 'Ukur seberapa efektif mesin bekerja (Availability × Performance × Quality) dan tetapkan waktu baku operator dengan rating dan kelonggaran.',
  story: `
    <p><strong>Studi kasus: Mesin press tutup kaleng di Cikarang.</strong> Satu shift direncanakan 480 menit. Hari ini mesin berhenti 60 menit (ganti cetakan dan macet). Waktu siklus idealnya 30 detik per unit, tetapi mesin hanya menghasilkan 700 unit, dan 21 di antaranya cacat.</p>
    <p><strong>OEE</strong> (Overall Equipment Effectiveness) merangkum tiga kerugian besar: berhenti (availability), lambat (performance), dan cacat (quality). Kelas dunia sekitar 85%.</p>
    <p>Di stasiun pengemasan manual, analis mengukur operator dengan stopwatch: rata-rata 50 detik per karton. Operator itu bekerja 10% lebih cepat dari normal (rating 110%), dan perlu kelonggaran 15% untuk kebutuhan pribadi, lelah, dan hambatan. Hasilnya adalah <strong>waktu baku</strong> yang adil untuk menetapkan target harian.</p>`,
  concept: 'OEE = A × P × Q &nbsp;·&nbsp; W<sub>n</sub> = W<sub>s</sub> × rating &nbsp;·&nbsp; W<sub>b</sub> = W<sub>n</sub> × (1 + kelonggaran)',
  conceptNote: 'A = waktu operasi / waktu rencana, P = (waktu siklus ideal × output) / waktu operasi, Q = produk baik / output. Rating faktor 100% berarti operator bekerja dengan kecepatan normal.',
  equations: [
    { f: 'A = (T<sub>rencana</sub> − T<sub>henti</sub>) / T<sub>rencana</sub>', meaning: 'Availability: bagian waktu rencana ketika mesin benar-benar berjalan.', symbols: [['T<sub>rencana</sub>', 'Waktu produksi yang direncanakan', 'menit'], ['T<sub>henti</sub>', 'Waktu mesin berhenti (downtime)', 'menit']] },
    { f: 'P = (t<sub>ideal</sub> × Output) / T<sub>operasi</sub>', meaning: 'Performance: seberapa cepat mesin dibanding kecepatan idealnya selama berjalan.', symbols: [['t<sub>ideal</sub>', 'Waktu siklus ideal', 'detik/unit'], ['Output', 'Jumlah unit yang dibuat (baik + cacat)', 'unit'], ['T<sub>operasi</sub>', 'T<sub>rencana</sub> − T<sub>henti</sub> (ubah ke detik)', 'detik']] },
    { f: 'Q = (Output − Cacat) / Output', meaning: 'Quality: bagian produk yang langsung baik.', symbols: [['Cacat', 'Unit yang ditolak atau dikerjakan ulang', 'unit']] },
    { f: 'OEE = A × P × Q', meaning: 'Efektivitas total mesin. Tiga persentase dikalikan sehingga kerugian kecil di masing-masing cepat menumpuk.', symbols: [['OEE', 'Overall Equipment Effectiveness', '%']] },
    { f: 'W<sub>n</sub> = W<sub>s</sub> × rating', meaning: 'Waktu normal: waktu teramati disesuaikan dengan kecepatan operator. Operator cepat (rating > 100%) membuat waktu normal lebih panjang dari waktu teramati.', symbols: [['W<sub>s</sub>', 'Waktu siklus rata-rata hasil stopwatch', 'detik'], ['rating', 'Faktor penyesuaian kecepatan operator', '%']] },
    { f: 'W<sub>b</sub> = W<sub>n</sub> × (1 + kelonggaran) &nbsp;·&nbsp; Output standar = Waktu tersedia / W<sub>b</sub>', meaning: 'Waktu baku menambahkan kelonggaran untuk istirahat, lelah, dan hambatan. Target harian = waktu kerja dibagi waktu baku.', symbols: [['W<sub>b</sub>', 'Waktu baku', 'detik/unit'], ['kelonggaran', 'Allowance', '%']] },
  ],
  params: [
    { key: 'plan', label: 'Waktu rencana', min: 240, max: 600, step: 10, value: 480, unit: 'menit' },
    { key: 'down', label: 'Downtime', min: 0, max: 200, step: 5, value: 60, unit: 'menit' },
    { key: 'ideal', label: 'Waktu siklus ideal', min: 10, max: 60, step: 1, value: 30, unit: 'detik' },
    { key: 'out', label: 'Output total', min: 100, max: 1500, step: 10, value: 700, unit: 'unit' },
    { key: 'defect', label: 'Produk cacat', min: 0, max: 100, step: 1, value: 21, unit: 'unit' },
    { key: 'obs', label: 'Waktu teramati operator', min: 20, max: 120, step: 1, value: 50, unit: 'detik' },
    { key: 'rating', label: 'Rating operator', min: 70, max: 130, step: 5, value: 110, unit: '%' },
    { key: 'allow', label: 'Kelonggaran', min: 0, max: 40, step: 1, value: 15, unit: '%' },
  ],
  compute(p) {
    return [
      { label: 'OEE', value: oee(p) * 100, unit: '%', digits: 1, main: true },
      { label: 'Availability', value: av(p) * 100, unit: '%', digits: 1 },
      { label: 'Performance', value: perf(p) * 100, unit: '%', digits: 1 },
      { label: 'Quality', value: qual(p) * 100, unit: '%', digits: 1 },
      { label: 'Waktu normal operator', value: wn(p), unit: 'detik', digits: 2 },
      { label: 'Waktu baku', value: wb(p), unit: 'detik', digits: 2 },
      { label: 'Output standar per shift (420 menit)', value: Math.floor((420 * 60) / wb(p)), unit: 'karton', digits: 0 },
    ];
  },
  view: { camera: [8, 7, 11], target: [0, 2, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc4cad0 });
    const steel = mat(0x5f7385, { metalness: 0.6 });
    scene.add(mesh(new THREE.BoxGeometry(3, 0.6, 2), steel, { x: -3, y: 0.3 }));
    [-1.3, 1.3].forEach((z) => scene.add(mesh(new THREE.BoxGeometry(0.3, 4, 0.3), steel, { x: -3, y: 2.3, z: z * 0.6 })));
    scene.add(mesh(new THREE.BoxGeometry(3, 0.5, 2), steel, { x: -3, y: 4.3 }));
    const ram = mesh(new THREE.BoxGeometry(1.4, 1, 1.2), mat(0xffa36b, { metalness: 0.4 }), { x: -3, y: 3.2 });
    scene.add(ram);
    const belt = mesh(new THREE.BoxGeometry(7, 0.15, 0.9), mat(0x22262b), { x: 1.5, y: 0.65 });
    scene.add(belt);
    const lids = Array.from({ length: 8 }, (_, i) => { const m = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 20), mat(0xc7ccd2, { metalness: 0.8 }), { y: 0.78 }); m.userData.u = i / 8; scene.add(m); return m; });
    const lamp = mesh(new THREE.SphereGeometry(0.25, 16, 12), new THREE.MeshStandardMaterial({ color: 0x5fcf7a, emissive: 0x5fcf7a, emissiveIntensity: 1 }), { x: -3, y: 4.9 });
    scene.add(lamp);
    // batang A, P, Q, OEE
    const cols = [['A', 0x93b6ff], ['P', 0xffd36b], ['Q', 0x9ade8b], ['OEE', 0xc6a8ff]].map(([n, c], i) => {
      const b = mesh(new THREE.BoxGeometry(0.8, 1, 0.8), mat(c, { emissive: c, emissiveIntensity: 0.2 }), { x: 2 + i * 1.2, z: -2.5 });
      const t = label(n, { size: 0.35 });
      scene.add(b, t);
      return { b, t, n };
    });
    const tag = label('', { size: 0.45 });
    tag.position.set(1, 6, 0);
    scene.add(tag);
    return {
      update(p, t, dt) {
        // mesin berhenti sebagian waktu sesuai availability
        const cycle = 8, running = (t % cycle) / cycle < av(p);
        const speed = running ? perf(p) : 0;
        lamp.material.color.set(running ? 0x5fcf7a : 0xe36464); lamp.material.emissive.set(running ? 0x5fcf7a : 0xe36464);
        ram.position.y = 2.6 + (running ? 0.6 * Math.abs(Math.cos(t * 3 * speed + 0.0001)) : 0.6);
        lids.forEach((l, i) => {
          l.userData.u = (l.userData.u + dt * 0.12 * speed) % 1;
          l.position.x = -1.8 + l.userData.u * 6.6;
          // tutup cacat tampak miring; banyaknya mengikuti persentase cacat
          l.rotation.z = (i + 0.5) / lids.length < 1 - qual(p) ? 0.5 : 0;
        });
        const v = { A: av(p), P: perf(p), Q: qual(p), OEE: oee(p) };
        cols.forEach((c) => { const h = Math.max(0.05, v[c.n] * 4); c.b.scale.y = h; c.b.position.y = h / 2; c.t.setText(`${c.n} ${pct(v[c.n])}`); c.t.position.set(c.b.position.x, h + 0.4, -2.5); });
        tag.setText(`OEE ${pct(oee(p))} · waktu baku ${wb(p).toFixed(1).replace('.', ',')} s`);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Shift direncanakan 480 menit, tetapi mesin berhenti 60 menit. Berapa persen availability-nya?',
      preset: { plan: 480, down: 60 }, answer: 87.5, tolerance: 0.001, unit: '%',
      explain: 'A = (480 − 60)/480 = 420/480 = 0,875 = 87,5%.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Selama 420 menit operasi, mesin membuat 700 unit dengan waktu siklus ideal 30 detik. Berapa persen performance-nya?',
      preset: { plan: 480, down: 60, ideal: 30, out: 700 }, answer: (30 * 700) / (420 * 60) * 100, tolerance: 0.01, unit: '%',
      explain: 'P = (30 × 700) / (420 × 60) = 21.000 / 25.200 ≈ 83,3%. Mesin kehilangan kecepatan karena macet kecil dan berjalan pelan.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Dengan A = 87,5%, P = 83,33%, dan 21 cacat dari 700 unit, berapa persen OEE mesin press?',
      preset: { plan: 480, down: 60, ideal: 30, out: 700, defect: 21 }, answer: 0.875 * ((30 * 700) / 25200) * (679 / 700) * 100, tolerance: 0.01, unit: '%',
      explain: 'Q = 679/700 = 97%. OEE = 0,875 × 0,8333 × 0,97 ≈ 70,7%, masih di bawah kelas dunia 85%.',
    },
    {
      stem: 'T', type: 'num', kind: 'Teknologi',
      prompt: 'Sensor IoT yang terhubung ke MES mencatat data shift ini. Mesin pengisi botol: waktu rencana 480 menit, henti 30 menit, siklus ideal 20 detik, output 1.200 botol dengan 24 cacat. Berapa persen OEE-nya?',
      preset: { plan: 480, down: 30, ideal: 20, out: 1200, defect: 24 }, answer: (450 / 480) * ((20 * 1200) / (450 * 60)) * (1176 / 1200) * 100, tolerance: 0.01, unit: '%',
      explain: 'A = 450/480 = 93,75%. P = (20 × 1.200)/(450 × 60) = 24.000/27.000 = 88,9%. Q = 1.176/1.200 = 98%. OEE = 0,9375 × 0,889 × 0,98 ≈ 81,7%.',
    },
    {
      stem: 'S', type: 'num', kind: 'Konsep',
      prompt: 'Kelonggaran diberikan karena tubuh butuh pulih dari kelelahan. Lima pengukuran stopwatch operator: 48, 52, 50, 47, dan 53 detik. Rating operator 90% dan kelonggaran 10%. Berapa detik waktu bakunya?',
      preset: { obs: 50, rating: 90, allow: 10 }, answer: 50 * 0.9 * 1.1, tolerance: 0.001, unit: 'detik',
      explain: 'Ws = 250/5 = 50 detik. Wn = 50 × 0,90 = 45 detik (operator lebih lambat dari normal). Wb = 45 × 1,10 = 49,5 detik.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus', integer: true,
      prompt: 'Dengan waktu baku 49,5 detik dan waktu kerja efektif 420 menit, berapa karton target standar per shift? (bulatkan ke bawah)',
      preset: { obs: 50, rating: 90, allow: 10 }, answer: Math.floor(25200 / 49.5), tolerance: 0, unit: 'karton',
      explain: '25.200 / 49,5 = 509,1 → 509 karton per shift.',
    },
  ],
};
