const CACHE_NAME = 'toddler-game-v4'; // Incremented version
const ASSETS = [
  './',
  './index.html',
  './site.webmanifest',
  './assets/images/favicon-96x96.png',
  './assets/images/favicon.svg',
  './assets/images/apple-touch-icon.png',
  './css/style.css',
  './js/game.js',
  './js/sw-register.js',
  './assets/images/puzzle/lion.png',
  './assets/images/puzzle/car.png',
  './assets/images/puzzle/butterfly.png',
  './assets/images/puzzle/apple.png'
];

// 1. Install & Cache (Debug Version)
// This will log "❌ FAILED" for any missing file instead of crashing the whole app.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Starting caching...');
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
          console.log(`✅ Cached: ${asset}`);
        } catch (error) {
          console.error(`❌ FAILED to cache: ${asset}. Check if this file exists in your repo!`);
        }
      }
    })
  );
});

// 2. Activate & Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 3. Serve from Cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
