import { mat, mesh, ground, label, particles } from '../lib/helpers.js';

const Y_ETOH = (2 * 46.07) / 180.16; // 0,511 g etanol per g glukosa
const Y_CO2 = (2 * 44.01) / 180.16;  // 0,489 g CO₂ per g glukosa
const activity = (T) => Math.max(0, Math.exp(-(((T - 32) / 7) ** 2)));
const progress = (p) => 1 - Math.exp(-0.09 * p.h * activity(p.T));

export default {
  id: 'bioetanol',
  subject: 'biologi',
  title: 'Fermentasi Bioetanol Tebu',
  tags: ['industri', 'energi', 'keberlanjutan'],
  summary: 'Ragi mengubah gula menjadi etanol dan CO₂. Atur suhu dan waktu untuk melihat aktivitas enzim dan hasil bahan bakar.',
  story: `
    <p><strong>Studi kasus: Molase pabrik gula di Jawa Timur.</strong> Pabrik gula menghasilkan molase (tetes tebu), sirup sisa yang masih mengandung sekitar 50% gula. Molase difermentasi oleh ragi <em>Saccharomyces cerevisiae</em> menjadi bioetanol, yang dicampur ke bensin seperti pada program E5.</p>
    <p>Ragi bekerja secara anaerob: enzim zimase memecah glukosa menjadi etanol dan CO₂. Enzim adalah protein, sehingga aktivitasnya paling tinggi pada suhu optimum (±30–35 °C) dan turun tajam jika terlalu panas.</p>`,
  concept: 'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂',
  conceptNote: 'Hasil teoretis: 0,511 g etanol per g glukosa. Massa jenis etanol 0,789 kg/L.',
  params: [
    { key: 'kg', label: 'Glukosa', min: 1, max: 1000, step: 1, value: 500, unit: 'kg' },
    { key: 'eff', label: 'Efisiensi fermentasi', min: 50, max: 100, step: 1, value: 90, unit: '%' },
    { key: 'T', label: 'Suhu tangki', min: 15, max: 50, step: 0.5, value: 32, unit: '°C' },
    { key: 'h', label: 'Waktu fermentasi', min: 0, max: 72, step: 1, value: 48, unit: 'jam' },
  ],
  compute(p) {
    const done = progress(p);
    const used = p.kg * done;
    const etoh = used * Y_ETOH * (p.eff / 100);
    return [
      { label: 'Etanol', value: etoh / 0.789, unit: 'L', digits: 1, main: true },
      { label: 'Massa etanol', value: etoh, unit: 'kg', digits: 1 },
      { label: 'CO₂ dilepas', value: used * Y_CO2 * (p.eff / 100), unit: 'kg', digits: 1 },
      { label: 'Gula terfermentasi', value: done * 100, unit: '%', digits: 0 },
      { label: 'Aktivitas enzim ragi', value: activity(p.T) * 100, unit: '%', digits: 0 },
    ];
  },
  view: { camera: [5, 5, 10], target: [0, 2, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xd4d1c6 });
    const steel = mat(0xc4cacf, { metalness: 0.8, roughness: 0.3 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide });
    scene.add(mesh(new THREE.CylinderGeometry(1.8, 1.8, 4, 40, 1, true), glass, { y: 2.3 }));
    scene.add(mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.2, 40), steel, { y: 0.3 }));
    scene.add(mesh(new THREE.SphereGeometry(1.85, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), steel, { y: 4.3 }));
    const liquid = mat(0xb5772a, { transparent: true, opacity: 0.7 });
    const liq = mesh(new THREE.CylinderGeometry(1.7, 1.7, 3, 40), liquid, { y: 1.9, shadow: false });
    scene.add(liq);
    // kolom distilasi sederhana
    scene.add(mesh(new THREE.CylinderGeometry(0.4, 0.4, 5, 20), steel, { x: 3.6, y: 2.7 }));
    const pipe = mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.9, 10), steel, { x: 2.65, y: 5.1 });
    pipe.rotation.z = Math.PI / 2;
    scene.add(pipe);
    const yeast = particles(140, 0xf0e2b5, 0.07);
    const bubbles = particles(140, 0xffffff, 0.06, 0.8);
    scene.add(yeast, bubbles);
    const tag = label(''); tag.position.set(0, 6, 0);
    scene.add(tag);
    const sugary = new THREE.Color(0xb5772a), clear = new THREE.Color(0xe9e2b8);
    return {
      update(p, t) {
        const a = activity(p.T), done = progress(p);
        liquid.color.copy(sugary).lerp(clear, done);
        for (let i = 0; i < 140; i++) {
          const ang = i * 2.399, r = 1.5 * Math.sqrt(((i * 0.618) % 1));
          const wob = Math.sin(t * 3 * (0.2 + a) + i) * 0.06;
          yeast.setAt(i, Math.cos(ang) * r + wob, 0.6 + ((i * 0.37) % 1) * 2.6, Math.sin(ang) * r, 1);
          const f = (t * (0.15 + 0.6 * a) + (i * 0.13) % 1) % 1;
          bubbles.setAt(i, Math.cos(ang + 1) * r * 0.9, 0.5 + f * 2.9, Math.sin(ang + 1) * r * 0.9, i < 140 * a * (1 - done * 0.7) ? 1 : 0);
        }
        yeast.instanceMatrix.needsUpdate = bubbles.instanceMatrix.needsUpdate = true;
        const L = (p.kg * done * Y_ETOH * (p.eff / 100)) / 0.789;
        tag.setText(`${p.T} °C · aktivitas ${Math.round(a * 100)}% · ${L.toFixed(0)} L etanol`);
      },
    };
  },
  questions: [
    {
      type: 'num', kind: 'Hitung',
      prompt: 'Berapa gram etanol maksimum (hasil teoretis, efisiensi 100%) yang dapat dihasilkan dari 360 g glukosa?',
      preset: { kg: 1, eff: 100, h: 72, T: 32 },
      answer: 184.3, tolerance: 0.02, unit: 'g',
      explain: '360 g glukosa = 360/180,16 = 2 mol. Dari reaksi, 1 mol glukosa → 2 mol etanol, jadi 4 mol × 46,07 g/mol = 184,3 g.',
    },
    {
      type: 'mcq', kind: 'Konsep',
      prompt: 'Naikkan suhu tangki ke 45 °C. Gelembung CO₂ hampir berhenti. Apa penjelasan biologisnya?',
      preset: { T: 45 },
      options: [
        'Gula menguap pada suhu tinggi',
        'Enzim ragi mulai terdenaturasi dan sel ragi stres sehingga metabolisme melambat drastis',
        'CO₂ larut seluruhnya dalam air panas',
        'Etanol berubah kembali menjadi glukosa',
      ],
      answer: 1,
      explain: 'Enzim bekerja optimal pada suhu tertentu. Di atas ±40 °C struktur protein enzim berubah (denaturasi). Karena fermentasi melepas panas, tangki industri harus didinginkan.',
    },
    {
      type: 'num', kind: 'Studi kasus',
      prompt: 'Pabrik memfermentasi 1 ton molase yang mengandung 50% gula (anggap semuanya glukosa) dengan efisiensi 90%. Berapa liter bioetanol yang dihasilkan? (ρ etanol = 0,789 kg/L)',
      preset: { kg: 500, eff: 90, T: 32, h: 72 },
      answer: 291.4, tolerance: 0.03, unit: 'L',
      explain: 'Glukosa = 500 kg. Etanol = 500 × 0,511 × 0,90 = 230 kg. Volume = 230 / 0,789 ≈ 291 L. Itu cukup untuk membuat ±5.800 L bensin E5.',
    },
  ],
};
