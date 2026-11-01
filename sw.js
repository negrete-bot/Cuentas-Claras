// Service worker opcional para Cuentas Claras: permite abrir la app sin conexión.
// Súbelo a GitHub junto a index.html (en la misma carpeta). Tus datos NO pasan por aquí: siguen en tu móvil.
const CACHE = 'cuentas-claras-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(['./', './index.html'].map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Primero intenta la red (para recibir actualizaciones) y, si no hay conexión, usa la copia guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
