const CACHE_NAME = 'toddler-game-v2'; // Change to v3, v4 etc. when you update the game
const ASSETS = [
'./',
  './index.html',
  './style.css',
  './script.js',
  './site.webmanifest',      // Remove the leading slash!
  './favicon-96x96.png',     // Remove the leading slash!
  './favicon.svg',
  './apple-touch-icon.png',
  // './sounds/correct.mp3', // Example
];

// 1. Install Service Worker & Cache Assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all: app shell and content');
        return cache.addAll(ASSETS);
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

// 3. Serve from Cache, fall back to Network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Return cache if found, otherwise fetch from network
      return response || fetch(e.request);
    })
  );
});
