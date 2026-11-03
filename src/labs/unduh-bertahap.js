import code from './unduh-bertahap.code.js';

// Server tiruan /api/stat?action=pdf; dijalankan di iframe lewat toString(), jadi harus berdiri sendiri.
function setup(G) {
  G.pasangServerPdf = ({ ukuran, chunk }) => {
    const size = Math.round(ukuran), BATAS = 4.5 * 1024 * 1024;
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) data[i] = 32 + (i % 90);
    data.set(new TextEncoder().encode('%PDF-1.7\n'), 0);
    data[size - 1] = 0x0a;
    let n = 0;
    const json = (s, o) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });
    G.__routes.push({
      path: '/api/stat',
      async handle(u) {
        n++;
        const q = Object.fromEntries(u.searchParams);
        if (q.action !== 'pdf') return json(400, { error: 'action tidak dikenal' });
        if (q.meta) { console.log(`  [server] #${n} meta → size=${size}, chunk=${chunk}`); return json(200, { size, chunk }); }
        const start = Number(q.start) || 0;
        const part = data.slice(start, start + chunk);
        await new Promise((r) => setTimeout(r, 40 + part.length / 60000));
        const mb = (part.length / 1048576).toFixed(2).replace('.', ',');
        if (part.length > BATAS) { console.log(`  [server] #${n} start=${start} → 413 (${mb} MB > 4,5 MB)`); return json(413, { error: 'FUNCTION_PAYLOAD_TOO_LARGE' }); }
        console.log(`  [server] #${n} start=${start} → 200 (${mb} MB)`);
        return new Response(part, { status: 200, headers: { 'content-type': 'application/octet-stream' } });
      },
    });
  };
}

export default {
  title: 'Unduh PDF besar per potongan',
  intro: 'Fungsi <code>downloadDrive()</code> asli dari halaman Monitoring & Simulasi: minta metadata dulu, lalu ambil potongan demi potongan dan tempel di posisinya dengan <code>Uint8Array.set()</code>. Server tiruan memotong PDF 7,5 MB dan menolak respons di atas 4,5 MB, seperti batas fungsi Vercel.',
  file: 'stat-monitoring.html',
  lang: 'js',
  code,
  setup,
  source: 'Sumber: <code>api/stat.js</code> baris 5 &amp; 12, <code>public/stat-monitoring.html</code> baris 157, 159–164, 298–309 (asli). Server tiruan menggantikan Google Drive.',
  tasks: [
    'Ubah <code>CHUNK</code> menjadi <code>6 * 1024 * 1024</code>. Apa yang terjadi, dan pesan galat apa yang dilempar <code>downloadDrive()</code>?',
    'Ubah <code>CHUNK</code> menjadi <code>512 * 1024</code>. Berapa permintaan yang dikirim sekarang, dan berapa lama selesainya?',
    'Di <code>downloadDrive()</code>, ganti <code>out.set(..., start)</code> menjadi <code>out.set(..., 0)</code>. Mengapa header PDF dan byte terakhir jadi rusak?',
    'Ubah <code>ukuran</code> menjadi <code>30 * 1024 * 1024</code>. Cocokkan jumlah potongan dengan rumus <code>k = ⌈S / c⌉</code> di simulasi 3D.',
  ],
};
