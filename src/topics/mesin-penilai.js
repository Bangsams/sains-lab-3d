import { mat, mesh, ground, label } from '../lib/helpers.js';
import lab from '../labs/mesin-penilai.js';

// Contoh rubrik 4 butir (pola sama dengan rubrik post test T-Test di studi kasus).
// Setiap butir punya tingkat: 0 benar & lengkap, 1 kurang lengkap / tanpa gambar, 2 salah, 3 tidak menjawab.
const RUBRIK = [
  { key: 'hip', nama: 'Hipotesis', bobot: 10, lv: [10, 8, 5, 3], angka: false, color: 0x93b6ff },
  { key: 't', nama: 't-hitung', bobot: 25, lv: [25, 20, 13, 8], angka: true, color: 0x5fd6c4 },
  { key: 'p', nama: 'Signifikansi', bobot: 25, lv: [25, 20, 13, 8], angka: true, color: 0xffd36b },
  { key: 'kes', nama: 'Kesimpulan', bobot: 40, lv: [40, 35, 20, 13], angka: true, color: 0xffa36b },
];
const SALAH = 2;
const levelOpts = (r, labels) => labels.map((l, i) => ({ value: i, label: `${l} (${r.lv[i]})` }));

const skor = (p) => RUBRIK.reduce((s, r) => s + r.lv[p[r.key]], 0);
// Variasi penulisan (S2–S5): butir angka yang tadinya benar bisa jatuh ke "salah" bila pola regex tidak mengenalinya.
const rawan = (p) => RUBRIK.filter((r) => r.angka && p[r.key] < SALAH).reduce((s, r) => s + r.lv[p[r.key]] - r.lv[SALAH], 0);
const deltaVariasi = (p) => (1 - p.kebal / 100) * rawan(p);
// Kontrol negatif (S6): angka & keputusan sengaja dibuat salah → butir angka harus turun ke tingkat "salah".
const deltaNegatif = (p) => rawan(p);

