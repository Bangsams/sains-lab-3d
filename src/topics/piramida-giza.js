import { mat, mesh, ground, label } from '../lib/helpers.js';

const vol = (p) => (p.s * p.s * p.h) / 3;
const slope = (p) => (Math.atan(p.h / (p.s / 2)) * 180) / Math.PI;
const blocks = (p) => vol(p) / p.vb;
const perDay = (p) => blocks(p) / (p.years * 365);
const mass = (p) => vol(p) * p.rho; // ton

export default {
  id: 'piramida-giza',
  subject: 'sejarah',
  title: 'Mesir Kuno: Membangun Piramida Giza',
  tags: ['sejarah', 'industri'],
  summary: 'Hitung volume, sudut kemiringan, jumlah blok batu, dan laju kerja pembangunan Piramida Agung Khufu sekitar 4.500 tahun lalu.',
  story: `
    <p><strong>Proyek konstruksi raksasa zaman perunggu.</strong> Sekitar 2560 SM, Firaun Khufu dari Dinasti ke-4 Mesir membangun makamnya di dataran Giza. Sisinya sekitar 230 m dan tinggi aslinya sekitar 146 m. Selama hampir 3.800 tahun ia menjadi bangunan tertinggi buatan manusia.</p>
    <p>Bahannya sekitar 2,3 juta blok batu kapur dan granit, rata-rata seberat beberapa ton. Para ahli menduga blok ditarik dengan kereta luncur di atas pasir yang dibasahi, lalu dinaikkan lewat ramp. Pekerjanya bukan budak seperti di film, melainkan tim pekerja terampil yang diberi makan dan tinggal di kampung pekerja dekat lokasi.</p>
    <p>Pembangunannya diperkirakan berlangsung sekitar 20 tahun. Dari angka-angka ini kita bisa memperkirakan berapa blok yang harus dipasang setiap hari: soal manajemen proyek yang sama dengan pembangunan gedung modern.</p>`,
  concept: 'V = ⅓ · s² · h &nbsp;·&nbsp; θ = arctan(h / (s/2)) &nbsp;·&nbsp; N = V / v<sub>b</sub>',
  conceptNote: 'Angka di sini perkiraan. Sebagian volume piramida sebenarnya berupa bukit batu alami di intinya, dan ukuran blok sangat beragam.',
  equations: [
    { f: 'V = ⅓ · s² · h', meaning: 'Volume limas beralas persegi adalah sepertiga volume balok dengan alas dan tinggi yang sama.', symbols: [['V', 'Volume piramida', 'm³'], ['s', 'Panjang sisi alas', 'm'], ['h', 'Tinggi piramida', 'm']] },
    { f: 'θ = arctan( h / (s/2) )', meaning: 'Sudut kemiringan sisi miring diukur dari tanah. Bayangkan segitiga siku-siku dengan tinggi h dan alas setengah sisi.', symbols: [['θ', 'Sudut kemiringan sisi', '°']] },
    { f: 'N = V / v<sub>b</sub>', meaning: 'Jumlah blok batu ≈ volume total dibagi volume rata-rata satu blok.', symbols: [['N', 'Jumlah blok', 'blok'], ['v<sub>b</sub>', 'Volume rata-rata satu blok', 'm³']] },
    { f: 'Laju = N / (tahun · 365)', meaning: 'Rata-rata blok yang harus dipasang setiap hari agar selesai tepat waktu.', symbols: [['tahun', 'Lama pembangunan', 'tahun'], ['Laju', 'Blok per hari', 'blok/hari']] },
    { f: 'm = ρ · V', meaning: 'Massa total = massa jenis batu dikali volume.', symbols: [['m', 'Massa total', 'ton'], ['ρ', 'Massa jenis batu kapur', 'ton/m³']] },
  ],
  params: [
    { key: 's', label: 'Sisi alas s', min: 50, max: 300, step: 0.1, value: 230.3, unit: 'm' },
    { key: 'h', label: 'Tinggi h', min: 20, max: 200, step: 0.1, value: 146.6, unit: 'm' },
    { key: 'vb', label: 'Volume rata-rata satu blok', min: 0.5, max: 3, step: 0.05, value: 1.1, unit: 'm³' },
    { key: 'years', label: 'Lama pembangunan', min: 5, max: 40, step: 1, value: 20, unit: 'tahun' },
    { key: 'rho', label: 'Massa jenis batu ρ', min: 2, max: 3, step: 0.1, value: 2.6, unit: 'ton/m³' },
  ],
  compute(p) {
    return [
      { label: 'Volume', value: vol(p), unit: 'm³', digits: 0, main: true },
      { label: 'Sudut kemiringan', value: slope(p), unit: '°', digits: 1 },
      { label: 'Jumlah blok', value: blocks(p), unit: 'blok', digits: 0 },
      { label: 'Blok per hari', value: perDay(p), unit: 'blok/hari', digits: 0 },
      { label: 'Massa total', value: mass(p) / 1e6, unit: 'juta ton', digits: 2 },
    ];
  },
  view: { camera: [10, 6, 13], target: [0, 2.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xe3c98f });
    const S = 1 / 28; // satuan 3D per meter
    const stone = mat(0xd9c08a, { roughness: 0.9, flatShading: true });
    const pyr = mesh(new THREE.ConeGeometry(1 / Math.SQRT2, 1, 4, 6), stone);
    pyr.geometry.rotateY(Math.PI / 4);
    scene.add(pyr);
    const cap = mesh(new THREE.ConeGeometry(1 / Math.SQRT2, 1, 4), mat(0xffd36b, { metalness: 0.8, roughness: 0.3 }));
    cap.geometry.rotateY(Math.PI / 4);
    scene.add(cap);
    // dua piramida kecil di belakang sebagai pembanding (Khafre, Menkaure)
    [[-5.5, -5, 0.95], [-9, -8.5, 0.6]].forEach(([x, z, k]) => {
      const m = mesh(new THREE.ConeGeometry(4.1 * k, 5.2 * k, 4), stone, { x, z, y: 2.6 * k });
      m.rotation.y = Math.PI / 4; scene.add(m);
    });
    const ramp = mesh(new THREE.BoxGeometry(0.9, 0.12, 1), mat(0xb59a7a), {});
    scene.add(ramp);
    const block = mesh(new THREE.BoxGeometry(0.3, 0.22, 0.3), mat(0xefe3c2), {});
    scene.add(block);
    const tV = label('', { size: 0.5 }), tA = label('', { size: 0.42 });
    scene.add(tV, tA);
    return {
      update(p, t) {
        const s = p.s * S, h = p.h * S;
        pyr.scale.set(s, h, s); pyr.position.y = h / 2;
        cap.scale.set(s * 0.06, h * 0.06, s * 0.06); cap.position.y = h * 0.97;
        // ramp lurus dari tanah ke 2/3 tinggi di sisi depan
        const rh = h * 0.66, run = rh * 1.6, len = Math.hypot(rh, run);
        const z0 = (s / 2) * 0.34; // jarak muka piramida dari pusat pada ketinggian rh
        ramp.scale.z = len; ramp.position.set(s * 0.18, rh / 2, z0 + run / 2);
        ramp.rotation.x = Math.atan2(rh, run);
        const k = (t * 0.15) % 1;
        block.position.set(s * 0.18, k * rh + 0.17, z0 + run * (1 - k));
        block.rotation.x = ramp.rotation.x;
        tV.setText(`V ≈ ${(vol(p) / 1e6).toFixed(2).replace('.', ',')} juta m³ · ${Math.round(perDay(p)).toLocaleString('id-ID')} blok/hari`);
        tV.position.set(0, h + 0.9, 0);
        tA.setText(`θ = ${slope(p).toFixed(1).replace('.', ',')}°`);
        tA.position.set(-s / 2 - 0.6, 0.6, s / 2 + 0.3);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Sebuah piramida beralas persegi bersisi 230 m dan tingginya 146 m. Berapa m³ volumenya?',
      preset: { s: 230, h: 146 }, answer: (230 * 230 * 146) / 3, tolerance: 0.01, unit: 'm³',
      explain: 'V = ⅓ × 230² × 146 = ⅓ × 52.900 × 146 = 7.723.400/3 ≈ 2.574.467 m³, kira-kira 2,6 juta m³.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Dengan sisi alas 230,3 m dan tinggi 146,6 m, berapa derajat sudut kemiringan sisi Piramida Khufu?',
      preset: { s: 230.3, h: 146.6 }, answer: (Math.atan(146.6 / 115.15) * 180) / Math.PI, tolerance: 0.01, unit: '°',
      explain: 'θ = arctan(146,6 / 115,15) = arctan(1,273) ≈ 51,8°. Sudut ini hampir sama di keempat sisinya: bukti ketelitian pengukuran orang Mesir kuno.',
    },
    {
      stem: 'E', type: 'num', kind: 'Manajemen proyek',
      prompt: 'Misalkan piramida tersusun dari 2.300.000 blok dan dibangun dalam 20 tahun dengan kerja setiap hari. Berapa blok rata-rata yang harus dipasang per hari?',
      preset: { years: 20 }, answer: 2300000 / (20 * 365), tolerance: 0.01, unit: 'blok/hari',
      explain: 'Laju = 2.300.000 / (20 × 365) = 2.300.000 / 7.300 ≈ 315 blok per hari. Dengan 10 jam kerja, itu sekitar satu blok setiap 2 menit: butuh banyak tim yang bekerja serentak.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Volume batu piramida 2,5 juta m³ dan massa jenis batu kapur 2,6 ton/m³. Berapa juta ton massanya?',
      preset: { rho: 2.6 }, answer: 2.5 * 2.6, tolerance: 0.01, unit: 'juta ton',
      explain: 'm = ρ · V = 2,6 × 2,5 juta = 6,5 juta ton.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa bentuk piramida sangat stabil sehingga bertahan lebih dari 4.500 tahun?',
      options: ['Karena batunya ringan', 'Karena sebagian besar massanya ada di bawah, sehingga titik beratnya rendah (¼ tinggi dari alas) dan beban tersalur ke tanah', 'Karena dilapisi emas', 'Karena berada di gurun yang tidak pernah hujan'], answer: 1,
      explain: 'Titik berat limas berada di ¼ tingginya. Semakin rendah titik berat dan semakin lebar alasnya, semakin sulit bangunan terguling atau runtuh.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Lukisan makam Mesir memperlihatkan orang menuangkan air di depan kereta luncur yang menarik patung besar. Penelitian modern menjelaskan fungsinya, yaitu…',
      options: ['Air membuat pasir lebih padat dan mengurangi gaya gesek sehingga beban lebih mudah ditarik', 'Air untuk minum pekerja', 'Air untuk mendinginkan batu', 'Upacara keagamaan saja'], answer: 0,
      explain: 'Pasir yang dibasahi secukupnya tidak menumpuk di depan kereta luncur, sehingga gaya yang diperlukan untuk menarik bisa turun hingga sekitar setengahnya.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Rekayasa',
      prompt: 'Ramp lurus yang landai butuh bahan sangat banyak jika piramidanya tinggi. Solusi rekayasa yang banyak diusulkan para ahli adalah…',
      options: ['Ramp yang melingkari piramida atau ramp di dalam bangunan, sehingga panjang ramp tetap besar tanpa menimbun bahan sebanyak ramp lurus', 'Mengangkat batu dengan balon udara', 'Membuat piramida dari atas ke bawah', 'Memakai derek baja'], answer: 0,
      explain: 'Kemiringan ramp harus kecil agar blok bisa ditarik. Ramp spiral atau internal memberi lintasan panjang dengan kemiringan kecil, tanpa harus membangun ramp lurus raksasa.',
    },
  ],
};
