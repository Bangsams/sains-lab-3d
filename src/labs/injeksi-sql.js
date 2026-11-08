import { pasangPenguji } from './uji-keamanan.js';

const code = String.raw`// Lab Keamanan Siber 2: celah SQL injection di form login dan cara menutupnya.
// db.query(sql, params) adalah database tiruan di sandbox dengan tabel users dan nilai.
// Setiap perintah SQL yang dijalankan ditampilkan di konsol dengan awalan [db].

function usernameValid(u) {
  // TANTANGAN 2: kembalikan false jika u tidak cocok dengan pola /^[a-z0-9_]{3,20}$/
  return true;
}

// --- Versi RENTAN: input pengguna ditempel langsung ke teks SQL ---
function login(username, password) {
  if (!usernameValid(username)) return null;
  const sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  const rows = db.query(sql);
  return rows.length > 0 ? rows[0] : null;
}

function nilaiSaya(nim) {
  return db.query("SELECT matkul, nilai FROM nilai WHERE nim = '" + nim + "'");
}

// TANTANGAN 1: ubah kedua fungsi agar memakai placeholder ? dan daftar params, contoh:
//   db.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password])
// Dengan placeholder, input selalu diperlakukan sebagai DATA, bukan bagian dari perintah SQL.

// ---------- Coba serang sendiri ----------
console.log('Login normal  :', login('budi', 'kopi123'));
console.log('Login serangan:', login("admin' --", 'apa saja'));
console.log('Intip nilai   :', nilaiSaya("x' OR '1'='1"));

// ---------- Uji keamanan otomatis (jangan diubah) ----------
uji('Login dengan password benar tetap berhasil', () => login('budi', 'kopi123')?.username === 'budi');
uji('Password salah ditolak', () => login('budi', 'salah') === null);
uji("Bypass komentar  admin' --  ditolak", () => login("admin' --", 'x') === null || 'masuk sebagai ' + login("admin' --", 'x').username);
uji("Bypass  ' OR '1'='1  ditolak", () => login("' OR '1'='1", "' OR '1'='1") === null);
uji('Nilai mahasiswa lain tidak bocor', () => nilaiSaya("x' OR '1'='1").length === 0 || nilaiSaya("x' OR '1'='1").length + ' baris bocor');
uji('Nilai sendiri tetap tampil', () => nilaiSaya('2201001').length === 2);
uji('Validasi input menolak karakter berbahaya', () => !usernameValid("admin'--") && usernameValid('budi'));
ringkasan();`;

