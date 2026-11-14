import { fig, pair } from '../lib/figures.js';

export default {
  id: 'sejarah-renaisans-penjelajahan',
  subject: 'sejarah',
  reading: true,
  title: 'Renaisans, Penjelajahan Samudra, dan Jalur Rempah',
  period: '± 1450 – 1750',
  minutes: 5,
  tags: ['sejarah'],
  summary: 'Seni dan sains bangkit di Eropa, kapal-kapal berlayar mencari cengkih dan pala Maluku, dan dunia mulai saling terhubung lewat laut.',
  article: `
    <h2>Kelahiran kembali</h2>
    <p><em>Renaisans</em> berarti "kelahiran kembali". Mulai abad ke-14–15 di kota-kota Italia seperti Firenze, orang kembali mempelajari karya Yunani dan Romawi serta menaruh perhatian besar pada manusia dan alam. Seniman seperti <strong>Leonardo da Vinci</strong> dan <strong>Michelangelo</strong> menggabungkan seni dengan pengamatan anatomi dan teknik.</p>
    ${fig('monalisa', '<em>Mona Lisa</em> karya Leonardo da Vinci (awal abad ke-16), Museum Louvre, Paris.')}
    <p>Sekitar 1450, <strong>Johannes Gutenberg</strong> di Jerman mengembangkan mesin cetak dengan huruf logam yang bisa disusun ulang. Buku yang dulu disalin tangan berbulan-bulan kini bisa dicetak ratusan eksemplar. Gagasan baru, termasuk kritik terhadap gereja yang memicu Reformasi Protestan, menyebar jauh lebih cepat.</p>
    ${fig('gutenberg', 'Alkitab Gutenberg, salah satu buku pertama yang dicetak dengan huruf logam lepas, di New York Public Library.')}

    <h2>Mencari jalan laut ke negeri rempah</h2>
    <p>Pada 1453, Konstantinopel direbut Kesultanan <strong>Utsmaniyah</strong>. Perdagangan dengan Asia lewat darat dikuasai perantara, sehingga harga rempah di Eropa sangat mahal. <strong>Cengkih</strong> saat itu hanya tumbuh di pulau-pulau kecil Maluku Utara, dan <strong>pala</strong> hanya di Kepulauan Banda. Rempah dipakai untuk mengawetkan dan membumbui makanan, sebagai obat, dan sebagai lambang kekayaan.</p>
    ${fig('pala', 'Buah pala dan fuli (selaput merahnya) dari Kepulauan Banda.')}
    <p>Kerajaan Portugal dan Spanyol pun berlomba mencari jalan laut. Vasco da Gama dari Portugal mengitari Afrika dan tiba di India pada 1498. Portugis merebut Malaka pada 1511 dan sampai di Maluku setahun kemudian. Sementara itu, Christopher Columbus yang berlayar ke barat untuk Spanyol pada 1492 justru tiba di kepulauan Karibia, benua yang belum dikenal orang Eropa. Ekspedisi Ferdinand Magelhaens yang diselesaikan Juan Sebastián Elcano (1519–1522) menjadi pelayaran pertama yang mengelilingi bumi.</p>
    <p>Belanda menyusul dan pada 1602 mendirikan <strong>VOC</strong>, kongsi dagang yang diberi hak membuat perjanjian, membangun benteng, bahkan berperang. VOC berusaha memonopoli rempah Nusantara, sering dengan kekerasan, dan menjadikan Batavia (Jakarta) sebagai pusatnya.</p>
    ${fig('batavia', 'Kastel Batavia, markas VOC, dilukis oleh Andries Beeckman sekitar 1656.')}

    <h2>Pertukaran antarbenua</h2>
    <p>Pelayaran ini memindahkan tanaman, hewan, dan penyakit antara Amerika dan dunia lama. Jagung, kentang, tomat, dan <strong>cabai</strong> berasal dari Amerika lalu menyebar ke seluruh dunia, termasuk ke dapur Indonesia. Sebaliknya, penyakit seperti cacar yang dibawa orang Eropa menewaskan sebagian besar penduduk asli Amerika.</p>
    <div class="fact"><strong>Tahukah kamu?</strong> Sambal dan rendang yang pedas baru mungkin setelah cabai dari Amerika tiba di Nusantara kira-kira 500 tahun lalu. Sebelumnya, rasa pedas didapat dari lada dan cabai jawa.</div>

    <h2>Revolusi ilmiah</h2>
    <p>Cara orang memahami alam juga berubah. <strong>Nicolaus Copernicus</strong> mengusulkan bahwa Bumi dan planet-planet mengelilingi Matahari, bukan sebaliknya. <strong>Galileo Galilei</strong> memakai teleskop untuk mengamati bulan-bulan Jupiter, dan <strong>Isaac Newton</strong> menjelaskan gerak dan gravitasi. Pengamatan dan percobaan menjadi cara utama untuk mencari kebenaran tentang alam.</p>
    ${fig('galileo', 'Potret Galileo Galilei karya Justus Sustermans (1636).')}`,
  questions: [
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Apa arti kata "Renaisans"?', options: ['Penjelajahan', 'Kelahiran kembali', 'Perdagangan', 'Kemerdekaan'], answer: 1, explain: 'Renaisans berarti kelahiran kembali minat pada karya Yunani-Romawi, manusia, dan alam.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Menurut bacaan, mengapa bangsa Eropa berlomba mencari jalan laut ke Asia?', options: ['Untuk mencari tempat tinggal baru', 'Karena jalur darat dikuasai perantara sehingga rempah sangat mahal, dan mereka ingin mendapatkannya langsung', 'Karena kapal lebih cepat dari kuda', 'Untuk menghindari Wabah Hitam'], answer: 1, explain: 'Setelah 1453, perdagangan darat dikuasai perantara; jalan laut memungkinkan membeli rempah langsung.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Pada masa itu pala hanya tumbuh di…', options: ['Kepulauan Banda', 'Pulau Jawa', 'India', 'Karibia'], answer: 0, explain: 'Cengkih dari Maluku Utara, sedangkan pala dari Kepulauan Banda.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Tanaman manakah yang menurut bacaan berasal dari Amerika lalu sampai ke dapur Indonesia?', options: ['Lada', 'Cengkih', 'Cabai', 'Pala'], answer: 2, explain: 'Cabai, jagung, kentang, dan tomat berasal dari Amerika.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Apa itu VOC?', options: ['Kerajaan di Maluku', 'Kongsi dagang Belanda yang berusaha memonopoli rempah Nusantara', 'Kapal Columbus', 'Gereja Protestan'], answer: 1, explain: 'VOC didirikan 1602 dan berpusat di Batavia.' },
  ],
};
