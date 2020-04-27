const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/css/style.css',
    '/js/index.js',
    '/images/family_tree_image5.jpg',
    '/images/icon-144.png',
  ];
  
  const CACHE_NAME = "static-cache-v2";
  
  // install
  // self acts like this- refers to the service worker itself
  // install will only run once when the service worker is installed
  // install will also run again if you change any of the version names to reupdate values in the cache
  // install caches all the assets listed above- will hit the server and then save everything locally in the cache
  self.addEventListener("install", function(evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  // activate
  // once installed, the service worker will activate (this also only happens once)
  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  // fetch
  // fetch is always running - it intercepts the request from the client to the server
  // any request from the client to the server will be checked in the cache first to see if it is already available
    // if it is already in the cache, it will not go to the server as it will get it from the cache
    // if it is not in the cache, it will go to the server to get the information needed for the request
  // the fetch can also be automated to store new information in the cache that is retrieved from the server for a future request
  self.addEventListener("fetch", function(event) {
    event.respondWith(async function() {
        // Try to get the response from a cache.
        const cache = await caches.open(CACHE_NAME);
        // event.request = see what request is and if it is in the cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          // If we found a match in the cache, return it, but also update the entry in the cache in the background.
          event.waitUntil(cache.add(event.request));
          return cachedResponse;
        }
        // If we didn't find a match in the cache, use the network
        return fetch(event.request);
      }());
  });
  