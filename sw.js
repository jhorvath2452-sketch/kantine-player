// Kantinen-Player – Service Worker
// Hält die Player-Seite lokal vor, damit sie auch ohne Internet startet.
// (Fotos/Videos liegen in einem eigenen Zwischenspeicher der Seite.)
const SHELL = 'kantine-shell-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.includes('/__media/')) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(url.origin + url.pathname, copy)); }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(url.origin + url.pathname) ||
          await caches.match(url.origin + url.pathname.replace(/index\.html$/i, ''));
        return hit || Response.error();
      })
  );
});
