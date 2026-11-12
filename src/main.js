import { Stage } from './lib/engine.js';
import { mountIde } from './lib/ide.js';
import { mountWiring } from './lib/wiring.js';
import { account, initAccount, solvedCount, isSolved, recordAnswer, logout, mountGoogleButton } from './lib/account.js';
import { TOPICS, SUBJECTS, TAGS, GROUPS, STEM } from './topics/index.js';

const $ = (sel, el = document) => el.querySelector(sel);
const app = $('#app');
const fmt = (v, d = 0) => Number(v).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const IDE_KEY = 'sainslab3d.v1.ide';
const WIRE_KEY = 'sainslab3d.v1.wiring';

// ---------- penyimpanan kecil di peramban: bidang yang sedang dibuka di beranda ----------
const ui = (() => { try { return JSON.parse(localStorage.getItem('sainslab3d.ui')) || {}; } catch { return {}; } })();
const saveUi = () => { try { localStorage.setItem('sainslab3d.ui', JSON.stringify(ui)); } catch { /* abaikan */ } };
ui.open ||= {};

// ---------- satu kanvas 3D dipakai ulang ----------
const stageEl = document.createElement('div');
stageEl.className = 'stage-canvas';
let stage = null;
const getStage = () => (stage ||= new Stage(stageEl));

const filter = { tag: 'all', q: '' };
let current = null;
let params = {};

function route() {
  closeMenus();
  if (account.mode === 'login') return renderLogin();
  const id = location.hash.slice(1);
  if (id === 'riwayat') return renderHistory();
  const topic = TOPICS.find((t) => t.id === id);
  if (topic) renderTopic(topic); else renderHome();
}
window.addEventListener('hashchange', route);

// ---------- kepala situs: menu belajar (dropdown) + akun ----------
function renderHeader() {
  const nav = $('#site-nav');
  const user = account.user;
  nav.innerHTML = `
    ${account.mode === 'login' ? '' : `
    <div class="menu">
      <button type="button" class="menu-btn" aria-expanded="false" aria-controls="learn-menu">Menu belajar <span aria-hidden="true">▾</span></button>
      <div class="menu-pop learn-pop" id="learn-menu" hidden>
        ${GROUPS.map((g) => `
          <details class="menu-group">
            <summary>${esc(g.name)}</summary>
            ${g.subjects.map((k) => `
              <div class="menu-subj" data-subject="${k}">
                <span class="subj">${esc(SUBJECTS[k].name)}</span>
                ${TOPICS.filter((t) => t.subject === k).map((t) => `<a href="#${t.id}">${esc(t.title)}</a>`).join('')}
              </div>`).join('')}
          </details>`).join('')}
      </div>
    </div>`}
    ${user ? `
    <div class="menu">
      <button type="button" class="menu-btn user-btn" aria-expanded="false" aria-controls="user-menu">
        ${user.picture ? `<img src="${esc(user.picture)}" alt="" width="26" height="26" referrerpolicy="no-referrer">` : `<span class="avatar">${esc(user.name[0] || '?')}</span>`}
        <span class="user-name">${esc(user.name.split(' ')[0])}</span> <span aria-hidden="true">▾</span>
      </button>
      <div class="menu-pop user-pop" id="user-menu" hidden>
        <p class="user-mail">${esc(user.name)}<br><small>${esc(user.email)}</small></p>
        <a href="#riwayat">Riwayat soal</a>
        <button type="button" data-act="logout">Keluar</button>
      </div>
    </div>` : account.mode === 'guest' ? '<span class="guest-tag" title="' + esc(account.reason) + '">Mode tamu</span>' : ''}`;
  nav.querySelectorAll('.menu-btn').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const pop = $('#' + b.getAttribute('aria-controls'));
    const open = pop.hidden;
    closeMenus();
    pop.hidden = !open; b.setAttribute('aria-expanded', open);
  }));
  nav.querySelectorAll('.menu-pop').forEach((p) => p.addEventListener('click', (e) => e.stopPropagation()));
  nav.querySelectorAll('.menu-pop a').forEach((a) => a.addEventListener('click', closeMenus));
  const lo = nav.querySelector('[data-act="logout"]');
  if (lo) lo.onclick = logout;
}
function closeMenus() {
  document.querySelectorAll('.menu-pop').forEach((p) => { p.hidden = true; });
  document.querySelectorAll('.menu-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
}
document.addEventListener('click', closeMenus);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenus(); });

