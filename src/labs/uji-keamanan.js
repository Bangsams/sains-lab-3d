// Penguji otomatis bersama untuk lab Keamanan Siber.
// Dipasang ke iframe lewat toString(), jadi fungsi ini harus berdiri sendiri.
export function pasangPenguji(G) {
  const hasil = { lulus: 0, gagal: 0 };
  G.uji = (nama, fn) => {
    let r;
    try { r = fn(); } catch (e) { r = e.message; }
    if (r === true) { hasil.lulus++; console.log('✓ LULUS  ' + nama); } else { hasil.gagal++; console.error('✗ GAGAL  ' + nama + (typeof r === 'string' ? ' → ' + r : '')); }
  };
  G.ringkasan = () => {
    const total = hasil.lulus + hasil.gagal;
    const pesan = '── Hasil uji keamanan: ' + hasil.lulus + '/' + total + ' lulus ──';
    if (hasil.gagal) console.warn(pesan + '  Perbaiki kode lalu jalankan lagi.');
    else console.log(pesan + '  🎉 Semua celah sudah tertutup!');
  };
}
