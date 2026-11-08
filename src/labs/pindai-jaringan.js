import { pasangPenguji } from './uji-keamanan.js';

const code = String.raw`// Lab Keamanan Siber 3: memindai jaringan sekolah (SIMULASI) lalu menyusun aturan firewall.
// Jaringan di lab ini tiruan di sandbox. Memindai atau mengakses sistem orang lain tanpa izin
// melanggar hukum (UU ITE Pasal 30). Latih kemampuan ini hanya di lab atau jaringan milikmu.

const PORT_UMUM = [21, 22, 23, 53, 80, 443, 445, 554, 3306, 3389, 9100];
const BERISIKO = {
  21: 'FTP: login & file dikirim tanpa enkripsi',
  23: 'Telnet: password terkirim sebagai teks polos',
  // TANTANGAN 2: tambahkan 445 (SMB), 554 (kamera RTSP), 3306 (MySQL), 3389 (Remote Desktop)
};

async function pindai(prefix, dari, sampai) {
  const temuan = [];
  for (let h = dari; h <= sampai; h++) {
    const ip = prefix + h;
    // TANTANGAN 1: periksa SEMUA port di PORT_UMUM, bukan hanya port 80
    const hasil = await jaringan.probe(ip, 80);
    if (hasil.terbuka) temuan.push({ ip, port: 80, layanan: hasil.layanan });
  }
  return temuan;
}

const temuan = await pindai('192.168.10.', 1, 60);
console.log('Ditemukan', temuan.length, 'port terbuka. Waktu di jaringan nyata ≈', jaringan.waktuNyata(), 'detik');
for (const f of temuan) {
  const risiko = BERISIKO[f.port];
  (risiko ? console.warn : console.log)((f.ip + ':' + f.port).padEnd(20), f.layanan.padEnd(22), risiko ? '⚠ ' + risiko : '');
}

// TANTANGAN 3: susun aturan firewall untuk lalu lintas dari internet ke jaringan sekolah.
// Aturan dicek berurutan; aturan PERTAMA yang cocok dipakai.
// Bentuk aturan: { aksi: 'izinkan' | 'tolak', dari: 'internet' | 'admin' | '*', ke: 'IP' | '*', port: angka | '*' }
const aturan = [
  { aksi: 'izinkan', dari: '*', ke: '192.168.10.10', port: 443 },
  { aksi: 'izinkan', dari: '*', ke: '*', port: '*' }, // ← "izinkan semua" ini berbahaya
];

// ---------- Uji keamanan otomatis (jangan diubah) ----------
const total = jaringan.jumlahPortTerbuka(1, 60);
uji('Pemindai menemukan semua port terbuka', () => temuan.length === total || 'baru ' + temuan.length + ' dari ' + total);
uji('Semua layanan berisiko dikenali', () => jaringan.portBerisiko().every((p) => BERISIKO[p]) || 'belum dikenali: ' + jaringan.portBerisiko().filter((p) => !BERISIKO[p]).join(', '));
firewall.uji(aturan);
ringkasan();`;

