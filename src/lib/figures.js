// Gambar asli (foto, lukisan, dokumen) untuk bacaan sejarah.
// Semua diambil dari Wikimedia Commons dengan lisensi bebas (domain publik / CC0 / CC BY / CC BY-SA)
// dan disimpan di img/sejarah/. Data kredit ada di figures-data.js.
import FIGS from './figures-data.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// fig('kunci', 'Keterangan gambar') → <figure> dengan kredit pembuat, lisensi, dan tautan sumber.
export function fig(key, caption) {
  const f = FIGS[key];
  if (!f) throw new Error(`Gambar sejarah "${key}" belum ada di figures-data.js`);
  const who = f.artist ? `${esc(f.artist)} · ` : '';
  const lic = f.licenseUrl ? `<a href="${esc(f.licenseUrl)}" target="_blank" rel="noopener">${esc(f.license)}</a>` : esc(f.license);
  return `<figure class="hist-fig">
    <img src="${esc(f.src)}" alt="${esc(caption)}" width="${f.w}" height="${f.h}" loading="lazy" decoding="async">
    <figcaption>${caption}<span class="credit">Sumber: ${who}${lic} · <a href="${esc(f.page)}" target="_blank" rel="noopener">Wikimedia Commons</a></span></figcaption>
  </figure>`;
}

// Dua gambar berdampingan (bertumpuk di layar ponsel).
export const pair = (a, b) => `<div class="fig-pair">${a}${b}</div>`;
