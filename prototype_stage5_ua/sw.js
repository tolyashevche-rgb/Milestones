const CACHE_NAME = "milestones-stage5-p2-13";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles5.css?v=20260629-p2-13",
  "./app5.js?v=20260629-p2-13",
  "./pwa.js?v=20260629-p2-13",
  "./questions_ua.js?v=20260629-p2-13",
  "./illustrations.js?v=20260629-p2-13",
  "./authors_ua.js?v=20260629-p2-13",
  "./who_windows.js?v=20260629-p2-13",
  "./manifest.webmanifest",
  "./app-icon.svg",
  "./app-icon-192.png",
  "./app-icon-512.png",
  "../prototype_stage4_ua/data_ua.js?v=20260629-p2-13",
  "../prototype_stage4_ua/engine.js?v=20260629-p2-13"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("milestones-stage5-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) return response;
          const copy = response.clone();
          return caches.open(CACHE_NAME)
            .then((cache) => cache.put("./index.html", copy))
            .then(() => response);
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (!response.ok) return response;
      const copy = response.clone();
      return caches.open(CACHE_NAME)
        .then((cache) => cache.put(request, copy))
        .then(() => response);
    }))
  );
});