// ---------- gerbang login ----------
function renderLogin() {
  if (stage) stage.paused = true;
  document.title = 'Masuk · Sams Lab';
  const total = TOPICS.reduce((n, t) => n + t.questions.length, 0);
  app.innerHTML = `
    <section class="login">
      <p class="eyebrow">Sains · Teknologi · Engineering · Matematika</p>
      <h1>Masuk untuk mulai belajar</h1>
      <p class="lede">Gunakan akun Google kamu. Setiap soal yang kamu kerjakan dan riwayat jawabannya tersimpan di akunmu, jadi bisa dilanjutkan dari perangkat mana saja.</p>
      <div class="login-btn" id="gbtn"></div>
      <p class="login-err" id="login-err" role="alert" hidden></p>
      <dl class="stats">
        <div><dt>Simulasi 3D</dt><dd>${TOPICS.length}</dd></div>
        <div><dt>Soal</dt><dd>${total}</dd></div>
        <div><dt>Bidang</dt><dd>${Object.keys(SUBJECTS).length}</dd></div>
      </dl>
      <p class="note">Kami hanya memakai nama, email, dan foto profil akun Google untuk menandai progresmu.</p>
    </section>`;
  const err = $('#login-err');
  mountGoogleButton($('#gbtn'), () => { renderHeader(); route(); }, (m) => { err.hidden = false; err.textContent = `Gagal masuk: ${m}`; });
}