function setup(G) {
  const PERANGKAT = {
    '192.168.10.1': { nama: 'router', port: { 53: 'DNS', 80: 'Panel admin router', 443: 'Panel admin HTTPS', 23: 'Telnet router' } },
    '192.168.10.10': { nama: 'server-sekolah', port: { 22: 'SSH OpenSSH 9.6', 80: 'Web sekolah (HTTP)', 443: 'Web sekolah (HTTPS)', 3306: 'MySQL 8.0' } },
    '192.168.10.21': { nama: 'printer-TU', port: { 9100: 'JetDirect printer', 21: 'FTP printer (anonymous)' } },
    '192.168.10.30': { nama: 'cctv-gerbang', port: { 80: 'Web kamera', 554: 'RTSP video (admin/admin)' } },
    '192.168.10.45': { nama: 'laptop-guru', port: { 3389: 'Remote Desktop' } },
    '192.168.10.50': { nama: 'nas-arsip', port: { 445: 'SMB berbagi file', 80: 'Web NAS' } },
  };
  const RISIKO = [21, 23, 445, 554, 3306, 3389];
  let probes = 0, tertutup = 0;
  G.jaringan = {
    async probe(ip, port) {
      probes++;
      await null; // jaringan tiruan menjawab seketika
      const d = PERANGKAT[ip], l = d && d.port[port];
      if (!l) { tertutup++; return { ip, port, terbuka: false }; }
      return { ip, port, terbuka: true, layanan: l, perangkat: d.nama };
    },
    // perkiraan bila dilakukan di jaringan sungguhan: 5 ms per port terbuka, timeout 0,5 s per port tertutup, satu per satu
    waktuNyata: () => ((probes - tertutup) * 0.005 + tertutup * 0.5).toFixed(1),
    jumlahPortTerbuka: (a, b) => Object.entries(PERANGKAT).filter(([ip]) => { const h = +ip.split('.')[3]; return h >= a && h <= b; }).reduce((n, [, d]) => n + Object.keys(d.port).length, 0),
    portBerisiko: () => RISIKO.slice(),
  };
  const LALU_LINTAS = [
    { dari: 'internet', ke: '192.168.10.10', port: 443, harus: 'izinkan', ket: 'pengunjung membuka web sekolah (HTTPS)' },
    { dari: 'internet', ke: '192.168.10.10', port: 80, harus: 'izinkan', ket: 'pengunjung membuka web sekolah (HTTP → dialihkan ke HTTPS)' },
    { dari: 'admin', ke: '192.168.10.10', port: 22, harus: 'izinkan', ket: 'admin TIK mengelola server lewat SSH' },
    { dari: 'internet', ke: '192.168.10.10', port: 22, harus: 'tolak', ket: 'orang asing mencoba SSH ke server' },
    { dari: 'internet', ke: '192.168.10.10', port: 3306, harus: 'tolak', ket: 'orang asing mengakses database MySQL' },
    { dari: 'internet', ke: '192.168.10.1', port: 23, harus: 'tolak', ket: 'orang asing membuka Telnet router' },
    { dari: 'internet', ke: '192.168.10.1', port: 80, harus: 'tolak', ket: 'orang asing membuka panel admin router' },
    { dari: 'internet', ke: '192.168.10.21', port: 21, harus: 'tolak', ket: 'orang asing membuka FTP printer' },
    { dari: 'internet', ke: '192.168.10.30', port: 554, harus: 'tolak', ket: 'orang asing menonton CCTV' },
    { dari: 'internet', ke: '192.168.10.45', port: 3389, harus: 'tolak', ket: 'orang asing Remote Desktop ke laptop guru' },
    { dari: 'internet', ke: '192.168.10.50', port: 445, harus: 'tolak', ket: 'orang asing membuka arsip SMB' },
  ];
  const cocok = (a, x) => a === undefined || a === '*' || a === x || (Array.isArray(a) && a.includes(x));
  G.firewall = {
    uji(aturan) {
      if (!Array.isArray(aturan)) throw new Error('aturan harus berupa array');
      console.log('── Simulasi firewall: ' + LALU_LINTAS.length + ' percobaan koneksi ──');
      for (const l of LALU_LINTAS) {
        const r = aturan.find((a) => cocok(a.dari, l.dari) && cocok(a.ke, l.ke) && cocok(a.port, l.port));
        const aksi = r ? r.aksi : 'tolak'; // tanpa aturan yang cocok: tolak (default deny)
        G.uji(l.ket + ' → ' + (l.harus === 'izinkan' ? 'harus diizinkan' : 'harus ditolak'), () => aksi === l.harus || 'firewall memilih ' + aksi);
      }
    },
  };
}

export default {
  title: 'Pindai jaringan sekolah tiruan lalu pasang firewall',
  intro: 'Jaringan <code>192.168.10.0/24</code> di lab ini berisi router, server, printer, CCTV, laptop guru, dan NAS, semuanya tiruan di sandbox. Lengkapi pemindai port, kenali layanan berisiko, lalu susun aturan firewall. Setiap kali <strong>▶ Jalankan</strong>, firewall diuji terhadap 11 percobaan koneksi dan hasilnya langsung terlihat.',
  file: 'audit-jaringan.js',
  lang: 'js',
  code,
  setup: [pasangPenguji, setup],
  source: 'Kode latihan Sams Lab. <code>jaringan.probe()</code> dan <code>firewall.uji()</code> adalah simulasi; tidak ada paket yang dikirim ke jaringan sungguhan.',
  tasks: [
    'Jalankan apa adanya. Berapa port yang ditemukan, dan berapa yang sebenarnya terbuka?',
    'Tantangan 1: tambahkan perulangan <code>for (const port of PORT_UMUM)</code> di dalam perulangan host.',
    'Tantangan 2: lengkapi objek <code>BERISIKO</code>. Mengapa Telnet dan FTP dianggap berbahaya walaupun berfungsi normal?',
    'Tantangan 3: ganti aturan "izinkan semua" dengan aturan yang hanya membuka 80/443 ke server, SSH dari <code>admin</code>, lalu tutup dengan <code>{ aksi: \'tolak\', dari: \'*\', ke: \'*\', port: \'*\' }</code>.',
    'Perhatikan "waktu di jaringan nyata". Mengapa pemindai sungguhan mengirim banyak probe secara paralel? Bandingkan dengan rumus di tab Simulasi.',
  ],
};
