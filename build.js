const fs = require('fs');
const marked = require('marked');

const template = fs.readFileSync('template-artikel.html', 'utf-8');
const files = fs.readdirSync('./artikel');

let daftarArtikel = [];

files.forEach(file => {
  if(file.endsWith('.md')) {
    const text = fs.readFileSync('./artikel/' + file, 'utf-8');
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
      
      // --- PERBAIKAN LOGIKA TANGGAL ---
      let tanggalMatch = info.match(/(?:date|tanggal|waktu):\s*['"]?(.*?)['"]?(?:\r?\n|$)/i);
      let dateObj;
      
      if (tanggalMatch) {
        // Jika ada tulisan tanggal di Sveltia, gunakan itu
        dateObj = new Date(tanggalMatch[1].trim());
      } else {
        // Jika tidak ada tulisan tanggal, baca waktu asli file tersebut diedit
        let stat = fs.statSync('./artikel/' + file);
        dateObj = stat.mtime; 
      }
      
      // Pengaman jika format tanggal error
      if (isNaN(dateObj.getTime())) { 
         let stat = fs.statSync('./artikel/' + file);
         dateObj = stat.mtime;
      }
      
      let opsiTanggal = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' };
      let tanggalCantik = dateObj.toLocaleDateString('id-ID', opsiTanggal).replace(/\./g, ':');
      
      const htmlKonten = marked.parse(isi);
      const namaFileBaru = file.replace('.md', '.html');
      
      daftarArtikel.push({
        fileAsli: file,
        namaFileBaru: namaFileBaru,
        judul: judul,
        kategori: kategori,
        ringkasan: ringkasan,
        gambar: gambar,
        tanggalObj: dateObj,       
        tanggalCantik: tanggalCantik, 
        htmlKonten: htmlKonten
      });
    }
  }
});

// PENGURUTAN: Dari yang tanggalnya paling baru (atas) ke paling lama (bawah)
daftarArtikel.sort((a, b) => b.tanggalObj - a.tanggalObj);

let dataBeranda = []; 

daftarArtikel.forEach(artikel => {
  let hasilAkhir = template
    .replace(/{{JUDUL}}/g, artikel.judul)
    .replace(/{{KATEGORI}}/g, artikel.kategori)
    .replace(/{{RINGKASAN}}/g, artikel.ringkasan)
    .replace(/{{GAMBAR}}/g, artikel.gambar)
    .replace(/{{KONTEN}}/g, artikel.htmlKonten)
    .replace(/{{NAMA_FILE_MD}}/g, artikel.fileAsli)
    .replace(/{{TANGGAL}}/g, artikel.tanggalCantik); 
    
  fs.writeFileSync('./' + artikel.namaFileBaru, hasilAkhir);
  
  dataBeranda.push({
    judul: artikel.judul,
    kategori: artikel.kategori,
    ringkasan: artikel.ringkasan,
    gambar: artikel.gambar,
    tanggal: artikel.tanggalCantik,
    link: artikel.namaFileBaru
  });
});

// MEMBUAT FILE KHUSUS UNTUK DIBACA BERANDA
fs.writeFileSync('./artikel.json', JSON.stringify(dataBeranda, null, 2));
