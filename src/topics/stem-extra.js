// Soal STEM tambahan untuk topik lama, dan label S/T/E/M untuk soal yang sudah ada.
// S = Sains, T = Teknologi, E = Engineering (rekayasa), M = Matematika.
// Soal tambahan selalu ditaruh di belakang agar nomor soal lama (dan progres tersimpan) tidak bergeser.

export const LABELS = {
  'panel-surya': ['M', 'S', 'E'],
  'turbin-angin': ['S', 'M', 'E'],
  'rem-regeneratif': ['M', 'S', 'E'],
  'hidrogen-hijau': ['M', 'S', 'E'],
  'emisi-bahan-bakar': ['M', 'M', 'E'],
  'baterai-ev': ['M', 'M', 'E'],
  fotosintesis: ['S', 'M', 'E'],
  mikroalga: ['M', 'S', 'E'],
  bioetanol: ['M', 'S', 'E'],
  'persamaan-roket': ['M', 'E', 'S'],
  'orbit-satelit': ['M', 'M', 'E'],
  'gaya-dorong': ['M', 'M', 'S'],
  'mesin-penilai': ['M', 'E', 'T'],
  'deploy-vercel': ['M', 'M', 'T'],
  'integrasi-api': ['E', 'M', 'T'],
  'unduh-bertahap': ['M', 'E', 'T'],
};

