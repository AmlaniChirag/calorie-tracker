// CalTrack Service Worker — network-first, offline fallback
const CACHE = "caltrack-v2";
const OFFLINE_URLS = ["/", "/dashboard"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Skip non-GET and API/auth requests — always network
  if (
    e.request.method !== "GET" ||
    e.request.url.includes("/api/") ||
    e.request.url.includes("clerk")
  ) {
    return;
  }

  // Navigation: network-first, fall back to cached /dashboard
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/dashboard") || caches.match("/"))
    );
    return;
  }

  // Static assets: cache-first
  e.respondWith(
    caches.match(e.request).then(
      (cached) => cached || fetch(e.request).then((res) => {
        // Only cache same-origin static assets
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
    )
  );
});
