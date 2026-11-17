import { mat, mesh, ground, label } from '../lib/helpers.js';

// Penjualan AC (unit) Jan–Des di sebuah toko elektronik Surabaya (data ilustrasi).
export const SALES = [120, 135, 150, 170, 190, 210, 205, 195, 180, 160, 140, 130];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const ma = (n) => SALES.map((_, t) => (t < n ? null : SALES.slice(t - n, t).reduce((a, b) => a + b, 0) / n));
const maNext = (n) => SALES.slice(-n).reduce((a, b) => a + b, 0) / n;
const ses = (a) => { const f = [SALES[0]]; for (let t = 1; t <= SALES.length; t++) f[t] = a * SALES[t - 1] + (1 - a) * f[t - 1]; return f; };
const mad = (f) => { const e = SALES.map((d, t) => (f[t] == null || t === 0 ? null : Math.abs(d - f[t]))).filter((x) => x != null); return e.reduce((a, b) => a + b, 0) / e.length; };

export default {
  id: 'peramalan-permintaan',
  subject: 'industri',
  // Soal disusun ulang (maks. 6); kunci progres baru agar progres lama tidak menempel ke soal yang salah.
  progressKey: 'peramalan-permintaan-v2',
  title: 'Peramalan Permintaan (Forecasting)',
  tags: ['industri', 'sehari-hari'],
  summary: 'Ramalkan penjualan bulan depan dengan rata-rata bergerak dan pemulusan eksponensial, lalu bandingkan ketepatannya dengan MAD dan MAPE.',
  story: `
    <p><strong>Studi kasus: Toko elektronik di Surabaya.</strong> Penjualan AC naik saat kemarau (April–Juli) dan turun saat musim hujan. Pemilik harus memesan stok dari distributor sebulan sebelumnya. Jika ramalan terlalu tinggi, gudang penuh; jika terlalu rendah, pembeli lari ke toko lain.</p>
    <p>Penjualan setahun terakhir (unit): ${SALES.map((v, i) => `${MONTHS[i]} ${v}`).join(', ')}.</p>
    <p><strong>Rata-rata bergerak</strong> (moving average) memakai rata-rata n bulan terakhir. <strong>Pemulusan eksponensial</strong> memperbarui ramalan lama dengan sebagian kesalahan bulan lalu, diatur oleh konstanta α. Metode terbaik adalah yang kesalahan rata-ratanya (MAD) paling kecil.</p>`,
  concept: 'MA<sub>n</sub> = (D<sub>t−1</sub> + … + D<sub>t−n</sub>)/n &nbsp;·&nbsp; F<sub>t+1</sub> = α·D<sub>t</sub> + (1 − α)·F<sub>t</sub> &nbsp;·&nbsp; MAD = Σ|D − F|/m',
  conceptNote: 'Pemulusan eksponensial di simulasi dimulai dengan F<sub>Jan</sub> = D<sub>Jan</sub>. MAD dihitung dari bulan-bulan yang sudah punya ramalan. Kedua metode sederhana ini tidak menangkap tren dan musim; untuk itu dipakai metode Holt–Winters.',
  equations: [
    { f: 'F<sub>t</sub> = MA<sub>n</sub> = (D<sub>t−1</sub> + D<sub>t−2</sub> + … + D<sub>t−n</sub>) / n', meaning: 'Ramalan bulan depan = rata-rata penjualan n bulan terakhir.', symbols: [['D<sub>t</sub>', 'Permintaan aktual bulan t', 'unit'], ['F<sub>t</sub>', 'Ramalan untuk bulan t', 'unit'], ['n', 'Jumlah bulan yang dirata-rata', 'bulan']] },
    { f: 'F<sub>t+1</sub> = α · D<sub>t</sub> + (1 − α) · F<sub>t</sub>', meaning: 'Ramalan baru = campuran data terbaru dan ramalan lama. α besar → cepat mengikuti perubahan; α kecil → lebih halus.', symbols: [['α', 'Konstanta pemulusan (0–1)', 'tanpa satuan']] },
    { f: 'e<sub>t</sub> = D<sub>t</sub> − F<sub>t</sub>', meaning: 'Kesalahan ramalan: positif jika ramalan terlalu rendah.', symbols: [['e<sub>t</sub>', 'Kesalahan', 'unit']] },
    { f: 'MAD = Σ|e<sub>t</sub>| / m &nbsp;·&nbsp; MAPE = (Σ|e<sub>t</sub>| / D<sub>t</sub>) / m × 100%', meaning: 'Rata-rata besar kesalahan (tanpa melihat tanda), dalam unit (MAD) atau dalam persen (MAPE). Makin kecil makin akurat.', symbols: [['m', 'Banyaknya bulan yang dibandingkan', 'bulan']] },
  ],
  params: [
    { key: 'n', label: 'Periode rata-rata bergerak n', min: 2, max: 6, step: 1, value: 3, unit: 'bulan' },
    { key: 'alpha', label: 'Konstanta pemulusan α', min: 0.1, max: 0.9, step: 0.05, value: 0.3, unit: '' },
  ],
  compute(p) {
    const fm = ma(p.n), fs = ses(p.alpha);
    const mMA = mad(fm), mSES = mad(fs.slice(0, 12));
    return [
      { label: 'Metode lebih akurat (MAD lebih kecil)', value: mMA <= mSES ? `Rata-rata bergerak (n = ${p.n})` : `Pemulusan eksponensial (α = ${String(p.alpha).replace('.', ',')})`, text: true, main: true },
      { label: 'Ramalan Januari depan · MA', value: maNext(p.n), unit: 'unit', digits: 1 },
      { label: 'Ramalan Januari depan · eksponensial', value: fs[12], unit: 'unit', digits: 1 },
      { label: 'MAD rata-rata bergerak', value: mMA, unit: 'unit', digits: 1 },
      { label: 'MAD pemulusan eksponensial', value: mSES, unit: 'unit', digits: 1 },
    ];
  },
  view: { camera: [0, 6, 15], target: [0, 2.6, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc6ccd2 });
    const H = (v) => (v / 220) * 5;
    const X = (i) => -6.5 + i * 1;
    SALES.forEach((v, i) => {
      scene.add(mesh(new THREE.BoxGeometry(0.6, H(v), 0.6), mat(0x7fd3ff, { emissive: 0x7fd3ff, emissiveIntensity: 0.12 }), { x: X(i), y: H(v) / 2 }));
      const t = label(MONTHS[i], { size: 0.28 }); t.position.set(X(i), -0.05, 0.7); scene.add(t);
    });
    const maDots = Array.from({ length: 13 }, () => { const s = mesh(new THREE.SphereGeometry(0.14, 14, 10), mat(0xffa36b, { emissive: 0xffa36b, emissiveIntensity: 0.6 })); scene.add(s); return s; });
    const sDots = Array.from({ length: 13 }, () => { const s = mesh(new THREE.SphereGeometry(0.14, 14, 10), mat(0xc6a8ff, { emissive: 0xc6a8ff, emissiveIntensity: 0.6 })); scene.add(s); return s; });
    const next = mesh(new THREE.BoxGeometry(0.6, 1, 0.6), mat(0xffffff, { transparent: true, opacity: 0.35 }), { x: X(12) });
    scene.add(next);
    const lMA = label('', { size: 0.34 }), lS = label('', { size: 0.34 });
    lMA.position.set(-3, 6.4, 0); lS.position.set(3, 6.4, 0);
    scene.add(lMA, lS);
    let key = '';
    return {
      update(p, t) {
        const k = `${p.n}|${p.alpha}`;
        if (k !== key) {
          key = k;
          const fm = [...ma(p.n), maNext(p.n)], fs = ses(p.alpha);
          fm.forEach((v, i) => { maDots[i].visible = v != null; if (v != null) maDots[i].position.set(X(i) - 0.15, H(v), 0.45); });
          fs.forEach((v, i) => { sDots[i].position.set(X(i) + 0.15, H(v), 0.45); });
          const avg = (maNext(p.n) + fs[12]) / 2;
          next.scale.y = H(avg); next.position.y = H(avg) / 2;
          lMA.setText(`● MA(${p.n}) · MAD ${mad(ma(p.n)).toFixed(1).replace('.', ',')}`);
          lS.setText(`● Eksponensial α ${String(p.alpha).replace('.', ',')} · MAD ${mad(fs.slice(0, 12)).toFixed(1).replace('.', ',')}`);
        }
        next.material.opacity = 0.25 + 0.15 * Math.sin(t * 3);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Penjualan AC Oktober 160, November 140, dan Desember 130 unit. Dengan rata-rata bergerak 3 bulan, berapa ramalan penjualan Januari?',
      preset: { n: 3 }, answer: (160 + 140 + 130) / 3, tolerance: 0.005, unit: 'unit',
      explain: 'MA₃ = (160 + 140 + 130)/3 = 430/3 ≈ 143,3 unit.',
    },
    {
      stem: 'S', type: 'num', kind: 'Konsep',
      prompt: 'Makin panjang n, ramalan makin halus tetapi makin lambat bereaksi. Dengan rata-rata bergerak 4 bulan (September 180, Oktober 160, November 140, Desember 130), berapa ramalan Januari?',
      preset: { n: 4 }, answer: (180 + 160 + 140 + 130) / 4, tolerance: 0.005, unit: 'unit',
      explain: 'MA₄ = (180 + 160 + 140 + 130)/4 = 610/4 = 152,5 unit. Makin panjang n, makin lambat ramalan mengikuti tren turun.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Ramalan Maret 150 unit dan penjualan aktual Maret 170 unit. Dengan α = 0,3, berapa ramalan April menurut pemulusan eksponensial?',
      answer: 0.3 * 170 + 0.7 * 150, tolerance: 0.001, unit: 'unit',
      explain: 'F = 0,3 × 170 + 0,7 × 150 = 51 + 105 = 156 unit. Ramalan naik 30% dari kesalahan bulan lalu (20 unit).',
    },
    {
      stem: 'T', type: 'num', kind: 'Teknologi',
      prompt: 'Sistem kasir (POS) berbasis cloud memperbarui ramalan otomatis setiap bulan. Ramalan November 150 unit dan penjualan aktual November 140 unit. Dengan α = 0,5, berapa ramalan Desember?',
      preset: { alpha: 0.5 }, answer: 0.5 * 140 + 0.5 * 150, tolerance: 0.001, unit: 'unit',
      explain: 'F = 0,5 × 140 + 0,5 × 150 = 70 + 75 = 145 unit.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Kesalahan ramalan empat bulan berturut-turut adalah +10, −5, +15, dan −20 unit. Berapa MAD-nya?',
      answer: (10 + 5 + 15 + 20) / 4, tolerance: 0.001, unit: 'unit',
      explain: 'MAD = (|10| + |−5| + |15| + |−20|)/4 = 50/4 = 12,5 unit. Tanda diabaikan agar kesalahan positif dan negatif tidak saling menghapus.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Dua bulan terakhir: penjualan 100 dan 120 unit, ramalan 90 dan 126 unit. Berapa persen MAPE-nya?',
      answer: ((10 / 100 + 6 / 120) / 2) * 100, tolerance: 0.001, unit: '%',
      explain: 'Kesalahan persen: 10/100 = 10% dan 6/120 = 5%. MAPE = (10% + 5%)/2 = 7,5%.',
    },
  ],
};
