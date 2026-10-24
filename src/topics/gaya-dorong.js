import { mat, mesh, ground, label, arrow, particles } from '../lib/helpers.js';

const G0 = 9.80665;
const twr = (p) => (p.F * 1000) / (p.m * 1000 * G0);
const acc = (p) => (p.F * 1000) / (p.m * 1000) - G0;

export default {
  id: 'gaya-dorong',
  subject: 'aerospace',
  title: 'Gaya Dorong dan Lepas Landas',
  tags: ['industri'],
  summary: 'Roket hanya bisa terangkat jika gaya dorong melebihi beratnya. Hukum Newton II dan rasio dorong-berat dalam satu peluncuran.',
  story: `
    <p><strong>Cerita: Detik-detik peluncuran.</strong> Saat hitung mundur mencapai nol, mesin roket kelas menengah menyala dengan total gaya dorong sekitar 7.600 kN. Massa roket saat itu sekitar 549 ton.</p>
    <p>Roket tidak langsung melesat. Gaya dorong harus lebih besar dari berat (<em>W = mg</em>). Perbandingan keduanya disebut <strong>rasio dorong-berat (TWR)</strong>. Jika TWR kurang dari 1, roket tetap diam di landasan meski mesin menyala penuh.</p>
    <p>Seiring propelan terbakar, massa berkurang, sehingga percepatan roket terus naik walaupun gaya dorongnya tetap.</p>`,
  concept: 'TWR = F / (m · g) &nbsp;·&nbsp; a = F/m − g',
  conceptNote: 'Diagram gaya: panah ke atas = gaya dorong, panah ke bawah = berat. Abaikan hambatan udara di dekat landasan.',
  equations: [
    {
      "f": "W = m · g",
      "meaning": "Berat adalah gaya tarik Bumi pada roket. Makin besar massanya, makin besar beratnya.",
      "symbols": [
        [
          "W",
          "Berat roket",
          "N (newton)"
        ],
        [
          "m",
          "Massa roket",
          "kg"
        ],
        [
          "g",
          "Percepatan gravitasi = 9,81",
          "m/s²"
        ]
      ]
    },
    {
      "f": "TWR = F / (m · g)",
      "meaning": "Perbandingan dorongan mesin dengan berat roket. Jika lebih dari 1, dorongan menang dan roket terangkat. Jika kurang dari 1, roket tetap diam.",
      "symbols": [
        [
          "TWR",
          "Rasio dorong-berat (thrust-to-weight ratio)",
          "tanpa satuan"
        ],
        [
          "F",
          "Gaya dorong mesin",
          "N"
        ]
      ]
    },
    {
      "f": "a = F/m − g",
      "meaning": "Hukum Newton II: dorongan dibagi massa memberi percepatan ke atas, lalu dikurangi tarikan gravitasi ke bawah.",
      "symbols": [
        [
          "a",
          "Percepatan bersih ke atas",
          "m/s²"
        ]
      ]
    }
  ],
  params: [
    { key: 'F', label: 'Gaya dorong total', min: 500, max: 9000, step: 50, value: 7600, unit: 'kN' },
    { key: 'm', label: 'Massa roket', min: 50, max: 900, step: 1, value: 549, unit: 'ton' },
  ],
  compute(p) {
    const a = acc(p);
    const up = Math.max(0, a);
    return [
      { label: 'Rasio dorong-berat', value: twr(p), unit: '', digits: 2, main: true },
      { label: 'Berat roket', value: p.m * G0, unit: 'kN', digits: 0 },
      { label: 'Percepatan bersih', value: up, unit: 'm/s²', digits: 2 },
      { label: 'Kecepatan setelah 10 s', value: up * 10, unit: 'm/s', digits: 1 },
      { label: 'Ketinggian setelah 10 s', value: 0.5 * up * 100, unit: 'm', digits: 0 },
      { label: 'Status', value: a > 0 ? 'Lepas landas' : 'Tetap di landasan', unit: '', text: true },
    ];
  },
  view: { camera: [11, 7, 16], target: [0, 5.5, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc9c6bb });
    scene.add(mesh(new THREE.BoxGeometry(5, 0.5, 5), mat(0x7c8287), { y: 0.25 }));
    const rocket = new THREE.Group();
    const white = mat(0xf2f3f4, { metalness: 0.2 });
    rocket.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 6, 32), white, { y: 3.6 }));
    rocket.add(mesh(new THREE.ConeGeometry(0.5, 1.2, 32), white, { y: 7.2 }));
    rocket.add(mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.4, 32), mat(0x2c3238), { y: 1.2 }));
    [0, 1, 2, 3].forEach((i) => {
      const fin = mesh(new THREE.BoxGeometry(0.05, 0.9, 0.6), mat(0x2c3238), { y: 1.1 });
      fin.position.x = Math.cos((i * Math.PI) / 2) * 0.6; fin.position.z = Math.sin((i * Math.PI) / 2) * 0.6;
      fin.rotation.y = (-i * Math.PI) / 2;
      rocket.add(fin);
    });
    rocket.add(mesh(new THREE.CylinderGeometry(0.2, 0.4, 0.5, 20), mat(0x3a3d40, { metalness: 0.9 }), { y: 0.75 }));
    scene.add(rocket);
    const thrust = arrow([0, 1, 0], [1.4, 4, 0], 2, 0x0f7b6c);
    const weight = arrow([0, -1, 0], [1.4, 4, 0], 2, 0xc0392b);
    scene.add(thrust, weight);
    const lt = label('', { size: 0.45, color: '#7fe3cf' }); const lw = label('', { size: 0.45, color: '#ff9f8a' });
    scene.add(lt, lw);
    const exhaust = particles(160, 0xff9b2e, 0.12, 0.85);
    const smoke = particles(80, 0xd5d8da, 0.35, 0.6);
    scene.add(exhaust, smoke);
    const tag = label('', { size: 0.65 }); scene.add(tag);
    return {
      update(p, t) {
        const a = acc(p);
        const ph = t % 7;
        const y = a > 0 ? 0.5 * a * 0.15 * ph * ph : 0;
        const shake = a > 0 ? 0 : Math.sin(t * 60) * 0.02;
        rocket.position.set(shake, 0.5 + y, 0);
        const k = 1 / 1500; // panjang panah per kN
        const W = p.m * G0;
        thrust.position.set(1.6, 4 + y, 0); weight.position.set(1.6, 4 + y, 0);
        thrust.setLen(p.F * k * 1.2); weight.setLen(W * k * 1.2);
        lt.position.set(2.8, 4.3 + y + p.F * k * 0.8, 0); lt.setText(`F = ${p.F.toLocaleString('id-ID')} kN`);
        lw.position.set(2.8, 3.7 + y - W * k * 0.8, 0); lw.setText(`W = ${Math.round(W).toLocaleString('id-ID')} kN`);
        const power = Math.min(1, p.F / 9000);
        for (let i = 0; i < 160; i++) {
          const f = (t * 2.5 + i / 160) % 1;
          exhaust.setAt(i, Math.cos(i * 2.4) * f * 0.5, 0.5 + y - f * (1 + 3 * power), Math.sin(i * 2.4) * f * 0.5, 1 - f * 0.6);
        }
        for (let i = 0; i < 80; i++) {
          const f = (t * 0.4 + i / 80) % 1;
          smoke.setAt(i, Math.cos(i * 2.4) * (0.8 + f * 3), 0.6 + f * 0.8, Math.sin(i * 2.4) * (0.8 + f * 3), power * (1 - f));
        }
        exhaust.instanceMatrix.needsUpdate = smoke.instanceMatrix.needsUpdate = true;
        tag.position.set(0, 9 + y, 0);
        tag.setText(`TWR ${twr(p).toFixed(2)}${a > 0 ? '' : ' · belum terangkat'}`);
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Cerita',
      prompt: 'Roket dengan gaya dorong 7.600 kN dan massa 549 ton siap meluncur. Berapa rasio dorong-beratnya (TWR)?',
      preset: { F: 7600, m: 549 },
      answer: 1.41, tolerance: 0.02, unit: '',
      explain: 'W = 549.000 × 9,80665 ≈ 5.384 kN. TWR = 7.600 / 5.384 ≈ 1,41. Roket terangkat karena TWR > 1.',
    },
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Dari soal sebelumnya, berapa percepatan bersih roket tepat setelah lepas landas (m/s²)?',
      preset: { F: 7600, m: 549 },
      answer: 4.04, tolerance: 0.03, unit: 'm/s²',
      explain: 'a = F/m − g = 7.600.000 / 549.000 − 9,81 = 13,84 − 9,81 ≈ 4,04 m/s². Penumpang merasakan beban ±1,4 g.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Turunkan gaya dorong hingga panah hijau lebih pendek dari panah merah. Mengapa roket tetap diam walaupun mesinnya menyala?',
      preset: { F: 4500, m: 549 },
      options: [
        'Karena mesin butuh pemanasan',
        'Karena gaya dorong lebih kecil dari berat roket (TWR < 1), sehingga resultan gaya tidak mengarah ke atas',
        'Karena hambatan udara terlalu besar di landasan',
        'Karena roket hanya bisa terbang di ruang hampa',
      ],
      answer: 1,
      explain: 'Hukum Newton II: ΣF = F − W = m·a. Jika F < W, landasan menahan sisa berat dan a = 0. Roket nyata dirancang dengan TWR awal ±1,2–1,5.',
    },
  ],
};
