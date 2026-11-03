import code from './mesin-penilai.code.js';

export default {
  title: 'Jalankan inti mesin penilai post test',
  intro: 'Tiga bagian terpenting <code>posttest-engine.js</code>: <code>norm()</code> menyeragamkan teks, <code>numbersIn()</code> + <code>close()</code> mencocokkan angka dengan kunci jawaban beserta toleransinya, dan <code>decision()</code> membaca keputusan "H0 ditolak/diterima" dari kalimat kesimpulan.',
  file: 'posttest-engine.js',
  lang: 'js',
  code,
  source: 'Sumber: <code>public/assets/posttest-engine.js</code> Datmin Automation APP, baris 12–22, 174–195, 305–332. Kode asli, hanya indentasinya dirapikan. Blok "Uji coba" di bawahnya boleh kamu ubah.',
  tasks: [
    'Ganti kalimat kesimpulan menjadi <code>H0 gagal ditolak</code>. Apa keputusan yang terbaca sekarang?',
    'Ubah kunci <code>t</code> menjadi <code>3.22</code>, lalu <code>3.30</code>. Mana yang masih dianggap cocok oleh <code>close()</code>, dan mengapa?',
    'Tulis p-value dengan notasi ilmiah: <code>p-value = 3.2e-3</code>. Apakah kunci p tetap ditemukan?',
    'Tambahkan kalimat bersyarat <code>Jika p &lt; 0.05 maka H0 ditolak.</code> sebelum kesimpulan <code>H0 diterima</code>. Keputusan mana yang dipakai mesin?',
    'Uji keadilan S3: hapus <code>.replace(/[‐-―−]/g, \'-\')</code> di <code>norm()</code>. Apa yang terjadi pada angka <code>−3.214</code> yang memakai tanda minus Unicode?',
  ],
};