// ---------- beranda: setiap bidang adalah dropdown yang bisa dibuka-tutup ----------
function renderHome() {
  current = null;
  if (stage) stage.paused = true;
  document.title = 'Sams Lab';
  const total = TOPICS.reduce((n, t) => n + t.questions.length, 0);
  const done = TOPICS.reduce((n, t) => n + solvedCount(t.id), 0);
  const hello = account.user ? `Halo, ${esc(account.user.name.split(' ')[0])}. ` : '';
  app.innerHTML = `
    ${account.mode === 'guest' && account.reason ? `<p class="banner">${esc(account.reason)}</p>` : ''}
    <section class="hero">
      <div class="hero-text">
        <p class="eyebrow">Sains · Teknologi · Engineering · Matematika</p>
        <h1>Belajar STEM dari panel surya, pabrik, chip, listrik, pasar, sampai keamanan siber.</h1>
        <p class="lede">${hello}Pilih bidang di bawah untuk membuka daftar topiknya. Setiap topik punya simulasi 3D, studi kasus dari Indonesia, dan soal berlabel S, T, E, atau M.</p>
      </div>
      <dl class="stats">
        <div><dt>Simulasi 3D</dt><dd>${TOPICS.length}</dd></div>
        <div><dt>Soal</dt><dd>${total}</dd></div>
        <div><dt>Soal kamu jawab benar</dt><dd>${done}</dd></div>
      </dl>
    </section>
    <section class="filters" aria-label="Saring topik">
      <label class="field"><span>Cari topik</span><input type="search" id="f-q" placeholder="mis. chip, antrian, saham, motor" value="${esc(filter.q)}"></label>
      <label class="field"><span>Konteks</span>
        <select id="f-tag"><option value="all">Semua konteks</option>${Object.entries(TAGS).map(([k, s]) => `<option value="${k}"${filter.tag === k ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
      <span class="filter-actions">
        <button type="button" class="ghost" data-all="open">Buka semua</button>
        <button type="button" class="ghost" data-all="close">Tutup semua</button>
      </span>
    </section>
    <div id="groups"></div>`;
  $('#f-q').addEventListener('input', (e) => { filter.q = e.target.value; drawGroups(); });
  $('#f-tag').addEventListener('change', (e) => { filter.tag = e.target.value; drawGroups(); });
  app.querySelectorAll('[data-all]').forEach((b) => b.addEventListener('click', () => {
    const open = b.dataset.all === 'open';
    Object.keys(SUBJECTS).forEach((k) => { ui.open[k] = open; });
    saveUi(); drawGroups();
  }));
  drawGroups();
  window.scrollTo(0, 0);
}

function drawGroups() {
  const q = filter.q.trim().toLowerCase();
  const searching = !!q || filter.tag !== 'all';
  const match = (t) => (filter.tag === 'all' || t.tags.includes(filter.tag))
    && (!q || `${t.title} ${t.summary} ${SUBJECTS[t.subject].name}`.toLowerCase().includes(q));
  let shown = 0;
  $('#groups').innerHTML = GROUPS.map((g) => {
    const blocks = g.subjects.map((k) => {
      const list = TOPICS.filter((t) => t.subject === k && match(t));
      if (!list.length) return '';
      shown += list.length;
      const all = TOPICS.filter((t) => t.subject === k);
      const n = all.reduce((s, t) => s + t.questions.length, 0), d = all.reduce((s, t) => s + solvedCount(t.id), 0);
      const open = searching || ui.open[k];
      return `
        <details class="subject" data-subject="${k}"${open ? ' open' : ''}>
          <summary>
            <span class="subj-name">${esc(SUBJECTS[k].name)}</span>
            <span class="subj-meta">${list.length} topik · ${d}/${n} soal benar</span>
            <span class="progress" aria-hidden="true"><span style="width:${n ? (d / n) * 100 : 0}%"></span></span>
          </summary>
          <div class="grid">${list.map(card).join('')}</div>
        </details>`;
    }).join('');
    return blocks ? `<section class="group"><h2 class="group-title">${esc(g.name)}</h2>${blocks}</section>` : '';
  }).join('') || '<p class="empty">Tidak ada topik yang cocok. Ubah kata kunci atau konteks.</p>';
  $('#groups').querySelectorAll('details.subject').forEach((d) => d.addEventListener('toggle', () => {
    if (searching) return;
    ui.open[d.dataset.subject] = d.open; saveUi();
  }));
}

function card(t) {
  const s = solvedCount(t.id), n = t.questions.length;
  return `
    <a class="card" href="#${t.id}" data-subject="${t.subject}">
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.summary)}</p>
      <span class="tags">${t.tags.map((g) => `<span>${TAGS[g]}</span>`).join('')}${t.lab ? '<span class="lab-tag">Lab kode</span>' : ''}${t.wiring ? '<span class="lab-tag">Lab rangkaian</span>' : ''}</span>
      <span class="progress" aria-label="${s} dari ${n} soal benar"><span style="width:${(s / n) * 100}%"></span></span>
      <span class="progress-text">${s}/${n} soal benar</span>
    </a>`;
}

// ---------- riwayat soal per akun ----------
function renderHistory() {
  current = null;
  if (stage) stage.paused = true;
  document.title = 'Riwayat soal · Sams Lab';
  const hist = [...account.record.history].reverse();
  const byTopic = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
  const tried = hist.length, right = hist.filter((h) => h.ok).length;
  const stemDone = Object.fromEntries(Object.keys(STEM).map((k) => [k, [0, 0]]));
  TOPICS.forEach((t) => t.questions.forEach((q, i) => { stemDone[q.stem][1]++; if (isSolved(t.id, i)) stemDone[q.stem][0]++; }));
  app.innerHTML = `
    <nav class="crumbs"><a href="#">← Beranda</a><span>Riwayat soal</span></nav>
    <header class="topic-head"><h1>Riwayat soal${account.user ? ` · ${esc(account.user.name)}` : ''}</h1>
      <p>${account.mode === 'account' ? 'Tersimpan di akun Google kamu.' : 'Mode tamu: riwayat hanya untuk sesi ini.'} ${tried} kali menjawab, ${right} benar${tried ? ` (${Math.round((right / tried) * 100)}%)` : ''}.</p></header>
    <dl class="stats stem-stats">${Object.entries(STEM).map(([k, s]) => `<div data-stem="${k}"><dt>${s.name}</dt><dd>${stemDone[k][0]}/${stemDone[k][1]}</dd></div>`).join('')}</dl>
    ${hist.length ? `
    <div class="table-wrap"><table class="hist">
      <thead><tr><th>Waktu</th><th>Topik</th><th>Soal</th><th>STEM</th><th>Jawaban</th><th>Hasil</th></tr></thead>
      <tbody>${hist.slice(0, 300).map((h) => {
        const t = byTopic[h.topic], q = t?.questions[h.q];
        return `<tr>
          <td>${new Date(h.at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
          <td>${t ? `<a href="#${t.id}">${esc(t.title)}</a>` : esc(h.topic)}</td>
          <td>${h.q + 1}${q ? ` · ${esc(q.kind)}` : ''}</td>
          <td>${q ? `<span class="stem-badge" data-stem="${q.stem}">${q.stem}</span>` : ''}</td>
          <td class="ans">${esc(h.answer)}</td>
          <td class="${h.ok ? 'ok' : 'no'}">${h.ok ? 'Benar' : 'Salah'}</td></tr>`;
      }).join('')}</tbody></table></div>` : '<p class="empty">Belum ada soal yang dikerjakan. Buka salah satu topik lalu jawab soalnya.</p>'}`;
  window.scrollTo(0, 0);
}

// ---------- halaman topik ----------
function renderTopic(t) {
  current = t;
  document.title = `${t.title} · Sams Lab`;
  params = Object.fromEntries(t.params.map((p) => [p.key, p.value]));
  const idx = TOPICS.indexOf(t);
  const next = TOPICS[(idx + 1) % TOPICS.length];
  app.innerHTML = `
    <nav class="crumbs"><a href="#">← Semua topik</a><span>${SUBJECTS[t.subject].name}</span></nav>
    <header class="topic-head" data-subject="${t.subject}">
      <h1>${esc(t.title)}</h1>
      <p>${esc(t.summary)}</p>
    </header>
    <div class="topic">
      <div class="stage" id="stage-slot">
        <div class="stage-tools">
          <button type="button" id="pause">Jeda</button>
          <button type="button" id="recam">Atur ulang kamera</button>
        </div>
        <p class="stage-hint">Seret untuk memutar · cubit atau gulir untuk zoom</p>
      </div>
      <div class="panel">
        <div class="tabs" role="tablist">
          <button role="tab" id="tab-sim" aria-selected="true" aria-controls="pane-sim">Simulasi</button>
          <button role="tab" id="tab-story" aria-selected="false" aria-controls="pane-story">Cerita &amp; konsep</button>
          <button role="tab" id="tab-quiz" aria-selected="false" aria-controls="pane-quiz">Soal (${t.questions.length})</button>
        </div>
        <section role="tabpanel" id="pane-sim" aria-labelledby="tab-sim">
          <div class="formula">${t.concept}</div>
          <details class="eq-details">
            <summary>Apa arti rumus ini?</summary>
            ${equationsHtml(t)}
          </details>
          <div class="outputs" id="outputs"></div>
          <details class="eq-details" open><summary>Atur parameter</summary>
            <form class="controls" id="controls" autocomplete="off"></form>
          </details>
          <button type="button" class="ghost" id="reset">Kembalikan nilai awal</button>
          ${t.lab ? '<button type="button" class="primary" data-go="ide">Buka Lab Kode ↓</button>' : ''}
          ${t.wiring ? '<button type="button" class="primary" data-go="wiring">Buka Lab Rangkaian ↓</button>' : ''}
        </section>
        <section role="tabpanel" id="pane-story" aria-labelledby="tab-story" hidden>
          <div class="story">${t.story}</div>
          <details class="eq-details"><summary>Rumus dan artinya</summary>${equationsHtml(t)}</details>
          <p class="note">${t.conceptNote}</p>
          <button type="button" class="primary" data-go="quiz">Kerjakan soal →</button>
          ${t.lab ? '<button type="button" class="ghost" data-go="ide">Coba kodenya di Lab Kode ↓</button>' : ''}
          ${t.wiring ? '<button type="button" class="ghost" data-go="wiring">Rakit di Lab Rangkaian ↓</button>' : ''}
        </section>
        <section role="tabpanel" id="pane-quiz" aria-labelledby="tab-quiz" hidden>
          <label class="field stem-filter"><span>Tampilkan soal</span>
            <select id="stem-filter"><option value="all">Semua (S·T·E·M)</option>${Object.entries(STEM).map(([k, s]) => `<option value="${k}">${k} · ${s.name}</option>`).join('')}</select></label>
          <ol class="quiz" id="quiz"></ol>
          <a class="next" href="#${next.id}">Topik berikutnya: ${esc(next.title)} →</a>
        </section>
      </div>
    </div>
    ${t.lab ? '<section class="ide" id="ide" aria-label="Lab kode"></section>' : ''}
    ${t.wiring ? '<section class="wiring" id="wiring" aria-label="Lab rangkaian"></section>' : ''}`;
  $('#stage-slot').prepend(stageEl);
  const st = getStage();
  st.paused = false;
  st.load(t, params);
  $('#pause').onclick = (e) => { st.paused = !st.paused; e.target.textContent = st.paused ? 'Putar' : 'Jeda'; };
  $('#recam').onclick = () => { st.load(t, params); };
  $('#reset').onclick = () => { setParams(Object.fromEntries(t.params.map((p) => [p.key, p.value]))); };
  const tabs = ['sim', 'story', 'quiz'];
  const show = (name) => tabs.forEach((n) => {
    $(`#tab-${n}`).setAttribute('aria-selected', n === name);
    $(`#pane-${n}`).hidden = n !== name;
  });
  tabs.forEach((n) => ($(`#tab-${n}`).onclick = () => show(n)));
  $('[data-go="quiz"]').onclick = () => show('quiz');
  if (t.lab) {
    mountIde($('#ide'), t.lab, `${IDE_KEY}.${t.id}`);
    app.querySelectorAll('[data-go="ide"]').forEach((b) => { b.onclick = () => $('#ide').scrollIntoView({ behavior: 'smooth' }); });
  }
  if (t.wiring) {
    mountWiring($('#wiring'), t.wiring, `${WIRE_KEY}.${t.id}`);
    app.querySelectorAll('[data-go="wiring"]').forEach((b) => { b.onclick = () => $('#wiring').scrollIntoView({ behavior: 'smooth' }); });
  }
  $('#stem-filter').addEventListener('change', (e) => {
    app.querySelectorAll('.q').forEach((li) => { li.hidden = e.target.value !== 'all' && li.dataset.stem !== e.target.value; });
  });
  buildControls(t);
  buildQuiz(t);
  updateOutputs();
  window.scrollTo(0, 0);
}

