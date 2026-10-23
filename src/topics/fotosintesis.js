import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

const REF = 22; // kg CO₂ per pohon dewasa per tahun pada kondisi acuan
const fLight = (I) => I / (I + 300);
const fCO2 = (c) => Math.max(0, c - 50) / (c - 50 + 350);
const fTemp = (T) => Math.exp(-(((T - 30) / 9) ** 2));
const rate = (p) => fLight(p.I) * fCO2(p.co2) * fTemp(p.T);
const REF_RATE = rate({ I: 1200, co2: 420, T: 30 });

export default {
  id: 'fotosintesis',
  subject: 'biologi',
  title: 'Fotosintesis Hutan Kota',
  tags: ['sehari-hari', 'keberlanjutan'],
  summary: 'Cahaya, CO₂, dan suhu menentukan laju fotosintesis. Temukan faktor pembatas dan hitung CO₂ yang diserap pohon kota.',
  story: `
    <p><strong>Cerita: Taman sekolah di Surabaya.</strong> OSIS SMA Harapan ingin menanam pohon trembesi di halaman sekolah untuk mengimbangi emisi bus sekolah. Guru biologi menantang mereka: berapa pohon yang dibutuhkan?</p>
    <p>Daun menyerap CO₂ lewat stomata dan memakai energi cahaya di kloroplas untuk membuat glukosa. Laju fotosintesis dibatasi oleh faktor yang paling kurang. Ini disebut <em>hukum faktor pembatas Blackman</em>. Pada siang terik, suhu di atas ±38 °C membuat stomata menutup dan enzim RuBisCO bekerja kurang efisien.</p>
    <p>Sebagai acuan, satu pohon peneduh dewasa menyerap sekitar 22 kg CO₂ per tahun.</p>`,
  concept: '6CO₂ + 6H₂O <span aria-label="dengan cahaya">—cahaya→</span> C₆H₁₂O₆ + 6O₂',
  conceptNote: 'Model laju: r = f(cahaya) × f(CO₂) × f(suhu), dengan suhu optimum ±30 °C. Setiap 44 g CO₂ yang diserap melepas 32 g O₂.',
  params: [
    { key: 'I', label: 'Intensitas cahaya', min: 0, max: 2000, step: 10, value: 1200, unit: 'µmol/m²/s' },
    { key: 'co2', label: 'Konsentrasi CO₂', min: 150, max: 1000, step: 5, value: 420, unit: 'ppm' },
    { key: 'T', label: 'Suhu daun', min: 5, max: 48, step: 0.5, value: 30, unit: '°C' },
    { key: 'trees', label: 'Jumlah pohon', min: 1, max: 500, step: 1, value: 100, unit: 'pohon' },
  ],
  compute(p) {
    const r = rate(p) / REF_RATE;
    const f = { cahaya: fLight(p.I), 'CO₂': fCO2(p.co2), suhu: fTemp(p.T) };
    const limit = Object.entries(f).sort((a, b) => a[1] - b[1])[0][0];
    const c = REF * r * p.trees;
    return [
      { label: 'CO₂ diserap per tahun', value: c, unit: 'kg', digits: 0, main: true },
      { label: 'Laju relatif thd. acuan', value: r * 100, unit: '%', digits: 0 },
      { label: 'O₂ dilepas per tahun', value: (c * 32) / 44, unit: 'kg', digits: 0 },
      { label: 'Faktor pembatas', value: limit, unit: '', text: true },
    ];
  },
  view: { camera: [7, 5, 9], target: [0, 2.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0x9fbe8a });
    scene.add(mesh(new THREE.CylinderGeometry(0.25, 0.4, 3, 12), mat(0x6b4a2f), { y: 1.5 }));
    const crownMat = mat(0x3f8f3a, { roughness: 0.8 });
    const blobs = [[0, 3.6, 0, 1.6], [1.1, 3.2, 0.4, 1.1], [-1.1, 3.3, -0.3, 1.2], [0.3, 4.4, -0.6, 1.0], [-0.4, 3.0, 1.0, 1.0]];
    blobs.forEach(([x, y, z, r]) => scene.add(mesh(new THREE.IcosahedronGeometry(r, 1), crownMat, { x, y, z })));
    const sun = mesh(new THREE.SphereGeometry(0.6, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffc23d }), { x: -6, y: 8, z: -3, shadow: false });
    scene.add(sun);
    const N = 120;
    const co2 = particles(N, 0x6b7076, 0.09);
    const o2 = particles(N, 0x4fb6e8, 0.08);
    scene.add(co2, o2);
    const lc = label('CO₂ masuk', { size: 0.32 }); lc.position.set(4, 3.2, 0);
    const lo = label('O₂ keluar', { size: 0.32 }); lo.position.set(-3.6, 5.6, 1.5);
    const tag = label(''); tag.position.set(0, 6.6, 0);
    scene.add(lc, lo, tag);
    const healthy = new THREE.Color(0x3f8f3a), stressed = new THREE.Color(0xa59a3c);
    return {
      update(p, t) {
        const r = rate(p) / REF_RATE;
        sun.material.color.setHSL(0.12, 1, 0.2 + 0.5 * (p.I / 2000));
        sun.scale.setScalar(0.5 + p.I / 2000);
        crownMat.color.copy(healthy).lerp(stressed, 1 - fTemp(p.T));
        const nC = Math.round(N * Math.min(1, p.co2 / 1000));
        const nO = Math.round(N * Math.min(1, r * 0.8));
        for (let i = 0; i < N; i++) {
          const a = i * 2.399, f = (t * (0.15 + r * 0.25) + i / N) % 1;
          const R = 5 * (1 - f) + 1;
          co2.setAt(i, Math.cos(a) * R, 3.6 + Math.sin(i * 1.7) * 1.3 * (1 - f), Math.sin(a) * R, i < nC ? 1 : 0);
          const g = (t * (0.12 + r * 0.25) + i / N) % 1;
          o2.setAt(i, Math.cos(a + 1) * (1 + g * 5), 3.8 + g * 3, Math.sin(a + 1) * (1 + g * 5), i < nO ? 1 - g * 0.5 : 0);
        }
        co2.instanceMatrix.needsUpdate = o2.instanceMatrix.needsUpdate = true;
        tag.setText(`Laju ${Math.round(r * 100)}%`);
      },
    };
  },
  questions: [
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Atur cahaya ke 100 µmol/m²/s (seperti di bawah naungan gedung). Jika CO₂ dinaikkan dari 420 ke 800 ppm, laju fotosintesis hanya naik sedikit. Mengapa?',
      preset: { I: 100, co2: 800, T: 30 },
      options: [
        'Karena CO₂ beracun bagi tanaman',
        'Karena cahaya menjadi faktor pembatas; menambah faktor lain tidak banyak menolong',
        'Karena stomata menutup saat CO₂ tinggi',
        'Karena suhu terlalu rendah',
      ],
      answer: 1,
      explain: 'Menurut hukum faktor pembatas, laju ditentukan oleh faktor yang paling kurang. Di tempat teduh, cahaya membatasi reaksi terang sehingga CO₂ tambahan tidak bisa dipakai.',
    },
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Taman kota berisi 100 pohon dewasa yang masing-masing menyerap 22 kg CO₂ per tahun. Berapa kg O₂ yang dilepaskan taman tersebut per tahun?',
      preset: { I: 1200, co2: 420, T: 30, trees: 100 },
      answer: 1600, tolerance: 0.02, unit: 'kg',
      explain: 'CO₂ total = 100 × 22 = 2200 kg. Perbandingan mol CO₂ : O₂ = 6 : 6 = 1 : 1, jadi massa O₂ = 2200 × 32/44 = 1600 kg.',
    },
    {
      type: 'num', kind: 'Studi kasus',
      prompt: 'Bus sekolah SMA Harapan mengeluarkan 1 ton (1000 kg) CO₂ per tahun. Jika satu pohon menyerap 22 kg CO₂ per tahun, berapa pohon minimal yang harus ditanam OSIS?',
      preset: { trees: 46 },
      answer: 46, tolerance: 0, unit: 'pohon', integer: true,
      explain: '1000 / 22 = 45,45, dibulatkan ke atas menjadi 46 pohon. Coba naikkan suhu ke 42 °C: penyerapan turun, sehingga di kota yang makin panas dibutuhkan lebih banyak pohon.',
    },
  ],
};
