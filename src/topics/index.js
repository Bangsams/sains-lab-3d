// Daftar topik. Untuk menambah topik baru: buat file di folder ini lalu tambahkan ke array di bawah.
import panelSurya from './panel-surya.js';
import turbinAngin from './turbin-angin.js';
import remRegeneratif from './rem-regeneratif.js';
import hidrogenHijau from './hidrogen-hijau.js';
import emisiBahanBakar from './emisi-bahan-bakar.js';
import bateraiEv from './baterai-ev.js';
import fotosintesis from './fotosintesis.js';
import mikroalga from './mikroalga.js';
import bioetanol from './bioetanol.js';
import persamaanRoket from './persamaan-roket.js';
import orbitSatelit from './orbit-satelit.js';
import gayaDorong from './gaya-dorong.js';
import mesinPenilai from './mesin-penilai.js';
import deployVercel from './deploy-vercel.js';
import integrasiApi from './integrasi-api.js';
import unduhBertahap from './unduh-bertahap.js';

export const SUBJECTS = {
  fisika: { name: 'Fisika', short: 'FIS' },
  kimia: { name: 'Kimia', short: 'KIM' },
  biologi: { name: 'Biologi', short: 'BIO' },
  aerospace: { name: 'Teknik Roket & Antariksa', short: 'AER' },
  coding: { name: 'Coding & Cloud', short: 'DEV' },
};

export const TAGS = {
  'sehari-hari': 'Kehidupan sehari-hari',
  industri: 'Industri',
  energi: 'Energi',
  keberlanjutan: 'Keberlanjutan',
  web: 'Aplikasi web',
};

export const TOPICS = [
  panelSurya, turbinAngin, remRegeneratif,
  hidrogenHijau, emisiBahanBakar, bateraiEv,
  fotosintesis, mikroalga, bioetanol,
  persamaanRoket, orbitSatelit, gayaDorong,
  mesinPenilai, deployVercel, integrasiApi, unduhBertahap,
];
