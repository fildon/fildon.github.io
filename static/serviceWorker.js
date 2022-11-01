const CACHE_NAME = "v2";

/**
 * Stale-while-revalidate strategy
 *
 * @see https://developer.chrome.com/docs/workbox/caching-strategies-overview/#stale-while-revalidate
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
