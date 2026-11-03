import { mat, mesh, ground, label, particles } from '../lib/helpers.js';
import lab from '../labs/integrasi-api.js';

const KUOTA = 60; // permintaan baca per menit per pengguna (kuota default Google Sheets API; service account = satu pengguna)

const aktif = (p) => p.U * (1 - p.h / 100);
// pemuatan monitor per menit; cache di server menggabungkan permintaan yang datang berdekatan
const muat = (p) => {
  const m = (aktif(p) * 60) / p.dt;
  return p.cache > 0 ? Math.min(m, 60 / p.cache) : m;
};
const baca = (p) => muat(p) * (1 + p.N); // 1 sheet respons Form + N sheet asisten
const pakai = (p) => (baca(p) / KUOTA) * 100;

export default {
  id: 'integrasi-api',
  subject: 'coding',
  title: 'Integrasi Google Sheets & Drive API',
  tags: ['web', 'industri'],
  summary: 'Service account, token JWT, password lewat header, dan refresh otomatis. Lalu menghitung kapan dashboard menabrak kuota API.',
  story: `
    <p><strong>Studi kasus: monitoring nilai 11 asisten.</strong> Halaman monitoring membandingkan pengumpulan dari Google Form dengan nilai yang sudah diisi di sheet setiap asisten. Browser tidak memanggil Google secara langsung. Semua permintaan lewat fungsi <code>/api/stat</code>, supaya kunci rahasia tetap di server.</p>
    <p><strong>1. Browser → API kita.</strong> Password dikirim sebagai header, bukan di URL:</p>
    <pre><code>const res = await fetch('/api/stat?action=monitor&amp;modul=TTEST', {
  headers: { 'x-dashboard-password': password } });</code></pre>
    <p>Server membandingkannya dengan <code>process.env.DASHBOARD_PASSWORD</code>. Keduanya di-hash SHA-256 terlebih dahulu, lalu dibandingkan dengan <code>crypto.timingSafeEqual</code> agar lama pengecekan tidak membocorkan isi password.</p>
    <p><strong>2. API kita → Google (service account).</strong> Fungsi membuat JWT berisi <code>iss</code> (email service account), <code>scope</code> (spreadsheets, drive.readonly), dan <code>exp</code> (1 jam). JWT ditandatangani RS256 dengan private key, lalu ditukar menjadi access token:</p>
    <pre><code>let cached = null;
async function token() {
  if (cached &amp;&amp; cached.exp &gt; Date.now() + 60000) return cached.token;
  const jwt = signRS256({ iss, scope, aud: TOKEN_URL, iat, exp });
  const r = await fetch(TOKEN_URL, { method: 'POST', body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) });
  const j = await r.json();
  cached = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return cached.token;
}</code></pre>
    <p>Token disimpan di variabel modul (<em>cache</em>) sehingga tidak diminta ulang selama fungsi masih "hangat". Spreadsheet setiap asisten harus dibagikan ke email service account.</p>
    <p><strong>3. Refresh otomatis.</strong> Halaman memuat ulang data tiap 2 menit, tetapi melewatinya saat tab tersembunyi (<code>document.hidden</code>). Ini penting karena satu pemuatan membaca 1 sheet Form ditambah 11 sheet asisten, dan service account dihitung sebagai <em>satu pengguna</em> dalam kuota Google.</p>`,
  concept: `R = min(U<sub>aktif</sub> · 60 / Δt, 60 / c) · (1 + N) &nbsp;·&nbsp; pemakaian = R / kuota`,
  conceptNote: 'Kuota default Google Sheets API untuk baca: 60 permintaan per menit per pengguna (300 per menit per proyek). Jika terlampaui, Google membalas 429 Too Many Requests. c = 0 berarti tanpa cache server.',
  equations: [
    {
      f: 'R = U<sub>aktif</sub> · (60 / Δt) · (1 + N)',
      meaning: 'Jumlah baca sheet per menit = jumlah halaman yang terbuka × berapa kali tiap halaman memuat ulang per menit × banyaknya sheet yang dibaca setiap kali muat.',
      symbols: [
        ['R', 'Permintaan baca ke Google per menit', 'baca/menit'],
        ['U<sub>aktif</sub>', 'Halaman dashboard yang terbuka dan terlihat', 'halaman'],
        ['Δt', 'Selang refresh otomatis', 's'],
        ['N', 'Jumlah sheet asisten (+1 sheet respons Form)', 'sheet'],
      ],
    },
    {
      f: 'R<sub>cache</sub> = min(U<sub>aktif</sub> · 60 / Δt, 60 / c) · (1 + N)',
      meaning: 'Jika server menyimpan hasil selama c detik, semua pengguna yang meminta dalam selang itu memakai hasil yang sama. Paling banyak hanya 60/c pemuatan ke Google per menit, berapa pun jumlah penggunanya.',
      symbols: [
        ['c', 'Lama hasil disimpan di cache server', 's'],
        ['R<sub>cache</sub>', 'Baca per menit setelah ada cache', 'baca/menit'],
      ],
    },
  ],
  params: [
    { key: 'U', label: 'Dashboard yang dibuka', min: 1, max: 40, step: 1, value: 5, unit: 'halaman' },
    { key: 'h', label: 'Tab tersembunyi (refresh dilewati)', min: 0, max: 90, step: 5, value: 0, unit: '%' },
    { key: 'dt', label: 'Selang refresh otomatis', min: 15, max: 600, step: 15, value: 120, unit: 's' },
    { key: 'N', label: 'Sheet asisten', min: 1, max: 20, step: 1, value: 11, unit: 'sheet' },
    { key: 'cache', label: 'Cache hasil di server', min: 0, max: 300, step: 15, value: 0, unit: 's' },
  ],
  compute(p) {
    const u = pakai(p);
    return [
      { label: 'Baca sheet per menit', value: baca(p), unit: 'baca/menit', digits: 1, main: true },
      { label: 'Pemakaian kuota per pengguna', value: u, unit: '%', digits: 0 },
      { label: 'Status', value: u <= 100 ? 'AMAN' : 'KENA 429 Too Many Requests', text: true },
      { label: 'Pemuatan monitor per menit', value: muat(p), unit: 'kali', digits: 2 },
      { label: 'Permintaan token per jam (token di-cache)', value: 1, unit: 'per instance', digits: 0 },
    ];
  },
  lab,
  view: { camera: [0, 9, 15], target: [0, 1.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xb5bdd2 });
    const server = mesh(new THREE.BoxGeometry(1.6, 2.4, 1.6), mat(0x5fd6c4, { emissive: 0x5fd6c4, emissiveIntensity: 0.15 }), { y: 1.2 });
    scene.add(server);
    const sTag = label('/api/stat', { size: 0.45 });
    sTag.position.set(0, 3, 0);
    scene.add(sTag);
    // pengguna (laptop) di busur depan, sheet Google di busur belakang; disebar merata sesuai jumlahnya
    const clients = Array.from({ length: 40 }, () => {
      const g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(0.7, 0.05, 0.5), mat(0x3b4766), { y: 0.3 }));
      const scr = mesh(new THREE.BoxGeometry(0.7, 0.45, 0.04), mat(0x93b6ff, { emissive: 0x93b6ff, emissiveIntensity: 0.4 }), { y: 0.55, z: -0.24 });
      g.add(scr);
      g.userData.scr = scr;
      scene.add(g);
      return g;
    });
    const sheets = Array.from({ length: 21 }, (_, i) => {
      const s = mesh(new THREE.BoxGeometry(0.6, 0.8, 0.06), mat(i === 0 ? 0xb197fc : 0x86e0a8), { y: 0.7 });
      scene.add(s);
      return s;
    });
    const arc = (list, n, from, span, r0, perRow) => list.forEach((o, i) => {
      o.visible = i < n;
      const row = Math.floor(i / perRow), m = Math.min(perRow, n - row * perRow);
      const a = Math.PI * (from + span * (m > 1 ? (i % perRow) / (m - 1) : 0.5));
      o.position.set(Math.cos(a) * (r0 + row * 1.4), o.position.y, Math.sin(a) * (r0 + row * 1.4));
      o.lookAt(0, o.position.y, 0);
    });
    let shown = '';
    const up = particles(60, 0x93b6ff, 0.08);
    const down = particles(120, 0x86e0a8, 0.07);
    scene.add(up, down);
    const tag = label('', { size: 0.65 });
    tag.position.set(0, 5, 0);
    scene.add(tag);

    return {
      update(p, t) {
        const ua = Math.round(aktif(p));
        if (shown !== `${p.U}/${p.N}`) {
          shown = `${p.U}/${p.N}`;
          arc(clients, p.U, 0.15, 0.7, 6, 20);
          arc(sheets, p.N + 1, 1.15, 0.7, 6, 21);
        }
        clients.forEach((c, i) => { c.userData.scr.material.emissiveIntensity = i < ua ? 0.5 : 0.02; });
        // laju partikel ∝ laju permintaan
        const speedUp = 0.15 + Math.min(2, muat(p) / 5);
        for (let i = 0; i < 60; i++) {
          const c = clients[i % Math.max(1, ua)];
          const f = (t * speedUp * 0.3 + i * 0.137) % 1;
          up.setAt(i, c.position.x * (1 - f), 0.6 + f * 0.6, c.position.z * (1 - f), ua > 0 ? 1 : 0);
        }
        const nb = Math.round(120 * Math.min(1, baca(p) / 120));
        for (let i = 0; i < 120; i++) {
          const s = sheets[i % (p.N + 1)].position;
          const f = (t * 0.4 + i * 0.211) % 1;
          down.setAt(i, s.x * f, 0.7 + Math.sin(f * Math.PI) * 1.2, s.z * f, i < nb ? 1 : 0);
        }
        up.instanceMatrix.needsUpdate = true;
        down.instanceMatrix.needsUpdate = true;
        const over = pakai(p) > 100;
        server.material.color.setHex(over ? 0xff7a5c : 0x5fd6c4);
        server.material.emissive.setHex(over ? 0xff7a5c : 0x5fd6c4);
        server.position.x = over ? Math.sin(t * 40) * 0.05 : 0;
        tag.setText(`${baca(p).toLocaleString('id-ID', { maximumFractionDigits: 1 })} baca/menit · ${Math.round(pakai(p))}% kuota`);
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Studi kasus',
      prompt: '5 asisten membuka dashboard monitoring bersamaan. Refresh otomatis setiap 120 detik, dan setiap pemuatan membaca 1 sheet Form ditambah 11 sheet asisten. Tanpa cache server, berapa permintaan baca per menit yang dikirim ke Google Sheets?',
      preset: { U: 5, h: 0, dt: 120, N: 11, cache: 0 },
      answer: 30, tolerance: 0.01, unit: 'baca/menit',
      explain: 'R = 5 × (60/120) × (1 + 11) = 5 × 0,5 × 12 = 30 baca/menit, yaitu 50% kuota 60/menit. Masih aman.',
    },
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Saat praktikum, 20 halaman dibuka dengan refresh tiap 30 detik (N = 11). Itu 480 baca/menit, delapan kali kuota. Jika server menyimpan hasil di cache selama 60 detik, berapa baca per menit sekarang?',
      preset: { U: 20, h: 0, dt: 30, N: 11, cache: 60 },
      answer: 12, tolerance: 0.01, unit: 'baca/menit',
      explain: 'Tanpa cache: 20 × 2 × 12 = 480. Dengan cache 60 s, paling banyak 60/60 = 1 pemuatan ke Google per menit. R = 1 × 12 = 12 baca/menit (20% kuota). Semua pengguna berbagi hasil yang sama.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa server membandingkan password dengan crypto.timingSafeEqual pada hash SHA-256, bukan dengan got === expected?',
      options: [
        'Supaya password bisa lebih panjang dari 8 karakter',
        'Karena === tidak bisa membandingkan string di Node.js',
        'Karena === berhenti di karakter pertama yang berbeda, sehingga lama respons bisa membocorkan isi password (timing attack). Hash membuat panjangnya sama, dan timingSafeEqual selalu memeriksa semua byte',
        'Supaya password tersimpan terenkripsi di Google Sheets',
      ],
      answer: 2,
      explain: 'Penyerang bisa mengukur waktu respons untuk menebak password karakter demi karakter. timingSafeEqual butuh panjang buffer yang sama, jadi kedua nilai di-hash dulu menjadi 32 byte.',
    },
  ],
};
