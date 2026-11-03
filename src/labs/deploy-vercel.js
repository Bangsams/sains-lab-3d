import code from './deploy-vercel.code.js';

// Validator dijalankan di iframe lewat toString(), jadi tidak boleh memakai variabel dari luar fungsi.
function setup(G) {
  // daftar file proyek datmin-autograder-monitor seperti saat di-deploy
  const FILES = [
    'api/files.js', 'api/grade.js', 'api/key.js', 'api/sheet.js', 'api/simulate.js', 'api/stat.js', 'api/status.js',
    'build/orig-index.html', 'build/orig-input.html', 'build/retheme.js',
    'data/keys/KUNCI_ARMBA.pdf', 'data/keys/KUNCI_CLUSTER.pdf', 'data/keys/KUNCI_KLASIFIKASI.pdf', 'data/keys/KUNCI_PREPROCESSING.pdf',
    'data/simulations/S0_dasar.pdf', 'data/simulations/S1_typo.pdf', 'data/simulations/S2_parafrase.pdf', 'data/simulations/S3_format_angka.pdf',
    'data/simulations/S4_urutan_struktur.pdf', 'data/simulations/S5_inggris_singkatan.pdf', 'data/simulations/S6_kontrol_salah.pdf', 'data/simulations/manifest.json',
    'lib/Grader.js', 'lib/Kunci.js', 'lib/auth.js', 'lib/google.js', 'lib/sheets.js', 'lib/stat-google.js', 'lib/stat-sheets.js',
    'public/index.html', 'public/analitika.html', 'public/laporan.html', 'public/posttest.html', 'public/stat-monitoring.html', 'public/statistika.html',
    'public/assets/laporan-engine.js', 'public/assets/posttest-engine.js', 'public/assets/stat-sim.js', 'public/assets/theme.css', 'public/assets/theme.js', 'public/assets/logo-datmin.png',
    'package.json', 'package-lock.json',
  ];
  const KNOWN = ['$schema', 'functions', 'headers', 'buildCommand', 'outputDirectory', 'framework', 'installCommand', 'rewrites', 'redirects', 'cleanUrls', 'trailingSlash', 'regions', 'crons'];
  const glob = (p) => new RegExp('^' + p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*') + '$');

  G.__runJson = (src) => {
    let err = 0, warn = 0, cfg;
    const good = (m) => console.log('✓ ' + m);
    const bad = (m) => { err++; console.error('✗ ' + m); };
    const hmm = (m) => { warn++; console.warn('! ' + m); };
    console.log('▲ vercel build (simulasi) · datmin-autograder-monitor');
    try { cfg = JSON.parse(src); } catch (e) {
      const m = /line (\d+)/.exec(e.message) || /position (\d+)/.exec(e.message);
      const line = m ? (/line/.test(m[0]) ? +m[1] : src.slice(0, +m[1]).split('\n').length) : null;
      bad(`vercel.json bukan JSON yang valid${line ? ` (sekitar baris ${line})` : ''}: ${e.message}`);
      console.log('Build GAGAL.');
      return __done();
    }
    Object.keys(cfg).forEach((k) => KNOWN.includes(k) || hmm(`properti "${k}" tidak dikenal Vercel dan akan diabaikan`));
    if (cfg.framework != null) hmm(`framework "${cfg.framework}": proyek ini HTML + fungsi biasa, sebaiknya null`);
    if (cfg.buildCommand) {
      const f = /^node\s+(\S+)/.exec(cfg.buildCommand);
      if (f && !FILES.includes(f[1])) bad(`buildCommand menjalankan ${f[1]}, tetapi file itu tidak ada`);
      else good(`buildCommand: ${cfg.buildCommand}`);
    }
    const outDir = cfg.outputDirectory || 'public';
    const pub = FILES.filter((f) => f.startsWith(outDir + '/'));
    if (pub.length) good(`outputDirectory "${outDir}" → ${pub.length} file statis disajikan lewat CDN`);
    else bad(`outputDirectory "${outDir}" tidak ada atau kosong`);
    const fns = FILES.filter((f) => /^api\/[^/]+\.js$/.test(f));
    const fnCfg = cfg.functions || {};
    Object.entries(fnCfg).forEach(([p, c]) => {
      if (!fns.some((f) => glob(p).test(f))) return bad(`The pattern "${p}" defined in \`functions\` doesn't match any Serverless Functions inside the \`api\` directory.`);
      const d = c.maxDuration;
      if (d !== undefined && !(Number.isInteger(d) && d >= 1)) return bad(`${p}: maxDuration harus bilangan bulat ≥ 1`);
      if (d > 800) return bad(`${p}: maxDuration ${d} s melebihi batas maksimum Vercel (800 s, paket Pro)`);
      if (d > 300) hmm(`${p}: maxDuration ${d} s hanya bisa di paket Pro (Hobby maksimal 300 s)`);
      let inc = '';
      if (c.includeFiles) {
        const n = FILES.filter((f) => glob(c.includeFiles).test(f)).length;
        if (!n) hmm(`${p}: includeFiles "${c.includeFiles}" tidak cocok dengan file apa pun`);
        inc = `, +${n} file disertakan`;
      }
      good(`λ /${p.replace(/\.js$/, '')}  (maxDuration ${d ?? 'bawaan'} s${inc})`);
    });
    fns.filter((f) => !Object.keys(fnCfg).some((p) => glob(p).test(f))).forEach((f) => good(`λ /${f.replace(/\.js$/, '')}  (pengaturan bawaan)`));
    (cfg.headers || []).forEach((h, i) => {
      if (typeof h.source !== 'string' || !Array.isArray(h.headers)) return bad(`headers[${i}] wajib punya "source" (string) dan "headers" (array)`);
      h.headers.forEach((x) => (x && typeof x.key === 'string' && typeof x.value === 'string'
        ? good(`header ${x.key}: ${x.value}  → ${h.source}`)
        : bad(`headers[${i}]: setiap header wajib punya "key" dan "value" berupa string`)));
    });
    console.log(err ? `Build GAGAL: ${err} galat, ${warn} peringatan.` : `Build berhasil${warn ? ` dengan ${warn} peringatan` : ''}. Siap di-deploy: vercel --prod`);
    __done();
  };
}

export default {
  title: 'Validasi vercel.json sebelum deploy',
  intro: 'Ini <code>vercel.json</code> asli proyek penilaian otomatis. Tombol Jalankan mensimulasikan tahap awal <code>vercel build</code>: konfigurasi dicocokkan dengan daftar file proyek yang sebenarnya, lalu ditampilkan fungsi serverless yang akan dibuat.',
  file: 'vercel.json',
  lang: 'json',
  code,
  setup,
  source: 'Sumber: <code>vercel.json</code> Datmin Automation APP (utuh, 45 baris). Daftar file untuk validasi diambil dari deployment produksinya.',
  tasks: [
    'Ubah <code>maxDuration</code> milik <code>api/simulate.js</code> menjadi <code>900</code>. Apa kata validator?',
    'Tambahkan fungsi <code>"api/nilai.js": { "maxDuration": 60 }</code>. File itu tidak ada, jadi pesan galat apa yang muncul?',
    'Hapus satu koma di tengah file. Validator menunjukkan baris berapa?',
    'Ganti <code>includeFiles</code> milik <code>api/key.js</code> menjadi <code>data/kunci/**</code>. Mengapa ini berbahaya walaupun build "berhasil"?',
    'Tambahkan header <code>{ "key": "Cache-Control", "value": "no-store" }</code> agar data nilai tidak di-cache peramban.',
  ],
};
