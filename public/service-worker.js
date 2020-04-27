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
  const DATA_CACHE_NAME = "data-cache-v1";
  
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
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
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
  self.addEventListener("fetch", function(evt) {
    // if (evt.request.url.includes("/api/")) {
    //   evt.respondWith(
    //     caches.open(DATA_CACHE_NAME).then(cache => {
    //       return fetch(evt.request)
    //         .then(response => {
    //           // If the response was good, clone it and store it in the cache.
    //           if (response.status === 200) {
    //             cache.put(evt.request.url, response.clone());
    //           }
  
    //           return response;
    //         })
    //         .catch(err => {
    //           // Network request failed, try to get it from the cache.
    //           return cache.match(evt.request);
    //         });
    //     }).catch(err => console.log(err))
    //   );
  
    //   return;
    // }
  
    // evt.respondWith(
    //   caches.open(CACHE_NAME).then(cache => {
    //     return cache.match(evt.request).then(response => {
    //       return response || fetch(evt.request);
    //     });
    //   })
    // );
  });
  