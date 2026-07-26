const CACHE_NAME = 'cityqr-v5';
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
  // Bypassing caching to ensure latest updates
  event.respondWith(fetch(event.request));
});
