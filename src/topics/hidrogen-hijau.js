import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

const F = 96485;      // C/mol
const M_H2 = 2.016;   // g/mol
const VM = 24.5;      // L/mol pada 25 °C, 1 atm
const molH2 = (p) => (p.I * p.t * 3600 * (p.eta / 100)) / (2 * F);

export default {
  id: 'hidrogen-hijau',
  subject: 'kimia',
  title: 'Elektrolisis Hidrogen Hijau',
  tags: ['industri', 'energi', 'keberlanjutan'],
  summary: 'Listrik dari surya atau angin memecah air menjadi H₂ dan O₂. Hukum Faraday menghitung berapa hidrogen yang dihasilkan.',
  story: `
    <p><strong>Studi kasus: Pabrik pupuk dan hidrogen hijau.</strong> Pabrik amonia di Indonesia selama ini membuat hidrogen dari gas alam, dan prosesnya melepas CO₂. Beberapa BUMN energi mulai menguji <em>green hydrogen plant</em>: elektroliser yang ditenagai listrik terbarukan.</p>
    <p>Di dalam elektroliser, air terurai: di katoda terbentuk gas hidrogen, di anoda terbentuk gas oksigen. Setiap molekul H₂ membutuhkan 2 elektron, jadi jumlah hidrogen ditentukan oleh total muatan listrik yang mengalir.</p>
    <p>Tantangannya adalah energi. Elektroliser nyata membutuhkan sekitar 50–55 kWh listrik untuk setiap kilogram hidrogen.</p>`,
  concept: 'Katoda: 2H₂O + 2e⁻ → H₂ + 2OH⁻ &nbsp;·&nbsp; n(H₂) = (I · t · η) / (2F)',
  conceptNote: 'F = 96.485 C/mol (konstanta Faraday). η adalah efisiensi arus. Energi listrik = V · I · t.',
  equations: [
    {
      "f": "2H₂O + 2e⁻ → H₂ + 2OH⁻",
      "meaning": "Di kutub negatif (katoda), molekul air menerima elektron dari listrik lalu melepaskan gas hidrogen. Di kutub positif (anoda) terbentuk gas oksigen.",
      "symbols": [
        [
          "H₂O",
          "Air",
          "zat"
        ],
        [
          "e⁻",
          "Elektron yang dialirkan sumber listrik",
          "partikel"
        ],
        [
          "H₂",
          "Gas hidrogen (bahan bakar bersih)",
          "zat"
        ],
        [
          "OH⁻",
          "Ion hidroksida yang tertinggal di air",
          "ion"
        ]
      ]
    },
    {
      "f": "n(H₂) = (I · t · η) / (2F)",
      "meaning": "Jumlah hidrogen sebanding dengan banyaknya listrik yang dialirkan. Setiap molekul H₂ butuh 2 elektron, karena itu ada angka 2 di penyebut.",
      "symbols": [
        [
          "n(H₂)",
          "Jumlah hidrogen yang terbentuk",
          "mol"
        ],
        [
          "I",
          "Arus listrik",
          "A (ampere)"
        ],
        [
          "t",
          "Lama listrik dialirkan",
          "s (detik)"
        ],
        [
          "η",
          "Efisiensi arus: bagian listrik yang benar-benar dipakai memecah air",
          "%"
        ],
        [
          "F",
          "Konstanta Faraday: muatan listrik dari 1 mol elektron = 96.485",
          "C/mol"
        ]
      ]
    },
    {
      "f": "E = V · I · t",
      "meaning": "Energi listrik yang dipakai sama dengan tegangan × arus × waktu. Inilah yang menentukan biaya membuat hidrogen.",
      "symbols": [
        [
          "E",
          "Energi listrik",
          "J atau kWh"
        ],
        [
          "V",
          "Tegangan sel",
          "V (volt)"
        ]
      ]
    }
  ],
  params: [
    { key: 'I', label: 'Arus listrik', min: 1, max: 200, step: 1, value: 50, unit: 'A' },
    { key: 't', label: 'Waktu operasi', min: 0.5, max: 24, step: 0.5, value: 8, unit: 'jam' },
    { key: 'eta', label: 'Efisiensi arus', min: 60, max: 100, step: 1, value: 90, unit: '%' },
    { key: 'V', label: 'Tegangan sel', min: 1.5, max: 2.5, step: 0.05, value: 2.0, unit: 'V' },
  ],
  compute(p) {
    const n = molH2(p);
    const kWh = (p.V * p.I * p.t) / 1000;
    const kg = (n * M_H2) / 1000;
    return [
      { label: 'Massa H₂', value: n * M_H2, unit: 'g', digits: 1, main: true },
      { label: 'Mol H₂', value: n, unit: 'mol', digits: 2 },
      { label: 'Volume H₂ (25 °C)', value: n * VM, unit: 'L', digits: 0 },
      { label: 'Volume O₂ (25 °C)', value: (n / 2) * VM, unit: 'L', digits: 0 },
      { label: 'Energi listrik', value: kWh, unit: 'kWh', digits: 2 },
      { label: 'Konsumsi energi', value: kg > 0 ? kWh / kg : 0, unit: 'kWh/kg H₂', digits: 1 },
    ];
  },
  view: { camera: [0, 3.5, 9], target: [0, 1.6, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xd3d9dc, size: 14 });
    scene.add(mesh(new THREE.BoxGeometry(6, 0.2, 3), mat(0x9aa4ab), { y: 0.1 }));
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xdff3ff, transparent: true, opacity: 0.25, roughness: 0.05, transmission: 0.6, side: THREE.DoubleSide });
    scene.add(mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.6, 48, 1, true), glass, { y: 1.5 }));
    scene.add(mesh(new THREE.CylinderGeometry(1.55, 1.55, 2.0, 48), mat(0x7cc3e8, { transparent: true, opacity: 0.45 }), { y: 1.2, shadow: false }));
    const cath = mesh(new THREE.BoxGeometry(0.3, 2.6, 0.6), mat(0x8c99a6, { metalness: 0.8, roughness: 0.3 }), { x: -0.8, y: 1.7 });
    const anod = mesh(new THREE.BoxGeometry(0.3, 2.6, 0.6), mat(0xb8875a, { metalness: 0.8, roughness: 0.3 }), { x: 0.8, y: 1.7 });
    scene.add(cath, anod);
    // sumber listrik terbarukan: panel surya kecil
    const pv = mesh(new THREE.BoxGeometry(1.8, 0.06, 1.2), mat(0x1b2f5a, { metalness: 0.5 }), { y: 4.4 });
    pv.rotation.x = -0.4;
    scene.add(pv);
    const wire = new THREE.MeshBasicMaterial({ color: 0x333333 });
    scene.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6), wire, { x: -0.8, y: 3.6 }));
    scene.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6), wire, { x: 0.8, y: 3.6 }));
    const N = 160;
    const h2 = particles(N, 0xf5f7fa, 0.07);
    const o2 = particles(N / 2, 0xff7a6b, 0.09);
    scene.add(h2, o2);
    const electrons = particles(30, 0xffd23a, 0.06);
    scene.add(electrons);
    const lh = label('H₂ (katoda −)', { size: 0.35 }); lh.position.set(-1.6, 3.2, 0.8);
    const lo = label('O₂ (anoda +)', { size: 0.35 }); lo.position.set(1.6, 3.2, 0.8);
    const tag = label(''); tag.position.set(0, 5.3, 0);
    scene.add(lh, lo, tag);
    const seed = (i, k) => ((i * k) % 101) / 101;
    return {
      update(p, t) {
        const rate = (p.I / 200) * (p.eta / 100);
        const activeH = Math.round(N * (0.15 + 0.85 * rate));
        for (let i = 0; i < N; i++) {
          const f = (t * (0.35 + rate * 0.5) + seed(i, 37)) % 1;
          h2.setAt(i, -0.8 + (seed(i, 53) - 0.5) * 0.5 - 0.2, 0.3 + f * 1.9, (seed(i, 71) - 0.5) * 0.6, i < activeH ? 1 - f * 0.3 : 0);
        }
        // O₂ lahir setengah kali lebih sedikit dari H₂ (perbandingan 2 : 1)
        for (let i = 0; i < N / 2; i++) {
          const f = (t * (0.35 + rate * 0.5) + seed(i, 43)) % 1;
          o2.setAt(i, 0.8 + (seed(i, 29) - 0.5) * 0.5 + 0.2, 0.3 + f * 1.9, (seed(i, 17) - 0.5) * 0.6, i < activeH / 2 ? 1 - f * 0.3 : 0);
        }
        for (let i = 0; i < 30; i++) {
          const f = (t * (0.2 + rate) + i / 30) % 1;
          const ang = f * Math.PI;
          electrons.setAt(i, Math.cos(ang) * 0.8, 3.0 + Math.sin(ang) * 1.3, 0, 1);
        }
        h2.instanceMatrix.needsUpdate = o2.instanceMatrix.needsUpdate = electrons.instanceMatrix.needsUpdate = true;
        tag.setText(`${(molH2(p) * M_H2).toFixed(1)} g H₂`);
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Sebuah elektroliser laboratorium dialiri arus 100 A selama 10 jam dengan efisiensi arus 100%. Berapa gram hidrogen yang dihasilkan?',
      preset: { I: 100, t: 10, eta: 100 },
      answer: 37.6, tolerance: 0.02, unit: 'g',
      explain: 'Q = 100 × 36.000 = 3,6 × 10⁶ C. n(H₂) = Q/(2F) = 3,6 × 10⁶ / 192.970 ≈ 18,66 mol. Massa = 18,66 × 2,016 ≈ 37,6 g.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Perhatikan gelembung di model 3D. Pada elektrolisis air, perbandingan volume gas H₂ di katoda dan O₂ di anoda adalah …',
      preset: { I: 150 },
      options: ['1 : 1', '1 : 2', '2 : 1', '4 : 1'],
      answer: 2,
      explain: '2H₂O → 2H₂ + O₂. Dari 4 elektron terbentuk 2 molekul H₂ dan 1 molekul O₂. Menurut hukum Avogadro, volume sebanding dengan jumlah mol, jadi 2 : 1.',
    },
    {
      type: 'num', kind: 'Studi kasus',
      prompt: 'Sebuah pilot plant hidrogen hijau mengoperasikan elektroliser pada 2,0 V per sel dengan efisiensi arus 100%. Berapa kWh listrik yang dibutuhkan untuk menghasilkan 1 kg H₂?',
      preset: { V: 2.0, eta: 100, I: 200, t: 24 },
      answer: 53.2, tolerance: 0.03, unit: 'kWh',
      explain: 'n = 1000/2,016 = 496 mol. Q = 496 × 2 × 96.485 ≈ 9,57 × 10⁷ C. E = Q × V = 1,914 × 10⁸ J = 191,4 MJ ÷ 3,6 = 53,2 kWh. Karena itu harga listrik terbarukan menentukan harga hidrogen hijau.',
    },
  ],
};
