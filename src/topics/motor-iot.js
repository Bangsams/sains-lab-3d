import { mat, mesh, ground, label } from '../lib/helpers.js';

const N_RATED = 1000, V_RATED = 12; // rpm pada 12 V
const vAvg = (p) => (p.D / 100) * p.V;
const rpm = (p) => (N_RATED * vAvg(p)) / V_RATED;
const omega = (p) => (2 * Math.PI * rpm(p)) / 60;
const pOut = (p) => p.tau * omega(p);
const pIn = (p) => vAvg(p) * p.I;
const eff = (p) => (pIn(p) > 0 ? pOut(p) / pIn(p) : 0);

export default {
  id: 'motor-iot',
  subject: 'listrik',
  title: 'Motor Listrik & Kendali IoT',
  tags: ['industri', 'sehari-hari'],
  summary: 'Atur kecepatan motor DC dengan PWM, hitung daya dan efisiensinya, lalu rakit kendali motor jarak jauh memakai ESP32, relay, dan catu daya.',
  story: `
    <p><strong>Studi kasus: Konveyor pintar UMKM keripik di Malang.</strong> Pemilik ingin menyalakan konveyor pengering dari ponsel. Motor DC 12 V 2,5 A memutar konveyor, sedangkan mikrokontroler <strong>ESP32</strong> menerima perintah lewat Wi-Fi (protokol MQTT).</p>
    <p>Masalahnya: pin GPIO ESP32 hanya mengeluarkan 3,3 V dan paling aman sekitar 40 mA, padahal motor butuh 2,5 A pada 12 V. Karena itu dipakai <strong>modul relay</strong> (saklar yang digerakkan elektromagnet) atau transistor MOSFET sebagai "perantara": sinyal kecil dari GPIO mengendalikan arus besar dari catu daya 12 V.</p>
    <p>Kecepatan motor diatur dengan <strong>PWM</strong> (pulse width modulation): tegangan dinyalakan-dimatikan sangat cepat, dan persentase waktu menyala (duty cycle) menentukan tegangan rata-rata yang diterima motor.</p>`,
  concept: 'V<sub>rata</sub> = D · V &nbsp;·&nbsp; ω = 2π · n / 60 &nbsp;·&nbsp; P<sub>out</sub> = τ · ω &nbsp;·&nbsp; η = P<sub>out</sub> / (V · I)',
  conceptNote: 'Model sederhana: kecepatan motor DC sebanding dengan tegangan rata-rata (1000 rpm pada 12 V). Arus I adalah hasil ukur ampere meter. Relay mekanik tidak cocok untuk PWM berfrekuensi tinggi; gunakan MOSFET.',
  equations: [
    { f: 'V<sub>rata</sub> = D · V', meaning: 'PWM: tegangan rata-rata = persentase waktu menyala dikali tegangan catu.', symbols: [['D', 'Duty cycle (bagian waktu ON)', '%'], ['V', 'Tegangan catu daya', 'V']] },
    { f: 'n = n<sub>rating</sub> · V<sub>rata</sub> / V<sub>rating</sub>', meaning: 'Kecepatan motor DC kira-kira sebanding dengan tegangan yang diterimanya.', symbols: [['n', 'Kecepatan putar', 'rpm'], ['n<sub>rating</sub>', '1000 rpm pada 12 V', 'rpm']] },
    { f: 'ω = 2π · n / 60', meaning: 'Mengubah putaran per menit menjadi kecepatan sudut (radian per detik).', symbols: [['ω', 'Kecepatan sudut', 'rad/s']] },
    { f: 'P<sub>out</sub> = τ · ω &nbsp;·&nbsp; P<sub>in</sub> = V · I &nbsp;·&nbsp; η = P<sub>out</sub> / P<sub>in</sub>', meaning: 'Daya mekanik = torsi × kecepatan sudut. Daya listrik = tegangan × arus. Efisiensi = bagian daya listrik yang menjadi gerak.', symbols: [['τ', 'Torsi beban', 'N·m'], ['I', 'Arus motor', 'A'], ['η', 'Efisiensi', '%']] },
    { f: 'I = V / R', meaning: 'Hukum Ohm, dipakai untuk memeriksa arus yang akan ditarik dari pin GPIO atau kumparan relay.', symbols: [['R', 'Hambatan beban', 'Ω']] },
    { f: 't = C / I', meaning: 'Lama baterai bertahan = kapasitas dibagi arus pemakaian.', symbols: [['C', 'Kapasitas baterai', 'Ah'], ['t', 'Waktu pakai', 'jam']] },
  ],
  params: [
    { key: 'V', label: 'Tegangan catu', min: 6, max: 24, step: 0.5, value: 12, unit: 'V' },
    { key: 'D', label: 'Duty cycle PWM', min: 0, max: 100, step: 1, value: 100, unit: '%' },
    { key: 'I', label: 'Arus motor (terukur)', min: 0.5, max: 5, step: 0.1, value: 2.5, unit: 'A' },
    { key: 'tau', label: 'Torsi beban', min: 0.02, max: 0.4, step: 0.01, value: 0.2, unit: 'N·m' },
  ],
  compute(p) {
    return [
      { label: 'Kecepatan putar', value: rpm(p), unit: 'rpm', digits: 0, main: true },
      { label: 'Tegangan rata-rata', value: vAvg(p), unit: 'V', digits: 2 },
      { label: 'Kecepatan sudut ω', value: omega(p), unit: 'rad/s', digits: 1 },
      { label: 'Daya mekanik', value: pOut(p), unit: 'W', digits: 1 },
      { label: 'Daya listrik', value: pIn(p), unit: 'W', digits: 1 },
      { label: 'Efisiensi', value: eff(p) * 100, unit: '%', digits: 1 },
    ];
  },
  view: { camera: [7, 6, 9], target: [0, 1.2, 0] },
  scene({ THREE, scene }) {
    ground(scene, { color: 0xc4c9cf });
    // konveyor
    const frame = mat(0x5f6b78, { metalness: 0.5 });
    scene.add(mesh(new THREE.BoxGeometry(8, 0.2, 1.6), mat(0x22262b), { y: 1.2 }));
    [-3.8, 3.8].forEach((x) => [-0.7, 0.7].forEach((z) => scene.add(mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), frame, { x, y: 0.6, z }))));
    const rollers = [-3.9, 3.9].map((x) => { const r = mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.7, 20), mat(0x9aa4ae, { metalness: 0.7 }), { x, y: 1.2 }); r.rotation.x = Math.PI / 2; scene.add(r); return r; });
    const chips = Array.from({ length: 10 }, (_, i) => { const c = mesh(new THREE.BoxGeometry(0.5, 0.12, 0.4), mat(0xe2b45c), { y: 1.38 }); c.userData.u = i / 10; scene.add(c); return c; });
    // motor + kipas penunjuk
    const motor = new THREE.Group();
    const body = mesh(new THREE.CylinderGeometry(0.45, 0.45, 1, 24), mat(0x2f6fae, { metalness: 0.4 }));
    body.rotation.z = Math.PI / 2; motor.add(body);
    const shaft = new THREE.Group();
    shaft.position.x = 0.7;
    const blade = mat(0xf2f2f2);
    for (let i = 0; i < 3; i++) { const b = mesh(new THREE.BoxGeometry(0.04, 0.9, 0.18), blade, { y: 0 }); b.rotation.x = (i * 2 * Math.PI) / 3; b.geometry.translate(0, 0.45, 0); shaft.add(b); }
    motor.add(shaft);
    motor.position.set(-4.6, 1.2, 1.4);
    scene.add(motor);
    // papan ESP32 dan relay
    scene.add(mesh(new THREE.BoxGeometry(1.2, 0.08, 0.6), mat(0x1c2733), { x: -1, y: 0.04, z: 2.6 }));
    const led = mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3aa0ff, emissive: 0x3aa0ff, emissiveIntensity: 1 }), { x: -0.5, y: 0.12, z: 2.8 });
    scene.add(led);
    scene.add(mesh(new THREE.BoxGeometry(0.7, 0.4, 0.5), mat(0x2b62c9), { x: 0.6, y: 0.2, z: 2.6 }));
    const tag = label('', { size: 0.45 });
    tag.position.set(0, 3.2, 0);
    scene.add(tag);
    return {
      update(p, t, dt) {
        const w = omega(p);
        shaft.rotation.x += w * dt * 0.15;
        rollers.forEach((r) => { r.rotation.y += w * dt * 0.05; });
        const v = rpm(p) / 1000;
        chips.forEach((c) => { c.userData.u = (c.userData.u + v * dt * 0.08) % 1; c.position.x = -3.6 + c.userData.u * 7.2; });
        led.material.emissiveIntensity = p.D > 0 ? 0.6 + 0.4 * Math.sin(t * 6) : 0.1;
        tag.setText(`PWM ${p.D}% → ${vAvg(p).toFixed(1).replace('.', ',')} V · ${Math.round(rpm(p))} rpm · η ${(eff(p) * 100).toFixed(0)}%`);
      },
    };
  },
  wiring: {
    title: 'Rakit Kendali Motor IoT',
    intro: 'Mulai dari motor dengan saklar biasa, lalu buat versi IoT: ESP32 menerima perintah dari aplikasi dan menggerakkan relay yang menyambungkan motor ke 12 V. Centang/lepas "Perintah dari aplikasi" untuk mengujinya.',
    tasks: [
      {
        id: 'motor-saklar', title: 'Motor + saklar',
        goal: 'Sambungkan adaptor 12 V, saklar, dan motor DC dalam satu jalur. Saklar ON → motor berputar penuh; OFF → motor berhenti.',
        parts: [{ id: 'PS', type: 'psu12', x: 40, y: 200 }, { id: 'S1', type: 'saklar', x: 320, y: 100 }, { id: 'M', type: 'motor', x: 600, y: 200 }],
        steps: [
          { a: 'PS.p', b: 'S1.a', text: '+12V adaptor ke saklar.' },
          { a: 'S1.b', b: 'M.p', text: 'Saklar ke terminal + motor.' },
          { a: 'M.n', b: 'PS.n', text: 'Terminal − motor ke GND adaptor.' },
        ],
        check(run) {
          const on = run({}, { S1: { on: true } }), off = run({}, { S1: { on: false } });
          if (!(on.parts.M.level > 0.9)) return { ok: false, msg: 'Saat saklar ON motor harus berputar penuh (±12 V).' };
          if (off.parts.M.level > 0.05) return { ok: false, msg: 'Saat saklar OFF motor harus berhenti.' };
          return { ok: true, msg: `Motor ${on.parts.M.v.toFixed(1)} V, ${on.parts.M.i.toFixed(2)} A, ${on.parts.M.p.toFixed(0)} W.` };
        },
      },
      {
        id: 'iot-relay', title: 'Kendali IoT dengan relay',
        input: 'Perintah dari aplikasi (MQTT): motor ON',
        goal: 'Adaptor 12 V memberi daya motor lewat kontak relay (COM–NO). Modul step-down membuat 5 V untuk ESP32 dan relay. GPIO D26 ESP32 mengirim sinyal ke IN relay. Uji: perintah ON → motor berputar; OFF → berhenti; arus GPIO harus ≤ 40 mA.',
        parts: [{ id: 'PS', type: 'psu12', x: 20, y: 60 }, { id: 'BK', type: 'buck', x: 220, y: 230 }, { id: 'E', type: 'esp32', x: 420, y: 330 }, { id: 'R', type: 'relay', x: 620, y: 200 }, { id: 'M', type: 'motor', x: 820, y: 60 }],
        steps: [
          { a: 'PS.p', b: 'BK.ip', text: '+12V adaptor ke IN+ modul step-down.' },
          { a: 'PS.n', b: 'BK.in', text: 'GND adaptor ke IN− step-down.' },
          { a: 'BK.op', b: 'E.vin', text: 'Keluaran 5V ke VIN ESP32.' },
          { a: 'BK.on', b: 'E.gnd', text: 'GND step-down ke GND ESP32.' },
          { a: 'BK.op', b: 'R.vcc', text: '5V juga ke VCC modul relay.' },
          { a: 'BK.on', b: 'R.gnd', text: 'GND step-down ke GND relay.' },
          { a: 'E.d26', b: 'R.in', text: 'Pin GPIO D26 ESP32 ke IN relay (sinyal kendali).' },
          { a: 'PS.p', b: 'R.com', text: '+12V adaptor ke COM relay.' },
          { a: 'R.no', b: 'M.p', text: 'NO relay ke terminal + motor.' },
          { a: 'M.n', b: 'PS.n', text: 'Terminal − motor ke GND adaptor.' },
        ],
        check(run) {
          const on = run({ cmd: true }), off = run({ cmd: false });
          if (!on.parts.E?.state.on) return { ok: false, msg: 'ESP32 belum mendapat daya 5 V. Sambungkan step-down ke adaptor lalu ke VIN/GND ESP32.' };
          if (on.parts.E.gpioI > 0.04) return { ok: false, msg: `Arus GPIO ${(on.parts.E.gpioI * 1000).toFixed(0)} mA melebihi 40 mA. Jangan sambungkan motor langsung ke GPIO; pakai relay.` };
          if (!(on.parts.M.level > 0.9)) return { ok: false, msg: 'Perintah ON belum memutar motor. Periksa daya relay (VCC/GND), sinyal IN dari D26, dan jalur 12 V lewat COM–NO.' };
          if (off.parts.M.level > 0.05) return { ok: false, msg: 'Perintah OFF tidak menghentikan motor. Motor harus lewat kontak NO relay, bukan langsung ke 12 V.' };
          return { ok: true, msg: `ON: motor ${on.parts.M.v.toFixed(1)} V/${on.parts.M.i.toFixed(2)} A, sementara GPIO hanya ${(on.parts.E.gpioI * 1000).toFixed(2)} mA. Sinyal kecil mengendalikan arus ±${Math.round(on.parts.M.i / on.parts.E.gpioI).toLocaleString('id-ID')} kali lebih besar.` };
        },
      },
    ],
  },
  questions: [
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Motor diberi PWM dengan duty cycle 60% dari catu 12 V. Berapa tegangan rata-rata yang diterima motor?',
      preset: { V: 12, D: 60 }, answer: 7.2, tolerance: 0.01, unit: 'V',
      explain: 'V rata = D · V = 0,60 × 12 = 7,2 V.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Motor berputar 1000 rpm pada 12 V. Dengan tegangan rata-rata 7,2 V, berapa kecepatannya?',
      preset: { V: 12, D: 60 }, answer: 600, tolerance: 0.01, unit: 'rpm',
      explain: 'n = 1000 × 7,2/12 = 600 rpm.',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Motor berputar 1000 rpm melawan torsi beban 0,2 N·m. Berapa watt daya mekaniknya?',
      preset: { V: 12, D: 100, tau: 0.2 }, answer: 0.2 * (2 * Math.PI * 1000) / 60, tolerance: 0.01, unit: 'W',
      explain: 'ω = 2π × 1000/60 = 104,7 rad/s. P = τ·ω = 0,2 × 104,7 ≈ 20,9 W.',
    },
    {
      stem: 'E', type: 'num', kind: 'Studi kasus',
      prompt: 'Motor konveyor (12 V, 2,5 A) menghasilkan daya mekanik 20,9 W pada 1000 rpm. Berapa persen efisiensinya?',
      preset: { V: 12, D: 100, I: 2.5, tau: 0.2 }, answer: (0.2 * (2 * Math.PI * 1000) / 60) / 30 * 100, tolerance: 0.01, unit: '%',
      explain: 'P in = V·I = 12 × 2,5 = 30 W. η = 20,94/30 ≈ 69,8%. Sisanya menjadi panas di kumparan dan gesekan.',
    },
    {
      stem: 'E', type: 'num', kind: 'Engineering',
      prompt: 'Saat listrik padam, konveyor memakai aki 12 V 7 Ah. Jika motor menarik 2,5 A, berapa jam aki dapat bertahan?',
      answer: 7 / 2.5, tolerance: 0.01, unit: 'jam',
      explain: 't = C/I = 7 Ah / 2,5 A = 2,8 jam (dalam praktik lebih singkat karena aki tidak boleh dikosongkan penuh).',
    },
    {
      stem: 'M', type: 'num', kind: 'Hitung',
      prompt: 'Seorang siswa menyambung motor berhambatan 4,8 Ω langsung ke pin GPIO 3,3 V. Berapa mA arus yang akan dipaksa keluar dari pin (batas aman 40 mA)?',
      answer: (3.3 / 4.8) * 1000, tolerance: 0.01, unit: 'mA',
      explain: 'I = V/R = 3,3/4,8 = 0,6875 A ≈ 688 mA, 17 kali batas aman. Pin bisa rusak. Di Lab Rangkaian, hambatan dalam GPIO membatasi arus, tetapi peringatan tetap muncul.',
    },
    {
      stem: 'T', type: 'mcq', kind: 'Teknologi',
      prompt: 'Protokol apa yang umum dipakai perangkat IoT seperti ESP32 untuk menerima perintah "motor ON" dari aplikasi ponsel secara ringan dan real time?',
      options: ['FTP', 'MQTT (publish–subscribe lewat broker)', 'SMTP', 'Bluetooth Classic tanpa internet'], answer: 1,
      explain: 'Pada MQTT, aplikasi mem-publish pesan ke topik (mis. "konveyor/motor"), broker meneruskannya ke ESP32 yang subscribe topik tersebut. Header kecil dan koneksi tetap membuatnya hemat daya dan cepat.',
    },
    {
      stem: 'S', type: 'mcq', kind: 'Konsep',
      prompt: 'Mengapa kumparan relay dan motor biasanya dipasangi dioda flyback (dioda paralel terbalik)?',
      options: ['Untuk menaikkan kecepatan motor', 'Saat arus diputus, induktor menghasilkan tegangan balik (GGL induksi) yang sangat tinggi; dioda menyalurkannya agar transistor/GPIO tidak rusak', 'Agar motor bisa berputar terbalik', 'Untuk mengubah AC menjadi DC'], answer: 1,
      explain: 'Induktor melawan perubahan arus (hukum Lenz). Memutus arus secara tiba-tiba menimbulkan lonjakan tegangan puluhan hingga ratusan volt. Dioda memberi jalan bagi arus itu untuk meluruh.',
    },
    {
      stem: 'E', type: 'mcq', kind: 'Engineering',
      prompt: 'Pemilik UMKM ingin kecepatan konveyor bisa diatur 0–100% dari aplikasi, bukan hanya ON/OFF. Komponen apa yang paling tepat menggantikan relay?',
      options: ['Relay yang lebih besar', 'MOSFET (driver motor) yang dikendalikan sinyal PWM dari ESP32', 'Sekering', 'Trafo step-up'], answer: 1,
      explain: 'Relay mekanik hanya tahan beberapa kali per detik dan kontaknya aus. MOSFET bisa dinyalakan-dimatikan ribuan kali per detik sehingga cocok untuk PWM.',
    },
  ],
};
