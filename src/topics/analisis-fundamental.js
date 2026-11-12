import { mat, mesh, ground, label } from '../lib/helpers.js';

// Satuan: laba, ekuitas, utang dalam miliar Rp; jumlah saham dalam miliar lembar; harga & DPS dalam Rp/lembar.
const eps = (p) => p.laba / p.saham;
const bvps = (p) => p.ekuitas / p.saham;
const per = (p) => p.harga / eps(p);
const pbv = (p) => p.harga / bvps(p);
const roe = (p) => (p.laba / p.ekuitas) * 100;
const der = (p) => p.utang / p.ekuitas;
const dy = (p) => (p.dps / p.harga) * 100;
const fair = (p) => eps(p) * p.perw;
const mos = (p) => ((fair(p) - p.harga) / fair(p)) * 100;
const checks = (p) => [
  { name: 'ROE ≥ 15%', ok: roe(p) >= 15 },
  { name: 'DER ≤ 1', ok: der(p) <= 1 },
  { name: 'Margin of safety ≥ 0', ok: mos(p) >= 0 },
];

export default {
  id: 'analisis-fundamental',
  subject: 'keuangan',
  title: 'Analisis Fundamental Saham (PER, PBV, ROE, DER)',
  tags: ['ekonomi'],
  summary: 'Baca laporan keuangan emiten untuk menilai apakah sahamnya murah, sehat, dan menguntungkan: EPS, PER, PBV, ROE, DER, dividend yield, nilai wajar, dan margin of safety.',
  story: `
    <p><strong>Studi kasus: Menyaring saham di Bursa Efek Indonesia.</strong> Sinta ingin membeli saham perusahaan makanan fiktif <em>PT Nusantara Pangan Tbk</em>. Harga sahamnya Rp 2.500 per lembar. Dari laporan keuangan tahunan, laba bersih Rp 1.000 miliar, jumlah saham 5 miliar lembar, ekuitas Rp 6.000 miliar, total utang Rp 4.200 miliar, dan dividen Rp 100 per lembar.</p>
    <p>Harga saja tidak menunjukkan murah atau mahal. Sinta membandingkan harga dengan laba per saham (<strong>PER</strong>) dan nilai buku (<strong>PBV</strong>), mengukur seberapa pandai manajemen menghasilkan laba dari modal pemilik (<strong>ROE</strong>), dan memeriksa beban utang (<strong>DER</strong>).</p>
    <p>Lalu ia menaksir <strong>nilai wajar</strong> = EPS × PER wajar sektor (misalnya 15) dan hanya membeli jika harga pasar di bawah nilai wajar (<em>margin of safety</em> positif). Data dan perusahaan di topik ini fiktif, untuk latihan saja.</p>`,
  concept: 'EPS = Laba/Saham &nbsp;·&nbsp; PER = Harga/EPS &nbsp;·&nbsp; ROE = Laba/Ekuitas &nbsp;·&nbsp; DER = Utang/Ekuitas &nbsp;·&nbsp; MOS = (Nilai wajar − Harga)/Nilai wajar',
  conceptNote: 'Kriteria penyaringan di simulasi (ROE ≥ 15%, DER ≤ 1, MOS ≥ 0) adalah contoh aturan sederhana. Batas wajar berbeda per sektor; bank misalnya wajar memiliki DER tinggi. Bukan rekomendasi investasi.',
  equations: [
    { f: 'EPS = Laba bersih / Jumlah saham', meaning: 'Laba yang menjadi hak setiap lembar saham.', symbols: [['EPS', 'Earning per share', 'Rp/lembar']] },
    { f: 'PER = Harga / EPS', meaning: 'Berapa tahun laba saat ini dibutuhkan untuk "menebus" harga saham. Makin kecil, makin murah (jika labanya stabil).', symbols: [['PER', 'Price to earnings ratio', 'kali']] },
    { f: 'BVPS = Ekuitas / Jumlah saham &nbsp;·&nbsp; PBV = Harga / BVPS', meaning: 'Perbandingan harga pasar dengan nilai buku (modal pemilik) per lembar.', symbols: [['BVPS', 'Nilai buku per saham', 'Rp/lembar'], ['PBV', 'Price to book value', 'kali']] },
    { f: 'ROE = Laba bersih / Ekuitas × 100%', meaning: 'Kemampuan perusahaan menghasilkan laba dari setiap rupiah modal pemilik.', symbols: [['ROE', 'Return on equity', '%']] },
    { f: 'DER = Total utang / Ekuitas', meaning: 'Seberapa besar perusahaan dibiayai utang dibanding modal sendiri. Makin tinggi, makin berat beban bunga saat suku bunga naik.', symbols: [['DER', 'Debt to equity ratio', 'kali']] },
    { f: 'Dividend yield = DPS / Harga × 100%', meaning: 'Imbal hasil tunai dari dividen dibanding harga saham.', symbols: [['DPS', 'Dividen per saham', 'Rp/lembar']] },
    { f: 'Nilai wajar = EPS × PER<sub>wajar</sub> &nbsp;·&nbsp; MOS = (Nilai wajar − Harga) / Nilai wajar × 100%', meaning: 'Taksiran harga pantas berdasarkan laba. Margin of safety positif berarti harga pasar di bawah nilai wajar sehingga ada "bantalan" jika taksiran meleset.', symbols: [['PER<sub>wajar</sub>', 'PER rata-rata sektor yang dianggap wajar', 'kali'], ['MOS', 'Margin of safety', '%']] },
  ],
  params: [
    { key: 'harga', label: 'Harga saham', min: 100, max: 10000, step: 50, value: 2500, unit: 'Rp' },
    { key: 'laba', label: 'Laba bersih setahun', min: 50, max: 5000, step: 50, value: 1000, unit: 'miliar Rp' },
    { key: 'saham', label: 'Jumlah saham beredar', min: 0.5, max: 20, step: 0.5, value: 5, unit: 'miliar lembar' },
    { key: 'ekuitas', label: 'Ekuitas', min: 500, max: 30000, step: 100, value: 6000, unit: 'miliar Rp' },
    { key: 'utang', label: 'Total utang', min: 0, max: 30000, step: 100, value: 4200, unit: 'miliar Rp' },
    { key: 'dps', label: 'Dividen per saham', min: 0, max: 500, step: 5, value: 100, unit: 'Rp' },
    { key: 'perw', label: 'PER wajar sektor', min: 5, max: 30, step: 0.5, value: 15, unit: 'kali' },
  ],
  compute(p) {
    const c = checks(p), pass = c.every((x) => x.ok);
    return [
      { label: 'Kesimpulan penyaringan', value: pass ? 'Layak dipertimbangkan' : `Belum layak: gagal ${c.filter((x) => !x.ok).map((x) => x.name).join(', ')}`, text: true, main: true },
      { label: 'EPS', value: eps(p), unit: 'Rp', digits: 0 },
      { label: 'PER', value: per(p), unit: 'kali', digits: 2 },
      { label: 'PBV', value: pbv(p), unit: 'kali', digits: 2 },
      { label: 'ROE', value: roe(p), unit: '%', digits: 2 },
      { label: 'DER', value: der(p), unit: 'kali', digits: 2 },
      { label: 'Dividend yield', value: dy(p), unit: '%', digits: 2 },
      { label: 'Nilai wajar', value: fair(p), unit: 'Rp', digits: 0 },
      { label: 'Margin of safety', value: mos(p), unit: '%', digits: 1 },
    ];
  },
  view: { camera: [0, 6, 13], target: [0, 2.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc7c2b8 });
    // timbangan: piring kiri = harga pasar, piring kanan = nilai wajar
    const metal = mat(0xb7a27a, { metalness: 0.8, roughness: 0.3 });
    scene.add(mesh(new THREE.CylinderGeometry(0.15, 0.3, 4, 16), metal, { x: -3, y: 2 }));
    scene.add(mesh(new THREE.CylinderGeometry(1, 1.2, 0.3, 24), metal, { x: -3, y: 0.15 }));
    const beam = new THREE.Group();
    beam.position.set(-3, 4, 0);
    beam.add(mesh(new THREE.BoxGeometry(5, 0.14, 0.2), metal));
    const pans = [-2.4, 2.4].map((x) => {
      const g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 4), metal, { y: -0.7 }));
      g.add(mesh(new THREE.CylinderGeometry(0.8, 0.6, 0.12, 24), metal, { y: -1.4 }));
      g.position.x = x; beam.add(g); return g;
    });
    scene.add(beam);
    const coinGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 20);
    const stacks = [mat(0xff8f8f), mat(0x9ade8b)].map((m, i) => { const s = new THREE.InstancedMesh(coinGeo, m, 40); pans[i].add(s); return s; });
    const tL = label('Harga', { size: 0.38 }), tR = label('Nilai wajar', { size: 0.38 });
    scene.add(tL, tR);
    // pilar indikator: hijau lolos, merah gagal
    const names = ['ROE', 'DER', 'MOS', 'PER', 'PBV'];
    const pillars = names.map((n, i) => {
      const m = new THREE.MeshStandardMaterial({ color: 0x888888, emissive: 0x000000, emissiveIntensity: 0.4 });
      const b = mesh(new THREE.BoxGeometry(0.8, 1, 0.8), m, { x: 1.5 + i * 1.2 });
      const t = label(n, { size: 0.32 });
      scene.add(b, t);
      return { m, b, t, n };
    });
    const d = new THREE.Object3D();
    let key = '';
    return {
      update(p, t) {
        const k = JSON.stringify(p);
        if (k === key) return;
        key = k;
        const vals = [p.harga, fair(p)], max = Math.max(...vals);
        const tilt = Math.max(-0.35, Math.min(0.35, ((p.harga - fair(p)) / max) * 0.6));
        beam.rotation.z = tilt;
        pans.forEach((g) => { g.rotation.z = -tilt; });
        stacks.forEach((s, i) => {
          const n = Math.max(1, Math.round((vals[i] / max) * 30));
          for (let j = 0; j < 40; j++) { if (j < n) d.position.set(0, -1.3 + j * 0.09, 0); else d.position.set(0, -50, 0); d.updateMatrix(); s.setMatrixAt(j, d.matrix); }
          s.instanceMatrix.needsUpdate = true;
        });
        tL.setText(`Harga Rp ${p.harga.toLocaleString('id-ID')}`); tL.position.set(-5.6, 5.1, 0);
        tR.setText(`Wajar Rp ${Math.round(fair(p)).toLocaleString('id-ID')}`); tR.position.set(-0.4, 5.1, 0);
        const v = { ROE: [roe(p) / 10, roe(p) >= 15, `${roe(p).toFixed(1)}%`], DER: [der(p) * 2, der(p) <= 1, der(p).toFixed(2)], MOS: [Math.max(0.1, (mos(p) + 50) / 20), mos(p) >= 0, `${mos(p).toFixed(0)}%`], PER: [per(p) / 5, per(p) <= p.perw, per(p).toFixed(1)], PBV: [pbv(p), pbv(p) <= 3, pbv(p).toFixed(2)] };
        pillars.forEach((pl) => {
          const [h, ok, txt] = v[pl.n], hh = Math.min(6, Math.max(0.1, h));
          pl.b.scale.y = hh; pl.b.position.y = hh / 2;
          pl.m.color.set(ok ? 0x5fcf7a : 0xe36464); pl.m.emissive.set(ok ? 0x1d5a2a : 0x5a1d1d);
          pl.t.setText(`${pl.n} ${txt.replace('.', ',')}`); pl.t.position.set(pl.b.position.x, hh + 0.45, 0);
        });
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'PT Nusantara Pangan mencatat laba bersih Rp 1.000 miliar dengan 5 miliar lembar saham beredar. Berapa EPS-nya?',
      preset: { laba: 1000, saham: 5 }, answer: 200, tolerance: 0.001, unit: 'Rp/lembar',
      explain: 'EPS = 1.000 miliar / 5 miliar lembar = Rp 200 per lembar.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Harga saham Rp 2.500 dan EPS Rp 200. Berapa PER-nya?',
      preset: { harga: 2500, laba: 1000, saham: 5 }, answer: 12.5, tolerance: 0.001, unit: 'kali',
      explain: 'PER = 2.500/200 = 12,5 kali: dengan laba saat ini, butuh 12,5 tahun laba untuk menyamai harga.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Laba bersih Rp 1.000 miliar dan ekuitas Rp 6.000 miliar. Berapa persen ROE perusahaan?',
      preset: { laba: 1000, ekuitas: 6000 }, answer: (1000 / 6000) * 100, tolerance: 0.01, unit: '%',
      explain: 'ROE = 1.000/6.000 × 100% ≈ 16,67%, di atas syarat 15%.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Total utang Rp 4.200 miliar dan ekuitas Rp 6.000 miliar. Berapa DER-nya?',
      preset: { utang: 4200, ekuitas: 6000 }, answer: 0.7, tolerance: 0.001, unit: 'kali',
      explain: 'DER = 4.200/6.000 = 0,7. Setiap Rp 1 modal pemilik didampingi Rp 0,70 utang: masih tergolong sehat (≤ 1).',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'EPS Rp 200 dan PER wajar sektor makanan 15 kali. Harga pasar Rp 2.500. Berapa persen margin of safety-nya?',
      preset: { harga: 2500, laba: 1000, saham: 5, perw: 15 }, answer: ((3000 - 2500) / 3000) * 100, tolerance: 0.01, unit: '%',
      explain: 'Nilai wajar = 200 × 15 = Rp 3.000. MOS = (3.000 − 2.500)/3.000 × 100% ≈ 16,7%.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Dividen Rp 100 per lembar dan harga saham Rp 2.500. Berapa persen dividend yield-nya?',
      preset: { harga: 2500, dps: 100 }, answer: 4, tolerance: 0.001, unit: '%',
      explain: 'Dividend yield = 100/2.500 × 100% = 4%.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Keputusan',
      prompt: 'Sinta menyaring tiga saham (PER wajar 15): A: PER 8, ROE 22%, DER 0,5. B: PER 30, ROE 25%, DER 0,4. C: PER 6, ROE 5%, DER 3,0. Dengan kriteria ROE ≥ 15%, DER ≤ 1, dan MOS ≥ 0, mana yang lolos?',
      options: ['A saja', 'B saja', 'C saja', 'A dan C'], answer: 0,
      explain: 'MOS ≥ 0 sama dengan PER ≤ PER wajar (karena Nilai wajar = EPS × 15). A: lolos semua. B: perusahaan bagus tetapi PER 30 > 15 sehingga MOS negatif (terlalu mahal). C: murah tetapi ROE rendah dan utang besar ("value trap").',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa perusahaan dengan DER tinggi lebih berisiko saat Bank Indonesia menaikkan suku bunga?',
      options: ['Karena harga sahamnya pasti naik', 'Karena beban bunga utangnya naik sehingga laba bersih tergerus, bahkan bisa kesulitan membayar cicilan', 'Karena ekuitasnya otomatis bertambah', 'Karena DER tidak berhubungan dengan bunga'], answer: 1,
      explain: 'Bunga adalah biaya sebelum laba bersih. Utang besar + bunga naik = laba turun, EPS turun, dan risiko gagal bayar meningkat.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Laporan keuangan emiten di BEI kini dipublikasikan dalam format XBRL. Apa manfaatnya bagi analis?',
      options: ['Membuat laporan lebih panjang', 'Data keuangan terstruktur dan bisa dibaca mesin, sehingga aplikasi screener dapat menghitung PER, ROE, dan DER ratusan emiten secara otomatis dan seragam', 'Menyembunyikan data dari publik', 'Menggantikan audit'], answer: 1,
      explain: 'XBRL memberi "tag" baku untuk setiap pos laporan (laba bersih, ekuitas, utang), sehingga perbandingan antar perusahaan bisa diotomatisasi.',
    },
  ],
};
