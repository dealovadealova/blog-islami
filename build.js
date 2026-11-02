const fs = require('fs');
const marked = require('marked');

const template = fs.readFileSync('template-artikel.html', 'utf-8');
const files = fs.readdirSync('./artikel');

files.forEach(file => {
  if(file.endsWith('.md')) {
    const text = fs.readFileSync('./artikel/' + file, 'utf-8');
    const parts = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    
    if(parts) {
      const info = parts[1];
      let isi = parts[2];
      
      // 1. PISAHKAN "KAMAR" SECARA PAKSA
      // Memastikan baris yang ada huruf Arabnya dipisah dari bahasa Indonesia (diberi Enter ganda otomatis)
      let baris = isi.split(/\r?\n/);
      let isiBaru = baris.map(b => {
          if (/[\u0600-\u06FF]/.test(b)) {
              return '\n\n' + b + '\n\n';
          }
          return b;
      }).join('\n');
      
      let judul = (info.match(/title:\s*['"]?(.*?)['"]?(?:\r?\n|$)/i) || [])[1] || 'Tanpa Judul';
      let kategoriMatch = info.match(/(?:kategori|category):\s*['"]?(.*?)['"]?(?:\r?\n|$)/i);
      let kategori = kategoriMatch ? kategoriMatch[1].trim() : 'Kajian';
      let ringkasanMatch = info.match(/(?:description|ringkasan):\s*['"]?(.*?)['"]?(?:\r?\n|$)/i);
      let ringkasan = ringkasanMatch ? ringkasanMatch[1].trim() : judul;
      let gambarMatch = info.match(/(?:thumbnail|gambar|image):\s*['"]?(.*?)['"]?(?:\r?\n|$)/i);
      let gambar = gambarMatch ? gambarMatch[1].trim() : 'profil.png';
      
      let tanggalMatch = info.match(/(?:date|tanggal|waktu):\s*['"]?(.*?)['"]?(?:\r?\n|$)/i);
      let dateObj = new Date();
      if (tanggalMatch) {
        let stringTanggal = tanggalMatch[1].trim();
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
      
      let opsiTanggal = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' };
      let tanggalCantik = dateObj.toLocaleDateString('id-ID', opsiTanggal).replace(/\./g, ':') + ' WIB';
      
      // 2. PROSES CETAK HTML
      let htmlKonten = marked.parse(isiBaru, { breaks: true, gfm: true });
      
      // 3. INJEKSI GAYA ARAB (Mewarnai hijau raksasa HANYA pada paragraf Arab)
      const styleArab = 'dir="rtl" class="text-emerald-800 my-6" style="font-family: \'Amiri\', \'Traditional Arabic\', serif; font-size: 1.75rem; line-height: 2.4; text-align: right;"';
      
      htmlKonten = htmlKonten.replace(/<p>([\s\S]*?[\u0600-\u06FF][\s\S]*?)<\/p>/g, `<p ${styleArab}>$1</p>`);
      htmlKonten = htmlKonten.replace(/<blockquote>([\s\S]*?[\u0600-\u06FF][\s\S]*?)<\/blockquote>/g, `<blockquote ${styleArab}>$1</blockquote>`);
      
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
