import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

const res = (p) => (p.k1 * p.lam) / p.na;        // nm
const dof = (p) => (0.5 * p.lam) / (p.na * p.na); // nm, k2 = 0,5
const NAMES = { 436: 'g-line (lampu merkuri)', 365: 'i-line (lampu merkuri)', 248: 'DUV KrF (laser)', 193: 'DUV ArF (laser)', 13.5: 'EUV (plasma timah)' };
const COLORS = { 436: 0x6a5cff, 365: 0x9a4dff, 248: 0xc04dff, 193: 0xe04dd2, 13.5: 0xff4d8a };

export default {
  id: 'fotolitografi',
  subject: 'semikonduktor',
  title: 'Fotolitografi: Mencetak Pola Nanometer',
  tags: ['industri'],
  summary: 'Bagaimana cahaya ultraviolet "memotret" pola rangkaian ke wafer, dan mengapa panjang gelombang menentukan ukuran transistor.',
  story: `
    <p><strong>Mesin paling rumit di dunia.</strong> Pola rangkaian chip digambar di <em>masker</em> (photomask), lalu disinari cahaya ultraviolet. Lensa raksasa memperkecil bayangan pola itu 4 kali dan memproyeksikannya ke wafer yang dilapisi <em>photoresist</em>, bahan kimia peka cahaya.</p>
    <p>Seberapa kecil garis yang bisa dicetak dibatasi oleh <em>difraksi</em>: cahaya melebar saat melewati celah sempit. Kriteria Rayleigh menyatakan resolusi R = k₁·λ/NA. Agar R kecil, industri memperpendek panjang gelombang λ (dari 436 nm sampai 13,5 nm), memperbesar aperture numerik NA (bahkan mengisi celah lensa–wafer dengan air), dan menekan k₁ dengan trik optik.</p>
    <p>Mesin EUV memakai cahaya 13,5 nm yang dibuat dengan menembakkan laser ke tetesan timah cair 50.000 kali per detik. Karena EUV diserap udara dan kaca, seluruh jalurnya vakum dan memakai cermin, bukan lensa.</p>`,
  concept: 'R = k₁ · λ / NA &nbsp;·&nbsp; DOF = k₂ · λ / NA²',
  conceptNote: 'k₁ secara fisika tidak bisa di bawah 0,25 untuk satu kali paparan. Untuk pola lebih rapat dipakai multiple patterning (beberapa kali paparan dan etsa).',
  equations: [
    {
      f: 'R = k₁ · λ / NA', meaning: 'Lebar garis terkecil yang bisa dicetak. Cahaya dengan gelombang lebih pendek dan lensa yang "lebih lebar" menghasilkan garis lebih tipis.',
      symbols: [['R', 'Resolusi (setengah jarak antar garis)', 'nm'], ['k₁', 'Faktor proses (resist, iluminasi, masker)', 'tanpa satuan'], ['λ', 'Panjang gelombang cahaya', 'nm'], ['NA', 'Aperture numerik lensa = n · sin θ', 'tanpa satuan']],
    },
    {
      f: 'DOF = k₂ · λ / NA²', meaning: 'Kedalaman fokus: seberapa toleran pencetakan terhadap wafer yang tidak rata. NA besar membuat fokus sangat sempit.',
      symbols: [['DOF', 'Depth of focus', 'nm'], ['k₂', 'Faktor proses (di sini 0,5)', 'tanpa satuan']],
    },
  ],
  params: [
    { key: 'lam', label: 'Sumber cahaya λ', type: 'select', value: 193, options: [436, 365, 248, 193, 13.5].map((v) => ({ value: v, label: `${String(v).replace('.', ',')} nm · ${NAMES[v]}` })) },
    { key: 'na', label: 'Aperture numerik NA', min: 0.1, max: 1.35, step: 0.01, value: 1.35, unit: '' },
    { key: 'k1', label: 'Faktor proses k₁', min: 0.25, max: 0.8, step: 0.01, value: 0.3, unit: '' },
  ],
  compute(p) {
    return [
      { label: 'Resolusi (lebar garis minimum)', value: res(p), unit: 'nm', digits: 1, main: true },
      { label: 'Kedalaman fokus', value: dof(p), unit: 'nm', digits: 1 },
      { label: 'Garis per mikrometer', value: 1000 / (2 * res(p)), unit: 'pasang garis', digits: 1 },
      { label: 'Teknologi', value: p.na > 1 ? 'Imersi air (NA > 1)' : 'Kering', text: true },
    ];
  },
  view: { camera: [7, 6, 10], target: [0, 3, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0x9aa4ae });
    const lamp = mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.6, 32), mat(0x2b2f36), { y: 7.4 });
    const glow = mesh(new THREE.SphereGeometry(0.35, 24, 12), new THREE.MeshBasicMaterial({ color: 0xe04dd2 }), { y: 7.0, shadow: false });
    scene.add(lamp, glow);
    // masker dengan pola garis
    const mask = new THREE.Group();
    mask.add(mesh(new THREE.BoxGeometry(3, 0.06, 3), mat(0xdfe8f0, { transparent: true, opacity: 0.6 })));
    for (let i = -5; i <= 5; i += 2) mask.add(mesh(new THREE.BoxGeometry(0.22, 0.08, 2.6), mat(0x22262c), { x: i * 0.13 }));
    mask.position.y = 5.8; scene.add(mask);
    // lensa proyeksi (tabung)
    const lens = mesh(new THREE.CylinderGeometry(1.4, 1.1, 2.2, 40, 1, true), mat(0x7d8794, { metalness: 0.8, side: THREE.DoubleSide }), { y: 3.6 });
    scene.add(lens);
    const water = mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.25, 40), mat(0x5fb7ff, { transparent: true, opacity: 0.45 }), { y: 2.3 });
    scene.add(water);
    // wafer + garis resist hasil cetak
    scene.add(mesh(new THREE.CylinderGeometry(3, 3, 0.1, 64), mat(0x8e9aab, { metalness: 0.9, roughness: 0.15 }), { y: 2.05 }));
    const lines = Array.from({ length: 21 }, () => { const l = mesh(new THREE.BoxGeometry(0.1, 0.08, 2.2), mat(0xe04dd2, { emissive: 0x3a0a33 })); scene.add(l); return l; });
    const beam = particles(160, 0xe04dd2, 0.04);
    scene.add(beam);
    const tag = label('', { size: 0.5 });
    tag.position.set(0, 8.4, 0);
    scene.add(tag);
    return {
      update(p, t) {
        const c = COLORS[p.lam] ?? 0xe04dd2;
        glow.material.color.set(c);
        beam.material.color.set(c);
        water.visible = p.na > 1;
        // jarak garis di layar ∝ resolusi (dibandingkan 200 nm = 0,4 satuan)
        const w = Math.max(0.02, (res(p) / 200) * 0.2);
        lines.forEach((l, i) => {
          const x = (i - 10) * w * 2;
          l.visible = Math.abs(x) < 2.6;
          l.scale.x = w / 0.1;
          l.position.set(x, 2.14, 0);
          l.material.color.set(c);
        });
        for (let i = 0; i < 160; i++) {
          const f = (t * 0.7 + i * 0.0613) % 1;
          const a = i * 2.39996;
          const r = f < 0.25 ? 0.2 + f * 2 : f < 0.65 ? 0.7 : 0.7 * (1 - (f - 0.65) / 0.35) + 0.15;
          e(i, Math.cos(a) * r, 7 - f * 4.8, Math.sin(a) * r);
        }
        beam.instanceMatrix.needsUpdate = true;
        tag.setText(`λ ${String(p.lam).replace('.', ',')} nm → garis ${res(p).toFixed(1)} nm`);
      },
    };
    function e(i, x, y, z) { beam.setAt(i, x, y, z, 1); }
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Scanner DUV imersi memakai laser ArF (λ = 193 nm), NA = 1,35, dan k₁ = 0,30. Berapa resolusinya?',
      preset: { lam: 193, na: 1.35, k1: 0.3 }, answer: 42.9, tolerance: 0.01, unit: 'nm',
      explain: 'R = 0,30 × 193 / 1,35 = 57,9 / 1,35 ≈ 42,9 nm.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Mesin EUV memakai λ = 13,5 nm, NA = 0,33, dan k₁ = 0,40. Berapa resolusinya?',
      preset: { lam: 13.5, na: 0.33, k1: 0.4 }, answer: 16.4, tolerance: 0.01, unit: 'nm',
      explain: 'R = 0,40 × 13,5 / 0,33 = 5,4 / 0,33 ≈ 16,4 nm, jauh lebih halus daripada DUV walaupun NA-nya kecil.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Mengapa cahaya dengan panjang gelombang lebih pendek dapat mencetak pola yang lebih kecil?',
      options: ['Karena cahayanya lebih terang', 'Karena difraksi (pelebaran cahaya saat melewati celah) sebanding dengan λ; gelombang pendek lebih sedikit melebar sehingga detail kecil tetap tajam', 'Karena cahaya pendek lebih panas', 'Karena photoresist hanya bereaksi pada warna ungu'], answer: 1,
      explain: 'Batas difraksi Rayleigh: detail yang lebih kecil dari ~λ/NA kabur. Itu sebabnya industri berpindah dari 436 nm → 193 nm → 13,5 nm.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Litografi imersi bisa mencapai NA 1,35, padahal lensa di udara maksimal NA < 1. Bagaimana caranya?',
      preset: { na: 1.35 },
      options: ['Lensa dibuat dari berlian', 'Celah antara lensa dan wafer diisi air murni (n ≈ 1,44), sehingga NA = n·sin θ bisa melebihi 1', 'Wafer diputar lebih cepat', 'Masker diletakkan di dalam air'], answer: 1,
      explain: 'Indeks bias air lebih besar dari udara, sehingga sudut cahaya yang bisa ditangkap lensa efektif lebih besar. Air disemprotkan hanya di bawah lensa saat wafer bergerak.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Sains',
      prompt: 'Pada photoresist positif, apa yang terjadi pada bagian yang terkena cahaya?',
      options: ['Menjadi lebih keras dan tetap tinggal', 'Ikatan kimianya berubah sehingga larut dalam developer dan hilang, membuka permukaan di bawahnya', 'Berubah menjadi logam', 'Memantulkan cahaya kembali ke masker'], answer: 1,
      explain: 'Resist positif: yang terpapar larut. Resist negatif: yang terpapar mengeras. Bagian yang terbuka lalu dietsa atau didoping.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Sebelum ada EUV, pabrik membuat pola 7 nm dengan DUV 193 nm memakai multiple patterning. Apa konsekuensi rekayasanya?',
      options: ['Tidak ada; hanya lebih cepat', 'Jumlah langkah paparan dan etsa berlipat, sehingga waktu, biaya, dan risiko salah posisi antar paparan (overlay error) meningkat', 'Chip menjadi lebih besar', 'Tidak perlu photoresist'], answer: 1,
      explain: 'Membagi satu pola rapat ke 2–4 masker memungkinkan k₁ efektif < 0,25, tetapi setiap lapisan butuh lebih banyak langkah dan penyejajaran sangat presisi. EUV menyederhanakannya kembali.',
    },
  ],
};
