import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

const AREA = 1.9;          // m² per panel (modul ±400 Wp)
const EF_GRID = 0.85;      // kg CO2 per kWh, kisaran faktor emisi jaringan listrik Indonesia
const TARIF = 1445;        // Rp per kWh, tarif rumah tangga ≥1300 VA (pembulatan)

const incidence = (p) => Math.max(0, Math.sin(((p.alpha + p.beta) * Math.PI) / 180));
const power = (p) => p.G * AREA * p.n * (p.eta / 100) * incidence(p);
const dailyKWh = (p) => p.n * AREA * (p.eta / 100) * p.psh * 0.8;

export default {
  id: 'panel-surya',
  subject: 'fisika',
  title: 'Panel Surya Atap Rumah',
  tags: ['sehari-hari', 'energi', 'keberlanjutan'],
  summary: 'Bagaimana sudut matahari, efisiensi sel, dan jumlah modul menentukan listrik yang dihasilkan PLTS atap.',
  story: `
    <p><strong>Studi kasus: Rumah Bu Sari di Klaten.</strong> Tagihan listrik keluarga Bu Sari sekitar Rp 900 ribu per bulan. Ia ingin memasang PLTS atap. Teknisi menawarkan modul 1,9 m² dengan efisiensi 20%.</p>
    <p>Di Indonesia matahari hampir tegak di atas kepala, jadi panel cukup dimiringkan 10–15°. Kemiringan kecil ini juga membuat debu luruh saat hujan. Intensitas puncak sinar matahari di permukaan bumi sekitar 1000 W/m², dan rata-rata Indonesia mendapat 4–5 <em>jam matahari puncak</em> (PSH) per hari.</p>
    <p>Pertanyaan untuk dipikirkan: berapa panel yang dibutuhkan agar tagihannya turun separuh, dan berapa ton CO₂ yang tidak jadi dilepas pembangkit batu bara?</p>`,
  concept: `P = G · A · n · η · cos θ &nbsp;·&nbsp; E<sub>harian</sub> ≈ n · A · η · PSH · PR`,
  conceptNote: 'θ adalah sudut antara sinar dan garis normal panel. PR (performance ratio) ≈ 0,8 mewakili rugi panas, kabel, dan inverter.',
  params: [
    { key: 'G', label: 'Iradiasi matahari', min: 100, max: 1100, step: 10, value: 800, unit: 'W/m²' },
    { key: 'n', label: 'Jumlah panel', min: 1, max: 20, step: 1, value: 8, unit: 'modul' },
    { key: 'eta', label: 'Efisiensi sel', min: 8, max: 26, step: 0.5, value: 20, unit: '%' },
    { key: 'alpha', label: 'Elevasi matahari', min: 5, max: 90, step: 1, value: 60, unit: '°' },
    { key: 'beta', label: 'Kemiringan panel', min: 0, max: 60, step: 1, value: 15, unit: '°' },
    { key: 'psh', label: 'Jam matahari puncak', min: 2, max: 6, step: 0.1, value: 4.5, unit: 'jam/hari' },
  ],
  compute(p) {
    const e = dailyKWh(p);
    return [
      { label: 'Daya sesaat', value: power(p), unit: 'W', digits: 0, main: true },
      { label: 'Faktor sudut (cos θ)', value: incidence(p), unit: '', digits: 3 },
      { label: 'Energi per hari', value: e, unit: 'kWh', digits: 2 },
      { label: 'Hemat tagihan per bulan', value: e * 30 * TARIF, unit: 'Rp', digits: 0 },
      { label: 'CO₂ dihindari per tahun', value: e * 365 * EF_GRID, unit: 'kg', digits: 0 },
    ];
  },
  view: { camera: [11, 9, 16], target: [2, 3.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xb9cbb5 });
    const house = new THREE.Group();
    house.add(mesh(new THREE.BoxGeometry(6, 3, 5), mat(0xe9e2d0), { y: 1.5 }));
    house.add(mesh(new THREE.BoxGeometry(6.4, 0.2, 5.4), mat(0x8a8f93), { y: 3.1 }));
    house.add(mesh(new THREE.BoxGeometry(1, 2, 0.1), mat(0x7a4b2a), { x: 1.5, y: 1, z: 2.52 }));
    house.add(mesh(new THREE.BoxGeometry(1.2, 1, 0.1), mat(0x9cc3d5, { metalness: 0.4 }), { x: -1.4, y: 1.7, z: 2.52 }));
    scene.add(house);

    const panelMat = mat(0x1b2f5a, { metalness: 0.5, roughness: 0.3 });
    const frameMat = mat(0xc9ced3, { metalness: 0.7 });
    const panels = [];
    for (let i = 0; i < 20; i++) {
      const g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(0.95, 0.05, 1.8), frameMat));
      g.add(mesh(new THREE.BoxGeometry(0.88, 0.06, 1.72), panelMat));
      // rotasi 90° di sumbu Y supaya sisi panjang menghadap matahari (arah +x)
      const holder = new THREE.Group();
      holder.add(g);
      holder.position.set(-2.2 + (i % 5) * 1.05, 3.4, -1.6 + Math.floor(i / 5) * 1.05);
      g.rotation.y = Math.PI / 2;
      scene.add(holder);
      panels.push(holder);
    }

    const sun = mesh(new THREE.SphereGeometry(0.8, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffc23d }), { shadow: false });
    scene.add(sun);
    const rays = particles(120, 0xffd35a, 0.06);
    scene.add(rays);
    const tag = label('', { size: 0.7 });
    tag.position.set(0, 6.2, 0);
    scene.add(tag);

    return {
      update(p, t) {
        const a = (p.alpha * Math.PI) / 180;
        const R = 12;
        sun.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
        const b = (p.beta * Math.PI) / 180;
        panels.forEach((h, i) => {
          h.visible = i < p.n;
          h.rotation.z = -b; // panel condong ke arah matahari
        });
        // sinar bergerak dari matahari ke panel; kepadatan ∝ daya
        const k = incidence(p) * (p.G / 1100);
        const active = Math.round(120 * k);
        const dir = sun.position.clone().normalize();
        for (let i = 0; i < 120; i++) {
          const target = panels[i % Math.max(1, p.n)].position;
          const f = (t * 0.6 + i * 0.137) % 1;
          const pos = target.clone().addScaledVector(dir, (1 - f) * R);
          rays.setAt(i, pos.x, pos.y, pos.z, i < active ? 1 : 0);
        }
        rays.instanceMatrix.needsUpdate = true;
        tag.setText(`${Math.round(power(p)).toLocaleString('id-ID')} W`);
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Cerita',
      prompt: 'Pukul 12.00 matahari menyinari atap Bu Sari tegak lurus terhadap panel (cos θ = 1). Ia memasang 6 panel berukuran 1,9 m² dengan efisiensi 20% dan iradiasi 1000 W/m². Berapa daya listrik yang dihasilkan saat itu?',
      preset: { G: 1000, n: 6, eta: 20, alpha: 75, beta: 15 },
      answer: 2280, tolerance: 0.02, unit: 'W',
      explain: 'P = G·A·n·η·cos θ = 1000 × 1,9 × 6 × 0,20 × 1 = 2280 W. Atur slider elevasi + kemiringan = 90° untuk melihat sinar tegak lurus.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa panel surya di Jakarta (≈6° LS) cukup dimiringkan 10–15°, sedangkan di Jerman (≈51° LU) dimiringkan sekitar 35°?',
      preset: { alpha: 80, beta: 10 },
      options: [
        'Karena panel di Indonesia lebih efisien',
        'Karena di dekat khatulistiwa matahari tinggi di langit, sehingga panel hampir datar sudah menghadap matahari; kemiringan kecil juga membantu air hujan membersihkan debu',
        'Karena angin di Indonesia lebih kencang',
        'Karena iradiasi di Jerman lebih besar',
      ],
      answer: 1,
      explain: 'Faktor sudut = sin(α + β). Jika elevasi α sudah tinggi (≈75–85°), β kecil sudah membuat α + β mendekati 90°. Di lintang tinggi α rendah, jadi β harus lebih besar.',
    },
    {
      type: 'num', kind: 'Studi kasus',
      prompt: 'Bu Sari akhirnya memasang 8 panel (1,9 m², η = 20%). Klaten mendapat 4,5 jam matahari puncak per hari dan performance ratio sistem 0,8. Jika faktor emisi jaringan 0,85 kg CO₂/kWh, berapa kg CO₂ yang dihindari dalam setahun?',
      preset: { n: 8, eta: 20, psh: 4.5 },
      answer: 3395, tolerance: 0.03, unit: 'kg CO₂',
      explain: 'E = 8 × 1,9 × 0,20 × 4,5 × 0,8 = 10,94 kWh/hari → 3994 kWh/tahun → 3994 × 0,85 ≈ 3395 kg CO₂ (≈3,4 ton).',
    },
  ],
};
