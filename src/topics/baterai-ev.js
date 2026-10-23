import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

const pack = (p) => ({ V: p.s * p.vc, Ah: p.np * p.ah, kWh: (p.s * p.vc * p.np * p.ah) / 1000 });

export default {
  id: 'baterai-ev',
  subject: 'kimia',
  title: 'Paket Baterai Litium',
  tags: ['sehari-hari', 'industri', 'energi'],
  summary: 'Sel litium dirangkai seri dan paralel menjadi baterai motor dan mobil listrik. Ubah susunannya dan lihat tegangan serta energinya.',
  story: `
    <p><strong>Studi kasus: Industri baterai dari nikel Indonesia.</strong> Indonesia memiliki cadangan nikel terbesar di dunia, bahan utama katoda NMC (nikel-mangan-kobalt). Pabrik sel baterai di Karawang kini memproduksi sel untuk mobil listrik.</p>
    <p>Satu sel hanya bertegangan sekitar 3,6 V (NMC) atau 3,2 V (LFP). Untuk mencapai ratusan volt, sel dirangkai <em>seri</em>. Untuk menambah kapasitas (Ah), sel dirangkai <em>paralel</em>. Penulisan seperti <strong>96s46p</strong> berarti 96 kelompok seri, masing-masing berisi 46 sel paralel.</p>
    <p>Reaksi di dalamnya: saat dipakai, ion Li⁺ berpindah dari anoda grafit ke katoda melalui elektrolit, sementara elektron mengalir lewat motor.</p>`,
  concept: 'V<sub>pack</sub> = s · V<sub>sel</sub> &nbsp;·&nbsp; Ah<sub>pack</sub> = p · Ah<sub>sel</sub> &nbsp;·&nbsp; E = V · Ah',
  conceptNote: 'Energi dalam Wh = tegangan (V) × kapasitas (Ah). 1 kWh = 1000 Wh.',
  params: [
    { key: 'vc', label: 'Tegangan nominal sel', min: 3.2, max: 3.7, step: 0.05, value: 3.6, unit: 'V' },
    { key: 'ah', label: 'Kapasitas sel', min: 2, max: 10, step: 0.1, value: 5, unit: 'Ah' },
    { key: 's', label: 'Jumlah seri (s)', min: 1, max: 120, step: 1, value: 96, unit: 'sel' },
    { key: 'np', label: 'Jumlah paralel (p)', min: 1, max: 60, step: 1, value: 46, unit: 'sel' },
    { key: 'wh', label: 'Konsumsi kendaraan', min: 30, max: 250, step: 5, value: 150, unit: 'Wh/km' },
  ],
  compute(p) {
    const k = pack(p);
    return [
      { label: 'Energi paket', value: k.kWh, unit: 'kWh', digits: 2, main: true },
      { label: 'Tegangan paket', value: k.V, unit: 'V', digits: 1 },
      { label: 'Kapasitas paket', value: k.Ah, unit: 'Ah', digits: 1 },
      { label: 'Jumlah sel', value: p.s * p.np, unit: 'sel', digits: 0 },
      { label: 'Perkiraan jangkauan', value: (k.kWh * 1000) / p.wh, unit: 'km', digits: 0 },
    ];
  },
  view: { camera: [6, 7, 9], target: [0, 0.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xd0d6d9, size: 18 });
    const tray = mesh(new THREE.BoxGeometry(9, 0.2, 6), mat(0x50575e, { metalness: 0.6 }), { y: 0.1 });
    scene.add(tray);
    const MAXS = 24, MAXP = 12;
    const cellGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.8, 16);
    const colors = [0x2f6fd6, 0x2aa198];
    const cells = new THREE.InstancedMesh(cellGeo, mat(0xffffff, { metalness: 0.3, roughness: 0.4 }), MAXS * MAXP);
    cells.castShadow = true;
    scene.add(cells);
    const capGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 10);
    const caps = new THREE.InstancedMesh(capGeo, mat(0xcfd3d6, { metalness: 0.9 }), MAXS * MAXP);
    scene.add(caps);
    const ions = particles(90, 0xffd23a, 0.05);
    scene.add(ions);
    const d = new THREE.Object3D(), col = new THREE.Color();
    const tag = label(''); tag.position.set(0, 2.8, 0);
    const note = label('', { size: 0.3 }); note.position.set(0, 2.2, 0);
    scene.add(tag, note);
    let key = '';
    return {
      update(p, t) {
        const S = Math.min(p.s, MAXS), P = Math.min(p.np, MAXP);
        const k = `${S}x${P}`;
        if (k !== key) {
          key = k;
          let i = 0;
          for (let a = 0; a < S; a++) for (let b = 0; b < P; b++) {
            d.position.set((a - (S - 1) / 2) * 0.36, 0.6, (b - (P - 1) / 2) * 0.36);
            d.updateMatrix();
            cells.setMatrixAt(i, d.matrix);
            cells.setColorAt(i, col.setHex(colors[a % 2]));
            d.position.y = 1.03; d.updateMatrix(); caps.setMatrixAt(i, d.matrix);
            i++;
          }
          cells.count = caps.count = i;
          cells.instanceMatrix.needsUpdate = caps.instanceMatrix.needsUpdate = true;
          if (cells.instanceColor) cells.instanceColor.needsUpdate = true;
          const w = S * 0.36 + 0.4, dd = P * 0.36 + 0.4;
          tray.scale.set(w / 9, 1, dd / 6);
        }
        // elektron mengalir melewati kelompok seri satu per satu (zig-zag)
        for (let i = 0; i < 90; i++) {
          const f = (t * 0.15 + i / 90) % 1;
          const pos = f * S;
          const a = Math.floor(pos);
          const x = (a - (S - 1) / 2) * 0.36 + (pos - a - 0.5) * 0.1;
          const z = ((a % 2 ? 1 : -1) * (pos - a - 0.5)) * (P - 1) * 0.36;
          ions.setAt(i, x, 1.12, z, 1);
        }
        ions.instanceMatrix.needsUpdate = true;
        const k2 = pack(p);
        tag.setText(`${p.s}s${p.np}p · ${k2.V.toFixed(0)} V · ${k2.kWh.toFixed(1)} kWh`);
        note.setText(p.s > MAXS || p.np > MAXP ? `ditampilkan ${S}×${P} dari ${p.s}×${p.np} sel` : 'warna berbeda = kelompok seri');
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Cerita',
      prompt: 'Rina hendak naik pesawat membawa power bank berlabel 10.000 mAh, 3,7 V. Maskapai mengizinkan power bank di kabin maksimal 100 Wh. Berapa Wh energi power bank Rina?',
      preset: { vc: 3.7, ah: 2.5, s: 1, np: 4 },
      answer: 37, tolerance: 0.02, unit: 'Wh',
      explain: '10.000 mAh = 10 Ah. E = 3,7 V × 10 Ah = 37 Wh, masih jauh di bawah batas 100 Wh. Simulasi menunjukkan 4 sel 2,5 Ah yang dirangkai paralel (1s4p).',
    },
    {
      type: 'num', kind: 'Studi kasus',
      prompt: 'Bengkel konversi motor listrik di Bandung merakit paket 20s10p dari sel 18650 (3,6 V; 3 Ah). Berapa kWh energi paket tersebut?',
      preset: { vc: 3.6, ah: 3, s: 20, np: 10, wh: 35 },
      answer: 2.16, tolerance: 0.02, unit: 'kWh',
      explain: 'V = 20 × 3,6 = 72 V. Ah = 10 × 3 = 30 Ah. E = 72 × 30 = 2160 Wh = 2,16 kWh. Dengan konsumsi 35 Wh/km, jangkauannya ±62 km.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Seorang insinyur ingin menaikkan tegangan paket dari 360 V menjadi 720 V tanpa mengubah kapasitas Ah. Apa yang harus dilakukan?',
      preset: { s: 100, np: 20 },
      options: [
        'Menggandakan jumlah sel paralel',
        'Menggandakan jumlah sel seri',
        'Mengganti sel dengan kapasitas Ah dua kali lipat',
        'Menurunkan suhu baterai',
      ],
      answer: 1,
      explain: 'Rangkaian seri menjumlahkan tegangan; paralel menjumlahkan kapasitas. Tegangan tinggi (800 V class) memperkecil arus sehingga pengisian cepat lebih efisien dan kabel lebih ringan.',
    },
  ],
};
