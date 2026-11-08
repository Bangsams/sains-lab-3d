import { mat, mesh, ground, label } from '../lib/helpers.js';

const eoq = (p) => Math.sqrt((2 * p.D * p.S) / p.H);
const daily = (p) => p.D / 365;
const rop = (p) => daily(p) * p.L + p.ss;
const totalCost = (p, q = eoq(p)) => (p.D / q) * p.S + (q / 2) * p.H;

export default {
  id: 'rantai-pasok',
  subject: 'industri',
  title: 'Rantai Pasok & Persediaan (EOQ)',
  tags: ['industri'],
  summary: 'Berapa banyak bahan dipesan sekali jalan dan kapan memesan lagi agar gudang tidak kosong maupun menumpuk.',
  story: `
    <p><strong>Studi kasus: Gudang pabrik minuman di Bekasi.</strong> Pabrik memakai 12.000 galon botol plastik per tahun. Setiap kali memesan ke pemasok, ada biaya administrasi dan truk sekitar Rp 500 ribu. Menyimpan satu botol di gudang selama setahun (sewa ruang, modal tertahan, risiko rusak) menghabiskan Rp 6.000.</p>
    <p>Jika memesan terlalu sering, biaya pesan membengkak. Jika memesan sekaligus banyak, gudang penuh dan biaya simpan naik. <em>Economic Order Quantity</em> (EOQ) mencari titik tengah yang total biayanya paling kecil.</p>
    <p>Pemasok butuh 5 hari untuk mengirim (lead time). Agar produksi tidak berhenti, pabrik memesan lagi saat stok mencapai <em>reorder point</em>, ditambah stok pengaman (safety stock) untuk berjaga-jaga jika permintaan melonjak.</p>`,
  concept: 'Q* = √(2 · D · S / H) &nbsp;·&nbsp; ROP = d · L + SS &nbsp;·&nbsp; TC = (D/Q)·S + (Q/2)·H',
  conceptNote: 'Model EOQ menganggap permintaan stabil sepanjang tahun. Di dunia nyata, permintaan berfluktuasi sehingga safety stock dihitung dari simpangan baku permintaan selama lead time.',
  equations: [
    {
      f: 'Q* = √(2 · D · S / H)', meaning: 'Jumlah pesanan paling hemat: saat biaya pesan setahun sama besar dengan biaya simpan setahun.',
      symbols: [['Q*', 'Jumlah pesanan ekonomis sekali pesan', 'unit'], ['D', 'Permintaan per tahun', 'unit/tahun'], ['S', 'Biaya sekali memesan', 'Rp'], ['H', 'Biaya menyimpan satu unit selama setahun', 'Rp/unit/tahun']],
    },
    {
      f: 'ROP = d · L + SS', meaning: 'Pesan lagi saat sisa stok cukup untuk menutup kebutuhan selama menunggu kiriman, ditambah cadangan.',
      symbols: [['ROP', 'Titik pemesanan ulang', 'unit'], ['d', 'Pemakaian per hari = D / 365', 'unit/hari'], ['L', 'Lead time pengiriman', 'hari'], ['SS', 'Stok pengaman', 'unit']],
    },
    {
      f: 'TC = (D/Q)·S + (Q/2)·H', meaning: 'Biaya total persediaan setahun = banyaknya pesanan × biaya pesan + rata-rata stok × biaya simpan.',
      symbols: [['TC', 'Biaya persediaan total setahun', 'Rp'], ['D/Q', 'Banyaknya pesanan per tahun', 'kali'], ['Q/2', 'Rata-rata stok di gudang', 'unit']],
    },
  ],
  params: [
    { key: 'D', label: 'Permintaan per tahun', min: 1000, max: 50000, step: 100, value: 12000, unit: 'unit' },
    { key: 'S', label: 'Biaya sekali pesan', min: 50000, max: 2000000, step: 10000, value: 500000, unit: 'Rp' },
    { key: 'H', label: 'Biaya simpan', min: 500, max: 20000, step: 100, value: 6000, unit: 'Rp/unit/th' },
    { key: 'L', label: 'Lead time', min: 1, max: 30, step: 1, value: 5, unit: 'hari' },
    { key: 'ss', label: 'Stok pengaman', min: 0, max: 2000, step: 10, value: 200, unit: 'unit' },
  ],
  compute(p) {
    const q = eoq(p), n = p.D / q;
    return [
      { label: 'Jumlah pesanan ekonomis (EOQ)', value: q, unit: 'unit', digits: 0, main: true },
      { label: 'Pesanan per tahun', value: n, unit: 'kali', digits: 1 },
      { label: 'Jarak antar pesanan', value: 365 / n, unit: 'hari', digits: 1 },
      { label: 'Reorder point', value: rop(p), unit: 'unit', digits: 0 },
      { label: 'Biaya persediaan total', value: totalCost(p), unit: 'Rp/tahun', digits: 0 },
    ];
  },
  view: { camera: [12, 9, 14], target: [0, 1.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xbfc6cc });
    // gudang: rak dengan tumpukan kardus yang naik-turun mengikuti pola gigi gergaji persediaan
    const box = new THREE.BoxGeometry(0.8, 0.6, 0.8);
    const boxMat = mat(0xc69c6d), ssMat = mat(0xe07a5f);
    const boxes = new THREE.InstancedMesh(box, boxMat, 240);
    const safety = new THREE.InstancedMesh(box, ssMat, 60);
    scene.add(boxes, safety);
    const d = new THREE.Object3D();
    const rack = mat(0x5c6b7a, { metalness: 0.6 });
    for (let r = 0; r < 4; r++) scene.add(mesh(new THREE.BoxGeometry(9, 0.1, 1.2), rack, { x: 0, y: 0.02, z: -3 + r * 2 }));
    const truck = new THREE.Group();
    truck.add(mesh(new THREE.BoxGeometry(3, 1.6, 1.6), mat(0x2f6fae), { y: 1.1 }));
    truck.add(mesh(new THREE.BoxGeometry(1, 1.2, 1.5), mat(0xdfe6ee), { x: 2, y: 0.9 }));
    [-1, 1.8].forEach((x) => [-0.8, 0.8].forEach((z) => {
      const w = mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16), mat(0x222222), { x, y: 0.35, z });
      w.rotation.x = Math.PI / 2; truck.add(w);
    }));
    scene.add(truck);
    const tag = label('', { size: 0.6 });
    tag.position.set(0, 5.2, 0);
    scene.add(tag);
    const place = (mesh, i, slot) => {
      const lane = slot % 4, col = Math.floor(slot / 4) % 10, lvl = Math.floor(slot / 40);
      d.position.set(-4 + col * 0.9, 0.38 + lvl * 0.62, -3 + lane * 2);
      d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
    };
    return {
      update(p, t) {
        const q = eoq(p), cycle = 365 / (p.D / q);
        const day = (t * 12) % cycle; // 1 detik ≈ 12 hari
        const stock = q - daily(p) * day; // persediaan siklus (di atas stok pengaman)
        const per = Math.max(q, p.ss) / 200; // satu kardus mewakili beberapa unit
        const nSS = Math.min(60, Math.round(p.ss / per));
        const nC = Math.min(240 - 0, Math.max(0, Math.round(stock / per)));
        for (let i = 0; i < 60; i++) { if (i < nSS) place(safety, i, i); else { d.position.set(0, -50, 0); d.updateMatrix(); safety.setMatrixAt(i, d.matrix); } }
        for (let i = 0; i < 240; i++) { if (i < nC && nSS + i < 240) place(boxes, i, nSS + i); else { d.position.set(0, -50, 0); d.updateMatrix(); boxes.setMatrixAt(i, d.matrix); } }
        boxes.instanceMatrix.needsUpdate = safety.instanceMatrix.needsUpdate = true;
        // truk datang selama lead time sebelum stok habis
        const until = cycle - day, lead = Math.min(p.L, cycle);
        const k = until < lead ? 1 - until / lead : 0;
        truck.position.set(-12 + k * 8, 0, 6);
        tag.setText(`Stok ${Math.round(stock + p.ss).toLocaleString('id-ID')} unit · ROP ${Math.round(rop(p)).toLocaleString('id-ID')}`);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Permintaan botol 12.000 unit/tahun, biaya sekali pesan Rp 500.000, biaya simpan Rp 6.000/unit/tahun. Berapa EOQ-nya?',
      preset: { D: 12000, S: 500000, H: 6000 }, answer: 1414, tolerance: 0.01, unit: 'unit',
      explain: 'Q* = √(2 × 12.000 × 500.000 / 6.000) = √2.000.000 ≈ 1.414 unit per pesanan.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Sebuah pabrik roti memakai 7.300 sak tepung per tahun (365 hari). Lead time pemasok 10 hari dan stok pengaman 100 sak. Pada sisa stok berapa sak pabrik harus memesan lagi?',
      preset: { D: 7300, L: 10, ss: 100 }, answer: 300, tolerance: 0.01, unit: 'sak',
      explain: 'd = 7.300 / 365 = 20 sak/hari. ROP = 20 × 10 + 100 = 300 sak.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Dengan data gudang Bekasi (D = 12.000, S = Rp 500.000, H = Rp 6.000) dan memesan sebanyak EOQ, berapa biaya persediaan total per tahun?',
      preset: { D: 12000, S: 500000, H: 6000 }, answer: 8485281, tolerance: 0.01, unit: 'Rp',
      explain: 'Di titik EOQ, biaya pesan = biaya simpan = 1.414,2/2 × 6.000 ≈ Rp 4.242.641. Totalnya ≈ Rp 8.485.281 per tahun.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Penjualan minuman di toko hanya naik 5%, tetapi pesanan pabrik ke pemasok botol melonjak 40%. Fenomena apa ini?',
      options: ['Efek cambuk (bullwhip effect): variasi permintaan membesar semakin ke hulu rantai pasok', 'Skala ekonomi', 'Hukum permintaan dan penawaran', 'Inflasi'], answer: 0,
      explain: 'Setiap mata rantai (toko, distributor, pabrik) menambah cadangan dan memesan dalam jumlah besar berdasarkan ramalan masing-masing, sehingga fluktuasi kecil di hilir menjadi besar di hulu. Berbagi data penjualan secara real time meredamnya.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Teknologi apa yang paling membantu gudang mengetahui jumlah stok secara akurat dan real time?',
      options: ['Pencatatan di buku tulis setiap akhir bulan', 'Barcode/RFID yang terhubung ke Warehouse Management System (WMS)', 'Menghitung ulang manual setiap tahun', 'Kamera CCTV'], answer: 1,
      explain: 'Setiap barang yang masuk/keluar dipindai sehingga WMS dapat memperbarui stok, memicu pesanan otomatis saat mencapai ROP, dan mengurangi selisih stok.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Sewa gudang naik sehingga biaya simpan H menjadi dua kali lipat. Bagaimana EOQ berubah?',
      preset: { H: 12000 },
      options: ['Menjadi dua kali', 'Menjadi setengahnya', 'Menjadi sekitar 0,71 kali (1/√2): pesan lebih sedikit tetapi lebih sering', 'Tidak berubah'], answer: 2,
      explain: 'Q* ∝ 1/√H. Jika H dikali 2, Q* dikali 1/√2 ≈ 0,707. Coba geser slider biaya simpan ke 12.000 dan bandingkan.',
    },
  ],
};
