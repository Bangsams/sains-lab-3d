export default {
  id: 'sejarah-abad-pertengahan',
  subject: 'sejarah',
  reading: true,
  title: 'Abad Pertengahan: Kastel, Ilmuwan Muslim, dan Kerajaan Nusantara',
  period: '± 500 – 1450 M',
  minutes: 5,
  tags: ['sejarah'],
  summary: 'Ksatria dan Wabah Hitam di Eropa, Rumah Kebijaksanaan di Baghdad, kekaisaran Mongol, serta kejayaan Sriwijaya, Borobudur, dan Majapahit.',
  article: `
    <h2>Eropa: raja, ksatria, dan gereja</h2>
    <p>Setelah Romawi Barat runtuh, Eropa terpecah menjadi banyak kerajaan kecil. Masyarakat diatur dengan sistem <strong>feodal</strong>: raja memberi tanah kepada bangsawan, bangsawan dilindungi ksatria, dan petani menggarap tanah sebagai imbalan perlindungan. Gereja sangat berpengaruh; biara menjadi tempat menyalin buku dan menyimpan pengetahuan. Antara 1096 dan 1291 terjadi serangkaian <strong>Perang Salib</strong> untuk memperebutkan Yerusalem.</p>
    <p>Bencana terbesar zaman ini adalah <strong>Wabah Hitam</strong> (1347–1351), penyakit pes yang dibawa kutu tikus melalui jalur dagang. Diperkirakan sekitar sepertiga penduduk Eropa meninggal. Karena pekerja menjadi langka, petani yang selamat bisa menuntut upah lebih tinggi, dan sistem feodal perlahan melemah.</p>

    <h2>Zaman keemasan Islam</h2>
    <p>Islam lahir di Makkah pada awal abad ke-7 dan dalam waktu singkat menyebar dari Spanyol sampai Asia Tengah. Di <strong>Baghdad</strong>, para khalifah Abbasiyah mendirikan <strong>Bayt al-Hikmah</strong> (Rumah Kebijaksanaan), tempat karya Yunani, Persia, dan India diterjemahkan dan dikembangkan. <strong>Al-Khawarizmi</strong> menulis buku yang melahirkan kata "aljabar", dan namanya menjadi asal kata "algoritma". <strong>Ibnu Sina</strong> menulis ensiklopedia kedokteran yang dipakai di universitas Eropa selama berabad-abad.</p>

    <h2>Mongol: kekaisaran dari padang rumput</h2>
    <p>Pada awal abad ke-13, <strong>Jenghis Khan</strong> menyatukan suku-suku Mongol. Pasukan berkudanya membangun kekaisaran darat bersambung terbesar dalam sejarah, dari Korea sampai Eropa Timur. Penaklukannya sangat kejam, tetapi setelahnya Jalur Sutra menjadi relatif aman, sehingga pedagang seperti Marco Polo dapat berkelana dari Venesia ke Tiongkok.</p>

    <h2>Nusantara: kerajaan maritim dan candi megah</h2>
    <p>Dari Palembang, <strong>Sriwijaya</strong> (sejak abad ke-7) menguasai Selat Malaka dan menjadi pusat dagang serta pusat belajar agama Buddha. Biksu Tiongkok <strong>I-Tsing</strong> singgah di sana untuk belajar bahasa Sanskerta sebelum melanjutkan perjalanan ke India.</p>
    <p>Di Jawa Tengah, wangsa <strong>Syailendra</strong> membangun <strong>Candi Borobudur</strong> pada abad ke-8–9, candi Buddha terbesar di dunia, dengan ribuan panel relief yang bercerita. Tak jauh dari sana berdiri Candi Prambanan yang bercorak Hindu.</p>
    <p>Pada 1293, Raden Wijaya mendirikan <strong>Majapahit</strong> di Jawa Timur. Mahapatih <strong>Gajah Mada</strong> terkenal dengan <strong>Sumpah Palapa</strong>: ia bersumpah tidak akan menikmati palapa (kesenangan) sebelum menyatukan Nusantara. Kitab Negarakertagama karya Mpu Prapanca mencatat wilayah pengaruh Majapahit yang sangat luas.</p>
    <div class="fact"><strong>Tahukah kamu?</strong> Semboyan negara kita, <em>Bhinneka Tunggal Ika</em>, berasal dari kitab Sutasoma karya Mpu Tantular dari zaman Majapahit.</div>`,
  questions: [
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Menurut bacaan, apa salah satu akibat Wabah Hitam bagi masyarakat Eropa?', options: ['Penduduk Eropa bertambah dua kali lipat', 'Pekerja menjadi langka sehingga petani bisa menuntut upah lebih tinggi dan feodalisme melemah', 'Perang Salib dimulai', 'Gereja kehilangan semua bukunya'], answer: 1, explain: 'Sekitar sepertiga penduduk meninggal; kelangkaan pekerja mengubah hubungan petani dan bangsawan.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Ilmuwan yang namanya menjadi asal kata "algoritma" adalah…', options: ['Ibnu Sina', 'Al-Khawarizmi', 'Marco Polo', 'Mpu Prapanca'], answer: 1, explain: 'Al-Khawarizmi bekerja di lingkungan Baghdad dan bukunya juga melahirkan kata "aljabar".' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Mengapa biksu I-Tsing singgah di Sriwijaya?', options: ['Untuk berdagang sutra', 'Untuk belajar bahasa Sanskerta sebelum ke India', 'Untuk membangun Borobudur', 'Untuk menjadi raja'], answer: 1, explain: 'Sriwijaya adalah pusat belajar agama Buddha yang penting.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Wangsa yang membangun Candi Borobudur adalah…', options: ['Syailendra', 'Majapahit', 'Abbasiyah', 'Mongol'], answer: 0, explain: 'Wangsa Syailendra membangun Borobudur pada abad ke-8–9 di Jawa Tengah.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Apa isi Sumpah Palapa Gajah Mada?', options: ['Tidak akan berperang lagi', 'Tidak akan menikmati kesenangan sebelum menyatukan Nusantara', 'Akan membangun candi terbesar', 'Akan berlayar ke Tiongkok'], answer: 1, explain: 'Palapa berarti kesenangan; Gajah Mada bersumpah menundanya sampai Nusantara bersatu.' },
  ],
};
