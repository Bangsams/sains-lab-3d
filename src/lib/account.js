// Akun Google + progres soal per akun.
// mode 'account'  : login Google, progres & riwayat disimpan di server (/api/progress)
// mode 'login'    : login wajib tetapi belum masuk → tampilkan gerbang login
// mode 'guest'    : server/login belum tersedia (file standalone atau Client ID belum diatur) → simpan di peramban
const LOCAL_KEY = 'sainslab3d.v1';
const GSI_SRC = 'https://accounts.google.com/gsi/client';

let local = {};
try { local = JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}; } catch { local = {}; }
const saveLocal = () => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(local)); } catch { /* abaikan */ } };

export const account = {
  mode: 'guest', user: null, clientId: null, devLogin: false, reason: '',
  record: { solved: {}, history: [] },
};

async function api(path, opts = {}) {
  const r = await fetch(path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data.error || `HTTP ${r.status}`), { status: r.status });
  return data;
}

export async function initAccount() {
  let s;
  try { s = await api('/api/session'); } catch {
    account.mode = 'guest';
    account.reason = 'Server akun tidak terjangkau. Progres disimpan di peramban ini saja.';
    account.record = { solved: local, history: [] };
    return account;
  }
  account.clientId = s.clientId; account.devLogin = s.devLogin;
  if (!s.clientId && !s.devLogin) {
    account.mode = 'guest';
    account.reason = 'Login Google belum diaktifkan oleh admin. Sementara progres disimpan di peramban ini.';
    account.record = { solved: local, history: [] };
    return account;
  }
  if (!s.user) { account.mode = 'login'; return account; }
  await enterAccount(s.user);
  return account;
}

async function enterAccount(user) {
  account.user = user;
  account.mode = 'account';
  account.record = await api('/api/progress');
  // progres lama yang tersimpan di peramban ikut dipindahkan ke akun (sekali saja)
  if (Object.keys(local).length) {
    try {
      account.record = await api('/api/progress', { method: 'POST', body: JSON.stringify({ solved: local }) });
      local = {}; saveLocal();
    } catch { /* coba lagi lain kali */ }
  }
}

export function solvedList(topicId) { return account.record.solved[topicId] || []; }
export const solvedCount = (topicId) => solvedList(topicId).filter(Boolean).length;
export const isSolved = (topicId, i) => solvedList(topicId)[i] === true;

// Dicatat setiap kali tombol "Periksa" ditekan.
export async function recordAnswer(topicId, i, ok, answer) {
  const at = new Date().toISOString();
  if (ok) {
    const arr = account.record.solved[topicId] || (account.record.solved[topicId] = []);
    arr[i] = true;
  }
  account.record.history.push({ at, topic: topicId, q: i, ok, answer: String(answer) });
  if (account.mode !== 'account') { if (ok) { local = account.record.solved; saveLocal(); } return; }
  const solved = ok ? { [topicId]: account.record.solved[topicId] } : {};
  try {
    const rec = await api('/api/progress', { method: 'POST', body: JSON.stringify({ solved, events: [{ at, topic: topicId, q: i, ok, answer: String(answer) }] }) });
    account.record = rec;
  } catch (e) {
    if (e.status === 401) location.reload();
  }
}

export async function logout() {
  try { await api('/api/session', { method: 'DELETE' }); } catch { /* abaikan */ }
  try { window.google?.accounts.id.disableAutoSelect(); } catch { /* abaikan */ }
  location.hash = '';
  location.reload();
}

function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = GSI_SRC; s.async = true; s.onload = ok; s.onerror = () => fail(new Error('Gagal memuat Google Sign-In'));
    document.head.append(s);
  });
}

// Menampilkan tombol Google di dalam el. onDone dipanggil setelah login berhasil.
export async function mountGoogleButton(el, onDone, onError) {
  if (account.devLogin && !account.clientId) {
    el.innerHTML = '<button type="button" class="primary">Masuk (mode pengembangan lokal)</button>';
    el.firstChild.onclick = async () => { const s = await api('/api/session', { method: 'POST', body: JSON.stringify({ dev: true }) }); await enterAccount(s.user); onDone(); };
    return;
  }
  try {
    await loadGsi();
    window.google.accounts.id.initialize({
      client_id: account.clientId,
      callback: async ({ credential }) => {
        try {
          const s = await api('/api/session', { method: 'POST', body: JSON.stringify({ credential }) });
          await enterAccount(s.user);
          onDone();
        } catch (e) { onError(e.message); }
      },
      ux_mode: 'popup', context: 'signin',
    });
    window.google.accounts.id.renderButton(el, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with', locale: 'id' });
  } catch (e) { onError(e.message); }
}