export const EXTRA = {
  'panel-surya': [
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Panel surya menghasilkan arus searah (DC), sedangkan peralatan rumah memakai listrik bolak-balik (AC) 220 V. Perangkat apa yang mengubahnya?',
      options: ['Trafo step-up', 'Inverter', 'Dioda bypass', 'MCB (pemutus arus)'], answer: 1,
      explain: 'Inverter mengubah DC menjadi AC 220 V/50 Hz dan menyinkronkannya dengan jaringan PLN. Inverter modern juga melakukan MPPT (pelacakan titik daya maksimum).',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung', integer: true,
      prompt: 'Keluarga ingin PLTS atap menghasilkan minimal 10 kWh per hari. Satu panel 1,9 m², η = 20%, PSH = 4,5 jam, PR = 0,8. Berapa panel minimal yang harus dipasang (bilangan bulat)?',
      preset: { n: 8, eta: 20, psh: 4.5 }, answer: 8, tolerance: 0, unit: 'panel',
      explain: 'Satu panel: 1,9 × 0,20 × 4,5 × 0,8 = 1,368 kWh/hari. 10 / 1,368 = 7,3, dibulatkan ke atas menjadi 8 panel.',
    },
  ],
  'turbin-angin': [
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Saat angin badai melebihi 25 m/s, turbin di PLTB Sidrap berhenti berputar. Teknologi apa yang dipakai untuk melindunginya?',
      options: ['Bilah dibuat dari baja tebal', 'Sistem pitch memutar bilah sejajar angin (feathering) lalu rem mengunci rotor', 'Generator dimatikan sehingga rotor otomatis berhenti', 'Menara diturunkan dengan hidrolik'], answer: 1,
      explain: 'Pitch control memutar sudut bilah sehingga gaya angkatnya hilang (feathering), lalu rem mekanis mengunci rotor. Sistem yaw juga menghadapkan nacelle ke arah angin saat beroperasi normal.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung', integer: true,
      prompt: 'Jari-jari rotor diperbesar dua kali (angin dan Cp tetap). Daya turbin menjadi berapa kali semula?',
      preset: { R: 57 }, answer: 4, tolerance: 0, unit: 'kali',
      explain: 'P ∝ A = πR². Jika R menjadi 2R, A menjadi 4 kali, jadi daya juga 4 kali.',
    },
  ],
  'rem-regeneratif': [
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Saat mobil listrik mengerem secara regeneratif, komponen apa yang mengubah energi gerak menjadi listrik untuk baterai?',
      options: ['Kampas rem cakram', 'Motor listrik yang bekerja sebagai generator, diatur oleh inverter', 'Alternator terpisah di mesin', 'Panel surya di atap mobil'], answer: 1,
      explain: 'Motor traksi dapat berfungsi terbalik sebagai generator. Inverter mengatur arus balik ini dan mengisinya ke baterai, sehingga roda diperlambat oleh gaya elektromagnetik.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Mobil melaju 72 km/jam lalu mengerem dengan perlambatan tetap 4 m/s². Berapa jarak pengereman sampai berhenti?',
      preset: { v: 72, a: 4 }, answer: 50, tolerance: 0.02, unit: 'm',
      explain: '72 km/jam = 20 m/s. s = v² / 2a = 400 / 8 = 50 m.',
    },
  ],
  'hidrogen-hijau': [
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Elektroliser PEM (Proton Exchange Membrane) kini banyak dipakai untuk hidrogen hijau. Apa fungsi membrannya?',
      options: ['Menyaring garam dari air laut', 'Menghantarkan ion H⁺ dari anoda ke katoda sekaligus memisahkan gas H₂ dan O₂', 'Menyimpan hidrogen bertekanan', 'Mengubah DC menjadi AC'], answer: 1,
      explain: 'Membran polimer hanya melewatkan proton (H⁺). Gas H₂ dan O₂ tetap terpisah sehingga hidrogen yang dihasilkan sangat murni dan aman.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Berapa jam yang dibutuhkan untuk menghasilkan 1 mol H₂ dengan arus 10 A dan efisiensi arus 100%? (F = 96.485 C/mol)',
      preset: { I: 10, eta: 100 }, answer: 5.36, tolerance: 0.02, unit: 'jam',
      explain: '1 mol H₂ butuh 2 mol elektron = 2 × 96.485 = 192.970 C. t = Q / I = 19.297 s ≈ 5,36 jam.',
    },
  ],
  'emisi-bahan-bakar': [
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Mesin yang kekurangan oksigen menghasilkan gas CO yang beracun. Mengapa?',
      options: ['Karena CO lebih ringan dari CO₂', 'Karena oksigen tidak cukup untuk mengoksidasi karbon sepenuhnya menjadi CO₂ (pembakaran tidak sempurna)', 'Karena bensin mengandung CO', 'Karena suhu terlalu rendah untuk membentuk H₂O'], answer: 1,
      explain: 'Pembakaran sempurna: C + O₂ → CO₂. Bila O₂ kurang, sebagian karbon hanya teroksidasi menjadi CO (2C + O₂ → 2CO). CO mengikat hemoglobin 200 kali lebih kuat daripada O₂.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Apa fungsi catalytic converter pada knalpot mobil modern?',
      options: ['Menghilangkan CO₂ dari gas buang', 'Mengubah CO, NOx, dan hidrokarbon sisa menjadi CO₂, N₂, dan H₂O dengan katalis platina/paladium/rodium', 'Mendinginkan gas buang', 'Meredam suara mesin'], answer: 1,
      explain: 'Katalis logam mulia mempercepat reaksi oksidasi CO dan HC serta reduksi NOx. CO₂ tetap keluar, karena itulah satu-satunya cara mengurangi CO₂ adalah memakai lebih sedikit bahan bakar fosil.',
    },
  ],
  'baterai-ev': [
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Saat baterai litium-ion diisi daya (charging), apa yang terjadi di dalam sel?',
      options: ['Ion Li⁺ bergerak dari katoda menuju anoda grafit dan tersisip di antara lapisannya', 'Elektron mengalir melalui elektrolit', 'Litium berubah menjadi gas', 'Ion Li⁺ bergerak dari anoda ke katoda'], answer: 0,
      explain: 'Saat charging, Li⁺ keluar dari katoda (mis. NMC/LFP), menembus elektrolit dan separator, lalu tersisip (interkalasi) di grafit. Elektron mengalir lewat kabel luar. Saat dipakai, arahnya terbalik.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Paket baterai mobil listrik selalu dilengkapi BMS (Battery Management System). Apa tugas utamanya?',
      options: ['Menambah kapasitas sel', 'Memantau tegangan, suhu, dan arus tiap sel, menyeimbangkan sel, dan memutus arus bila berbahaya', 'Mengubah AC menjadi DC', 'Mendinginkan motor'], answer: 1,
      explain: 'BMS mencegah overcharge, overdischarge, dan panas berlebih yang bisa memicu thermal runaway, serta menyeimbangkan sel agar kapasitas paket maksimal.',
    },
  ],
  fotosintesis: [
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Pemerintah kota memantau kesehatan hutan kota memakai citra satelit (indeks NDVI). Sifat daun apa yang dimanfaatkan teknologi ini?',
      options: ['Daun sehat memancarkan panas', 'Daun sehat menyerap kuat cahaya merah dan memantulkan kuat inframerah dekat', 'Daun sehat berwarna kuning', 'Daun sehat memantulkan semua cahaya biru'], answer: 1,
      explain: 'Klorofil menyerap merah untuk fotosintesis, sedangkan struktur sel daun memantulkan inframerah dekat. NDVI = (NIR − Merah)/(NIR + Merah) mendekati 1 untuk vegetasi lebat dan sehat.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Berapa gram glukosa yang dapat dibentuk tanaman dari 264 g CO₂? (Mr CO₂ = 44, Mr C₆H₁₂O₆ = 180)',
      answer: 180, tolerance: 0.01, unit: 'g',
      explain: '264 / 44 = 6 mol CO₂. Dari persamaan, 6 mol CO₂ → 1 mol glukosa = 180 g.',
    },
  ],
  mikroalga: [
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Mengapa produsen biofuel memakai fotobioreaktor tabung tertutup, bukan kolam terbuka (open pond), walaupun lebih mahal?',
      options: ['Karena alga tidak butuh cahaya', 'Karena kontaminasi lebih rendah, suhu/CO₂ terkendali, dan produktivitas per luas lebih tinggi', 'Karena kolam terbuka dilarang', 'Karena tabung bisa menghasilkan minyak tanpa alga'], answer: 1,
      explain: 'Sistem tertutup mengurangi kontaminasi mikroba lain dan penguapan, serta memungkinkan injeksi CO₂ dan pengaturan suhu. Kolam terbuka murah, tetapi produktivitasnya lebih rendah.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Kultur dimulai dari N₀ = 0,1 g/L, daya dukung K = 3 g/L, r = 0,6 per hari. Berapa konsentrasi biomassa pada hari ke-8 menurut model logistik?',
      preset: { r: 0.6, K: 3, N0: 0.1, t: 8 }, answer: 2.42, tolerance: 0.02, unit: 'g/L',
      explain: 'N = 3 / [1 + 29 · e^(−4,8)] = 3 / (1 + 29 × 0,00823) = 3 / 1,239 ≈ 2,42 g/L.',
    },
  ],
  bioetanol: [
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Hasil fermentasi hanya berkadar etanol 8–12%. Teknologi apa yang dipakai untuk memekatkannya menjadi bahan bakar?',
      options: ['Penyaringan dengan kertas saring', 'Distilasi (penyulingan), lalu dehidrasi dengan saringan molekuler', 'Pendinginan sampai membeku', 'Elektrolisis'], answer: 1,
      explain: 'Etanol mendidih pada 78 °C, air pada 100 °C, sehingga bisa dipisah dengan distilasi sampai ±95%. Sisa air dihilangkan dengan saringan molekuler agar kadar ≥99,5% (fuel grade).',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Berapa gram CO₂ yang terlepas dari fermentasi sempurna 360 g glukosa? (Mr glukosa = 180, Mr CO₂ = 44)',
      answer: 176, tolerance: 0.01, unit: 'g',
      explain: '360 g = 2 mol glukosa. Setiap mol menghasilkan 2 mol CO₂, jadi 4 mol × 44 = 176 g.',
    },
  ],
  'persamaan-roket': [
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Mesin roket hidrogen cair + oksigen cair (LH₂/LOX) punya Isp sekitar 450 s, jauh di atas minyak tanah + LOX (±310 s). Apa sebabnya?',
      options: ['Hidrogen lebih berat', 'Gas buangnya (H₂O dan H₂) bermassa molekul kecil sehingga keluar dengan kecepatan lebih tinggi', 'Hidrogen tidak butuh oksigen', 'Tangki hidrogen lebih kecil'], answer: 1,
      explain: 'Kecepatan buang ∝ √(T/M). Molekul ringan pada suhu tinggi bergerak lebih cepat, jadi Isp naik. Kelemahannya, hidrogen cair sangat dingin (−253 °C) dan butuh tangki besar.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Gunakan nilai awal simulasi: Isp 311 s, massa kering 25 t, propelan 400 t, muatan 15 t. Berapa Δv tahap ini? (g₀ = 9,80665 m/s²)',
      preset: { isp: 311, dry: 25, prop: 400, pay: 15 }, answer: 7313, tolerance: 0.02, unit: 'm/s',
      explain: 'm₀ = 440 t, m_f = 40 t, rasio 11. Δv = 311 × 9,80665 × ln 11 = 311 × 9,80665 × 2,398 ≈ 7.313 m/s.',
    },
  ],
  'orbit-satelit': [
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Di ketinggian ISS (400 km) gravitasi masih sekitar 90% dari di permukaan Bumi. Mengapa astronaut tampak melayang?',
      options: ['Karena di angkasa tidak ada gravitasi', 'Karena ISS dan astronaut sama-sama terus jatuh bebas mengelilingi Bumi', 'Karena ISS memiliki magnet', 'Karena tekanan udara nol'], answer: 1,
      explain: 'ISS bergerak mendatar ±7,7 km/s sehingga saat jatuh, permukaan Bumi yang melengkung ikut "menjauh". Semua benda di dalamnya jatuh bersama, sehingga terasa tanpa bobot.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Antena parabola TV satelit geostasioner cukup dipasang mati, sedangkan terminal internet LEO memakai antena phased array. Mengapa?',
      options: ['Satelit LEO lebih besar', 'Satelit GEO tampak diam di langit, sedangkan satelit LEO melintas cepat sehingga arah berkas harus diubah elektronik terus-menerus', 'Phased array lebih murah', 'Satelit LEO memakai cahaya tampak'], answer: 1,
      explain: 'Periode GEO = 24 jam, sama dengan rotasi Bumi. Satelit LEO mengorbit ±95 menit, jadi antena harus mengikuti dan berpindah satelit; phased array mengarahkan berkas tanpa bagian bergerak.',
    },
  ],
  'gaya-dorong': [
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Roket tidak punya sayap atau sirip besar, tetapi bisa berbelok setelah lepas landas. Teknologi apa yang memungkinkannya?',
      options: ['Kemudi seperti kapal', 'Thrust vector control: nozzle mesin dimiringkan dengan aktuator (gimbal) sehingga arah dorong berubah', 'Mematikan satu mesin', 'Mengubah warna roket'], answer: 1,
      explain: 'Memiringkan nozzle beberapa derajat menghasilkan torsi terhadap pusat massa, sehingga roket dapat dikendalikan bahkan di udara tipis.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'TWR roket orbital saat lepas landas biasanya dirancang 1,2–1,5, bukan 5. Apa pertimbangan rekayasanya?',
      options: ['Hukum melarang TWR tinggi', 'TWR tinggi butuh mesin lebih banyak/berat dan menimbulkan percepatan serta tekanan aerodinamis berlebih; TWR terlalu rendah membuang propelan melawan gravitasi', 'TWR tinggi membuat roket lebih lambat', 'TWR tidak berpengaruh'], answer: 1,
      explain: 'Insinyur menyeimbangkan gravity loss (TWR rendah) dengan massa mesin dan beban struktur (TWR tinggi). Kompromi 1,2–1,5 paling efisien untuk sebagian besar roket.',
    },
  ],
  'mesin-penilai': [
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Uji keadilan S0–S6 dirancang seperti eksperimen ilmiah. Pada skenario S1 (typo) dibanding S0, apa yang berperan sebagai variabel bebas?',
      options: ['Kunci jawaban', 'Cara penulisan jawaban (ada typo atau tidak), sedangkan isi jawaban dijaga sama', 'Nilai akhir', 'Nama mahasiswa'], answer: 1,
      explain: 'Hanya satu faktor yang diubah (variabel bebas), isi jawaban tetap (variabel kontrol), lalu nilai diamati (variabel terikat). Jika nilai berubah, mesin tidak adil terhadap typo.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Dari 200 PDF uji, mesin memberi nilai sama dengan penilai manusia pada 184 PDF. Berapa persen akurasinya?',
      answer: 92, tolerance: 0.01, unit: '%',
      explain: 'Akurasi = 184 / 200 × 100% = 92%.',
    },
  ],
  'deploy-vercel': [
    {
      stem: 'S', type: 'num', kind: 'Sains',
      prompt: 'Cahaya di serat optik merambat ±200.000 km/s. Jika server berada 15.000 km dari Jakarta, berapa milidetik minimal waktu pulang-pergi (round trip) sinyal?',
      answer: 150, tolerance: 0.02, unit: 'ms',
      explain: 'Sekali jalan 15.000 / 200.000 = 0,075 s = 75 ms; pulang-pergi 150 ms. Inilah alasan CDN menaruh salinan file dekat pengguna.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Halaman statis disajikan dari CDN, sedangkan /api/* dijalankan sebagai serverless function. Apa keuntungan rancangan ini?',
      options: ['Server harus menyala 24 jam', 'File statis cepat dan murah dari cache CDN; fungsi hanya berjalan (dan ditagih) saat ada permintaan serta otomatis menskala', 'Database tidak dibutuhkan lagi', 'Kode backend terlihat oleh pengguna'], answer: 1,
      explain: 'Pemisahan statis/dinamis meminimalkan biaya dan latensi. Kekurangannya cold start dan batas waktu eksekusi (maxDuration).',
    },
  ],
  'integrasi-api': [
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Cache 60 detik mampu memangkas pemakaian kuota Google Sheets secara drastis. Prinsip ilmu komputer apa yang dimanfaatkan?',
      options: ['Lokalitas temporal: data yang baru dibaca cenderung dibaca lagi dalam waktu dekat', 'Hukum Ohm', 'Kompresi data', 'Enkripsi simetris'], answer: 0,
      explain: 'Banyak pengguna meminta data yang sama dalam rentang singkat. Menyimpan hasil sementara menghindari pembacaan berulang ke sumber yang lambat atau berkuota.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Kuota Sheets 60 baca/menit. Dashboard membaca 12 kali per pemuatan dan direfresh tiap 60 detik. Berapa halaman maksimum yang boleh terbuka bersamaan tanpa melebihi kuota?',
      answer: 5, tolerance: 0, integer: true, unit: 'halaman',
      explain: 'Satu halaman = 12 baca/menit. 60 / 12 = 5 halaman.',
    },
  ],
  'unduh-bertahap': [
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Kecepatan internet ditulis 20 Mbps, tetapi pengelola unduhan menampilkan sekitar 2,5 MB/s. Mengapa angkanya berbeda?',
      options: ['Karena internet melambat', 'Karena Mbps adalah megabit per detik, sedangkan MB/s adalah megabyte per detik; 1 byte = 8 bit', 'Karena ada virus', 'Karena MB lebih kecil dari Mb'], answer: 1,
      explain: '20 megabit ÷ 8 = 2,5 megabyte per detik. Satuan bit (b kecil) dipakai untuk laju jaringan, byte (B besar) untuk ukuran file.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung', integer: true,
      prompt: 'PDF 40 MB diunduh dengan potongan 4,5 MB (batas aman Vercel). Berapa potongan yang dibutuhkan?',
      preset: { S: 40, c: 4.5 }, answer: 9, tolerance: 0, unit: 'potongan',
      explain: 'k = ⌈40 / 4,5⌉ = ⌈8,9⌉ = 9 potongan.',
    },
  ],
};
