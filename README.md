# Lab Sains 3D

Aplikasi web pembelajaran **Fisika, Kimia, Biologi, dan Teknik Roket & Antariksa**. Soal-soalnya berangkat dari kehidupan sehari-hari, industri, energi, dan keberlanjutan di Indonesia.

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

## Menjalankan secara lokal

Aplikasi ini berupa situs statis tanpa langkah build (three.js dimuat dari CDN lewat import map).

```bash
npm install        # hanya untuk skrip pemeriksaan
npm run dev        # buka http://localhost:5173
npm run check      # validasi semua topik dan soal
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
  subject: 'fisika',              // fisika | kimia | biologi | aerospace
  title: 'Judul Topik',
  tags: ['energi', 'industri'],   // sehari-hari | industri | energi | keberlanjutan
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
    { type: 'num', kind: 'Hitung', prompt: '…', preset: { v: 3 }, answer: 6, tolerance: 0.02, unit: 'm', explain: '…' },
    { type: 'mcq', kind: 'Konsep', prompt: '…', options: ['A', 'B'], answer: 1, explain: '…' },
  ],
};
```

Lalu daftarkan di `src/topics/index.js` dan jalankan `npm run check`. Fungsi bantu 3D (label, partikel, panah, material) tersedia di `src/lib/helpers.js`.

`npm run build:single` membuat `dist/standalone.html`, versi satu file yang bisa dibuka atau dibagikan tanpa server.

## Catatan

Angka memakai model yang disederhanakan untuk pembelajaran (misalnya faktor emisi jaringan 0,85 kg CO₂/kWh dan nilai kalor bawah bahan bakar). Progres soal disimpan di `localStorage` peramban.
