// GET: progres & riwayat soal milik akun yang login · POST {solved, events}: tambahkan jawaban baru.
import { json, readBody, getUser, loadRecord, saveRecord, mergeRecord } from './_lib.js';

export default async function handler(req, res) {
  const user = getUser(req);
  if (!user) return json(res, 401, { error: 'Silakan masuk dengan akun Google dulu' });
  try {
    if (req.method === 'GET') return json(res, 200, await loadRecord(user.sub));
    if (req.method === 'POST') {
      const body = await readBody(req);
      const record = mergeRecord(await loadRecord(user.sub), body);
      await saveRecord(user.sub, record);
      return json(res, 200, record);
    }
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'Metode tidak didukung' });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: 'Gagal mengakses penyimpanan progres' });
  }
}
