// Lab Rangkaian: seret komponen ke papan, tarik kabel antar terminal, lalu simulasi langsung berjalan.
import { PARTS, simulate, boardFrom, netsOf, fmtSI, runner } from './circuit.js';

const W = 960, H = 560;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const load = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* abaikan */ } };

export function mountWiring(root, lab, storeKey) {
  let task = lab.tasks[0];
  let board, sim, g = {};
  let sel = null;          // { wire: index } atau { comp: id }
  let pending = null;      // terminal yang sedang menunggu pasangan (mode ketuk)
  let hint = null;         // langkah yang sedang disorot
  const done = load(`${storeKey}.done`) || {};

  root.innerHTML = `
    <div class="wl-head">
      <div><p class="eyebrow">Lab rangkaian · seret &amp; sambung</p><h2>${esc(lab.title)}</h2><p>${lab.intro}</p></div>
      <div class="wl-tasks" role="tablist" aria-label="Pilih percobaan"></div>
    </div>
    <div class="wl-body">
      <aside class="wl-tray" aria-label="Kotak komponen">
        <h3>Kotak komponen</h3>
        <p class="wl-small">Seret ke papan (atau klik untuk menaruh). Tarik dari titik terminal ke terminal lain untuk memasang kabel.</p>
        <div class="wl-parts"></div>
      </aside>
      <div class="wl-main">
        <div class="wl-toolbar">
          <button type="button" class="primary" data-act="check">Periksa rangkaian</button>
          <button type="button" class="ghost" data-act="hint">Tunjukkan langkah berikutnya</button>
          <button type="button" class="ghost" data-act="demo">Pasang contoh</button>
          <button type="button" class="ghost" data-act="del" disabled>Hapus yang dipilih</button>
          <button type="button" class="ghost" data-act="clear">Kosongkan papan</button>
          <label class="wl-input" hidden><input type="checkbox" data-act="cmd"><span></span></label>
        </div>
        <div class="wl-board-wrap">
          <svg class="wl-board" viewBox="0 0 ${W} ${H}" role="img" aria-label="Papan rangkaian" tabindex="0">
            <defs>
              <pattern id="wl-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" class="wl-dot"/></pattern>
              <filter id="wl-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="9"/></filter>
            </defs>
            <rect width="${W}" height="${H}" fill="url(#wl-grid)" class="wl-bg"/>
            <g class="wl-wires"></g><g class="wl-comps"></g><path class="wl-temp" d="" hidden/>
          </svg>
        </div>
        <p class="wl-status" role="status" aria-live="polite"></p>
        <p class="wl-events" aria-live="polite"></p>
      </div>
      <aside class="wl-guide" aria-label="Petunjuk wiring">
        <h3>Petunjuk wiring</h3>
        <div class="wl-goal"></div>
        <ol class="wl-steps"></ol>
        <h3>Alat ukur</h3>
        <div class="table-wrap"><table class="wl-read"><thead><tr><th>Komponen</th><th>V</th><th>I</th><th>P</th><th>Status</th></tr></thead><tbody></tbody></table></div>
      </aside>
    </div>`;

  const $ = (s) => root.querySelector(s);
  const svg = $('.wl-board'), gW = $('.wl-wires'), gC = $('.wl-comps'), temp = $('.wl-temp');
  const status = (msg, kind = '') => { const p = $('.wl-status'); p.textContent = msg; p.className = `wl-status ${kind}`; };

  // ---------- tugas ----------
  function drawTasks() {
    $('.wl-tasks').innerHTML = lab.tasks.map((t, i) => `<button type="button" role="tab" aria-selected="${t === task}" data-task="${i}">${done[t.id] ? '✓ ' : ''}${i + 1}. ${esc(t.title)}</button>`).join('');
  }
  $('.wl-tasks').addEventListener('click', (e) => { const b = e.target.closest('[data-task]'); if (b) openTask(lab.tasks[+b.dataset.task]); });

  function openTask(t) {
    task = t; sel = null; pending = null; hint = null;
    const saved = load(`${storeKey}.${t.id}`);
    board = saved && Array.isArray(saved.comps) ? saved : { comps: [], wires: [] };
    board.comps = board.comps.filter((c) => PARTS[c.type] && t.parts.some((p) => p.id === c.id));
    g = { cmd: true };
    const inp = $('.wl-input');
    inp.hidden = !t.input;
    if (t.input) { inp.querySelector('span').textContent = t.input; inp.querySelector('input').checked = true; }
    $('.wl-goal').innerHTML = `<p>${t.goal}</p>`;
    drawTasks();
    status('');
    refresh();
  }

  // ---------- simulasi & gambar ----------
  function refresh(persist = true) {
    sim = simulate(board, g);
    // keadaan MCB trip dan lampu putus disimpan sampai pengguna mengatur ulang
    for (const c of board.comps) { const s = sim.comps.find((x) => x.id === c.id); c.tripped = s.tripped; c.blown = s.blown; }
    draw();
    if (persist) save(`${storeKey}.${task.id}`, board);
  }

  function termPos(key) {
    const [cid, tid] = key.split('.');
    const c = board.comps.find((x) => x.id === cid);
    if (!c) return null;
    const t = PARTS[c.type].terminals.find((x) => x.id === tid);
    return t ? { x: c.x + t.x, y: c.y + t.y, kind: t.kind } : null;
  }
  const curve = (a, b) => {
    const dx = Math.max(40, Math.abs(b.x - a.x) / 2);
    const sa = a.x <= b.x ? 1 : -1;
    return `M${a.x},${a.y} C${a.x + sa * dx},${a.y} ${b.x - sa * dx},${b.y} ${b.x},${b.y}`;
  };

  function draw() {
    // komponen yang belum dipasang tetap di kotak
    const placed = new Set(board.comps.map((c) => c.id));
    $('.wl-parts').innerHTML = task.parts.filter((p) => !placed.has(p.id)).map((p) => `
      <button type="button" class="wl-part" data-part="${p.id}"><span class="wl-pid">${p.id}</span> ${esc(PARTS[p.type].name)}<small>${esc(PARTS[p.type].info || '')}</small></button>`).join('')
      || '<p class="wl-small">Semua komponen sudah di papan.</p>';

    const live = (key) => { const r = sim.parts[key.split('.')[0]]; return r && r.i > 1e-3; };
    gW.innerHTML = board.wires.map((w, i) => {
      const a = termPos(w[0]), b = termPos(w[1]);
      if (!a || !b) return '';
      const kind = a.kind === 'sig' ? b.kind : a.kind;
      const on = live(w[0]) && live(w[1]);
      return `<path class="wl-wire kind-${kind}${sel?.wire === i ? ' sel' : ''}" d="${curve(a, b)}"/>
        <path class="wl-hit" d="${curve(a, b)}" data-wire="${i}"><title>Kabel ${esc(w[0])} ↔ ${esc(w[1])} (klik dua kali untuk menghapus)</title></path>
        ${on ? `<path class="wl-flow" d="${curve(a, b)}"/>` : ''}`;
    }).join('');

    const hl = new Set();
    if (pending) hl.add(pending);
    if (hint) { hl.add(hint.a); hl.add(hint.b); }
    gC.innerHTML = board.comps.map((c) => {
      const d = PARTS[c.type], r = sim.parts[c.id];
      const terms = d.terminals.map((t) => {
        const key = `${c.id}.${t.id}`;
        const used = board.wires.some((w) => w.includes(key));
        const lx = t.x === 0 ? -10 : t.x === d.w ? d.w + 10 : t.x, ly = t.y === 0 ? -12 : t.y === d.h ? d.h + 20 : t.y - 10;
        const anchor = t.x === 0 ? 'end' : t.x === d.w ? 'start' : 'middle';
        return `<g class="wl-tg"><circle class="wl-term kind-${t.kind}${used ? ' used' : ''}${hl.has(key) ? ' hl' : ''}" cx="${t.x}" cy="${t.y}" r="8" data-term="${key}"><title>${esc(d.name)} ${esc(t.name || t.id)}</title></circle>
          ${t.name ? `<text class="wl-tlabel" x="${lx}" y="${ly}" text-anchor="${anchor}">${esc(t.name)}</text>` : ''}</g>`;
      }).join('');
      return `<g class="wl-comp${sel?.comp === c.id ? ' sel' : ''}" data-comp="${c.id}" transform="translate(${c.x},${c.y})">
        ${art(c, r)}
        <text class="wl-id" x="4" y="-6">${c.id}</text>
        <text class="wl-reading" x="${d.w / 2}" y="${d.h + 34}" text-anchor="middle">${esc(reading(c, r))}</text>
        ${terms}</g>`;
    }).join('');
    drawSteps();
    drawReadouts();
    $('[data-act="del"]').disabled = !sel;
    $('.wl-events').textContent = sim.events.join(' · ');
  }

  function stepDone(s) { const f = netsOf(board); return board.comps.some((c) => s.a.startsWith(c.id + '.')) && board.comps.some((c) => s.b.startsWith(c.id + '.')) && f(s.a) === f(s.b); }
  function drawSteps() {
    $('.wl-steps').innerHTML = task.steps.map((s) => `<li class="${stepDone(s) ? 'ok' : ''}${hint === s ? ' now' : ''}">${s.text} <code>${s.a} ↔ ${s.b}</code></li>`).join('');
  }

  function drawReadouts() {
    $('.wl-read tbody').innerHTML = board.comps.map((c) => {
      const d = PARTS[c.type], r = sim.parts[c.id];
      return `<tr><td><b>${c.id}</b> ${esc(d.name)}</td><td>${r.vp != null ? `${fmtSI(r.vp, 'V')} → ${fmtSI(r.vs, 'V')}` : fmtSI(r.v, 'V')}</td><td>${r.vp != null ? `${fmtSI(r.ip, 'A')} → ${fmtSI(r.is, 'A')}` : fmtSI(r.i, 'A')}</td><td>${r.p ? fmtSI(Math.abs(r.p), 'W') : '–'}</td><td>${esc(stateText(c, r))}</td></tr>`;
    }).join('') || '<tr><td colspan="5">Belum ada komponen di papan.</td></tr>';
  }

  // ---------- interaksi papan ----------
  const toSvg = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  let drag = null;

  svg.addEventListener('pointerdown', (e) => {
    const term = e.target.closest('[data-term]');
    const comp = e.target.closest('[data-comp]');
    const wire = e.target.closest('[data-wire]');
    if (term) {
      e.preventDefault();
      drag = { kind: 'wire', from: term.dataset.term, moved: false };
      svg.setPointerCapture(e.pointerId);
      return;
    }
    if (comp) {
      const c = board.comps.find((x) => x.id === comp.dataset.comp), p = toSvg(e);
      drag = { kind: 'comp', c, dx: p.x - c.x, dy: p.y - c.y, x0: p.x, y0: p.y, moved: false };
      svg.setPointerCapture(e.pointerId);
      return;
    }
    if (wire) { sel = { wire: +wire.dataset.wire }; pending = null; draw(); return; }
    sel = null; pending = null; draw();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = toSvg(e);
    if (drag.kind === 'comp') {
      if (Math.hypot(p.x - drag.x0, p.y - drag.y0) > 4) drag.moved = true;
      if (!drag.moved) return;
      const d = PARTS[drag.c.type];
      drag.c.x = Math.round(Math.min(W - d.w - 14, Math.max(14, p.x - drag.dx)) / 10) * 10;
      drag.c.y = Math.round(Math.min(H - d.h - 40, Math.max(20, p.y - drag.dy)) / 10) * 10;
      draw();
    } else if (drag.kind === 'wire') {
      const a = termPos(drag.from);
      drag.moved = true;
      temp.hidden = false; temp.setAttribute('d', curve(a, p)); temp.setAttribute('class', `wl-temp kind-${a.kind}`);
    }
  });
  const endDrag = (e) => {
    if (!drag) return;
    const d = drag; drag = null; temp.hidden = true;
    if (d.kind === 'comp') {
      if (!d.moved) clickComp(d.c); else refresh();
      return;
    }
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const to = el?.closest?.('[data-term]')?.dataset.term;
    if (to && to !== d.from) connect(d.from, to);
    else if (!to || to === d.from) {
      // mode ketuk: ketuk terminal pertama lalu terminal kedua
      if (pending && pending !== d.from) connect(pending, d.from);
      else { pending = pending === d.from ? null : d.from; sel = null; draw(); if (pending) status(`Terminal ${pending} dipilih. Ketuk terminal tujuan untuk memasang kabel.`); }
    }
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', () => { drag = null; temp.hidden = true; });
  svg.addEventListener('dblclick', (e) => { const w = e.target.closest('[data-wire]'); if (w) { board.wires.splice(+w.dataset.wire, 1); sel = null; refresh(); } });
  svg.addEventListener('keydown', (e) => { if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); removeSel(); } });

  function connect(a, b) {
    pending = null;
    if (board.wires.some((w) => (w[0] === a && w[1] === b) || (w[0] === b && w[1] === a))) { status('Kabel itu sudah terpasang.'); draw(); return; }
    board.wires.push([a, b]);
    if (hint && stepDone(hint)) hint = null;
    status(`Kabel dipasang: ${a} ↔ ${b}`);
    refresh();
  }

  function clickComp(c) {
    sel = { comp: c.id };
    const d = PARTS[c.type];
    if (c.blown) { c.blown = false; status(`${d.name} diganti dengan yang baru.`); }
    else if (d.toggle) {
      if (c.tripped) { c.tripped = false; c.on = true; status(`${d.name} dinaikkan kembali (reset).`); }
      else { c.on = !c.on; status(`${d.name} ${c.on ? 'ON' : 'OFF'}`); }
    }
    refresh();
  }

  function removeSel() {
    if (sel?.wire != null) board.wires.splice(sel.wire, 1);
    else if (sel?.comp) {
      board.comps = board.comps.filter((c) => c.id !== sel.comp);
      board.wires = board.wires.filter((w) => !w.some((k) => k.startsWith(sel.comp + '.')));
    }
    sel = null; refresh();
  }

  // ---------- kotak komponen: seret ke papan ----------
  let ghost = null;
  $('.wl-parts').addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('[data-part]');
    if (!btn) return;
    e.preventDefault();
    const spec = task.parts.find((p) => p.id === btn.dataset.part);
    ghost = { spec, x0: e.clientX, y0: e.clientY, el: null };
    const move = (ev) => {
      if (!ghost) return;
      if (!ghost.el && Math.hypot(ev.clientX - ghost.x0, ev.clientY - ghost.y0) > 5) {
        ghost.el = document.createElement('div');
        ghost.el.className = 'wl-ghost';
        ghost.el.textContent = `${spec.id} · ${PARTS[spec.type].name}`;
        document.body.appendChild(ghost.el);
      }
      if (ghost.el) { ghost.el.style.left = `${ev.clientX}px`; ghost.el.style.top = `${ev.clientY}px`; }
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const gh = ghost; ghost = null;
      if (!gh) return;
      gh.el?.remove();
      const r = svg.getBoundingClientRect();
      const inside = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
      if (gh.el && !inside) return;
      const d = PARTS[spec.type];
      let x = spec.x ?? 40, y = spec.y ?? 40;
      if (gh.el) { const p = toSvg(ev); x = p.x - d.w / 2; y = p.y - d.h / 2; }
      x = Math.round(Math.min(W - d.w - 14, Math.max(14, x)) / 10) * 10;
      y = Math.round(Math.min(H - d.h - 40, Math.max(20, y)) / 10) * 10;
      board.comps.push({ id: spec.id, type: spec.type, x, y, on: spec.on ?? true });
      status(`${d.name} (${spec.id}) ditaruh di papan.`);
      refresh();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });

  // ---------- tombol ----------
  root.querySelector('.wl-toolbar').addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'check') {
      const res = task.check(runner(board, g), board);
      if (res.ok) { done[task.id] = true; save(`${storeKey}.done`, done); drawTasks(); }
      const msg = res.msg.replace(/(\d)\.(\d)/g, '$1,$2'); // desimal gaya Indonesia
      status(res.ok ? `Berhasil! ${msg}` : `Belum tepat. ${msg}`, res.ok ? 'good' : 'bad');
    } else if (act === 'hint') {
      const missing = task.parts.filter((p) => !board.comps.some((c) => c.id === p.id));
      const next = task.steps.find((s) => !stepDone(s));
      if (missing.length && next && missing.some((p) => next.a.startsWith(p.id + '.') || next.b.startsWith(p.id + '.'))) {
        status(`Seret dulu ${missing.map((p) => `${p.id} (${PARTS[p.type].name})`).join(', ')} ke papan.`);
        hint = null;
      } else if (next) { hint = next; status(`Langkah berikutnya: ${next.text} Terminal yang harus disambung berkedip.`); }
      else { hint = null; status('Semua sambungan di petunjuk sudah terpasang. Klik "Periksa rangkaian".'); }
      draw();
    } else if (act === 'demo') {
      board = boardFrom({ parts: task.parts, solution: task.steps.map((s) => [s.a, s.b]) });
      sel = null; hint = null; status('Contoh rangkaian dipasang. Coba klik saklar/MCB atau ubah perintah untuk melihat perubahannya.');
      refresh();
    } else if (act === 'del') removeSel();
    else if (act === 'clear') { board = { comps: [], wires: [] }; sel = null; hint = null; status('Papan dikosongkan.'); refresh(); }
  });
  root.querySelector('[data-act="cmd"]').addEventListener('change', (e) => { g = { ...g, cmd: e.target.checked }; status(`${task.input}: ${e.target.checked ? 'ON' : 'OFF'}`); refresh(false); });

  openTask(task);
}

