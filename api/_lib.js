// Fungsi bersama untuk API: sesi login (cookie bertanda tangan HMAC) dan penyimpanan progres per akun.
// File berawalan "_" tidak dijadikan endpoint oleh Vercel.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'sl_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 hari
export const ON_VERCEL = !!process.env.VERCEL;

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  // Tanpa SESSION_SECRET: turunkan kunci dari token Blob (rahasia sisi server yang sudah ada).
  const blob = process.env.BLOB_READ_WRITE_TOKEN;
  if (blob) return createHash('sha256').update('sams-lab-session-v1:' + blob).digest('hex');
  if (ON_VERCEL) throw new Error('SESSION_SECRET atau BLOB_READ_WRITE_TOKEN belum diatur');
  return 'dev-only-secret';
};
const sign = (data) => createHmac('sha256', secret()).update(data).digest();

export function json(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 256 * 1024) throw new Error('Body terlalu besar');
  }
  return raw ? JSON.parse(raw) : {};
}

export function sessionCookie(user) {
  const payload = b64u(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + MAX_AGE }));
  const value = `${payload}.${b64u(sign(payload))}`;
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${ON_VERCEL ? '; Secure' : ''}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${ON_VERCEL ? '; Secure' : ''}`;

export function getUser(req) {
  const raw = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!raw) return null;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig) return null;
  const want = sign(payload), got = Buffer.from(sig, 'base64url');
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return user.exp > Date.now() / 1000 ? user : null;
  } catch { return null; }
}

// Memverifikasi ID token dari tombol "Sign in with Google" lewat endpoint tokeninfo milik Google.
export async function verifyGoogleToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw Object.assign(new Error('Login Google belum dikonfigurasi'), { status: 503 });
  const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!r.ok) throw Object.assign(new Error('Token Google tidak valid'), { status: 401 });
  const c = await r.json();
  const okIss = c.iss === 'accounts.google.com' || c.iss === 'https://accounts.google.com';
  if (c.aud !== clientId || !okIss || Number(c.exp) * 1000 < Date.now() || String(c.email_verified) !== 'true') {
    throw Object.assign(new Error('Token Google ditolak'), { status: 401 });
  }
  return { sub: c.sub, email: c.email, name: c.name || c.email, picture: c.picture || '' };
}

// ---------- penyimpanan progres: satu file JSON privat per akun di Vercel Blob ----------
const memory = new Map(); // dipakai hanya saat dijalankan lokal tanpa token Blob
const useMemory = () => !process.env.BLOB_READ_WRITE_TOKEN && !ON_VERCEL;
const pathFor = (sub) => `progress/${createHmac('sha256', secret()).update(String(sub)).digest('hex').slice(0, 32)}.json`;
export const emptyRecord = () => ({ v: 1, solved: {}, history: [], updatedAt: null });

export async function loadRecord(sub) {
  if (useMemory()) return structuredClone(memory.get(sub) || emptyRecord());
  const { get } = await import('@vercel/blob');
  const res = await get(pathFor(sub), { access: 'private', useCache: false });
  if (!res || res.statusCode !== 200) return emptyRecord();
  const text = await new Response(res.stream).text();
  try { return { ...emptyRecord(), ...JSON.parse(text) }; } catch { return emptyRecord(); }
}

export async function saveRecord(sub, record) {
  record.updatedAt = new Date().toISOString();
  if (useMemory()) { memory.set(sub, structuredClone(record)); return; }
  const { put } = await import('@vercel/blob');
  await put(pathFor(sub), JSON.stringify(record), {
    access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60,
  });
}

const HISTORY_MAX = 1000;
const ID_RE = /^[a-z0-9-]{1,64}$/;

// Menggabungkan kiriman klien: jawaban benar tidak pernah hilang (OR), riwayat ditambahkan di akhir.
export function mergeRecord(record, body) {
  for (const [topic, arr] of Object.entries(body.solved || {})) {
    if (!ID_RE.test(topic) || !Array.isArray(arr)) continue;
    const cur = record.solved[topic] || [];
    arr.slice(0, 50).forEach((v, i) => { if (v === true) cur[i] = true; });
    record.solved[topic] = Array.from({ length: cur.length }, (_, i) => cur[i] === true);
  }
  for (const e of (body.events || []).slice(0, 100)) {
    if (!e || !ID_RE.test(e.topic) || !Number.isInteger(e.q) || e.q < 0 || e.q > 50) continue;
    record.history.push({
      at: typeof e.at === 'string' ? e.at.slice(0, 30) : new Date().toISOString(),
      topic: e.topic, q: e.q, ok: e.ok === true, answer: String(e.answer ?? '').slice(0, 80),
    });
  }
  if (record.history.length > HISTORY_MAX) record.history = record.history.slice(-HISTORY_MAX);
  return record;
}
