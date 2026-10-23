import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

const RHO = 1.2; // kg/m³ udara
const TSR = 7;   // tip speed ratio tipikal turbin 3 bilah
const power = (p) => 0.5 * RHO * Math.PI * p.R ** 2 * p.v ** 3 * p.cp;

export default {
  id: 'turbin-angin',
  subject: 'fisika',
  title: 'Turbin Angin Sidrap',
  tags: ['industri', 'energi', 'keberlanjutan'],
  summary: 'Daya angin naik pangkat tiga terhadap kecepatan. Ubah panjang bilah dan kecepatan angin untuk melihat dampaknya.',
  story: `
    <p><strong>Studi kasus: PLTB Sidrap, Sulawesi Selatan.</strong> Pembangkit listrik tenaga bayu pertama berskala besar di Indonesia ini memakai 30 turbin berkapasitas 2,5 MW, masing-masing dengan rotor berdiameter sekitar 114 m.</p>
    <p>Insinyur memilih lokasi di perbukitan karena angin di sana lebih stabil. Kecepatan angin hanya naik sedikit, tetapi dayanya naik banyak, karena daya angin sebanding dengan <em>v³</em>.</p>
    <p>Ada batas teoretis yang tidak bisa dilampaui turbin mana pun: <strong>batas Betz</strong>, yaitu 59,3% energi kinetik angin. Turbin modern mencapai sekitar 45–50%.</p>`,
  concept: 'P = ½ · ρ · A · v³ · C<sub>p</sub> &nbsp;·&nbsp; A = πR²',
  conceptNote: 'ρ = 1,2 kg/m³ (massa jenis udara). Cp adalah koefisien daya, maksimum 16/27 ≈ 0,593 (batas Betz).',
  params: [
    { key: 'v', label: 'Kecepatan angin', min: 2, max: 15, step: 0.5, value: 8, unit: 'm/s' },
    { key: 'R', label: 'Panjang bilah (jari-jari)', min: 10, max: 70, step: 1, value: 57, unit: 'm' },
    { key: 'cp', label: 'Koefisien daya Cp', min: 0.2, max: 0.59, step: 0.01, value: 0.45, unit: '' },
  ],
  compute(p) {
    const P = power(p);
    const rpm = ((TSR * p.v) / p.R) * (60 / (2 * Math.PI));
    const annual = (P * 0.35 * 8760) / 1000; // kWh, faktor kapasitas 35%
    return [
      { label: 'Daya listrik', value: P / 1e6, unit: 'MW', digits: 2, main: true },
      { label: 'Luas sapuan rotor', value: Math.PI * p.R ** 2, unit: 'm²', digits: 0 },
      { label: 'Putaran rotor', value: rpm, unit: 'rpm', digits: 1 },
      { label: 'Energi per tahun (CF 35%)', value: annual / 1000, unit: 'MWh', digits: 0 },
      { label: 'Setara rumah (1.800 kWh/thn)', value: annual / 1800, unit: 'rumah', digits: 0 },
    ];
  },
  view: { camera: [14, 7, 16], target: [0, 6, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xa9c59b });
    const towerH = 9;
    scene.add(mesh(new THREE.CylinderGeometry(0.18, 0.4, towerH, 16), mat(0xf2f4f5), { y: towerH / 2 }));
    const nacelle = mesh(new THREE.BoxGeometry(1.6, 0.6, 0.6), mat(0xe8ebed), { x: -0.4, y: towerH + 0.2 });
    scene.add(nacelle);
    const hub = new THREE.Group();
    hub.position.set(0.5, towerH + 0.2, 0);
    hub.add(mesh(new THREE.SphereGeometry(0.3, 16, 12), mat(0xdfe3e6)));
    const blades = [];
    for (let i = 0; i < 3; i++) {
      const pivot = new THREE.Group();
      pivot.rotation.x = (i * 2 * Math.PI) / 3;
      const blade = mesh(new THREE.BoxGeometry(0.08, 1, 0.35), mat(0xf7f8f9));
      blade.geometry.translate(0, 0.5, 0);
      pivot.add(blade);
      blades.push(blade);
      hub.add(pivot);
    }
    scene.add(hub);
    const N = 220;
    const wind = particles(N, 0x5aa9e6, 0.05, 0.75);
    scene.add(wind);
    const seeds = Array.from({ length: N }, (_, i) => [((i * 97) % 100) / 100, ((i * 61) % 100) / 100, ((i * 37) % 100) / 100]);
    const tag = label('');
    tag.position.set(0.5, towerH + 4.8, 0);
    scene.add(tag);
    let angle = 0;
    return {
      update(p, t, dt) {
        const scale = p.R / 14; // 1 unit ≈ 14 m
        blades.forEach((b) => (b.scale.set(1, scale, 1 + scale * 0.2)));
        const omega = (TSR * p.v) / p.R; // rad/s nyata
        angle += omega * dt;
        hub.rotation.x = angle;
        seeds.forEach(([a, b, c], i) => {
          const x = -14 + ((a * 28 + t * p.v * 0.9) % 28);
          wind.setAt(i, x, towerH + (b - 0.5) * 9, (c - 0.5) * 9, 1);
        });
        wind.instanceMatrix.needsUpdate = true;
        tag.setText(`${(power(p) / 1e6).toFixed(2)} MW`);
      },
    };
  },
  questions: [
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Sebuah startup mengklaim turbin barunya mampu mengubah 70% energi kinetik angin menjadi listrik. Bagaimana tanggapan seorang insinyur?',
      preset: { cp: 0.59 },
      options: [
        'Masuk akal jika bilahnya cukup panjang',
        'Tidak mungkin, batas Betz menetapkan maksimum ≈ 59,3%',
        'Mungkin, asalkan kecepatan angin di atas 15 m/s',
        'Mungkin, karena efisiensi generator modern bisa 98%',
      ],
      answer: 1,
      explain: 'Turbin harus membiarkan udara tetap mengalir keluar, sehingga tidak semua energi kinetik bisa diambil. Betz membuktikan Cp maksimum 16/27 ≈ 0,593, tidak bergantung pada ukuran bilah.',
    },
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Angin di lokasi A rata-rata 6 m/s, di lokasi B 12 m/s. Dengan turbin yang sama, daya di lokasi B berapa kali daya di lokasi A?',
      preset: { v: 12 },
      answer: 8, tolerance: 0.01, unit: 'kali',
      explain: 'P ∝ v³, sehingga (12/6)³ = 2³ = 8 kali. Coba geser slider kecepatan dari 6 ke 12 m/s dan bandingkan dayanya.',
    },
    {
      type: 'num', kind: 'Studi kasus',
      prompt: 'Turbin di PLTB Sidrap memiliki jari-jari rotor 57 m. Pada angin 8 m/s dengan Cp = 0,45 dan ρ = 1,2 kg/m³, berapa daya yang dihasilkan satu turbin (dalam MW)?',
      preset: { v: 8, R: 57, cp: 0.45 },
      answer: 1.411, tolerance: 0.03, unit: 'MW',
      explain: 'A = π × 57² ≈ 10.207 m². P = ½ × 1,2 × 10.207 × 8³ × 0,45 ≈ 1,41 MW. Kapasitas 2,5 MW hanya tercapai pada angin sekitar 10–12 m/s.',
    },
  ],
};
