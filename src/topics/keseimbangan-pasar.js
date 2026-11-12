import { mat, mesh, ground, label } from '../lib/helpers.js';

// Harga P dalam ribu Rp/kg, jumlah Q dalam ton/hari. Qd = a − b·P, Qs = c + d·P.
const peq = (p) => (p.a - p.c) / (p.b + p.d);
const qeq = (p) => p.a - p.b * peq(p);
const qd = (p, P) => Math.max(0, p.a - p.b * P);
const qs = (p, P) => Math.max(0, p.c + p.d * P);
const elastic = (p) => (p.b * peq(p)) / qeq(p);
const cs = (p) => 0.5 * qeq(p) * (p.a / p.b - peq(p));        // juta Rp/hari (ton × ribu Rp/kg = juta Rp)
const shortage = (p) => (p.het < peq(p) ? qd(p, p.het) - qs(p, p.het) : 0);

export default {
  id: 'keseimbangan-pasar',
  subject: 'ekonomi',
  title: 'Ekonomi Mikro: Permintaan, Penawaran & Harga',
  tags: ['sehari-hari', 'ekonomi'],
  summary: 'Mengapa harga cabai melonjak saat musim hujan? Temukan harga keseimbangan, elastisitas, surplus konsumen, dan dampak harga eceran tertinggi (HET).',
  story: `
    <p><strong>Studi kasus: Pasar cabai rawit di Pasar Induk Kramat Jati, Jakarta.</strong> Setiap hari pedagang dan pembeli "bertemu" di harga tertentu. Pembeli (rumah makan, rumah tangga) membeli lebih sedikit jika harga naik: inilah <em>permintaan</em>. Petani dan pemasok mau mengirim lebih banyak jika harga naik: inilah <em>penawaran</em>.</p>
    <p>Data pengamatan disederhanakan menjadi garis lurus: <strong>Qd = 200 − 2P</strong> dan <strong>Qs = −40 + 4P</strong> (P dalam ribu Rp/kg, Q dalam ton/hari). Harga keseimbangan terjadi saat jumlah yang diminta sama dengan jumlah yang ditawarkan.</p>
    <p>Saat musim hujan, panen terganggu dan kurva penawaran bergeser (nilai c turun). Jika pemerintah lalu menetapkan HET di bawah harga keseimbangan, pembeli ingin membeli lebih banyak daripada yang tersedia sehingga terjadi <em>kelangkaan</em>.</p>`,
  concept: 'Q<sub>d</sub> = a − b·P &nbsp;·&nbsp; Q<sub>s</sub> = c + d·P &nbsp;·&nbsp; P* = (a − c)/(b + d) &nbsp;·&nbsp; E<sub>d</sub> = b · P/Q',
  conceptNote: 'Satuan: P dalam ribu Rp/kg dan Q dalam ton/hari, sehingga 1 ton × Rp 1.000/kg = Rp 1 juta. Kurva lurus adalah penyederhanaan; data pasar sungguhan diperkirakan dengan regresi.',
  equations: [
    { f: 'Q<sub>d</sub> = a − b · P', meaning: 'Fungsi permintaan: makin mahal, makin sedikit yang dibeli.', symbols: [['Q<sub>d</sub>', 'Jumlah yang diminta', 'ton/hari'], ['P', 'Harga', 'ribu Rp/kg'], ['a', 'Permintaan saat harga 0 (titik potong)', 'ton/hari'], ['b', 'Kepekaan pembeli terhadap harga', 'ton per ribu Rp']] },
    { f: 'Q<sub>s</sub> = c + d · P', meaning: 'Fungsi penawaran: makin mahal, makin banyak yang mau dijual.', symbols: [['Q<sub>s</sub>', 'Jumlah yang ditawarkan', 'ton/hari'], ['c', 'Titik potong penawaran (negatif artinya penjual baru mau menjual di atas harga tertentu)', 'ton/hari'], ['d', 'Kepekaan penjual terhadap harga', 'ton per ribu Rp']] },
    { f: 'Q<sub>d</sub> = Q<sub>s</sub> → P* = (a − c) / (b + d) &nbsp;·&nbsp; Q* = a − b · P*', meaning: 'Keseimbangan pasar: harga saat jumlah yang ingin dibeli sama dengan jumlah yang ingin dijual.', symbols: [['P*', 'Harga keseimbangan', 'ribu Rp/kg'], ['Q*', 'Jumlah keseimbangan', 'ton/hari']] },
    { f: 'E<sub>d</sub> = b · P / Q', meaning: 'Elastisitas harga permintaan (nilai mutlak): persen perubahan jumlah dibagi persen perubahan harga. E<sub>d</sub> < 1 inelastis (kebutuhan pokok), E<sub>d</sub> > 1 elastis.', symbols: [['E<sub>d</sub>', 'Elastisitas', 'tanpa satuan']] },
    { f: 'SK = ½ · Q* · (P<sub>maks</sub> − P*) &nbsp;·&nbsp; P<sub>maks</sub> = a / b', meaning: 'Surplus konsumen: selisih antara harga tertinggi yang rela dibayar pembeli dan harga yang benar-benar dibayar, berbentuk luas segitiga di bawah kurva permintaan.', symbols: [['SK', 'Surplus konsumen', 'juta Rp/hari'], ['P<sub>maks</sub>', 'Harga saat Q<sub>d</sub> = 0', 'ribu Rp/kg']] },
    { f: 'Kelangkaan = Q<sub>d</sub>(HET) − Q<sub>s</sub>(HET), jika HET < P*', meaning: 'Harga maksimum di bawah keseimbangan membuat permintaan lebih besar daripada penawaran.', symbols: [['HET', 'Harga eceran tertinggi', 'ribu Rp/kg']] },
  ],
  params: [
    { key: 'a', label: 'a (permintaan dasar)', min: 100, max: 300, step: 5, value: 200, unit: 'ton' },
    { key: 'b', label: 'b (kepekaan pembeli)', min: 0.5, max: 5, step: 0.5, value: 2, unit: 'ton/ribu Rp' },
    { key: 'c', label: 'c (penawaran dasar)', min: -100, max: 50, step: 5, value: -40, unit: 'ton' },
    { key: 'd', label: 'd (kepekaan penjual)', min: 0.5, max: 8, step: 0.5, value: 4, unit: 'ton/ribu Rp' },
    { key: 'het', label: 'HET pemerintah', min: 10, max: 120, step: 1, value: 60, unit: 'ribu Rp/kg' },
  ],
  compute(p) {
    return [
      { label: 'Harga keseimbangan P*', value: peq(p) * 1000, unit: 'Rp/kg', digits: 0, main: true },
      { label: 'Jumlah keseimbangan Q*', value: qeq(p), unit: 'ton/hari', digits: 1 },
      { label: 'Elastisitas permintaan', value: elastic(p), unit: '', digits: 2 },
      { label: 'Surplus konsumen', value: cs(p), unit: 'juta Rp/hari', digits: 0 },
      { label: 'Kelangkaan akibat HET', value: Math.max(0, shortage(p)), unit: 'ton/hari', digits: 1 },
    ];
  },
  view: { camera: [0, 6, 14], target: [0, 3, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xbfc8b8 });
    // bidang grafik: sumbu x = Q (0–300 ton), sumbu y = P (0–150 ribu)
    const X = (q) => -5 + (q / 300) * 10, Y = (P) => 0.3 + (P / 150) * 6.5;
    scene.add(mesh(new THREE.BoxGeometry(10.6, 7.2, 0.15), mat(0x1b2433), { y: 3.6, z: -0.3 }));
    scene.add(mesh(new THREE.BoxGeometry(10.2, 0.05, 0.05), mat(0xdfe6ee), { x: 0.1, y: 0.3 }));
    scene.add(mesh(new THREE.BoxGeometry(0.05, 6.6, 0.05), mat(0xdfe6ee), { x: -5, y: 3.6 }));
    const tube = (m) => { const g = new THREE.Mesh(new THREE.BufferGeometry(), m); scene.add(g); return g; };
    const dLine = tube(mat(0x5fd6c4, { emissive: 0x5fd6c4, emissiveIntensity: 0.4 }));
    const sLine = tube(mat(0xffa36b, { emissive: 0xffa36b, emissiveIntensity: 0.4 }));
    const hetLine = tube(mat(0xff6b6b, { emissive: 0xff6b6b, emissiveIntensity: 0.5 }));
    const eq = mesh(new THREE.SphereGeometry(0.18, 20, 14), mat(0xffd36b, { emissive: 0xffd36b, emissiveIntensity: 0.8 }));
    scene.add(eq);
    const csTri = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0x5fd6c4, transparent: true, opacity: 0.25, side: THREE.DoubleSide }));
    scene.add(csTri);
    // tumpukan cabai: banyaknya mengikuti Q*
    const chili = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.06, 0.3, 4, 8), mat(0xd6312b), 160);
    scene.add(chili);
    const dmy = new THREE.Object3D();
    const tD = label('Permintaan', { size: 0.4 }), tS = label('Penawaran', { size: 0.4 }), tE = label('', { size: 0.42 });
    scene.add(tD, tS, tE);
    const setLine = (g, pts) => { g.geometry.dispose(); g.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 2, 0.05, 8); };
    let last = '';
    return {
      update(p, t) {
        const k = JSON.stringify(p);
        if (k !== last) {
          last = k;
          const pd = Math.min(150, p.a / p.b);
          setLine(dLine, [new THREE.Vector3(X(qd(p, 0)), Y(0), 0), new THREE.Vector3(X(qd(p, pd)), Y(pd), 0)]);
          const p0 = Math.max(0, -p.c / p.d);
          const pEnd = Math.min(150, (300 - p.c) / p.d);
          setLine(sLine, [new THREE.Vector3(X(qs(p, p0)), Y(p0), 0), new THREE.Vector3(X(qs(p, pEnd)), Y(pEnd), 0)]);
          setLine(hetLine, [new THREE.Vector3(X(0), Y(p.het), 0.02), new THREE.Vector3(X(300), Y(p.het), 0.02)]);
          eq.position.set(X(qeq(p)), Y(peq(p)), 0.1);
          csTri.geometry.dispose();
          csTri.geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(X(0), Y(peq(p)), 0.01), new THREE.Vector3(X(0), Y(pd), 0.01), new THREE.Vector3(X(qeq(p)), Y(peq(p)), 0.01)]);
          tD.position.set(X(qd(p, pd * 0.15)) + 0.6, Y(pd * 0.15) + 0.3, 0.3);
          tS.position.set(X(qs(p, pEnd * 0.9)) - 0.6, Y(pEnd * 0.9) + 0.2, 0.3);
          tE.setText(`P* = Rp ${Math.round(peq(p) * 1000).toLocaleString('id-ID')}/kg · Q* = ${qeq(p).toFixed(0)} ton`);
          tE.position.set(X(qeq(p)), Y(peq(p)) + 0.6, 0.4);
          const n = Math.min(160, Math.round(qeq(p) / 1.5));
          for (let i = 0; i < 160; i++) {
            if (i < n) { dmy.position.set(-4 + (i % 20) * 0.42, 0.1 + Math.floor(i / 20) * 0.12, 2 + ((i * 7) % 5) * 0.2); dmy.rotation.set(Math.PI / 2, 0, (i * 1.3) % 3); }
            else dmy.position.set(0, -50, 0);
            dmy.updateMatrix(); chili.setMatrixAt(i, dmy.matrix);
          }
          chili.instanceMatrix.needsUpdate = true;
        }
        eq.scale.setScalar(1 + 0.15 * Math.sin(t * 4));
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Dengan Qd = 200 − 2P dan Qs = −40 + 4P (P dalam ribu Rp/kg), berapa harga keseimbangan cabai dalam ribu Rp/kg?',
      preset: { a: 200, b: 2, c: -40, d: 4 }, answer: 40, tolerance: 0.001, unit: 'ribu Rp/kg',
      explain: '200 − 2P = −40 + 4P → 240 = 6P → P* = 40 (Rp 40.000/kg).',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Dari soal sebelumnya, berapa ton cabai yang diperjualbelikan per hari pada keseimbangan?',
      preset: { a: 200, b: 2, c: -40, d: 4 }, answer: 120, tolerance: 0.001, unit: 'ton/hari',
      explain: 'Q* = 200 − 2 × 40 = 120 ton/hari (cek: −40 + 4 × 40 = 120).',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Musim hujan menurunkan panen sehingga penawaran menjadi Qs = −100 + 4P (permintaan tetap Qd = 200 − 2P). Berapa harga keseimbangan baru (ribu Rp/kg)?',
      preset: { a: 200, b: 2, c: -100, d: 4 }, answer: 50, tolerance: 0.001, unit: 'ribu Rp/kg',
      explain: '200 − 2P = −100 + 4P → 300 = 6P → P* = 50. Harga naik dari Rp 40.000 ke Rp 50.000/kg dan jumlah turun ke 100 ton.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Berapa elastisitas harga permintaan di titik keseimbangan awal (P* = 40, Q* = 120, b = 2)?',
      preset: { a: 200, b: 2, c: -40, d: 4 }, answer: (2 * 40) / 120, tolerance: 0.01, unit: '',
      explain: 'Ed = b · P/Q = 2 × 40/120 ≈ 0,67 < 1, jadi permintaan cabai inelastis: kenaikan harga 1% hanya menurunkan jumlah 0,67%. Cabai adalah kebutuhan dapur.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Pada keseimbangan awal (Qd = 200 − 2P, P* = 40, Q* = 120), berapa juta rupiah surplus konsumen per hari?',
      preset: { a: 200, b: 2, c: -40, d: 4 }, answer: 0.5 * 120 * (100 - 40), tolerance: 0.01, unit: 'juta Rp',
      explain: 'P maks = a/b = 200/2 = 100. SK = ½ × 120 × (100 − 40) = 3.600 juta Rp per hari (Rp 3,6 miliar).',
    },
    {
      stem: 'E', type: 'num', kind: 'Engineering',
      prompt: 'Pada kondisi musim hujan (Qd = 200 − 2P, Qs = −100 + 4P), pemerintah menetapkan HET Rp 45.000/kg. Berapa ton kelangkaan per hari?',
      preset: { a: 200, b: 2, c: -100, d: 4, het: 45 }, answer: (200 - 2 * 45) - (-100 + 4 * 45), tolerance: 0.001, unit: 'ton/hari',
      explain: 'Qd(45) = 200 − 90 = 110. Qs(45) = −100 + 180 = 80. Kelangkaan = 110 − 80 = 30 ton/hari. Antrean dan pasar gelap bisa muncul.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Harga cabai naik karena gagal panen. Dalam grafik permintaan–penawaran, apa yang terjadi?',
      options: ['Kurva permintaan bergeser ke kanan', 'Kurva penawaran bergeser ke kiri, harga keseimbangan naik dan jumlah turun', 'Kedua kurva tidak berubah, hanya titik di sepanjang kurva', 'Kurva penawaran bergeser ke kanan'], answer: 1,
      explain: 'Gagal panen mengurangi jumlah yang bisa dijual pada setiap harga (c turun), sehingga kurva penawaran bergeser ke kiri. Coba turunkan slider c di simulasi.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Pemerintah daerah ingin meredam lonjakan harga cabai sebelum terjadi. Teknologi apa yang paling membantu?',
      options: ['Mencetak uang lebih banyak', 'Panel informasi harga pangan real time (seperti PIHPS) dan prakiraan cuaca untuk mengatur pasokan antardaerah lebih awal', 'Melarang petani menjual ke luar kota', 'Menghapus pasar tradisional'], answer: 1,
      explain: 'Data harga harian dari ratusan pasar memperlihatkan daerah yang surplus dan defisit, sehingga pasokan bisa dipindahkan sebelum harga melonjak.',
    },
  ],
};
