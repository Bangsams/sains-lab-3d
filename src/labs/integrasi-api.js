import code from './integrasi-api.code.js';

// Server tiruan; dijalankan di iframe lewat toString(), jadi harus berdiri sendiri.
function setup(G) {
  G.process.env.DASHBOARD_PASSWORD = 'praktikum-2026';
  G.process.env.STAT_GOOGLE_SA = JSON.stringify({
    client_email: 'lab-penilai@datmin-lab.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\\nKUNCI-TIRUAN-UNTUK-LAB\\n-----END PRIVATE KEY-----\\n',
  });
  // pasangApi(handler): handler(req, res) dipanggil seperti fungsi serverless Vercel
  G.pasangApi = (handler) => G.__routes.push({
    path: '/api/stat',
    async handle(u, opts) {
      const headers = {};
      Object.entries(opts.headers || {}).forEach(([k, v]) => { headers[k.toLowerCase()] = v; });
      const req = { method: opts.method || 'GET', headers, query: Object.fromEntries(u.searchParams) };
      let status = 200, body = '';
      const res = { status(c) { status = c; return res; }, json(o) { body = JSON.stringify(o); return res; }, setHeader() { return res; } };
      try { await handler(req, res); } catch (e) { status = 500; body = JSON.stringify({ error: e.message }); }
      console.log(`  [server] ${req.method} ${u.pathname}${u.search} → ${status}`);
      return new Response(body, { status, headers: { 'content-type': 'application/json' } });
    },
  });
}

export default {
  title: 'Password lewat header & token service account',
  intro: 'Gabungan tiga file asli: <code>lib/stat-google.js</code> membuat JWT untuk Google, <code>lib/auth.js</code> memeriksa password dashboard, dan fungsi <code>api()</code> dari <code>stat-monitoring.html</code> mengirim password lewat header. Server, kredensial, dan tanda tangan RSA diganti tiruan, jadi tidak ada data sungguhan yang tersentuh.',
  file: 'stat-google.js + auth.js',
  lang: 'js',
  code,
  setup,
  source: 'Sumber: <code>lib/stat-google.js</code> baris 1–27, <code>lib/auth.js</code> baris 3–20, <code>public/stat-monitoring.html</code> baris 157 &amp; 159–164 (asli). Satu baris bertanda <code>[lab]</code> menggantikan bagian penukaran token ke Google.',
  tasks: [
    'Kosongkan <code>password</code> (<code>\'\'</code>) lalu jalankan. Kode status apa yang diterima <code>api()</code>?',
    'Tambahkan <code>delete process.env.DASHBOARD_PASSWORD;</code> di awal blok uji coba. Mengapa server menjawab 500, bukan 401?',
    'Di <code>requireAuth</code>, ganti <code>a</code> dan <code>b</code> menjadi <code>Buffer.from(got)</code> dan <code>Buffer.from(expected)</code>. Coba password yang panjangnya berbeda. Mengapa kode asli melakukan hash dulu?',
    'Ubah <code>exp: now + 3600</code> dan lihat payload JWT berubah. Token Google berlaku paling lama 1 jam, jadi apa gunanya variabel <code>cached</code>?',
    'Kosongkan <code>process.env.STAT_GOOGLE_SA</code>. Pesan galat apa yang ditulis <code>credentials()</code>?',
  ],
};
