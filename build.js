const fs = require('fs');
const marked = require('marked');

const template = fs.readFileSync('template-artikel.html', 'utf-8');
const files = fs.readdirSync('./artikel');

files.forEach(file => {
  if(file.endsWith('.md')) {
    const text = fs.readFileSync('./artikel/' + file, 'utf-8');
    
    // REGEX TAHAN BANTING: Bisa membaca segala jenis format Enter (Windows/Mac/Linux/HP)
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
      
      const htmlKonten = marked.parse(isi);
      
      let hasilAkhir = template
        .replace(/{{JUDUL}}/g, judul)
        .replace(/{{KATEGORI}}/g, kategori)
        .replace(/{{RINGKASAN}}/g, ringkasan)
        .replace(/{{GAMBAR}}/g, gambar)
        .replace(/{{KONTEN}}/g, htmlKonten)
        .replace(/{{NAMA_FILE_MD}}/g, file);
        
      const namaFileBaru = file.replace('.md', '.html');
      fs.writeFileSync('./' + namaFileBaru, hasilAkhir);
      console.log('Berhasil membuat HTML untuk: ' + namaFileBaru);
    } else {
      console.log('PERINGATAN: Gagal membaca format kepala artikel pada file ' + file);
    }
  }
});
