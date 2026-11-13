import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

// Delapan zaman besar sejarah dunia (tahun negatif = Sebelum Masehi).
const ERAS = [
  { name: 'Prasejarah & revolusi pertanian', from: -10000, to: -3200, color: 0xb59a7a },
  { name: 'Peradaban awal: Sumeria, Mesir, Indus', from: -3200, to: -800, color: 0xe8c15a },
  { name: 'Zaman klasik: Yunani, Romawi, Han, Maurya', from: -800, to: 476, color: 0xf2f3f4 },
  { name: 'Abad Pertengahan', from: 476, to: 1450, color: 0x93b6ff },
  { name: 'Renaisans & penjelajahan samudra', from: 1450, to: 1760, color: 0x5fd6c4 },
  { name: 'Revolusi Industri', from: 1760, to: 1914, color: 0x9a9a9a },
  { name: 'Perang dunia & dekolonisasi', from: 1914, to: 1970, color: 0xff8f8f },
  { name: 'Era digital', from: 1970, to: 2026, color: 0xc6a8ff },
];
const NOW = 2026;
const yr = (y) => (y === 0 ? 1 : y); // tidak ada tahun 0: dibaca 1 M
const eraOf = (y) => ERAS.find((e) => y >= e.from && y < e.to) || ERAS[ERAS.length - 1];
const yText = (y) => (y < 0 ? `${(-y).toLocaleString('id-ID')} SM` : `${y.toLocaleString('id-ID')} M`);
const century = (y) => `abad ke-${Math.ceil(Math.abs(y) / 100)}${y < 0 ? ' SM' : ''}`;
// Selisih tahun: jika melewati pergantian SM → M, kurangi 1 karena tidak ada tahun 0.
const gap = (a, b) => Math.abs(b - a) - ((a < 0) !== (b < 0) ? 1 : 0);
const SEG = 2.4;
const xOf = (y) => {
  const i = ERAS.indexOf(eraOf(y)), e = ERAS[i];
  const f = Math.min(1, (y - e.from) / (e.to - e.from));
  return (i + f) * SEG - (ERAS.length * SEG) / 2;
};

