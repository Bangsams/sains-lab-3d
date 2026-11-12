import { mat, mesh, ground, label } from '../lib/helpers.js';

// Data ilustrasi imbal hasil tahunan (%) 5 tahun terakhir. Bukan data nyata dan bukan rekomendasi investasi.
export const ASSETS = [
  { name: 'Saham bank besar', r: [18, -5, 22, 12, 8], beta: 1.1, color: 0x93b6ff },
  { name: 'Reksa dana indeks', r: [12, -8, 15, 9, 7], beta: 1.0, color: 0x5fd6c4 },
  { name: 'Emas', r: [20, -3, 4, 15, 9], beta: 0.1, color: 0xffd36b },
  { name: 'Kripto', r: [120, -60, 70, -40, 30], beta: 2.5, color: 0xff8f8f },
];
const mean = (r) => r.reduce((a, b) => a + b, 0) / r.length;
const sd = (r) => { const m = mean(r); return Math.sqrt(r.reduce((s, x) => s + (x - m) ** 2, 0) / (r.length - 1)); };
const growthFactor = (r) => r.reduce((g, x) => g * (1 + x / 100), 1);
const cagr = (r) => (growthFactor(r) ** (1 / r.length) - 1) * 100;
const sharpe = (a, rf) => (mean(a.r) - rf) / sd(a.r);
const capm = (a, p) => p.rf + a.beta * (p.rm - p.rf);
const alpha = (a, p) => mean(a.r) - capm(a, p);
const best = (p) => ASSETS.filter((a) => alpha(a, p) >= 0).sort((x, y) => sharpe(y, p.rf) - sharpe(x, p.rf))[0];

