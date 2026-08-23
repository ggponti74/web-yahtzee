// --- Cache settings ---
const CACHE_NAME = 'yahtzee-pwa-v1';
const ASSETS = [
  '/',                // root
  '/src/index.html',
  '/src/style.css',
  '/src/app.js',
  '/src/dice.js',
  '/src/scoring.js',
  '/src/scorecard.js',
  '/src/storage.js',
  '/src/sound.js',
  '/public/manifest.json',
  '/public/icons/icon-192.png',
  '/public/icons/icon-512.png',
  '/public/sounds/roll.mp3',
  '/public/sounds/tap.mp3'
];

// --- Install event: precache essentials ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// --- Activate event: cleanup old caches ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// --- Fetch event: serve from cache, fallback to network ---
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
