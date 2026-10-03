const CACHE_NAME = 'crtoabingo2-v2';

const ASSETS = [
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// เก็บไฟล์ลง cache ตั้งแต่ตอนติดตั้ง เพื่อให้เปิด offline ได้
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ไปหาเน็ตก่อน แล้วค่อยใช้ cache เมื่อเน็ตล่ม
// ใช้กับหน้าเว็บและ manifest.json เพราะ Chrome ต้องเห็น manifest ล่าสุดเสมอ
function networkFirst(request, isNavigation) {
  return fetch(request)
    .then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    })
    .catch(() =>
      caches.match(request).then(cached =>
        cached || (isNavigation ? caches.match('./index.html') : Response.error())
      )
    );
}

// เสิร์ฟจาก cache ให้เร็ว แล้วค่อยอัปเดต cache ไปด้วย (stale-while-revalidate)
function cacheFirst(request) {
  return caches.match(request).then(cached => {
    const fresh = fetch(request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => cached || Response.error());

    return cached || fresh;
  });
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // ข้าม request ที่ไม่ใช่ GET หรือเป็นของคนอื่น (cross-origin)
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  const isNavigation = request.mode === 'navigate';
  const isManifest = url.pathname.endsWith('/manifest.json');

  event.respondWith(
    (isNavigation || isManifest
      ? networkFirst(request, isNavigation)
      : cacheFirst(request)
    ).catch(error => {
      console.error('[sw] fetch failed:', request.url, error);
      return Response.error();
    })
  );
});
