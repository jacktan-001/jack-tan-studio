// Jack Wave Service Worker v2.0
// 策略：
// - 静态资源：Stale-While-Revalidate（快速响应 + 后台更新）
// - API 请求：Network-First（优先最新数据，离线时回退缓存）
// - iTunes API：Cache-First（减少跨域请求，缓存 1 小时）
// - 音频/图片：Cache-First（大文件优先缓存）

var CACHE_VERSION = 'jack-wave-v7';
var STATIC_CACHE = CACHE_VERSION + '-static';
var API_CACHE = CACHE_VERSION + '-api';
var MEDIA_CACHE = CACHE_VERSION + '-media';

// 核心静态资源
var CORE_ASSETS = [
  '/',
  '/index.html',
  '/common.css',
  '/data.js',
  '/app.js',
  '/manifest.json',
  '/avatar.jpg',
  '/admin.html'
];

// 需要预缓存的资源
var PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/common.css',
  '/data.js',
  '/app.js',
  '/manifest.json',
  '/avatar.jpg'
];

// === Install：预缓存核心资源 ===
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      return cache.addAll(PRECACHE_ASSETS).catch(function(err) {
        console.warn('SW: 预缓存部分资源失败', err);
      });
    })
  );
  self.skipWaiting();
});

// === Activate：清理旧缓存 ===
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(k) {
            return !k.startsWith(CACHE_VERSION);
          })
          .map(function(k) {
            return caches.delete(k);
          })
      );
    })
  );
  self.clients.claim();
});

// === Fetch：根据请求类型选择不同缓存策略 ===
self.addEventListener('fetch', function(e) {
  var req = e.request;

  // 只处理 GET 请求
  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  // 策略 1：API 请求 → Network-First
  // 确保管理后台和公开数据总是获取最新内容
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(req, API_CACHE, 300)); // API 缓存 5 分钟
    return;
  }

  // 策略 2：iTunes API → Cache-First（缓存 1 小时）
  // 减少 iTunes 跨域请求，URL 刷新数据可缓存较长时间
  if (url.hostname === 'itunes.apple.com' || url.hostname === 'audio-ssl.itunes.apple.com') {
    e.respondWith(cacheFirst(req, MEDIA_CACHE, 3600)); // 媒体缓存 1 小时
    return;
  }

  // 策略 3：图片资源（mzstatic.com）→ Cache-First
  if (url.hostname.endsWith('mzstatic.com') || url.hostname.endsWith('apple.com')) {
    e.respondWith(cacheFirst(req, MEDIA_CACHE, 86400)); // 图片缓存 24 小时
    return;
  }

  // 策略 4：静态资源 → Stale-While-Revalidate
  // 先返回缓存（快速），同时后台更新
  if (req.mode === 'navigate' || url.pathname.match(/\.(js|css|html|json|jpg|png|svg|woff2?)$/)) {
    e.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }

  // 默认：直接走网络
  e.respondWith(fetch(req).catch(function() {
    return caches.match(req);
  }));
});

// === 缓存策略实现 ===

// Network-First：优先网络，失败时回退缓存
function networkFirst(req, cacheName, maxAge) {
  return fetch(req)
    .then(function(res) {
      if (res && res.status === 200) {
        var clone = res.clone();
        caches.open(cacheName).then(function(cache) {
          cache.put(req, clone);
        });
      }
      return res;
    })
    .catch(function() {
      return caches.match(req).then(function(cached) {
        return cached || new Response('离线模式，数据不可用', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    });
}

// Cache-First：优先缓存，缓存不存在时走网络并缓存
function cacheFirst(req, cacheName, maxAge) {
  return caches.open(cacheName).then(function(cache) {
    return cache.match(req).then(function(cached) {
      if (cached) {
        // 检查缓存是否过期
        var cachedTime = cached.headers.get('date');
        if (cachedTime) {
          var age = (Date.now() - new Date(cachedTime).getTime()) / 1000;
          if (age < maxAge) {
            return cached; // 缓存未过期，直接返回
          }
        }
        // 缓存过期，后台更新
        fetch(req).then(function(res) {
          if (res && res.status === 200) {
            cache.put(req, res.clone());
          }
        }).catch(function() {});
        return cached; // 先返回旧缓存
      }
      // 无缓存，走网络
      return fetch(req).then(function(res) {
        if (res && res.status === 200) {
          cache.put(req, res.clone());
        }
        return res;
      }).catch(function() {
        return cached;
      });
    });
  });
}

// Stale-While-Revalidate：立即返回缓存，后台异步更新
function staleWhileRevalidate(req, cacheName) {
  return caches.open(cacheName).then(function(cache) {
    return cache.match(req).then(function(cached) {
      var fetchPromise = fetch(req).then(function(res) {
        if (res && res.status === 200) {
          cache.put(req, res.clone());
        }
        return res;
      }).catch(function() {
        // 网络失败时返回缓存，缓存也没有则返回空 Response
        return cached || new Response('', { status: 404, headers: { 'Content-Type': 'text/plain' } });
      });
      // 有缓存就先返回，没有就等网络
      return cached || fetchPromise;
    });
  });
}

// === 消息通信：允许页面触发 SW 更新 ===
self.addEventListener('message', function(e) {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
