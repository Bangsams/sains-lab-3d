import { fig, pair } from '../lib/figures.js';

export default {
  id: 'sejarah-zaman-revolusi',
  subject: 'sejarah',
  reading: true,
  title: 'Zaman Revolusi: Mesin Uap, Kemerdekaan Amerika, dan Revolusi Prancis',
  period: '± 1750 – 1900',
  minutes: 4,
  tags: ['sejarah'],
  summary: 'Pabrik dan kereta api mengubah cara hidup, rakyat menuntut kebebasan, sementara Nusantara mengalami Tanam Paksa dan Perang Diponegoro.',
  article: `
    <h2>Revolusi Industri</h2>
    <p>Pada pertengahan abad ke-18, <strong>Inggris</strong> mulai memakai mesin untuk memintal dan menenun kain. James Watt menyempurnakan <strong>mesin uap</strong> sehingga jauh lebih hemat batu bara, dan mesin uap segera menggerakkan pabrik, kapal, dan kereta api. Kereta api umum pertama mulai beroperasi di Inggris pada 1825.</p>
    ${fig('rocket', 'Lokomotif uap <em>Rocket</em> buatan George dan Robert Stephenson (1829), kini di National Railway Museum, York, Inggris.')}
    <p>Orang desa berbondong-bondong pindah ke kota untuk bekerja di pabrik. Barang menjadi murah dan banyak, tetapi kondisi kerja sangat keras: jam kerja panjang, udara kotor, dan anak-anak ikut bekerja. Dari keadaan inilah lahir serikat buruh dan aturan kerja modern.</p>

    <h2>Revolusi Amerika dan Prancis</h2>
    <p>Tiga belas koloni Inggris di Amerika Utara menolak membayar pajak tanpa diberi wakil di parlemen. Pada <strong>4 Juli 1776</strong> mereka mengumumkan Deklarasi Kemerdekaan, lalu menang perang dan membentuk Amerika Serikat.</p>
    ${fig('deklarasi', 'Lukisan <em>Deklarasi Kemerdekaan</em> karya John Trumbull: naskah deklarasi diserahkan kepada Kongres pada 1776.')}
    <p>Di Prancis, rakyat kelaparan sementara bangsawan hidup mewah dan negara terlilit utang. Pada <strong>14 Juli 1789</strong> rakyat Paris menyerbu penjara <strong>Bastille</strong>, lambang kekuasaan raja. Revolusi Prancis menyebarkan semboyan <em>liberté, égalité, fraternité</em>: kebebasan, persamaan, dan persaudaraan. Setelah masa kacau, Napoleon Bonaparte berkuasa dan menaklukkan sebagian besar Eropa, termasuk Belanda.</p>
    ${fig('bastille', 'Penyerbuan Bastille, 14 Juli 1789, dilukis oleh Jean-Pierre Houël.')}
    <div class="fact"><strong>Tahukah kamu?</strong> Karena Belanda dikuasai Prancis, Napoleon mengirim Herman Willem Daendels ke Jawa. Daendels memerintahkan pembangunan Jalan Raya Pos dari Anyer sampai Panarukan, yang memakan banyak korban pekerja paksa.</div>

    <h2>Nusantara di bawah kolonialisme</h2>
    <p>Setelah VOC bangkrut dan dibubarkan pada akhir abad ke-18, wilayahnya diambil alih langsung oleh pemerintah Belanda menjadi <strong>Hindia Belanda</strong>. Pangeran <strong>Diponegoro</strong> memimpin perlawanan besar melawan Belanda di Jawa (1825–1830), dikenal sebagai Perang Jawa. Perang ini sangat mahal bagi Belanda.</p>
    ${fig('diponegoro', '<em>Penangkapan Pangeran Diponegoro</em> (1857), lukisan karya pelukis Indonesia Raden Saleh.')}
    <p>Untuk mengisi kas yang kosong, Gubernur Jenderal Van den Bosch memberlakukan <strong>Tanam Paksa</strong> (cultuurstelsel) mulai 1830: petani wajib menanam tanaman ekspor seperti kopi, tebu, dan nila untuk pemerintah. Belanda menjadi kaya, sedangkan banyak petani Jawa jatuh miskin dan kelaparan. Penderitaan itu digambarkan dalam novel <strong><em>Max Havelaar</em></strong> (1860) karya Multatuli, yang membuat banyak orang di Belanda menuntut perubahan.</p>
    ${fig('havelaar', 'Halaman judul edisi pertama <em>Max Havelaar</em> karya Multatuli (Amsterdam, 1860).')}

    <h2>Dunia yang makin terhubung</h2>
    <p>Menjelang 1900, listrik, telegraf, telepon, dan kapal uap membuat dunia terasa makin kecil. Terusan Suez (1869) memperpendek pelayaran Eropa–Asia. Perbudakan dihapuskan di banyak negara. Namun negara-negara industri juga berebut koloni di Afrika dan Asia, persaingan yang ikut memicu perang besar di abad berikutnya.</p>`,
  questions: [
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Di negara mana Revolusi Industri dimulai?', options: ['Prancis', 'Belanda', 'Inggris', 'Amerika Serikat'], answer: 2, explain: 'Inggris mulai memakai mesin pintal, mesin tenun, dan mesin uap pada pertengahan abad ke-18.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Peristiwa yang menjadi lambang dimulainya Revolusi Prancis adalah…', options: ['Penyerbuan penjara Bastille', 'Deklarasi Kemerdekaan', 'Pembukaan Terusan Suez', 'Pembangunan Jalan Raya Pos'], answer: 0, explain: 'Rakyat Paris menyerbu Bastille pada 14 Juli 1789.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Apa yang diwajibkan kepada petani dalam sistem Tanam Paksa?', options: ['Menanam padi untuk dijual sendiri', 'Menanam tanaman ekspor seperti kopi, tebu, dan nila untuk pemerintah', 'Bekerja di pabrik tekstil', 'Membayar pajak dengan emas'], answer: 1, explain: 'Hasilnya memperkaya Belanda, sementara banyak petani jatuh miskin.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Novel Max Havelaar karya Multatuli penting karena…', options: ['Menceritakan Revolusi Prancis', 'Menggambarkan penderitaan rakyat akibat Tanam Paksa sehingga banyak orang Belanda menuntut perubahan', 'Memuji VOC', 'Berisi petunjuk membuat mesin uap'], answer: 1, explain: 'Novel itu membuka mata publik Belanda tentang ketidakadilan di Hindia Belanda.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Siapa yang memimpin Perang Jawa (1825–1830) melawan Belanda?', options: ['Daendels', 'Van den Bosch', 'Pangeran Diponegoro', 'Gajah Mada'], answer: 2, explain: 'Pangeran Diponegoro memimpin perlawanan besar yang sangat mahal bagi Belanda.' },
  ],
};
