import { mat, mesh, label, rand } from '../lib/helpers.js';

const MU = 398600.4418; // km³/s²
const RE = 6371;        // km
const C = 299792.458;   // km/s
const orbit = (h) => { const r = RE + h; return { r, v: Math.sqrt(MU / r), T: 2 * Math.PI * Math.sqrt(r ** 3 / MU) }; };

function earthTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#2a6fb0'; g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#4f9a4a';
  // benua stilistik (bukan peta akurat)
  [[90, 80, 60, 45], [130, 170, 35, 55], [260, 75, 50, 35], [280, 150, 40, 50], [380, 90, 80, 40], [420, 180, 30, 20], [395, 140, 22, 10]].forEach(([x, y, rx, ry]) => {
    g.beginPath(); g.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2); g.fill();
  });
  g.fillStyle = '#eef4f7'; g.fillRect(0, 0, 512, 14); g.fillRect(0, 242, 512, 14);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function starPositions() {
  const r = rand(42), out = [];
  for (let i = 0; i < 600; i++) {
    const u = r() * 2 - 1, a = r() * Math.PI * 2, d = 150 + r() * 100;
    out.push(Math.sqrt(1 - u * u) * Math.cos(a) * d, u * d, Math.sqrt(1 - u * u) * Math.sin(a) * d);
  }
  return out;
}

