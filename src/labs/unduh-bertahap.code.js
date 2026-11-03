// Dibuat dari kode asli Datmin Automation APP. Jangan diedit manual.
export default `// Sumber: api/stat.js baris 5 & 12, public/stat-monitoring.html
// baris 157, 159–164, 298–309 · Datmin Automation APP
// GET  /api/stat?action=pdf&id=<fileId>&meta=1          → {size, chunk}; &start=N → potongan PDF (maks. 3 MB)
const CHUNK = 3 * 1024 * 1024;

let password = '';
async function api(path) {
  const res = await fetch(path, { headers: { 'x-dashboard-password': password } });
  const data = await res.json().catch(() => ({ error: 'Respons tidak valid (' + res.status + ')' }));
  if (!res.ok) { const e = new Error(data.error || res.statusText); e.status = res.status; throw e; }
  return data;
}

async function downloadDrive(f, status) {
  const meta = await api('/api/stat?action=pdf&meta=1&id=' + encodeURIComponent(f.fileId));
  const out = new Uint8Array(meta.size);
  for (let start = 0; start < meta.size; start += meta.chunk) {
    status(\`mengunduh \${Math.round(100 * start / meta.size)}%…\`);
    const res = await fetch(\`/api/stat?action=pdf&id=\${encodeURIComponent(f.fileId)}&start=\${start}\`, { headers: { 'x-dashboard-password': password } });
    if (!res.ok) throw new Error('Gagal mengunduh (' + res.status + ')');
    out.set(new Uint8Array(await res.arrayBuffer()), start);
  }
  return out;
}


// ======================= Uji coba (boleh diubah) =======================
// Server tiruan memotong PDF 7,5 MB memakai CHUNK di atas (batas respons Vercel 4,5 MB)
password = 'praktikum-2026';
pasangServerPdf({ ukuran: 7.5 * 1024 * 1024, chunk: CHUNK });

const f = { fileId: '1AbC-laporan-D11', name: 'D-11_DM-116_T-Test.pdf' };
const t0 = performance.now();
const pdf = await downloadDrive(f, (m) => console.log(m));
console.log('Selesai:', pdf.length.toLocaleString('id-ID'), 'byte dalam', Math.round(performance.now() - t0), 'ms');
console.log('Header file:', new TextDecoder().decode(pdf.slice(0, 8)));
console.log('Byte terakhir utuh:', pdf[pdf.length - 1] === 0x0a ? 'ya' : 'tidak');`;