// Setiap rumus ditampilkan bersama penjelasan bahasa sehari-hari dan daftar simbolnya.
function equationsHtml(t) {
  return `<div class="eq-list">${(t.equations || []).map((e) => `
    <div class="eq">
      <div class="formula">${e.f}</div>
      <p class="eq-meaning"><strong>Artinya:</strong> ${e.meaning}</p>
      <dl class="symbols">${e.symbols.map(([sym, text, unit]) => `
        <div><dt>${sym}</dt><dd>${text} <span class="sym-unit">${unit}</span></dd></div>`).join('')}
      </dl>
    </div>`).join('')}</div>`;
}

function buildControls(t) {
  const form = $('#controls');
  form.innerHTML = t.params.map((p) => {
    const id = `p-${p.key}`;
    if (p.type === 'select') {
      return `<label class="ctl" for="${id}"><span class="ctl-label">${p.label}</span>
        <select id="${id}" data-key="${p.key}">${p.options.map((o) => `<option value="${o.value}">${esc(o.label)}</option>`).join('')}</select></label>`;
    }
    return `<label class="ctl" for="${id}"><span class="ctl-label">${p.label}</span>
      <output id="${id}-out"></output>
      <input type="range" id="${id}" data-key="${p.key}" min="${p.min}" max="${p.max}" step="${p.step}">
      <span class="range-ends"><span>${fmt(p.min, dec(p.step))}</span><span>${fmt(p.max, dec(p.step))} ${p.unit}</span></span></label>`;
  }).join('');
  form.addEventListener('input', (e) => {
    const key = e.target.dataset.key;
    if (!key) return;
    params = { ...params, [key]: Number(e.target.value) };
    syncControls(); updateOutputs(); stage.setParams(params);
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  syncControls();
}

const dec = (step) => (String(step).split('.')[1] || '').length;

function syncControls() {
  current.params.forEach((p) => {
    const el = $(`#p-${p.key}`);
    if (!el) return;
    el.value = params[p.key];
    const out = $(`#p-${p.key}-out`);
    if (out) out.textContent = `${fmt(params[p.key], dec(p.step))} ${p.unit}`;
  });
}

function setParams(next) {
  params = { ...params, ...next };
  syncControls(); updateOutputs(); stage.setParams(params);
}

function updateOutputs() {
  const rows = current.compute(params);
  $('#outputs').innerHTML = rows.map((r) => `
    <div class="out${r.main ? ' main' : ''}">
      <span class="out-label">${r.label}</span>
      <span class="out-value">${r.text ? esc(r.value) : fmt(r.value, r.digits)}${r.unit ? ` <small>${r.unit}</small>` : ''}</span>
    </div>`).join('');
}

// ---------- soal ----------
function buildQuiz(t) {
  $('#quiz').innerHTML = t.questions.map((q, i) => `
    <li class="q" id="q${i}" data-stem="${q.stem}">
      <div class="q-head"><span class="stem-badge" data-stem="${q.stem}" title="${STEM[q.stem].name}">${q.stem}</span><span class="kind">${q.kind}</span>${isSolved(t.id, i) ? '<span class="ok-badge">Sudah benar</span>' : ''}</div>
      <p class="q-prompt">${esc(q.prompt)}</p>
      <button type="button" class="ghost show3d" data-i="${i}">Tampilkan situasi ini di 3D</button>
      <form class="answer" data-i="${i}">
        ${q.type === 'mcq'
          ? `<fieldset><legend class="sr">Pilihan jawaban</legend>${q.options.map((o, k) => `
              <label class="opt"><input type="radio" name="q${i}" id="q${i}-o${k}" value="${k}"><span>${esc(o)}</span></label>`).join('')}</fieldset>`
          : `<label class="num" for="q${i}-in"><span class="sr">Jawaban</span>
              <input id="q${i}-in" inputmode="decimal" placeholder="Jawabanmu" required>
              <span class="unit">${q.unit || ''}</span></label>`}
        <button type="submit" class="primary">Periksa</button>
      </form>
      <div class="feedback" aria-live="polite" hidden></div>
    </li>`).join('');
  const quiz = $('#quiz');
  quiz.querySelectorAll('.show3d').forEach((b) => b.addEventListener('click', () => {
    setParams(t.questions[b.dataset.i].preset || {});
    $('#stage-slot').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
  quiz.querySelectorAll('.answer').forEach((f) => {
    // menyentuh soal langsung menyesuaikan model 3D dengan kondisi soal
    f.addEventListener('focusin', () => setParams(t.questions[f.dataset.i].preset || {}), { once: true });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const i = Number(f.dataset.i), q = t.questions[i];
      let correct, given;
      if (q.type === 'mcq') {
        const pick = f.querySelector('input:checked');
        if (!pick) return feedback(i, null, 'Pilih salah satu jawaban dulu.');
        correct = Number(pick.value) === q.answer;
        given = String.fromCharCode(65 + Number(pick.value));
      } else {
        const raw = f.querySelector('input').value;
        const v = parseNumber(raw);
        if (Number.isNaN(v)) return feedback(i, null, 'Tulis jawaban berupa angka, misalnya 2280 atau 3,08.');
        correct = q.integer ? Math.round(v) === q.answer : Math.abs(v - q.answer) <= Math.abs(q.answer) * q.tolerance + 1e-9;
        given = raw.trim();
      }
      recordAnswer(t.id, i, correct, given);
      const ans = q.type === 'mcq' ? q.options[q.answer] : `${fmt(q.answer, q.answer % 1 ? 2 : 0)} ${q.unit || ''}`;
      feedback(i, correct, correct ? `Benar. ${q.explain}` : `Belum tepat. Jawaban yang benar: ${ans}. ${q.explain}`);
    });
  });
}

// "3,08" dan "3.08" sama-sama dibaca 3,08; "1.250,5" dibaca 1250,5.
function parseNumber(raw) {
  let s = raw.replace(/\s/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, '');
  return parseFloat(s);
}

function feedback(i, ok, text) {
  const box = $(`#q${i} .feedback`);
  box.hidden = false;
  box.className = `feedback ${ok === true ? 'good' : ok === false ? 'bad' : ''}`;
  box.textContent = text;
  if (ok) {
    const head = $(`#q${i} .q-head`);
    if (!head.querySelector('.ok-badge')) head.insertAdjacentHTML('beforeend', '<span class="ok-badge">Sudah benar</span>');
  }
}

initAccount().then(() => { renderHeader(); route(); });