// Database SQL mini: hanya SELECT ... FROM ... WHERE dengan =, !=, AND, OR, NOT, kurung, komentar --, dan placeholder ?.
function setup(G) {
  const TABLES = {
    users: [
      { id: 1, username: 'admin', password: 'Adm!n-Sekolah#2026', peran: 'admin' },
      { id: 2, username: 'budi', password: 'kopi123', peran: 'siswa' },
      { id: 3, username: 'sari', password: 'melati88', peran: 'siswa' },
    ],
    nilai: [
      { nim: '2201001', matkul: 'Fisika', nilai: 88 }, { nim: '2201001', matkul: 'Kimia', nilai: 79 },
      { nim: '2201002', matkul: 'Fisika', nilai: 64 }, { nim: '2201002', matkul: 'Kimia', nilai: 91 },
      { nim: '2201003', matkul: 'Fisika', nilai: 72 },
    ],
  };
  function tokenize(sql, params) {
    const out = []; let i = 0, pi = 0;
    while (i < sql.length) {
      const c = sql[i];
      if (/\s/.test(c)) { i++; continue; }
      if (sql.startsWith('--', i)) { const sisa = sql.slice(i + 2).trim(); if (sisa) console.warn('  [db] ⚠ sisa perintah dianggap komentar: ' + sisa); break; }
      if (c === ';') { const sisa = sql.slice(i + 1).trim(); if (sisa) console.warn('  [db] ⚠ perintah kedua diabaikan di lab: "' + sisa + '" (server asli bisa mengeksekusinya!)'); break; }
      if (c === "'") {
        let s = ''; i++;
        for (;;) {
          if (i >= sql.length) throw new Error('SQL syntax error: unrecognized token (tanda kutip tidak ditutup)');
          if (sql[i] === "'" && sql[i + 1] === "'") { s += "'"; i += 2; continue; }
          if (sql[i] === "'") { i++; break; }
          s += sql[i++];
        }
        out.push({ t: 'val', v: s }); continue;
      }
      if (c === '?') { if (pi >= params.length) throw new Error('Jumlah params kurang dari jumlah ?'); out.push({ t: 'val', v: String(params[pi++]) }); i++; continue; }
      const m = /^(!=|<>|=|\(|\)|,|\*)/.exec(sql.slice(i));
      if (m) { out.push({ t: 'op', v: m[1] === '<>' ? '!=' : m[1] }); i += m[1].length; continue; }
      const w = /^[A-Za-z_][A-Za-z0-9_]*|^\d+/.exec(sql.slice(i));
      if (!w) throw new Error('SQL syntax error near "' + sql.slice(i, i + 10) + '"');
      const up = w[0].toUpperCase();
      out.push(/^\d+$/.test(w[0]) ? { t: 'val', v: w[0] } : ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT'].includes(up) ? { t: 'kw', v: up } : { t: 'id', v: w[0] });
      i += w[0].length;
    }
    return out;
  }
  function query(sql, params = []) {
    console.log('  [db] ' + sql + (params.length ? '   params=' + JSON.stringify(params) : ''));
    const tk = tokenize(sql, params); let k = 0;
    const peek = () => tk[k], next = () => tk[k++];
    const expect = (t, v) => { const x = next(); if (!x || x.t !== t || (v && x.v !== v)) throw new Error('SQL syntax error dekat ' + (x ? x.v : 'akhir perintah')); return x; };
    expect('kw', 'SELECT');
    const cols = [];
    if (peek() && peek().v === '*') { next(); cols.push('*'); } else { do { cols.push(expect('id').v); } while (peek() && peek().v === ',' && next()); }
    expect('kw', 'FROM');
    const table = TABLES[expect('id').v];
    if (!table) throw new Error('no such table');
    let where = () => true;
    const prim = () => {
      const x = next();
      if (!x) throw new Error('SQL syntax error: perintah berakhir terlalu cepat');
      if (x.t === 'val') return () => x.v;
      if (x.t === 'id') return (r) => { if (!(x.v in r)) throw new Error('no such column: ' + x.v); return String(r[x.v]); };
      if (x.v === '(') { const e = or(); expect('op', ')'); return e; }
      throw new Error('SQL syntax error dekat ' + x.v);
    };
    const cmp = () => { const a = prim(); const o = peek(); if (o && (o.v === '=' || o.v === '!=')) { next(); const b = prim(); return o.v === '=' ? (r) => a(r) === b(r) : (r) => a(r) !== b(r); } return (r) => { const v = a(r); return v !== '' && v !== '0' && v !== false; }; };
    const not = () => { if (peek() && peek().v === 'NOT') { next(); const e = not(); return (r) => !e(r); } return cmp(); };
    const and = () => { let e = not(); while (peek() && peek().v === 'AND') { next(); const a = e, b = not(); e = (r) => a(r) && b(r); } return e; };
    const or = () => { let e = and(); while (peek() && peek().v === 'OR') { next(); const a = e, b = and(); e = (r) => a(r) || b(r); } return e; };
    if (peek()) { expect('kw', 'WHERE'); where = or(); }
    if (peek()) throw new Error('SQL syntax error dekat ' + peek().v);
    return table.filter((r) => where(r)).map((r) => (cols[0] === '*' ? { ...r } : Object.fromEntries(cols.map((c) => [c, r[c]]))));
  }
  G.db = { query };
}

export default {
  title: 'Serang lalu tambal form login yang rentan SQL injection',
  intro: 'Fungsi <code>login()</code> dan <code>nilaiSaya()</code> menempelkan input pengguna langsung ke perintah SQL. Jalankan untuk melihat bagaimana <code>admin\' --</code> masuk tanpa password dan <code>\' OR \'1\'=\'1</code> membocorkan nilai semua mahasiswa. Lalu tambal dengan <em>prepared statement</em> dan validasi input sampai semua uji <code>✓ LULUS</code>.',
  file: 'login-sekolah.js',
  lang: 'js',
  code,
  setup: [pasangPenguji, setup],
  source: 'Kode latihan Sams Lab. Database adalah tiruan kecil di iframe sandbox (tanpa jaringan), jadi aman untuk dicoba menyerang.',
  tasks: [
    'Jalankan kode apa adanya. Lihat baris <code>[db]</code>: bagaimana bentuk SQL setelah input <code>admin\' --</code> ditempelkan?',
    'Coba input <code>budi\'</code> (satu tanda kutip). Pesan galat apa yang muncul? Mengapa pesan galat database sebaiknya tidak ditampilkan ke pengguna?',
    'Tantangan 1: ubah <code>login</code> dan <code>nilaiSaya</code> agar memakai placeholder <code>?</code>. Perhatikan baris <code>[db]</code> kini menampilkan <code>params=</code> terpisah.',
    'Tantangan 2: lengkapi <code>usernameValid</code> dengan <code>/^[a-z0-9_]{3,20}$/.test(u)</code>.',
    'Bonus: kolom <code>password</code> masih teks polos. Gabungkan dengan lab <em>Kata Sandi</em>: apa yang harus diubah agar database yang bocor tidak langsung membuka akun?',
  ],
};
