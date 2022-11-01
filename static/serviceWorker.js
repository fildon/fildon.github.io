const CACHE_NAME = "v2";

self.addEventListener("install", (installEvent) => {
  installEvent.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll([
          "/",
          "/index.html",
          "/static/favicon.ico",
          "/static/headshot.jpeg",
          "/static/styles.css",
          "/anima-tile/",
          "/anima-tile/index.html",
          "/anima-tile/index.js",
          "/beads/",
          "/beads/index.html",
          "/beads/index.js",
          "/beads/styles.css",
          "/boids/",
          "/boids/index.html",
          "/boids/index.js",
          "/boids/styles.css",
          "/convection/",
          "/convection/index.html",
          "/convection/bundle.js",
          "/gravatar-lookup/",
          "/gravatar-lookup/index.html",
          "/gravatar-lookup/index.js",
          "/learn-braille/",
          "/learn-braille/index.html",
          "/learn-braille/index.js",
          "/learn-braille/styles.css",
          "/lindenmayer/",
          "/lindenmayer/index.html",
          "/lindenmayer/main.js",
          "/phong/",
          "/phong/index.html",
          "/phong/bundle.js",
          "/shiny-measure/",
          "/shiny-measure/index.html",
          "/shiny-measure/index.js",
          "/shiny-measure/reset.css",
          "/shiny-measure/styles.css",
          "/time-after-time/",
          "/time-after-time/index.html",
          "/time-after-time/index.js",
          "/time-after-time/styles.css",
          "/train-ride/",
          "/train-ride/index.html",
          "/train-ride/index.js",
          "/train-ride/sunset.png",
          "/webgltest/",
          "/webgltest/index.html",
          "/webgltest/bundle.js",
          "/wordle-hint/",
          "/wordle-hint/index.html",
          "/voronoi/",
          "/voronoi/index.html",
          "/voronoi/bundle.js",
        ])
      )
  );
});

/**
 * Stale While Validate strategy
 *
 * @see: https://developer.chrome.com/docs/workbox/caching-strategies-overview/#stale-while-revalidate
 */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return cachedResponse || fetchedResponse;
      })
    )
  );
});
