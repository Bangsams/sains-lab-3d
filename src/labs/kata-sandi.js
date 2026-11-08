import { pasangPenguji } from './uji-keamanan.js';

const code = String.raw`// Lab Keamanan Siber 1: pemeriksa kekuatan kata sandi + penyimpanan dengan salt & hash.
// Semua berjalan di sandbox peramban, tidak ada data yang dikirim ke mana pun.
// Jangan mengetik kata sandi asli milikmu di sini.
const crypto = require('crypto');

// 1) Ukuran himpunan karakter yang dipakai kata sandi
function ukuranHimpunan(pw) {
  let n = 0;
  if (/[a-z]/.test(pw)) n += 26;
  if (/[A-Z]/.test(pw)) n += 26;
  if (/[0-9]/.test(pw)) n += 10;
  // TANTANGAN 1: tambahkan 33 jika ada simbol (karakter selain huruf & angka)
  return n;
}

// 2) Entropi (bit) = panjang × log2(ukuran himpunan)
function entropi(pw) {
  const n = ukuranHimpunan(pw);
  return n ? pw.length * Math.log2(n) : 0;
}

// 3) Penilaian kekuatan
function nilaiKekuatan(pw) {
  // TANTANGAN 2: kata sandi yang ada di daftar KATA_UMUM (abaikan huruf besar/kecil)
  //              harus selalu dinilai 'sangat lemah'
  const h = entropi(pw);
  if (h < 28) return 'sangat lemah';
  if (h < 36) return 'lemah';
  if (h < 60) return 'sedang';
  return 'kuat';
}

// 4) Waktu brute force rata-rata (detik) untuk laju tebakan tertentu
function waktuTebak(pw, laju) {
  return Math.pow(2, entropi(pw)) / 2 / laju;
}

// 5) Simpan kata sandi sebagai salt + hash (jangan pernah simpan teks aslinya!)
function buatSalt() {
  // TANTANGAN 3: salt harus acak dan berbeda untuk setiap pengguna,
  //              misalnya crypto.randomBytes(16).toString('hex')
  return 'garam-tetap';
}
function hashKataSandi(pw, salt) {
  return crypto.createHash('sha256').update(salt + ':' + pw).digest('hex');
}
function simpanPengguna(pw) {
  const salt = buatSalt();
  return { salt, hash: hashKataSandi(pw, salt) };
}
function cocok(pw, akun) {
  const a = Buffer.from(hashKataSandi(pw, akun.salt), 'hex');
  const b = Buffer.from(akun.hash, 'hex');
  return crypto.timingSafeEqual(a, b); // waktu perbandingan tidak membocorkan isi hash
}

// ---------- Coba sendiri: ganti contoh di bawah ----------
for (const contoh of ['bismillah', 'Indonesia', 'Kopi-Susu_2026']) {
  const tahun = waktuTebak(contoh, 1e10) / 3.15e7;
  console.log(contoh.padEnd(16), entropi(contoh).toFixed(1).padStart(5), 'bit', nilaiKekuatan(contoh).padEnd(12), '≈', tahun.toExponential(1), 'tahun @10 miliar tebakan/detik');
}
console.log('Disimpan di database:', simpanPengguna('rahasia123'));

// ---------- Uji keamanan otomatis (jangan diubah) ----------
uji('Simbol dihitung dalam himpunan karakter', () => ukuranHimpunan('a!') === 59 || 'ukuranHimpunan("a!") = ' + ukuranHimpunan('a!'));
uji('Kata sandi umum dinilai sangat lemah', () => nilaiKekuatan('bismillah') === 'sangat lemah' || 'bismillah dinilai ' + nilaiKekuatan('bismillah'));
uji('Daftar umum tidak peka huruf besar', () => nilaiKekuatan('Indonesia') === 'sangat lemah' || 'Indonesia dinilai ' + nilaiKekuatan('Indonesia'));
uji('Kata sandi panjang & beragam tetap kuat', () => nilaiKekuatan('Kopi-Susu_2026!xyz') === 'kuat');
uji('Salt berbeda untuk setiap pengguna', () => simpanPengguna('sama').salt !== simpanPengguna('sama').salt);
uji('Sandi sama → hash berbeda (tahan rainbow table)', () => simpanPengguna('sama').hash !== simpanPengguna('sama').hash);
uji('Login benar diterima, salah ditolak', () => { const a = simpanPengguna('rahasia123'); return cocok('rahasia123', a) && !cocok('rahasia124', a); });
ringkasan();`;

function setup(G) {
  G.KATA_UMUM = ['123456', 'password', '12345678', 'qwerty', 'admin', 'iloveyou', 'indonesia', 'bismillah', 'sayang', 'rahasia', 'garuda', 'merdeka45'];
  // tambahkan crypto.randomBytes memakai Web Crypto milik peramban
  const asli = G.require;
  G.require = (n) => {
    const m = asli(n);
    if (n === 'crypto' && !m.randomBytes) m.randomBytes = (k) => G.Buffer.from(G.crypto.getRandomValues(new Uint8Array(k)));
    return m;
  };
}

export default {
  title: 'Pemeriksa kekuatan kata sandi & penyimpanan aman',
  intro: 'Lengkapi fungsi pemeriksa kata sandi dan penyimpanan dengan <code>salt</code> + <code>SHA-256</code>, lalu tekan <strong>▶ Jalankan</strong>. Uji keamanan di bagian bawah langsung memberi tahu celah mana yang masih terbuka (<code>✗ GAGAL</code>) dan mana yang sudah tertutup (<code>✓ LULUS</code>). Variabel <code>KATA_UMUM</code> berisi daftar kata sandi yang paling sering bocor.',
  file: 'kata-sandi.js',
  lang: 'js',
  code,
  setup: [pasangPenguji, setup],
  source: 'Kode latihan Sams Lab. Berjalan di iframe sandbox tanpa akses jaringan; <code>crypto</code> dan <code>Buffer</code> adalah tiruan kecil dari modul Node.js.',
  tasks: [
    'Jalankan dulu tanpa mengubah apa pun. Uji mana saja yang gagal?',
    'Tantangan 1: hitung simbol (<code>/[^a-zA-Z0-9]/</code>) sebagai tambahan 33 karakter.',
    'Tantangan 2: di <code>nilaiKekuatan</code>, kembalikan <code>\'sangat lemah\'</code> jika <code>KATA_UMUM.includes(pw.toLowerCase())</code>.',
    'Tantangan 3: ganti salt tetap dengan <code>crypto.randomBytes(16).toString(\'hex\')</code>. Mengapa hash dua pengguna dengan sandi sama kini berbeda?',
    'Bonus: ubah laju tebakan dari 1e10 menjadi 1e12 (rig GPU besar). Berapa panjang minimal agar tebakan tetap butuh >100 tahun?',
  ],
};
