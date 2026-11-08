// GET: siapa yang sedang login · POST {credential}: login dengan ID token Google · DELETE: keluar.
import { json, readBody, getUser, sessionCookie, clearCookie, verifyGoogleToken, ON_VERCEL } from './_lib.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return json(res, 200, { user: getUser(req), clientId: process.env.GOOGLE_CLIENT_ID || null, devLogin: !ON_VERCEL && process.env.DEV_LOGIN === '1' });
    }
    if (req.method === 'POST') {
      const body = await readBody(req);
      let user;
      if (body.dev && !ON_VERCEL && process.env.DEV_LOGIN === '1') {
        user = { sub: 'dev-user', email: 'dev@localhost', name: 'Pengguna Lokal', picture: '' };
      } else {
        if (typeof body.credential !== 'string' || body.credential.length > 4096) return json(res, 400, { error: 'credential wajib diisi' });
        user = await verifyGoogleToken(body.credential);
      }
      return json(res, 200, { user }, { 'Set-Cookie': sessionCookie(user) });
    }
    if (req.method === 'DELETE') return json(res, 200, { user: null }, { 'Set-Cookie': clearCookie() });
    res.setHeader('Allow', 'GET, POST, DELETE');
    return json(res, 405, { error: 'Metode tidak didukung' });
  } catch (e) {
    return json(res, e.status || 500, { error: e.message });
  }
}
