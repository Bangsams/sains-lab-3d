// Server lokal: menyajikan file statis + menjalankan fungsi di folder api/ seperti Vercel.
// Jalankan: npm run dev  (login lokal tanpa Google aktif lewat DEV_LOGIN=1; progres disimpan di memori)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

process.env.DEV_LOGIN ??= '1';
const PORT = Number(process.env.PORT || 5173);
const ROOT = fileURLToPath(new URL('..', import.meta.url)); // folder proyek, dari mana pun dijalankan
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    const api = /^\/api\/([a-z0-9-]+)$/.exec(url.pathname);
    if (api) {
      const mod = await import(pathToFileURL(join(ROOT, 'api', `${api[1]}.js`)).href);
      return await mod.default(req, res);
    }
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
    if (!path || path.endsWith('/') || path.endsWith('\\')) path += 'index.html';
    if (path.startsWith('..') || path.startsWith('api') || path.startsWith('node_modules')) throw Object.assign(new Error('forbidden'), { code: 'ENOENT' });
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' || e.code === 'ERR_MODULE_NOT_FOUND' ? 404 : 500, { 'Content-Type': 'text/plain' });
    res.end(e.code === 'ENOENT' ? 'Not found' : String(e.stack || e));
  }
}).listen(PORT, () => console.log(`Sams Lab lokal: http://localhost:${PORT}  (DEV_LOGIN=${process.env.DEV_LOGIN})`));
