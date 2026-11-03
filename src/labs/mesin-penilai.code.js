// Dibuat dari kode asli Datmin Automation APP. Jangan diedit manual.
export default `// Sumber: public/assets/posttest-engine.js · Datmin Automation APP
// Baris 12–22, 174–195, 305–332 (asli, hanya indentasi dirapikan).

// ---------------------------------------------------------------- teks
// panjang teks dipertahankan per karakter ("…" → ".", "ﬁ" → "f") agar posisi tetap sejajar dengan teks asli & penanda OCR
const norm = (s) => {
  let out = '';
  for (const ch of String(s)) {
    let n = ch.normalize('NFKC').toLowerCase();
    if (n.length !== ch.length) n = (n + '  ').slice(0, ch.length);
    out += n;
  }
  return out.replace(/[‐-―−]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/ /g, ' ');
};

// ---------------------------------------------------------------- angka (termasuk notasi ilmiah)
function numbersIn(t, base) {
  const out = [];
  const re = /(-?\\d+(?:[.,]\\d+)?)(?:\\s*(?:e|x\\s*10\\s*\\^?|×\\s*10\\s*\\^?|\\*\\s*10\\s*\\^?)\\s*([-+]?\\s*\\d{1,3}))?/g;
  let m;
  while ((m = re.exec(t))) {
    const mant = parseFloat(m[1].replace(',', '.'));
    if (!isFinite(mant)) continue;
    const exp = m[2] ? parseInt(m[2].replace(/\\s/g, ''), 10) : 0;
    const dec = (m[1].split(/[.,]/)[1] || '').length;
    out.push({ v: Math.abs(mant * Math.pow(10, exp)), raw: m[0], dec, sci: !!m[2], s: base + m.index, e: base + m.index + m[0].length });
  }
  return out;
}
function close(v, k, dec, sci) {
  if (k === 0) return v === 0;
  const rel = Math.abs(v - k) / Math.abs(k);
  if (sci) return rel <= 0.03;
  if (rel <= 0.005) return true;
  const f = Math.pow(10, Math.min(dec, 6));
  return dec > 0 && Math.abs(Math.round(v * f) - Math.round(k * f)) <= 1 && rel <= 0.02;
}

const H0_RE = /h\\s*[0o₀](?![\\d.,])|hipotesis\\s*nol/g;
const KATA_RE = /tidak\\s*di\\s*tolak|gagal\\s*di\\s*tolak|di\\s*tolak|di\\s*terima|\\btolak|\\bterima/;
/** Keputusan terakhir yang disebut (kalimat kesimpulan biasanya paling akhir). */
function decision(t, base) {
  const hits = [];
  let m;
  const h0 = new RegExp(H0_RE.source, 'g');
  while ((m = h0.exec(t))) {
    // "H0 ... diterima/ditolak" (≤ 30 karakter, satu kalimat) → kata keputusan pertama yang muncul
    const after = t.slice(m.index + m[0].length, m.index + m[0].length + 40).replace(/\\n/g, ' ').split(/\\.\\s/)[0];
    const k = KATA_RE.exec(after);
    if (k) { hits.push({ d: /terima|tidak|gagal/.test(k[0]) ? 'terima' : 'tolak', i: m.index, e: m.index + m[0].length + k.index + k[0].length }); continue; }
    // "menolak H0" / "menerima H0"
    const before = t.slice(Math.max(0, m.index - 12), m.index);
    const kb = /(menolak|tolak|menerima|terima)\\s*$/.exec(before);
    if (kb) hits.push({ d: /terima/.test(kb[1]) ? 'terima' : 'tolak', i: m.index - kb[0].length, e: m.index + m[0].length });
  }
  // kalimat bersyarat ("jika ... maka H0 ditolak") bukan keputusan
  // titik desimal ("0.05") bukan akhir kalimat
  const real = hits.filter((h) => !/\\b(jika|apabila|bila)\\b[^.\\n]{0,80}$/.test(t.slice(Math.max(0, h.i - 80), h.i).replace(/(\\d)[.,](\\d)/g, '$1$2')));
  const pool = real.length ? real : [];
  if (pool.length) { const h = pool.sort((x, y) => x.i - y.i)[pool.length - 1]; return { d: h.d, span: [base + h.i, base + h.e] }; }
  const neg = /tidak\\s*(terdapat|ada)\\s*(perbedaan|hubungan|pengaruh)/.exec(t);
  if (neg) return { d: 'terima', span: [base + neg.index, base + neg.index + neg[0].length], implisit: true };
  const pos = /(terdapat|ada)\\s*(perbedaan|hubungan|pengaruh)/.exec(t);
  if (pos) return { d: 'tolak', span: [base + pos.index, base + pos.index + pos[0].length], implisit: true };
  return null;
}

// ======================= Uji coba (boleh diubah) =======================
const jawaban = \`Hasil uji t: t = −3.214, df = 28, p-value = 0,0032.
Karena p-value < 0.05 maka H0 ditolak.\`;
const kunci = { t: 3.214, p: 0.0032 };

const teks = norm(jawaban);
console.log('Teks ternormalisasi:', teks);
const angka = numbersIn(teks, 0);
console.log('Angka ditemukan:', angka.map((n) => n.raw).join(' | '));
for (const [nama, k] of Object.entries(kunci)) {
  const cocok = angka.find((n) => close(n.v, k, n.dec, n.sci));
  console.log(\`Kunci \${nama} = \${k} →\`, cocok ? \`cocok dengan "\${cocok.raw}"\` : 'TIDAK ditemukan');
}
const kep = decision(teks, 0);
console.log('Keputusan uji:', kep ? \`H0 \${kep.d === 'tolak' ? 'ditolak' : 'diterima'}\` : 'tidak terbaca');`;
