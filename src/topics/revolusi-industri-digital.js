import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

const N0 = 2300, T0 = 1971; // Intel 4004
const doublings = (p) => (p.year - T0) / p.T;
const transistors = (p) => N0 * 2 ** doublings(p);
const pop = (p) => p.P0 * (1 + p.r / 100) ** p.n;
const rule70 = (p) => 70 / p.r;
const big = (v) => (v >= 1e9 ? `${(v / 1e9).toFixed(1).replace('.', ',')} miliar` : v >= 1e6 ? `${(v / 1e6).toFixed(1).replace('.', ',')} juta` : Math.round(v).toLocaleString('id-ID'));

export default {
  id: 'revolusi-industri-digital',
  subject: 'sejarah',
  title: 'Revolusi Industri sampai Era Digital',
  tags: ['sejarah', 'industri'],
  summary: 'Dari mesin uap James Watt sampai chip miliaran transistor: pahami pertumbuhan eksponensial penduduk dunia dan Hukum Moore.',
  story: `
    <p><strong>Dua ratus lima puluh tahun yang mengubah segalanya.</strong> Sekitar 1760-an di Inggris, mesin tenun dan mesin uap mulai menggantikan tenaga manusia dan hewan. James Watt menambahkan kondensor terpisah (paten 1769) sehingga mesin uap jauh lebih hemat batu bara. Kereta api umum pertama, Stockton–Darlington, beroperasi tahun 1825.</p>
    <p>Revolusi industri kedua membawa listrik, baja, dan minyak; revolusi ketiga membawa komputer. Tahun 1971 Intel merilis mikroprosesor 4004 berisi 2.300 transistor. Gordon Moore mengamati jumlah transistor dalam satu chip berlipat dua kira-kira setiap dua tahun: <em>Hukum Moore</em>. Kini kita berada di revolusi industri 4.0: internet of things, kecerdasan buatan, dan pabrik pintar.</p>
    <p>Penduduk dunia juga tumbuh eksponensial berkat makanan, obat, dan sanitasi yang lebih baik: sekitar 1 miliar pada awal 1800-an, 2 miliar pada 1927, dan 8 miliar pada November 2022.</p>`,
  concept: 'N = N₀ · 2<sup>(t − t₀)/T</sup> &nbsp;·&nbsp; P = P₀ (1 + r)<sup>n</sup> &nbsp;·&nbsp; t<sub>ganda</sub> ≈ 70 / r%',
  conceptNote: 'Hukum Moore adalah pengamatan tren, bukan hukum alam; lajunya melambat sejak 2010-an. Model pertumbuhan penduduk dengan r tetap juga penyederhanaan, karena laju pertumbuhan dunia terus menurun.',
  equations: [
    { f: 'N = N₀ · 2<sup>(t − t₀)/T</sup>', meaning: 'Hukum Moore: jumlah transistor berlipat dua setiap T tahun. (t − t₀)/T adalah banyaknya pelipatan.', symbols: [['N', 'Jumlah transistor per chip', 'buah'], ['N₀', 'Transistor Intel 4004 = 2.300', 'buah'], ['t₀', 'Tahun awal = 1971', 'tahun'], ['T', 'Waktu pelipatan', 'tahun']] },
    { f: 'P = P₀ · (1 + r)<sup>n</sup>', meaning: 'Pertumbuhan majemuk: setiap tahun penduduk bertambah r persen dari jumlah tahun sebelumnya.', symbols: [['P', 'Penduduk setelah n tahun', 'miliar'], ['P₀', 'Penduduk awal', 'miliar'], ['r', 'Laju pertumbuhan per tahun (dalam desimal)', '%/tahun'], ['n', 'Lama waktu', 'tahun']] },
    { f: 't<sub>ganda</sub> ≈ 70 / r', meaning: 'Aturan 70: perkiraan cepat berapa tahun sampai sesuatu yang tumbuh r% per tahun menjadi dua kali lipat (r ditulis dalam persen).', symbols: [['t<sub>ganda</sub>', 'Waktu berlipat dua', 'tahun']] },
  ],
  params: [
    { key: 'year', label: 'Tahun chip', min: 1971, max: 2030, step: 1, value: 2021, unit: '' },
    { key: 'T', label: 'Waktu pelipatan transistor T', min: 1, max: 4, step: 0.1, value: 2, unit: 'tahun' },
    { key: 'P0', label: 'Penduduk awal P₀', min: 1, max: 10, step: 0.1, value: 8, unit: 'miliar' },
    { key: 'r', label: 'Laju pertumbuhan penduduk r', min: 0.1, max: 3, step: 0.1, value: 1, unit: '%/tahun' },
    { key: 'n', label: 'Lama waktu n', min: 0, max: 100, step: 1, value: 10, unit: 'tahun' },
  ],
  compute(p) {
    return [
      { label: 'Transistor per chip', value: big(transistors(p)), text: true, main: true },
      { label: 'Banyak pelipatan', value: doublings(p), unit: 'kali', digits: 1 },
      { label: `Penduduk setelah ${p.n} tahun`, value: pop(p), unit: 'miliar', digits: 2 },
      { label: 'Waktu berlipat dua (aturan 70)', value: rule70(p), unit: 'tahun', digits: 0 },
    ];
  },
  view: { camera: [0, 7, 14], target: [0, 2, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc3c9c0 });
    // kiri: pabrik uap abad ke-19
    const brick = mat(0x8a4a3a);
    scene.add(mesh(new THREE.BoxGeometry(3, 1.6, 2), brick, { x: -5, y: 0.8 }));
    const roof = mesh(new THREE.CylinderGeometry(0.01, 1.2, 3, 3), mat(0x4a3a34), { x: -5, y: 2 }); roof.rotation.z = Math.PI / 2; scene.add(roof);
    [-5.9, -4.6].forEach((x) => scene.add(mesh(new THREE.CylinderGeometry(0.18, 0.24, 3.6, 14), mat(0x6e3a2e), { x, y: 1.8, z: -0.5 })));
    const wheel = mesh(new THREE.TorusGeometry(0.7, 0.08, 10, 32), mat(0x3a3d40, { metalness: 0.8 }), { x: -5, y: 0.9, z: 1.15 });
    scene.add(wheel);
    const spokes = new THREE.Group(); spokes.position.copy(wheel.position); scene.add(spokes);
    for (let k = 0; k < 3; k++) { const sp = mesh(new THREE.BoxGeometry(1.4, 0.06, 0.06), mat(0x3a3d40, { metalness: 0.8 })); sp.rotation.z = (k * Math.PI) / 3; spokes.add(sp); }
    const smoke = particles(60, 0x9a9a9a, 0.14, 0.55); scene.add(smoke);
    const tF = label('Mesin uap · 1769', { size: 0.4 }); tF.position.set(-5, 4.4, 0); scene.add(tF);
    // tengah: tiang penduduk dunia
    const people = mesh(new THREE.CylinderGeometry(0.7, 0.7, 1, 32), mat(0x5fd6c4, { emissive: 0x5fd6c4, emissiveIntensity: 0.2 }));
    scene.add(people);
    const tP = label('', { size: 0.42 }); scene.add(tP);
    // kanan: chip dengan petak transistor yang makin rapat
    scene.add(mesh(new THREE.BoxGeometry(4.2, 0.25, 4.2), mat(0x22262c, { metalness: 0.5 }), { x: 5, y: 0.125 }));
    const MAX = 40;
    const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat(0xc6a8ff, { emissive: 0xc6a8ff, emissiveIntensity: 0.5 }), MAX * MAX);
    scene.add(tiles);
    const dummy = new THREE.Object3D();
    const tC = label('', { size: 0.42 }); tC.position.set(5, 1.6, 0); scene.add(tC);
    let lastK = -1;
    return {
      update(p, t) {
        wheel.rotation.z = -t * 3; spokes.rotation.z = -t * 3;
        for (let i = 0; i < 60; i++) {
          const k = (t * 0.3 + i / 60) % 1, x = i % 2 ? -5.9 : -4.6;
          smoke.setAt(i, x + Math.sin(i * 5 + t) * 0.3 * k + k * 0.8, 3.7 + k * 3, -0.5 + Math.cos(i * 3) * 0.2 * k, 0.6 + k * 2);
        }
        smoke.instanceMatrix.needsUpdate = true;
        const h = 1.4 * Math.log2(1 + pop(p));
        people.scale.y = h; people.position.y = h / 2;
        tP.setText(`Penduduk ${pop(p).toFixed(2).replace('.', ',')} miliar`);
        tP.position.set(0, h + 0.6, 0);
        const k = Math.max(1, Math.min(MAX, Math.round(1 + doublings(p) * 1.3)));
        if (k !== lastK) {
          lastK = k;
          const cell = 3.8 / k, sz = cell * 0.7;
          let i = 0;
          for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) {
            dummy.position.set(5 - 1.9 + cell * (a + 0.5), 0.25 + 0.04, -1.9 + cell * (b + 0.5));
            dummy.scale.set(sz, 0.08, sz); dummy.updateMatrix();
            tiles.setMatrixAt(i++, dummy.matrix);
          }
          tiles.count = k * k;
          tiles.instanceMatrix.needsUpdate = true;
        }
        tC.setText(`${p.year}: ${big(transistors(p))} transistor`);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Intel 4004 (1971) memiliki 2.300 transistor. Jika jumlah transistor berlipat dua setiap 2 tahun, berapa transistor per chip pada tahun 1991?',
      preset: { year: 1991, T: 2 }, answer: 2300 * 2 ** 10, tolerance: 0.001, unit: 'transistor',
      explain: 'Banyak pelipatan = (1991 − 1971)/2 = 10. N = 2.300 × 2¹⁰ = 2.300 × 1.024 = 2.355.200 transistor.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Penduduk dunia sekitar 8 miliar dan tumbuh 1% per tahun. Dengan model pertumbuhan majemuk, berapa miliar penduduk 10 tahun kemudian?',
      preset: { P0: 8, r: 1, n: 10 }, answer: 8 * 1.01 ** 10, tolerance: 0.005, unit: 'miliar',
      explain: 'P = 8 × 1,01¹⁰ = 8 × 1,1046 ≈ 8,84 miliar.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Menurut aturan 70, jika suatu negara tumbuh 1,4% per tahun, kira-kira berapa tahun sampai penduduknya dua kali lipat?',
      preset: { r: 1.4 }, answer: 70 / 1.4, tolerance: 0.01, unit: 'tahun',
      explain: 't ganda ≈ 70 / 1,4 = 50 tahun.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Perbaikan utama James Watt pada mesin uap Newcomen adalah kondensor terpisah. Mengapa ini membuat mesin jauh lebih hemat bahan bakar?',
      options: ['Silinder tidak perlu didinginkan lalu dipanaskan lagi setiap langkah, sehingga panas tidak terbuang', 'Mesin menjadi lebih ringan', 'Uap berubah menjadi bensin', 'Mesin tidak membutuhkan air'], answer: 0,
      explain: 'Pada mesin Newcomen, uap diembunkan di dalam silinder sehingga silinder ikut mendingin dan harus dipanaskan ulang. Watt mengembunkan uap di ruang terpisah, jadi silinder tetap panas dan batu bara yang dibutuhkan berkurang drastis.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Manakah ciri utama Revolusi Industri 4.0?',
      options: ['Mesin uap dan tenun mekanik', 'Listrik dan jalur perakitan', 'Sistem siber-fisik: mesin terhubung internet (IoT), data besar, dan kecerdasan buatan yang mengambil keputusan', 'Penemuan roda'], answer: 2,
      explain: 'Industri 1.0 = uap, 2.0 = listrik dan produksi massal, 3.0 = komputer dan otomasi, 4.0 = mesin, sensor, dan sistem yang saling terhubung dan belajar dari data.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Rekayasa',
      prompt: 'Mengapa kereta api sangat penting bagi Revolusi Industri di abad ke-19?',
      options: ['Karena kereta api lebih indah dari kereta kuda', 'Karena bisa mengangkut batu bara, bahan baku, dan barang jadi dalam jumlah besar dengan biaya rendah dan cepat, sehingga pabrik dan pasar terhubung', 'Karena hanya untuk wisata', 'Karena tidak membutuhkan bahan bakar'], answer: 1,
      explain: 'Gesekan roda baja di atas rel sangat kecil, sehingga satu lokomotif dapat menarik ratusan ton. Biaya angkut turun, pabrik bisa berdiri jauh dari tambang, dan barang industri menjangkau pasar yang lebih luas.',
    },
  ],
};
