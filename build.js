const fs = require('fs');
const marked = require('marked');

const template = fs.readFileSync('template-artikel.html', 'utf-8');
const files = fs.readdirSync('./artikel');

files.forEach(file => {
  if(file.endsWith('.md')) {
    const text = fs.readFileSync('./artikel/' + file, 'utf-8');
    const parts = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if(parts) {
      const info = parts[1];
      const isi = parts[2];
      
      let judul = (info.match(/title:\s*['"]?(.*?)['"]?(?:\n|$)/) || [])[1] || 'Tanpa Judul';
      let kategori = (info.match(/kategori:\s*['"]?(.*?)['"]?(?:\n|$)/) || [])[1] || 'Artikel';
      let ringkasan = (info.match(/(?:description|ringkasan):\s*['"]?(.*?)['"]?(?:\n|$)/) || [])[1] || judul;
      let gambar = (info.match(/(?:thumbnail|gambar):\s*['"]?(.*?)['"]?(?:\n|$)/) || [])[1] || 'profil.png';
      
      // Ubah Markdown jadi HTML
      const htmlKonten = marked.parse(isi);
      
      // Tempelkan ke cetakan
      let hasilAkhir = template
        .replace(/{{JUDUL}}/g, judul)
        .replace(/{{KATEGORI}}/g, kategori)
        .replace(/{{RINGKASAN}}/g, ringkasan)
        .replace(/{{GAMBAR}}/g, gambar)
        .replace(/{{KONTEN}}/g, htmlKonten);
        
      // Buat file HTML baru!
      const namaFileBaru = file.replace('.md', '.html');
      fs.writeFileSync('./' + namaFileBaru, hasilAkhir);
      console.log('Berhasil membuat: ' + namaFileBaru);
    }
  }
});
