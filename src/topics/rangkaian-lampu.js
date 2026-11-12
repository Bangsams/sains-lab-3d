import { mat, mesh, ground, label } from '../lib/helpers.js';

// Model: lampu pijar dianggap hambatan tetap R = V_r² / P_r (rating 12 V).
const VR = 12;
const rLamp = (p) => (VR * VR) / p.Pr;
const rTot = (p) => (p.mode ? rLamp(p) / p.n : rLamp(p) * p.n);
const iTot = (p) => p.V / rTot(p);
const vLamp = (p) => (p.mode ? p.V : p.V / p.n);
const pLamp = (p) => (vLamp(p) ** 2) / rLamp(p);
const lit = (r, ids) => ids.every((id) => r.parts[id] && r.parts[id].level > 0.1);
const dark = (r, ids) => ids.every((id) => !r.parts[id] || r.parts[id].level < 0.02);

export default {
  id: 'rangkaian-lampu',
  subject: 'listrik',
  title: 'Rangkaian Lampu Seri & Paralel',
  tags: ['sehari-hari', 'energi'],
  summary: 'Kenapa lampu rumah dipasang paralel? Hitung arus, tegangan, daya, dan biaya listrik, lalu rakit sendiri kabelnya di Lab Rangkaian.',
  story: `
    <p><strong>Studi kasus: Bengkel listrik SMK di Yogyakarta.</strong> Siswa merakit papan latihan berisi baterai 12 V dan beberapa lampu 12 V 6 W. Saat dua lampu dipasang <em>seri</em>, keduanya menyala redup. Saat dipasang <em>paralel</em>, setiap lampu menyala terang.</p>
    <p>Pada rangkaian seri, arus yang sama melewati semua lampu dan tegangan baterai terbagi. Pada rangkaian paralel, setiap lampu mendapat tegangan penuh sehingga arus total adalah jumlah arus setiap cabang. Karena itulah instalasi rumah memakai rangkaian paralel: setiap lampu mendapat 220 V dan bisa dinyalakan sendiri-sendiri.</p>
    <p>Di rumah, <strong>MCB</strong> memutus listrik jika arus total terlalu besar, dan saklar dipasang di kabel fasa (L) agar lampu benar-benar tidak bertegangan saat dimatikan.</p>`,
  concept: 'V = I · R &nbsp;·&nbsp; R<sub>seri</sub> = R₁ + R₂ + … &nbsp;·&nbsp; 1/R<sub>paralel</sub> = 1/R₁ + 1/R₂ + … &nbsp;·&nbsp; P = V · I = V²/R',
  conceptNote: 'Lampu dianggap hambatan tetap (R = V²/P dari label). Lampu pijar sungguhan hambatannya naik saat panas, tetapi model ini cukup untuk memahami pola seri–paralel. Tarif contoh Rp 1.444,70/kWh (rumah tangga 1.300 VA).',
  equations: [
    { f: 'V = I · R &nbsp;·&nbsp; I = V / R', meaning: 'Hukum Ohm: arus makin besar jika tegangan makin besar, dan makin kecil jika hambatan makin besar.', symbols: [['V', 'Tegangan', 'V (volt)'], ['I', 'Arus listrik', 'A (ampere)'], ['R', 'Hambatan', 'Ω (ohm)']] },
    { f: 'R<sub>lampu</sub> = V<sub>r</sub>² / P<sub>r</sub>', meaning: 'Hambatan lampu dihitung dari label tegangan dan dayanya.', symbols: [['V<sub>r</sub>', 'Tegangan rating di label', 'V'], ['P<sub>r</sub>', 'Daya rating di label', 'W']] },
    { f: 'Seri: R<sub>total</sub> = R₁ + R₂ + … · I sama · V<sub>sumber</sub> = V₁ + V₂ + …', meaning: 'Pada rangkaian seri hanya ada satu jalan arus. Hambatan dijumlahkan, arus di semua lampu sama, dan tegangan sumber terbagi. Jika satu lampu putus, semua mati.', symbols: [['n lampu sama', 'R<sub>total</sub> = n · R, V<sub>lampu</sub> = V/n', '']] },
    { f: 'Paralel: 1/R<sub>total</sub> = 1/R₁ + 1/R₂ + … · V sama · I<sub>total</sub> = I₁ + I₂ + …', meaning: 'Pada rangkaian paralel setiap lampu punya jalurnya sendiri. Setiap lampu mendapat tegangan penuh, dan arus total adalah jumlah arus cabang.', symbols: [['n lampu sama', 'R<sub>total</sub> = R / n, V<sub>lampu</sub> = V', '']] },
    { f: 'P = V · I = V² / R = I² · R &nbsp;·&nbsp; I = P / V', meaning: 'Daya listrik: seberapa cepat energi dipakai. Untuk peralatan yang diketahui dayanya, arus = daya dibagi tegangan.', symbols: [['P', 'Daya', 'W (watt)']] },
    { f: 'E = P · t &nbsp;·&nbsp; Biaya = E<sub>kWh</sub> × tarif', meaning: 'Energi = daya × lama pemakaian. 1 kWh = 1000 W selama 1 jam.', symbols: [['E', 'Energi', 'Wh atau kWh'], ['t', 'Lama menyala', 'jam'], ['tarif', 'Harga listrik', 'Rp/kWh']] },
  ],
  params: [
    { key: 'mode', label: 'Jenis rangkaian', type: 'select', value: 0, options: [{ value: 0, label: 'Seri' }, { value: 1, label: 'Paralel' }] },
    { key: 'n', label: 'Jumlah lampu', min: 1, max: 5, step: 1, value: 2, unit: 'lampu' },
    { key: 'V', label: 'Tegangan sumber', min: 1, max: 24, step: 0.5, value: 12, unit: 'V' },
    { key: 'Pr', label: 'Daya rating lampu (pada 12 V)', min: 1, max: 24, step: 1, value: 6, unit: 'W' },
  ],
  compute(p) {
    return [
      { label: 'Daya tiap lampu', value: pLamp(p), unit: 'W', digits: 2, main: true },
      { label: 'Hambatan satu lampu', value: rLamp(p), unit: 'Ω', digits: 1 },
      { label: 'Hambatan total', value: rTot(p), unit: 'Ω', digits: 2 },
      { label: 'Arus total dari sumber', value: iTot(p), unit: 'A', digits: 3 },
      { label: 'Tegangan tiap lampu', value: vLamp(p), unit: 'V', digits: 2 },
      { label: 'Kecerahan (P / P rating)', value: Math.min(999, (pLamp(p) / p.Pr) * 100), unit: '%', digits: 0 },
    ];
  },
  view: { camera: [0, 7, 11], target: [0, 1, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc8cdd2 });
    scene.add(mesh(new THREE.BoxGeometry(12, 0.3, 6), mat(0x6b4f35), { y: 0.15 }));
    const bat = new THREE.Group();
    bat.add(mesh(new THREE.BoxGeometry(1.6, 1.2, 1), mat(0x2a2f36), { y: 0.9 }));
    bat.add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25), mat(0xd33f3f), { x: -0.4, y: 1.6 }));
    bat.add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25), mat(0x222222), { x: 0.4, y: 1.6 }));
    bat.position.set(-4.6, 0, 1.6);
    scene.add(bat);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xd8a24a, emissive: 0xffaa33, emissiveIntensity: 0 });
    const bulbs = [];
    for (let i = 0; i < 5; i++) {
      const g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.35, 16), mat(0x9aa3ad, { metalness: 0.7 }), { y: 0.5 }));
      const glass = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffc94d, emissiveIntensity: 0, transparent: true, opacity: 0.85 });
      const bulb = mesh(new THREE.SphereGeometry(0.45, 24, 16), glass, { y: 1.05 });
      const light = new THREE.PointLight(0xffc94d, 0, 6);
      light.position.y = 1.1;
      g.add(bulb, light);
      scene.add(g);
      bulbs.push({ g, glass, light });
    }
    const wires = new THREE.Group();
    scene.add(wires);
    const tag = label('', { size: 0.5 });
    tag.position.set(0, 3.6, 0);
    scene.add(tag);
    let key = '';
    const seg = (a, b) => {
      const d = new THREE.Vector3().subVectors(b, a);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, d.length(), 8), wireMat);
      m.position.copy(a).addScaledVector(d, 0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      wires.add(m);
    };
    const V3 = (x, z) => new THREE.Vector3(x, 0.4, z);
    return {
      update(p, t) {
        const k = `${p.mode}-${p.n}`;
        if (k !== key) {
          key = k;
          wires.children.forEach((c) => c.geometry.dispose());
          wires.clear();
          const xs = Array.from({ length: p.n }, (_, i) => -2.6 + i * 1.6);
          bulbs.forEach((b, i) => { b.g.visible = i < p.n; if (i < p.n) b.g.position.set(xs[i], 0.3, p.mode ? -0.6 : 0); });
          if (p.mode) {
            // paralel: dua rel (atas dan bawah) dengan cabang ke setiap lampu
            seg(V3(-5, 1.6), V3(-5, -1.6)); seg(V3(-5, -1.6), V3(xs[p.n - 1], -1.6));
            seg(V3(-4.2, 1.6), V3(-4.2, 1)); seg(V3(-4.2, 1), V3(xs[p.n - 1] + 0.3, 1));
            xs.forEach((x) => { seg(V3(x, -1.6), V3(x, -0.6)); seg(V3(x + 0.3, 1), V3(x + 0.3, -0.6)); });
          } else {
            seg(V3(-5, 1.6), V3(-5, 0)); seg(V3(-5, 0), V3(xs[0], 0));
            for (let i = 0; i < p.n - 1; i++) seg(V3(xs[i], 0), V3(xs[i + 1], 0));
            seg(V3(xs[p.n - 1], 0), V3(xs[p.n - 1] + 1, 0)); seg(V3(xs[p.n - 1] + 1, 0), V3(xs[p.n - 1] + 1, 2.4)); seg(V3(xs[p.n - 1] + 1, 2.4), V3(-4.2, 2.4)); seg(V3(-4.2, 2.4), V3(-4.2, 1.6));
          }
        }
        const lv = Math.min(1.5, pLamp(p) / p.Pr);
        bulbs.forEach((b, i) => { if (i < p.n) { b.glass.emissiveIntensity = 0.05 + 2.2 * lv * (0.97 + 0.03 * Math.sin(t * 40)); b.light.intensity = 3 * lv; } });
        wireMat.emissiveIntensity = Math.min(1, iTot(p) / 3) * 0.6;
        tag.setText(`${p.mode ? 'Paralel' : 'Seri'} · ${p.n} lampu · I = ${iTot(p).toFixed(2).replace('.', ',')} A · ${pLamp(p).toFixed(1).replace('.', ',')} W/lampu`);
      },
    };
  },
  wiring: {
    title: 'Rakit Rangkaian Lampu',
    intro: 'Seret baterai, saklar, MCB, dan lampu ke papan, lalu tarik kabel dari terminal ke terminal. Simulasi berjalan langsung: lampu menyala sesuai arus yang benar-benar mengalir.',
    tasks: [
      {
        id: 'seri', title: 'Dua lampu seri',
        goal: 'Pasang baterai 12 V, satu saklar, dan dua lampu 12 V 6 W secara <strong>seri</strong> (satu jalur). Saklar harus bisa mematikan kedua lampu. Amati: setiap lampu hanya mendapat 6 V dan menyala redup (25%).',
        parts: [{ id: 'B1', type: 'baterai', x: 40, y: 220 }, { id: 'S1', type: 'saklar', x: 260, y: 90 }, { id: 'L1', type: 'lampu', x: 470, y: 60 }, { id: 'L2', type: 'lampu', x: 650, y: 60 }],
        steps: [
          { a: 'B1.p', b: 'S1.a', text: 'Kutub + baterai ke salah satu kaki saklar.' },
          { a: 'S1.b', b: 'L1.a', text: 'Kaki saklar lainnya ke kaki kiri lampu L1.' },
          { a: 'L1.b', b: 'L2.a', text: 'Kaki kanan L1 ke kaki kiri L2 (inilah sambungan seri).' },
          { a: 'L2.b', b: 'B1.n', text: 'Kaki kanan L2 kembali ke kutub − baterai.' },
        ],
        check(run) {
          const r = run({}, { S1: { on: true } }), off = run({}, { S1: { on: false } });
          if (!lit(r, ['L1', 'L2'])) return { ok: false, msg: 'Saat saklar ON, kedua lampu harus menyala. Periksa apakah jalurnya tertutup dari + ke −.' };
          const a = r.parts.L1, b = r.parts.L2;
          if (Math.abs(a.i - b.i) > 0.01 * a.i || a.v > 7 || b.v > 7) return { ok: false, msg: `Arus L1 = ${a.i.toFixed(3)} A dan L2 = ${b.i.toFixed(3)} A, tegangan ${a.v.toFixed(1)} V/${b.v.toFixed(1)} V. Pada seri arusnya sama dan tegangan terbagi (6 V tiap lampu).` };
          if (!dark(off, ['L1', 'L2'])) return { ok: false, msg: 'Saat saklar OFF, semua lampu harus mati. Saklar harus berada di jalur utama.' };
          return { ok: true, msg: `I = ${a.i.toFixed(3)} A di kedua lampu, masing-masing ${a.v.toFixed(1)} V dan ${a.p.toFixed(2)} W (redup). Total R = 24 + 24 = 48 Ω.` };
        },
      },
      {
        id: 'paralel', title: 'Tiga lampu paralel',
        goal: 'Pasang tiga lampu <strong>paralel</strong> pada baterai 12 V dengan satu saklar utama. Setiap lampu harus mendapat 12 V penuh, dan jika satu lampu putus, lampu lain tetap menyala.',
        parts: [{ id: 'B1', type: 'baterai', x: 40, y: 230 }, { id: 'S1', type: 'saklar', x: 220, y: 110 }, { id: 'L1', type: 'lampu', x: 420, y: 60 }, { id: 'L2', type: 'lampu', x: 580, y: 60 }, { id: 'L3', type: 'lampu', x: 740, y: 60 }],
        steps: [
          { a: 'B1.p', b: 'S1.a', text: 'Kutub + baterai ke saklar utama.' },
          { a: 'S1.b', b: 'L1.a', text: 'Keluaran saklar ke kaki kiri L1.' },
          { a: 'S1.b', b: 'L2.a', text: 'Keluaran saklar juga ke kaki kiri L2 (cabang kedua).' },
          { a: 'S1.b', b: 'L3.a', text: 'Keluaran saklar juga ke kaki kiri L3 (cabang ketiga).' },
          { a: 'L1.b', b: 'B1.n', text: 'Kaki kanan L1 ke kutub − baterai.' },
          { a: 'L2.b', b: 'B1.n', text: 'Kaki kanan L2 ke kutub −.' },
          { a: 'L3.b', b: 'B1.n', text: 'Kaki kanan L3 ke kutub −.' },
        ],
        check(run) {
          const ids = ['L1', 'L2', 'L3'];
          const r = run({}, { S1: { on: true } });
          if (!lit(r, ids)) return { ok: false, msg: 'Saat saklar ON, ketiga lampu harus menyala.' };
          const low = ids.find((id) => r.parts[id].v < 11.5);
          if (low) return { ok: false, msg: `${low} hanya mendapat ${r.parts[low].v.toFixed(1)} V. Pada paralel setiap lampu mendapat tegangan penuh 12 V.` };
          const broken = run({}, { S1: { on: true }, L1: { blown: true } });
          if (!lit(broken, ['L2', 'L3'])) return { ok: false, msg: 'Jika L1 putus, L2 dan L3 ikut mati. Berarti masih ada bagian yang seri.' };
          if (!dark(run({}, { S1: { on: false } }), ids)) return { ok: false, msg: 'Saklar utama harus mematikan semua lampu.' };
          return { ok: true, msg: `Setiap lampu ${r.parts.L1.v.toFixed(1)} V dan ${r.parts.L1.p.toFixed(1)} W (terang). Arus total ${r.parts.B1.i.toFixed(2)} A = 3 × 0,5 A.` };
        },
      },
      {
        id: 'rumah', title: 'Instalasi rumah 220 V',
        goal: 'Rakit instalasi kamar: sumber PLN 220 V → <strong>MCB</strong> → dua saklar → dua lampu 220 V 100 W. Setiap saklar hanya mengendalikan lampunya sendiri. Pasang saklar di kabel <strong>fasa (L)</strong>, bukan netral (N).',
        parts: [{ id: 'PLN', type: 'pln', x: 30, y: 220 }, { id: 'MCB', type: 'mcb', x: 230, y: 80 }, { id: 'S1', type: 'saklar', x: 380, y: 60 }, { id: 'S2', type: 'saklar', x: 380, y: 260 }, { id: 'L1', type: 'lampu220', x: 600, y: 40 }, { id: 'L2', type: 'lampu220', x: 600, y: 240 }],
        steps: [
          { a: 'PLN.L', b: 'MCB.in', text: 'Fasa (L) dari PLN masuk ke MCB.' },
          { a: 'MCB.out', b: 'S1.a', text: 'Keluaran MCB ke saklar S1.' },
          { a: 'MCB.out', b: 'S2.a', text: 'Keluaran MCB juga ke saklar S2 (paralel).' },
          { a: 'S1.b', b: 'L1.a', text: 'Saklar S1 ke kaki L lampu L1.' },
          { a: 'S2.b', b: 'L2.a', text: 'Saklar S2 ke kaki L lampu L2.' },
          { a: 'L1.b', b: 'PLN.N', text: 'Kaki N lampu L1 ke netral PLN.' },
          { a: 'L2.b', b: 'PLN.N', text: 'Kaki N lampu L2 ke netral PLN.' },
        ],
        check(run, board) {
          const base = { MCB: { on: true, tripped: false }, S1: { on: true }, S2: { on: true } };
          const r = run({}, base);
          if (!lit(r, ['L1', 'L2'])) return { ok: false, msg: 'Saat MCB dan kedua saklar ON, kedua lampu harus menyala.' };
          if (r.parts.L1.v < 200 || r.parts.L2.v < 200) return { ok: false, msg: 'Setiap lampu harus mendapat ±220 V. Lampu rumah dipasang paralel, bukan seri.' };
          const a = run({}, { ...base, S1: { on: false } }), b = run({}, { ...base, S2: { on: false } });
          if (!(dark(a, ['L1']) && lit(a, ['L2']) && dark(b, ['L2']) && lit(b, ['L1']))) return { ok: false, msg: 'S1 harus hanya mematikan L1, dan S2 hanya mematikan L2.' };
          if (!dark(run({}, { ...base, MCB: { on: false } }), ['L1', 'L2'])) return { ok: false, msg: 'MCB harus memutus semua beban.' };
          // saklar di fasa: saat saklar OFF, kaki lampu tidak boleh tersambung ke L lewat jalur lain
          const nN = board.wires.some((w) => w.includes('PLN.N') && w.some((k) => k.startsWith('S1.') || k.startsWith('S2.') || k.startsWith('MCB.')));
          if (nN) return { ok: false, msg: 'Saklar atau MCB tersambung ke netral. Pasang di kabel fasa (L) agar lampu tidak bertegangan saat dimatikan.' };
          return { ok: true, msg: `Arus total ${r.parts.PLN.i.toFixed(2)} A (2 × 0,45 A), aman di bawah MCB 6 A.` };
        },
      },
    ],
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Tiga lampu 12 V 6 W dirangkai seri pada baterai 12 V. Berapa arus yang mengalir?',
      preset: { mode: 0, n: 3, V: 12, Pr: 6 }, answer: 12 / 72, tolerance: 0.02, unit: 'A',
      explain: 'R lampu = 12²/6 = 24 Ω. R seri = 3 × 24 = 72 Ω. I = V/R = 12/72 ≈ 0,167 A.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Tiga lampu yang sama (12 V 6 W) kini dirangkai paralel pada baterai 12 V. Berapa arus total dari baterai?',
      preset: { mode: 1, n: 3, V: 12, Pr: 6 }, answer: 1.5, tolerance: 0.02, unit: 'A',
      explain: 'R paralel = 24/3 = 8 Ω. I = 12/8 = 1,5 A, atau 3 cabang × 0,5 A.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Siswa memasang dua lampu 12 V 6 W secara seri pada baterai 12 V. Berapa watt daya yang benar-benar dipakai setiap lampu?',
      preset: { mode: 0, n: 2, V: 12, Pr: 6 }, answer: 1.5, tolerance: 0.02, unit: 'W',
      explain: 'Tegangan terbagi: tiap lampu 6 V. P = V²/R = 6²/24 = 1,5 W, hanya 25% dari rating. Itulah sebabnya lampu seri tampak redup.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa lampu dan stopkontak di rumah dipasang paralel, bukan seri?',
      options: ['Agar arus total lebih kecil', 'Agar setiap beban mendapat 220 V penuh dan bisa dinyalakan/dimatikan sendiri tanpa memengaruhi yang lain', 'Agar kabel lebih pendek', 'Karena PLN memakai arus searah'], answer: 1,
      explain: 'Pada paralel tegangan setiap cabang sama dengan sumber. Jika satu lampu putus atau dimatikan, cabang lain tetap bekerja. Pada seri, satu lampu putus memutus seluruh rangkaian.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Berapa hambatan lampu berlabel 220 V 100 W?',
      answer: 484, tolerance: 0.01, unit: 'Ω',
      explain: 'R = V²/P = 220² / 100 = 48.400 / 100 = 484 Ω.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Di dapur, rice cooker 400 W, setrika 350 W, dan dispenser 350 W menyala bersamaan pada 220 V (paralel). Berapa arus total yang melewati MCB?',
      answer: 5, tolerance: 0.01, unit: 'A',
      explain: 'P total = 400 + 350 + 350 = 1.100 W. I = P/V = 1.100/220 = 5 A, masih di bawah MCB 6 A. Menambah microwave 800 W membuat I ≈ 8,6 A sehingga MCB trip.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Lima lampu LED 10 W menyala 12 jam per hari selama 30 hari. Dengan tarif Rp 1.444,70/kWh, berapa rupiah biaya listriknya?',
      answer: 5 * 10 * 12 * 30 / 1000 * 1444.7, tolerance: 0.01, unit: 'Rp',
      explain: 'E = 5 × 10 W × 12 jam × 30 = 18.000 Wh = 18 kWh. Biaya = 18 × 1.444,70 ≈ Rp 26.005.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Mengapa saklar lampu harus dipasang pada kabel fasa (L), bukan kabel netral (N)?',
      options: ['Agar lampu lebih terang', 'Agar saat saklar OFF, fitting dan lampu tidak lagi bertegangan sehingga aman saat diganti', 'Agar tagihan listrik lebih murah', 'Karena netral tidak dialiri arus'], answer: 1,
      explain: 'Jika saklar di netral, lampu memang padam, tetapi fitting tetap terhubung ke fasa 220 V. Orang yang mengganti lampu bisa tersetrum. Coba tugas "Instalasi rumah 220 V" di Lab Rangkaian.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Di Lab Rangkaian, sebuah lampu 220 V 100 W disambung langsung ke generator 11 kV. Apa yang terjadi dan mengapa?',
      options: ['Lampu menyala normal', 'Lampu putus karena dayanya P = V²/R = 11.000²/484 ≈ 250 kW, jauh di atas 100 W', 'Lampu redup karena tegangan terlalu tinggi', 'Tidak ada arus karena AC'], answer: 1,
      explain: 'Hambatan lampu tetap 484 Ω, jadi daya naik sebanding V². Tegangan 50 kali lebih tinggi membuat daya 2.500 kali lebih besar. Karena itu diperlukan trafo distribusi untuk menurunkan tegangan ke 220 V.',
    },
  ],
};
