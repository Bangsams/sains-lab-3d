// Membuat dist/standalone.html: satu file berisi seluruh kode aplikasi (three.js tetap dari CDN).
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const res = await build({
  entryPoints: ['src/main.js'], bundle: true, format: 'esm', write: false,
  external: ['three', 'three/addons/*'], minify: true, target: 'es2020',
});
const js = res.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const html = readFileSync('index.html', 'utf8').replace('<script type="module" src="./src/main.js"></script>', () => `<script type="module">${js}</script>`);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/standalone.html', html);
// versi tanpa kerangka dokumen untuk dipublikasikan sebagai Artifact
const inner = html
  .replace(/<!doctype html>\s*<html[^>]*>\s*<head>/i, '')
  .replace(/<meta charset="utf-8">\s*<meta name="viewport"[^>]*>/i, '')
  .replace(/<\/head>\s*<body>/i, '')
  .replace(/<\/body>\s*<\/html>\s*$/i, '');
writeFileSync('dist/artifact.html', inner);
console.log('dist/standalone.html', html.length, 'bytes');
