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
import rantaiPasok from './rantai-pasok.js';
import kendaliMutu from './kendali-mutu.js';
import ppic from './ppic.js';
import fabrikasiWafer from './fabrikasi-wafer.js';
import transistorMosfet from './transistor-mosfet.js';
import fotolitografi from './fotolitografi.js';
import kataSandi from './kata-sandi.js';
import injeksiSql from './injeksi-sql.js';
import jaringanFirewall from './jaringan-firewall.js';
import oeeStudiKerja from './oee-studi-kerja.js';
import peramalanPermintaan from './peramalan-permintaan.js';
import antrianLayanan from './antrian-layanan.js';
import keseimbanganPasar from './keseimbangan-pasar.js';
import pdbInflasi from './pdb-inflasi.js';
import pilihAset from './pilih-aset.js';
import analisisFundamental from './analisis-fundamental.js';
import rangkaianLampu from './rangkaian-lampu.js';
import transmisiTeganganTinggi from './transmisi-tegangan-tinggi.js';
import motorIot from './motor-iot.js';
import garisWaktuPeradaban from './garis-waktu-peradaban.js';
import piramidaGiza from './piramida-giza.js';
import jalurRempah from './jalur-rempah.js';
import revolusiIndustriDigital from './revolusi-industri-digital.js';
import { LABELS, EXTRA } from './stem-extra.js';

export const SUBJECTS = {
  fisika: { name: 'Fisika', short: 'FIS' },
  kimia: { name: 'Kimia', short: 'KIM' },
  biologi: { name: 'Biologi', short: 'BIO' },
  aerospace: { name: 'Teknik Roket & Antariksa', short: 'AER' },
  coding: { name: 'Coding & Cloud', short: 'DEV' },
  industri: { name: 'Teknik Industri', short: 'TI' },
  semikonduktor: { name: 'Semikonduktor & Chip', short: 'SEM' },
  siber: { name: 'Keamanan Siber', short: 'SIB' },
  ekonomi: { name: 'Ekonomi Mikro & Makro', short: 'EKO' },
  keuangan: { name: 'Pasar Keuangan & Investasi', short: 'FIN' },
  listrik: { name: 'Teknik Listrik', short: 'LIS' },
  sejarah: { name: 'Sejarah Dunia Singkat', short: 'SEJ' },
};

// Pengelompokan bidang untuk menu dropdown di beranda dan kepala situs.
export const GROUPS = [
  { name: 'Sains dasar', subjects: ['fisika', 'kimia', 'biologi'] },
  { name: 'Teknologi & rekayasa', subjects: ['aerospace', 'coding'] },
  { name: 'Teknik industri', subjects: ['industri'] },
  { name: 'Teknik listrik', subjects: ['listrik'] },
  { name: 'Ekonomi & keuangan', subjects: ['ekonomi', 'keuangan'] },
  { name: 'Semikonduktor', subjects: ['semikonduktor'] },
  { name: 'Keamanan siber', subjects: ['siber'] },
  { name: 'Sejarah dunia', subjects: ['sejarah'] },
];

// Setiap soal berlabel satu huruf STEM.
export const STEM = {
  S: { name: 'Sains' },
  T: { name: 'Teknologi' },
  E: { name: 'Engineering' },
  M: { name: 'Matematika' },
};

export const TAGS = {
  'sehari-hari': 'Kehidupan sehari-hari',
  industri: 'Industri',
  energi: 'Energi',
  keberlanjutan: 'Keberlanjutan',
  web: 'Aplikasi web',
  ekonomi: 'Ekonomi & keuangan',
  sejarah: 'Sejarah & peradaban',
};

const ALL = [
  panelSurya, turbinAngin, remRegeneratif,
  hidrogenHijau, emisiBahanBakar, bateraiEv,
  fotosintesis, mikroalga, bioetanol,
  persamaanRoket, orbitSatelit, gayaDorong,
  mesinPenilai, deployVercel, integrasiApi, unduhBertahap,
  rantaiPasok, kendaliMutu, ppic, oeeStudiKerja, peramalanPermintaan, antrianLayanan,
  rangkaianLampu, transmisiTeganganTinggi, motorIot,
  keseimbanganPasar, pdbInflasi, pilihAset, analisisFundamental,
  fabrikasiWafer, transistorMosfet, fotolitografi,
  kataSandi, injeksiSql, jaringanFirewall,
  garisWaktuPeradaban, piramidaGiza, jalurRempah, revolusiIndustriDigital,
];

// Soal lama diberi label STEM, lalu soal STEM tambahan ditaruh di belakang (indeks lama tetap).
for (const t of ALL) {
  const labels = LABELS[t.id] || [];
  t.questions = [
    ...t.questions.map((q, i) => ({ ...q, stem: q.stem || labels[i] })),
    ...(EXTRA[t.id] || []),
  ];
}

export const TOPICS = ALL;
