// Choose a cache name
const cacheName = 'cache-v1';
// List the files to precache
const precacheResources = ['/','real_osce.js','osce.css','osce.js',
"https://mdcu.github.io/onka.js/asset/onka.png",
"https://mdcu.github.io/onka.js/onka_base.css",
"https://mdcu.github.io/onka.js/onka.js",
"https://mdcu.github.io/onka.js/onka_array.js",
"https://mdcu.github.io/onka.js/onka_file.js",
"https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js"];

// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener('install', (event) => {
  console.log('Service worker install event!');
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precacheResources.map(function(precacheResources) {
     return new Request(precacheResources, { mode: 'no-cors' });
  }))));
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activate event!');
});

// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
self.addEventListener('fetch', (event) => {
  console.log('Fetch intercepted for:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    }),
  );
});