export default {
  id: 'mesin-penilai',
  subject: 'coding',
  title: 'Membuat Kode Mesin Penilai Otomatis',
  tags: ['web', 'industri'],
  summary: 'Cara menyusun kode penilai berbasis rubrik yang deterministik, lalu menguji keadilannya dengan skenario S0–S6.',
  story: `
    <p><strong>Studi kasus: Datmin Automation APP.</strong> Asisten Lab Data Mining harus menilai ratusan laporan dan post test Statistika 2 dalam bentuk PDF. Mereka membuat aplikasi web yang membaca PDF di browser, lalu menilai jawaban dengan rubrik, <em>tanpa AI</em>. Hasilnya selalu sama untuk masukan yang sama, sehingga bisa diaudit.</p>
    <p><strong>Struktur kode.</strong> Proyeknya dipecah menjadi beberapa file dengan tugas masing-masing:</p>
    <pre><code>public/
  stat-monitoring.html   ← tampilan + logika halaman
  assets/laporan-engine.js   ← baca PDF + nilai laporan
  assets/posttest-engine.js  ← nilai post test
  assets/stat-sim.js         ← uji keadilan S0–S7
api/stat.js              ← fungsi serverless (Google Sheets &amp; Drive)
lib/auth.js, lib/stat-google.js</code></pre>
    <p><strong>Pola modul.</strong> Setiap mesin dibungkus agar bisa dipakai di browser maupun di Node (untuk pengujian):</p>
    <pre><code>(function (root) {
  function grade(raw, opts) { /* … */ }
  const api = { grade };
  if (typeof module !== 'undefined') module.exports = api;
  else root.PostTestEngine = api;
})(this);</code></pre>
    <p><strong>Langkah menilai:</strong> (1) teks dinormalisasi: huruf kecil, NFKC, tanda minus dan kutip diseragamkan; (2) jawaban dipotong per soal; (3) bukti dicari dengan regex, misalnya angka t-hitung dicocokkan dengan kunci beserta toleransinya; (4) setiap butir diberi <em>tingkat</em> rubrik, lalu poinnya dijumlahkan.</p>
    <p><strong>Uji keadilan.</strong> Satu jawaban asli (S0) diubah tanpa mengubah isinya. Contohnya kapitalisasi, koma desimal "0,05" vs "0.05", atau "Ho" vs "H0" (S2–S5). Nilai hanya boleh bergeser ±5. Untuk kontrol negatif (S6), angka dan keputusan sengaja dibuat salah, dan nilai <em>harus</em> turun minimal 15. Mesin yang selalu memberi 100 akan lolos S1–S5, tetapi gagal di S6.</p>`,
  concept: `Nilai = Σ poin<sub>i</sub>(tingkat<sub>i</sub>) &nbsp;·&nbsp; Δ<sub>variasi</sub> = (1 − k) · Σ<sub>angka</sub>(poin<sub>i</sub> − poin<sub>salah,i</sub>)`,
  conceptNote: 'Model disederhanakan: k adalah bagian variasi penulisan yang dikenali pola regex. Variasi yang tidak dikenali membuat butir angka jatuh ke tingkat "salah". Uji lolos jika |Δ| ≤ 5 untuk variasi dan Δ ≥ 15 untuk kontrol negatif.',
  equations: [
    {
      f: 'Nilai = Σ poin<sub>i</sub>(tingkat<sub>i</sub>)',
      meaning: 'Nilai akhir adalah jumlah poin semua butir rubrik. Poin setiap butir ditentukan oleh tingkat yang buktinya ditemukan di jawaban, bukan oleh tebakan.',
      symbols: [
        ['poin<sub>i</sub>', 'Poin butir ke-i sesuai tingkat rubriknya', 'poin'],
        ['tingkat<sub>i</sub>', 'Benar & lengkap, kurang lengkap, salah, atau tidak menjawab', 'kategori'],
      ],
    },
    {
      f: 'Δ<sub>variasi</sub> = (1 − k) · Σ<sub>angka</sub>(poin<sub>i</sub> − poin<sub>salah,i</sub>)',
      meaning: 'Jika pola regex hanya mengenali sebagian variasi penulisan, butir berisi angka bisa salah dibaca. Penurunan nilai yang tidak adil ini makin kecil jika pola makin lengkap.',
      symbols: [
        ['k', 'Bagian variasi penulisan yang dikenali pola (0–1)', 'tanpa satuan'],
        ['poin<sub>salah,i</sub>', 'Poin butir ke-i bila dianggap salah', 'poin'],
        ['Δ<sub>variasi</sub>', 'Penurunan nilai akibat cara menulis, bukan isi', 'poin'],
      ],
    },
    {"f":"Poin rubrik (lengkap / kurang / salah / tidak menjawab)","meaning":"Hipotesis 10 / 8 / 5 / 3 · t-hitung 25 / 20 / 13 / 8 · Signifikansi 25 / 20 / 13 / 8 · Kesimpulan 40 / 35 / 20 / 13. \"Benar tanpa screenshot\" dinilai pada tingkat kurang lengkap.","symbols":[["poin<sub>salah,i</sub>","Poin tingkat \"salah\" setiap butir","poin"]]},
    {"f":"Akurasi = (jumlah cocok / jumlah uji) × 100%","meaning":"Persentase berkas yang nilainya sama dengan penilai manusia.","symbols":[["jumlah cocok","Berkas yang nilainya sama","berkas"]]},
  ],
  params: [
    { key: 'hip', label: 'Butir 1 · Hipotesis H0/H1', type: 'select', value: 0, options: levelOpts(RUBRIK[0], ['Benar & lengkap', 'Kurang lengkap', 'Salah', 'Tidak menjawab']) },
    { key: 't', label: 'Butir 2 · Nilai t-hitung & t-tabel', type: 'select', value: 0, options: levelOpts(RUBRIK[1], ['Benar + screenshot', 'Benar tanpa gambar', 'Salah', 'Tidak menjawab']) },
    { key: 'p', label: 'Butir 3 · Nilai signifikansi', type: 'select', value: 0, options: levelOpts(RUBRIK[2], ['Benar + screenshot', 'Benar tanpa gambar', 'Salah', 'Tidak menjawab']) },
    { key: 'kes', label: 'Butir 4 · Kesimpulan', type: 'select', value: 0, options: levelOpts(RUBRIK[3], ['Benar + screenshot', 'Benar tanpa gambar', 'Salah', 'Tidak menjawab']) },
    { key: 'kebal', label: 'Variasi penulisan yang dikenali regex', min: 0, max: 100, step: 1, value: 95, unit: '%' },
  ],
  compute(p) {
    const dv = deltaVariasi(p), dn = deltaNegatif(p);
    return [
      { label: 'Nilai jawaban asli (S0)', value: skor(p), unit: '/ 100', digits: 0, main: true },
      { label: 'Turun karena variasi tulisan (S2–S5)', value: dv, unit: 'poin', digits: 1 },
      { label: 'Hasil uji variasi', value: dv <= 5 ? 'ADIL (|Δ| ≤ 5)' : 'TIDAK ADIL (|Δ| > 5)', text: true },
      { label: 'Turun pada kontrol negatif (S6)', value: dn, unit: 'poin', digits: 0 },
      { label: 'Hasil kontrol negatif', value: dn === 0 ? 'TIDAK BERLAKU (butir angka sudah salah)' : dn >= 15 ? 'PEKA (Δ ≥ 15)' : 'KURANG PEKA (Δ < 15)', text: true },
    ];
  },
  lab,
  view: { camera: [9, 7, 12], target: [0, 2.2, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xb7bfd6 });
    scene.add(mesh(new THREE.BoxGeometry(10, 0.3, 4), mat(0x2a3552), { y: 0.15 }));
    const H = 5; // tinggi kolom untuk bobot 40
    const cols = RUBRIK.map((r, i) => {
      const x = -3.6 + i * 2.4;
      const full = (r.bobot / 40) * H;
      const ghost = mesh(new THREE.BoxGeometry(1.4, full, 1.4), new THREE.MeshStandardMaterial({ color: r.color, transparent: true, opacity: 0.15 }), { x, y: 0.3 + full / 2, shadow: false });
      const bar = mesh(new THREE.BoxGeometry(1.4, 1, 1.4), mat(r.color, { emissive: r.color, emissiveIntensity: 0.15 }), { x, y: 0.8 });
      const tag = label(r.nama, { size: 0.42 });
      tag.position.set(x, 0.6, 1.4);
      scene.add(ghost, bar, tag);
      return { r, bar, x, h: 0.01 };
    });
    // "pemindai" yang menyapu kolom: mesin membaca jawaban butir demi butir
    const scan = mesh(new THREE.BoxGeometry(0.08, 6.2, 2), new THREE.MeshBasicMaterial({ color: 0x5fd6c4, transparent: true, opacity: 0.35 }), { y: 3.4, shadow: false });
    scene.add(scan);
    const total = label('', { size: 0.75 });
    total.position.set(0, 6.6, 0);
    scene.add(total);

    return {
      update(p, t, dt) {
        const k = 1 - Math.exp(-dt * 6);
        cols.forEach((c) => {
          const target = (c.r.lv[p[c.r.key]] / 40) * H;
          c.h += (target - c.h) * k;
          c.bar.scale.y = Math.max(c.h, 0.01);
          c.bar.position.y = 0.3 + c.h / 2;
        });
        scan.position.x = -4.6 + ((t * 0.35) % 1) * 9.2;
        const adil = deltaVariasi(p) <= 5;
        scan.material.color.set(adil ? 0x5fd6c4 : 0xff7a5c);
        total.setText(`Nilai ${skor(p)} · ${adil ? 'adil' : 'tidak adil'}`);
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Seorang mahasiswa menulis hipotesis kurang lengkap dan menuliskan t-hitung benar tetapi tanpa screenshot. Nilai signifikansi dan kesimpulannya benar lengkap dengan screenshot. Berapa nilai yang diberikan mesin?',
      preset: { hip: 1, t: 1, p: 0, kes: 0, kebal: 100 },
      answer: 93, tolerance: 0, unit: 'poin',
      explain: 'Nilai = 8 + 20 + 25 + 40 = 93. Mesin hanya menjumlahkan poin tingkat rubrik yang buktinya ditemukan, jadi hasilnya selalu sama setiap kali dinilai ulang (lolos S1).',
    },
    {
      type: 'num', kind: 'Studi kasus',
      prompt: 'Semua butir dijawab benar dan lengkap, tetapi pola regex hanya mengenali 80% variasi penulisan angka (misalnya "0,05" vs "0.05"). Berapa poin penurunan nilai yang tidak adil pada skenario variasi?',
      preset: { hip: 0, t: 0, p: 0, kes: 0, kebal: 80 },
      answer: 8.8, tolerance: 0.02, unit: 'poin',
      explain: 'Butir angka yang rawan: (25−13) + (25−13) + (40−20) = 44 poin. Δ = (1 − 0,80) × 44 = 8,8 poin. Ini lebih dari 5, jadi tidak adil. Pola harus mengenali minimal 1 − 5/44 ≈ 88,6% variasi. Karena itu kode studi kasus menormalisasi teks dulu (NFKC, huruf kecil, tanda minus seragam) sebelum mencocokkan angka.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa uji keadilan memerlukan skenario kontrol negatif S6 (angka dan keputusan dibuat salah, nilai harus turun ≥ 15)?',
      preset: { hip: 0, t: 0, p: 0, kes: 0, kebal: 100 },
      options: [
        'Supaya simulasi berjalan lebih cepat',
        'Karena mesin yang selalu memberi nilai tinggi akan lolos uji konsistensi dan variasi; hanya kontrol negatif yang membuktikan mesin benar-benar membaca isi jawaban',
        'Karena Google Sheets menolak nilai di atas 90',
        'Supaya nilai mahasiswa yang menjawab salah tetap tinggi',
      ],
      answer: 1,
      explain: 'Uji S1–S5 hanya memastikan nilai tidak berubah. Mesin "buta" yang selalu memberi 100 juga lolos. S6 memastikan mesin peka terhadap isi: dengan semua butir benar, kontrol negatif menurunkan 44 poin.',
    },
  ],
};
