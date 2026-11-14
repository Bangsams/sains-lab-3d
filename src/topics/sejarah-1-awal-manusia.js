// Bacaan sejarah: hanya teks + soal pemahaman (tanpa rumus, simulasi, atau hitungan).
import { fig, pair } from '../lib/figures.js';

export default {
  id: 'sejarah-awal-manusia',
  subject: 'sejarah',
  reading: true,
  title: 'Awal Manusia dan Revolusi Pertanian',
  period: '± 300.000 tahun lalu – 3000 SM',
  minutes: 4,
  tags: ['sejarah'],
  summary: 'Dari pemburu-pengumpul di Afrika, Manusia Jawa dan "hobbit" Flores, lukisan gua Sulawesi, sampai ladang dan desa pertama.',
  article: `
    <h2>Lahir di Afrika</h2>
    <p>Kisah kita dimulai di Afrika. Fosil <em>Homo sapiens</em> tertua yang dikenal, dari Jebel Irhoud di Maroko, berumur sekitar 300.000 tahun. Selama puluhan ribu tahun nenek moyang kita hidup sebagai <strong>pemburu-pengumpul</strong>: berpindah-pindah mengikuti hewan buruan dan musim buah, membuat alat dari batu, dan memakai api untuk memasak serta menghangatkan diri.</p>
    <p>Sekitar 70.000–60.000 tahun lalu, kelompok-kelompok manusia mulai menyebar keluar Afrika: ke Asia, Eropa, lalu Australia. Jalan menuju Australia melewati kepulauan yang sekarang menjadi Indonesia, sehingga Nusantara sejak awal adalah "jembatan" perjalanan manusia.</p>

    <h2>Nusantara, rumah manusia purba</h2>
    <p>Jauh sebelum <em>Homo sapiens</em> datang, Jawa sudah dihuni manusia purba lain. Pada 1891 dokter Belanda <strong>Eugène Dubois</strong> menemukan fosil di Trinil, tepi Bengawan Solo, yang kemudian dikenal sebagai "Manusia Jawa" (<em>Pithecanthropus erectus</em>, kini <em>Homo erectus</em>). Situs Sangiran di Jawa Tengah menyimpan begitu banyak fosil sehingga diakui UNESCO sebagai Warisan Dunia.</p>
    ${pair(fig('trinil', 'Tempurung kepala "Manusia Jawa" temuan Eugène Dubois di Trinil, kini di Museum Naturalis, Leiden.'), fig('floresiensis', 'Tengkorak Homo floresiensis ("hobbit") dari Liang Bua, Flores, dalam koleksi museum.'))}
    <p>Pada 2003 tim peneliti Indonesia–Australia menemukan kerangka manusia bertubuh sangat kecil di gua <strong>Liang Bua, Flores</strong>. Spesies ini dinamai <em>Homo floresiensis</em> dan dijuluki "hobbit". Penemuan itu menunjukkan bahwa pada masa lalu beberapa jenis manusia pernah hidup di bumi pada waktu yang hampir bersamaan.</p>
    <div class="fact"><strong>Tahukah kamu?</strong> Beberapa lukisan gua tertua di dunia ada di Maros–Pangkep, Sulawesi Selatan. Salah satunya, gambar babi kutil di Leang Tedongnge, berumur setidaknya 45.000 tahun: lebih tua daripada lukisan gua terkenal di Eropa.</div>
    ${fig('maros', 'Cap tangan purba di dinding Gua Leang Pettakere, Maros, Sulawesi Selatan.')}

    <h2>Revolusi pertanian</h2>
    <p>Sekitar 10.000 SM terjadi perubahan terbesar dalam cara hidup manusia. Di <strong>Bulan Sabit Subur</strong>, wilayah melengkung dari Mesir dan Levant sampai Irak, orang mulai menanam gandum dan jelai serta memelihara kambing dan domba. Pertanian juga ditemukan secara terpisah di tempat lain: padi dan jewawut di Tiongkok, jagung di Meksiko, serta talas dan pisang di dataran tinggi Papua.</p>
    <p>Karena ladang harus dijaga, manusia mulai <strong>menetap</strong>. Muncullah desa seperti Yerikho dan Çatalhöyük. Panen yang bisa disimpan menghasilkan kelebihan makanan, sehingga tidak semua orang harus bertani. Ada yang menjadi pembuat tembikar, pedagang, pendeta, atau pemimpin. Dari desa-desa inilah kelak tumbuh kota, kerajaan, dan peradaban.</p>
    ${fig('catalhoyuk', 'Situs penggalian Çatalhöyük di Turki, salah satu permukiman petani tertua di dunia.')}
    <p>Pertanian juga membawa masalah baru: kerja lebih berat, penyakit menular lebih mudah menyebar di permukiman padat, dan muncul perebutan tanah. Meski begitu, tanpa revolusi pertanian tidak akan ada kota, tulisan, maupun sejarah tertulis.</p>`,
  questions: [
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Menurut bacaan, di benua mana Homo sapiens pertama kali muncul?', options: ['Asia', 'Eropa', 'Afrika', 'Australia'], answer: 2, explain: 'Fosil Homo sapiens tertua yang dikenal berasal dari Jebel Irhoud, Maroko, Afrika.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Siapa yang menemukan fosil "Manusia Jawa" di Trinil pada 1891?', options: ['Eugène Dubois', 'Charles Darwin', 'Ralph von Koenigswald', 'Alfred Wallace'], answer: 0, explain: 'Dokter Belanda Eugène Dubois menemukannya di tepi Bengawan Solo, Trinil.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Di mana Homo floresiensis ("hobbit") ditemukan?', options: ['Sangiran, Jawa Tengah', 'Gua Liang Bua, Flores', 'Maros, Sulawesi Selatan', 'Trinil, Jawa Timur'], answer: 1, explain: 'Kerangkanya ditemukan pada 2003 di gua Liang Bua, Flores.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Apa yang istimewa dari lukisan gua di Maros–Pangkep, Sulawesi Selatan?', options: ['Dibuat oleh Homo floresiensis', 'Termasuk lukisan gua tertua di dunia, lebih tua dari lukisan gua terkenal di Eropa', 'Menggambarkan kapal dagang', 'Dibuat pada abad ke-19'], answer: 1, explain: 'Gambar babi kutil di Leang Tedongnge berumur setidaknya 45.000 tahun.' },
    { type: 'mcq', kind: 'Pemahaman bacaan', prompt: 'Apa perubahan paling penting yang dibawa revolusi pertanian?', options: ['Manusia mulai berburu dengan api', 'Manusia mulai menetap, dan kelebihan makanan memungkinkan munculnya pekerjaan lain lalu kota', 'Manusia berhenti membuat alat batu', 'Manusia pindah dari Afrika ke Eropa'], answer: 1, explain: 'Ladang membuat orang menetap; panen yang tersimpan memungkinkan sebagian orang menjadi tukang, pedagang, atau pemimpin.' },
  ],
};
