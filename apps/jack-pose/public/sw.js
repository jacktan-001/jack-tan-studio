/**
 * Jack-Pose Service Worker v2.0
 * - 预缓存：核心静态资源在 install 时缓存，确保离线可用
 * - 导航请求：Network First（离线时回退缓存）
 * - 哈希静态资源（/assets/）：Cache First
 * - Google Fonts：Stale While Revalidate
 */

const CACHE_VERSION = 'jack-pose-v2'
const PRECACHE_CACHE = `${CACHE_VERSION}-precache`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

// 子路径部署：从 SW scope 推导 base（如 /projects/jack-pose/）
const BASE = new URL(self.registration.scope).pathname
function p(path) { return BASE + path.replace(/^\//, '') }

// 预缓存核心资源（构建时已知路径，不含 hash）
var PRECACHE_ASSETS = [
  p('/'),
  p('/index.html'),
  p('/manifest.json'),
  p('/hero-sm.png'),
  p('/favicon.png'),
  p('/icon-192.png'),
  p('/icon-512.png'),
  p('/apple-touch-icon.png'),
]

// ==================== Install：预缓存核心资源 ====================
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(PRECACHE_CACHE).then(function(cache) {
      return Promise.allSettled(
        PRECACHE_ASSETS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('SW: 预缓存失败', url, err)
          })
        })
      )
    })
  )
  self.skipWaiting()
})

// ==================== Activate：清理旧缓存 ====================
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
            caches.match(req).then((r) => r || caches.match(BASE + 'index.html')),
          ),
      )
      return
    }

    // 哈希静态资源：Cache First（Vite 构建产物，文件名含 hash，可长期缓存）
    if (url.pathname.startsWith(BASE + 'assets/')) {
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
