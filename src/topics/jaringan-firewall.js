import { mat, mesh, ground, label, particles } from '../lib/helpers.js';
import lab from '../labs/pindai-jaringan.js';

const probes = (p) => p.N * p.P;
const scanSec = (p) => (probes(p) * (p.timeout / 1000)) / p.c;

export default {
  id: 'jaringan-firewall',
  subject: 'siber',
  title: 'Audit Jaringan: Pemindaian Port & Firewall',
  tags: ['sehari-hari', 'web'],
  summary: 'Menemukan layanan berbahaya yang terbuka di jaringan sekolah (simulasi), lalu menutupnya dengan aturan firewall. Lab kode langsung menguji aturanmu.',
  story: `
    <p><strong>Studi kasus: Audit keamanan jaringan sekolah.</strong> Tim TIK sekolah diminta kepala sekolah mengaudit jaringan <code>192.168.10.0/24</code> sebelum ujian berbasis komputer. Mereka punya izin tertulis, karena memindai jaringan orang lain tanpa izin adalah pelanggaran hukum.</p>
    <p>Setiap layanan jaringan "mendengarkan" di sebuah <em>port</em>: web di 80/443, SSH di 22, database MySQL di 3306. Pemindai port mencoba membuka koneksi TCP ke setiap port. Jika dijawab SYN-ACK, port itu terbuka. Hasil audit menemukan Telnet di router, FTP anonim di printer, CCTV dengan password bawaan, dan database yang bisa diakses dari internet.</p>
    <p>Langkah perbaikannya: matikan layanan yang tidak perlu, ganti protokol teks polos dengan versi terenkripsi (Telnet → SSH, FTP → SFTP), ganti password bawaan, lalu pasang <strong>firewall</strong> dengan prinsip <em>default deny</em>: semua ditolak kecuali yang memang dibutuhkan.</p>`,
  concept: 'Probe = N<sub>host</sub> · N<sub>port</sub> &nbsp;·&nbsp; T ≈ Probe · t<sub>timeout</sub> / c &nbsp;·&nbsp; Host /24 = 2⁸ − 2',
  conceptNote: 'Waktu pindai dihitung untuk kasus terburuk (semua port tertutup dan menunggu timeout). Port yang terbuka menjawab jauh lebih cepat.',
  equations: [
    {
      f: 'T ≈ N<sub>host</sub> · N<sub>port</sub> · t<sub>timeout</sub> / c', meaning: 'Lama pemindaian: total percobaan dikali waktu tunggu tiap percobaan, dibagi banyaknya percobaan yang berjalan bersamaan.',
      symbols: [['T', 'Waktu pemindaian', 'detik'], ['N<sub>host</sub>', 'Jumlah alamat IP yang dipindai', 'host'], ['N<sub>port</sub>', 'Jumlah port per host', 'port'], ['t<sub>timeout</sub>', 'Batas tunggu jawaban', 'ms'], ['c', 'Probe paralel', 'koneksi']],
    },
    {
      f: 'Host = 2<sup>(32 − prefix)</sup> − 2', meaning: 'Jumlah alamat yang bisa dipakai perangkat dalam satu subnet; dua alamat dipakai untuk alamat jaringan dan broadcast.',
      symbols: [['prefix', 'Panjang prefix subnet, mis. /24', 'bit']],
    },
  ],
  params: [
    { key: 'N', label: 'Host dipindai', min: 1, max: 254, step: 1, value: 60, unit: 'host' },
    { key: 'P', label: 'Port per host', min: 1, max: 1000, step: 1, value: 11, unit: 'port' },
    { key: 'timeout', label: 'Timeout', min: 50, max: 2000, step: 50, value: 500, unit: 'ms' },
    { key: 'c', label: 'Probe paralel', min: 1, max: 500, step: 1, value: 1, unit: 'koneksi' },
    { key: 'fw', label: 'Firewall', type: 'select', value: 0, options: [{ value: 0, label: 'Mati (izinkan semua)' }, { value: 1, label: 'Aktif (default deny)' }] },
  ],
  compute(p) {
    return [
      { label: 'Waktu pemindaian (terburuk)', value: scanSec(p), unit: 'detik', digits: 1, main: true },
      { label: 'Total probe', value: probes(p), unit: 'probe', digits: 0 },
      { label: 'Laju probe', value: (p.c * 1000) / p.timeout, unit: 'probe/detik', digits: 0 },
      { label: 'Port berisiko terlihat dari internet', value: p.fw ? 0 : 6, unit: 'port', digits: 0 },
    ];
  },
  view: { camera: [0, 9, 12], target: [0, 0.8, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xa9b0b8 });
    const router = mesh(new THREE.BoxGeometry(1.6, 0.5, 1), mat(0x2f6fae), { y: 0.5 });
    scene.add(router);
    const DEV = [
      ['Server', 0x5f87b3, [22, 80, 443, 3306]], ['Printer', 0xd9d4c7, [9100, 21]], ['CCTV', 0x39424e, [80, 554]],
      ['Laptop guru', 0x8a96a3, [3389]], ['NAS', 0x5c6b7a, [445, 80]], ['Router', 0x2f6fae, [53, 80, 443, 23]],
    ];
    const RISK = [21, 23, 445, 554, 3306, 3389];
    const nodes = DEV.map(([name, color, ports], i) => {
      const a = (i / DEV.length) * Math.PI * 2;
      const g = new THREE.Group();
      g.position.set(Math.cos(a) * 4.5, 0, Math.sin(a) * 4.5);
      g.add(mesh(new THREE.BoxGeometry(1, 1, 1), mat(color), { y: 0.5 }));
      const lights = ports.map((pt, k) => {
        const l = mesh(new THREE.SphereGeometry(0.11, 12, 8), new THREE.MeshBasicMaterial({ color: RISK.includes(pt) ? 0xff5d5d : 0x86e0a8 }), { x: -0.35 + k * 0.23, y: 1.2, shadow: false });
        l.userData.risk = RISK.includes(pt); g.add(l); return l;
      });
      const t = label(name, { size: 0.32 }); t.position.y = 1.7; g.add(t);
      const cable = mesh(new THREE.CylinderGeometry(0.03, 0.03, 4.5, 6), mat(0x5fd6c4), { shadow: false });
      cable.position.set(-Math.cos(a) * 2.25, 0.3, -Math.sin(a) * 2.25);
      cable.rotation.z = Math.PI / 2; cable.rotation.y = -a;
      g.add(cable);
      scene.add(g); return { g, lights };
    });
    // dinding firewall melingkar
    const wall = mesh(new THREE.CylinderGeometry(6.4, 6.4, 2.2, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0xff8f4d, transparent: true, opacity: 0.18, side: THREE.DoubleSide }), { y: 1.1, shadow: false });
    scene.add(wall);
    const pkt = particles(80, 0xffd36b, 0.08);
    scene.add(pkt);
    const tag = label('', { size: 0.45 });
    tag.position.set(0, 3.6, 0);
    scene.add(tag);
    return {
      update(p, t) {
        wall.visible = !!p.fw;
        nodes.forEach(({ lights }) => lights.forEach((l) => { l.visible = !(p.fw && l.userData.risk); }));
        for (let i = 0; i < 80; i++) {
          const n = nodes[i % nodes.length].g.position;
          const f = (t * (0.15 + Math.min(1, p.c / 100)) + i * 0.0917) % 1;
          // paket probe datang dari luar (radius 10) menuju perangkat; firewall menghentikannya di radius 6,4
          const r0 = 10, stopAt = p.fw ? 6.4 / r0 : 1;
          const k = Math.min(f, stopAt);
          const dir = n.clone().normalize();
          pkt.setAt(i, dir.x * (r0 - (r0 - n.length()) * k / 1), 0.6, dir.z * (r0 - (r0 - n.length()) * k), f > stopAt ? 0 : 1);
        }
        pkt.instanceMatrix.needsUpdate = true;
        tag.setText(p.fw ? 'Firewall aktif: hanya 80/443 & SSH admin' : 'Tanpa firewall: 6 layanan berisiko terbuka');
      },
    };
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung', integer: true,
      prompt: 'Jaringan sekolah memakai subnet 192.168.10.0/24. Berapa alamat host yang dapat dipakai perangkat?',
      answer: 254, tolerance: 0, unit: 'host',
      explain: '2^(32−24) − 2 = 256 − 2 = 254 host (alamat .0 untuk jaringan dan .255 untuk broadcast).',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Tim TIK memindai 254 host × 1.000 port dengan timeout 0,5 detik dan 100 probe paralel. Berapa detik waktu terburuknya?',
      preset: { N: 254, P: 1000, timeout: 500, c: 100 }, answer: 1270, tolerance: 0.01, unit: 'detik',
      explain: 'T = 254 × 1.000 × 0,5 / 100 = 1.270 detik (±21 menit). Tanpa paralel (c = 1) butuh hampir 1,5 hari.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Pada TCP, bagaimana pemindai mengetahui sebuah port terbuka?',
      options: ['Port terbuka mengirim e-mail', 'Pemindai mengirim SYN; port terbuka menjawab SYN-ACK, port tertutup menjawab RST, dan port yang difilter firewall tidak menjawab', 'Port terbuka berwarna hijau', 'Dengan mengukur suhu server'], answer: 1,
      explain: 'Ini bagian dari jabat tangan tiga arah TCP (SYN → SYN-ACK → ACK). Firewall default deny membuat port tidak menjawab sama sekali sehingga pemindai harus menunggu timeout.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Router sekolah masih membuka Telnet (port 23). Apa penggantinya yang aman?',
      options: ['HTTP', 'SSH (port 22), karena seluruh sesi termasuk password dienkripsi', 'FTP', 'Ping'], answer: 1,
      explain: 'Telnet mengirim semua data, termasuk password, sebagai teks polos yang bisa disadap siapa pun di jaringan. SSH mengenkripsi dan memverifikasi identitas server.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Kebijakan firewall mana yang paling aman untuk jaringan sekolah?',
      preset: { fw: 1 },
      options: ['Izinkan semua, lalu blokir port yang diketahui berbahaya', 'Default deny: tolak semua, lalu izinkan hanya layanan yang dibutuhkan (web 80/443, SSH dari IP admin)', 'Matikan firewall agar internet cepat', 'Blokir hanya port 80'], answer: 1,
      explain: 'Daftar hitam selalu tertinggal dari layanan baru. Dengan daftar putih (default deny), layanan yang lupa dikonfigurasi otomatis tertutup.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Etika & hukum',
      prompt: 'Temanmu mengajak memindai jaringan Wi-Fi kafe untuk "latihan". Apa sikap yang benar?',
      options: ['Boleh, asal tidak merusak', 'Tidak boleh tanpa izin tertulis pemilik jaringan; berlatihlah di lab, mesin virtual, atau platform CTF yang memang disediakan', 'Boleh jika memakai VPN', 'Boleh jika malam hari'], answer: 1,
      explain: 'Akses atau pengujian sistem orang lain tanpa izin dapat dipidana (UU ITE Pasal 30). Profesional keamanan (pentester) selalu bekerja dengan kontrak dan cakupan yang jelas.',
    },
  ],
  lab,
};