export default {
  id: 'orbit-satelit',
  subject: 'aerospace',
  title: 'Orbit Satelit dan Internet',
  tags: ['sehari-hari', 'industri'],
  summary: 'Ketinggian orbit menentukan kecepatan, periode, dan jeda sinyal internet satelit. Bandingkan LEO, MEO, dan GEO.',
  story: `
    <p><strong>Studi kasus: Internet untuk sekolah di Papua.</strong> Satelit SATRIA-1 milik Indonesia berada di orbit geostasioner (GEO) pada ketinggian ±35.786 km. Dari Bumi ia tampak diam, sehingga antena di sekolah cukup diarahkan sekali saja.</p>
    <p>Konstelasi orbit rendah (LEO) seperti Starlink berada di ketinggian ±550 km. Sinyalnya jauh lebih cepat sampai, tetapi satu satelit melintas dalam hitungan menit, sehingga dibutuhkan ribuan satelit agar layanan tidak putus.</p>
    <p>Kecepatan orbit berasal dari keseimbangan antara gaya gravitasi dan gaya sentripetal: semakin tinggi orbit, semakin lambat satelit bergerak.</p>`,
  concept: 'v = √(GM / r) &nbsp;·&nbsp; T = 2π √(r³ / GM) &nbsp;·&nbsp; r = R<sub>Bumi</sub> + h',
  conceptNote: 'GM Bumi = 398.600 km³/s², R<sub>Bumi</sub> = 6.371 km. Jeda sinyal pulang-pergi minimum = 2h / c.',
  equations: [
    {
      "f": "v = √(GM / r)",
      "meaning": "Kecepatan yang dibutuhkan agar satelit terus jatuh mengelilingi Bumi tanpa menabraknya. Makin jauh dari Bumi, gravitasi makin lemah, sehingga kecepatan yang dibutuhkan makin kecil.",
      "symbols": [
        [
          "v",
          "Kecepatan orbit",
          "km/s"
        ],
        [
          "GM",
          "Konstanta gravitasi × massa Bumi = 398.600",
          "km³/s²"
        ],
        [
          "r",
          "Jarak satelit dari pusat Bumi",
          "km"
        ]
      ]
    },
    {
      "f": "T = 2π · √(r³ / GM)",
      "meaning": "Waktu satu putaran penuh. Orbit yang lebih tinggi lintasannya lebih panjang dan geraknya lebih lambat, sehingga satu putaran memakan waktu jauh lebih lama.",
      "symbols": [
        [
          "T",
          "Periode: waktu satu kali mengelilingi Bumi",
          "s, menit, atau jam"
        ]
      ]
    },
    {
      "f": "r = R<sub>Bumi</sub> + h",
      "meaning": "Jarak dihitung dari pusat Bumi, bukan dari permukaan, jadi jari-jari Bumi harus ditambahkan.",
      "symbols": [
        [
          "R<sub>Bumi</sub>",
          "Jari-jari Bumi = 6.371",
          "km"
        ],
        [
          "h",
          "Ketinggian satelit di atas permukaan Bumi",
          "km"
        ]
      ]
    },
    {
      "f": "jeda = 2h / c",
      "meaning": "Waktu yang dibutuhkan sinyal untuk naik ke satelit lalu turun lagi. Satelit yang lebih rendah membuat internet terasa lebih responsif.",
      "symbols": [
        [
          "c",
          "Kecepatan cahaya = 299.792",
          "km/s"
        ]
      ]
    }
  ],
  params: [
    { key: 'h', label: 'Ketinggian orbit', min: 200, max: 40000, step: 10, value: 550, unit: 'km' },
  ],
  compute(p) {
    const o = orbit(p.h);
    return [
      { label: 'Periode orbit', value: o.T / 60, unit: 'menit', digits: 1, main: true },
      { label: 'Kecepatan orbit', value: o.v, unit: 'km/s', digits: 2 },
      { label: 'Periode (jam)', value: o.T / 3600, unit: 'jam', digits: 2 },
      { label: 'Orbit per hari', value: 86400 / o.T, unit: 'kali', digits: 2 },
      { label: 'Jeda sinyal pulang-pergi', value: ((2 * p.h) / C) * 1000, unit: 'ms', digits: 1 },
      { label: 'Jenis orbit', value: p.h < 2000 ? 'LEO' : p.h < 35000 ? 'MEO' : 'GEO / tinggi', unit: '', text: true },
    ];
  },
  view: { camera: [0, 6, 16], target: [0, 0, 0] },
  scene({ THREE, scene, camera, stage }) {
    const earth = mesh(new THREE.SphereGeometry(2, 64, 32), new THREE.MeshStandardMaterial({ map: earthTexture(THREE), roughness: 0.8 }));
    earth.rotation.z = 0.41;
    scene.add(earth);
    const atmo = mesh(new THREE.SphereGeometry(2.08, 48, 24), new THREE.MeshBasicMaterial({ color: 0x8fc8ff, transparent: true, opacity: 0.15 }), { shadow: false });
    scene.add(atmo);
    const ring = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 180 }, (_, i) => new THREE.Vector3(Math.cos((i / 180) * Math.PI * 2), 0, Math.sin((i / 180) * Math.PI * 2)))),
      new THREE.LineBasicMaterial({ color: 0x0f7b6c }),
    );
    scene.add(ring);
    const sat = new THREE.Group();
    sat.add(mesh(new THREE.BoxGeometry(0.22, 0.22, 0.3), mat(0xd9a43a, { metalness: 0.7 })));
    const wing = mesh(new THREE.BoxGeometry(0.9, 0.02, 0.25), mat(0x1b2f5a, { metalness: 0.5 }));
    sat.add(wing);
    scene.add(sat);
    const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineDashedMaterial({ color: 0xd0642a, dashSize: 0.2, gapSize: 0.12 }));
    scene.add(beam);
    const tag = label('');
    scene.add(tag);
    const stars = new THREE.Points(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(starPositions(), 3)),
      new THREE.PointsMaterial({ color: 0x9aa7b4, size: 0.6 }),
    );
    scene.add(stars);
    let angle = 0, lastH = -1;
    return {
      update(p, t, dt) {
        const o = orbit(p.h);
        const R = 2 * (o.r / RE); // skala nyata: 2 unit = jari-jari Bumi
        ring.scale.setScalar(R);
        // waktu dipercepat: 1 detik layar = 30 menit nyata
        angle += ((2 * Math.PI) / o.T) * 1800 * dt;
        earth.rotation.y += ((2 * Math.PI) / 86164) * 1800 * dt;
        sat.position.set(Math.cos(angle) * R, 0, -Math.sin(angle) * R);
        sat.rotation.y = angle;
        sat.scale.setScalar(1 + R * 0.06);
        const ground = sat.position.clone().setLength(2.02);
        beam.geometry.setFromPoints([ground, sat.position]);
        beam.computeLineDistances();
        tag.position.copy(sat.position).add(new THREE.Vector3(0, 0.7 + R * 0.04, 0));
        tag.setText(`${p.h.toLocaleString('id-ID')} km · ${(o.T / 60).toFixed(0)} menit`);
        const ts = 0.5 + R * 0.03;
        tag.scale.set((tag.scale.x / tag.scale.y) * ts, ts, 1);
        if (p.h !== lastH) {
          lastH = p.h;
          // jaga agar orbit selalu terlihat
          const want = Math.max(10, R * 2.6);
          const dir = camera.position.clone().sub(stage.controls.target).normalize();
          if (camera.position.length() < want * 0.75 || camera.position.length() > want * 1.6) camera.position.copy(dir.multiplyScalar(want));
        }
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Satelit SATRIA-1 berada di orbit geostasioner pada ketinggian 35.786 km. Hitung periode orbitnya dalam jam.',
      preset: { h: 35786 },
      answer: 23.93, tolerance: 0.01, unit: 'jam',
      explain: 'r = 6.371 + 35.786 = 42.157 km. T = 2π √(42.157³ / 398.600) ≈ 86.140 s ≈ 23,93 jam, sama dengan satu hari sideris. Karena itu satelit tampak diam dari Bumi.',
    },
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Stasiun Antariksa Internasional (ISS) mengorbit pada ketinggian ±400 km. Berapa kecepatan orbitnya dalam km/s?',
      preset: { h: 400 },
      answer: 7.67, tolerance: 0.015, unit: 'km/s',
      explain: 'v = √(398.600 / 6.771) ≈ 7,67 km/s, atau sekitar 27.600 km/jam. ISS mengelilingi Bumi ±15,5 kali sehari.',
    },
    {
      type: 'mcq', kind: 'Studi kasus',
      prompt: 'Sekolah di Papua ingin memakai internet satelit untuk kelas video interaktif. Bandingkan jeda sinyal LEO (550 km) dan GEO (35.786 km) di simulasi. Pernyataan mana yang paling tepat?',
      preset: { h: 550 },
      options: [
        'GEO lebih cepat karena satelitnya lebih besar',
        'LEO memiliki jeda sinyal jauh lebih kecil (±4 ms vs ±240 ms), tetapi memerlukan ribuan satelit karena tiap satelit cepat berpindah',
        'Keduanya sama karena sinyal bergerak secepat cahaya',
        'LEO lebih lambat karena lebih dekat dengan atmosfer',
      ],
      answer: 1,
      explain: 'Jeda = 2h/c. LEO: 2 × 550 / 299.792 ≈ 3,7 ms. GEO: ≈ 239 ms (belum termasuk rute ke stasiun bumi). Satelit LEO mengorbit ±95 menit, sehingga tiap satelit hanya terlihat beberapa menit.',
    },
  ],
};