// ---------- teks status ----------
function stateText(c, r) {
  const d = PARTS[c.type];
  if (c.blown) return 'Putus';
  if (c.tripped) return 'Trip';
  switch (c.type) {
    case 'saklar': case 'mcb': case 'pmt': return c.on ? 'ON' : 'OFF';
    case 'lampu': case 'lampu220': return r.level > 0.9 ? 'Terang' : r.level > 0.05 ? `Redup (${Math.round(r.level * 100)}%)` : 'Mati';
    case 'motor': return r.level > 0.05 ? `Berputar ${Math.round(r.level * 100)}%` : 'Diam';
    case 'kota': return r.level > 0.9 ? 'Listrik normal' : r.level > 0.05 ? `Tegangan turun (${Math.round(r.level * 100)}%)` : 'Padam';
    case 'relay': return r.state.on ? 'Aktif (COM–NO tersambung)' : 'Tidak aktif';
    case 'esp32': return r.state.on ? (r.gpioI > 0.04 ? 'Menyala · GPIO kelebihan arus!' : 'Menyala') : 'Tidak dapat daya';
    case 'buck': return r.state.on ? 'Keluaran 5 V' : 'Masukan kurang';
    case 'saluran': return r.p ? `Rugi ${fmtSI(r.p, 'W')}` : 'Tanpa arus';
    default: return d.name.includes('Trafo') ? (r.vp > 1 ? 'Bekerja' : 'Tanpa tegangan') : r.i > 1e-3 ? 'Mengalirkan arus' : 'Siaga';
  }
}
function reading(c, r) {
  if (r.vp != null) return r.vp > 1 ? `${fmtSI(r.vp, 'V')} → ${fmtSI(r.vs, 'V')}` : '';
  if (c.type === 'saklar' || c.type === 'mcb' || c.type === 'pmt') return c.tripped ? 'TRIP · klik untuk reset' : c.on ? 'ON' : 'OFF';
  return r.v > 1e-3 || r.i > 1e-4 ? `${fmtSI(r.v, 'V')} · ${fmtSI(r.i, 'A')}` : '';
}

