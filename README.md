# Sams Lab

Aplikasi web pembelajaran **STEM** (Sains, Teknologi, Engineering, Matematika): **Fisika, Kimia, Biologi, Teknik Roket & Antariksa, Coding & Cloud, Teknik Industri, Semikonduktor & Chip, dan Keamanan Siber**. Pengguna masuk dengan **akun Google**, dan progres serta riwayat soal tersimpan per akun. Soal-soalnya berangkat dari kehidupan sehari-hari, industri, energi, dan keberlanjutan di Indonesia.

Setiap topik berisi:

- **Simulasi 3D interaktif** (Three.js). Parameternya bisa diubah dengan slider, dan hasil hitungannya langsung diperbarui.
- **Cerita / studi kasus** beserta rumus konsep.
- **Soal** (pilihan ganda dan isian angka) bertipe *Cerita*, *Studi kasus*, *Hitung*, dan *Konsep*. Setiap soal punya tombol **"Tampilkan situasi ini di 3D"** yang mengatur model 3D sesuai kondisi soal, lalu menampilkan pembahasan setelah jawaban diperiksa.

| Bidang | Topik |
|---|---|
| Fisika | Panel Surya Atap Rumah · Turbin Angin Sidrap · Rem Regeneratif Kendaraan Listrik |
| Kimia | Elektrolisis Hidrogen Hijau · Stoikiometri Emisi Bahan Bakar · Paket Baterai Litium |
| Biologi | Fotosintesis Hutan Kota · Mikroalga untuk Biofuel · Fermentasi Bioetanol Tebu |
| Teknik Roket | Persamaan Roket Tsiolkovsky · Orbit Satelit dan Internet · Gaya Dorong dan Lepas Landas |
| Coding & Cloud | Membuat Kode Mesin Penilai Otomatis · Konfigurasi & Deploy ke Vercel · Integrasi Google Sheets & Drive API · API Unduhan PDF Bertahap |
| Teknik Industri | Rantai Pasok & Persediaan (EOQ) · Pengendalian Kualitas (SPC & Cpk) · Perencanaan & Pengendalian Produksi (PPIC) |
| Semikonduktor | Pembuatan Chip: Wafer, Die & Yield · Cara Kerja Transistor MOSFET · Fotolitografi |
| Keamanan Siber | Kekuatan Kata Sandi & Hashing · SQL Injection & Validasi Input · Audit Jaringan: Pemindaian Port & Firewall (semua dengan Lab Kode + uji keamanan otomatis) |

Setiap soal berlabel **S / T / E / M**, dan setiap topik punya keempat jenis soal. Soal STEM tambahan untuk topik lama ada di `src/topics/stem-extra.js`.

Di beranda, setiap bidang tampil sebagai dropdown yang bisa dibuka-tutup, dan kepala situs punya **Menu belajar** untuk lompat langsung ke topik mana pun.

Topik Coding & Cloud memakai studi kasus **Datmin Automation APP** (monitoring & simulasi keadilan penilaian Statistika 2): struktur kode, `vercel.json`, environment variable, service account Google, kuota API, dan pengunduhan PDF per potongan.

Setiap topik Coding & Cloud juga punya **Lab Kode**: IDE mini (nomor baris, pewarnaan sintaks, konsol, maksimal 100 baris) yang berisi potongan **kode asli** proyek penilaian otomatis, beserta tantangan untuk diubah dan dijalankan. Kode dijalankan di iframe sandbox tanpa akses jaringan. Server, Google API, dan tanda tangan RSA diganti tiruan. Kode lab ada di `src/labs/*.code.js` (dibuat dari sumber asli) dan `src/labs/*.js` (tantangan + server tiruan), sedangkan mesin IDE ada di `src/lib/ide.js`.

## Akun Google & riwayat soal

