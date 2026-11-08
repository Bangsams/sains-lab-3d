import { mat, mesh, ground, label, particles } from '../lib/helpers.js';
import lab from '../labs/injeksi-sql.js';

const vuln = (p) => Math.round(p.E * (1 - p.safe / 100));
const pBreach = (p) => 1 - (1 - p.q / 100) ** vuln(p);

export default {
  id: 'injeksi-sql',
  subject: 'siber',
  title: 'SQL Injection & Validasi Input',
  tags: ['web'],
  summary: 'Satu tanda kutip di form login bisa membuka seluruh database. Lab kode: serang form yang rentan lalu tambal dengan prepared statement.',
  story: `
    <p><strong>Studi kasus: Portal nilai sekolah.</strong> Seorang siswa iseng mengetik <code>admin' --</code> di kolom username, dan berhasil masuk sebagai admin tanpa password. Ia juga bisa melihat nilai semua siswa hanya dengan mengubah alamat halaman.</p>
    <p>Penyebabnya, program menyusun perintah SQL dengan <em>menempelkan</em> teks dari pengguna: <code>"... WHERE username = '" + input + "'"</code>. Tanda kutip dari input menutup string lebih awal, dan sisanya dibaca database sebagai perintah. Tanda <code>--</code> membuat sisa perintah (pemeriksaan password) menjadi komentar.</p>
    <p>Penangkalnya adalah <strong>prepared statement</strong> (placeholder <code>?</code>): perintah SQL dan data dikirim terpisah sehingga input tidak pernah dieksekusi. Ditambah validasi input, akun database dengan hak minimum, dan pesan galat yang tidak membocorkan detail. Injeksi tetap masuk daftar OWASP Top 10 risiko aplikasi web.</p>`,
  concept: 'V = E · (1 − s) &nbsp;·&nbsp; P(bobol) = 1 − (1 − q)<sup>V</sup>',
  conceptNote: 'Model peluang ini menganggap setiap celah diserang secara independen. Pesannya: satu celah saja sudah cukup, jadi semua titik input harus diamankan, bukan sebagian.',
  equations: [
    {
      f: 'V = E · (1 − s)', meaning: 'Banyaknya titik input yang masih rentan: semua form/parameter dikurangi yang sudah memakai prepared statement.',
      symbols: [['V', 'Titik input rentan', 'buah'], ['E', 'Semua titik input yang menyentuh database', 'buah'], ['s', 'Bagian yang sudah aman', '%']],
    },
    {
      f: 'P(bobol) = 1 − (1 − q)<sup>V</sup>', meaning: 'Peluang minimal satu celah berhasil dieksploitasi dalam setahun. Peluang "aman" untuk setiap celah dikalikan, lalu dikurangkan dari 1.',
      symbols: [['P', 'Peluang terjadi pembobolan', '%'], ['q', 'Peluang satu celah ditemukan & dieksploitasi per tahun', '%']],
    },
  ],
  params: [
    { key: 'E', label: 'Titik input ke database', min: 1, max: 60, step: 1, value: 20, unit: 'buah' },
    { key: 'safe', label: 'Memakai prepared statement', min: 0, max: 100, step: 5, value: 60, unit: '%' },
    { key: 'q', label: 'Peluang tiap celah dieksploitasi', min: 1, max: 100, step: 1, value: 30, unit: '%/tahun' },
  ],
  compute(p) {
    return [
      { label: 'Peluang dibobol dalam setahun', value: pBreach(p) * 100, unit: '%', digits: 1, main: true },
      { label: 'Titik input rentan', value: vuln(p), unit: 'buah', digits: 0 },
      { label: 'Perkiraan insiden per tahun', value: vuln(p) * (p.q / 100), unit: 'kali', digits: 1 },
    ];
  },
  view: { camera: [0, 7, 13], target: [0, 1.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xa9b0b8 });
    // database (silinder bertumpuk) di tengah
    const dbMat = mat(0x5f87b3, { metalness: 0.4 });
    [0, 0.9, 1.8].forEach((y) => scene.add(mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.8, 32), dbMat, { y: 0.45 + y })));
    const leak = particles(60, 0xffd36b, 0.08);
    scene.add(leak);
    // titik input: kotak form melingkar
    const forms = Array.from({ length: 60 }, () => { const f = mesh(new THREE.BoxGeometry(0.5, 0.35, 0.08), mat(0x86e0a8)); scene.add(f); return f; });
    const attacker = mesh(new THREE.IcosahedronGeometry(0.6, 0), mat(0xff5d5d, { emissive: 0x401010 }), { x: -7, y: 4 });
    scene.add(attacker);
    const shots = particles(40, 0xff8f8f, 0.07);
    scene.add(shots);
    const tag = label('', { size: 0.5 });
    tag.position.set(0, 4.6, 0);
    scene.add(tag);
    const greenM = mat(0x86e0a8), redM = mat(0xff5d5d, { emissive: 0x330808 });
    return {
      update(p, t) {
        const v = vuln(p);
        const pos = [];
        forms.forEach((f, i) => {
          f.visible = i < p.E;
          const a = (i / p.E) * Math.PI * 2;
          f.position.set(Math.cos(a) * 4.2, 1.2 + (i % 3) * 0.6, Math.sin(a) * 4.2);
          f.lookAt(0, f.position.y, 0);
          f.material = i < v ? redM : greenM; // celah rentan berwarna merah
          if (i < v) pos.push(f.position);
        });
        attacker.rotation.y = t; attacker.rotation.x = t * 0.7;
        for (let i = 0; i < 40; i++) {
          const f = (t * 0.5 + i * 0.137) % 1;
          const target = pos.length ? pos[i % pos.length] : new THREE.Vector3(Math.cos(i) * 4.2, 1.5, Math.sin(i) * 4.2);
          const stop = pos.length ? 1 : 0.85; // tanpa celah, serangan terpental sebelum menyentuh form
          const k = Math.min(f, stop);
          shots.setAt(i, -7 + (target.x + 7) * k, 4 + (target.y - 4) * k, target.z * k, f > stop ? 0 : 1);
        }
        shots.instanceMatrix.needsUpdate = true;
        for (let i = 0; i < 60; i++) {
          const f = (t * 0.4 + i * 0.173) % 1;
          leak.setAt(i, Math.cos(i * 2.4) * f * 6, 2 + f * 2.5, Math.sin(i * 2.4) * f * 6, i < v * 3 ? 1 : 0);
        }
        leak.instanceMatrix.needsUpdate = true;
        tag.setText(`${v} celah · peluang bobol ${(pBreach(p) * 100).toFixed(1)}%`);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung', integer: true,
      prompt: 'Aplikasi sekolah punya 20 titik input yang menyentuh database, dan 60% sudah memakai prepared statement. Berapa titik yang masih rentan?',
      preset: { E: 20, safe: 60 }, answer: 8, tolerance: 0, unit: 'buah',
      explain: 'V = 20 × (1 − 0,6) = 8 titik input.',
    },
    {
      stem: 'M', type: 'num', kind: 'Studi kasus',
      prompt: 'Dari 8 titik rentan, masing-masing berpeluang 30% dieksploitasi dalam setahun. Berapa persen peluang aplikasi dibobol minimal sekali?',
      preset: { E: 20, safe: 60, q: 30 }, answer: 94.2, tolerance: 0.01, unit: '%',
      explain: 'P = 1 − 0,7⁸ = 1 − 0,0576 = 0,942 → 94,2%. Meski tiap celah "hanya" 30%, gabungannya hampir pasti.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: "Mengapa input  ' OR '1'='1  bisa membuat query login mengembalikan semua pengguna?",
      options: ['Karena database rusak', "Tanda kutip menutup string lebih awal, lalu  OR '1'='1'  menjadi bagian kondisi WHERE yang selalu bernilai benar", 'Karena password 1 adalah password admin', 'Karena huruf besar/kecil diabaikan'], answer: 1,
      explain: "Query menjadi  WHERE username = '' OR '1'='1' AND ...  sehingga kondisi bernilai TRUE untuk setiap baris. Input dianggap kode, bukan data.",
    },
    {
      stem: 'M', type: 'mcq', kind: 'Logika',
      prompt: 'Dalam SQL, AND dikerjakan lebih dulu daripada OR. Jika A = FALSE, B = FALSE, C = TRUE, berapa nilai  A AND B OR C?',
      options: ['FALSE', 'TRUE', 'Tidak bisa ditentukan', 'Galat'], answer: 1,
      explain: '(A AND B) OR C = (FALSE) OR TRUE = TRUE. Inilah sebabnya OR yang disisipkan penyerang mengalahkan pemeriksaan password yang di-AND.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Mengapa prepared statement (placeholder ?) mencegah SQL injection?',
      options: ['Karena input dienkripsi', 'Karena struktur perintah SQL dikirim dan diurai lebih dulu, lalu input dikirim terpisah sebagai nilai data yang tidak pernah dieksekusi', 'Karena tanda kutip dihapus otomatis dari database', 'Karena query menjadi lebih cepat'], answer: 1,
      explain: 'Database sudah tahu bentuk perintahnya sebelum menerima data, sehingga apa pun isi input, ia hanya dibandingkan sebagai nilai.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Selain prepared statement, langkah rekayasa mana yang menerapkan prinsip "defense in depth" untuk portal nilai?',
      options: ['Menampilkan pesan galat SQL lengkap ke pengguna agar mudah di-debug', 'Akun database aplikasi hanya diberi hak SELECT/INSERT yang dibutuhkan, validasi input, dan pencatatan (logging) percobaan aneh', 'Memakai satu akun root untuk semua aplikasi', 'Menyembunyikan form login'], answer: 1,
      explain: 'Jika satu lapisan gagal, lapisan lain membatasi kerusakan. Akun berhak minimum tidak bisa DROP TABLE, dan log membantu mendeteksi serangan sejak awal.',
    },
  ],
  lab,
};
