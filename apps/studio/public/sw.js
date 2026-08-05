// Jack Tan Studio Service Worker v1.0
// 仅负责根域 Studio 应用，避免影响 /projects/ 下的子应用。

const CACHE_VERSION = 'jack-tan-studio-v1';
const STATIC_CACHE = CACHE_VERSION + '-static';

const CORE_ASSETS = ['/', '/index.html', '/manifest.json', '/logo-192.png', '/logo-512.png', '/favicon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.allSettled(
          CORE_ASSETS.map((url) => cache.add(url).catch((err) => console.warn('SW: 预缓存失败', url, err)))
        )
      )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const pathname = url.pathname;

  // 不拦截其他子应用、vendor 共享脚本以及跨域请求
  if (pathname.startsWith('/projects/')) return;
  if (pathname.startsWith('/vendor/')) return;
  if (url.origin !== self.location.origin) return;

  // 导航请求：网络优先，失败回退缓存的 index.html
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // 静态资源：Stale-While-Revalidate
  if (pathname.match(/\.(js|css|html|json|png|jpg|jpeg|webp|svg|woff2?)$/)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }
});

function networkFirst(request, cacheName) {
  return fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(cacheName).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then((cached) => {
        return cached || caches.match('/index.html');
      })
    );
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
