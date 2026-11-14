import { fig, pair } from '../lib/figures.js';

export default {
  id: 'sejarah-zaman-klasik',
  subject: 'sejarah',
  reading: true,
  title: 'Zaman Klasik: Yunani, Romawi, India, dan Tiongkok',
  period: '± 800 SM – 500 M',
  minutes: 4,
  tags: ['sejarah'],
  summary: 'Demokrasi Athena, jalan-jalan Romawi, Raja Ashoka, kaisar pertama Tiongkok, dan Jalur Sutra yang menghubungkan semuanya.',
  article: `
    <h2>Yunani: kota, filsafat, dan demokrasi</h2>
    <p>Yunani kuno bukan satu negara, melainkan banyak <strong>polis</strong> (negara-kota) seperti Athena dan Sparta. Sekitar 508 SM, Athena mulai menjalankan <strong>demokrasi</strong>: warga laki-laki dewasa boleh ikut memutuskan urusan kota dalam sidang rakyat. Perempuan, budak, dan pendatang belum diberi hak itu, tetapi gagasannya mengilhami pemerintahan modern.</p>
    <p>Athena juga melahirkan filsuf seperti <strong>Sokrates, Plato, dan Aristoteles</strong> yang bertanya tentang kebenaran, keadilan, dan alam. Pesta olahraga Olimpiade diadakan untuk menghormati Dewa Zeus. Murid Aristoteles, <strong>Aleksander Agung</strong>, menaklukkan wilayah dari Yunani sampai India dan menyebarkan budaya Yunani ke banyak bangsa.</p>
    ${fig('akropolis', 'Bukit Akropolis di Athena dengan kuil Parthenon di puncaknya.')}

    <h2>Roma: dari republik menjadi kekaisaran</h2>
    <p>Roma awalnya kota kecil di Italia yang menjadi <strong>republik</strong>, dipimpin pejabat pilihan dan senat. Setelah perang saudara, Augustus menjadi kaisar pertama dan Roma berubah menjadi <strong>kekaisaran</strong> yang menguasai sekeliling Laut Tengah. Bangsa Romawi terkenal sebagai insinyur: mereka membangun jalan batu, jembatan, akuaduk (saluran air), dan beton. Hukum Romawi menjadi dasar hukum banyak negara, termasuk sistem hukum Belanda yang diwarisi Indonesia.</p>
    ${fig('pontdugard', 'Pont du Gard di Prancis selatan: jembatan akuaduk Romawi yang mengalirkan air ke kota Nîmes.')}
    <p>Kekaisaran Romawi Barat runtuh pada <strong>476 M</strong>, ketika kaisar terakhirnya diturunkan oleh pemimpin suku Jermanik. Bagian timurnya, Bizantium dengan ibu kota Konstantinopel, bertahan hampir seribu tahun lagi.</p>

    <h2>India: Ashoka dan angka nol</h2>
    <p>Di India, Kekaisaran Maurya mencapai puncaknya di bawah <strong>Raja Ashoka</strong>. Setelah melihat penderitaan akibat perang Kalinga yang ia menangkan, Ashoka menyesal, memeluk agama Buddha, dan menyebarkan ajaran tanpa kekerasan lewat prasasti di seluruh negerinya. Pada masa Dinasti Gupta, matematikawan India mengembangkan sistem angka desimal dengan <strong>angka nol</strong>, yang kelak sampai ke Eropa melalui dunia Islam.</p>
    ${fig('ashoka', 'Tiang Ashoka di Vaishali, India, dengan patung singa di puncaknya.')}

    <h2>Tiongkok: kaisar pertama dan Jalur Sutra</h2>
    <p>Pada 221 SM, <strong>Qin Shi Huang</strong> menyatukan Tiongkok dan menjadi kaisar pertamanya. Ia menyeragamkan tulisan, ukuran, dan mata uang, memulai pembangunan tembok pertahanan yang menjadi cikal bakal Tembok Besar, dan dimakamkan bersama ribuan patung prajurit tanah liat: <strong>Tentara Terakota</strong>.</p>
    ${fig('terakota', 'Barisan Tentara Terakota yang menjaga makam Qin Shi Huang di Xi’an, Tiongkok.')}
    <p>Dinasti Han sesudahnya membuka <strong>Jalur Sutra</strong>, jaringan rute dagang darat dari Tiongkok sampai Laut Tengah. Melalui jalur ini sutra, rempah, kuda, agama, dan gagasan berpindah antarbenua. Pada masa Han pula, pejabat istana <strong>Cai Lun</strong> menyempurnakan pembuatan kertas.</p>
    <div class="fact"><strong>Tahukah kamu?</strong> Pada masa yang sama, Nusantara sudah ikut berdagang jarak jauh. Nekara perunggu dari kebudayaan Dong Son (Vietnam utara) ditemukan di banyak pulau Indonesia.</div>`,
  questions: [
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Kota Yunani kuno yang mulai menjalankan demokrasi sekitar 508 SM adalah…', options: ['Sparta', 'Athena', 'Roma', 'Konstantinopel'], answer: 1, explain: 'Di Athena, warga laki-laki dewasa boleh ikut memutuskan urusan kota dalam sidang rakyat.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Mengapa Raja Ashoka memeluk agama Buddha?', options: ['Karena kalah perang', 'Karena menyesal melihat penderitaan akibat perang Kalinga', 'Karena dipaksa Aleksander Agung', 'Karena ingin berdagang di Jalur Sutra'], answer: 1, explain: 'Setelah perang Kalinga, Ashoka menyesal dan menyebarkan ajaran tanpa kekerasan.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Apa yang terjadi pada tahun 476 M menurut bacaan?', options: ['Roma menjadi republik', 'Kekaisaran Romawi Barat runtuh', 'Qin Shi Huang menyatukan Tiongkok', 'Olimpiade pertama'], answer: 1, explain: 'Kaisar Romawi Barat terakhir diturunkan; bagian timur (Bizantium) bertahan lebih lama.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Apa fungsi Jalur Sutra?', options: ['Tembok pertahanan Tiongkok', 'Jaringan rute dagang darat dari Tiongkok sampai Laut Tengah untuk barang dan gagasan', 'Saluran air Romawi', 'Jalan menuju makam kaisar'], answer: 1, explain: 'Sutra, rempah, kuda, agama, dan gagasan berpindah antarbenua melalui Jalur Sutra.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Penemuan India yang kelak sampai ke Eropa melalui dunia Islam adalah…', options: ['Kertas', 'Beton', 'Sistem angka desimal dengan angka nol', 'Akuaduk'], answer: 2, explain: 'Matematikawan India masa Gupta mengembangkan angka desimal dengan nol.' },
  ],
};