- Frontend memakai **Google Identity Services** (tombol "Sign in with Google").
- `api/session.js` memverifikasi ID token Google lalu membuat cookie sesi HttpOnly bertanda tangan HMAC.
- `api/progress.js` menyimpan progres dan riwayat jawaban sebagai satu file JSON **privat** per akun di **Vercel Blob** (store `sams-lab-progress`).
- Progres lama di `localStorage` otomatis dipindahkan ke akun saat pertama kali masuk.

Variabel lingkungan di Vercel:

| Nama | Isi |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth Client ID (Web application) dari Google Cloud Console. Authorized JavaScript origin: `https://sains-lab-3d.vercel.app`. Selama belum diisi, aplikasi berjalan dalam mode tamu. |
| `BLOB_READ_WRITE_TOKEN` | Dibuat otomatis saat Blob store dihubungkan ke proyek. |
| `SESSION_SECRET` | Opsional. Jika kosong, kunci sesi diturunkan dari token Blob. |

## Menjalankan secara lokal

Situs statis tanpa langkah build (three.js dimuat dari CDN lewat import map), ditambah fungsi di folder `api/`.

```bash
npm install
npm run dev        # http://localhost:5173 · login lokal tanpa Google, progres disimpan di memori
npm run check      # validasi semua topik, soal, dan label STEM
```

## Deploy ke Vercel

1. Impor repositori ini di [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Other**. Build command: kosong. Output directory: `.` (root).
3. Klik **Deploy**. Setiap `git push` ke branch utama akan otomatis men-deploy ulang.

## Menambah atau memperbarui topik

Semua konten ada di `src/topics/`. Satu file berisi satu topik:

```js
export default {
  id: 'nama-topik',               // huruf kecil dan tanda hubung, dipakai di URL (#nama-topik)
  subject: 'fisika',              // fisika | kimia | biologi | aerospace | coding | industri | semikonduktor | siber
  title: 'Judul Topik',
  tags: ['energi', 'industri'],   // sehari-hari | industri | energi | keberlanjutan | web
  summary: 'Ringkasan satu kalimat.',
  story: '<p>Cerita atau studi kasus (HTML).</p>',
  concept: 'Rumus utama (HTML)',
  conceptNote: 'Catatan tambahan.',
  equations: [                    // setiap rumus + artinya dalam bahasa mudah
    { f: 's = v · t', meaning: 'Jarak = kecepatan dikali waktu.', symbols: [['s', 'Jarak', 'm'], ['v', 'Kecepatan', 'm/s'], ['t', 'Waktu', 's']] },
  ],
  params: [{ key: 'v', label: 'Kecepatan', min: 0, max: 10, step: 0.1, value: 5, unit: 'm/s' }],
  compute(p) { return [{ label: 'Hasil', value: p.v * 2, unit: 'm', digits: 1, main: true }]; },
  view: { camera: [6, 4, 8], target: [0, 1, 0] },
  scene({ THREE, scene }) {
    // susun objek 3D di sini
    return { update(p, t, dt) { /* animasi per frame */ } };
  },
  questions: [
    { stem: 'M', type: 'num', kind: 'Hitung', prompt: '…', preset: { v: 3 }, answer: 6, tolerance: 0.02, unit: 'm', explain: '…' },
    { stem: 'S', type: 'mcq', kind: 'Konsep', prompt: '…', options: ['A', 'B'], answer: 1, explain: '…' },
  ],
};
```

Lalu daftarkan di `src/topics/index.js` dan jalankan `npm run check`. Fungsi bantu 3D (label, partikel, panah, material) tersedia di `src/lib/helpers.js`.

`npm run build:single` membuat `dist/standalone.html`, versi satu file yang bisa dibuka atau dibagikan tanpa server.

## Catatan

Angka memakai model yang disederhanakan untuk pembelajaran (misalnya faktor emisi jaringan 0,85 kg CO₂/kWh dan nilai kalor bawah bahan bakar). Progres soal disimpan per akun Google (atau di `localStorage` saat mode tamu).
