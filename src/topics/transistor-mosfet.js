import { mat, mesh, ground, label, particles, arrow } from '../lib/helpers.js';

const vov = (p) => p.vgs - p.vt;
const region = (p) => (vov(p) <= 0 ? 'Mati (cut-off)' : p.vds < vov(p) ? 'Linier (triode)' : 'Saturasi');
function current(p) { // µA
  const v = vov(p);
  if (v <= 0) return 0;
  if (p.vds < v) return p.k * (v * p.vds - (p.vds * p.vds) / 2);
  return 0.5 * p.k * v * v;
}

export default {
  id: 'transistor-mosfet',
  subject: 'semikonduktor',
  title: 'Cara Kerja Transistor MOSFET',
  tags: ['sehari-hari', 'energi'],
  summary: 'Saklar mikroskopis yang dibuka-tutup oleh tegangan gerbang: dasar dari setiap 0 dan 1 di dalam chip.',
  story: `
    <p><strong>Miliaran saklar di saku kita.</strong> Prosesor ponsel berisi lebih dari 15 miliar transistor MOSFET (Metal–Oxide–Semiconductor Field-Effect Transistor). Masing-masing bekerja sebagai saklar yang dikendalikan tegangan, bukan tangan.</p>
    <p>Pada nMOS, badan transistor adalah silikon tipe-p. Di kiri dan kanan ada daerah tipe-n yang kaya elektron: <em>source</em> dan <em>drain</em>. Di atasnya ada gerbang (<em>gate</em>) yang dipisahkan lapisan oksida setipis beberapa atom.</p>
    <p>Saat tegangan gate V<sub>GS</sub> melewati tegangan ambang V<sub>T</sub>, medan listrik menarik elektron ke permukaan dan membentuk <em>kanal</em> yang menghubungkan source dan drain. Arus mengalir: saklar ON (logika 1). Jika V<sub>GS</sub> di bawah V<sub>T</sub>, kanal hilang: saklar OFF (logika 0).</p>
    <p>Gerbang logika dibuat dari pasangan nMOS dan pMOS (CMOS) sehingga hampir tidak ada arus saat diam. Daya terbuang terutama ketika transistor berpindah keadaan, sesuai P = α·C·V²·f.</p>`,
  concept: 'I<sub>D</sub> = ½·k·(V<sub>GS</sub> − V<sub>T</sub>)² (saturasi) &nbsp;·&nbsp; I<sub>D</sub> = k·[(V<sub>GS</sub> − V<sub>T</sub>)·V<sub>DS</sub> − V<sub>DS</sub>²/2] (linier) &nbsp;·&nbsp; P = α·C·V²·f',
  conceptNote: 'Model kuadrat ini cocok untuk transistor berukuran besar. Transistor nanometer mengalami kejenuhan kecepatan dan efek kanal pendek, tetapi prinsip saklar-nya sama.',
  equations: [
    {
      f: 'I<sub>D</sub> = ½ · k · (V<sub>GS</sub> − V<sub>T</sub>)²', meaning: 'Saat saturasi, arus drain bergantung pada kuadrat kelebihan tegangan gate di atas ambang. Tegangan gate dinaikkan sedikit, arus naik banyak.',
      symbols: [['I<sub>D</sub>', 'Arus drain', 'µA'], ['k', 'Parameter transkonduktansi (bergantung lebar/panjang kanal)', 'µA/V²'], ['V<sub>GS</sub>', 'Tegangan gate terhadap source', 'V'], ['V<sub>T</sub>', 'Tegangan ambang', 'V']],
    },
    {
      f: 'I<sub>D</sub> = k · [(V<sub>GS</sub> − V<sub>T</sub>) · V<sub>DS</sub> − V<sub>DS</sub>² / 2]', meaning: 'Saat V<sub>DS</sub> masih kecil, transistor berperilaku seperti resistor yang nilainya diatur gate.',
      symbols: [['V<sub>DS</sub>', 'Tegangan drain terhadap source', 'V']],
    },
    {
      f: 'P = α · C · V² · f', meaning: 'Daya yang dipakai chip untuk berpindah 0↔1. Menurunkan tegangan sangat efektif karena pengaruhnya kuadrat.',
      symbols: [['α', 'Faktor aktivitas (bagian transistor yang berpindah tiap siklus)', '0–1'], ['C', 'Kapasitansi total yang diisi-kosongkan', 'F'], ['V', 'Tegangan catu', 'V'], ['f', 'Frekuensi clock', 'Hz']],
    },
  ],
  params: [
    { key: 'vgs', label: 'Tegangan gate V_GS', min: 0, max: 5, step: 0.05, value: 2, unit: 'V' },
    { key: 'vt', label: 'Tegangan ambang V_T', min: 0.3, max: 1.5, step: 0.05, value: 0.7, unit: 'V' },
    { key: 'vds', label: 'Tegangan drain V_DS', min: 0, max: 5, step: 0.05, value: 3, unit: 'V' },
    { key: 'k', label: 'Parameter k', min: 20, max: 1000, step: 10, value: 200, unit: 'µA/V²' },
  ],
  compute(p) {
    return [
      { label: 'Arus drain I_D', value: current(p), unit: 'µA', digits: 1, main: true },
      { label: 'Daerah kerja', value: region(p), text: true },
      { label: 'Tegangan lebih V_GS − V_T', value: Math.max(0, vov(p)), unit: 'V', digits: 2 },
      { label: 'Keadaan saklar', value: vov(p) > 0 ? 'ON (1)' : 'OFF (0)', text: true },
    ];
  },
  view: { camera: [0, 4.5, 11], target: [0, 0.8, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xaab3bc });
    scene.add(mesh(new THREE.BoxGeometry(8, 1.6, 3), mat(0xc9a3e6), { y: 0.8 }));            // substrat tipe-p
    const nMat = mat(0x6fa8ff);
    scene.add(mesh(new THREE.BoxGeometry(1.8, 0.8, 3.02), nMat, { x: -2.7, y: 1.21 }));         // source n+
    scene.add(mesh(new THREE.BoxGeometry(1.8, 0.8, 3.02), nMat, { x: 2.7, y: 1.21 }));          // drain n+
    scene.add(mesh(new THREE.BoxGeometry(3.4, 0.12, 3), mat(0xf4f1e8, { transparent: true, opacity: 0.85 }), { y: 1.66 })); // oksida
    const gate = mesh(new THREE.BoxGeometry(3.2, 0.5, 3), mat(0x9aa3ad, { metalness: 0.8 }), { y: 1.97 });
    scene.add(gate);
    const contactMat = mat(0xd9b45b, { metalness: 0.9, roughness: 0.3 });
    scene.add(mesh(new THREE.BoxGeometry(0.6, 1, 0.6), contactMat, { x: -2.7, y: 2.1 }), mesh(new THREE.BoxGeometry(0.6, 1, 0.6), contactMat, { x: 2.7, y: 2.1 }));
    const channel = mesh(new THREE.BoxGeometry(3.6, 0.1, 2.9), new THREE.MeshBasicMaterial({ color: 0x5fd6c4, transparent: true, opacity: 0 }), { y: 1.56, shadow: false });
    scene.add(channel);
    const e = particles(90, 0x8ad8ff, 0.07);
    scene.add(e);
    const field = [-1, 0, 1].map((x) => { const a = arrow([0, -1, 0], [x, 2.9, 0], 1, 0xffd36b); scene.add(a); return a; });
    const tS = label('Source', { size: 0.4 }); tS.position.set(-2.7, 3, 0);
    const tD = label('Drain', { size: 0.4 }); tD.position.set(2.7, 3, 0);
    const tG = label('', { size: 0.45 }); tG.position.set(0, 3.7, 0);
    scene.add(tS, tD, tG);
    const seeds = Array.from({ length: 90 }, (_, i) => [(i * 0.6180339) % 1, ((i * 0.381966) % 1) * 2.6 - 1.3]);
    return {
      update(p, t) {
        const on = vov(p) > 0, I = current(p);
        channel.material.opacity = on ? Math.min(0.85, 0.2 + vov(p) * 0.25) : 0;
        field.forEach((a) => { a.visible = p.vgs > 0.05; a.setLen(0.3 + p.vgs * 0.18); });
        const speed = I / 200;
        const active = on ? Math.min(90, 20 + Math.round(I / 6)) : 0;
        seeds.forEach(([s, z], i) => {
          if (i >= active) { e.setAt(i, 0, -50, 0, 0); return; }
          const f = (s + t * 0.25 * Math.max(0.2, speed)) % 1;
          e.setAt(i, -2.9 + f * 5.8, 1.55, z, 1);
        });
        e.instanceMatrix.needsUpdate = true;
        tG.setText(`Gate ${p.vgs.toFixed(2)} V · ${region(p)} · ${I.toFixed(0)} µA`);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Sebuah nMOS memiliki V_T = 0,7 V dan k = 200 µA/V². Dengan V_GS = 2,0 V dan V_DS = 3 V (saturasi), berapa arus drain-nya?',
      preset: { vgs: 2, vt: 0.7, vds: 3, k: 200 }, answer: 169, tolerance: 0.01, unit: 'µA',
      explain: 'V_GS − V_T = 1,3 V < V_DS, jadi saturasi. I_D = ½ × 200 × 1,3² = 100 × 1,69 = 169 µA.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Transistor dengan V_T = 1 V dan k = 100 µA/V² diberi V_GS = 3 V dan V_DS = 1 V. Berapa arus drain-nya? (periksa dulu daerah kerjanya)',
      preset: { vgs: 3, vt: 1, vds: 1, k: 100 }, answer: 150, tolerance: 0.01, unit: 'µA',
      explain: 'V_GS − V_T = 2 V > V_DS = 1 V, jadi daerah linier. I_D = 100 × (2 × 1 − 1²/2) = 100 × 1,5 = 150 µA.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Pada nMOS, apa yang membentuk kanal penghantar di antara source dan drain ketika V_GS > V_T?',
      preset: { vgs: 2.5 },
      options: ['Ion logam dari gate yang turun ke silikon', 'Medan listrik dari gate positif menarik elektron ke permukaan silikon tipe-p sehingga terbentuk lapisan inversi tipe-n', 'Lapisan oksida yang meleleh', 'Lubang (hole) yang ditarik ke gate'], answer: 1,
      explain: 'Oksida gate tidak dilewati arus. Gate dan silikon membentuk kapasitor: muatan positif di gate menginduksi elektron di permukaan, membalik tipe-p menjadi tipe-n (inversi).',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Mengapa hampir semua chip digital memakai teknologi CMOS (pasangan nMOS dan pMOS)?',
      options: ['Karena lebih mudah dibuat dengan tangan', 'Karena pada keadaan diam selalu ada salah satu transistor yang mati, sehingga hampir tidak ada arus bocor dari catu ke ground', 'Karena CMOS tidak membutuhkan silikon', 'Karena CMOS bekerja tanpa listrik'], answer: 1,
      explain: 'Pada inverter CMOS, input 0 menyalakan pMOS dan mematikan nMOS, input 1 sebaliknya. Arus besar hanya mengalir sesaat saat berpindah keadaan.',
    },
    {
      stem: 'E', type: 'num', kind: 'Engineering',
      prompt: 'Insinyur menurunkan tegangan catu prosesor dari 1,0 V ke 0,8 V (frekuensi tetap). Berapa persen daya dinamis yang dihemat?',
      answer: 36, tolerance: 0.02, unit: '%',
      explain: 'P ∝ V². (0,8/1,0)² = 0,64, jadi daya tinggal 64%: hemat 36%. Inilah sebabnya ponsel menurunkan tegangan & frekuensi saat beban ringan (DVFS).',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Sebuah chip memiliki α = 0,1, kapasitansi total C = 100 nF, tegangan 1,0 V, dan clock 3 GHz. Berapa watt daya dinamisnya?',
      answer: 30, tolerance: 0.02, unit: 'W',
      explain: 'P = 0,1 × 100×10⁻⁹ × 1,0² × 3×10⁹ = 30 W.',
    },
  ],
};
