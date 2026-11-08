import { mat, mesh, ground, label } from '../lib/helpers.js';

const avail = (p) => (p.shift - p.brk) * 60;              // detik kerja per shift
const takt = (p) => avail(p) / p.demand;                   // detik per unit
const minStations = (p) => Math.ceil(p.work / takt(p));
const stationTimes = (p) => {
  const base = p.work / p.N;
  return Array.from({ length: p.N }, (_, i) => (i === Math.min(2, p.N - 1) ? Math.max(base, p.bott) : base));
};
const cycle = (p) => Math.max(...stationTimes(p));
const output = (p) => Math.floor(avail(p) / cycle(p));
const efficiency = (p) => (p.work / (p.N * cycle(p))) * 100;

export default {
  id: 'ppic',
  subject: 'industri',
  title: 'Perencanaan & Pengendalian Produksi (PPIC)',
  tags: ['industri'],
  summary: 'Takt time, keseimbangan lini perakitan, dan stasiun bottleneck yang menentukan berapa produk bisa dibuat per shift.',
  story: `
    <p><strong>Studi kasus: Lini perakitan kipas angin di Sidoarjo.</strong> Bagian marketing meminta 400 kipas per shift. Satu shift 8 jam (480 menit) dengan istirahat total 60 menit.</p>
    <p>Bagian PPIC (Production Planning and Inventory Control) menghitung <em>takt time</em>: irama produksi yang harus diikuti agar permintaan terpenuhi. Total waktu kerja merakit satu kipas adalah 300 detik, yang dibagi ke beberapa stasiun kerja.</p>
    <p>Masalahnya, stasiun pemasangan motor butuh waktu lebih lama dari stasiun lain. Stasiun paling lambat ini, <em>bottleneck</em>, menentukan kecepatan seluruh lini, sama seperti rantai yang hanya sekuat mata rantai terlemahnya.</p>`,
  concept: 'Takt = waktu tersedia / permintaan &nbsp;·&nbsp; N<sub>min</sub> = ⌈Σt / takt⌉ &nbsp;·&nbsp; Efisiensi = Σt / (N · c)',
  conceptNote: 'c adalah waktu siklus lini, yaitu waktu stasiun paling lambat. Jika c > takt, permintaan tidak akan terpenuhi tanpa lembur atau penyeimbangan ulang.',
  equations: [
    {
      f: 'Takt = (T<sub>shift</sub> − T<sub>istirahat</sub>) / D', meaning: 'Setiap berapa detik satu produk jadi harus keluar dari lini agar permintaan terpenuhi.',
      symbols: [['Takt', 'Takt time', 'detik/unit'], ['T', 'Waktu shift dan istirahat', 'menit'], ['D', 'Permintaan per shift', 'unit']],
    },
    {
      f: 'N<sub>min</sub> = ⌈Σt / Takt⌉', meaning: 'Jumlah stasiun paling sedikit secara teori: total pekerjaan dibagi waktu yang boleh dipakai tiap stasiun, dibulatkan ke atas.',
      symbols: [['Σt', 'Total waktu kerja merakit satu produk', 'detik'], ['⌈ ⌉', 'Pembulatan ke atas', '']],
    },
    {
      f: 'Output = Waktu tersedia / c · Efisiensi = Σt / (N · c)', meaning: 'Lini hanya secepat stasiun terlambat. Efisiensi menunjukkan berapa persen waktu stasiun benar-benar dipakai bekerja.',
      symbols: [['c', 'Waktu siklus = waktu stasiun bottleneck', 'detik'], ['N', 'Jumlah stasiun', 'stasiun']],
    },
  ],
  params: [
    { key: 'demand', label: 'Permintaan per shift', min: 100, max: 1200, step: 10, value: 400, unit: 'unit' },
    { key: 'shift', label: 'Panjang shift', min: 240, max: 600, step: 10, value: 480, unit: 'menit' },
    { key: 'brk', label: 'Istirahat', min: 0, max: 120, step: 5, value: 60, unit: 'menit' },
    { key: 'work', label: 'Total waktu kerja Σt', min: 60, max: 900, step: 10, value: 300, unit: 'detik' },
    { key: 'N', label: 'Jumlah stasiun', min: 1, max: 12, step: 1, value: 6, unit: 'stasiun' },
    { key: 'bott', label: 'Waktu stasiun motor', min: 10, max: 200, step: 1, value: 70, unit: 'detik' },
  ],
  compute(p) {
    const out = output(p);
    return [
      { label: 'Takt time', value: takt(p), unit: 'detik/unit', digits: 1, main: true },
      { label: 'Stasiun minimum (teori)', value: minStations(p), unit: 'stasiun', digits: 0 },
      { label: 'Waktu siklus lini (bottleneck)', value: cycle(p), unit: 'detik', digits: 1 },
      { label: 'Output per shift', value: out, unit: 'unit', digits: 0 },
      { label: 'Pemenuhan permintaan', value: Math.min(100, (out / p.demand) * 100), unit: '%', digits: 1 },
      { label: 'Efisiensi lini', value: efficiency(p), unit: '%', digits: 1 },
    ];
  },
  view: { camera: [0, 10, 16], target: [0, 1.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc9cfc4 });
    scene.add(mesh(new THREE.BoxGeometry(20, 0.25, 1.4), mat(0x2d3640), { y: 0.9 }));
    const stations = Array.from({ length: 12 }, () => {
      const g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(1.2, 1.6, 1.2), mat(0x5f87b3), { y: 0.8, z: -1.6 }));
      const bar = mesh(new THREE.BoxGeometry(0.5, 1, 0.5), mat(0x5fd6c4), { z: -1.6 });
      g.add(bar); g.userData.bar = bar;
      scene.add(g); return g;
    });
    // garis takt: batas tinggi bar yang tidak boleh dilewati
    const taktLine = mesh(new THREE.BoxGeometry(20, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0xffa36b }), { z: -1.6, shadow: false });
    scene.add(taktLine);
    const items = Array.from({ length: 14 }, () => {
      const it = mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 20), mat(0xf2f2f2), {});
      it.rotation.x = Math.PI / 2; scene.add(it); return it;
    });
    const tag = label('', { size: 0.6 });
    tag.position.set(0, 6.5, 0);
    scene.add(tag);
    const H = 0.03; // tinggi bar per detik
    return {
      update(p, t) {
        const times = stationTimes(p), span = 18 / p.N, c = cycle(p);
        stations.forEach((s, i) => {
          s.visible = i < p.N;
          s.position.x = -9 + span * (i + 0.5);
          const h = Math.max(0.05, times[i] * H);
          s.userData.bar.scale.y = h;
          s.userData.bar.position.y = 1.6 + h / 2;
          s.userData.bar.material.color.set(times[i] > takt(p) ? 0xe05a4f : times[i] === c && p.N > 1 ? 0xffd36b : 0x5fd6c4);
        });
        taktLine.position.y = 1.6 + takt(p) * H;
        // produk melangkah satu stasiun setiap c detik (diskalakan agar terlihat)
        const step = (t * 60) / c;
        items.forEach((it, k) => {
          const x = ((step + k * (p.N / items.length)) % p.N);
          it.position.set(-9 + span * x + span / 2, 1.15, 0);
        });
        tag.setText(`Takt ${takt(p).toFixed(1)} s · siklus ${c.toFixed(1)} s · ${output(p)} unit/shift`);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Shift 480 menit dengan istirahat 60 menit, permintaan 400 kipas per shift. Berapa takt time-nya?',
      preset: { shift: 480, brk: 60, demand: 400 }, answer: 63, tolerance: 0.01, unit: 'detik/unit',
      explain: 'Waktu tersedia = 420 menit = 25.200 detik. Takt = 25.200 / 400 = 63 detik per kipas.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung', integer: true,
      prompt: 'Total waktu kerja merakit satu kipas 300 detik dan takt time 63 detik. Berapa jumlah stasiun minimum secara teori?',
      preset: { work: 300, shift: 480, brk: 60, demand: 400 }, answer: 5, tolerance: 0, unit: 'stasiun',
      explain: '300 / 63 = 4,76, dibulatkan ke atas menjadi 5 stasiun.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus', integer: true,
      prompt: 'Lini memakai 6 stasiun, tetapi stasiun pemasangan motor butuh 70 detik (stasiun lain lebih cepat). Dengan waktu tersedia 420 menit, berapa kipas yang bisa dihasilkan per shift?',
      preset: { N: 6, bott: 70, shift: 480, brk: 60, work: 300 }, answer: 360, tolerance: 0, unit: 'unit',
      explain: 'Lini bergerak seirama stasiun paling lambat: 25.200 / 70 = 360 kipas, kurang 40 dari target 400 karena 70 s > takt 63 s.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Menurut Theory of Constraints, menambah operator di stasiun yang BUKAN bottleneck akan…',
      options: ['Menaikkan output lini secara sebanding', 'Tidak menaikkan output lini; hanya menambah antrean barang setengah jadi di depan bottleneck', 'Menurunkan takt time', 'Menghilangkan bottleneck'], answer: 1,
      explain: 'Output sistem ditentukan oleh kendala (bottleneck). Perbaikan di tempat lain tidak menambah output dan justru menumpuk WIP.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Sistem apa yang secara otomatis menghitung kebutuhan komponen (motor, baling-baling, sekrup) dari jadwal induk produksi dan daftar bahan (BOM)?',
      options: ['MRP/ERP (Material Requirements Planning)', 'CAD', 'SCADA pembangkit listrik', 'Spreadsheet nilai siswa'], answer: 0,
      explain: 'MRP mengurai Master Production Schedule menggunakan Bill of Materials, mengurangi stok yang ada, lalu menjadwalkan pembelian dan produksi komponen. Modul ini bagian dari ERP seperti SAP atau Odoo.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Cara rekayasa mana yang paling tepat agar lini mencapai 400 kipas per shift tanpa lembur?',
      preset: { bott: 63 },
      options: ['Mempercepat ban berjalan saja', 'Menyeimbangkan ulang lini: memecah tugas stasiun motor (atau menambah stasiun paralel/jig) sampai waktunya ≤ 63 detik', 'Menambah stasiun pengemasan', 'Mengurangi jumlah stasiun'], answer: 1,
      explain: 'Waktu siklus harus ≤ takt. Memindahkan sebagian tugas, memakai jig/alat bantu, atau membuat dua stasiun motor paralel menurunkan waktu bottleneck. Geser slider "Waktu stasiun motor" ke 63 detik.',
    },
  ],
};
