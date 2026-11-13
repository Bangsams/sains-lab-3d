import { mat, mesh, label } from '../lib/helpers.js';

const KNOT = 1.852; // km/jam
const kmh = (p) => p.knot * KNOT;
const perDay = (p) => kmh(p) * p.jam;
const sailDays = (p) => p.D / perDay(p);
const totalDays = (p) => sailDays(p) + p.stop;

// Rute ilustrasi Lisboa → Tanjung Harapan → Kalikut → Malaka → Ternate (lintang, bujur).
const ROUTE = [[38.7, -9.1], [15, -25], [-10, -22], [-36, 18.5], [-20, 45], [11.25, 75.8], [5.5, 92], [2.2, 102.2], [-5.5, 112], [0.8, 127.4]];
const PORTS = [['Lisboa', 38.7, -9.1], ['Tanjung Harapan', -34.4, 18.5], ['Kalikut', 11.25, 75.8], ['Malaka', 2.2, 102.2], ['Maluku', 0.8, 127.4]];

export default {
  id: 'jalur-rempah',
  subject: 'sejarah',
  title: 'Penjelajahan Samudra & Jalur Rempah Nusantara',
  tags: ['sejarah', 'ekonomi'],
  summary: 'Ikuti pelayaran dari Eropa ke Maluku demi cengkih dan pala: hitung kecepatan kapal dalam knot, jarak harian, dan lama perjalanan.',
  story: `
    <p><strong>Mengapa Eropa mencari Maluku.</strong> Selama berabad-abad, cengkih hanya tumbuh di pulau-pulau kecil Maluku Utara dan pala di Kepulauan Banda. Rempah ini berpindah tangan dari pedagang Nusantara, India, Arab, sampai Venesia, sehingga harganya di Eropa berlipat-lipat.</p>
    <p>Setelah Konstantinopel jatuh ke tangan Utsmaniyah (1453), kerajaan Eropa mencari jalur laut sendiri. Bartolomeu Dias mengitari Tanjung Harapan (1488), Vasco da Gama tiba di Kalikut, India (1498), Portugis merebut Malaka (1511) lalu sampai di Maluku (1512). Ekspedisi Magelhaens–Elcano (1519–1522) menjadi pelayaran pertama yang mengelilingi bumi.</p>
    <p>Kapal layar saat itu rata-rata hanya beberapa knot dan sangat bergantung pada angin muson. Bagi Nusantara, kedatangan mereka menjadi awal persaingan dagang dan kolonialisme yang berlangsung ratusan tahun.</p>`,
  concept: 'v = knot × 1,852 km/jam &nbsp;·&nbsp; s<sub>hari</sub> = v · jam &nbsp;·&nbsp; t = D / s<sub>hari</sub>',
  conceptNote: 'Jarak rute di simulasi adalah ilustrasi. Pelayaran nyata berbelok mengikuti angin dan arus, serta berhenti lama di pelabuhan untuk menunggu muson atau memperbaiki kapal.',
  equations: [
    { f: 'v = knot × 1,852', meaning: 'Satu knot berarti satu mil laut per jam, dan satu mil laut = 1,852 km. Jadi kecepatan dalam km/jam adalah angka knot dikali 1,852.', symbols: [['v', 'Kecepatan kapal', 'km/jam'], ['knot', 'Kecepatan dalam mil laut per jam', 'knot']] },
    { f: 's<sub>hari</sub> = v · jam', meaning: 'Jarak yang ditempuh dalam sehari = kecepatan dikali lama berlayar per hari.', symbols: [['s<sub>hari</sub>', 'Jarak per hari', 'km/hari'], ['jam', 'Jam berlayar per hari', 'jam']] },
    { f: 't<sub>layar</sub> = D / s<sub>hari</sub> &nbsp;·&nbsp; t<sub>total</sub> = t<sub>layar</sub> + t<sub>singgah</sub>', meaning: 'Lama berlayar = jarak dibagi jarak harian. Lama perjalanan total ditambah hari singgah di pelabuhan.', symbols: [['D', 'Jarak rute', 'km'], ['t<sub>singgah</sub>', 'Hari berhenti di pelabuhan', 'hari']] },
    { f: 'bulan = hari / 30', meaning: 'Perkiraan kasar mengubah hari menjadi bulan.', symbols: [['bulan', 'Lama dalam bulan', 'bulan']] },
  ],
  params: [
    { key: 'D', label: 'Jarak rute D', min: 2000, max: 40000, step: 100, value: 20000, unit: 'km' },
    { key: 'knot', label: 'Kecepatan kapal', min: 1, max: 12, step: 0.5, value: 4, unit: 'knot' },
    { key: 'jam', label: 'Jam berlayar per hari', min: 6, max: 24, step: 1, value: 24, unit: 'jam' },
    { key: 'stop', label: 'Hari singgah di pelabuhan', min: 0, max: 300, step: 5, value: 60, unit: 'hari' },
  ],
  compute(p) {
    return [
      { label: 'Lama perjalanan total', value: totalDays(p), unit: 'hari', digits: 0, main: true },
      { label: 'Kecepatan', value: kmh(p), unit: 'km/jam', digits: 2 },
      { label: 'Jarak per hari', value: perDay(p), unit: 'km/hari', digits: 1 },
      { label: 'Hari berlayar', value: sailDays(p), unit: 'hari', digits: 1 },
      { label: 'Dalam bulan (≈)', value: totalDays(p) / 30, unit: 'bulan', digits: 1 },
    ];
  },
  view: { camera: [8, 5, -14], target: [0, 0, 0] },
  scene({ THREE, scene }) {
    const R = 5;
    const fill = new THREE.DirectionalLight(0xffffff, 1.2);
    fill.position.set(8, 6, -12); scene.add(fill); // menerangi sisi Samudra Hindia yang menghadap kamera
    const vec = (lat, lon, r = R) => {
      const a = (lat * Math.PI) / 180, b = (lon * Math.PI) / 180;
      return new THREE.Vector3(r * Math.cos(a) * Math.cos(b), r * Math.sin(a), -r * Math.cos(a) * Math.sin(b));
    };
    scene.add(mesh(new THREE.SphereGeometry(R, 64, 48), mat(0x2d6fa8, { roughness: 0.4, metalness: 0.1 }), { shadow: false }));
    // garis lintang & khatulistiwa
    [0, 23.4, -23.4].forEach((lat) => {
      const r = R * Math.cos((lat * Math.PI) / 180) + 0.01;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, lat ? 0.008 : 0.018, 6, 120), mat(lat ? 0x9fc6e8 : 0xffd36b));
      ring.rotation.x = Math.PI / 2; ring.position.y = R * Math.sin((lat * Math.PI) / 180);
      scene.add(ring);
    });
    // rute: titik-titik di permukaan bola
    const pts = [];
    for (let i = 0; i < ROUTE.length - 1; i++) {
      const a = vec(...ROUTE[i]).normalize(), b = vec(...ROUTE[i + 1]).normalize();
      for (let k = 0; k < 20; k++) pts.push(a.clone().lerp(b, k / 20).normalize().multiplyScalar(R + 0.03));
    }
    pts.push(vec(...ROUTE[ROUTE.length - 1], R + 0.03));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0xffd36b, dashSize: 0.12, gapSize: 0.08 })).computeLineDistances());
    PORTS.forEach(([name, lat, lon], i) => {
      const n = vec(lat, lon).normalize();
      const pin = mesh(new THREE.SphereGeometry(i === PORTS.length - 1 ? 0.16 : 0.1, 16, 12), mat(i === PORTS.length - 1 ? 0xff8f8f : 0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.3 }));
      pin.position.copy(n.clone().multiplyScalar(R + 0.05));
      const t = label(name, { size: 0.32 }); t.position.copy(n.clone().multiplyScalar(R + 0.6));
      scene.add(pin, t);
    });
    // kapal layar kecil (haluan ke arah +z lokal)
    const ship = new THREE.Group();
    ship.add(mesh(new THREE.BoxGeometry(0.16, 0.1, 0.42), mat(0x7a5230), { y: 0.05 }));
    ship.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 6), mat(0x5a3d22), { y: 0.3 }));
    ship.add(mesh(new THREE.PlaneGeometry(0.26, 0.24), mat(0xf4ecd8, { side: THREE.DoubleSide }), { y: 0.32 }).rotateY(Math.PI / 2));
    ship.scale.setScalar(1.4);
    scene.add(ship);
    const tag = label('', { size: 0.4 }); scene.add(tag);
    let s = 0;
    return {
      update(p, t, dt) {
        s = (s + dt * p.knot * (p.jam / 24) * 0.012) % 1;
        const f = s * (pts.length - 1), i = Math.floor(f);
        const pos = pts[i].clone().lerp(pts[Math.min(i + 1, pts.length - 1)], f - i);
        const ahead = pts[Math.min(i + 2, pts.length - 1)];
        ship.position.copy(pos);
        ship.up.copy(pos).normalize();
        if (ahead.distanceTo(pos) > 1e-4) ship.lookAt(ahead);
        tag.setText(`${p.knot.toString().replace('.', ',')} knot · ${Math.round(totalDays(p))} hari`);
        tag.position.copy(pos.clone().normalize().multiplyScalar(R + 1.1));
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Sebuah karak Portugis berlayar 4 knot tanpa henti selama 24 jam. Berapa kilometer yang ditempuhnya dalam sehari?',
      preset: { knot: 4, jam: 24 }, answer: 4 * 1.852 * 24, tolerance: 0.01, unit: 'km',
      explain: 'v = 4 × 1,852 = 7,408 km/jam. Sehari: 7,408 × 24 ≈ 177,8 km, kira-kira jarak Jakarta–Cirebon.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Rute ilustrasi Lisboa–Maluku sepanjang 20.000 km ditempuh dengan 4 knot, berlayar 24 jam sehari. Berapa hari lama berlayarnya (belum termasuk singgah)?',
      preset: { D: 20000, knot: 4, jam: 24 }, answer: 20000 / (4 * 1.852 * 24), tolerance: 0.01, unit: 'hari',
      explain: 't = 20.000 / 177,8 ≈ 112,5 hari, hampir 4 bulan di laut.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Lanjutan soal sebelumnya: kapal juga harus singgah total 60 hari untuk menunggu angin muson dan mengisi perbekalan. Berapa bulan lama perjalanan totalnya? (1 bulan = 30 hari)',
      preset: { D: 20000, knot: 4, jam: 24, stop: 60 }, answer: (20000 / (4 * 1.852 * 24) + 60) / 30, tolerance: 0.01, unit: 'bulan',
      explain: 't total = 112,5 + 60 = 172,5 hari ≈ 5,75 bulan. Karena itu satu pelayaran pulang-pergi Eropa–Maluku bisa memakan waktu lebih dari satu tahun.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Para pelaut di Samudra Hindia dan Nusantara mengatur jadwal pelayaran mengikuti angin muson. Mengapa?',
      options: ['Karena angin muson bertiup ke arah yang berbalik setiap setengah tahun, sehingga kapal layar bisa berangkat dengan satu musim dan pulang dengan musim berikutnya', 'Karena angin muson selalu tenang', 'Karena muson hanya bertiup di malam hari', 'Karena peraturan kerajaan'], answer: 0,
      explain: 'Daratan dan lautan memanas dengan laju berbeda, sehingga arah angin berbalik antara musim barat dan musim timur. Pedagang yang terlambat bisa tertahan berbulan-bulan di pelabuhan.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi navigasi',
      prompt: 'Pelaut abad ke-15–16 sudah bisa mengukur lintang dengan astrolab atau kuadran, tetapi kesulitan menentukan bujur. Teknologi apa yang akhirnya memecahkan masalah bujur pada abad ke-18?',
      options: ['Kompas magnetik', 'Kronometer laut, jam yang tetap akurat di kapal sehingga selisih waktu lokal dengan waktu pelabuhan asal bisa diubah menjadi bujur', 'Teropong', 'Peta kertas yang lebih besar'], answer: 1,
      explain: 'Bumi berputar 15° setiap jam. Jika kita tahu jam di pelabuhan asal dan jam setempat (dari posisi matahari), selisihnya langsung memberi bujur. Kronometer John Harrison membuat cara ini praktis.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Ekonomi & sejarah',
      prompt: 'Mengapa harga cengkih dan pala di Eropa abad ke-15 bisa puluhan kali lebih mahal daripada di Maluku?',
      options: ['Karena rempah busuk di perjalanan', 'Karena rempah melewati banyak pedagang perantara dan pajak di sepanjang jalur darat–laut, sementara pasokannya hanya dari wilayah yang sangat kecil', 'Karena orang Eropa tidak suka rempah', 'Karena dikirim lewat udara'], answer: 1,
      explain: 'Setiap perantara mengambil untung dan setiap penguasa jalur memungut pajak. Pasokan yang langka dari Maluku membuat bangsa Eropa berlomba mencari jalur laut langsung.',
    },
  ],
};
