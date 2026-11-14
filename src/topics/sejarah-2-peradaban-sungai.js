import { fig, pair } from '../lib/figures.js';

export default {
  id: 'sejarah-peradaban-sungai',
  subject: 'sejarah',
  reading: true,
  title: 'Peradaban Sungai: Mesopotamia, Mesir, Indus, dan Tiongkok',
  period: '± 3500 – 1000 SM',
  minutes: 4,
  tags: ['sejarah'],
  summary: 'Mengapa kota-kota pertama tumbuh di tepi sungai, bagaimana tulisan ditemukan, dan rahasia piramida serta Batu Rosetta.',
  article: `
    <h2>Mengapa di tepi sungai?</h2>
    <p>Peradaban besar pertama lahir di lembah sungai: Tigris dan Efrat, Nil, Indus, dan Sungai Kuning. Sungai memberi air untuk irigasi, tanah subur dari lumpur banjir, ikan, serta jalur perahu untuk berdagang. Mengatur air untuk ribuan petani membutuhkan kerja sama, aturan, dan pemimpin, sehingga desa berkembang menjadi kota dan negara.</p>

    <h2>Mesopotamia: negeri di antara dua sungai</h2>
    <p>Di wilayah yang kini Irak, bangsa <strong>Sumeria</strong> membangun kota seperti Uruk dan Ur. Sekitar 3200 SM mereka menciptakan <strong>tulisan paku</strong> (kuneiform): tanda berbentuk baji yang ditekan pada lempeng tanah liat. Awalnya tulisan dipakai untuk mencatat gandum dan ternak, lalu berkembang untuk surat, hukum, dan cerita seperti Epos Gilgamesh. Bangsa Sumeria juga sudah memakai roda dan menghitung dengan bilangan berbasis 60, yang jejaknya masih kita pakai: 60 menit dalam satu jam.</p>
    ${fig('kuneiform', 'Lempeng tanah liat bertulisan paku dari bangsa Sumeria (masa Ur III).')}
    <p>Belakangan, Raja <strong>Hammurabi</strong> dari Babilonia memahat kumpulan hukumnya pada sebuah tiang batu. Kode Hammurabi adalah salah satu kumpulan hukum tertulis tertua yang masih utuh.</p>
    ${fig('hammurabi', 'Tiang batu Kode Hammurabi di Museum Louvre, Paris. Di bagian atas, Hammurabi digambarkan berdiri di hadapan dewa matahari Shamash.')}

    <h2>Mesir: hadiah Sungai Nil</h2>
    <p>Setiap tahun Sungai Nil meluap dan meninggalkan lumpur hitam yang subur, sehingga Mesir disebut "hadiah Sungai Nil". Mesir diperintah raja bergelar <strong>firaun</strong> yang dianggap setengah dewa. Untuk makam para firaun dibangun piramida; yang terbesar adalah Piramida Agung Khufu di Giza. Orang Mesir menulis dengan <strong>hieroglif</strong>, tulisan bergambar, pada dinding kuil dan kertas papirus.</p>
    ${fig('piramida', 'Piramida Agung Khufu di Giza, Mesir, dibangun sekitar 4.500 tahun lalu.')}
    <div class="fact"><strong>Tahukah kamu?</strong> Selama berabad-abad tidak ada yang bisa membaca hieroglif. Kuncinya adalah <strong>Batu Rosetta</strong>, ditemukan tahun 1799, yang memuat teks sama dalam hieroglif dan bahasa Yunani. Dengan membandingkannya, Jean-François Champollion berhasil memecahkan hieroglif pada 1822.</div>
    ${fig('rosetta', 'Batu Rosetta di British Museum, London. Teks yang sama ditulis dalam hieroglif, demotik, dan Yunani kuno.')}

    <h2>Lembah Indus: kota yang tertata rapi</h2>
    <p>Di Pakistan dan India barat laut berdiri kota <strong>Harappa</strong> dan <strong>Mohenjo-daro</strong>. Jalannya lurus berpola kotak, rumahnya dari bata dengan ukuran seragam, dan ada saluran pembuangan air yang tertutup: perencanaan kota yang sangat maju untuk zamannya. Uniknya, tulisan Lembah Indus sampai sekarang <strong>belum bisa dibaca</strong> siapa pun.</p>
    ${fig('mohenjodaro', 'Reruntuhan kota Mohenjo-daro di Pakistan dengan bangunan bata yang tertata rapi.')}

    <h2>Tiongkok: Sungai Kuning</h2>
    <p>Di sepanjang Sungai Kuning muncul Dinasti Shang. Para peramal menulis pertanyaan kepada leluhur pada tulang hewan dan cangkang kura-kura, lalu memanaskannya dan membaca retakannya. Tulisan pada "tulang ramalan" itu adalah cikal bakal aksara Tionghoa yang masih dipakai hingga hari ini. Orang Tiongkok kuno juga sudah memelihara ulat sutra dan menenun kain sutra.</p>
    ${fig('tulangramal', 'Tulang ramalan Dinasti Shang dengan tulisan Tionghoa kuno yang digoreskan di permukaannya.')}`,
  questions: [
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Menurut bacaan, mengapa peradaban pertama tumbuh di lembah sungai?', options: ['Karena sungai melindungi dari musuh saja', 'Karena sungai memberi air irigasi, tanah subur, ikan, dan jalur dagang', 'Karena di gunung terlalu dingin', 'Karena sungai menyimpan emas'], answer: 1, explain: 'Air, lumpur subur, makanan, dan jalur perahu membuat desa di tepi sungai berkembang menjadi kota.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Tulisan paku (kuneiform) diciptakan oleh bangsa…', options: ['Mesir', 'Sumeria', 'Harappa', 'Shang'], answer: 1, explain: 'Bangsa Sumeria di Mesopotamia menciptakannya sekitar 3200 SM pada lempeng tanah liat.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Apa peran Batu Rosetta dalam sejarah?', options: ['Batu fondasi piramida', 'Kunci untuk membaca hieroglif karena memuat teks yang sama dalam hieroglif dan bahasa Yunani', 'Tiang tempat Kode Hammurabi dipahat', 'Batu ramalan Dinasti Shang'], answer: 1, explain: 'Dengan membandingkan teksnya, Champollion memecahkan hieroglif pada 1822.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Hal apa tentang peradaban Lembah Indus yang masih menjadi misteri?', options: ['Letak kotanya', 'Bahan bangunannya', 'Tulisannya belum bisa dibaca', 'Sungai tempat mereka tinggal'], answer: 2, explain: 'Kota Harappa dan Mohenjo-daro sudah diteliti, tetapi tulisannya belum terpecahkan.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Raja Babilonia yang terkenal karena kumpulan hukum tertulisnya adalah…', options: ['Khufu', 'Gilgamesh', 'Hammurabi', 'Champollion'], answer: 2, explain: 'Kode Hammurabi dipahat pada tiang batu dan termasuk hukum tertulis tertua yang masih utuh.' },
  ],
};
