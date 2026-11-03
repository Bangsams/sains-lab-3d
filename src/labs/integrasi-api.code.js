// Dibuat dari kode asli Datmin Automation APP. Jangan diedit manual.
export default `// Sumber: lib/stat-google.js baris 1–27, lib/auth.js baris 3–20,
// public/stat-monitoring.html baris 157, 159–164 · Datmin Automation APP
// Akses Google Sheets & Drive untuk Statistika 2 memakai service account (tanpa dependensi).
// Kredensial dari env STAT_GOOGLE_SA, atau GOOGLE_SERVICE_ACCOUNT_JSON milik aplikasi Analitika
// (isi file JSON service account, mentah atau base64).
const crypto = require('crypto');

let cached = null; // { token, exp }

function credentials() {
  const raw = process.env.STAT_GOOGLE_SA || process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '';
  if (!raw) throw Object.assign(new Error('Service account belum diset di Vercel (STAT_GOOGLE_SA / GOOGLE_SERVICE_ACCOUNT_JSON)'), { status: 500 });
  const txt = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  const sa = JSON.parse(txt);
  return { email: sa.client_email, key: sa.private_key.replace(/\\\\n/g, '\\n') };
}

const b64url = (x) => Buffer.from(x).toString('base64').replace(/=+$/, '').replace(/\\+/g, '-').replace(/\\//g, '_');

async function token() {
  if (cached && cached.exp > Date.now() + 60000) return cached.token;
  const { email, key } = credentials();
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({
    iss: email, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly'
  }));
  const sig = crypto.createSign('RSA-SHA256').update(head + '.' + body).sign(key);
  return head + '.' + body + '.' + b64url(sig); // [lab] kode asli lanjut menukar JWT ke oauth2.googleapis.com/token
}

/** Dashboard berisi nilai mahasiswa → wajib password (env DASHBOARD_PASSWORD). */
function requireAuth(req, res) {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) {
    res.status(500).json({ error: 'DASHBOARD_PASSWORD belum diset di Vercel' });
    return false;
  }
  const got = String(req.headers['x-dashboard-password'] || '');
  const a = crypto.createHash('sha256').update(got).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  if (!crypto.timingSafeEqual(a, b)) {
    res.status(401).json({ error: 'Password salah' });
    return false;
  }
  return true;
}

module.exports = { requireAuth };

let password = '';
async function api(path) {
  const res = await fetch(path, { headers: { 'x-dashboard-password': password } });
  const data = await res.json().catch(() => ({ error: 'Respons tidak valid (' + res.status + ')' }));
  if (!res.ok) { const e = new Error(data.error || res.statusText); e.status = res.status; throw e; }
  return data;
}

// ======================= Uji coba (boleh diubah) =======================
// Server tiruan /api/stat: memeriksa password persis seperti api/stat.js
pasangApi(async (req, res) => {
  if (!requireAuth(req, res)) return;
  res.status(200).json({ asisten: ['DM-116', 'DM-120'], modul: ['TTEST', 'ANOVA'] });
});

password = 'tebakan-salah';
try { await api('/api/stat?action=config'); } catch (e) { console.log('Password salah →', e.status, e.message); }

password = 'praktikum-2026'; // sama dengan process.env.DASHBOARD_PASSWORD di server tiruan
console.log('Password benar →', await api('/api/stat?action=config'));

const jwt = await token();
const [h, b, s] = jwt.split('.');
console.log('JWT header :', JSON.parse(Buffer.from(h, 'base64').toString()));
console.log('JWT payload:', JSON.parse(Buffer.from(b, 'base64').toString()));
console.log('Tanda tangan (disimulasikan):', s.slice(0, 24) + '…');`;
