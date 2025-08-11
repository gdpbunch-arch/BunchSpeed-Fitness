// Serve /sw.js as a static JavaScript response
export const dynamic = 'force-static';

export function GET() {
  const body = `
    const CACHE = 'bsn-v1';
    const ASSETS = [
      '/',
      '/manifest.webmanifest',
      '/brand/icon-192.png',
      '/brand/icon-512.png'
    ];

    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
      );
      self.skipWaiting();
    });

    self.addEventListener('activate', (event) => {
      event.waitUntil(
        caches.keys().then((keys) =>
          Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))))
        )
      );
      self.clients.claim();
    });

    self.addEventListener('fetch', (event) => {
      if (event.request.method !== 'GET') return;
      event.respondWith(
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
            return res;
          });
        })
      );
    });
  `.trim();

  return new Response(body, {
    headers: { 'content-type': 'application/javascript' },
  });
}

