import { mat, mesh, ground, label, particles } from '../lib/helpers.js';
import lab from '../labs/kata-sandi.js';

const bits = (p) => p.L * Math.log2(p.N);
const avgSeconds = (p) => 2 ** bits(p) / 2 / 10 ** p.rate;
function human(s) {
  const u = [['tahun', 3.156e7], ['hari', 86400], ['jam', 3600], ['menit', 60], ['detik', 1]];
  if (s < 1) return 'seketika';
  const [n, k] = u.find(([, k]) => s >= k);
  const v = s / k;
  return v > 1e6 ? `${v.toExponential(1).replace('.', ',')} ${n}` : `${Math.round(v).toLocaleString('id-ID')} ${n}`;
}
const SETS = [[10, 'angka saja (0–9)'], [26, 'huruf kecil'], [36, 'huruf kecil + angka'], [52, 'huruf besar + kecil'], [62, 'huruf + angka'], [95, 'huruf + angka + simbol']];

export default {
  id: 'kata-sandi',
  subject: 'siber',
  title: 'Kekuatan Kata Sandi & Hashing',
  tags: ['sehari-hari', 'web'],
  summary: 'Mengapa "bismillah" bisa ditebak dalam sekejap, tetapi kalimat sandi panjang butuh jutaan tahun. Dilengkapi lab kode untuk menguji dan menyimpan kata sandi dengan aman.',
  story: `
    <p><strong>Studi kasus: Kebocoran akun e-learning sekolah.</strong> Sebuah forum peretas membagikan ribuan akun siswa. Penyelidikan menunjukkan server menyimpan kata sandi tanpa hash, dan banyak siswa memakai sandi seperti <code>123456</code> atau nama sekolah.</p>
    <p>Penyerang yang mencuri database tidak perlu menebak lewat form login. Ia mencoba miliaran kemungkinan per detik dengan kartu grafis (GPU) secara <em>offline</em>. Itulah sebabnya kekuatan sandi diukur dalam <strong>bit entropi</strong>: setiap tambahan 1 bit menggandakan jumlah tebakan yang dibutuhkan.</p>
    <p>Di sisi server, kata sandi tidak boleh disimpan apa adanya. Server menyimpan <em>hash</em> (sidik jari satu arah) yang dicampur <em>salt</em> acak per pengguna, idealnya dengan fungsi lambat seperti bcrypt atau Argon2. Di sisi pengguna, autentikasi dua faktor (2FA) menambah lapisan kedua jika sandi tetap bocor.</p>`,
  concept: 'H = L · log₂ N &nbsp;·&nbsp; Kombinasi = N<sup>L</sup> = 2<sup>H</sup> &nbsp;·&nbsp; t<sub>rata-rata</sub> = 2<sup>H</sup> / (2 · laju)',
  conceptNote: 'Rumus ini berlaku untuk sandi yang benar-benar acak. Sandi buatan manusia (nama, tanggal lahir, kata umum) jauh lebih lemah karena penyerang mencoba daftar kata (dictionary attack) lebih dulu.',
  equations: [
    {
      f: 'H = L · log₂ N', meaning: 'Entropi: berapa kali kita harus "melempar koin" untuk menebak sandi. Panjang sandi berpengaruh lebih besar daripada jenis karakter.',
      symbols: [['H', 'Entropi', 'bit'], ['L', 'Panjang kata sandi', 'karakter'], ['N', 'Banyaknya pilihan karakter', 'jenis']],
    },
    {
      f: 't = 2<sup>H</sup> / (2 · laju)', meaning: 'Rata-rata penyerang menemukan sandi setelah mencoba separuh dari semua kemungkinan.',
      symbols: [['t', 'Waktu rata-rata brute force', 'detik'], ['laju', 'Tebakan per detik (bergantung perangkat & fungsi hash)', 'tebakan/s']],
    },
    {"f":"Kombinasi = N<sup>L</sup> = 2<sup>H</sup>","meaning":"Jumlah semua kemungkinan sandi. Menambah satu karakter mengalikan kombinasi dengan N.","symbols":[["N<sup>L</sup>","N dipangkatkan L","kemungkinan"]]},
  ],
  params: [
    { key: 'L', label: 'Panjang kata sandi', min: 4, max: 24, step: 1, value: 8, unit: 'karakter' },
    { key: 'N', label: 'Jenis karakter', type: 'select', value: 62, options: SETS.map(([v, l]) => ({ value: v, label: `${l} (${v})` })) },
    { key: 'rate', label: 'Laju tebakan 10^x per detik', min: 3, max: 12, step: 1, value: 10, unit: '' },
  ],
  compute(p) {
    const h = bits(p);
    return [
      { label: 'Waktu tebak rata-rata', value: human(avgSeconds(p)), text: true, main: true },
      { label: 'Entropi', value: h, unit: 'bit', digits: 1 },
      { label: 'Jumlah kombinasi (log₁₀)', value: h * Math.log10(2), unit: 'digit', digits: 1 },
      { label: 'Kategori', value: h < 28 ? 'Sangat lemah' : h < 36 ? 'Lemah' : h < 60 ? 'Sedang' : 'Kuat', text: true },
    ];
  },
  view: { camera: [0, 4, 11], target: [0, 1.8, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xa9b0b8 });
    // gembok kombinasi: satu cincin per karakter
    const body = mesh(new THREE.BoxGeometry(10.5, 1.6, 1.6), mat(0x39424e, { metalness: 0.7, roughness: 0.35 }), { y: 1.6 });
    scene.add(body);
    const shackle = mesh(new THREE.TorusGeometry(1.4, 0.18, 12, 40, Math.PI), mat(0xc0c8d0, { metalness: 0.9 }), { y: 2.4 });
    scene.add(shackle);
    const dials = Array.from({ length: 24 }, (_, i) => {
      const d = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.36, 12), mat(0x5fd6c4, { metalness: 0.5 }), { y: 1.6, z: 0.85 });
      d.rotation.x = Math.PI / 2;
      scene.add(d); return d;
    });
    const shield = mesh(new THREE.SphereGeometry(4.2, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x86e0a8, transparent: true, opacity: 0.12, side: THREE.DoubleSide }), { y: 0, shadow: false });
    scene.add(shield);
    const guesses = particles(120, 0xff8f8f, 0.06);
    scene.add(guesses);
    const tag = label('', { size: 0.5 });
    tag.position.set(0, 5, 0);
    scene.add(tag);
    return {
      update(p, t) {
        const h = bits(p), w = 0.42;
        dials.forEach((d, i) => {
          d.visible = i < p.L;
          d.position.x = (i - (p.L - 1) / 2) * w;
          d.rotation.y = t * (2 + i * 0.7) * (p.rate / 6);
        });
        const strong = Math.min(1, h / 80);
        shield.scale.setScalar(0.6 + strong * 0.5);
        shield.material.color.setHSL(strong * 0.33, 0.7, 0.6);
        shield.material.opacity = 0.08 + strong * 0.2;
        for (let i = 0; i < 120; i++) {
          const a = i * 2.39996, f = (t * (0.2 + p.rate / 12) + i * 0.0731) % 1;
          const r = 9 - f * (9 - shield.scale.x * 4.2);
          guesses.setAt(i, Math.cos(a) * r, 0.5 + (i % 7) * 0.5, Math.sin(a) * r * 0.6, i < 20 + p.rate * 8 ? 1 : 0);
        }
        guesses.instanceMatrix.needsUpdate = true;
        shackle.position.y = 2.4 + (avgSeconds(p) < 3600 ? Math.abs(Math.sin(t * 2)) * 0.4 : 0);
        tag.setText(`${h.toFixed(1)} bit · ${human(avgSeconds(p))}`);
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Kata sandi 8 karakter yang hanya memakai huruf kecil acak (N = 26). Berapa bit entropinya?',
      preset: { L: 8, N: 26 }, answer: 37.6, tolerance: 0.01, unit: 'bit',
      explain: 'H = 8 × log₂ 26 = 8 × 4,70 = 37,6 bit.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'PIN 6 digit (N = 10) diserang dengan 1.000 tebakan per detik. Berapa detik waktu rata-rata untuk menebaknya?',
      preset: { L: 6, N: 10, rate: 3 }, answer: 500, tolerance: 0.01, unit: 'detik',
      explain: '10⁶ kombinasi; rata-rata ditemukan setelah separuhnya: 500.000 / 1.000 = 500 detik. Karena itu aplikasi bank mengunci akun setelah beberapa kali salah.',
    },
    {
      stem: 'M', type: 'mcq', kind: 'Konsep',
      prompt: 'Sandi huruf+angka (N = 62). Menambah SATU karakter membuat jumlah kombinasi menjadi…',
      options: ['Bertambah 62', 'Dua kali lipat', '62 kali lipat', 'Tetap'], answer: 2,
      explain: 'Kombinasi = N^L. Dari 62^L ke 62^(L+1) berarti dikali 62 (≈ +5,95 bit). Panjang adalah cara termurah menambah kekuatan.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Mengapa server menambahkan salt acak sebelum melakukan hash kata sandi?',
      options: ['Agar hash lebih pendek', 'Agar dua pengguna dengan sandi sama punya hash berbeda dan tabel hash siap pakai (rainbow table) tidak berguna', 'Agar sandi bisa didekripsi kembali', 'Agar login lebih cepat'], answer: 1,
      explain: 'Tanpa salt, hash "123456" selalu sama sehingga penyerang cukup mencocokkan dengan tabel. Salt unik memaksa penyerang menebak ulang untuk setiap akun.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Kata sandimu bocor di situs lain. Teknologi apa yang paling efektif mencegah penyerang masuk ke akun e-mail sekolahmu?',
      options: ['Mengganti foto profil', 'Autentikasi dua faktor (2FA) dengan aplikasi authenticator atau kunci keamanan', 'Memakai mode penyamaran browser', 'Menghapus riwayat browser'], answer: 1,
      explain: 'Dengan 2FA, penyerang juga butuh kode sekali pakai dari perangkatmu. Kunci keamanan (FIDO2/passkey) bahkan tahan terhadap phishing.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Kamu merancang database pengguna aplikasi sekolah. Cara menyimpan kata sandi yang paling tepat adalah…',
      options: ['Teks asli agar bisa dikirim ulang jika lupa', 'Dienkripsi AES dengan kunci di server yang sama', 'Hash lambat khusus sandi (bcrypt/scrypt/Argon2) dengan salt unik per pengguna', 'SHA-256 tanpa salt'], answer: 2,
      explain: 'Fungsi hash sandi sengaja dibuat lambat dan boros memori, sehingga laju tebakan GPU turun dari miliaran menjadi ribuan per detik. Fitur "lupa sandi" cukup mengirim tautan reset.',
    },
  ],
  lab,
};