// ---------- gambar komponen (SVG) ----------
function art(c, r) {
  const d = PARTS[c.type], w = d.w, h = d.h;
  const box = (cls = '') => `<rect class="wl-box ${cls}" width="${w}" height="${h}" rx="10"/>`;
  const title = (t, y = 16) => `<text class="wl-name" x="${w / 2}" y="${y}" text-anchor="middle">${esc(t)}</text>`;
  switch (c.type) {
    case 'baterai':
      return `${box()}<rect x="14" y="24" width="72" height="30" rx="4" class="wl-bat"/><rect x="86" y="32" width="6" height="14" class="wl-bat"/>
        <rect x="18" y="28" width="16" height="22" class="wl-cell"/><rect x="38" y="28" width="16" height="22" class="wl-cell"/><rect x="58" y="28" width="16" height="22" class="wl-cell"/>${title('Baterai 12 V')}`;
    case 'psu12':
      return `${box()}<rect x="16" y="26" width="50" height="28" rx="5" class="wl-dev"/><path d="M66 40 h18" class="wl-line"/><text class="wl-val" x="41" y="45" text-anchor="middle">12V</text>${title('Adaptor 12 V')}`;
    case 'pln':
      return `${box()}<rect x="14" y="24" width="56" height="34" rx="6" class="wl-dev"/><text class="wl-val" x="42" y="46" text-anchor="middle">220V~</text>${title('PLN 220 V')}`;
    case 'generator':
      return `${box()}<circle cx="52" cy="44" r="22" class="wl-dev"/><text class="wl-big" x="52" y="50" text-anchor="middle">G~</text>${title('Generator 11 kV')}`;
    case 'saklar': {
      const on = c.on;
      return `${box('wl-thin')}<circle cx="18" cy="30" r="4" class="wl-pin"/><circle cx="72" cy="30" r="4" class="wl-pin"/>
        <path d="M0 30 H18 M72 30 H90" class="wl-line"/><path d="M18 30 L${on ? '72 30' : '64 8'}" class="wl-lever ${on ? 'on' : ''}"/>
        <text class="wl-name" x="45" y="46" text-anchor="middle">${on ? 'ON' : 'OFF'}</text>`;
    }
    case 'mcb': case 'pmt': {
      const up = c.on && !c.tripped;
      return `${box(c.tripped ? 'wl-trip' : '')}<rect x="${w / 2 - 12}" y="24" width="24" height="34" rx="4" class="wl-slot"/>
        <rect x="${w / 2 - 9}" y="${up ? 27 : 41}" width="18" height="14" rx="3" class="wl-knob ${up ? 'on' : ''}"/>
        ${title(c.type === 'mcb' ? 'MCB 6A' : 'PMT', 16)}<text class="wl-name" x="${w / 2}" y="72" text-anchor="middle">${c.tripped ? 'TRIP' : up ? 'ON' : 'OFF'}</text>`;
    }
    case 'lampu': case 'lampu220': {
      const lv = c.blown ? 0 : Math.min(1, r.level || 0);
      return `${lv > 0.02 ? `<circle cx="40" cy="36" r="30" class="wl-halo" style="opacity:${(0.25 + 0.75 * lv).toFixed(2)}" filter="url(#wl-glow)"/>` : ''}
        <circle cx="40" cy="36" r="24" class="wl-bulb${c.blown ? ' blown' : ''}" style="fill-opacity:${(0.15 + 0.85 * lv).toFixed(2)}"/>
        <path d="M30 40 l4 -8 l4 8 l4 -8 l4 8" class="wl-fil${lv > 0.02 ? ' on' : ''}"/>
        <rect x="26" y="60" width="28" height="16" rx="3" class="wl-base"/><path d="M20 90 V76 H30 M60 90 V76 H50" class="wl-line"/>
        <text class="wl-name" x="40" y="${c.blown ? 40 : 102}" text-anchor="middle">${c.blown ? 'PUTUS' : c.type === 'lampu' ? '12V 6W' : '220V 100W'}</text>`;
    }
    case 'motor': {
      const lv = Math.min(1.2, r.level || 0);
      const dur = lv > 0.05 ? (0.6 / lv).toFixed(2) : 0;
      return `${box()}<rect x="34" y="18" width="52" height="44" rx="8" class="wl-dev"/><circle cx="60" cy="40" r="17" class="wl-rotor-bg"/>
        <g class="wl-rotor${dur ? ' spin' : ''}" style="transform-origin:60px 40px;${dur ? `animation-duration:${dur}s` : ''}"><path d="M60 25 V55 M45 40 H75 M50 30 L70 50 M70 30 L50 50" class="wl-blade"/></g>
        <text class="wl-name" x="${w / 2}" y="76" text-anchor="middle">Motor DC</text>`;
    }
    case 'saluran':
      return `${box('wl-thin')}<path d="M20 52 L30 14 L40 52 M24 36 H36 M110 52 L120 14 L130 52 M114 36 H126" class="wl-tower"/>
        <path d="M0 34 H30 Q75 ${34 + 12} 120 22 H150" class="wl-line"/>${title('Saluran 20 Ω', 12)}`;
    case 'kota': {
      const lv = Math.min(1, r.level || 0);
      const win = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" class="wl-win" style="fill-opacity:${(0.1 + 0.9 * lv).toFixed(2)}"/>`;
      return `${box()}<rect x="22" y="30" width="26" height="44" class="wl-bld"/><rect x="54" y="20" width="22" height="54" class="wl-bld"/><rect x="82" y="38" width="26" height="36" class="wl-bld"/>
        ${[34, 46, 58].map((y) => win(26, y) + win(37, y)).join('')}${[26, 38, 50, 62].map((y) => win(58, y) + win(67, y)).join('')}${[44, 56].map((y) => win(86, y) + win(97, y)).join('')}
        ${title('Beban kota 5 MW', 14)}`;
    }
    case 'trafoNaik': case 'trafoDist': case 'trafoTurun': {
      const coil = (x, n) => Array.from({ length: n }, (_, i) => `<path d="M${x} ${30 + i * 8} q10 4 0 8" class="wl-coil"/>`).join('');
      const lab = c.type === 'trafoNaik' ? '11→150 kV' : c.type === 'trafoTurun' ? '150→11 kV' : '11 kV→220 V';
      return `${box()}<path d="M50 26 V70 M58 26 V70" class="wl-core"/>${coil(36, c.type === 'trafoNaik' ? 3 : 5)}${coil(66, c.type === 'trafoNaik' ? 5 : 3)}
        ${title('Trafo', 16)}<text class="wl-name" x="${w / 2}" y="84" text-anchor="middle">${lab}</text>`;
    }
    case 'buck':
      return `${box('wl-pcb')}<circle cx="44" cy="38" r="12" class="wl-coil-big"/><rect x="66" y="28" width="22" height="20" rx="3" class="wl-chip"/>${title('Buck 12→5 V', 14)}
        <circle cx="96" cy="60" r="4" class="wl-led ${r.state.on ? 'on' : ''}"/>`;
    case 'esp32': {
      const on = r.state.on;
      return `${box('wl-esp')}<path d="M18 14 h18 v6 h-12 v6 h12 v6 h-18" class="wl-ant"/><rect x="44" y="20" width="56" height="44" rx="4" class="wl-chip"/>
        <text class="wl-name light" x="72" y="46" text-anchor="middle">ESP32</text>
        <circle cx="116" cy="72" r="5" class="wl-led blue ${on ? 'on' : ''}"/><circle cx="104" cy="72" r="5" class="wl-led ${on ? 'on' : ''}"/>`;
    }
    case 'relay': {
      const on = r.state.on;
      return `${box('wl-relay')}<rect x="30" y="18" width="44" height="54" rx="5" class="wl-relay-box"/><text class="wl-name light" x="52" y="50" text-anchor="middle">RELAY</text>
        <path d="M86 30 H100 M86 66 H100 M86 30 L${on ? '86 66' : '98 52'}" class="wl-lever ${on ? 'on' : ''}"/>
        <circle cx="100" cy="86" r="4" class="wl-led red ${on ? 'on' : ''}"/>`;
    }
    default: return box();
  }
}
