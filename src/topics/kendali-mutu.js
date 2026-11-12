import { mat, mesh, ground, label, rand } from '../lib/helpers.js';

const TARGET = 50; // mm, diameter nominal baut
// fungsi distribusi normal baku (pendekatan Abramowitz–Stegun, galat < 1e-7)
function phi(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
const usl = (p) => TARGET + p.tol, lsl = (p) => TARGET - p.tol;
const cp = (p) => (2 * p.tol) / (6 * p.sigma);
const cpk = (p) => Math.min(usl(p) - p.mu, p.mu - lsl(p)) / (3 * p.sigma);
const ppm = (p) => (phi((lsl(p) - p.mu) / p.sigma) + 1 - phi((usl(p) - p.mu) / p.sigma)) * 1e6;

export default {
  id: 'kendali-mutu',
  subject: 'industri',
  title: 'Pengendalian Kualitas (SPC & Cpk)',
  tags: ['industri'],
  summary: 'Mengukur seberapa mampu mesin membuat produk sesuai spesifikasi, dan kapan proses harus disetel ulang.',
  story: `
    <p><strong>Studi kasus: Pabrik baut otomotif di Karawang.</strong> Pelanggan mensyaratkan diameter baut 50,00 ± 0,06 mm. Baut di luar batas itu ditolak dan pabrik dikenai penalti.</p>
    <p>Tidak ada mesin yang sempurna: diameter hasil bubut selalu sedikit bervariasi dan mengikuti <em>distribusi normal</em>. Ukuran variasinya adalah simpangan baku σ. Tim QC mengambil 5 baut setiap jam, mengukurnya, lalu memplot rata-ratanya di <em>peta kendali</em> (control chart) x̄.</p>
    <p>Dua angka utama: <strong>Cp</strong> membandingkan lebar toleransi dengan lebar variasi proses (6σ), dan <strong>Cpk</strong> juga memperhitungkan apakah rata-rata proses bergeser dari target. Industri otomotif umumnya meminta Cpk ≥ 1,33.</p>`,
  concept: 'Cp = (USL − LSL) / 6σ &nbsp;·&nbsp; Cpk = min(USL − μ, μ − LSL) / 3σ &nbsp;·&nbsp; UCL/LCL = μ ± 3σ/√n',
  conceptNote: 'Sekitar 99,73% data distribusi normal berada dalam μ ± 3σ. Six Sigma berarti batas spesifikasi berada 6σ dari rata-rata (Cpk = 2).',
  equations: [
    {
      f: 'Cp = (USL − LSL) / 6σ', meaning: 'Seberapa lebar "jalan" toleransi dibanding lebar "mobil" variasi proses. Cp = 1 berarti pas-pasan.',
      symbols: [['Cp', 'Indeks kemampuan proses (potensi)', 'tanpa satuan'], ['USL, LSL', 'Batas spesifikasi atas dan bawah', 'mm'], ['σ', 'Simpangan baku proses', 'mm']],
    },
    {
      f: 'Cpk = min(USL − μ, μ − LSL) / 3σ', meaning: 'Sama seperti Cp tetapi dihitung dari sisi yang paling dekat dengan rata-rata. Jika proses bergeser, Cpk turun walaupun Cp tetap.',
      symbols: [['Cpk', 'Indeks kemampuan proses aktual', 'tanpa satuan'], ['μ', 'Rata-rata hasil proses', 'mm']],
    },
    {
      f: 'UCL = μ + 3σ/√n · LCL = μ − 3σ/√n', meaning: 'Batas peta kendali untuk rata-rata sampel. Titik di luar batas menandakan ada penyebab khusus (mesin aus, bahan berbeda) yang harus dicari.',
      symbols: [['UCL, LCL', 'Batas kendali atas dan bawah', 'mm'], ['n', 'Ukuran sampel per pengambilan', 'buah']],
    },
  ],
  params: [
    { key: 'mu', label: 'Rata-rata proses μ', min: 49.9, max: 50.1, step: 0.005, value: 50, unit: 'mm' },
    { key: 'sigma', label: 'Simpangan baku σ', min: 0.005, max: 0.06, step: 0.001, value: 0.02, unit: 'mm' },
    { key: 'tol', label: 'Toleransi ±', min: 0.02, max: 0.15, step: 0.01, value: 0.06, unit: 'mm' },
    { key: 'n', label: 'Ukuran sampel', min: 2, max: 10, step: 1, value: 5, unit: 'buah' },
  ],
  compute(p) {
    return [
      { label: 'Cpk', value: cpk(p), unit: '', digits: 2, main: true },
      { label: 'Cp', value: cp(p), unit: '', digits: 2 },
      { label: 'Produk cacat', value: ppm(p), unit: 'ppm', digits: 0 },
      { label: 'Level sigma (3·Cpk)', value: 3 * cpk(p), unit: 'σ', digits: 2 },
      { label: 'UCL peta x̄', value: p.mu + (3 * p.sigma) / Math.sqrt(p.n), unit: 'mm', digits: 3 },
      { label: 'LCL peta x̄', value: p.mu - (3 * p.sigma) / Math.sqrt(p.n), unit: 'mm', digits: 3 },
    ];
  },
  view: { camera: [0, 7, 15], target: [0, 2, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc4cad0 });
    // ban berjalan
    scene.add(mesh(new THREE.BoxGeometry(16, 0.3, 2), mat(0x2d3640), { y: 1 }));
    for (let i = -7; i <= 7; i++) {
      const r = mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.1, 12), mat(0x8a96a3, { metalness: 0.7 }), { x: i, y: 0.82 });
      r.rotation.x = Math.PI / 2; scene.add(r);
    }
    // gerbang kamera inspeksi
    const gate = new THREE.Group();
    gate.add(mesh(new THREE.BoxGeometry(0.2, 3, 0.2), mat(0x5c6b7a), { x: 0, y: 2.5, z: -1.2 }));
    gate.add(mesh(new THREE.BoxGeometry(0.2, 3, 0.2), mat(0x5c6b7a), { x: 0, y: 2.5, z: 1.2 }));
    gate.add(mesh(new THREE.BoxGeometry(0.4, 0.3, 2.6), mat(0x1f2933), { x: 0, y: 4 }));
    const lamp = mesh(new THREE.SphereGeometry(0.18, 16, 12), new THREE.MeshBasicMaterial({ color: 0x86e0a8 }), { y: 3.75, shadow: false });
    gate.add(lamp);
    scene.add(gate);
    // baut: 24 buah bergerak; diameter acak ~ N(μ, σ)
    const N = 24, rnd = rand(7);
    const z = Array.from({ length: N * 8 }, () => { const u = rnd() || 1e-9, v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); });
    const good = mat(0xb8c4d0, { metalness: 0.8, roughness: 0.3 }), bad = mat(0xe05a4f, { metalness: 0.5 });
    const bolts = Array.from({ length: N }, () => {
      const g = new THREE.Group();
      const shaft = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 12), good, { y: 0.45 });
      const head = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 6), good, { y: 0.95 });
      g.add(shaft, head); g.userData = { shaft, head };
      scene.add(g); return g;
    });
    // tempat sampah produk reject
    scene.add(mesh(new THREE.BoxGeometry(2, 1.2, 2), mat(0x8c2f2a), { x: 9.5, y: 0.6, z: 2.8 }));
    const tag = label('', { size: 0.6 });
    tag.position.set(0, 5.4, 0);
    scene.add(tag);
    return {
      update(p, t) {
        let bads = 0;
        bolts.forEach((b, i) => {
          const pos = ((t * 1.2 + i * (16 / N)) % 16) - 8;
          const lap = Math.floor((t * 1.2 + i * (16 / N)) / 16);
          const dia = p.mu + p.sigma * z[(i + lap * N) % z.length];
          const off = dia > usl(p) || dia < lsl(p);
          const inspected = pos > 0;
          const reject = off && inspected;
          if (reject) bads++;
          b.userData.shaft.material = b.userData.head.material = reject ? bad : good;
          const s = 0.8 + (dia - TARGET) * 4; // perbesar beda diameter agar terlihat
          b.scale.set(s, 1, s);
          b.position.set(pos, 1.15, reject && pos > 6 ? 0 + (pos - 6) * 1.2 : 0);
        });
        lamp.material.color.set(bads ? 0xe05a4f : 0x86e0a8);
        tag.setText(`Cpk ${cpk(p).toFixed(2)} · ${Math.round(ppm(p)).toLocaleString('id-ID')} ppm cacat`);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Spesifikasi baut 50,00 ± 0,06 mm, simpangan baku proses 0,02 mm, dan rata-rata tepat di 50,00 mm. Berapa nilai Cp?',
      preset: { mu: 50, sigma: 0.02, tol: 0.06 }, answer: 1, tolerance: 0.01, unit: '',
      explain: 'Cp = (50,06 − 49,94) / (6 × 0,02) = 0,12 / 0,12 = 1,00. Proses pas-pasan: ±3σ tepat menyentuh batas spesifikasi.',
    },
    {
      stem: 'M', type: 'num', kind: 'Studi kasus',
      prompt: 'Pahat bubut aus sehingga rata-rata bergeser ke 50,02 mm (σ tetap 0,02 mm, spesifikasi 50,00 ± 0,06). Berapa Cpk sekarang?',
      preset: { mu: 50.02, sigma: 0.02, tol: 0.06 }, answer: 0.67, tolerance: 0.02, unit: '',
      explain: 'Cpk = min(50,06 − 50,02 ; 50,02 − 49,94) / (3 × 0,02) = min(0,04 ; 0,08) / 0,06 = 0,67. Cp tetap 1,00 tetapi Cpk turun karena proses tidak di tengah.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Peta kendali x̄ memakai sampel n = 4 baut, μ = 50,00 mm dan σ = 0,02 mm. Berapa batas kendali atas (UCL)?',
      preset: { mu: 50, sigma: 0.02, n: 4 }, answer: 50.03, tolerance: 0.00002, unit: 'mm',
      explain: 'UCL = μ + 3σ/√n = 50,00 + 3 × 0,02 / 2 = 50,03 mm.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa batas peta kendali ditaruh di ±3σ dari rata-rata?',
      options: ['Karena angka 3 mudah diingat', 'Karena pada distribusi normal 99,73% data berada di dalam ±3σ, sehingga titik di luar batas sangat kecil kemungkinannya terjadi kebetulan', 'Karena standar pelanggan selalu 3 mm', 'Karena n selalu 3'], answer: 1,
      explain: 'Peluang satu titik keluar ±3σ hanya 0,27% bila proses normal. Jadi titik di luar batas adalah tanda kuat ada penyebab khusus yang harus diselidiki.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Pabrik ingin memeriksa 100% baut, bukan hanya sampel 5 buah per jam. Teknologi apa yang paling cocok?',
      options: ['Menambah pekerja QC dengan jangka sorong', 'Sistem machine vision: kamera + pengolahan citra mengukur setiap baut di ban berjalan lalu menyingkirkan yang cacat', 'Menimbang seluruh baut sekaligus', 'Menurunkan kecepatan produksi'], answer: 1,
      explain: 'Kamera industri dan algoritma pengolahan citra (atau AI) dapat mengukur ratusan produk per menit dan datanya langsung masuk ke sistem SPC.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Hasil analisis: Cp = 1,8 tetapi Cpk = 0,9. Tindakan perbaikan apa yang paling tepat dan murah?',
      options: ['Membeli mesin baru yang lebih presisi', 'Menyetel ulang (centering) mesin agar rata-rata kembali ke target; variasinya sudah cukup kecil', 'Memperlebar toleransi tanpa izin pelanggan', 'Menambah inspeksi akhir saja'], answer: 1,
      explain: 'Cp tinggi berarti variasi sudah kecil. Cpk rendah hanya karena rata-rata bergeser, jadi cukup disetel ke tengah. Mesin baru baru diperlukan jika Cp juga rendah.',
    },
    {"stem":"M","type":"num","kind":"Hitung","prompt":"Peta kendali x̄ memakai sampel n = 9 baut, μ = 50,00 mm, dan σ = 0,03 mm. Berapa batas kendali bawah (LCL)?","preset":{"mu":50,"sigma":0.03,"n":9},"answer":49.97,"tolerance":0.00002,"unit":"mm","explain":"LCL = μ − 3σ/√n = 50,00 − 3 × 0,03/3 = 50,00 − 0,03 = 49,97 mm."},
    {"stem":"E","type":"num","kind":"Engineering","prompt":"Pelanggan otomotif meminta Cp minimal 1,33 untuk baut 50,00 ± 0,06 mm. Berapa simpangan baku proses maksimum yang diizinkan?","preset":{"tol":0.06},"answer":0.015037593984962405,"tolerance":0.01,"unit":"mm","explain":"Cp = (USL − LSL)/6σ → σ = 0,12/(6 × 1,33) ≈ 0,0150 mm."},
    {"stem":"M","type":"num","kind":"Hitung","prompt":"Rata-rata proses bergeser ke 49,97 mm dengan σ = 0,015 mm (spesifikasi 50,00 ± 0,06). Berapa Cpk-nya?","preset":{"mu":49.97,"sigma":0.015,"tol":0.06},"answer":0.6666666666666919,"tolerance":0.01,"unit":"","explain":"Cpk = min(50,06 − 49,97 ; 49,97 − 49,94)/(3 × 0,015) = min(0,09 ; 0,03)/0,045 ≈ 0,67. Walau σ kecil (Cp = 1,33), pergeseran ke bawah membuat proses tidak mampu."},
    {"stem":"M","type":"mcq","kind":"Hitung","prompt":"Ukuran sampel peta kendali dinaikkan dari n = 4 menjadi n = 16. Lebar jarak UCL–LCL menjadi …","preset":{"n":10},"options":["4 kali lebih lebar","Setengahnya","Seperempatnya","Tetap"],"answer":1,"explain":"Lebar = 6σ/√n. √16/√4 = 4/2 = 2, jadi lebar menjadi ½. Sampel lebih besar membuat peta lebih peka terhadap pergeseran kecil."},
    {"stem":"S","type":"mcq","kind":"Konsep","prompt":"Apa beda variasi penyebab umum (common cause) dan penyebab khusus (special cause)?","options":["Tidak ada bedanya","Penyebab umum adalah variasi acak bawaan proses; penyebab khusus adalah kejadian tertentu (pahat patah, bahan beda) yang membuat titik keluar batas kendali","Penyebab umum selalu karena operator","Penyebab khusus tidak bisa dihilangkan"],"answer":1,"explain":"Penyebab khusus dicari dan dihilangkan oleh operator/teknisi. Penyebab umum hanya berkurang jika sistemnya diperbaiki (mesin, metode, bahan), biasanya oleh manajemen."},
    {"stem":"E","type":"mcq","kind":"Engineering","prompt":"Hasil studi kemampuan: Cp = 0,8 dan Cpk = 0,8 (rata-rata sudah di tengah). Tindakan apa yang tepat?","preset":{"sigma":0.025,"tol":0.06,"mu":50},"options":["Cukup menyetel rata-rata ke tengah","Mengurangi variasi proses (perbaikan mesin, jig, bahan) atau meninjau ulang toleransi bersama desainer, karena Cp sendiri sudah < 1","Menghentikan inspeksi","Menambah ukuran sampel saja"],"answer":1,"explain":"Cp < 1 berarti sebaran ±3σ lebih lebar dari toleransi walaupun di tengah. Menggeser rata-rata tidak cukup; variasinya harus diperkecil."},
    {"stem":"T","type":"mcq","kind":"Teknologi","prompt":"Peta kendali digital menandai 7 titik berturut-turut di atas garis tengah, walaupun semuanya masih di dalam batas kendali. Mengapa sistem memberi peringatan?","options":["Karena perangkat lunaknya rusak","Pola berurutan seperti itu sangat kecil peluangnya jika proses acak (≈0,8%), jadi menandakan pergeseran rata-rata (aturan Western Electric/Nelson)","Karena titik harus selalu di bawah garis tengah","Karena n terlalu kecil"],"answer":1,"explain":"Peluang satu titik di atas garis tengah 50%. Tujuh berturut-turut = 0,5⁷ ≈ 0,78%. Aturan pola mendeteksi pergeseran kecil lebih cepat daripada menunggu titik keluar ±3σ."},
  ],
};
