// ==========================================
// 🔧 SERVICE WORKER - PWA CACHE STRATEGY
// ==========================================

const CACHE_NAME = 'nzila-hub-v3'; // incrementado para forçar atualização
const CACHE_URLS = [
  '/',
  '/index.html',
  '/signup.html',
  '/login.html',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/manifest.json',
  '/css/styles.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/signup.js',
  '/js/home.js',
  '/js/pwa-installer.js'
];

// ==========================================
// 📥 INSTALL EVENT - Cache app shell
// ==========================================
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Caching app shell');
      return cache.addAll(CACHE_URLS).catch(error => {
        console.warn('⚠️ Some assets failed to cache:', error);
      });
    })
  );
  self.skipWaiting();
});

// ==========================================
// 🗑️ ACTIVATE EVENT - Clean old caches
// ==========================================
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ==========================================
// 🌐 FETCH EVENT - Network-first for pages,
// cache-first for assets
// ==========================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // External requests: always go to network
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  // Network-first for HTML documents
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone(); // ✅ clone antes
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          console.log('❌ Offline, serving cached page:', request.url);
          return caches.match(request).then(response => {
            return (
              response ||
              caches.match('/index.html').then(fallback => {
                return (
                  fallback ||
                  new Response(
                    '<h1>Nzila Hub - Modo Offline</h1><p>Verifique sua conexão com internet</p>',
                    { headers: { 'Content-Type': 'text/html' } }
                  )
                );
              })
            );
          });
        })
    );
    return;
  }

  // Cache-first for assets (CSS, JS, icons)
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        console.log('📦 Serving from cache:', request.url);
        return response;
      }
      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone(); // ✅ clone antes
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});

// ==========================================
// 📢 MESSAGE EVENT - Communication
// ==========================================
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ Service Worker loaded successfully');
