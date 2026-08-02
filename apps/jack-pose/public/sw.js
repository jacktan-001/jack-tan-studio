/**
 * Jack-Pose Service Worker
 * - 导航请求：Network First（离线时回退缓存）
 * - 哈希静态资源（/assets/）：Cache First
 * - Google Fonts：Stale While Revalidate
 */

const CACHE_VERSION = 'jack-pose-v1'
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

// ==================== Install ====================
self.addEventListener('install', () => {
  self.skipWaiting()
})

// ==================== Activate ====================
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// ==================== Fetch ====================
self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)

  if (req.method !== 'GET') return

  // 同源请求
  if (url.origin === self.location.origin) {
    // 导航请求：Network First
    if (req.mode === 'navigate') {
      e.respondWith(
        fetch(req)
          .then((res) => {
            const copy = res.clone()
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy))
            return res
          })
          .catch(() =>
            caches.match(req).then((r) => r || caches.match('/')),
          ),
      )
      return
    }

    // 哈希静态资源：Cache First
    if (url.pathname.startsWith('/assets/')) {
      e.respondWith(
        caches.match(req).then(
          (cached) =>
            cached ||
            fetch(req).then((res) => {
              const copy = res.clone()
              caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy))
              return res
            }),
        ),
      )
      return
    }

    // 其他同源静态文件（图片、manifest 等）：Cache First，短期缓存
    if (/\.(png|jpg|jpeg|gif|webp|svg|ico|json|css|js)$/.test(url.pathname)) {
      e.respondWith(
        caches.match(req).then(
          (cached) =>
            cached ||
            fetch(req).then((res) => {
              if (res.ok) {
                const copy = res.clone()
                caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy))
              }
              return res
            }),
        ),
      )
      return
    }
  }

  // Google Fonts：Stale While Revalidate
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy))
            }
            return res
          })
          .catch(() => cached)
        return cached || fetchPromise
      }),
    )
  }
})
