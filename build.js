const fs = require('fs');
const marked = require('marked');

// Menonaktifkan breaks agar jarak antar baris tidak renggang/bengkak
marked.setOptions({
  breaks: false,
  gfm: true
});

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
      
      // --- MESIN TANGGAL (WIB / ASIA/JAKARTA) ---
      let tanggalMatch = info.match(/(?:date|tanggal|waktu):\s*['"]?(.*?)['"]?(?:\r?\n|$)/i);
      let dateObj = new Date();
      
      if (tanggalMatch) {
        let stringTanggal = tanggalMatch[1].trim();
        
        // Memastikan terbaca sebagai WIB (+07:00)
        if (!stringTanggal.includes('Z') && !stringTanggal.includes('+')) {
            stringTanggal = stringTanggal.replace(' ', 'T') + '+07:00';
        }
        
        let parsedDate = new Date(stringTanggal);
        if (!isNaN(parsedDate.getTime())) {
            dateObj = parsedDate;
        }
      } else {
        let stat = fs.statSync('./artikel/' + file);
        dateObj = stat.mtime;
      }
      
      // Format Jam dan Tanggal WIB
      let opsiTanggal = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' };
      let tanggalCantik = dateObj.toLocaleDateString('id-ID', opsiTanggal).replace(/\./g, ':') + ' WIB';
      
      // Mencetak HTML dengan aman tanpa memperbesar huruf/spasi
      const htmlKonten = marked.parse(isi);
      
      // Pemasangan ke Template (Sistem Aman dari Kerusakan Karakter)
      let hasilAkhir = template
        .replace(/{{JUDUL}}/g, () => judul)
        .replace(/{{KATEGORI}}/g, () => kategori)
        .replace(/{{RINGKASAN}}/g, () => ringkasan)
        .replace(/{{GAMBAR}}/g, () => gambar)
        .replace(/{{KONTEN}}/g, () => htmlKonten)
        .replace(/{{NAMA_FILE_MD}}/g, () => file)
        .replace(/{{TANGGAL}}/g, () => tanggalCantik); 
        
      const namaFileBaru = file.replace('.md', '.html');
      fs.writeFileSync('./' + namaFileBaru, hasilAkhir);
      console.log('Berhasil mencetak HTML: ' + namaFileBaru);
    }
  }
});
