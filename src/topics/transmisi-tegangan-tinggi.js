import { mat, mesh, ground, label } from '../lib/helpers.js';

const RHO = 2.82e-8; // Ω·m, aluminium
const rLine = (p) => (RHO * p.L * 1000) / (p.A * 1e-6);
const amp = (p) => (p.P * 1e6) / (p.kV * 1e3);
const loss = (p) => amp(p) ** 2 * rLine(p);           // W
const eff = (p) => Math.max(0, (p.P * 1e6 - loss(p)) / (p.P * 1e6));
const ok = (r, id) => r.parts[id] && r.parts[id].level > 0.9;

export default {
  id: 'transmisi-tegangan-tinggi',
  subject: 'listrik',
  title: 'Transmisi Tegangan Tinggi & Trafo',
  tags: ['energi', 'industri'],
  summary: 'Mengapa listrik dari PLTU dikirim lewat SUTET 150–500 kV? Hitung rugi daya I²R, rancang trafo, lalu sambungkan generator–trafo–saluran–kota di Lab Rangkaian.',
  story: `
    <p><strong>Studi kasus: Mengirim listrik dari PLTU Paiton ke Surabaya.</strong> Generator membangkitkan listrik sekitar 11–20 kV. Jika listrik ratusan megawatt dikirim pada tegangan itu, arusnya ribuan ampere dan kawat menjadi panas: sebagian besar energi hilang di jalan.</p>
    <p>Rugi di kawat sebanding dengan <em>kuadrat arus</em> (P<sub>rugi</sub> = I²R). Dengan menaikkan tegangan memakai <strong>trafo step-up</strong>, daya yang sama dikirim dengan arus jauh lebih kecil. Di dekat kota, <strong>trafo step-down</strong> menurunkan tegangan lagi ke 20 kV, lalu trafo distribusi di tiang menurunkannya ke 220 V untuk rumah.</p>
    <p>Trafo hanya bekerja pada listrik bolak-balik (AC): arus yang berubah-ubah di kumparan primer menginduksi tegangan di kumparan sekunder. Perbandingan lilitan menentukan perbandingan tegangan.</p>`,
  concept: 'I = P / V &nbsp;·&nbsp; P<sub>rugi</sub> = I² · R &nbsp;·&nbsp; R = ρ · L / A &nbsp;·&nbsp; V<sub>s</sub>/V<sub>p</sub> = N<sub>s</sub>/N<sub>p</sub>',
  conceptNote: 'Model satu fasa, faktor daya 1, dan R adalah hambatan satu kawat penghantar. Jaringan sungguhan memakai tiga fasa, tetapi pola "rugi turun sebanding 1/V²" tetap sama. ρ aluminium = 2,82 × 10⁻⁸ Ω·m.',
  equations: [
    { f: 'I = P / V', meaning: 'Untuk daya yang sama, makin tinggi tegangan, makin kecil arus yang diperlukan.', symbols: [['I', 'Arus di saluran', 'A'], ['P', 'Daya yang dikirim', 'W (1 MW = 10⁶ W)'], ['V', 'Tegangan saluran', 'V (1 kV = 1000 V)']] },
    { f: 'P<sub>rugi</sub> = I² · R', meaning: 'Panas yang terbuang di kawat. Karena arus dikuadratkan, arus 10 kali lebih kecil membuat rugi 100 kali lebih kecil.', symbols: [['P<sub>rugi</sub>', 'Daya yang hilang menjadi panas', 'W'], ['R', 'Hambatan kawat saluran', 'Ω']] },
    { f: 'R = ρ · L / A', meaning: 'Kawat yang makin panjang hambatannya makin besar; kawat yang makin tebal hambatannya makin kecil.', symbols: [['ρ', 'Hambatan jenis bahan (aluminium 2,82 × 10⁻⁸)', 'Ω·m'], ['L', 'Panjang kawat', 'm'], ['A', 'Luas penampang kawat (1 mm² = 10⁻⁶ m²)', 'm²']] },
    { f: 'η = (P − P<sub>rugi</sub>) / P', meaning: 'Efisiensi transmisi: bagian daya yang sampai di tujuan.', symbols: [['η', 'Efisiensi', '%']] },
    { f: 'V<sub>s</sub> / V<sub>p</sub> = N<sub>s</sub> / N<sub>p</sub> = I<sub>p</sub> / I<sub>s</sub>', meaning: 'Trafo ideal: tegangan sebanding jumlah lilitan, arus berbanding terbalik, sehingga daya masuk = daya keluar (V<sub>p</sub>·I<sub>p</sub> = V<sub>s</sub>·I<sub>s</sub>).', symbols: [['p, s', 'Primer (masuk) dan sekunder (keluar)', ''], ['N', 'Jumlah lilitan', 'lilitan']] },
  ],
  params: [
    { key: 'P', label: 'Daya dikirim', min: 10, max: 500, step: 10, value: 100, unit: 'MW' },
    { key: 'kV', label: 'Tegangan transmisi', type: 'select', value: 150, options: [20, 70, 150, 275, 500].map((v) => ({ value: v, label: `${v} kV${v === 500 ? ' (SUTET)' : v === 20 ? ' (distribusi)' : ''}` })) },
    { key: 'L', label: 'Panjang saluran', min: 10, max: 500, step: 10, value: 100, unit: 'km' },
    { key: 'A', label: 'Penampang kawat', min: 100, max: 1000, step: 10, value: 400, unit: 'mm²' },
  ],
  compute(p) {
    return [
      { label: 'Efisiensi transmisi', value: eff(p) * 100, unit: '%', digits: 2, main: true },
      { label: 'Arus saluran', value: amp(p), unit: 'A', digits: 0 },
      { label: 'Hambatan kawat', value: rLine(p), unit: 'Ω', digits: 2 },
      { label: 'Rugi daya', value: loss(p) / 1e6, unit: 'MW', digits: 2 },
      { label: 'Daya sampai di kota', value: Math.max(0, p.P - loss(p) / 1e6), unit: 'MW', digits: 1 },
    ];
  },
  view: { camera: [14, 9, 16], target: [0, 3, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xb9c7a8, size: 40 });
    const steel = mat(0x9aa4ae, { metalness: 0.6, roughness: 0.4 });
    const towerXs = [-12, -4, 4, 12];
    for (const x of towerXs) {
      const t = new THREE.Group();
      [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]].forEach(([dx, dz]) => {
        const leg = mesh(new THREE.CylinderGeometry(0.08, 0.14, 8, 6), steel, { x: dx * 0.6, y: 4, z: dz * 0.6 });
        leg.rotation.z = -dx * 0.06; leg.rotation.x = dz * 0.06; t.add(leg);
      });
      t.add(mesh(new THREE.BoxGeometry(0.2, 0.2, 4.6), steel, { y: 7.2 }));
      t.add(mesh(new THREE.BoxGeometry(0.2, 0.2, 3.4), steel, { y: 6 }));
      t.position.x = x;
      scene.add(t);
    }
    // pembangkit dan kota di ujung
    scene.add(mesh(new THREE.BoxGeometry(3, 3, 3), mat(0x7c8691), { x: -17, y: 1.5 }));
    scene.add(mesh(new THREE.CylinderGeometry(0.5, 0.7, 6, 16), mat(0xb0b8c0), { x: -17.5, y: 4.5, z: 1 }));
    const city = [];
    for (let i = 0; i < 6; i++) {
      const h = 1.5 + (i % 3) * 1.2;
      const m = new THREE.MeshStandardMaterial({ color: 0x55606e, emissive: 0xffd36b, emissiveIntensity: 0 });
      city.push(m);
      scene.add(mesh(new THREE.BoxGeometry(1.1, h, 1.1), m, { x: 16 + (i % 3) * 1.4, y: h / 2, z: -1 + Math.floor(i / 3) * 1.6 }));
    }
    // kabel melengkung (catenary) dengan warna sesuai panasnya
    const hot = new THREE.MeshStandardMaterial({ color: 0x444a52, emissive: 0xff5a2a, emissiveIntensity: 0 });
    for (const z of [-2.2, 0, 2.2]) {
      const pts = [];
      for (let s = 0; s <= 60; s++) {
        const x = -16 + (s / 60) * 32;
        const span = ((x + 16) % 8) / 8;
        pts.push(new THREE.Vector3(x, 7.1 - 1.2 * 4 * span * (1 - span), z * (z === 0 ? 1 : 1)));
      }
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.05, 6), hot));
    }
    const sparks = new THREE.Group();
    scene.add(sparks);
    const dots = Array.from({ length: 18 }, () => { const s = mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe08a }), { shadow: false }); sparks.add(s); return s; });
    const tag = label('', { size: 0.6 });
    tag.position.set(0, 10.5, 0);
    scene.add(tag);
    return {
      update(p, t) {
        const e = eff(p), heat = Math.min(1, (1 - e) * 4);
        hot.emissiveIntensity = heat;
        city.forEach((m) => { m.emissiveIntensity = 0.15 + 0.8 * e; });
        const speed = Math.min(3, amp(p) / 800);
        dots.forEach((d, i) => {
          const u = ((t * (0.15 + speed * 0.3) + i / dots.length) % 1);
          const x = -16 + u * 32, span = ((x + 16) % 8) / 8;
          d.position.set(x, 7.1 - 4.8 * span * (1 - span), [-2.2, 0, 2.2][i % 3]);
          d.scale.setScalar(0.6 + speed * 0.5);
        });
        tag.setText(`${p.kV} kV · I = ${Math.round(amp(p)).toLocaleString('id-ID')} A · rugi ${(loss(p) / 1e6).toFixed(2).replace('.', ',')} MW · η ${(e * 100).toFixed(1).replace('.', ',')}%`);
      },
    };
  },
  wiring: {
    title: 'Rakit Jaringan Transmisi',
    intro: 'Bandingkan mengirim listrik tanpa trafo dan dengan trafo step-up/step-down. Pembacaan alat ukur menunjukkan tegangan, arus, dan rugi daya di saluran. Generator 11 kV, saluran 20 Ω, kota membutuhkan 5 MW.',
    tasks: [
      {
        id: 'tanpa-trafo', title: 'Tanpa trafo',
        goal: 'Sambungkan generator 11 kV langsung lewat saluran 20 Ω ke beban kota. Periksa berapa persen daya yang sampai dan berapa yang menjadi panas di kawat.',
        parts: [{ id: 'G', type: 'generator', x: 40, y: 200 }, { id: 'SL', type: 'saluran', x: 330, y: 120 }, { id: 'K', type: 'kota', x: 700, y: 200 }],
        steps: [
          { a: 'G.L', b: 'SL.a', text: 'Fasa generator ke ujung awal saluran.' },
          { a: 'SL.b', b: 'K.a', text: 'Ujung akhir saluran ke fasa beban kota.' },
          { a: 'K.b', b: 'G.N', text: 'Netral beban kembali ke netral generator.' },
        ],
        check(run) {
          const r = run();
          if (!(r.parts.K.v > 1000)) return { ok: false, msg: 'Beban kota belum mendapat listrik. Pastikan jalurnya tertutup: generator → saluran → kota → kembali ke generator.' };
          const pg = r.parts.G.p, pk = r.parts.K.p, eta = pk / pg;
          return { ok: true, msg: `Hanya ${(eta * 100).toFixed(0)}% daya sampai di kota (${(pk / 1e6).toFixed(2)} MW). Arus ${r.parts.SL.i.toFixed(0)} A membuat kawat membuang ${(r.parts.SL.p / 1e6).toFixed(2)} MW sebagai panas, dan tegangan kota turun ke ${(r.parts.K.v / 1000).toFixed(1)} kV. Lanjutkan ke tugas 2.` };
        },
      },
      {
        id: 'dengan-trafo', title: 'Dengan trafo 150 kV',
        goal: 'Pasang trafo step-up 11/150 kV setelah generator, saluran yang sama, trafo step-down 150/11 kV, lalu PMT (pemutus tenaga) sebelum beban kota. Targetkan efisiensi ≥ 98% dan tegangan kota ±11 kV.',
        parts: [{ id: 'G', type: 'generator', x: 20, y: 220 }, { id: 'T1', type: 'trafoNaik', x: 200, y: 210 }, { id: 'SL', type: 'saluran', x: 380, y: 100 }, { id: 'T2', type: 'trafoTurun', x: 590, y: 210 }, { id: 'P', type: 'pmt', x: 760, y: 70 }, { id: 'K', type: 'kota', x: 800, y: 300 }],
        steps: [
          { a: 'G.L', b: 'T1.p1', text: 'Fasa generator ke primer (P) trafo step-up.' },
          { a: 'G.N', b: 'T1.p2', text: 'Netral generator ke primer kedua trafo step-up.' },
          { a: 'T1.s1', b: 'SL.a', text: 'Sekunder 150 kV ke saluran transmisi.' },
          { a: 'SL.b', b: 'T2.p1', text: 'Ujung saluran ke primer trafo step-down.' },
          { a: 'T1.s2', b: 'T2.p2', text: 'Kawat balik: sekunder kedua T1 ke primer kedua T2.' },
          { a: 'T2.s1', b: 'P.in', text: 'Keluaran 11 kV trafo step-down ke PMT.' },
          { a: 'P.out', b: 'K.a', text: 'PMT ke fasa beban kota.' },
          { a: 'T2.s2', b: 'K.b', text: 'Sekunder kedua T2 ke netral beban kota.' },
        ],
        check(run) {
          const r = run({}, { P: { on: true, tripped: false } });
          if (!ok(r, 'K')) return { ok: false, msg: `Tegangan kota ${(r.parts.K.v / 1000).toFixed(1)} kV, harus mendekati 11 kV. Periksa urutan trafo: step-up dulu, baru step-down.` };
          const eta = r.parts.K.p / r.parts.G.p;
          if (eta < 0.98) return { ok: false, msg: `Efisiensi baru ${(eta * 100).toFixed(1)}%. Saluran harus berada di sisi 150 kV (di antara kedua trafo).` };
          if (run({}, { P: { on: false } }).parts.K.v > 100) return { ok: false, msg: 'PMT harus bisa memutus listrik ke kota.' };
          return { ok: true, msg: `Efisiensi ${(eta * 100).toFixed(2)}%. Arus saluran hanya ${r.parts.SL.i.toFixed(1)} A sehingga rugi turun ke ${(r.parts.SL.p / 1000).toFixed(0)} kW (dari ±1,2 MW tanpa trafo).` };
        },
      },
      {
        id: 'distribusi', title: 'Trafo distribusi ke rumah',
        goal: 'Turunkan 11 kV menjadi 220 V dengan trafo distribusi, lalu pasang MCB dan dua lampu rumah 220 V 100 W secara paralel. (Coba juga sambung lampu langsung ke generator: lampu putus!)',
        parts: [{ id: 'G', type: 'generator', x: 30, y: 200 }, { id: 'TD', type: 'trafoDist', x: 250, y: 190 }, { id: 'MCB', type: 'mcb', x: 460, y: 80 }, { id: 'L1', type: 'lampu220', x: 640, y: 60 }, { id: 'L2', type: 'lampu220', x: 790, y: 60 }],
        steps: [
          { a: 'G.L', b: 'TD.p1', text: 'Fasa 11 kV ke primer trafo distribusi.' },
          { a: 'G.N', b: 'TD.p2', text: 'Netral generator ke primer kedua.' },
          { a: 'TD.s1', b: 'MCB.in', text: 'Sekunder 220 V (fasa) ke MCB.' },
          { a: 'MCB.out', b: 'L1.a', text: 'MCB ke kaki L lampu L1.' },
          { a: 'MCB.out', b: 'L2.a', text: 'MCB ke kaki L lampu L2.' },
          { a: 'L1.b', b: 'TD.s2', text: 'Kaki N L1 ke sekunder kedua (netral).' },
          { a: 'L2.b', b: 'TD.s2', text: 'Kaki N L2 ke netral.' },
        ],
        check(run) {
          const r = run({}, { MCB: { on: true, tripped: false }, L1: { blown: false }, L2: { blown: false } });
          if (r.comps.some((c) => c.blown)) return { ok: false, msg: 'Ada lampu yang putus karena terkena tegangan 11 kV. Lampu harus berada di sisi sekunder (220 V) trafo distribusi.' };
          if (!ok(r, 'L1') || !ok(r, 'L2')) return { ok: false, msg: 'Kedua lampu harus menyala terang pada ±220 V.' };
          if (run({}, { MCB: { on: false } }).parts.L1.v > 1) return { ok: false, msg: 'MCB harus memutus kedua lampu.' };
          return { ok: true, msg: `Lampu ${r.parts.L1.v.toFixed(0)} V. Arus sisi 220 V ${r.parts.TD.is.toFixed(2)} A, sedangkan sisi 11 kV hanya ${(r.parts.TD.ip * 1000).toFixed(1)} mA (Ip/Is = 1/50).` };
        },
      },
    ],
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Saluran mengirim daya 100 MW pada tegangan 150 kV. Berapa arusnya?',
      preset: { P: 100, kV: 150 }, answer: 100e6 / 150e3, tolerance: 0.01, unit: 'A',
      explain: 'I = P/V = 100.000.000 / 150.000 ≈ 667 A.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Daya 60 MW dikirim pada 150 kV melalui kawat berhambatan 10 Ω. Berapa MW rugi dayanya?',
      answer: (60e6 / 150e3) ** 2 * 10 / 1e6, tolerance: 0.01, unit: 'MW',
      explain: 'I = 60.000.000 / 150.000 = 400 A. P rugi = I²R = 400² × 10 = 1.600.000 W = 1,6 MW (2,7% dari 60 MW).',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Daya dan kawat yang sama dikirim pada 20 kV, bukan 150 kV. Rugi dayanya menjadi berapa kali lipat?',
      preset: { kV: 20 }, answer: (150 / 20) ** 2, tolerance: 0.01, unit: 'kali',
      explain: 'I = P/V sehingga P rugi = (P/V)² R ∝ 1/V². (150/20)² = 7,5² = 56,25 kali. Geser pilihan tegangan di simulasi dan lihat efisiensinya anjlok.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Kawat aluminium (ρ = 2,82 × 10⁻⁸ Ω·m) sepanjang 50 km dengan penampang 300 mm². Berapa hambatannya?',
      preset: { L: 50, A: 300 }, answer: (2.82e-8 * 50000) / 300e-6, tolerance: 0.01, unit: 'Ω',
      explain: 'R = ρL/A = 2,82 × 10⁻⁸ × 50.000 / (300 × 10⁻⁶) = 1,41 × 10⁻³ / 3 × 10⁻⁴ = 4,7 Ω.',
    },
    {
      stem: 'E', type: 'num', kind: 'Engineering',
      prompt: 'Trafo step-up menaikkan 11 kV menjadi 150 kV. Kumparan primernya 500 lilitan. Berapa lilitan kumparan sekunder yang dibutuhkan?',
      answer: 500 * 150 / 11, tolerance: 0.01, unit: 'lilitan',
      explain: 'Ns/Np = Vs/Vp → Ns = 500 × 150/11 ≈ 6.818 lilitan.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Trafo distribusi 20 kV/220 V mengalirkan 300 A di sisi 220 V. Berapa arus di sisi 20 kV? (anggap trafo ideal)',
      answer: 300 * 220 / 20000, tolerance: 0.01, unit: 'A',
      explain: 'Ip/Is = Vs/Vp → Ip = 300 × 220/20.000 = 3,3 A. Daya sama di kedua sisi: 20.000 × 3,3 = 220 × 300 = 66 kW.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa trafo tidak bisa dipakai untuk menaikkan tegangan listrik searah (DC) dari baterai?',
      options: ['Karena baterai terlalu kecil', 'Karena trafo bekerja berdasarkan induksi elektromagnetik yang memerlukan medan magnet yang berubah-ubah, sedangkan DC menghasilkan medan tetap', 'Karena DC tidak punya tegangan', 'Karena inti besi menolak DC'], answer: 1,
      explain: 'Hukum Faraday: tegangan induksi muncul jika fluks magnet berubah. Arus AC 50 Hz terus berubah arah sehingga menginduksi tegangan di sekunder. DC yang tetap tidak menginduksi apa pun.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Kabel bawah laut Jawa–Bali dan Sumatra–Jawa direncanakan memakai HVDC (arus searah tegangan tinggi). Apa keunggulannya untuk jarak jauh dan kabel laut?',
      options: ['DC lebih aman disentuh', 'Tidak ada rugi akibat pengisian kapasitansi kabel dan tidak perlu sinkronisasi frekuensi antar sistem, sehingga lebih efisien untuk jarak jauh', 'DC tidak memerlukan kawat', 'Agar trafo bisa dihapus seluruhnya'], answer: 1,
      explain: 'Kabel laut berperilaku seperti kapasitor besar yang terus diisi-kosongkan oleh AC. HVDC menghindari arus pengisian ini dan rugi reaktif, walaupun butuh stasiun konverter yang mahal di kedua ujung.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Untuk menurunkan rugi saluran, insinyur bisa menaikkan tegangan atau memperbesar penampang kawat. Pernyataan mana yang paling tepat?',
      options: ['Memperbesar penampang 2 kali menurunkan rugi 4 kali', 'Menaikkan tegangan 2 kali menurunkan rugi 4 kali, sedangkan memperbesar penampang 2 kali hanya menurunkan rugi 2 kali (dan kawat jadi lebih berat)', 'Keduanya tidak berpengaruh', 'Menaikkan tegangan menaikkan rugi'], answer: 1,
      explain: 'P rugi = (P/V)² · ρL/A. Rugi ∝ 1/V² tetapi hanya ∝ 1/A. Karena itu tegangan transmisi dinaikkan, lalu isolator dan tinggi menara disesuaikan.',
    },
  ],
};
