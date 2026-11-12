import { mat, mesh, ground, label } from '../lib/helpers.js';

const pdb = (p) => p.C + p.I + p.G + (p.X - p.M);
const growth = (p) => ((pdb(p) - p.prev) / p.prev) * 100;
const infl = (p) => ((p.ihk1 - p.ihk0) / p.ihk0) * 100;
const mult = (p) => 1 / (1 - p.mpc);
const pct = (v) => `${v.toFixed(2).replace('.', ',')}%`;

export default {
  id: 'pdb-inflasi',
  subject: 'ekonomi',
  title: 'Ekonomi Makro: PDB, Inflasi & Multiplier',
  tags: ['ekonomi'],
  summary: 'Hitung PDB Indonesia dengan pendekatan pengeluaran, pertumbuhan ekonomi, inflasi dari IHK, dan efek berlipat (multiplier) belanja pemerintah.',
  story: `
    <p><strong>Studi kasus: Membaca rilis BPS.</strong> Setiap triwulan BPS mengumumkan Produk Domestik Bruto (PDB): nilai semua barang dan jasa akhir yang diproduksi di Indonesia. Dengan pendekatan pengeluaran, PDB adalah jumlah konsumsi rumah tangga (C), investasi (I), belanja pemerintah (G), dan ekspor bersih (X − M).</p>
    <p>Angka di simulasi adalah data ilustrasi dalam triliun rupiah per tahun yang mendekati ukuran ekonomi Indonesia. Konsumsi rumah tangga menyumbang lebih dari separuh PDB, jadi daya beli masyarakat sangat menentukan pertumbuhan.</p>
    <p>Harga yang naik diukur dengan Indeks Harga Konsumen (IHK). Jika pemerintah menambah belanja, misalnya membangun jalan, pendapatan pekerja ikut dibelanjakan lagi sehingga PDB naik berlipat: inilah <em>multiplier</em>, yang besarnya bergantung pada kecenderungan mengonsumsi (MPC).</p>`,
  concept: 'PDB = C + I + G + (X − M) &nbsp;·&nbsp; Inflasi = (IHK<sub>t</sub> − IHK<sub>t−1</sub>)/IHK<sub>t−1</sub> &nbsp;·&nbsp; k = 1/(1 − MPC)',
  conceptNote: 'Angka PDB di sini ilustrasi dan dibulatkan. Pertumbuhan riil yang diumumkan BPS dihitung dari PDB harga konstan; di sini didekati dengan pertumbuhan nominal dikurangi inflasi.',
  equations: [
    { f: 'PDB = C + I + G + (X − M)', meaning: 'Semua pengeluaran untuk barang dan jasa buatan dalam negeri dijumlahkan. Impor dikurangi karena diproduksi di luar negeri.', symbols: [['C', 'Konsumsi rumah tangga', 'triliun Rp'], ['I', 'Investasi (pembentukan modal tetap)', 'triliun Rp'], ['G', 'Belanja pemerintah', 'triliun Rp'], ['X', 'Ekspor', 'triliun Rp'], ['M', 'Impor', 'triliun Rp']] },
    { f: 'g = (PDB<sub>t</sub> − PDB<sub>t−1</sub>) / PDB<sub>t−1</sub> × 100%', meaning: 'Pertumbuhan ekonomi: persen kenaikan PDB dibanding tahun sebelumnya.', symbols: [['g', 'Pertumbuhan ekonomi', '%']] },
    { f: 'Inflasi = (IHK<sub>t</sub> − IHK<sub>t−1</sub>) / IHK<sub>t−1</sub> × 100%', meaning: 'Persen kenaikan harga rata-rata sekeranjang barang dan jasa yang dibeli rumah tangga.', symbols: [['IHK', 'Indeks Harga Konsumen', 'indeks']] },
    { f: 'g<sub>riil</sub> ≈ g<sub>nominal</sub> − inflasi', meaning: 'Pertumbuhan yang benar-benar berasal dari bertambahnya barang dan jasa, bukan dari kenaikan harga.', symbols: [['g<sub>riil</sub>', 'Pertumbuhan riil (perkiraan)', '%']] },
    { f: 'k = 1 / (1 − MPC) &nbsp;·&nbsp; ΔPDB = k · ΔA', meaning: 'Setiap tambahan pengeluaran otonom (belanja pemerintah, investasi, atau ekspor) dibelanjakan ulang berkali-kali sehingga PDB naik k kali lipat.', symbols: [['MPC', 'Bagian tambahan pendapatan yang dibelanjakan (0–1)', 'tanpa satuan'], ['k', 'Angka pengganda (multiplier)', 'kali'], ['ΔA', 'Perubahan pengeluaran otonom (ΔG, ΔI, atau ΔX)', 'triliun Rp']] },
  ],
  params: [
    { key: 'C', label: 'Konsumsi rumah tangga C', min: 5000, max: 15000, step: 100, value: 11500, unit: 'T Rp' },
    { key: 'I', label: 'Investasi I', min: 2000, max: 10000, step: 100, value: 6600, unit: 'T Rp' },
    { key: 'G', label: 'Belanja pemerintah G', min: 500, max: 4000, step: 100, value: 1600, unit: 'T Rp' },
    { key: 'X', label: 'Ekspor X', min: 1000, max: 8000, step: 100, value: 4600, unit: 'T Rp' },
    { key: 'M', label: 'Impor M', min: 1000, max: 8000, step: 100, value: 4000, unit: 'T Rp' },
    { key: 'prev', label: 'PDB tahun lalu', min: 10000, max: 30000, step: 100, value: 19300, unit: 'T Rp' },
    { key: 'ihk0', label: 'IHK tahun lalu', min: 90, max: 150, step: 0.5, value: 115, unit: '' },
    { key: 'ihk1', label: 'IHK tahun ini', min: 90, max: 160, step: 0.5, value: 118, unit: '' },
    { key: 'mpc', label: 'MPC', min: 0.5, max: 0.95, step: 0.05, value: 0.75, unit: '' },
    { key: 'dG', label: 'Tambahan belanja ΔG', min: 0, max: 500, step: 10, value: 100, unit: 'T Rp' },
  ],
  compute(p) {
    return [
      { label: 'PDB', value: pdb(p), unit: 'triliun Rp', digits: 0, main: true },
      { label: 'Pertumbuhan nominal', value: growth(p), unit: '%', digits: 2 },
      { label: 'Inflasi', value: infl(p), unit: '%', digits: 2 },
      { label: 'Pertumbuhan riil (≈)', value: growth(p) - infl(p), unit: '%', digits: 2 },
      { label: 'Multiplier k', value: mult(p), unit: 'kali', digits: 2 },
      { label: 'Tambahan PDB dari ΔG', value: mult(p) * p.dG, unit: 'triliun Rp', digits: 0 },
    ];
  },
  view: { camera: [0, 7, 15], target: [0, 3, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc3c9c0 });
    const cols = [
      { k: 'C', name: 'C', color: 0x5fd6c4 }, { k: 'I', name: 'I', color: 0x93b6ff }, { k: 'G', name: 'G', color: 0xffd36b },
      { k: 'X', name: 'X', color: 0x9ade8b }, { k: 'M', name: 'M', color: 0xff8f8f },
    ];
    const S = 1 / 2000; // satuan tinggi per triliun
    const bars = cols.map((c, i) => {
      const m = mesh(new THREE.BoxGeometry(1.2, 1, 1.2), mat(c.color, { emissive: c.color, emissiveIntensity: 0.15 }), { x: -6 + i * 2 });
      const tg = label(c.name, { size: 0.45 });
      scene.add(m, tg);
      return { ...c, m, tg };
    });
    const total = mesh(new THREE.BoxGeometry(1.8, 1, 1.8), mat(0xc6a8ff, { emissive: 0xc6a8ff, emissiveIntensity: 0.2 }), { x: 5.5 });
    const boost = mesh(new THREE.BoxGeometry(1.8, 1, 1.8), mat(0xffffff, { transparent: true, opacity: 0.35 }), { x: 5.5 });
    const tT = label('', { size: 0.5 }), tInfo = label('', { size: 0.45 });
    scene.add(total, boost, tT, tInfo);
    tInfo.position.set(0, 0.6, 3);
    // koin berputar: lingkaran belanja ulang (multiplier)
    const coins = Array.from({ length: 12 }, () => { const c = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 20), mat(0xe8c15a, { metalness: 0.8, roughness: 0.3 })); c.rotation.x = Math.PI / 2; scene.add(c); return c; });
    return {
      update(p, t) {
        bars.forEach((b) => {
          const h = Math.max(0.05, p[b.k] * S);
          b.m.scale.y = h; b.m.position.y = h / 2;
          b.tg.setText(`${b.name} ${p[b.k].toLocaleString('id-ID')}`);
          b.tg.position.set(b.m.position.x, h + 0.5, 0);
        });
        const h = pdb(p) * S, hb = mult(p) * p.dG * S;
        total.scale.y = Math.max(0.05, h); total.position.y = h / 2;
        boost.scale.y = Math.max(0.01, hb); boost.position.y = h + hb / 2;
        tT.setText(`PDB ${Math.round(pdb(p)).toLocaleString('id-ID')} T`);
        tT.position.set(5.5, h + hb + 0.6, 0);
        tInfo.setText(`Tumbuh ${pct(growth(p))} · inflasi ${pct(infl(p))} · k = ${mult(p).toFixed(1).replace('.', ',')}`);
        const r = 1.2 + 0.25 * mult(p);
        coins.forEach((c, i) => {
          const a = t * (0.6 + p.mpc) + (i / coins.length) * Math.PI * 2;
          c.position.set(Math.cos(a) * r * 0.6 - 0.5, 0.4 + 0.15 * Math.sin(a * 2), 2.5 + Math.sin(a) * 0.6);
        });
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Konsumsi rumah tangga Rp 11.500 T, investasi Rp 6.600 T, belanja pemerintah Rp 1.600 T, ekspor Rp 4.600 T, dan impor Rp 4.000 T. Berapa triliun rupiah PDB-nya?',
      preset: { C: 11500, I: 6600, G: 1600, X: 4600, M: 4000 }, answer: 11500 + 6600 + 1600 + 4600 - 4000, tolerance: 0.001, unit: 'triliun Rp',
      explain: 'PDB = 11.500 + 6.600 + 1.600 + (4.600 − 4.000) = 20.300 triliun rupiah.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'PDB tahun lalu Rp 19.300 T dan tahun ini Rp 20.300 T. Berapa persen pertumbuhan nominalnya?',
      preset: { prev: 19300, C: 11500, I: 6600, G: 1600, X: 4600, M: 4000 }, answer: (1000 / 19300) * 100, tolerance: 0.01, unit: '%',
      explain: 'g = (20.300 − 19.300)/19.300 × 100% = 1.000/19.300 × 100% ≈ 5,18%.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'IHK naik dari 115 menjadi 118. Berapa persen inflasinya?',
      preset: { ihk0: 115, ihk1: 118 }, answer: (3 / 115) * 100, tolerance: 0.01, unit: '%',
      explain: 'Inflasi = (118 − 115)/115 × 100% = 3/115 × 100% ≈ 2,61%.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Dengan pertumbuhan nominal 5,18% dan inflasi 2,61%, berapa perkiraan pertumbuhan riilnya?',
      preset: { prev: 19300, C: 11500, I: 6600, G: 1600, X: 4600, M: 4000, ihk0: 115, ihk1: 118 }, answer: (1000 / 19300) * 100 - (3 / 115) * 100, tolerance: 0.02, unit: '%',
      explain: 'g riil ≈ 5,18% − 2,61% ≈ 2,57%. Sebagian besar kenaikan PDB nominal hanya karena harga naik.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'MPC masyarakat 0,8. Pemerintah menambah belanja infrastruktur Rp 50 T. Berapa triliun tambahan PDB menurut multiplier sederhana?',
      preset: { mpc: 0.8, dG: 50 }, answer: 50 / (1 - 0.8), tolerance: 0.01, unit: 'triliun Rp',
      explain: 'k = 1/(1 − 0,8) = 5. ΔPDB = 5 × 50 = 250 triliun rupiah.',
    },
    {
      stem: 'E', type: 'num', kind: 'Engineering',
      prompt: 'Harga batu bara dunia turun sehingga ekspor Indonesia berkurang Rp 200 T. Jika MPC = 0,75, berapa triliun PDB turun?',
      preset: { mpc: 0.75 }, answer: 200 / (1 - 0.75), tolerance: 0.01, unit: 'triliun Rp',
      explain: 'Ekspor termasuk pengeluaran otonom: ΔPDB = k · ΔX = 4 × (−200) = −800 triliun. Inilah alasan ekonomi perlu diversifikasi ekspor.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa impor (M) dikurangkan dalam rumus PDB = C + I + G + (X − M)?',
      options: ['Karena impor selalu merugikan', 'Karena C, I, dan G sudah memuat belanja barang impor, padahal barang itu diproduksi di luar negeri sehingga bukan produksi domestik', 'Karena impor dikenai pajak', 'Agar PDB terlihat lebih kecil'], answer: 1,
      explain: 'PDB mengukur produksi dalam negeri. Pengeluaran untuk ponsel impor tercatat di C, jadi harus dikeluarkan lagi lewat M agar tidak terhitung sebagai produksi Indonesia.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Bank Indonesia dan BPS kini memakai data harga dari situs belanja daring dan transaksi QRIS untuk "nowcasting". Apa manfaatnya?',
      options: ['Menggantikan semua survei', 'Memberi gambaran inflasi dan konsumsi lebih cepat (mingguan/harian) sebelum data resmi bulanan atau triwulanan dirilis', 'Menaikkan PDB', 'Menghapus inflasi'], answer: 1,
      explain: 'Data digital frekuensi tinggi membantu pembuat kebijakan bereaksi lebih awal, walaupun tetap perlu dicocokkan dengan survei resmi agar tidak bias.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Kebijakan',
      prompt: 'Inflasi naik ke 6% karena permintaan terlalu kuat. Kebijakan moneter apa yang paling sesuai?',
      options: ['Bank Indonesia menurunkan suku bunga acuan', 'Bank Indonesia menaikkan suku bunga acuan agar kredit dan konsumsi melambat', 'Pemerintah menambah belanja besar-besaran', 'Mencetak uang baru'], answer: 1,
      explain: 'Bunga lebih tinggi membuat pinjaman lebih mahal dan menabung lebih menarik, sehingga permintaan (C dan I) melambat dan tekanan harga berkurang.',
    },
  ],
};
