import { mat, mesh, ground, label } from '../lib/helpers.js';

const ss = (p) => p.Z * p.sigma * Math.sqrt(p.L);
const rop = (p) => p.d * p.L + ss(p);
const avgInv = (p) => p.Q / 2 + ss(p);
const doi = (p) => avgInv(p) / p.d;

export default {
  id: 'stok-pengaman',
  subject: 'industri',
  title: 'Supply Chain: Stok Pengaman & Tingkat Layanan',
  tags: ['industri'],
  summary: 'Permintaan harian naik-turun. Hitung stok pengaman untuk tingkat layanan tertentu, titik pesan ulang, dan berapa hari persediaan bertahan di gudang.',
  story: `
    <p><strong>Studi kasus: Pusat distribusi minyak goreng di Cikarang.</strong> Rata-rata 100 karton keluar per hari ke toko-toko, tetapi angka hariannya tidak pernah persis sama. Simpangan bakunya sekitar 20 karton per hari. Pabrik pemasok butuh 9 hari untuk mengirim.</p>
    <p>Jika gudang memesan tepat saat sisa stok cukup untuk 9 hari rata-rata, separuh siklus akan kehabisan barang karena permintaan sering di atas rata-rata. <strong>Stok pengaman</strong> (safety stock) menutup lonjakan itu. Makin tinggi tingkat layanan yang dijanjikan (peluang tidak kehabisan stok), makin besar faktor Z dan makin banyak stok pengaman.</p>
    <p>Ketidakpastian selama lead time tumbuh sebanding dengan √L, bukan L. Memperpendek lead time adalah cara ampuh mengurangi stok pengaman.</p>`,
  concept: 'SS = Z · σ<sub>d</sub> · √L &nbsp;·&nbsp; ROP = d · L + SS &nbsp;·&nbsp; Ī = Q/2 + SS &nbsp;·&nbsp; DOI = Ī / d',
  conceptNote: 'Nilai Z dari tabel normal baku: layanan 90% → 1,28; 95% → 1,65; 99% → 2,33. Rumus menganggap lead time tetap dan permintaan harian saling bebas.',
  equations: [
    {
      f: 'SS = Z · σ<sub>d</sub> · √L', meaning: 'Stok pengaman: cadangan untuk menutup permintaan di atas rata-rata selama menunggu kiriman.',
      symbols: [['SS', 'Stok pengaman', 'unit'], ['Z', 'Faktor tingkat layanan (90% → 1,28; 95% → 1,65; 99% → 2,33)', '-'], ['σ<sub>d</sub>', 'Simpangan baku permintaan harian', 'unit/hari'], ['L', 'Lead time', 'hari']],
    },
    {
      f: 'ROP = d · L + SS', meaning: 'Titik pesan ulang: kebutuhan rata-rata selama lead time ditambah stok pengaman.',
      symbols: [['ROP', 'Titik pemesanan ulang', 'unit'], ['d', 'Rata-rata permintaan harian', 'unit/hari']],
    },
    {
      f: 'Ī = Q/2 + SS &nbsp;·&nbsp; DOI = Ī / d', meaning: 'Rata-rata persediaan di gudang dan berapa hari persediaan itu cukup untuk melayani permintaan (days of inventory).',
      symbols: [['Ī', 'Rata-rata persediaan', 'unit'], ['Q', 'Jumlah sekali pesan', 'unit'], ['DOI', 'Hari persediaan', 'hari']],
    },
  ],
  params: [
    { key: 'd', label: 'Permintaan rata-rata d', min: 10, max: 500, step: 1, value: 100, unit: 'unit/hari' },
    { key: 'sigma', label: 'Simpangan baku σ<sub>d</sub>', min: 0, max: 200, step: 1, value: 20, unit: 'unit/hari' },
    { key: 'L', label: 'Lead time L', min: 1, max: 30, step: 1, value: 9, unit: 'hari' },
    { key: 'Z', label: 'Faktor layanan Z', min: 0, max: 3, step: 0.01, value: 1.65, unit: '' },
    { key: 'Q', label: 'Jumlah sekali pesan Q', min: 50, max: 5000, step: 10, value: 1000, unit: 'unit' },
  ],
  compute(p) {
    return [
      { label: 'Stok pengaman SS', value: ss(p), unit: 'unit', digits: 1, main: true },
      { label: 'Titik pesan ulang ROP', value: rop(p), unit: 'unit', digits: 1 },
      { label: 'Rata-rata persediaan Ī', value: avgInv(p), unit: 'unit', digits: 1 },
      { label: 'Hari persediaan DOI', value: doi(p), unit: 'hari', digits: 2 },
    ];
  },
  view: { camera: [11, 8, 13], target: [0, 1.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc4cad0 });
    // tumpukan kardus: bagian bawah merah = stok pengaman, bagian atas cokelat = stok siklus yang naik-turun
    const box = new THREE.BoxGeometry(0.8, 0.6, 0.8);
    const cyc = new THREE.InstancedMesh(box, mat(0xc69c6d), 200);
    const safe = new THREE.InstancedMesh(box, mat(0xe07a5f), 100);
    scene.add(cyc, safe);
    scene.add(mesh(new THREE.BoxGeometry(9, 0.1, 5), mat(0x5c6b7a, { metalness: 0.6 }), { y: 0.02 }));
    const line = mesh(new THREE.BoxGeometry(9.4, 0.04, 5.4), new THREE.MeshStandardMaterial({ color: 0xffd36b, emissive: 0xffd36b, emissiveIntensity: 0.8, transparent: true, opacity: 0.5 }));
    scene.add(line);
    const truck = new THREE.Group();
    truck.add(mesh(new THREE.BoxGeometry(3, 1.6, 1.6), mat(0x2f6fae), { y: 1.1 }));
    truck.add(mesh(new THREE.BoxGeometry(1, 1.2, 1.5), mat(0xdfe6ee), { x: 2, y: 0.9 }));
    scene.add(truck);
    const tag = label('', { size: 0.55 });
    tag.position.set(0, 6, 0);
    scene.add(tag);
    const d = new THREE.Object3D();
    const slot = (m, i, s) => {
      const col = s % 10, row = Math.floor(s / 10) % 5, lvl = Math.floor(s / 50);
      d.position.set(-4 + col * 0.9, 0.38 + lvl * 0.62, -2 + row * 0.95);
      d.updateMatrix(); m.setMatrixAt(i, d.matrix);
    };
    const hide = (m, i) => { d.position.set(0, -50, 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); };
    return {
      update(p, t) {
        const S = ss(p), per = Math.max(p.Q + S, 1) / 280;
        const cycle = p.Q / p.d, day = (t * 6) % cycle;
        const stock = p.Q - p.d * day;
        const nS = Math.min(100, Math.round(S / per)), nC = Math.min(200, Math.max(0, Math.round(stock / per)));
        for (let i = 0; i < 100; i++) (i < nS ? slot(safe, i, i) : hide(safe, i));
        for (let i = 0; i < 200; i++) (i < nC && nS + i < 300 ? slot(cyc, i, nS + i) : hide(cyc, i));
        cyc.instanceMatrix.needsUpdate = safe.instanceMatrix.needsUpdate = true;
        const ropUnits = rop(p) - S; // stok siklus saat titik pesan ulang
        line.position.y = 0.08 + Math.floor((nS + Math.max(0, ropUnits) / per) / 50) * 0.62;
        const until = cycle - day, k = until < p.L ? 1 - until / p.L : 0;
        truck.position.set(-14 + k * 9, 0, 5);
        tag.setText(`SS ${Math.round(S).toLocaleString('id-ID')} · ROP ${Math.round(rop(p)).toLocaleString('id-ID')} · ${doi(p).toFixed(1).replace('.', ',')} hari`);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Pusat distribusi Cikarang: d = 100 karton/hari, σd = 20 karton/hari, lead time 9 hari, target layanan 95% (Z = 1,65). Berapa stok pengamannya?',
      preset: { d: 100, sigma: 20, L: 9, Z: 1.65, Q: 1000 }, answer: 1.65 * 20 * Math.sqrt(9), tolerance: 0.01, unit: 'karton',
      explain: 'SS = Z · σd · √L = 1,65 × 20 × √9 = 1,65 × 20 × 3 = 99 karton.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Masih dengan data Cikarang (d = 100, σd = 20, L = 9, Z = 1,65), pada sisa stok berapa karton gudang harus memesan lagi?',
      preset: { d: 100, sigma: 20, L: 9, Z: 1.65, Q: 1000 }, answer: 100 * 9 + 1.65 * 20 * Math.sqrt(9), tolerance: 0.01, unit: 'karton',
      explain: 'ROP = d · L + SS = 100 × 9 + 99 = 999 karton.',
    },
    {
      stem: 'S', type: 'num', kind: 'Konsep',
      prompt: 'Ketidakpastian tumbuh sebanding √L. Pemasok bahan kimia: σd = 30 kg/hari, lead time 16 hari, layanan 99% (Z = 2,33), d = 120 kg/hari. Berapa stok pengamannya?',
      preset: { d: 120, sigma: 30, L: 16, Z: 2.33, Q: 2000 }, answer: 2.33 * 30 * Math.sqrt(16), tolerance: 0.01, unit: 'kg',
      explain: 'SS = 2,33 × 30 × √16 = 2,33 × 30 × 4 = 279,6 kg. Lead time 4 kali lebih panjang dari 4 hari hanya menggandakan SS (√16/√4 = 2).',
    },
    {
      stem: 'T', type: 'num', kind: 'Teknologi',
      prompt: 'Toko suku cadang memakai Vendor Managed Inventory (VMI): pemasok memantau stok secara real-time sehingga lead time turun dari 16 menjadi 4 hari. d = 50 unit/hari, σd = 15 unit/hari, Z = 1,65. Berapa ROP baru?',
      preset: { d: 50, sigma: 15, L: 4, Z: 1.65, Q: 500 }, answer: 50 * 4 + 1.65 * 15 * Math.sqrt(4), tolerance: 0.01, unit: 'unit',
      explain: 'SS = 1,65 × 15 × √4 = 49,5 unit. ROP = 50 × 4 + 49,5 = 249,5 unit. Dengan L = 16 hari, ROP = 800 + 99 = 899 unit.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Gudang Cikarang memesan Q = 1.000 karton sekali pesan dengan SS = 99 karton (d = 100, σd = 20, L = 9, Z = 1,65). Berapa rata-rata persediaan di gudang?',
      preset: { d: 100, sigma: 20, L: 9, Z: 1.65, Q: 1000 }, answer: 1000 / 2 + 1.65 * 20 * Math.sqrt(9), tolerance: 0.01, unit: 'karton',
      explain: 'Ī = Q/2 + SS = 1.000/2 + 99 = 599 karton.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Gudang e-commerce: d = 200 paket/hari, σd = 40, lead time 4 hari, layanan 90% (Z = 1,28), Q = 1.200 paket. Berapa hari persediaan (DOI) rata-rata di gudang?',
      preset: { d: 200, sigma: 40, L: 4, Z: 1.28, Q: 1200 }, answer: (1200 / 2 + 1.28 * 40 * Math.sqrt(4)) / 200, tolerance: 0.01, unit: 'hari',
      explain: 'SS = 1,28 × 40 × 2 = 102,4. Ī = 600 + 102,4 = 702,4 paket. DOI = Ī / d = 702,4 / 200 ≈ 3,51 hari.',
    },
  ],
};