export default {
  id: 'pilih-aset',
  subject: 'keuangan',
  title: 'Pasar Keuangan: Memilih Aset Terbaik',
  tags: ['ekonomi'],
  summary: 'Bandingkan saham, reksa dana, emas, dan kripto memakai imbal hasil rata-rata, risiko (simpangan baku), Sharpe ratio, CAPM, dan CAGR untuk menentukan aset yang paling layak.',
  story: `
    <p><strong>Studi kasus: Dana pendidikan Rp 10 juta.</strong> Dimas baru bekerja dan ingin menginvestasikan tabungannya selama 5 tahun. Di aplikasi investasi ia melihat empat pilihan dengan riwayat imbal hasil tahunan yang berbeda. Kripto tampak paling menggiurkan karena rata-ratanya 24% per tahun.</p>
    <p>Namun aset terbaik bukan yang rata-ratanya paling tinggi. Investor membandingkan <strong>imbal hasil per satuan risiko</strong> (Sharpe ratio), memeriksa apakah imbal hasilnya sepadan dengan risiko pasarnya (CAPM dan alpha), dan menghitung pertumbuhan sesungguhnya (CAGR). Aset yang naik 120% lalu turun 60% belum tentu membuat uang bertambah banyak.</p>
    <p>Sebagai patokan tanpa risiko (R<sub>f</sub>) dipakai imbal hasil Surat Berharga Negara (SBN). Semua angka di topik ini adalah <em>data ilustrasi untuk belajar</em>, bukan saran investasi.</p>`,
  concept: 'R̄ = Σr/n &nbsp;·&nbsp; σ = √[Σ(r − R̄)²/(n − 1)] &nbsp;·&nbsp; Sharpe = (R̄ − R<sub>f</sub>)/σ &nbsp;·&nbsp; R<sub>CAPM</sub> = R<sub>f</sub> + β(R<sub>m</sub> − R<sub>f</sub>)',
  conceptNote: 'Aturan pilih di simulasi: dari aset yang alpha-nya ≥ 0 (imbal hasil minimal sepadan dengan risikonya menurut CAPM), pilih Sharpe ratio tertinggi. Ini latihan analisis, bukan rekomendasi; kinerja masa lalu tidak menjamin hasil masa depan.',
  equations: [
    { f: 'R̄ = (r₁ + r₂ + … + r<sub>n</sub>) / n', meaning: 'Imbal hasil rata-rata per tahun.', symbols: [['r<sub>i</sub>', 'Imbal hasil tahun ke-i', '%'], ['n', 'Jumlah tahun data', 'tahun']] },
    { f: 'σ = √[Σ(r<sub>i</sub> − R̄)² / (n − 1)]', meaning: 'Risiko (volatilitas): seberapa jauh imbal hasil tiap tahun menyimpang dari rata-ratanya. Makin besar σ, makin tidak pasti hasilnya.', symbols: [['σ', 'Simpangan baku sampel', '%']] },
    { f: 'Sharpe = (R̄ − R<sub>f</sub>) / σ', meaning: 'Imbal hasil tambahan di atas aset bebas risiko untuk setiap 1% risiko yang ditanggung. Makin tinggi makin efisien.', symbols: [['R<sub>f</sub>', 'Imbal hasil bebas risiko (SBN)', '%']] },
    { f: 'R<sub>CAPM</sub> = R<sub>f</sub> + β · (R<sub>m</sub> − R<sub>f</sub>) &nbsp;·&nbsp; α = R̄ − R<sub>CAPM</sub>', meaning: 'CAPM: imbal hasil minimal yang pantas diminta untuk tingkat risiko pasar β. Alpha positif berarti aset memberi lebih dari yang pantas.', symbols: [['β', 'Kepekaan aset terhadap pasar (1 = sama dengan IHSG)', 'tanpa satuan'], ['R<sub>m</sub>', 'Perkiraan imbal hasil pasar saham', '%'], ['α', 'Alpha (kelebihan imbal hasil)', '%']] },
    { f: 'Nilai akhir = Modal × (1 + r₁)(1 + r₂)…(1 + r<sub>n</sub>) &nbsp;·&nbsp; CAGR = [(1 + r₁)…(1 + r<sub>n</sub>)]<sup>1/n</sup> − 1', meaning: 'Pertumbuhan majemuk yang sebenarnya dialami uang. Turun 60% butuh naik 150% untuk kembali ke modal, sehingga volatilitas tinggi menggerus CAGR.', symbols: [['CAGR', 'Pertumbuhan tahunan majemuk', '%/tahun'], ['r<sub>i</sub>', 'Ditulis sebagai desimal (12% = 0,12)', '']] },
  ],
  params: [
    { key: 'aset', label: 'Aset yang dianalisis', type: 'select', value: 0, options: ASSETS.map((a, i) => ({ value: i, label: a.name })) },
    { key: 'rf', label: 'Imbal hasil bebas risiko R<sub>f</sub> (SBN)', min: 3, max: 9, step: 0.25, value: 6.5, unit: '%' },
    { key: 'rm', label: 'Imbal hasil pasar R<sub>m</sub>', min: 6, max: 15, step: 0.5, value: 10, unit: '%' },
    { key: 'modal', label: 'Modal awal', min: 1, max: 100, step: 1, value: 10, unit: 'juta Rp' },
  ],
  compute(p) {
    const a = ASSETS[p.aset], b = best(p);
    return [
      { label: 'Aset paling layak (Sharpe tertinggi, α ≥ 0)', value: b ? b.name : 'Tidak ada: simpan di SBN', text: true, main: true },
      { label: `Rata-rata imbal hasil · ${a.name}`, value: mean(a.r), unit: '%', digits: 2 },
      { label: 'Risiko σ', value: sd(a.r), unit: '%', digits: 2 },
      { label: 'Sharpe ratio', value: sharpe(a, p.rf), unit: '', digits: 3 },
      { label: 'Imbal hasil wajar CAPM', value: capm(a, p), unit: '%', digits: 2 },
      { label: 'Alpha', value: alpha(a, p), unit: '%', digits: 2 },
      { label: 'CAGR 5 tahun', value: cagr(a.r), unit: '%', digits: 2 },
      { label: 'Nilai modal setelah 5 tahun', value: p.modal * growthFactor(a.r), unit: 'juta Rp', digits: 2 },
    ];
  },
  view: { camera: [0, 7, 14], target: [0, 3, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xbfc5cc });
    // bidang risiko (x) vs imbal hasil (y): setiap aset adalah bola; garis SML/Sharpe dari Rf
    // sumbu risiko memakai skala akar agar aset berisiko kecil tidak menumpuk di kiri
    const X = (s) => -6 + Math.sqrt(Math.min(1, s / 80)) * 12, Y = (m) => 0.6 + Math.max(-2, m) / 30 * 6;
    scene.add(mesh(new THREE.BoxGeometry(13, 7.5, 0.15), mat(0x1b2433), { y: 3.8, z: -0.4 }));
    scene.add(mesh(new THREE.BoxGeometry(12.4, 0.05, 0.05), mat(0xdfe6ee), { y: 0.6 }));
    scene.add(mesh(new THREE.BoxGeometry(0.05, 7, 0.05), mat(0xdfe6ee), { x: -6, y: 3.9 }));
    const ax1 = label('Risiko σ (skala akar) →', { size: 0.35 }); ax1.position.set(5, 0.2, 0.3);
    const ax2 = label('Imbal hasil ↑', { size: 0.35 }); ax2.position.set(-5.4, 7.2, 0.3);
    scene.add(ax1, ax2);
    const balls = ASSETS.map((a) => {
      const b = mesh(new THREE.SphereGeometry(0.3, 24, 16), mat(a.color, { emissive: a.color, emissiveIntensity: 0.3 }));
      b.position.set(X(sd(a.r)), Y(mean(a.r)), 0);
      const t = label(a.name, { size: 0.32 });
      t.position.set(b.position.x, b.position.y + 0.55, 0.3);
      scene.add(b, t);
      return { a, b };
    });
    const rfDot = mesh(new THREE.SphereGeometry(0.2, 16, 12), mat(0xffffff));
    scene.add(rfDot);
    const line = new THREE.Mesh(new THREE.BufferGeometry(), mat(0xc6a8ff, { emissive: 0xc6a8ff, emissiveIntensity: 0.5 }));
    scene.add(line);
    const ring = mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 32), mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.8 }));
    scene.add(ring);
    const tag = label('', { size: 0.42 });
    tag.position.set(0, 8.2, 0);
    scene.add(tag);
    // tumpukan koin: nilai modal setelah 5 tahun
    const coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 20), mat(0xe8c15a, { metalness: 0.8, roughness: 0.3 }), 60);
    scene.add(coins);
    const d = new THREE.Object3D();
    let key = '';
    return {
      update(p, t) {
        const k = `${p.aset}|${p.rf}|${p.rm}|${p.modal}`;
        if (k !== key) {
          key = k;
          rfDot.position.set(X(0), Y(p.rf), 0);
          const b = best(p);
          const target = b || ASSETS[p.aset];
          const from = new THREE.Vector3(X(0), Y(p.rf), 0), to = new THREE.Vector3(X(sd(target.r)), Y(mean(target.r)), 0);
          const dir = to.clone().sub(from);
          line.geometry.dispose();
          line.geometry = new THREE.TubeGeometry(new THREE.LineCurve3(from, from.clone().addScaledVector(dir, 1.6)), 2, 0.04, 8);
          const sel = balls[p.aset].b.position;
          ring.position.copy(sel);
          const f = growthFactor(ASSETS[p.aset].r), n = Math.min(60, Math.round(p.modal * f / 2));
          for (let i = 0; i < 60; i++) {
            if (i < n) d.position.set(-7.6 + Math.floor(i / 20) * 0.6, 0.05 + (i % 20) * 0.09, 2); else d.position.set(0, -50, 0);
            d.updateMatrix(); coins.setMatrixAt(i, d.matrix);
          }
          coins.instanceMatrix.needsUpdate = true;
          tag.setText(`Terbaik: ${b ? b.name : 'SBN'} · Sharpe ${b ? sharpe(b, p.rf).toFixed(2).replace('.', ',') : '–'}`);
        }
        ring.rotation.y = t * 1.5;
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Imbal hasil emas 5 tahun terakhir: 20%, −3%, 4%, 15%, dan 9%. Berapa rata-rata imbal hasil tahunannya?',
      preset: { aset: 2 }, answer: mean(ASSETS[2].r), tolerance: 0.001, unit: '%',
      explain: 'R̄ = (20 − 3 + 4 + 15 + 9)/5 = 45/5 = 9%.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Saham bank memiliki rata-rata imbal hasil 11% dan simpangan baku 10,44%. Jika SBN memberi 6,5%, berapa Sharpe ratio saham bank?',
      preset: { aset: 0, rf: 6.5 }, answer: (11 - 6.5) / 10.44, tolerance: 0.01, unit: '',
      explain: 'Sharpe = (11 − 6,5)/10,44 ≈ 0,431. Setiap 1% risiko memberi tambahan 0,43% di atas SBN.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Saham bank memiliki β = 1,1. Dengan Rf = 6,5% dan perkiraan imbal hasil pasar 10%, berapa imbal hasil wajar menurut CAPM?',
      preset: { aset: 0, rf: 6.5, rm: 10 }, answer: 6.5 + 1.1 * (10 - 6.5), tolerance: 0.001, unit: '%',
      explain: 'R CAPM = 6,5 + 1,1 × (10 − 6,5) = 6,5 + 3,85 = 10,35%. Rata-rata saham bank 11% > 10,35%, jadi alpha = +0,65%.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Kripto mencatat 120%, −60%, 70%, −40%, dan 30% dalam 5 tahun (rata-rata 24%). Berapa CAGR sebenarnya?',
      preset: { aset: 3 }, answer: cagr(ASSETS[3].r), tolerance: 0.02, unit: '%/tahun',
      explain: 'Faktor = 2,2 × 0,4 × 1,7 × 0,6 × 1,3 ≈ 1,167. CAGR = 1,167^(1/5) − 1 ≈ 3,1% per tahun, jauh di bawah rata-rata 24%. Volatilitas tinggi menggerus pertumbuhan majemuk.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Dimas menaruh Rp 10 juta di saham bank yang imbal hasilnya 18%, −5%, 22%, 12%, dan 8%. Berapa juta rupiah nilainya setelah 5 tahun?',
      preset: { aset: 0, modal: 10 }, answer: 10 * growthFactor(ASSETS[0].r), tolerance: 0.005, unit: 'juta Rp',
      explain: 'Nilai = 10 × 1,18 × 0,95 × 1,22 × 1,12 × 1,08 ≈ Rp 16,54 juta (CAGR ≈ 10,6%).',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Keputusan',
      prompt: 'Dengan Rf = 6,5% dan Rm = 10%, aset mana yang paling layak menurut aturan "alpha ≥ 0, lalu Sharpe tertinggi"? (Sharpe: bank 0,43; indeks 0,06; emas 0,28; kripto 0,23. Alpha: bank +0,65; indeks −3,0; emas +2,15; kripto +8,75.)',
      preset: { rf: 6.5, rm: 10 },
      options: ['Kripto, karena rata-ratanya tertinggi', 'Saham bank: alpha positif dan Sharpe tertinggi', 'Reksa dana indeks, karena paling terdiversifikasi', 'Emas, karena alphanya positif'], answer: 1,
      explain: 'Reksa dana indeks gugur karena alpha negatif. Di antara bank, emas, dan kripto, Sharpe bank paling tinggi (0,43): imbal hasil per satuan risiko paling efisien. Kripto memang alpha-nya besar, tetapi risikonya σ ≈ 75%.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa menggabungkan saham dan emas dalam satu portofolio dapat menurunkan risiko total?',
      options: ['Karena emas selalu naik', 'Karena keduanya tidak bergerak searah (korelasi rendah), sehingga penurunan satu aset sering diimbangi aset lain', 'Karena pajaknya lebih kecil', 'Karena biaya transaksinya nol'], answer: 1,
      explain: 'Diversifikasi bekerja jika korelasi antar aset rendah. Lihat data: saat saham bank turun 5%, emas hanya turun 3%; saat emas lemah (4%), saham naik 22%.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Aplikasi robo-advisor menanyakan usia, tujuan, dan toleransi risiko sebelum menyarankan komposisi portofolio. Apa yang dilakukan algoritmanya?',
      options: ['Menebak harga saham besok', 'Mencari kombinasi aset dengan imbal hasil harapan tertinggi untuk tingkat risiko yang sesuai profil (optimasi rata-rata–varians), lalu menyeimbangkan ulang secara berkala', 'Membeli aset yang paling populer di media sosial', 'Menjamin tidak pernah rugi'], answer: 1,
      explain: 'Robo-advisor memakai teori portofolio modern (Markowitz) dan rebalancing otomatis. Tetap pastikan platformnya terdaftar dan diawasi OJK.',
    },
  ],
};
