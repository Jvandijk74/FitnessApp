self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('coach-cache-v1').then((cache) => cache.addAll(['/','/dashboard','/manifest.webmanifest','/icon.svg']))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request);
    })
  );
});
