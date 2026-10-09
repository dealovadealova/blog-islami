const fs = require('fs');
const marked = require('marked');

const template = fs.readFileSync('template-artikel.html', 'utf-8');
const files = fs.readdirSync('./artikel');

files.forEach(file => {
  if(file.endsWith('.md')) {
    const text = fs.readFileSync('./artikel/' + file, 'utf-8');
    
    // Membaca batas atas dan bawah Sveltia
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
      
      // --- MESIN PENARIK TANGGAL & JAM ---
      let tanggalMatch = info.match(/(?:date|tanggal|waktu):\s*['"]?(.*?)['"]?(?:\r?\n|$)/i);
      let dateObj = new Date();
      
      if (tanggalMatch) {
        let parsedDate = new Date(tanggalMatch[1].trim());
        if (!isNaN(parsedDate.getTime())) {
            dateObj = parsedDate;
        }
      } else {
        // Jika tidak ada tulisan tanggal, baca waktu asli file dibuat
        let stat = fs.statSync('./artikel/' + file);
        dateObj = stat.mtime;
      }
      
      // Format lengkap dengan Jam & Menit
      let opsiTanggal = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' };
      let tanggalCantik = dateObj.toLocaleDateString('id-ID', opsiTanggal).replace(/\./g, ':') + ' WIB';
      
      const htmlKonten = marked.parse(isi);
      
      // PROSES PENCETAKAN HTML
      let hasilAkhir = template
        .replace(/{{JUDUL}}/g, judul)
        .replace(/{{KATEGORI}}/g, kategori)
        .replace(/{{RINGKASAN}}/g, ringkasan)
        .replace(/{{GAMBAR}}/g, gambar)
        .replace(/{{KONTEN}}/g, htmlKonten)
        .replace(/{{NAMA_FILE_MD}}/g, file)
        .replace(/{{TANGGAL}}/g, tanggalCantik); // <-- INI YANG MENYUNTIKKAN TANGGAL & JAM KE TEMPLATE
        
      const namaFileBaru = file.replace('.md', '.html');
      fs.writeFileSync('./' + namaFileBaru, hasilAkhir);
      console.log('Berhasil membuat HTML untuk: ' + namaFileBaru);
    } else {
      console.log('PERINGATAN: Gagal membaca format kepala artikel pada file ' + file);
    }
  }
});
