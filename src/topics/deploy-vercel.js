import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

const ANTRE = 5; // detik, menunggu mesin build tersedia (perkiraan)

const upload = (p) => (p.S * 8) / p.B;                       // detik
const live = (p) => ANTRE + p.inst + p.build + upload(p);   // detik
const panggilan = (p) => p.V * p.c;                          // per hari
const gbDetik = (p) => panggilan(p) * (p.d / 1000) * p.M;    // GB-detik per hari

const STATIONS = ['git push', 'install', 'build', 'CDN global'];

export default {
  id: 'deploy-vercel',
  subject: 'coding',
  title: 'Konfigurasi & Deploy ke Vercel',
  tags: ['web', 'industri'],
  summary: 'Menyusun vercel.json, menyimpan rahasia di environment variable, lalu menghitung waktu deploy dan pemakaian fungsi serverless.',
  story: `
    <p><strong>Studi kasus: membawa Datmin Automation APP ke internet.</strong> Aplikasi ini terdiri atas halaman statis di folder <code>public/</code> dan fungsi serverless di folder <code>api/</code>. Vercel menjalankan setiap file di <code>api/</code> sebagai satu endpoint, misalnya <code>api/stat.js</code> menjadi <code>/api/stat</code>.</p>
    <p><strong>1. Konfigurasi <code>vercel.json</code>.</strong> File ini mengatur cara build dan batas waktu fungsi:</p>
    <pre><code>{
  "buildCommand": "node build/retheme.js",
  "outputDirectory": "public",
  "framework": null,
  "functions": {
    "api/stat.js": { "maxDuration": 60 },
    "api/key.js":  { "maxDuration": 30, "includeFiles": "data/keys/**" }
  },
  "headers": [{ "source": "/(.*)", "headers": [
    { "key": "X-Robots-Tag", "value": "noindex" },
    { "key": "X-Content-Type-Options", "value": "nosniff" } ] }]
}</code></pre>
    <p><code>maxDuration</code> memberi waktu lebih lama untuk fungsi yang membaca banyak sheet. <code>includeFiles</code> ikut mengemas file kunci jawaban PDF ke dalam fungsi. Header <code>noindex</code> mencegah dashboard nilai muncul di mesin pencari.</p>
    <p><strong>2. Rahasia di Environment Variables.</strong> Password dashboard dan kunci service account Google <em>tidak boleh</em> ada di repo atau di file publik. Rahasia disimpan di Vercel (Settings → Environment Variables, atau <code>vercel env add DASHBOARD_PASSWORD production</code>) dan dibaca lewat <code>process.env</code> di dalam fungsi.</p>
    <p><strong>3. Deploy.</strong> Ada dua cara: hubungkan repo GitHub sehingga setiap <code>git push</code> ke <code>main</code> otomatis men-deploy, atau jalankan <code>vercel --prod</code> dari folder proyek. Prosesnya: antre → unggah/klon → <code>npm install</code> → build → disebar ke CDN global, lalu alias produksi dipindahkan ke versi baru. Jika ada masalah, versi lama bisa dikembalikan dengan <em>Instant Rollback</em>.</p>`,
  concept: `T<sub>live</sub> = t<sub>antre</sub> + t<sub>install</sub> + t<sub>build</sub> + 8S / B &nbsp;·&nbsp; GB·s = V · c · d · M`,
  conceptNote: 'Model sederhana untuk belajar memperkirakan. Waktu antre diasumsikan 5 detik. Durasi fungsi d dalam detik, memori M dalam GB. Platform cloud menghitung pemakaian fungsi dalam satuan GB-detik/GB-jam.',
  equations: [
    {
      f: 'T<sub>live</sub> = t<sub>antre</sub> + t<sub>install</sub> + t<sub>build</sub> + 8S / B',
      meaning: 'Waktu dari perintah deploy sampai situs baru bisa dibuka adalah jumlah semua tahap. Unggahan makin lama jika file makin besar atau internet makin lambat.',
      symbols: [
        ['T<sub>live</sub>', 'Waktu sampai versi baru aktif', 's'],
        ['t<sub>install</sub>', 'Waktu memasang dependensi (npm install)', 's'],
        ['t<sub>build</sub>', 'Waktu menjalankan buildCommand', 's'],
        ['S', 'Ukuran file yang diunggah', 'MB'],
        ['B', 'Kecepatan unggah internet (8 bit = 1 byte)', 'Mbps'],
      ],
    },
    {
      f: 'GB·s = V · c · d · M',
      meaning: 'Pemakaian fungsi serverless = jumlah panggilan dikali lama setiap panggilan dikali memori yang dipakai. Makin sering halaman memanggil API, makin besar pemakaiannya.',
      symbols: [
        ['V', 'Jumlah kunjungan per hari', 'kunjungan'],
        ['c', 'Panggilan API per kunjungan', 'panggilan'],
        ['d', 'Durasi satu panggilan', 's'],
        ['M', 'Memori fungsi', 'GB'],
      ],
    },
  ],
  params: [
    { key: 'S', label: 'Ukuran unggahan', min: 1, max: 200, step: 1, value: 25, unit: 'MB' },
    { key: 'B', label: 'Kecepatan unggah', min: 2, max: 100, step: 1, value: 20, unit: 'Mbps' },
    { key: 'inst', label: 'Waktu npm install', min: 0, max: 120, step: 1, value: 20, unit: 's' },
    { key: 'build', label: 'Waktu build', min: 0, max: 300, step: 1, value: 15, unit: 's' },
    { key: 'V', label: 'Kunjungan per hari', min: 10, max: 2000, step: 10, value: 200, unit: 'kunjungan' },
    { key: 'c', label: 'Panggilan API per kunjungan', min: 1, max: 50, step: 1, value: 12, unit: 'panggilan' },
    { key: 'd', label: 'Durasi satu panggilan', min: 50, max: 3000, step: 50, value: 800, unit: 'ms' },
    { key: 'M', label: 'Memori fungsi', min: 0.5, max: 3, step: 0.5, value: 1, unit: 'GB' },
  ],
  compute(p) {
    return [
      { label: 'Waktu sampai live', value: live(p), unit: 's', digits: 0, main: true },
      { label: 'Waktu unggah', value: upload(p), unit: 's', digits: 1 },
      { label: 'Panggilan fungsi per hari', value: panggilan(p), unit: 'kali', digits: 0 },
      { label: 'Pemakaian per hari', value: gbDetik(p), unit: 'GB-detik', digits: 0 },
      { label: 'Pemakaian per bulan', value: (gbDetik(p) * 30) / 3600, unit: 'GB-jam', digits: 1 },
    ];
  },
  view: { camera: [4, 8, 15], target: [0, 1.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xb5bdd2 });
    const belt = mesh(new THREE.BoxGeometry(14, 0.25, 1.6), mat(0x2b3550), { y: 0.5 });
    scene.add(belt);
    const colors = [0x93b6ff, 0xffd36b, 0xffa36b, 0x5fd6c4];
    const xs = [-6, -2, 2, 6];
    const stations = xs.map((x, i) => {
      const s = mesh(new THREE.BoxGeometry(1.8, 1.8, 2.2), mat(colors[i], { emissive: colors[i], emissiveIntensity: 0.1 }), { x, y: 1.6 });
      const tag = label(STATIONS[i], { size: 0.45 });
      tag.position.set(x, 3.1, 0);
      scene.add(s, tag);
      return s;
    });
    // bola dunia + titik edge CDN
    const globe = mesh(new THREE.SphereGeometry(1.3, 32, 16), mat(0x1e5a6b, { roughness: 0.4, metalness: 0.2 }), { x: 6, y: 4.6 });
    scene.add(globe);
    const N = 10;
    const edges = Array.from({ length: N }, (_, i) => {
      const e = mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: 0x5fd6c4 }), { shadow: false });
      const a = (i / N) * Math.PI * 2, b = ((i % 3) - 1) * 0.6;
      e.position.set(6 + Math.cos(a) * Math.cos(b) * 1.35, 4.6 + Math.sin(b) * 1.35, Math.sin(a) * Math.cos(b) * 1.35);
      scene.add(e);
      return e;
    });
    const boxes = Array.from({ length: 5 }, () => {
      const b = mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), mat(0xe8eef9), { y: 0.95 });
      scene.add(b);
      return b;
    });
    const visitors = particles(80, 0xffd36b, 0.07);
    scene.add(visitors);
    const tag = label('', { size: 0.65 });
    tag.position.set(-1, 6.4, 0);
    scene.add(tag);

    return {
      update(p, t) {
        // satu paket melewati seluruh jalur dalam waktu ∝ T_live (dipercepat 10×)
        const loop = live(p) / 10;
        boxes.forEach((b, i) => {
          const f = ((t / loop) + i / boxes.length) % 1;
          b.position.x = -7 + f * 13;
          b.rotation.y = f * Math.PI;
          const k = Math.min(3, Math.floor(f * 4));
          b.material.color.setHex(colors[k]);
        });
        stations.forEach((s, i) => { s.scale.y = 1 + 0.05 * Math.sin(t * 4 + i); });
        globe.rotation.y = t * 0.3;
        // pengunjung datang ke edge, kepadatan ∝ panggilan per hari
        const active = Math.round(80 * Math.min(1, panggilan(p) / 20000));
        for (let i = 0; i < 80; i++) {
          const e = edges[i % N].position;
          const f = (t * 0.5 + i * 0.173) % 1;
          visitors.setAt(i, e.x + (e.x - 6) * (1 - f) * 2.5, e.y + (e.y - 4.6) * (1 - f) * 2.5, e.z + e.z * (1 - f) * 2.5, i < active ? 1 : 0);
        }
        visitors.instanceMatrix.needsUpdate = true;
        tag.setText(`Live dalam ${Math.round(live(p))} s`);
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Kamu men-deploy dengan "vercel --prod". Ukuran unggahan 40 MB, kecepatan unggah 20 Mbps, npm install 30 detik, dan build 15 detik. Dengan waktu antre 5 detik, berapa lama sampai versi baru live?',
      preset: { S: 40, B: 20, inst: 30, build: 15 },
      answer: 66, tolerance: 0.02, unit: 's',
      explain: 'Unggah = 8 × 40 / 20 = 16 s. T = 5 + 30 + 15 + 16 = 66 s. Menambahkan file besar (misalnya PDF contoh) ke .vercelignore mempercepat unggahan.',
    },
    {
      type: 'num', kind: 'Studi kasus',
      prompt: 'Dashboard monitoring dibuka 200 kali sehari. Setiap kunjungan memanggil /api/stat 12 kali (termasuk refresh otomatis), setiap panggilan berjalan 0,8 detik dengan memori 1 GB. Berapa GB-jam pemakaian fungsi dalam 30 hari?',
      preset: { V: 200, c: 12, d: 800, M: 1 },
      answer: 16, tolerance: 0.02, unit: 'GB-jam',
      explain: '200 × 12 × 0,8 × 1 = 1920 GB-detik per hari. × 30 = 57.600 GB-detik ÷ 3600 = 16 GB-jam per bulan.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Di mana sebaiknya password dashboard dan kunci service account Google disimpan?',
      options: [
        'Ditulis langsung di file JavaScript di folder public/ agar mudah dibaca',
        'Di-commit ke repo GitHub dalam file config.json',
        'Di Environment Variables Vercel, lalu dibaca lewat process.env hanya di dalam fungsi serverless (api/)',
        'Di localStorage browser setiap pengguna',
      ],
      answer: 2,
      explain: 'Semua file di public/ dan repo bisa dibaca orang lain. Environment variable hanya tersedia di sisi server. Di studi kasus, lib/auth.js membaca process.env.DASHBOARD_PASSWORD dan lib/stat-google.js membaca process.env.STAT_GOOGLE_SA.',
    },
  ],
};
