import { mat, mesh, ground, label } from '../lib/helpers.js';

const kmh = (v) => v / 3.6;
const ke = (p) => 0.5 * p.m * kmh(p.v) ** 2;

export default {
  id: 'rem-regeneratif',
  subject: 'fisika',
  title: 'Rem Regeneratif Kendaraan Listrik',
  tags: ['sehari-hari', 'industri', 'energi'],
  summary: 'Saat mobil listrik mengerem, motor berubah menjadi generator dan mengisi ulang baterai. Berapa energi yang kembali?',
  story: `
    <p><strong>Cerita: Bus listrik TransJakarta.</strong> Sebuah bus listrik bermassa sekitar 13 ton berhenti di puluhan halte setiap rit. Pada bus diesel, energi gerak itu terbuang menjadi panas di kampas rem.</p>
    <p>Pada bus listrik, motor penggerak dibalik fungsinya menjadi generator. Roda memutar motor, motor menghasilkan listrik, dan listrik itu mengisi baterai. Rugi di motor, inverter, dan baterai membuat hanya 50–70% energi yang benar-benar kembali.</p>
    <p>Di lalu lintas kota yang padat, rem regeneratif bisa menambah jangkauan 10–25%.</p>`,
  concept: 'E<sub>k</sub> = ½ · m · v² &nbsp;·&nbsp; E<sub>kembali</sub> = η · E<sub>k</sub> &nbsp;·&nbsp; s = v² / 2a',
  conceptNote: 'Kecepatan harus diubah ke m/s (bagi 3,6). 1 Wh = 3600 J.',
  params: [
    { key: 'm', label: 'Massa kendaraan', min: 150, max: 15000, step: 50, value: 1800, unit: 'kg' },
    { key: 'v', label: 'Kecepatan awal', min: 10, max: 120, step: 1, value: 60, unit: 'km/jam' },
    { key: 'eta', label: 'Efisiensi regeneratif', min: 30, max: 80, step: 1, value: 65, unit: '%' },
    { key: 'a', label: 'Perlambatan', min: 1, max: 8, step: 0.5, value: 3, unit: 'm/s²' },
  ],
  compute(p) {
    const E = ke(p);
    const back = (E * p.eta) / 100 / 3600;
    return [
      { label: 'Energi kembali ke baterai', value: back, unit: 'Wh', digits: 1, main: true },
      { label: 'Energi kinetik awal', value: E / 1000, unit: 'kJ', digits: 1 },
      { label: 'Jarak pengereman', value: kmh(p.v) ** 2 / (2 * p.a), unit: 'm', digits: 1 },
      { label: 'Waktu pengereman', value: kmh(p.v) / p.a, unit: 's', digits: 1 },
      { label: 'Jarak tambahan (150 Wh/km)', value: (back / 150) * 1000, unit: 'm', digits: 0 },
    ];
  },
  view: { camera: [4, 5, 12], target: [0, 0.8, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xaebfa8 });
    const road = mesh(new THREE.BoxGeometry(40, 0.04, 4), mat(0x3d4247), { y: 0.02, shadow: false });
    scene.add(road);
    for (let i = -10; i < 10; i++) scene.add(mesh(new THREE.BoxGeometry(1, 0.05, 0.12), mat(0xf2f2f2), { x: i * 2, y: 0.03, shadow: false }));
    const car = new THREE.Group();
    const body = mesh(new THREE.BoxGeometry(3.4, 0.8, 1.6), mat(0x0f7b6c, { metalness: 0.3, roughness: 0.4 }), { y: 0.75 });
    const cabin = mesh(new THREE.BoxGeometry(1.8, 0.6, 1.4), mat(0xa8d4e6, { metalness: 0.5, roughness: 0.2 }), { x: -0.2, y: 1.45 });
    car.add(body, cabin);
    const wheels = [];
    [[-1.1, 0.8], [1.1, 0.8], [-1.1, -0.8], [1.1, -0.8]].forEach(([x, z]) => {
      const w = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 20), mat(0x1c1c1c), { x, y: 0.38, z });
      w.rotation.x = Math.PI / 2;
      car.add(w); wheels.push(w);
    });
    // baterai di lantai mobil: batang terisi saat mengerem
    const batt = mesh(new THREE.BoxGeometry(2.4, 0.16, 1.66), mat(0x2b2f33), { y: 0.3 });
    const fill = mesh(new THREE.BoxGeometry(1, 0.18, 1.68), mat(0x44d07b, { emissive: 0x1e6a3a }), { y: 0.3 });
    fill.geometry.translate(0.5, 0, 0);
    fill.position.x = -1.2;
    car.add(batt, fill);
    const glow = [];
    [-1.1, 1.1].forEach((x) => {
      const g = mesh(new THREE.TorusGeometry(0.45, 0.05, 8, 24), new THREE.MeshBasicMaterial({ color: 0xffb02e, transparent: true }), { x, y: 0.38, z: 0.97, shadow: false });
      car.add(g); glow.push(g);
    });
    scene.add(car);
    const tag = label('');
    scene.add(tag);
    return {
      update(p, t) {
        const s = Math.cbrt(p.m / 1800);
        car.scale.set(s, s, s);
        const v = kmh(p.v), tb = v / p.a, cruise = 2.5, period = cruise + tb + 1.5;
        const ph = t % period;
        let speed, x, braking = 0;
        const dist = (v * v) / (2 * p.a);
        const k = 18 / (v * cruise + dist); // skala tampilan agar muat di jalan
        if (ph < cruise) { speed = v; x = v * ph; }
        else if (ph < cruise + tb) { const tt = ph - cruise; speed = v - p.a * tt; x = v * cruise + v * tt - 0.5 * p.a * tt * tt; braking = 1; }
        else { speed = 0; x = v * cruise + dist; }
        car.position.x = -9 + x * k;
        wheels.forEach((w) => (w.rotation.y -= speed * 0.02));
        const charged = ph < cruise ? 0 : Math.min(1, (ph - cruise) / tb);
        fill.scale.x = 0.05 + (charged * p.eta) / 100 * 2.3;
        glow.forEach((g) => (g.material.opacity = braking ? 0.5 + 0.5 * Math.sin(t * 20) : 0));
        tag.position.set(car.position.x, 3.2 * s, 0);
        const wh = ((ke(p) * p.eta) / 100 / 3600) * charged;
        tag.setText(braking || charged ? `+${wh.toFixed(1)} Wh` : `${p.v} km/jam`);
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Cerita',
      prompt: 'Bus listrik TransJakarta bermassa 13.000 kg melaju 50 km/jam lalu berhenti di halte. Efisiensi rem regeneratifnya 60%. Berapa Wh energi yang kembali ke baterai dalam satu kali pengereman?',
      preset: { m: 13000, v: 50, eta: 60 },
      answer: 209, tolerance: 0.03, unit: 'Wh',
      explain: 'v = 50/3,6 = 13,89 m/s. Ek = ½ × 13.000 × 13,89² ≈ 1.254 kJ. Energi kembali = 0,6 × 1.254 kJ = 752 kJ = 752.000/3600 ≈ 209 Wh. Dengan 40 halte per rit, itu sekitar 8 kWh.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Jika kecepatan mobil dinaikkan dari 40 km/jam menjadi 80 km/jam, energi kinetik yang harus dibuang saat mengerem menjadi …',
      preset: { v: 80 },
      options: ['2 kali', '4 kali', '8 kali', 'Sama saja'],
      answer: 1,
      explain: 'Ek ∝ v². Kecepatan 2× membuat energi 4×, dan jarak pengereman juga 4× pada perlambatan yang sama. Inilah alasan batas kecepatan penting untuk keselamatan.',
    },
    {
      type: 'mcq', kind: 'Studi kasus',
      prompt: 'Seorang pengemudi ojol bertanya mengapa motor listriknya tidak pernah mendapat 100% energi kembali saat mengerem. Jawaban yang paling tepat adalah …',
      preset: { m: 150, v: 40, eta: 55 },
      options: [
        'Karena baterai hanya bisa diisi saat diam',
        'Karena sebagian energi hilang sebagai panas di motor, inverter, baterai, dan rem gesek yang tetap dipakai saat berhenti total',
        'Karena energi kinetik motor terlalu kecil',
        'Karena hukum kekekalan energi tidak berlaku pada kendaraan',
      ],
      answer: 1,
      explain: 'Energi tetap kekal, tetapi berubah bentuk. Setiap konversi (mekanik → listrik → kimia) punya rugi panas. Pada kecepatan rendah, generator kurang efektif sehingga rem gesek mengambil alih.',
    },
  ],
};
