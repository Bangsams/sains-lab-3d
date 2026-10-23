import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

const G0 = 9.80665;
const masses = (p) => ({ m0: p.dry + p.prop + p.pay, mf: p.dry + p.pay });
const dv = (p) => { const { m0, mf } = masses(p); return p.isp * G0 * Math.log(m0 / mf); };

export default {
  id: 'persamaan-roket',
  subject: 'aerospace',
  title: 'Persamaan Roket Tsiolkovsky',
  tags: ['industri', 'energi'],
  summary: 'Perubahan kecepatan roket ditentukan oleh impuls spesifik mesin dan rasio massa. Mengapa roket sebagian besar berisi bahan bakar?',
  story: `
    <p><strong>Cerita: Tim roket mahasiswa.</strong> Tim mahasiswa teknik dirgantara dari Bandung merancang roket peluncur satelit kecil. Dosen pembimbing memberi satu aturan: hitung Δv terlebih dahulu sebelum menggambar apa pun.</p>
    <p>Untuk mencapai orbit rendah Bumi, roket butuh Δv sekitar <strong>9,4 km/s</strong> (7,8 km/s kecepatan orbit ditambah rugi gravitasi dan hambatan udara). Persamaan Tsiolkovsky menunjukkan Δv hanya naik secara logaritmik terhadap rasio massa. Akibatnya lebih dari 85% massa roket harus berupa propelan.</p>
    <p>Itulah sebabnya roket dibuat bertingkat: tangki kosong dibuang supaya mesin tidak perlu mendorong massa mati.</p>`,
  concept: 'Δv = I<sub>sp</sub> · g₀ · ln(m₀ / m<sub>f</sub>)',
  conceptNote: 'I<sub>sp</sub> adalah impuls spesifik (detik), g₀ = 9,80665 m/s². m₀ = massa awal (penuh), m<sub>f</sub> = massa akhir (propelan habis).',
  equations: [
    {
      "f": "Δv = I<sub>sp</sub> · g₀ · ln(m₀ / m<sub>f</sub>)",
      "meaning": "Tambahan kecepatan yang bisa dicapai roket bergantung pada seberapa irit mesinnya (Isp) dan seberapa besar bagian roket yang berupa bahan bakar. Karena memakai logaritma, menambah bahan bakar makin lama makin kurang berpengaruh.",
      "symbols": [
        [
          "Δv",
          "Perubahan kecepatan yang bisa dicapai roket",
          "m/s"
        ],
        [
          "I<sub>sp</sub>",
          "Impuls spesifik: ukuran keiritan mesin, makin besar makin baik",
          "s (detik)"
        ],
        [
          "g₀",
          "Percepatan gravitasi standar = 9,81",
          "m/s²"
        ],
        [
          "m₀",
          "Massa roket saat penuh bahan bakar",
          "ton"
        ],
        [
          "m<sub>f</sub>",
          "Massa roket saat bahan bakar habis",
          "ton"
        ],
        [
          "ln",
          "Logaritma natural",
          "fungsi"
        ]
      ]
    },
    {
      "f": "m₀ = m<sub>kering</sub> + m<sub>propelan</sub> + m<sub>muatan</sub> &nbsp;·&nbsp; m<sub>f</sub> = m<sub>kering</sub> + m<sub>muatan</sub>",
      "meaning": "Massa awal adalah seluruh roket. Massa akhir adalah roket setelah bahan bakarnya terbakar habis: hanya badan roket dan muatannya yang tersisa.",
      "symbols": [
        [
          "m<sub>kering</sub>",
          "Massa badan roket, tangki, dan mesin",
          "ton"
        ],
        [
          "m<sub>propelan</sub>",
          "Massa bahan bakar dan oksidator",
          "ton"
        ],
        [
          "m<sub>muatan</sub>",
          "Massa satelit atau barang yang dibawa",
          "ton"
        ]
      ]
    }
  ],
  params: [
    { key: 'isp', label: 'Impuls spesifik Isp', min: 200, max: 460, step: 1, value: 311, unit: 's' },
    { key: 'dry', label: 'Massa kering roket', min: 2, max: 60, step: 0.5, value: 25, unit: 'ton' },
    { key: 'prop', label: 'Massa propelan', min: 5, max: 500, step: 1, value: 400, unit: 'ton' },
    { key: 'pay', label: 'Massa muatan (satelit)', min: 0, max: 30, step: 0.1, value: 15, unit: 'ton' },
  ],
  compute(p) {
    const { m0, mf } = masses(p);
    const v = dv(p);
    return [
      { label: 'Δv', value: v, unit: 'm/s', digits: 0, main: true },
      { label: 'Rasio massa m₀/mf', value: m0 / mf, unit: '', digits: 2 },
      { label: 'Fraksi propelan', value: (p.prop / m0) * 100, unit: '%', digits: 1 },
      { label: 'Massa awal m₀', value: m0, unit: 'ton', digits: 1 },
      { label: 'Orbit rendah (≥ 9.400 m/s)?', value: v >= 9400 ? 'Tercapai' : `Kurang ${Math.round(9400 - v)} m/s`, unit: '', text: true },
    ];
  },
  view: { camera: [11, 8, 17], target: [0, 6, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc9c6bb });
    scene.add(mesh(new THREE.BoxGeometry(4, 0.4, 4), mat(0x7c8287), { y: 0.2 }));
    const tower = mesh(new THREE.BoxGeometry(0.4, 9, 0.4), mat(0xb04a2c, { metalness: 0.4 }), { x: -1.6, y: 4.7 });
    scene.add(tower);
    const rocket = new THREE.Group();
    const white = mat(0xf2f3f4, { metalness: 0.2 });
    const tankShell = mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    const propMesh = mesh(new THREE.CylinderGeometry(0.46, 0.46, 1, 32), mat(0x6fb3e0, { transparent: true, opacity: 0.85 }));
    propMesh.geometry.translate(0, 0.5, 0);
    const dryBand = mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.5, 32), mat(0x2c3238, { metalness: 0.5 }));
    const fairing = mesh(new THREE.ConeGeometry(0.5, 1.4, 32), white);
    const payload = mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat(0xd9a43a, { metalness: 0.6 }));
    const nozzle = mesh(new THREE.CylinderGeometry(0.18, 0.4, 0.6, 24, 1, true), mat(0x3a3d40, { metalness: 0.9, side: THREE.DoubleSide }));
    rocket.add(tankShell, propMesh, dryBand, fairing, payload, nozzle);
    scene.add(rocket);
    const exhaust = particles(150, 0xff9b2e, 0.1, 0.85);
    scene.add(exhaust);
    const tag = label('', { size: 0.65 }); scene.add(tag);
    const lp = label('propelan', { size: 0.4 }); scene.add(lp);
    return {
      update(p, t) {
        const H = 2 + (p.prop / 500) * 7; // tinggi tangki ∝ massa propelan
        const period = 6, ph = t % period, burn = Math.min(1, ph / 4.5);
        const lift = ph < 4.5 ? 0.5 * 0.6 * ph * ph : 6;
        nozzle.position.y = 0.7;
        dryBand.position.y = 1.25;
        dryBand.scale.y = 0.5 + p.dry / 30;
        const base = 1.25 + 0.25 * dryBand.scale.y;
        tankShell.scale.y = H; tankShell.position.y = base + H / 2;
        propMesh.position.y = base;
        propMesh.scale.y = H * Math.max(0.001, 1 - burn);
        payload.scale.setScalar(0.3 + p.pay / 25);
        payload.position.y = base + H + 0.3;
        fairing.position.y = base + H + 0.9 + p.pay / 60;
        rocket.position.y = lift;
        const fire = ph < 4.5;
        for (let i = 0; i < 150; i++) {
          const f = (t * 2 + i / 150) % 1;
          const len = 1 + (p.isp - 200) / 80;
          exhaust.setAt(i, Math.cos(i * 2.4) * f * 0.35, lift + 0.4 - f * len, Math.sin(i * 2.4) * f * 0.35, fire ? 1 - f * 0.6 : 0);
        }
        exhaust.instanceMatrix.needsUpdate = true;
        tag.position.set(1.8, lift + base + H + 1.2, 0);
        tag.setText(`Δv ${Math.round(dv(p)).toLocaleString('id-ID')} m/s`);
        lp.position.set(1.4, lift + base + H * 0.5, 0);
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Sebuah tahap roket memiliki Isp 300 s dan rasio massa m₀/mf = 4. Berapa Δv yang dapat dicapai tahap tersebut?',
      preset: { isp: 300, dry: 20, pay: 5, prop: 75 },
      answer: 4078.6, tolerance: 0.02, unit: 'm/s',
      explain: 'Δv = 300 × 9,80665 × ln 4 = 2942 × 1,386 ≈ 4079 m/s. Simulasi memakai m₀ = 100 t dan mf = 25 t sehingga rasionya 4.',
    },
    {
      type: 'num', kind: 'Studi kasus',
      prompt: 'Sebuah startup ingin membuat roket satu tingkat (SSTO) yang langsung mencapai orbit dengan Δv 9.400 m/s menggunakan mesin Isp 350 s. Berapa rasio massa m₀/mf yang dibutuhkan?',
      preset: { isp: 350, dry: 25, pay: 2, prop: 390 },
      answer: 15.47, tolerance: 0.03, unit: '',
      explain: 'm₀/mf = e^(9400 / (350 × 9,80665)) = e^2,739 ≈ 15,5. Artinya 93,5% massa harus propelan, padahal tangki, mesin, dan muatan harus muat dalam 6,5% sisanya. Inilah alasan SSTO sangat sulit.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa hampir semua roket orbital menggunakan lebih dari satu tingkat?',
      preset: { dry: 50 },
      options: [
        'Agar roket terlihat lebih tinggi',
        'Agar massa kering (tangki kosong dan mesin) yang sudah tidak berguna dibuang, sehingga rasio massa setiap tahap lebih baik dan Δv total bertambah',
        'Karena satu mesin tidak boleh menyala lebih dari 1 menit',
        'Karena tahap atas membutuhkan bahan bakar yang berbeda secara hukum',
      ],
      answer: 1,
      explain: 'Δv total = jumlah Δv setiap tahap. Dengan membuang tangki kosong, tahap berikutnya hanya mendorong massa yang masih berguna. Coba naikkan massa kering di simulasi dan lihat Δv turun drastis.',
    },
  ],
};
