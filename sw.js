// Menginstal Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Terpasang!');
  self.skipWaiting();
});

// Mengaktifkan Service Worker
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Aktif!');
});

// Membaca koneksi internet (Syarat wajib dari Chrome agar pop-up Install muncul)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return new Response('Anda sedang offline. Silakan periksa koneksi internet.');
    })
  );
});
