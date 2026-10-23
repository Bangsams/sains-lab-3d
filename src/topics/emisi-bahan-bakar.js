import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

// Data bahan bakar: jumlah atom C, H, O; massa molar g/mol; nilai kalor bawah MJ/kg
const FUELS = [
  { name: 'Metana (gas alam/CNG)', f: 'CH₄', C: 1, H: 4, O: 0, M: 16.04, LHV: 50.0 },
  { name: 'Oktana (bensin)', f: 'C₈H₁₈', C: 8, H: 18, O: 0, M: 114.23, LHV: 44.4 },
  { name: 'Etanol (bioetanol)', f: 'C₂H₅OH', C: 2, H: 6, O: 1, M: 46.07, LHV: 26.8 },
  { name: 'Hidrogen', f: 'H₂', C: 0, H: 2, O: 0, M: 2.016, LHV: 120.0 },
];

const co2 = (fu, kg) => (kg * fu.C * 44.01) / fu.M;

export default {
  id: 'emisi-bahan-bakar',
  subject: 'kimia',
  title: 'Stoikiometri Emisi Bahan Bakar',
  tags: ['sehari-hari', 'energi', 'keberlanjutan'],
  summary: 'Setiap atom karbon di bahan bakar menjadi satu molekul CO₂. Bandingkan bensin, gas alam, bioetanol, dan hidrogen.',
  story: `
    <p><strong>Cerita: Sehari bersama Pak Dodi, pengemudi ojol.</strong> Motor Pak Dodi menghabiskan sekitar 1,5 liter bensin per hari. Bensin itu terlihat sedikit, tetapi CO₂ yang dihasilkan ternyata lebih berat daripada bensinnya sendiri.</p>
    <p>Hal ini terjadi karena setiap atom karbon (12 g/mol) mengikat dua atom oksigen dari udara menjadi CO₂ (44 g/mol). Oksigen dari udara menambah massa.</p>
    <p>Pemerintah mendorong bauran bioetanol (misalnya bensin E5) dan kendaraan listrik. Model 3D di samping menunjukkan molekul bahan bakar yang bereaksi dengan O₂ menjadi CO₂ dan H₂O.</p>`,
  concept: 'CₓHᵧOz + (x + y/4 − z/2) O₂ → x CO₂ + (y/2) H₂O',
  conceptNote: 'Massa CO₂ = massa bahan bakar × (x × 44,01) / M<sub>bahan bakar</sub>.',
  equations: [
    {
      "f": "CₓHᵧO<sub>z</sub> + (x + y/4 − z/2) O₂ → x CO₂ + (y/2) H₂O",
      "meaning": "Bahan bakar bereaksi dengan oksigen dari udara. Setiap atom karbon menjadi satu molekul CO₂, dan setiap dua atom hidrogen menjadi satu molekul air.",
      "symbols": [
        [
          "x, y, z",
          "Jumlah atom karbon (C), hidrogen (H), dan oksigen (O) dalam satu molekul bahan bakar",
          "buah"
        ],
        [
          "O₂",
          "Oksigen yang diambil dari udara",
          "zat"
        ],
        [
          "CO₂",
          "Karbon dioksida, gas rumah kaca",
          "zat"
        ],
        [
          "H₂O",
          "Uap air",
          "zat"
        ]
      ]
    },
    {
      "f": "m<sub>CO₂</sub> = m<sub>bb</sub> × (x × 44,01) / M",
      "meaning": "Ubah massa bahan bakar menjadi jumlah molekul (mol), kalikan dengan jumlah atom karbonnya, lalu ubah kembali menjadi massa CO₂.",
      "symbols": [
        [
          "m<sub>CO₂</sub>",
          "Massa CO₂ yang dihasilkan",
          "kg"
        ],
        [
          "m<sub>bb</sub>",
          "Massa bahan bakar yang dibakar",
          "kg"
        ],
        [
          "M",
          "Massa molar bahan bakar (massa 1 mol)",
          "g/mol"
        ],
        [
          "44,01",
          "Massa molar CO₂",
          "g/mol"
        ]
      ]
    }
  ],
  params: [
    { key: 'fuel', label: 'Bahan bakar', type: 'select', value: 1, options: FUELS.map((f, i) => ({ value: i, label: `${f.name}, ${f.f}` })) },
    { key: 'kg', label: 'Massa bahan bakar', min: 0.1, max: 50, step: 0.01, value: 1, unit: 'kg' },
  ],
  compute(p) {
    const fu = FUELS[p.fuel];
    const c = co2(fu, p.kg);
    const E = fu.LHV * p.kg;
    return [
      { label: 'CO₂ dihasilkan', value: c, unit: 'kg', digits: 2, main: true },
      { label: 'Energi panas dilepas', value: E, unit: 'MJ', digits: 1 },
      { label: 'Intensitas emisi', value: (c * 1000) / E, unit: 'g CO₂/MJ', digits: 1 },
      { label: 'H₂O dihasilkan', value: (p.kg * (fu.H / 2) * 18.015) / fu.M, unit: 'kg', digits: 2 },
      { label: 'O₂ dibutuhkan', value: (p.kg * (fu.C + fu.H / 4 - fu.O / 2) * 32) / fu.M, unit: 'kg', digits: 2 },
    ];
  },
  view: { camera: [0, 3, 11], target: [0, 1.8, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xd9dcd2, size: 16 });
    const COLORS = { C: 0x2d2d2d, H: 0xf4f4f4, O: 0xe0473a };
    const RADII = { C: 0.3, H: 0.18, O: 0.28 };
    const bondMat = mat(0xb9bec4);
    const atom = (el, pos) => mesh(new THREE.SphereGeometry(RADII[el], 20, 14), mat(COLORS[el], { roughness: 0.35 }), pos);
    const bond = (a, b) => {
      const va = new THREE.Vector3(a.x, a.y, a.z), vb = new THREE.Vector3(b.x, b.y, b.z);
      const len = va.distanceTo(vb);
      const m = mesh(new THREE.CylinderGeometry(0.06, 0.06, len, 8), bondMat);
      m.position.copy(va).add(vb).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
      return m;
    };
    // Membangun molekul dari kerangka atom berat zig-zag, lalu menambahkan H.
    const build = (fu) => {
      const g = new THREE.Group();
      if (fu.C === 0) {
        const a = { x: -0.37, y: 0, z: 0 }, b = { x: 0.37, y: 0, z: 0 };
        g.add(atom('H', a), atom('H', b), bond(a, b));
        return g;
      }
      const heavy = [...Array(fu.C).fill('C'), ...Array(fu.O).fill('O')];
      const n = heavy.length;
      const pts = heavy.map((el, i) => ({ el, x: (i - (n - 1) / 2) * 1.0, y: i % 2 ? 0.45 : -0.15, z: 0 }));
      let hLeft = fu.H;
      pts.forEach((pt, i) => {
        g.add(atom(pt.el, pt));
        if (i) g.add(bond(pts[i - 1], pt));
        const neighbors = (i > 0) + (i < n - 1);
        let need = Math.min(hLeft, (pt.el === 'C' ? 4 : 2) - neighbors);
        const up = i % 2 ? 1 : -1;
        const dirs = [[0, up, 0.85], [0, up, -0.85], [-0.9, -0.3 * up, 0], [0.9, -0.3 * up, 0], [0, -up, 0]];
        const ok = dirs.filter(([dx]) => !(dx < 0 && i > 0) && !(dx > 0 && i < n - 1));
        for (let k = 0; k < need; k++) {
          const [dx, dy, dz] = ok[k];
          const h = { x: pt.x + dx * 0.9, y: pt.y + dy * 0.9, z: dz * 0.9 };
          g.add(atom('H', h), bond(pt, h));
          hLeft--;
        }
      });
      return g;
    };
    const co2Mol = () => {
      const g = new THREE.Group();
      const c = { x: 0, y: 0, z: 0 }, o1 = { x: -0.6, y: 0, z: 0 }, o2 = { x: 0.6, y: 0, z: 0 };
      g.add(atom('C', c), atom('O', o1), atom('O', o2), bond(c, o1), bond(c, o2));
      return g;
    };
    const h2oMol = () => {
      const g = new THREE.Group();
      const o = { x: 0, y: 0, z: 0 }, h1 = { x: -0.45, y: -0.35, z: 0 }, h2 = { x: 0.45, y: -0.35, z: 0 };
      g.add(atom('O', o), atom('H', h1), atom('H', h2), bond(o, h1), bond(o, h2));
      return g;
    };
    const flame = particles(80, 0xff8c1a, 0.09, 0.85);
    scene.add(flame);
    const burner = mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.4, 24), mat(0x6c7277, { metalness: 0.6 }), { y: 0.2 });
    scene.add(burner);
    const lEq = label('', { size: 0.42 });
    lEq.position.set(0, 5.2, 0);
    const lIn = label('Reaktan', { size: 0.35 }); lIn.position.set(-2.8, 3.6, 0);
    const lOut = label('Produk', { size: 0.35 }); lOut.position.set(2.8, 4.4, 0);
    scene.add(lEq, lIn, lOut);
    let current = -1, fuelMol, products = [];
    const rebuild = (p) => {
      const fu = FUELS[p.fuel];
      if (fuelMol) scene.remove(fuelMol);
      products.forEach((m) => scene.remove(m));
      fuelMol = build(fu);
      fuelMol.position.set(-2.8, 2.2, 0);
      const s = fu.C > 4 ? 0.55 : 1;
      fuelMol.scale.setScalar(s);
      scene.add(fuelMol);
      products = [...Array(fu.C)].map(co2Mol).concat([...Array(fu.H / 2)].map(h2oMol));
      products.forEach((m, i) => { m.scale.setScalar(0.6); m.userData.i = i; scene.add(m); });
      const o2 = fu.C + fu.H / 4 - fu.O / 2;
      const fmt = (x) => (x === 1 ? '' : Number.isInteger(x) ? x : x.toFixed(1).replace('.', ','));
      lEq.setText(`${fu.f} + ${fmt(o2)} O₂ → ${fu.C ? `${fmt(fu.C)} CO₂ + ` : ''}${fmt(fu.H / 2)} H₂O`);
      current = p.fuel;
    };
    return {
      update(p, t) {
        if (p.fuel !== current) rebuild(p);
        fuelMol.rotation.y = t * 0.5;
        products.forEach((m) => {
          const i = m.userData.i, n = products.length;
          const cols = Math.ceil(Math.sqrt(n));
          m.position.set(1.6 + (i % cols) * 0.85, 1.2 + Math.floor(i / cols) * 0.8 + Math.sin(t * 1.5 + i) * 0.08, 0);
          m.rotation.y = t * 0.8 + i;
        });
        const hot = Math.min(1, 0.25 + p.kg / 10);
        for (let i = 0; i < 80; i++) {
          const f = (t * 1.2 + i * 0.0125 * 7) % 1;
          const r = (1 - f) * 0.35;
          flame.setAt(i, Math.cos(i * 2.4) * r, 0.45 + f * 1.6 * hot, Math.sin(i * 2.4) * r, 1 - f * 0.7);
        }
        flame.instanceMatrix.needsUpdate = true;
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Berapa kg CO₂ yang dihasilkan dari pembakaran sempurna 1 kg oktana (C₈H₁₈)?',
      preset: { fuel: 1, kg: 1 },
      answer: 3.08, tolerance: 0.02, unit: 'kg',
      explain: 'mol C₈H₁₈ = 1000/114,23 = 8,754 mol. CO₂ = 8 × 8,754 = 70,03 mol × 44,01 g/mol = 3082 g ≈ 3,08 kg. Massa CO₂ lebih besar karena oksigen diambil dari udara.',
    },
    {
      type: 'num', kind: 'Cerita',
      prompt: 'Motor Pak Dodi menghabiskan 1,5 L bensin per hari. Anggap bensin = oktana dengan massa jenis 0,74 kg/L. Berapa kg CO₂ yang dikeluarkan motornya setiap hari?',
      preset: { fuel: 1, kg: 1.11 },
      answer: 3.42, tolerance: 0.03, unit: 'kg',
      explain: 'Massa bensin = 1,5 × 0,74 = 1,11 kg. CO₂ = 1,11 × 3,082 ≈ 3,42 kg per hari, atau sekitar 1,2 ton per tahun.',
    },
    {
      type: 'mcq', kind: 'Studi kasus',
      prompt: 'Pilih bahan bakar "Hidrogen" pada simulasi. Mobil hidrogen tidak mengeluarkan CO₂ dari knalpot. Mengapa para ahli tetap menyebut asal hidrogennya penting?',
      preset: { fuel: 3, kg: 1 },
      options: [
        'Karena hidrogen menghasilkan CO dari knalpot',
        'Karena sebagian besar hidrogen saat ini dibuat dari gas alam (melepas CO₂); hanya hidrogen dari elektrolisis dengan listrik terbarukan yang benar-benar rendah emisi',
        'Karena pembakaran hidrogen menghasilkan H₂O₂ yang beracun',
        'Karena hidrogen tidak bisa dibakar tanpa karbon',
      ],
      answer: 1,
      explain: '2H₂ + O₂ → 2H₂O, tanpa karbon. Namun "hidrogen abu-abu" dari reformasi metana melepas ±9–10 kg CO₂ per kg H₂. Lihat topik Elektrolisis Hidrogen Hijau.',
    },
  ],
};
