import { mat, mesh, ground, label, rand } from '../lib/helpers.js';

// dies per wafer: luas lingkaran dibagi luas die, dikurangi die yang terpotong di tepi
const dpw = (p) => Math.floor((Math.PI * (p.d / 2) ** 2) / p.A - (Math.PI * p.d) / Math.sqrt(2 * p.A));
const yieldFrac = (p) => Math.exp(-p.D0 * (p.A / 100)); // model Poisson, A dalam cm²
const goodDies = (p) => Math.floor(dpw(p) * yieldFrac(p));

export default {
  id: 'fabrikasi-wafer',
  subject: 'semikonduktor',
  title: 'Pembuatan Chip: Wafer, Die & Yield',
  tags: ['industri', 'sehari-hari'],
  summary: 'Dari pasir silika sampai ratusan chip di satu wafer: berapa chip yang jadi dan mengapa chip besar lebih mahal.',
  story: `
    <p><strong>Perjalanan sebuah chip.</strong> Pasir silika (SiO₂) dimurnikan menjadi silikon 99,9999999% lalu ditumbuhkan menjadi batang kristal tunggal (metode Czochralski). Batang ini diiris menjadi <em>wafer</em> setipis 0,7 mm berdiameter 300 mm, lalu dipoles sampai sangat rata.</p>
    <p>Di dalam <em>cleanroom</em>, wafer melewati ratusan langkah berulang: oksidasi, pelapisan photoresist, fotolitografi, etsa, implantasi ion (doping), deposisi logam, dan pemolesan (CMP). Hasilnya ratusan <em>die</em> (calon chip) yang identik dalam pola kotak-kotak.</p>
    <p>Satu partikel debu atau cacat kristal di atas die bisa membuatnya gagal. Persentase die yang berfungsi disebut <strong>yield</strong>. Setelah diuji, die yang baik dipotong, dikemas (packaging), dan diuji lagi sebelum masuk ke ponsel atau laptop.</p>
    <p>Indonesia saat ini banyak bergerak di tahap <em>back-end</em> (perakitan & pengujian) di Batam, sambil menyiapkan SDM untuk desain dan fabrikasi.</p>`,
  concept: 'DPW ≈ π(d/2)²/A − πd/√(2A) &nbsp;·&nbsp; Y = e<sup>−D₀·A</sup> &nbsp;·&nbsp; Biaya/chip = Biaya wafer / (DPW · Y)',
  conceptNote: 'Model Poisson menganggap cacat tersebar acak. Pabrik nyata memakai model yang lebih rinci (Murphy, Seeds), tetapi kesimpulannya sama: yield turun eksponensial terhadap luas die.',
  equations: [
    {
      f: 'DPW ≈ π(d/2)² / A − π·d / √(2A)', meaning: 'Jumlah die di satu wafer: luas wafer dibagi luas satu die, dikurangi die yang terpotong di pinggir lingkaran.',
      symbols: [['DPW', 'Dies per wafer', 'buah'], ['d', 'Diameter wafer', 'mm'], ['A', 'Luas satu die', 'mm²']],
    },
    {
      f: 'Y = e<sup>−D₀ · A</sup>', meaning: 'Peluang sebuah die tidak terkena cacat sama sekali. Semakin besar die atau semakin banyak cacat, yield turun cepat.',
      symbols: [['Y', 'Yield (bagian die yang berfungsi)', '0–1'], ['D₀', 'Kerapatan cacat', 'cacat/cm²'], ['A', 'Luas die (dalam cm²; 100 mm² = 1 cm²)', 'cm²']],
    },
    {
      f: 'Biaya per chip baik = Biaya wafer / (DPW · Y)', meaning: 'Biaya wafer dibagi rata hanya ke die yang berhasil.',
      symbols: [['Biaya wafer', 'Biaya memproses satu wafer', 'USD']],
    },
  ],
  params: [
    { key: 'd', label: 'Diameter wafer', min: 150, max: 450, step: 50, value: 300, unit: 'mm' },
    { key: 'A', label: 'Luas die', min: 10, max: 800, step: 5, value: 100, unit: 'mm²' },
    { key: 'D0', label: 'Kerapatan cacat D₀', min: 0.01, max: 1, step: 0.01, value: 0.1, unit: 'per cm²' },
    { key: 'cost', label: 'Biaya per wafer', min: 2000, max: 20000, step: 500, value: 10000, unit: 'USD' },
  ],
  compute(p) {
    const g = goodDies(p);
    return [
      { label: 'Chip baik per wafer', value: g, unit: 'buah', digits: 0, main: true },
      { label: 'Dies per wafer', value: dpw(p), unit: 'buah', digits: 0 },
      { label: 'Yield', value: yieldFrac(p) * 100, unit: '%', digits: 1 },
      { label: 'Biaya per chip baik', value: g ? p.cost / g : 0, unit: 'USD', digits: 2 },
    ];
  },
  view: { camera: [0, 9, 7], target: [0, 0, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0x9aa4ae });
    const R = 4; // jari-jari wafer di layar
    const wafer = mesh(new THREE.CylinderGeometry(R, R, 0.08, 96), mat(0x8e9aab, { metalness: 0.9, roughness: 0.15 }), { y: 0.5 });
    scene.add(wafer);
    const MAX = 2600;
    const dieGeo = new THREE.BoxGeometry(1, 0.04, 1);
    const dies = new THREE.InstancedMesh(dieGeo, new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.35 }), MAX);
    scene.add(dies);
    const defects = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3b30 }), 400);
    scene.add(defects);
    const d = new THREE.Object3D(), cGood = new THREE.Color(0x5fd6c4), cBad = new THREE.Color(0x3a1f2b);
    const tag = label('', { size: 0.55 });
    tag.position.set(0, 2.2, -R - 0.6);
    scene.add(tag);
    let key = '';
    return {
      update(p, t) {
        wafer.rotation.y = t * 0.1; dies.rotation.y = defects.rotation.y = t * 0.1;
        const k = `${p.d}|${p.A}|${p.D0}`;
        tag.setText(`${goodDies(p)} chip baik dari ${dpw(p)} die`);
        if (k === key) return;
        key = k;
        const scale = R / (p.d / 2); // mm → satuan layar
        const side = Math.sqrt(p.A) * scale;
        const n = Math.ceil((2 * R) / side);
        // cacat acak: jumlah = D₀ × luas wafer (cm²)
        const rnd = rand(11);
        const nDef = Math.min(400, Math.round(p.D0 * Math.PI * (p.d / 20) ** 2));
        const pts = [];
        for (let i = 0; i < 400; i++) {
          if (i < nDef) {
            const r = R * Math.sqrt(rnd()), a = rnd() * Math.PI * 2;
            pts.push([r * Math.cos(a), r * Math.sin(a)]);
            d.position.set(pts[i][0], 0.6, pts[i][1]); d.scale.setScalar(1);
          } else { d.position.set(0, -50, 0); }
          d.updateMatrix(); defects.setMatrixAt(i, d.matrix);
        }
        let c = 0;
        for (let i = 0; i < n && c < MAX; i++) for (let j = 0; j < n && c < MAX; j++) {
          const x = -R + (i + 0.5) * side, z = -R + (j + 0.5) * side;
          const corner = Math.max(...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => Math.hypot(x + (a * side) / 2, z + (b * side) / 2)));
          if (corner > R) continue;
          const hit = pts.some(([px, pz]) => Math.abs(px - x) < side / 2 && Math.abs(pz - z) < side / 2);
          d.position.set(x, 0.56, z); d.scale.set(side * 0.9, 1, side * 0.9); d.updateMatrix();
          dies.setMatrixAt(c, d.matrix); dies.setColorAt(c, hit ? cBad : cGood); c++;
        }
        dies.count = c;
        dies.instanceMatrix.needsUpdate = defects.instanceMatrix.needsUpdate = true;
        if (dies.instanceColor) dies.instanceColor.needsUpdate = true;
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung', integer: true,
      prompt: 'Wafer berdiameter 300 mm dipakai untuk die seluas 100 mm². Dengan rumus DPW (dibulatkan ke bawah), berapa die per wafer?',
      preset: { d: 300, A: 100 }, answer: 640, tolerance: 0, unit: 'die',
      explain: 'π × 150² / 100 = 706,9; π × 300 / √200 = 66,6. DPW = 706,9 − 66,6 = 640,2 → 640 die.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Kerapatan cacat 0,2 per cm² dan luas die 200 mm². Berapa persen yield-nya menurut model Poisson?',
      preset: { D0: 0.2, A: 200 }, answer: 67, tolerance: 0.01, unit: '%',
      explain: 'A = 200 mm² = 2 cm². Y = e^(−0,2 × 2) = e^(−0,4) = 0,670 → 67,0%.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Wafer 300 mm berisi 640 die (100 mm²), D₀ = 0,1/cm², dan biaya proses satu wafer USD 10.000. Berapa biaya produksi per chip yang berfungsi? (bulatkan jumlah chip baik ke bawah)',
      preset: { d: 300, A: 100, D0: 0.1, cost: 10000 }, answer: 17.27, tolerance: 0.02, unit: 'USD',
      explain: 'Y = e^(−0,1) = 0,905 → 640 × 0,905 = 579 chip baik. 10.000 / 579 ≈ USD 17,27 per chip.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Mengapa silikon dipilih sebagai bahan utama chip?',
      options: ['Karena silikon penghantar listrik terbaik', 'Karena silikon semikonduktor dengan celah pita ±1,1 eV, sehingga konduktivitasnya bisa diatur dengan doping, dan oksidanya (SiO₂) isolator yang sangat baik', 'Karena silikon bersifat magnetik', 'Karena silikon tidak bisa teroksidasi'], answer: 1,
      explain: 'Doping boron (tipe-p) atau fosfor (tipe-n) mengubah jumlah pembawa muatan. SiO₂ yang tumbuh alami di atas silikon menjadi isolator gerbang dan masker. Silikon juga melimpah di pasir.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Manakah urutan satu siklus pembentukan pola di wafer yang benar?',
      options: ['Etsa → photoresist → paparan cahaya → pengembangan', 'Lapisi photoresist → paparan cahaya lewat masker (litografi) → pengembangan resist → etsa/implantasi → buang sisa resist', 'Doping → potong wafer → poles → litografi', 'Packaging → litografi → etsa'], answer: 1,
      explain: 'Pola dari masker dipindahkan ke resist oleh cahaya, resist yang terpapar dilarutkan, lalu bagian terbuka dietsa atau didoping. Siklus ini diulang puluhan kali untuk tiap lapisan chip.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Chip AI berukuran 800 mm² memiliki yield sangat rendah. Mengapa perusahaan beralih ke desain chiplet (beberapa die kecil yang dirangkai dalam satu kemasan)?',
      preset: { A: 800, D0: 0.1 },
      options: ['Karena chiplet lebih lambat', 'Karena yield turun eksponensial terhadap luas die; empat die 200 mm² punya yield jauh lebih tinggi dari satu die 800 mm², dan die cacat dibuang satu per satu', 'Karena wafer tidak bisa menampung die besar', 'Karena chiplet tidak butuh litografi'], answer: 1,
      explain: 'Dengan D₀ = 0,1/cm²: die 8 cm² → e^(−0,8) = 45%; die 2 cm² → e^(−0,2) = 82%. Interkoneksi antar chiplet menambah sedikit biaya, tetapi jauh lebih hemat.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Mengapa fabrikasi chip harus dilakukan di cleanroom (kelas ISO 1–5)?',
      options: ['Agar pekerja tidak sakit', 'Karena partikel debu berukuran sepersekian mikrometer bisa menutupi puluhan transistor dan membuat die cacat', 'Agar suhu tetap panas', 'Karena silikon mudah terbakar'], answer: 1,
      explain: 'Transistor modern berukuran nanometer, sedangkan udara biasa mengandung jutaan partikel per m³. Cleanroom menyaring udara (HEPA/ULPA) sehingga D₀ tetap rendah.',
    },
  ],
};
