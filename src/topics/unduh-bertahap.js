import { mat, mesh, ground, label } from '../lib/helpers.js';
import lab from '../labs/unduh-bertahap.js';

const BATAS = 4.5; // MB, batas ukuran respons fungsi serverless Vercel

const potongan = (p) => Math.ceil(p.S / p.c);
const perPotong = (p) => p.L / 1000 + (8 * p.c) / p.B;          // detik
const total = (p) => p.L / 1000 + potongan(p) * perPotong(p);    // + 1 permintaan meta
const sah = (p) => p.c <= BATAS;
const MAXB = 80;

export default {
  id: 'unduh-bertahap',
  subject: 'coding',
  title: 'API Unduhan PDF Bertahap',
  tags: ['web', 'industri'],
  summary: 'Fungsi serverless punya batas ukuran respons. File besar dipecah menjadi potongan, lalu disusun ulang di browser.',
  story: `
    <p><strong>Studi kasus: simulasi keadilan memakai PDF asli.</strong> Laporan mahasiswa di Google Drive bisa berukuran 10–30 MB karena banyak screenshot. Fungsi serverless Vercel hanya boleh mengirim respons hingga 4,5 MB. Jika satu PDF dikirim sekaligus, fungsi gagal dengan galat <code>FUNCTION_PAYLOAD_TOO_LARGE</code>.</p>
    <p><strong>Solusi: protokol dua langkah.</strong> (1) Browser meminta metadata: <code>/api/stat?action=pdf&amp;id=…&amp;meta=1</code> → <code>{ size, chunk }</code>. (2) Browser mengambil potongan satu per satu dengan <code>&amp;start=N</code>. Server meneruskannya ke Drive memakai header <code>Range</code>:</p>
    <pre><code>// server (api/stat.js)
const CHUNK = 3 * 1024 * 1024;
const end = Math.min(start + CHUNK, size) - 1;
const r = await fetch(driveUrl + '?alt=media', {
  headers: { Authorization: 'Bearer ' + token, Range: \`bytes=\${start}-\${end}\` } });
res.setHeader('Content-Type', 'application/octet-stream');
res.send(Buffer.from(await r.arrayBuffer()));</code></pre>
    <pre><code>// browser
const out = new Uint8Array(meta.size);
for (let start = 0; start &lt; meta.size; start += meta.chunk) {
  const r = await fetch(\`/api/stat?action=pdf&amp;id=\${id}&amp;start=\${start}\`, { headers });
  out.set(new Uint8Array(await r.arrayBuffer()), start);   // tempel di posisinya
}
const pdf = await pdfjsLib.getDocument({ data: out }).promise;</code></pre>
    <p>Ukuran 3 MB dipilih agar jauh di bawah batas 4,5 MB, tetapi tidak terlalu kecil. Setiap potongan menambah satu kali <em>latensi</em> (waktu bolak-balik ke server). Progres "mengunduh 40%…" juga mudah ditampilkan karena jumlah potongan diketahui sejak awal.</p>`,
  concept: `k = ⌈S / c⌉ &nbsp;·&nbsp; T ≈ L + k · (L + 8c / B) &nbsp;·&nbsp; syarat: c ≤ 4,5 MB`,
  conceptNote: 'L adalah latensi bolak-balik satu permintaan. Satu permintaan tambahan untuk metadata ikut dihitung. Model mengabaikan waktu pemrosesan di server.',
  equations: [
    {
      f: 'k = ⌈S / c⌉',
      meaning: 'Banyaknya potongan adalah ukuran file dibagi ukuran potongan, lalu dibulatkan ke atas, karena sisa yang kecil tetap butuh satu potongan sendiri.',
      symbols: [
        ['k', 'Jumlah potongan (permintaan data)', 'buah'],
        ['S', 'Ukuran file PDF', 'MB'],
        ['c', 'Ukuran satu potongan', 'MB'],
      ],
    },
    {
      f: 'T ≈ L + k · (L + 8c / B)',
      meaning: 'Waktu total = satu permintaan metadata, ditambah setiap potongan yang masing-masing butuh waktu tunggu (latensi) dan waktu transfer datanya.',
      symbols: [
        ['T', 'Waktu sampai seluruh PDF terkumpul', 's'],
        ['L', 'Latensi satu permintaan bolak-balik', 's'],
        ['B', 'Kecepatan unduh', 'Mbps'],
      ],
    },
    {"f":"MB/s = Mbps / 8","meaning":"Laju jaringan ditulis dalam megabit per detik; 8 bit = 1 byte.","symbols":[["Mbps","Megabit per detik","Mbit/s"]]},
  ],
  params: [
    { key: 'S', label: 'Ukuran PDF', min: 0.5, max: 40, step: 0.5, value: 12, unit: 'MB' },
    { key: 'c', label: 'Ukuran potongan', min: 0.5, max: 6, step: 0.5, value: 3, unit: 'MB' },
    { key: 'L', label: 'Latensi per permintaan', min: 20, max: 1000, step: 10, value: 200, unit: 'ms' },
    { key: 'B', label: 'Kecepatan unduh', min: 2, max: 100, step: 1, value: 20, unit: 'Mbps' },
  ],
  compute(p) {
    return [
      sah(p)
        ? { label: 'Waktu unduh total', value: total(p), unit: 's', digits: 1, main: true }
        : { label: 'Waktu unduh total', value: 'Gagal', text: true, main: true },
      { label: 'Jumlah potongan', value: potongan(p), unit: 'buah', digits: 0 },
      { label: 'Total permintaan (+ meta)', value: potongan(p) + 1, unit: 'kali', digits: 0 },
      { label: 'Bagian waktu untuk latensi', value: ((potongan(p) + 1) * p.L / 1000 / total(p)) * 100, unit: '%', digits: 0 },
      { label: 'Batas 4,5 MB per respons', value: sah(p) ? 'Aman' : 'Melebihi batas: FUNCTION_PAYLOAD_TOO_LARGE', text: true },
    ];
  },
  lab,
  view: { camera: [3, 7, 14], target: [0, 1.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xb5bdd2 });
    // Drive (kiri), fungsi serverless (tengah), laptop (kanan)
    const drive = mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.6, 24), mat(0x93b6ff), { x: -7, y: 1.3 });
    const fn = mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), mat(0x5fd6c4, { emissive: 0x5fd6c4, emissiveIntensity: 0.15 }), { x: 0, y: 1.2 });
    const gate = mesh(new THREE.TorusGeometry(1.15, 0.07, 8, 40), new THREE.MeshBasicMaterial({ color: 0x5fd6c4 }), { x: 1.4, y: 1.2, shadow: false });
    gate.rotation.y = Math.PI / 2;
    const laptop = new THREE.Group();
    laptop.add(mesh(new THREE.BoxGeometry(2.4, 0.12, 1.6), mat(0x3b4766)));
    laptop.add(mesh(new THREE.BoxGeometry(2.4, 1.5, 0.08), mat(0x1b2440, { emissive: 0x93b6ff, emissiveIntensity: 0.15 }), { y: 0.75, z: -0.8 }));
    laptop.position.set(7, 0.1, 0);
    scene.add(drive, fn, gate, laptop);
    [['Google Drive', -7, 3.2], ['/api/stat', 0, 2.6], ['Browser', 7, 2.4]].forEach(([t, x, y]) => {
      const l = label(t, { size: 0.45 }); l.position.set(x, y, 0); scene.add(l);
    });
    const blocks = Array.from({ length: MAXB }, () => {
      const b = mesh(new THREE.BoxGeometry(1, 1, 1), mat(0xffd36b));
      scene.add(b);
      return b;
    });
    const tag = label('', { size: 0.65 });
    tag.position.set(0, 4.6, 0);
    scene.add(tag);

    return {
      update(p, t) {
        const k = potongan(p), ok = sah(p);
        const s = 0.25 + 0.18 * p.c; // ukuran kubus ∝ ukuran potongan
        const step = perPotong(p) * 0.6; // detik animasi per potongan
        const cycle = k * step + 1.5;
        const now = t % cycle;
        gate.material.color.setHex(ok ? 0x5fd6c4 : 0xff7a5c);
        blocks.forEach((b, i) => {
          b.visible = i < Math.min(k, MAXB);
          if (!b.visible) return;
          b.scale.setScalar(s);
          b.material.color.setHex(ok ? 0xffd36b : 0xff7a5c);
          const f = (now - i * step) / step; // 0..1 saat potongan ke-i berjalan
          const col = i % 8, row = Math.floor(i / 8);
          if (f < 0) { // masih di Drive
            b.position.set(-7 + (col - 3.5) * 0.12, 2.8 + row * s, 0);
            b.visible = i < 32;
          } else if (f < 1) {
            const g = ok ? f : Math.min(f, 0.5) - Math.max(0, f - 0.5); // ditolak: memantul di gerbang
            b.position.set(-6 + g * 13, 1.2 + Math.sin(f * Math.PI) * 1.4, 0);
          } else if (ok) { // tersusun di browser
            b.position.set(5.8 + (col % 8) * s * 0.4, 0.3 + row * s * 0.5, 0.6);
            b.scale.setScalar(s * 0.4);
          } else {
            b.position.set(1, 0.2 + (i % 5) * 0.1, 1 + row * 0.2);
          }
        });
        tag.setText(ok ? `${k} potongan · ${total(p).toFixed(1).replace('.', ',')} s` : `Potongan ${String(p.c).replace('.', ',')} MB > 4,5 MB: ditolak`);
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Sebuah laporan PDF berukuran 12 MB diunduh dengan potongan 3 MB. Termasuk satu permintaan metadata, berapa kali browser memanggil /api/stat?',
      preset: { S: 12, c: 3 },
      answer: 5, tolerance: 0, unit: 'kali',
      explain: 'k = ⌈12/3⌉ = 4 potongan, ditambah 1 permintaan meta = 5 permintaan.',
    },
    {
      type: 'num', kind: 'Studi kasus',
      prompt: 'Masih PDF 12 MB dengan potongan 3 MB. Latensi setiap permintaan 200 ms dan kecepatan unduh 20 Mbps. Berapa perkiraan waktu sampai PDF siap dibaca pdf.js?',
      preset: { S: 12, c: 3, L: 200, B: 20 },
      answer: 5.8, tolerance: 0.03, unit: 's',
      explain: 'Per potongan: 0,2 + 8 × 3 / 20 = 0,2 + 1,2 = 1,4 s. Empat potongan = 5,6 s, ditambah 0,2 s untuk meta = 5,8 s.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Agar lebih cepat, seorang asisten mengubah ukuran potongan menjadi 6 MB. Apa yang terjadi?',
      preset: { S: 12, c: 6 },
      options: [
        'Unduhan jadi dua kali lebih cepat tanpa masalah',
        'Setiap respons melebihi batas 4,5 MB fungsi serverless, sehingga permintaan gagal (FUNCTION_PAYLOAD_TOO_LARGE)',
        'Google Drive otomatis mengompres PDF',
        'Tidak ada pengaruh karena ukuran potongan diabaikan browser',
      ],
      answer: 1,
      explain: 'Potongan yang lebih besar memang mengurangi jumlah latensi, tetapi batas respons Vercel 4,5 MB tidak bisa dilewati. 3 MB memberi ruang aman sambil tetap membuat jumlah permintaan kecil.',
    },
  ],
};
