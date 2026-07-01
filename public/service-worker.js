const CACHE_NAME = 'cityqr-v3';
const PRE_CACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/app_icon-192.png',
  '/app_icon-512.png'
];

// Install Event - Pre-cache essential static assets with individual fault-tolerance
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[CityQR Service Worker] Pre-caching offline assets');
      // Use Promise.allSettled so that a single optional asset fetch failure won't fail the entire Service Worker installation
      return Promise.allSettled(
        PRE_CACHE_ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn(`[CityQR Service Worker] Failed to pre-cache ${asset}:`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[CityQR Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Dynamic and Stale-While-Revalidate caching
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and avoid non-http(s) schemes like chrome-extension
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);

  // Use instant Cache-First / Stale-While-Revalidate for icons and manifest files to bypass network latency during install
  const isPWAAsset = PRE_CACHE_ASSETS.includes(url.pathname) || 
                     url.pathname.endsWith('.png') || 
                     url.pathname.endsWith('.json') ||
                     url.pathname.endsWith('.js') ||
                     url.pathname.endsWith('.css');

  if (isPWAAsset) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background to keep it updated
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  } else {
    // Network-first for other pages/navigation
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Essential fix: Accept BOTH 'basic' and 'cors' response types (Chrome Mobile's icon downloads use CORS)
          if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html', { ignoreSearch: true }) || caches.match('/', { ignoreSearch: true });
            }
          });
        })
    );
  }
});