export default {
  id: 'garis-waktu-peradaban',
  subject: 'sejarah',
  title: 'Garis Waktu Peradaban Dunia',
  tags: ['sejarah'],
  summary: 'Telusuri 12.000 tahun sejarah manusia dalam delapan zaman, lalu hitung selisih tahun SM–M dan abad dengan benar.',
  story: `
    <p><strong>Dari ladang pertama sampai ponsel pintar.</strong> Sekitar 10.000 SM manusia di Bulan Sabit Subur (sekarang Irak, Suriah, dan sekitarnya) mulai bercocok tanam. Permukiman tetap lahir, lalu kota. Sekitar 3200 SM bangsa Sumeria menemukan tulisan paku: sejarah tertulis dimulai.</p>
    <p>Setelah itu muncul Mesir kuno dan Lembah Indus, kemudian zaman klasik Yunani, Romawi, Dinasti Han, dan Maurya. Runtuhnya Romawi Barat (476 M) menandai awal Abad Pertengahan, ketika di Nusantara berdiri Sriwijaya (abad ke-7) dan Majapahit (1293). Mesin cetak Gutenberg (sekitar 1450) mempercepat Renaisans dan penjelajahan samudra, disusul Revolusi Industri, dua perang dunia, kemerdekaan bangsa-bangsa Asia–Afrika termasuk Indonesia (1945), dan era digital.</p>
    <p>Di Indonesia, masa prasejarah berakhir lebih lambat: prasasti Yupa dari Kutai (sekitar abad ke-5 M) adalah tulisan tertua yang ditemukan di Nusantara.</p>`,
  concept: 'Selisih = |b − a| − 1 (jika melewati SM → M) &nbsp;·&nbsp; Abad = ⌈tahun / 100⌉',
  conceptNote: 'Batas zaman adalah perkiraan yang lazim dipakai buku pelajaran; setiap wilayah dunia mengalami perubahan pada waktu yang berbeda. Di slider, tahun negatif berarti Sebelum Masehi (SM).',
  equations: [
    { f: 'Selisih = |b − a| − 1 &nbsp;(a SM, b M)', meaning: 'Kalender Masehi tidak punya tahun 0: setelah 1 SM langsung 1 M. Jadi jika rentang melewati pergantian SM ke M, selisihnya dikurangi satu. Jika kedua tahun sama-sama SM atau sama-sama M, cukup |b − a|.', symbols: [['a', 'Tahun pertama (negatif untuk SM)', 'tahun'], ['b', 'Tahun kedua', 'tahun']] },
    { f: 'Abad = ⌈tahun / 100⌉', meaning: 'Abad ke-1 adalah tahun 1–100, abad ke-2 tahun 101–200, dan seterusnya. Tanda ⌈ ⌉ berarti dibulatkan ke atas. Untuk tahun SM, hitung dengan angka tahunnya lalu tambahkan "SM".', symbols: [['⌈x⌉', 'Pembulatan ke atas', '—']] },
    { f: 'Umur = 2026 − tahun (− 1 jika tahun SM)', meaning: 'Berapa tahun yang lalu suatu peristiwa terjadi jika dihitung dari tahun 2026.', symbols: [['tahun', 'Tahun peristiwa', 'tahun']] },
  ],
  params: [
    { key: 'a', label: 'Tahun A (negatif = SM)', min: -10000, max: 2026, step: 1, value: -2560, unit: '' },
    { key: 'b', label: 'Tahun B (negatif = SM)', min: -10000, max: 2026, step: 1, value: 1945, unit: '' },
  ],
  compute(p) {
    const a = yr(p.a), b = yr(p.b);
    return [
      { label: 'Selisih A → B', value: gap(a, b), unit: 'tahun', digits: 0, main: true },
      { label: 'Tahun A', value: `${yText(a)} · ${century(a)}`, text: true },
      { label: 'Zaman A', value: eraOf(a).name, text: true },
      { label: 'Tahun B', value: `${yText(b)} · ${century(b)}`, text: true },
      { label: 'Zaman B', value: eraOf(b).name, text: true },
      { label: 'A terjadi … tahun lalu', value: gap(a, NOW), unit: 'tahun', digits: 0 },
    ];
  },
  view: { camera: [0, 6.5, 16], target: [0, 1.2, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc3c9c0 });
    const half = (ERAS.length * SEG) / 2;
    // jalur waktu: satu balok berwarna per zaman + monumen kecil di atasnya
    ERAS.forEach((e, i) => {
      const cx = (i + 0.5) * SEG - half;
      scene.add(mesh(new THREE.BoxGeometry(SEG - 0.08, 0.25, 1.2), mat(e.color, { emissive: e.color, emissiveIntensity: 0.12 }), { x: cx, y: 0.125 }));
      const tag = label(e.name.split(':')[0], { size: 0.36 });
      tag.position.set(cx, 0.45 + (i % 2) * 0.5, 1.1 + (i % 2) * 0.6);
      scene.add(tag);
      const g = new THREE.Group(); g.position.set(cx, 0.25, -1.4); scene.add(g);
      const stone = mat(0xbfb3a0), sand = mat(0xd9c08a);
      if (i === 0) { // menhir dan pondok
        [-0.5, 0, 0.5].forEach((x, k) => g.add(mesh(new THREE.BoxGeometry(0.25, 0.9 + k * 0.2, 0.25), stone, { x, y: 0.5 })));
        g.add(mesh(new THREE.ConeGeometry(0.4, 0.6, 10), mat(0x8a6a44), { z: 0.6, y: 0.3 }));
      } else if (i === 1) { // piramida
        const py = mesh(new THREE.ConeGeometry(0.9, 1.2, 4), sand, { y: 0.6 }); py.rotation.y = Math.PI / 4; g.add(py);
      } else if (i === 2) { // kuil bertiang
        [-0.6, -0.2, 0.2, 0.6].forEach((x) => g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 1, 12), mat(0xf2f3f4), { x, y: 0.55 })));
        g.add(mesh(new THREE.BoxGeometry(1.6, 0.15, 0.6), mat(0xf2f3f4), { y: 1.1 }));
        const roof = mesh(new THREE.CylinderGeometry(0.01, 0.4, 1.6, 3), mat(0xe6e0d4), { y: 1.3 }); roof.rotation.z = Math.PI / 2; g.add(roof);
      } else if (i === 3) { // menara kastel
        g.add(mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.4, 16), stone, { y: 0.7 }));
        g.add(mesh(new THREE.ConeGeometry(0.45, 0.6, 16), mat(0x8a3b3b), { y: 1.7 }));
      } else if (i === 4) { // kapal layar
        g.add(mesh(new THREE.BoxGeometry(1.3, 0.3, 0.45), mat(0x7a5230), { y: 0.25 }));
        g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6), mat(0x5a3d22), { y: 1 }));
        g.add(mesh(new THREE.PlaneGeometry(0.8, 0.8), mat(0xf4ecd8, { side: THREE.DoubleSide }), { y: 1.05, z: 0.05 }));
      } else if (i === 5) { // pabrik dan cerobong
        g.add(mesh(new THREE.BoxGeometry(1.2, 0.6, 0.7), mat(0x8a4a3a), { y: 0.3 }));
        g.add(mesh(new THREE.CylinderGeometry(0.1, 0.13, 1.4, 12), mat(0x6e3a2e), { x: 0.4, y: 0.7 }));
      } else if (i === 6) { // tiang bendera merah putih (1945)
        g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8), mat(0xdddddd), { y: 0.9 }));
        g.add(mesh(new THREE.PlaneGeometry(0.7, 0.2), mat(0xd32f2f, { side: THREE.DoubleSide }), { x: 0.36, y: 1.65 }));
        g.add(mesh(new THREE.PlaneGeometry(0.7, 0.2), mat(0xffffff, { side: THREE.DoubleSide }), { x: 0.36, y: 1.45 }));
      } else { // chip
        g.add(mesh(new THREE.BoxGeometry(1, 0.12, 1), mat(0x22262c, { metalness: 0.5 }), { y: 0.1 }));
        g.add(mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), mat(0xc6a8ff, { emissive: 0xc6a8ff, emissiveIntensity: 0.6 }), { y: 0.19 }));
      }
    });
    const smoke = particles(30, 0xbbbbbb, 0.1, 0.6); scene.add(smoke);
    const smokeX = (5.5) * SEG - half + 0.4;
    const pin = (color) => {
      const g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8), mat(color), { y: 0.8 }));
      g.add(mesh(new THREE.SphereGeometry(0.22, 20, 14), mat(color, { emissive: color, emissiveIntensity: 0.5 }), { y: 1.7 }));
      const t = label('', { size: 0.42 }); t.position.y = 2.3; g.add(t); g.userData.tag = t;
      scene.add(g); return g;
    };
    const pa = pin(0x5fd6c4), pb = pin(0xffa36b);
    const bridge = mesh(new THREE.BoxGeometry(1, 0.06, 0.06), mat(0xffffff, { transparent: true, opacity: 0.6 }));
    const gapTag = label('', { size: 0.45 });
    scene.add(bridge, gapTag);
    return {
      update(p, t) {
        const a = yr(p.a), b = yr(p.b), xa = xOf(a), xb = xOf(b);
        pa.position.x = xa; pa.userData.tag.setText(`A · ${yText(a)}`);
        pb.position.x = xb; pb.userData.tag.setText(`B · ${yText(b)}`);
        pb.userData.tag.position.y = Math.abs(xa - xb) < 2.5 ? 2.85 : 2.3;
        const w = Math.max(0.01, Math.abs(xb - xa));
        bridge.scale.x = w; bridge.position.set((xa + xb) / 2, 1.7, 0);
        gapTag.setText(`${gap(a, b).toLocaleString('id-ID')} tahun`);
        gapTag.position.set((xa + xb) / 2, 3.4, 0);
        for (let i = 0; i < 30; i++) {
          const k = ((t * 0.35 + i / 30) % 1);
          smoke.setAt(i, smokeX + Math.sin(i * 7 + t) * 0.15 * k, 1.8 + k * 2, -1.4 + Math.cos(i * 3) * 0.1, 0.6 + k * 1.6);
        }
        smoke.instanceMatrix.needsUpdate = true;
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung', integer: true,
      prompt: 'Piramida Agung Giza diperkirakan selesai dibangun sekitar 2560 SM. Berapa tahun jarak dari peristiwa itu sampai Proklamasi Kemerdekaan Indonesia tahun 1945?',
      preset: { a: -2560, b: 1945 }, answer: 2560 + 1945 - 1, tolerance: 0, unit: 'tahun',
      explain: 'Rentangnya melewati pergantian SM → M, jadi selisih = 2560 + 1945 − 1 = 4504 tahun (tidak ada tahun 0).',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung', integer: true,
      prompt: 'Julius Caesar terbunuh pada 44 SM dan Kaisar Augustus wafat pada 14 M. Berapa tahun selisihnya?',
      preset: { a: -44, b: 14 }, answer: 44 + 14 - 1, tolerance: 0, unit: 'tahun',
      explain: 'Selisih = |14 − (−44)| − 1 = 58 − 1 = 57 tahun.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung', integer: true,
      prompt: 'Raden Wijaya mendirikan Majapahit pada tahun 1293. Pada abad ke berapa peristiwa itu terjadi? (tulis angkanya saja)',
      preset: { a: 1293, b: 2026 }, answer: 13, tolerance: 0, unit: '',
      explain: 'Abad = ⌈1293/100⌉ = ⌈12,93⌉ = 13. Tahun 1201–1300 termasuk abad ke-13.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa dalam kalender Masehi setelah tahun 1 SM langsung tahun 1 M, tanpa tahun 0?',
      options: ['Karena tahun 0 dihapus oleh Romawi', 'Karena sistem tahun Masehi disusun pada abad ke-6 di Eropa, sebelum angka nol dikenal di sana, sehingga hitungan dimulai dari 1', 'Karena tahun 0 terlalu pendek', 'Karena tahun 0 adalah tahun kabisat'], answer: 1,
      explain: 'Dionysius Exiguus menyusun hitungan Anno Domini sekitar 525 M. Angka nol baru dikenal luas di Eropa berabad-abad kemudian lewat matematikawan India dan dunia Islam, jadi hitungannya langsung mulai dari 1.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Penemuan teknologi apa yang dipakai sejarawan sebagai batas akhir masa prasejarah?',
      options: ['Api', 'Roda', 'Tulisan', 'Besi'], answer: 2,
      explain: 'Masa sejarah dimulai ketika ada catatan tertulis. Di Mesopotamia itu sekitar 3200 SM (tulisan paku), sedangkan di Indonesia sekitar abad ke-5 M lewat prasasti Yupa Kutai.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Rekayasa & dampak',
      prompt: 'Mesin cetak huruf lepas Gutenberg (sekitar 1450) sering disebut pemicu Renaisans dan revolusi ilmiah. Apa dampak rekayasanya yang paling penting?',
      options: ['Buku bisa digandakan cepat dan murah sehingga ilmu menyebar luas dan bisa diperiksa banyak orang', 'Kertas menjadi lebih tebal', 'Tulisan tangan dilarang', 'Bahasa Latin hilang seketika'], answer: 0,
      explain: 'Sebelumnya buku disalin tangan berbulan-bulan. Dengan cetak, ribuan salinan identik beredar, sehingga gagasan dan hasil penelitian cepat tersebar, dibandingkan, dan dikoreksi.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Cerita',
      prompt: 'Revolusi pertanian sekitar 10.000 SM mengubah cara hidup manusia. Perubahan utamanya adalah…',
      options: ['Manusia mulai berburu dengan tombak', 'Manusia mulai menetap, bercocok tanam, dan beternak sehingga lahir desa lalu kota', 'Manusia pindah ke gua', 'Manusia mulai berlayar ke benua lain'], answer: 1,
      explain: 'Hasil panen yang bisa disimpan memungkinkan manusia tinggal menetap. Surplus makanan memberi waktu bagi sebagian orang untuk menjadi tukang, pedagang, atau pemimpin: cikal bakal kota dan negara.',
    },
  ],
};
