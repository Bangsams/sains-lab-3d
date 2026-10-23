import { Stage } from './lib/engine.js';
import { TOPICS, SUBJECTS, TAGS } from './topics/index.js';

const $ = (sel, el = document) => el.querySelector(sel);
const app = $('#app');
const fmt = (v, d = 0) => Number(v).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---------- penyimpanan progres (aman jika storage diblokir) ----------
const STORE_KEY = 'sainslab3d.v1';
let store = {};
try { store = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { store = {}; }
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* abaikan */ } };
const solved = (id) => (store[id] || []).filter(Boolean).length;

// ---------- satu kanvas 3D dipakai ulang ----------
const stageEl = document.createElement('div');
stageEl.className = 'stage-canvas';
let stage = null;
const getStage = () => (stage ||= new Stage(stageEl));

const filter = { subject: 'all', tag: 'all' };
let current = null;
let params = {};

function route() {
  const id = location.hash.slice(1);
  const topic = TOPICS.find((t) => t.id === id);
  if (topic) renderTopic(topic); else renderHome();
}
window.addEventListener('hashchange', route);

// ---------- beranda ----------
function renderHome() {
  current = null;
  if (stage) stage.paused = true;
  document.title = 'Lab Sains 3D';
  const total = TOPICS.reduce((n, t) => n + t.questions.length, 0);
  const done = TOPICS.reduce((n, t) => n + solved(t.id), 0);
  app.innerHTML = `
    <section class="hero">
      <div class="hero-text">
        <p class="eyebrow">Fisika · Kimia · Biologi · Teknik Roket</p>
        <h1>Belajar sains dari panel surya, pabrik, dan landasan roket.</h1>
        <p class="lede">Setiap topik punya simulasi 3D yang parameternya bisa kamu ubah, cerita atau studi kasus dari Indonesia, dan soal yang langsung menampilkan situasinya dalam bentuk 3D.</p>
      </div>
      <dl class="stats">
        <div><dt>Simulasi 3D</dt><dd>${TOPICS.length}</dd></div>
        <div><dt>Soal</dt><dd>${total}</dd></div>
        <div><dt>Soal kamu jawab benar</dt><dd>${done}</dd></div>
      </dl>
    </section>
    <section class="filters" aria-label="Saring topik">
      <div class="chip-row" role="group" aria-label="Bidang">
        ${chip('subject', 'all', 'Semua bidang')}
        ${Object.entries(SUBJECTS).map(([k, s]) => chip('subject', k, s.name)).join('')}
      </div>
      <div class="chip-row" role="group" aria-label="Konteks">
        ${chip('tag', 'all', 'Semua konteks')}
        ${Object.entries(TAGS).map(([k, s]) => chip('tag', k, s)).join('')}
      </div>
    </section>
    <section class="grid" id="grid"></section>`;
  app.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    filter[b.dataset.filter] = b.dataset.value;
    renderHome();
  }));
  const list = TOPICS.filter((t) => (filter.subject === 'all' || t.subject === filter.subject) && (filter.tag === 'all' || t.tags.includes(filter.tag)));
  $('#grid').innerHTML = list.length ? list.map(card).join('') : '<p class="empty">Belum ada topik untuk kombinasi ini. Pilih bidang atau konteks lain.</p>';
  window.scrollTo(0, 0);
}

const chip = (kind, value, text) => `<button type="button" class="chip" data-filter="${kind}" data-value="${value}" aria-pressed="${filter[kind] === value}">${esc(text)}</button>`;

function card(t) {
  const s = solved(t.id), n = t.questions.length;
  return `
    <a class="card" href="#${t.id}" data-subject="${t.subject}">
      <span class="subj">${SUBJECTS[t.subject].name}</span>
      <h2>${esc(t.title)}</h2>
      <p>${esc(t.summary)}</p>
      <span class="tags">${t.tags.map((g) => `<span>${TAGS[g]}</span>`).join('')}</span>
      <span class="progress" aria-label="${s} dari ${n} soal benar"><span style="width:${(s / n) * 100}%"></span></span>
      <span class="progress-text">${s}/${n} soal benar</span>
    </a>`;
}

// ---------- halaman topik ----------
function renderTopic(t) {
  current = t;
  document.title = `${t.title} · Lab Sains 3D`;
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
          <form class="controls" id="controls" autocomplete="off"></form>
          <button type="button" class="ghost" id="reset">Kembalikan nilai awal</button>
        </section>
        <section role="tabpanel" id="pane-story" aria-labelledby="tab-story" hidden>
          <div class="story">${t.story}</div>
          <h2 class="eq-title">Rumus dan artinya</h2>
          ${equationsHtml(t)}
          <p class="note">${t.conceptNote}</p>
          <button type="button" class="primary" data-go="quiz">Kerjakan soal →</button>
        </section>
        <section role="tabpanel" id="pane-quiz" aria-labelledby="tab-quiz" hidden>
          <ol class="quiz" id="quiz"></ol>
          <a class="next" href="#${next.id}">Topik berikutnya: ${esc(next.title)} →</a>
        </section>
      </div>
    </div>`;
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
  const record = store[t.id] || (store[t.id] = []);
  $('#quiz').innerHTML = t.questions.map((q, i) => `
    <li class="q" id="q${i}">
      <div class="q-head"><span class="kind">${q.kind}</span>${record[i] ? '<span class="ok-badge">Sudah benar</span>' : ''}</div>
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
      let correct;
      if (q.type === 'mcq') {
        const pick = f.querySelector('input:checked');
        if (!pick) return feedback(i, null, 'Pilih salah satu jawaban dulu.');
        correct = Number(pick.value) === q.answer;
      } else {
        const v = parseNumber(f.querySelector('input').value);
        if (Number.isNaN(v)) return feedback(i, null, 'Tulis jawaban berupa angka, misalnya 2280 atau 3,08.');
        correct = q.integer ? Math.round(v) === q.answer : Math.abs(v - q.answer) <= Math.abs(q.answer) * q.tolerance + 1e-9;
      }
      if (correct) { record[i] = true; save(); }
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

route();
