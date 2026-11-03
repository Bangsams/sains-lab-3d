// IDE mini untuk Lab Kode: editor bernomor baris dengan pewarna sintaks, dijalankan di iframe sandbox.
// Kode pengguna tidak punya akses jaringan maupun ke halaman ini; Google API dan server diganti tiruan.
export const MAX_LINES = 100;
const TIMEOUT = 6000;

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

// ---------- pewarna sintaks (cukup untuk membaca, bukan parser lengkap) ----------
const JS_RE = new RegExp([
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/.source,                                   // 1 komentar
  /('(?:\\.|[^'\\\n])*'?|"(?:\\.|[^"\\\n])*"?|`(?:\\.|[^`\\])*`?)/.source,  // 2 string
  /((?<=[(,=:[!&|?{};]\s*)\/(?![/*])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n])+\/[dgimsuy]*)/.source, // 3 regex
  /\b(const|let|var|function|return|if|else|for|while|of|in|new|async|await|try|catch|finally|throw|typeof|continue|break|true|false|null|undefined)\b/.source, // 4
  /(\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)/.source,                               // 5 angka
].join('|'), 'g');
const JSON_RE = /("(?:\\.|[^"\\\n])*")(\s*:)?|(-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|\b(true|false|null)\b/g;

export function highlight(code, lang) {
  const re = lang === 'json' ? JSON_RE : JS_RE;
  re.lastIndex = 0;
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    if (!m[0]) { re.lastIndex++; continue; }
    out += esc(code.slice(last, m.index));
    const cls = lang === 'json'
      ? (m[1] ? (m[2] ? 'p' : 's') : m[3] ? 'n' : 'k')
      : (m[1] ? 'c' : m[2] ? 's' : m[3] ? 'r' : m[4] ? 'k' : 'n');
    out += lang === 'json' && m[2]
      ? `<span class="tk-p">${esc(m[1])}</span>${esc(m[2])}`
      : `<span class="tk-${cls}">${esc(m[0])}</span>`;
    last = re.lastIndex;
  }
  return out + esc(code.slice(last));
}

// ---------- lingkungan di dalam iframe (dijalankan lewat toString, jadi harus berdiri sendiri) ----------
function prelude() {
  const post = (t, text, line) => parent.postMessage({ t, text, line }, '*');
  const show = (x) => (x instanceof Uint8Array ? `${x.constructor.name}(${x.length})` : x);
  const fmt = (v) => {
    if (typeof v === 'string') return v;
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (v instanceof Uint8Array) return show(v);
    try { return JSON.stringify(v, (k, x) => show(x), 2) ?? String(v); } catch { return String(v); }
  };
  const out = (t) => (...a) => post(t, a.map(fmt).join(' '));
  console.log = console.info = out('log'); console.warn = out('warn'); console.error = out('error');
  const lineOf = (e) => { const m = /about:srcdoc:(\d+)/.exec((e && e.stack) || ''); return m ? +m[1] : null; };
  globalThis.__error = (e) => post('error', fmt(e), lineOf(e));
  globalThis.__done = () => post('done');
  addEventListener('error', (e) => { post('error', e.message, e.lineno); post('done'); });

  // SHA-256 (sinkron, seperti crypto.createHash di Node)
  const K = [], H0 = [];
  for (let n = 2, c = 0; c < 64; n++) {
    if ([...Array(n).keys()].slice(2).some((d) => n % d === 0)) continue;
    if (c < 8) H0.push((Math.sqrt(n) % 1) * 2 ** 32 | 0);
    K.push((Math.cbrt(n) % 1) * 2 ** 32 | 0); c++;
  }
  function sha256(bytes) {
    const l = bytes.length, words = new Uint32Array(((l + 9 + 63) >> 6) << 4);
    const p = new Uint8Array(words.length * 4);
    p.set(bytes); p[l] = 0x80;
    const dv = new DataView(p.buffer);
    dv.setUint32(p.length - 4, l * 8);
    const h = H0.slice(), w = new Array(64);
    for (let i = 0; i < p.length; i += 64) {
      for (let j = 0; j < 64; j++) {
        if (j < 16) w[j] = dv.getUint32(i + j * 4);
        else {
          const a = w[j - 15], b = w[j - 2];
          w[j] = (((a >>> 7 | a << 25) ^ (a >>> 18 | a << 14) ^ (a >>> 3)) + w[j - 7] + ((b >>> 17 | b << 15) ^ (b >>> 19 | b << 13) ^ (b >>> 10)) + w[j - 16]) | 0;
        }
      }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let j = 0; j < 64; j++) {
        const t1 = (hh + ((e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7)) + ((e & f) ^ (~e & g)) + K[j] + w[j]) | 0;
        const t2 = (((a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, c, d, e, f, g, hh].forEach((x, k) => { h[k] = (h[k] + x) | 0; });
    }
    const o = new Uint8Array(32), ov = new DataView(o.buffer);
    h.forEach((x, k) => ov.setUint32(k * 4, x));
    return o;
  }

  const enc = (d) => (typeof d === 'string' ? new TextEncoder().encode(d) : d);
  const cat = (parts) => { const o = new Uint8Array(parts.reduce((n, x) => n + x.length, 0)); let i = 0; parts.forEach((x) => { o.set(x, i); i += x.length; }); return o; };
  class Buffer extends Uint8Array {
    static from(x, e) {
      if (typeof x === 'string' && e === 'base64') {
        const s = x.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
        const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
        return Buffer.from(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
      }
      const src = enc(x), b = new Buffer(src.length);
      b.set(src);
      return b;
    }
    toString(e) {
      if (e === 'base64') { let s = ''; this.forEach((x) => { s += String.fromCharCode(x); }); return btoa(s); }
      if (e === 'hex') return [...this].map((x) => x.toString(16).padStart(2, '0')).join('');
      return new TextDecoder().decode(this);
    }
  }
  const crypto = {
    createHash(alg) {
      if (alg !== 'sha256') throw new Error(`Lab Kode hanya menyediakan sha256 (diminta ${alg})`);
      const parts = [];
      return { update(d) { parts.push(enc(d)); return this; }, digest(e) { const b = Buffer.from(sha256(cat(parts))); return e ? b.toString(e) : b; } };
    },
    timingSafeEqual(a, b) {
      if (a.length !== b.length) throw new RangeError('Input buffers must have the same byte length');
      let d = 0;
      for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
      return d === 0;
    },
    // RS256 asli butuh private key RSA; di lab tanda tangan disimulasikan dengan SHA-256(data + kunci).
    createSign() {
      const parts = [];
      return {
        update(d) { parts.push(enc(d)); return this; },
        sign(key) {
          if (!String(key).includes('PRIVATE KEY')) throw new Error('error:1E08010C:DECODER routines::unsupported (private_key tidak valid)');
          return Buffer.from(sha256(cat([...parts, enc(key)])));
        },
      };
    },
  };
  Object.assign(globalThis, {
    Buffer,
    process: { env: {} },
    module: { exports: {} },
    require: (n) => { if (n === 'crypto') return crypto; throw new Error(`Modul "${n}" tidak tersedia di Lab Kode`); },
    __routes: [],
    fetch: async (url, opts = {}) => {
      const u = new URL(url, 'https://lab.local');
      const r = globalThis.__routes.find((x) => x.path === u.pathname);
      if (!r) throw new TypeError(`Failed to fetch ${u.pathname}: jaringan dimatikan, hanya server tiruan yang tersedia`);
      return r.handle(u, opts);
    },
  });
}

function buildDoc(lab, code) {
  const safe = (s) => s.replace(/<\/script/gi, '<\\/script');
  const setup = lab.setup ? `(${lab.setup.toString()})(globalThis);` : '';
  const head = '<!doctype html><meta charset="utf-8">'
    + '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'">'
    + `<script>(${prelude.toString()})();\n${safe(setup)}<\/script>\n<script>\n`;
  const body = lab.lang === 'json'
    ? `__runJson(${JSON.stringify(code).replace(/</g, '\\u003c')});`
    : `(async () => {\n${safe(code)}\n})().then(__done, (e) => { __error(e); __done(); });`;
  // baris dokumen tempat baris 1 kode pengguna berada
  return { doc: head + body + '\n<\/script>', first: head.split('\n').length + (lab.lang === 'json' ? 0 : 1) };
}

// ---------- komponen ----------
export function mountIde(el, lab, storeKey) {
  let saved = null;
  try { saved = localStorage.getItem(storeKey); } catch { /* abaikan */ }
  el.innerHTML = `
    <div class="ide-head">
      <div>
        <p class="eyebrow">Lab kode · maksimal ${MAX_LINES} baris</p>
        <h2>${lab.title}</h2>
        <p>${lab.intro}</p>
      </div>
    </div>
    <div class="ide-grid">
      <div class="ide-editor">
        <div class="ide-bar">
          <span class="ide-file">${lab.file}</span>
          <span class="ide-count" aria-live="polite"></span>
          <span class="ide-actions">
            <button type="button" class="ghost" data-act="reset">Kembalikan kode asli</button>
            <button type="button" class="primary" data-act="run">▶ Jalankan</button>
          </span>
        </div>
        <div class="ide-code">
          <pre class="ide-gutter" aria-hidden="true"></pre>
          <div class="ide-area">
            <pre class="ide-hl" aria-hidden="true"></pre>
            <textarea spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" aria-label="Editor kode ${lab.file}"></textarea>
          </div>
        </div>
        <p class="ide-hint">Ctrl/⌘ + Enter untuk menjalankan · Tab menambah indentasi (tekan Esc dulu untuk keluar dari editor) · perubahanmu tersimpan di peramban ini.</p>
      </div>
      <div class="ide-side">
        <div class="ide-console">
          <div class="ide-bar"><span class="ide-file">Konsol</span><button type="button" class="ghost" data-act="clear">Bersihkan</button></div>
          <div class="ide-out" role="log" aria-live="polite"></div>
        </div>
        <div class="ide-tasks">
          <h3>Tantangan</h3>
          <ol>${lab.tasks.map((t) => `<li>${t}</li>`).join('')}</ol>
          <p class="ide-src">${lab.source}</p>
        </div>
      </div>
    </div>`;
  const ta = el.querySelector('textarea'), hl = el.querySelector('.ide-hl'), gutter = el.querySelector('.ide-gutter');
  const count = el.querySelector('.ide-count'), out = el.querySelector('.ide-out');
  const runBtn = el.querySelector('[data-act="run"]');
  let lines = 0, stop = null, escaped = false;

  const sync = () => { hl.scrollTop = gutter.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; };
  function refresh() {
    const code = ta.value;
    lines = code.split('\n').length;
    hl.innerHTML = highlight(code, lab.lang) + '\n';
    gutter.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n') + '\n';
    count.textContent = `${lines} / ${MAX_LINES} baris`;
    count.classList.toggle('over', lines > MAX_LINES);
    runBtn.disabled = lines > MAX_LINES || !!stop;
    sync();
  }
  const setCode = (c) => { ta.value = c; refresh(); };
  const save = () => { try { localStorage.setItem(storeKey, ta.value); } catch { /* abaikan */ } };
  const log = (type, text, line) => {
    const row = document.createElement('div');
    row.className = `ide-line ${type}`;
    row.textContent = text;
    if (line) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ide-goto'; b.textContent = `baris ${line}`;
      b.onclick = () => goto(line);
      row.prepend(b);
    }
    out.append(row);
    out.scrollTop = out.scrollHeight;
  };
  function goto(line) {
    const v = ta.value.split('\n');
    const start = v.slice(0, line - 1).join('\n').length + (line > 1 ? 1 : 0);
    ta.focus();
    ta.setSelectionRange(start, start + (v[line - 1] || '').length);
    ta.scrollTop = Math.max(0, (line - 4) * parseFloat(getComputedStyle(ta).lineHeight));
  }

  function run() {
    if (stop || lines > MAX_LINES) return;
    out.textContent = '';
    log('muted', `▶ node ${lab.file}${lab.lang === 'json' ? '  (validasi konfigurasi)' : ''}`);
    const code = ta.value;
    const { doc, first } = buildDoc(lab, code);
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.title = 'Runner Lab Kode';
    frame.className = 'ide-frame';
    const t0 = performance.now();
    const onMsg = (e) => {
      if (e.source !== frame.contentWindow || !e.data) return;
      const { t, text, line } = e.data;
      if (t === 'done') return finish(false);
      const n = line ? line - first + 1 : 0;
      log(t, text, n >= 1 && n <= lines ? n : null);
    };
    const timer = setTimeout(() => { log('error', `Dihentikan: berjalan lebih dari ${TIMEOUT / 1000} detik (periksa perulangan tanpa akhir).`); finish(true); }, TIMEOUT);
    function finish() {
      clearTimeout(timer);
      window.removeEventListener('message', onMsg);
      frame.remove();
      stop = null;
      log('muted', `Selesai dalam ${Math.round(performance.now() - t0)} ms`);
      refresh();
    }
    stop = finish;
    window.addEventListener('message', onMsg);
    document.body.append(frame);
    frame.srcdoc = doc;
    refresh();
  }

  ta.addEventListener('input', () => { refresh(); save(); });
  ta.addEventListener('scroll', sync);
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { escaped = true; return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); return; }
    if (e.key === 'Tab' && !e.shiftKey && !escaped) {
      e.preventDefault();
      ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end');
      refresh(); save();
    }
    escaped = false;
  });
  runBtn.onclick = run;
  el.querySelector('[data-act="reset"]').onclick = () => { setCode(lab.code); save(); };
  el.querySelector('[data-act="clear"]').onclick = () => { out.textContent = ''; };
  setCode(saved ?? lab.code);
  log('muted', 'Tekan ▶ Jalankan untuk mengeksekusi kode di sandbox.');
  return { destroy: () => stop && stop() };
}
