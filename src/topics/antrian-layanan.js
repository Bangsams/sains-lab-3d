import { mat, mesh, ground, label } from '../lib/helpers.js';

// c kasir dengan antrean masing-masing; kedatangan dibagi rata sehingga tiap kasir adalah sistem M/M/1.
const lam = (p) => p.lambda / p.c;
const rho = (p) => lam(p) / p.mu;
const stable = (p) => rho(p) < 1;
const L = (p) => rho(p) / (1 - rho(p));
const Lq = (p) => rho(p) ** 2 / (1 - rho(p));
const W = (p) => 1 / (p.mu - lam(p));            // jam
const Wq = (p) => rho(p) / (p.mu - lam(p));      // jam

export default {
  id: 'antrian-layanan',
  subject: 'industri',
  // Soal disusun ulang (maks. 6); kunci progres baru agar progres lama tidak menempel ke soal yang salah.
  progressKey: 'antrian-layanan-v2',
  title: 'Teori Antrian: Berapa Kasir yang Dibutuhkan?',
  tags: ['industri', 'sehari-hari'],
  summary: 'Hitung utilisasi, panjang antrean, dan waktu tunggu di kasir minimarket dengan model M/M/1, lalu tentukan jumlah kasir yang tepat.',
  story: `
    <p><strong>Studi kasus: Minimarket dekat kampus di Depok.</strong> Pada jam makan siang rata-rata 50 pelanggan datang per jam secara acak. Satu kasir rata-rata melayani 30 pelanggan per jam. Jika hanya satu kasir yang buka, antrean terus memanjang tanpa batas.</p>
    <p>Model <strong>M/M/1</strong> menganggap kedatangan dan lama pelayanan acak (distribusi eksponensial). Ukuran utamanya adalah utilisasi ρ (seberapa sibuk kasir), panjang antrean, dan waktu tunggu. Hal yang mengejutkan: saat ρ mendekati 100%, antrean meledak, bukan bertambah pelan-pelan.</p>
    <p>Di simulasi, setiap kasir punya barisnya sendiri dan pelanggan terbagi rata, sehingga tiap kasir dihitung sebagai satu sistem M/M/1 dengan laju kedatangan λ/c.</p>`,
  concept: 'ρ = λ/μ &nbsp;·&nbsp; L = ρ/(1 − ρ) &nbsp;·&nbsp; L<sub>q</sub> = ρ²/(1 − ρ) &nbsp;·&nbsp; W = 1/(μ − λ) &nbsp;·&nbsp; W<sub>q</sub> = ρ/(μ − λ)',
  conceptNote: 'Rumus hanya berlaku jika ρ < 1. Dengan c kasir berantrean sendiri-sendiri, ganti λ dengan λ/c. Waktu dalam jam; kalikan 60 untuk menit.',
  equations: [
    { f: 'λ<sub>kasir</sub> = λ / c &nbsp;·&nbsp; ρ = λ<sub>kasir</sub> / μ', meaning: 'Utilisasi: bagian waktu kasir sibuk. Harus di bawah 1 (100%), jika tidak antrean tumbuh terus.', symbols: [['λ', 'Laju kedatangan pelanggan', 'orang/jam'], ['μ', 'Laju pelayanan satu kasir', 'orang/jam'], ['c', 'Jumlah kasir', 'kasir'], ['ρ', 'Utilisasi', '%']] },
    { f: 'L = ρ / (1 − ρ) &nbsp;·&nbsp; L<sub>q</sub> = ρ² / (1 − ρ)', meaning: 'Rata-rata jumlah orang di sistem (mengantre + dilayani) dan yang sedang mengantre saja, per kasir.', symbols: [['L', 'Orang di sistem', 'orang'], ['L<sub>q</sub>', 'Orang di antrean', 'orang']] },
    { f: 'W = 1 / (μ − λ<sub>kasir</sub>) &nbsp;·&nbsp; W<sub>q</sub> = ρ / (μ − λ<sub>kasir</sub>)', meaning: 'Rata-rata waktu di sistem dan waktu menunggu sebelum dilayani.', symbols: [['W', 'Waktu di sistem', 'jam'], ['W<sub>q</sub>', 'Waktu menunggu', 'jam (× 60 = menit)']] },
  ],
  params: [
    { key: 'lambda', label: 'Kedatangan λ', min: 5, max: 150, step: 1, value: 50, unit: 'orang/jam' },
    { key: 'mu', label: 'Pelayanan per kasir μ', min: 10, max: 60, step: 1, value: 30, unit: 'orang/jam' },
    { key: 'c', label: 'Jumlah kasir buka', min: 1, max: 6, step: 1, value: 2, unit: 'kasir' },
  ],
  compute(p) {
    if (!stable(p)) {
      return [
        { label: 'Waktu menunggu', value: 'Tak terbatas: antrean terus memanjang (ρ ≥ 100%)', text: true, main: true },
        { label: 'Utilisasi ρ', value: rho(p) * 100, unit: '%', digits: 1 },
        { label: 'Kasir minimum agar stabil', value: Math.floor(p.lambda / p.mu) + 1, unit: 'kasir', digits: 0 },
      ];
    }
    return [
      { label: 'Waktu menunggu W<sub>q</sub>', value: Wq(p) * 60, unit: 'menit', digits: 1, main: true },
      { label: 'Utilisasi ρ', value: rho(p) * 100, unit: '%', digits: 1 },
      { label: 'Orang mengantre per kasir L<sub>q</sub>', value: Lq(p), unit: 'orang', digits: 2 },
      { label: 'Orang di sistem per kasir L', value: L(p), unit: 'orang', digits: 2 },
      { label: 'Waktu di sistem W', value: W(p) * 60, unit: 'menit', digits: 1 },
    ];
  },
  view: { camera: [0, 8, 12], target: [0, 0.8, -1] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xd0cbc2 });
    const counters = [], queues = [];
    const person = new THREE.CapsuleGeometry(0.18, 0.5, 4, 10);
    for (let i = 0; i < 6; i++) {
      const g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(1.2, 0.9, 0.6), mat(0x7fd3ff), { y: 0.45 }));
      g.add(mesh(new THREE.BoxGeometry(0.4, 0.3, 0.05), mat(0x111111), { y: 1.1 }));
      const light = mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshStandardMaterial({ color: 0x5fcf7a, emissive: 0x5fcf7a, emissiveIntensity: 1 }), { y: 1.5 });
      g.add(light);
      g.position.set(-5 + i * 2, 0, -3);
      scene.add(g);
      counters.push({ g, light });
      const q = new THREE.InstancedMesh(person, mat(0xffa36b), 14);
      scene.add(q);
      queues.push(q);
    }
    const d = new THREE.Object3D();
    const tag = label('', { size: 0.45 });
    tag.position.set(0, 3.2, -3);
    scene.add(tag);
    return {
      update(p, t) {
        const n = stable(p) ? Lq(p) : 14;
        counters.forEach((c, i) => {
          const open = i < p.c;
          c.light.material.color.set(open ? 0x5fcf7a : 0x555555); c.light.material.emissive.set(open ? 0x5fcf7a : 0x000000);
          const q = queues[i];
          // panjang antrean berfluktuasi di sekitar Lq
          const k = open ? Math.min(14, Math.max(0, Math.round(n + Math.sin(t * 0.8 + i * 1.7) * Math.min(2, n * 0.4)))) : 0;
          for (let j = 0; j < 14; j++) {
            if (j < k + (open ? 1 : 0)) d.position.set(c.g.position.x, 0.45, -2.2 + j * 0.6 + (j === 0 ? 0 : 0.2 * Math.sin(t * 2 + j)) * 0.1);
            else d.position.set(0, -50, 0);
            d.updateMatrix(); q.setMatrixAt(j, d.matrix);
          }
          q.instanceMatrix.needsUpdate = true;
        });
        tag.setText(stable(p) ? `ρ = ${(rho(p) * 100).toFixed(0)}% · tunggu ${(Wq(p) * 60).toFixed(1).replace('.', ',')} menit · ${Lq(p).toFixed(1).replace('.', ',')} orang/antrean` : `ρ = ${(rho(p) * 100).toFixed(0)}% · antrean tak terkendali!`);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Sore hari 20 pelanggan datang per jam ke satu kasir yang mampu melayani 30 pelanggan per jam. Berapa persen utilisasi kasir?',
      preset: { lambda: 20, mu: 30, c: 1 }, answer: (20 / 30) * 100, tolerance: 0.01, unit: '%',
      explain: 'ρ = λ/μ = 20/30 ≈ 0,667 = 66,7%.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Dengan λ = 20/jam dan μ = 30/jam (satu kasir), berapa rata-rata jumlah pelanggan di sistem (L)?',
      preset: { lambda: 20, mu: 30, c: 1 }, answer: (2 / 3) / (1 - 2 / 3), tolerance: 0.01, unit: 'orang',
      explain: 'L = ρ/(1 − ρ) = 0,667/0,333 = 2 orang (rata-rata 1 dilayani dan ±1,33 mengantre).',
    },
    {
      stem: 'T', type: 'num', kind: 'Teknologi',
      prompt: 'Kasir memakai pemindai cepat dan QRIS sehingga μ naik dari 30 menjadi 40 pelanggan per jam (λ = 20 per jam, satu kasir). Berapa menit rata-rata waktu menunggu (Wq) sekarang?',
      preset: { lambda: 20, mu: 40, c: 1 }, answer: ((20 / 40) / (40 - 20)) * 60, tolerance: 0.01, unit: 'menit',
      explain: 'ρ = 20/40 = 0,5. Wq = ρ/(μ − λ) = 0,5/20 = 0,025 jam = 1,5 menit, turun dari 4 menit saat μ = 30.',
    },
    {
      stem: 'S', type: 'num', kind: 'Konsep',
      prompt: 'Utilisasi 80% terdengar wajar, tetapi lihat panjang antreannya. Loket tiket: λ = 40 orang/jam dan μ = 50 orang/jam dengan satu petugas. Berapa rata-rata jumlah orang yang mengantre (Lq)?',
      preset: { lambda: 40, mu: 50, c: 1 }, answer: 0.8 ** 2 / (1 - 0.8), tolerance: 0.01, unit: 'orang',
      explain: 'ρ = 40/50 = 0,8. Lq = ρ²/(1 − ρ) = 0,64/0,2 = 3,2 orang.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Masih dengan λ = 40/jam dan μ = 50/jam, berapa menit rata-rata waktu menunggu (Wq)?',
      preset: { lambda: 40, mu: 50, c: 1 }, answer: (0.8 / (50 - 40)) * 60, tolerance: 0.01, unit: 'menit',
      explain: 'Wq = ρ/(μ − λ) = 0,8/10 = 0,08 jam = 4,8 menit.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus', integer: true,
      prompt: 'Gerbang tol: λ = 90 kendaraan/jam, μ = 40/jam per gardu, setiap gardu berantrean sendiri. Pengelola ingin Wq paling lama 3 menit. Berapa gardu minimum yang harus dibuka?',
      preset: { lambda: 90, mu: 40, c: 4 }, answer: 4, tolerance: 0, unit: 'gardu',
      explain: 'c = 2: ρ > 1 (tak stabil). c = 3: λ/c = 30, ρ = 0,75, Wq = 0,75/10 = 0,075 jam = 4,5 menit ✗. c = 4: λ/c = 22,5, ρ = 0,5625, Wq = 0,5625/17,5 ≈ 0,032 jam ≈ 1,9 menit ✓.',
    },
  ],
};
