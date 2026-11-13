export default {
  id: 'sejarah-dunia-modern',
  subject: 'sejarah',
  reading: true,
  title: 'Perang Dingin sampai Era Digital',
  period: '1947 – sekarang',
  minutes: 4,
  tags: ['sejarah'],
  summary: 'Persaingan Amerika dan Uni Soviet, manusia ke Bulan, runtuhnya Tembok Berlin, Reformasi 1998, dan dunia yang terhubung internet.',
  article: `
    <h2>Perang Dingin</h2>
    <p>Setelah Perang Dunia II, dua negara adidaya muncul: <strong>Amerika Serikat</strong> yang kapitalis dan <strong>Uni Soviet</strong> yang komunis. Keduanya tidak pernah berperang langsung satu sama lain, karena itulah disebut <strong>Perang Dingin</strong>. Mereka bersaing lewat perlombaan senjata nuklir, mata-mata, bantuan kepada negara lain, dan perang di negara ketiga seperti Korea dan Vietnam. Kota Berlin di Jerman dibelah oleh <strong>Tembok Berlin</strong> yang dibangun pada 1961.</p>

    <h2>Perlombaan ke luar angkasa</h2>
    <p>Persaingan juga terjadi di angkasa. Pada 1957 Uni Soviet meluncurkan <strong>Sputnik</strong>, satelit buatan pertama. Pada 1961 <strong>Yuri Gagarin</strong> menjadi manusia pertama yang mengorbit Bumi. Amerika membalas dengan program Apollo, dan pada 20 Juli 1969 <strong>Neil Armstrong</strong> menjadi manusia pertama yang menjejakkan kaki di Bulan.</p>
    <div class="fact"><strong>Tahukah kamu?</strong> Indonesia meluncurkan satelit komunikasi Palapa A1 pada 1976, menjadi salah satu negara berkembang pertama yang punya sistem satelit domestik. Namanya diambil dari Sumpah Palapa Gajah Mada.</div>

    <h2>Akhir Perang Dingin</h2>
    <p>Ekonomi Uni Soviet melemah, dan rakyat di Eropa Timur menuntut kebebasan. Pada <strong>9 November 1989</strong> warga Berlin meruntuhkan Tembok Berlin; Jerman bersatu kembali setahun kemudian. Pada akhir 1991 Uni Soviet bubar menjadi 15 negara, dan Perang Dingin berakhir.</p>

    <h2>Indonesia: dari Orde Baru ke Reformasi</h2>
    <p>Indonesia melewati masa Orde Lama di bawah Soekarno dan Orde Baru di bawah Soeharto, yang membawa pembangunan ekonomi tetapi membatasi kebebasan politik. Krisis moneter Asia 1997–1998 membuat rupiah anjlok dan harga melonjak. Mahasiswa turun ke jalan, dan pada Mei 1998 Soeharto mengundurkan diri. Masa <strong>Reformasi</strong> membawa kebebasan pers, pemilu yang lebih demokratis, dan pemilihan presiden secara langsung sejak 2004.</p>

    <h2>Era digital</h2>
    <p>Komputer yang dulu sebesar ruangan kini muat di saku. Jaringan komputer ARPANET di Amerika (1969) berkembang menjadi internet, dan pada 1989 ilmuwan Inggris <strong>Tim Berners-Lee</strong> di laboratorium CERN menciptakan <strong>World Wide Web</strong> yang membuat internet mudah dipakai semua orang. Ponsel pintar, media sosial, dan kecerdasan buatan mengubah cara kita belajar, bekerja, dan berteman.</p>
    <p>Dunia sekarang menghadapi tantangan bersama: perubahan iklim, pandemi seperti COVID-19 yang melanda sejak 2020, dan pertanyaan tentang bagaimana teknologi dipakai dengan adil. Sejarah mengajarkan bahwa perubahan besar selalu membawa peluang sekaligus risiko, dan pilihan manusialah yang menentukan arahnya.</p>`,
  questions: [
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Mengapa persaingan Amerika Serikat dan Uni Soviet disebut "Perang Dingin"?', options: ['Karena terjadi di kutub utara', 'Karena kedua negara tidak pernah berperang langsung satu sama lain', 'Karena terjadi di musim dingin', 'Karena memakai senjata es'], answer: 1, explain: 'Mereka bersaing lewat senjata, mata-mata, angkasa, dan perang di negara ketiga, tanpa perang langsung.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Apa nama satelit buatan pertama di dunia?', options: ['Apollo', 'Palapa A1', 'Sputnik', 'ARPANET'], answer: 2, explain: 'Uni Soviet meluncurkan Sputnik pada 1957.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Peristiwa 9 November 1989 yang menjadi lambang akhir Perang Dingin adalah…', options: ['Pendaratan di Bulan', 'Runtuhnya Tembok Berlin', 'Bubarnya PBB', 'Peluncuran Palapa'], answer: 1, explain: 'Warga Berlin meruntuhkan tembok; Jerman bersatu kembali setahun kemudian.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Siapa pencipta World Wide Web?', options: ['Neil Armstrong', 'Yuri Gagarin', 'Tim Berners-Lee', 'Soeharto'], answer: 2, explain: 'Tim Berners-Lee menciptakannya pada 1989 di laboratorium CERN.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Menurut bacaan, apa yang dibawa masa Reformasi di Indonesia?', options: ['Kembalinya Orde Lama', 'Kebebasan pers, pemilu lebih demokratis, dan pemilihan presiden langsung', 'Tanam Paksa', 'Bergabung dengan Uni Soviet'], answer: 1, explain: 'Setelah Soeharto mundur pada Mei 1998, Indonesia memasuki masa Reformasi.' },
  ],
};
