const fs = require('fs');
const marked = require('marked');

const template = fs.readFileSync('template-artikel.html', 'utf-8');
const files = fs.readdirSync('./artikel');

// 1. WADAH PENAMPUNG: Untuk mengumpulkan artikel sebelum diurutkan
let daftarArtikel = [];

files.forEach(file => {
  if(file.endsWith('.md')) {
    const text = fs.readFileSync('./artikel/' + file, 'utf-8');
    
    // REGEX TAHAN BANTING
    const parts = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    
    if(parts) {
      const info = parts[1];
      const isi = parts[2];
      
      let judul = (info.match(/title:\s*['"]?(.*?)['"]?(?:\r?\n|$)/i) || [])[1] || 'Tanpa Judul';
      let kategoriMatch = info.match(/(?:kategori|category):\s*['"]?(.*?)['"]?(?:\r?\n|$)/i);
      let kategori = kategoriMatch ? kategoriMatch[1].trim() : 'Kajian';
      
      let ringkasanMatch = info.match(/(?:description|ringkasan):\s*['"]?(.*?)['"]?(?:\r?\n|$)/i);
      let ringkasan = ringkasanMatch ? ringkasanMatch[1].trim() : judul;
      
      let gambarMatch = info.match(/(?:thumbnail|gambar|image):\s*['"]?(.*?)['"]?(?:\r?\n|$)/i);
      let gambar = gambarMatch ? gambarMatch[1].trim() : 'profil.png';
      
      // --- MESIN PENARIK TANGGAL BARU ---
      // Membaca 'date:', 'tanggal:', atau 'waktu:' dari Sveltia CMS
      let tanggalMatch = info.match(/(?:date|tanggal|waktu):\s*['"]?(.*?)['"]?(?:\r?\n|$)/i);
      let tanggalAsli = tanggalMatch ? tanggalMatch[1].trim() : new Date().toISOString();
      
      let dateObj = new Date(tanggalAsli);
      if (isNaN(dateObj.getTime())) { dateObj = new Date(); } // Pengaman kalau format error
      
      // Mengubah format mesin menjadi format manusia (contoh: Jumat, 9 Oktober 2026 13:24)
      let opsiTanggal = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' };
      let tanggalCantik = dateObj.toLocaleDateString('id-ID', opsiTanggal).replace(/\./g, ':');
      
      const htmlKonten = marked.parse(isi);
      const namaFileBaru = file.replace('.md', '.html');
      
      // 2. MASUKKAN KE WADAH (Jangan dicetak dulu)
      daftarArtikel.push({
        fileAsli: file,
        namaFileBaru: namaFileBaru,
        judul: judul,
        kategori: kategori,
        ringkasan: ringkasan,
        gambar: gambar,
        tanggalObj: dateObj,       // Digunakan mesin untuk mengurutkan
        tanggalCantik: tanggalCantik, // Digunakan untuk tayang di web
        htmlKonten: htmlKonten
      });
    } else {
      console.log('PERINGATAN: Gagal membaca format kepala artikel pada file ' + file);
    }
  }
});

// 3. PROSES PENGURUTAN (SORTING) DARI TERBARU KE TERLAMA
daftarArtikel.sort((a, b) => b.tanggalObj - a.tanggalObj);

// 4. PENCETAKAN HTML (Sekarang dicetak dengan urutan yang sudah benar)
let dataBeranda = []; // Wadah tambahan untuk Beranda

daftarArtikel.forEach(artikel => {
  let hasilAkhir = template
    .replace(/{{JUDUL}}/g, artikel.judul)
    .replace(/{{KATEGORI}}/g, artikel.kategori)
    .replace(/{{RINGKASAN}}/g, artikel.ringkasan)
    .replace(/{{GAMBAR}}/g, artikel.gambar)
    .replace(/{{KONTEN}}/g, artikel.htmlKonten)
    .replace(/{{NAMA_FILE_MD}}/g, artikel.fileAsli)
    .replace(/{{TANGGAL}}/g, artikel.tanggalCantik); // KODE INJEKSI TANGGAL
    
  fs.writeFileSync('./' + artikel.namaFileBaru, hasilAkhir);
  console.log('Berhasil membuat HTML untuk: ' + artikel.namaFileBaru);
  
  // Mengumpulkan data ringkas untuk diumpankan ke Beranda
  dataBeranda.push({
    judul: artikel.judul,
    kategori: artikel.kategori,
    ringkasan: artikel.ringkasan,
    gambar: artikel.gambar,
    tanggal: artikel.tanggalCantik,
    link: artikel.namaFileBaru
  });
});

// 5. BUAT FILE DATA UNTUK BERANDA
// Menyimpan daftar artikel yang SUDAH URUT untuk dibaca oleh Beranda PWA jenengan
fs.writeFileSync('./artikel.json', JSON.stringify(dataBeranda, null, 2));
console.log('Katalog data Beranda berhasil diperbarui dan diurutkan!');
