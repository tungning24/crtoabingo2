const CACHE_NAME = 'crtoabingo2-v3'; // 💡 อัปเดตเวอร์ชันแคชด้วย

// 💡 เปลี่ยนเป็น Path เต็ม เพื่อไม่ให้ Chrome หลงทางบน GitHub Pages
const ASSETS = [
  '/crtoabingo2/',
  '/crtoabingo2/index.html',
  '/crtoabingo2/styles.css',
  '/crtoabingo2/script.js',
  '/crtoabingo2/manifest.webmanifest',
  '/crtoabingo2/icon-192.png',
  '/crtoabingo2/icon-512.png'
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
function networkFirst(request, isNavigation) {
  return fetch(request)
    .then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    })
    .catch(() =>
      caches.match(request).then(cached =>
        // 💡 เปลี่ยนตรงนี้เป็น Path เต็ม เพื่อแก้เคสเปิดแอปออฟไลน์ไม่ได้
        cached || (isNavigation ? caches.match('/crtoabingo2/index.html') : Response.error())
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
