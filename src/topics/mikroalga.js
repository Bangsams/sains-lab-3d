import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

const N = (p, t = p.t) => p.K / (1 + ((p.K - p.N0) / p.N0) * Math.exp(-p.r * t));

export default {
  id: 'mikroalga',
  subject: 'biologi',
  title: 'Mikroalga untuk Biofuel',
  tags: ['industri', 'energi', 'keberlanjutan'],
  summary: 'Pertumbuhan logistik mikroalga di fotobioreaktor: cepat di awal, melambat saat mendekati daya dukung.',
  story: `
    <p><strong>Studi kasus: Fotobioreaktor di pantai utara Jawa.</strong> Sebuah tim riset membudidayakan <em>Chlorella</em> dan <em>Nannochloropsis</em> dalam tabung kaca. Mikroalga tumbuh dari CO₂ dan cahaya, dan sel-selnya mengandung minyak (lipid) 20–50% yang bisa diolah menjadi biodiesel.</p>
    <p>Di awal, sel membelah secara eksponensial. Lama-lama cahaya terhalang oleh sel lain (<em>self-shading</em>) dan nutrien menipis, sehingga populasi mendekati <strong>daya dukung K</strong>. Ini adalah kurva pertumbuhan logistik.</p>
    <p>Pertanyaan bisnisnya: kapan waktu panen terbaik, dan berapa liter minyak yang didapat dari satu reaktor?</p>`,
  concept: 'N(t) = K / [1 + ((K − N₀)/N₀) · e<sup>−rt</sup>] &nbsp;·&nbsp; t<sub>ganda</sub> = ln 2 / r',
  conceptNote: 'r = laju pertumbuhan spesifik (per hari), K = daya dukung (g/L), N₀ = biomassa awal.',
  equations: [
    {
      "f": "N(t) = K / [1 + ((K − N₀)/N₀) · e<sup>−rt</sup>]",
      "meaning": "Populasi alga mula-mula tumbuh berlipat ganda dengan cepat, lalu melambat dan berhenti di batas maksimum K karena cahaya dan nutrien tidak cukup untuk semua sel.",
      "symbols": [
        [
          "N(t)",
          "Kepadatan alga pada hari ke-t",
          "g/L"
        ],
        [
          "K",
          "Daya dukung: kepadatan paling tinggi yang bisa dicapai",
          "g/L"
        ],
        [
          "N₀",
          "Kepadatan alga di awal",
          "g/L"
        ],
        [
          "r",
          "Laju pertumbuhan per hari",
          "per hari"
        ],
        [
          "e",
          "Bilangan Euler ≈ 2,718",
          "tanpa satuan"
        ],
        [
          "t",
          "Waktu",
          "hari"
        ]
      ]
    },
    {
      "f": "t<sub>ganda</sub> = ln 2 / r",
      "meaning": "Waktu yang dibutuhkan alga untuk menjadi dua kali lipat selama masih tumbuh bebas. Makin besar r, makin cepat berlipat.",
      "symbols": [
        [
          "t<sub>ganda</sub>",
          "Waktu penggandaan",
          "hari"
        ],
        [
          "ln 2",
          "Logaritma natural dari 2 ≈ 0,693",
          "tanpa satuan"
        ]
      ]
    }
  ],
  params: [
    { key: 'r', label: 'Laju pertumbuhan r', min: 0.1, max: 1.5, step: 0.01, value: 0.6, unit: '/hari' },
    { key: 'K', label: 'Daya dukung K', min: 0.5, max: 5, step: 0.1, value: 3, unit: 'g/L' },
    { key: 'N0', label: 'Biomassa awal N₀', min: 0.05, max: 0.5, step: 0.01, value: 0.1, unit: 'g/L' },
    { key: 't', label: 'Hari ke-', min: 0, max: 30, step: 0.5, value: 8, unit: 'hari' },
    { key: 'vol', label: 'Volume reaktor', min: 100, max: 10000, step: 100, value: 1000, unit: 'L' },
    { key: 'lip', label: 'Kandungan lipid', min: 10, max: 50, step: 1, value: 30, unit: '%' },
  ],
  compute(p) {
    const n = N(p);
    const bio = (n * p.vol) / 1000;
    const lip = (bio * p.lip) / 100;
    return [
      { label: 'Biomassa', value: n, unit: 'g/L', digits: 2, main: true },
      { label: 'Waktu penggandaan', value: Math.LN2 / p.r, unit: 'hari', digits: 2 },
      { label: 'Biomassa total', value: bio, unit: 'kg', digits: 2 },
      { label: 'Lipid', value: lip, unit: 'kg', digits: 2 },
      { label: 'Biodiesel (≈90%, 0,88 kg/L)', value: (lip * 0.9) / 0.88, unit: 'L', digits: 2 },
      { label: 'Persentase dari K', value: (n / p.K) * 100, unit: '%', digits: 0 },
    ];
  },
  view: { camera: [2, 4, 11], target: [0, 2, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xd6d9cf });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.25, roughness: 0.05 });
    const fluid = mat(0x2f8f3a, { transparent: true, opacity: 0.6 });
    const tubes = 6;
    for (let i = 0; i < tubes; i++) {
      const y = 0.6 + i * 0.55;
      const t = mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 20), glass, { x: -2.5, y });
      t.rotation.z = Math.PI / 2;
      const f = mesh(new THREE.CylinderGeometry(0.17, 0.17, 4.95, 16), fluid, { x: -2.5, y, shadow: false });
      f.rotation.z = Math.PI / 2;
      scene.add(t, f);
    }
    scene.add(mesh(new THREE.BoxGeometry(0.2, 3.6, 0.6), mat(0x9aa1a7, { metalness: 0.6 }), { x: -5.1, y: 1.8 }));
    scene.add(mesh(new THREE.BoxGeometry(0.2, 3.6, 0.6), mat(0x9aa1a7, { metalness: 0.6 }), { x: 0.1, y: 1.8 }));
    const cells = particles(200, 0x1e6b25, 0.05);
    scene.add(cells);
    // grafik kurva logistik 3D di sebelah reaktor
    const plot = new THREE.Group();
    plot.position.set(1.2, 0.3, 0);
    const axis = new THREE.LineBasicMaterial({ color: 0x55605a });
    const ax = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 3.6, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(4.5, 0, 0)]);
    plot.add(new THREE.Line(ax, axis));
    const curveMat = new THREE.LineBasicMaterial({ color: 0x0f7b6c });
    const curve = new THREE.Line(new THREE.BufferGeometry(), curveMat);
    const kLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: 0xc0623a, dashSize: 0.15, gapSize: 0.1 }));
    plot.add(curve, kLine);
    const dot = mesh(new THREE.SphereGeometry(0.1, 16, 12), mat(0xd0642a, { emissive: 0x6a2a00 }));
    plot.add(dot);
    const lK = label('K', { size: 0.3 }); plot.add(lK);
    const lAx = label('waktu (0–30 hari)', { size: 0.26 }); lAx.position.set(2.3, -0.35, 0); plot.add(lAx);
    scene.add(plot);
    const tag = label(''); tag.position.set(-2.5, 4.6, 0);
    scene.add(tag);
    const Ymax = 5; // g/L yang dipetakan ke tinggi 3.4
    let key = '';
    return {
      update(p, t) {
        const k = `${p.r}|${p.K}|${p.N0}`;
        if (k !== key) {
          key = k;
          const pts = [];
          for (let d = 0; d <= 30; d += 0.25) pts.push(new THREE.Vector3((d / 30) * 4.4, (N(p, d) / Ymax) * 3.4, 0));
          curve.geometry.dispose();
          curve.geometry = new THREE.BufferGeometry().setFromPoints(pts);
          const yK = (p.K / Ymax) * 3.4;
          kLine.geometry.dispose();
          kLine.geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, yK, 0), new THREE.Vector3(4.4, yK, 0)]);
          kLine.computeLineDistances();
          lK.position.set(4.7, yK, 0);
        }
        const n = N(p);
        dot.position.set((p.t / 30) * 4.4, (n / Ymax) * 3.4, 0);
        const frac = n / 5;
        fluid.color.setHSL(0.33, 0.55, 0.75 - 0.5 * Math.min(1, frac * 1.4));
        fluid.opacity = 0.25 + 0.6 * Math.min(1, frac * 1.4);
        const visible = Math.round(200 * Math.min(1, n / 5));
        for (let i = 0; i < 200; i++) {
          const row = i % tubes, f = (t * 0.08 + (i * 0.618) % 1) % 1;
          cells.setAt(i, -4.9 + f * 4.8, 0.6 + row * 0.55 + Math.sin(i + t) * 0.08, Math.cos(i * 3.1) * 0.1, i < visible ? 1 : 0);
        }
        cells.instanceMatrix.needsUpdate = true;
        tag.setText(`Hari ${p.t} · ${n.toFixed(2)} g/L`);
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Kultur Chlorella memiliki laju pertumbuhan spesifik r = 0,5 per hari pada fase eksponensial. Berapa hari waktu yang dibutuhkan biomassa untuk menjadi dua kali lipat?',
      preset: { r: 0.5, t: 3 },
      answer: 1.386, tolerance: 0.02, unit: 'hari',
      explain: 't_ganda = ln 2 / r = 0,693 / 0,5 = 1,39 hari. Dalam 1 minggu biomassa bisa naik ±30 kali lipat jika belum dibatasi K.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Geser slider hari dari 0 ke 30. Mengapa kurva melandai saat mendekati K?',
      preset: { t: 20 },
      options: [
        'Karena sel alga berhenti membelah setelah 10 hari',
        'Karena sel saling menaungi (self-shading) dan nutrien menipis, sehingga laju pertumbuhan bersih mendekati nol',
        'Karena reaktor bocor',
        'Karena alga berubah menjadi lipid seluruhnya',
      ],
      answer: 1,
      explain: 'Pada model logistik, laju pertumbuhan = rN(1 − N/K). Saat N → K, faktor (1 − N/K) → 0. Secara biologis, cahaya dan nutrien menjadi pembatas.',
    },
    {
      type: 'num', kind: 'Studi kasus',
      prompt: 'Reaktor 1000 L dipanen saat biomassa 3 g/L dengan kandungan lipid 30%. Berapa kg lipid yang diperoleh?',
      preset: { vol: 1000, K: 3, t: 30, lip: 30 },
      answer: 0.9, tolerance: 0.02, unit: 'kg',
      explain: 'Biomassa = 3 g/L × 1000 L = 3000 g = 3 kg. Lipid = 30% × 3 = 0,9 kg, setara ±0,9 L biodiesel. Inilah alasan biofuel alga butuh reaktor sangat besar agar ekonomis.',
    },
  ],
};
