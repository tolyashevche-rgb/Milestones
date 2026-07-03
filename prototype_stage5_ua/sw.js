const CACHE_NAME = "milestones-stage5-p2-36-r1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles5.css?v=20260704-p2-36-r1",
  "./app5.js?v=20260704-p2-36-r1",
  "./pwa.js?v=20260704-p2-36-r1",
  "./questions_ua.js?v=20260704-p2-36-r1",
  "./illustrations.js?v=20260704-p2-36-r1",
  "./authors_ua.js?v=20260704-p2-36-r1",
  "./who_windows.js?v=20260704-p2-36-r1",
  "./activity_context_ua.js?v=20260704-p2-36-r1",
  "./library_ua.js?v=20260704-p2-36-r1",
  "./activity-tummy-time-guide-v1.png",
  "./assets/motion_cards/act_002_social_001.jpg",
  "./assets/motion_cards/act_002_language_001.jpg",
  "./assets/motion_cards/act_002_cognitive_002.jpg",
  "./assets/motion_cards/act_004_social_001.jpg",
  "./assets/motion_cards/act_004_movement_002.jpg",
  "./assets/motion_cards/act_004_cognitive_003.jpg",
  "./assets/motion_cards/act_006_language_001.jpg",
  "./assets/motion_cards/act_006_cognitive_001.jpg",
  "./assets/motion_cards/act_006_movement_003.jpg",
  "./assets/motion_cards/act_009_social_001.jpg",
  "./assets/motion_cards/act_009_cognitive_001.jpg",
  "./assets/motion_cards/act_009_movement_002.jpg",
  "./assets/motion_cards/act_012_cognitive_001.jpg",
  "./assets/motion_cards/act_012_cognitive_002.jpg",
  "./assets/motion_cards/act_012_movement_001.jpg",
  "./assets/motion_cards/act_002_social_002.jpg",
  "./assets/motion_cards/act_002_movement_002.jpg",
  "./assets/motion_cards/act_002_movement_003.jpg",
  "./assets/motion_cards/act_004_language_001.jpg",
  "./assets/motion_cards/act_004_cognitive_002.jpg",
  "./assets/motion_cards/act_004_movement_001.jpg",
  "./assets/motion_cards/act_006_social_002.jpg",
  "./assets/motion_cards/act_006_cognitive_002.jpg",
  "./assets/motion_cards/act_006_movement_002.jpg",
  "./assets/motion_cards/act_009_social_003.jpg",
  "./assets/motion_cards/act_009_cognitive_002.jpg",
  "./assets/motion_cards/act_009_movement_001.jpg",
  "./assets/motion_cards/act_012_social_002.jpg",
  "./assets/motion_cards/act_012_language_003.jpg",
  "./assets/motion_cards/act_012_movement_003.jpg",
  "./assets/motion_cards/act_002_cognitive_001.jpg",
  "./assets/motion_cards/act_002_cognitive_003.jpg",
  "./assets/motion_cards/act_002_language_002.jpg",
  "./assets/motion_cards/act_002_language_003.jpg",
  "./assets/motion_cards/act_002_social_003.jpg",
  "./assets/motion_cards/act_004_cognitive_001.jpg",
  "./assets/motion_cards/act_004_language_002.jpg",
  "./assets/motion_cards/act_004_language_003.jpg",
  "./assets/motion_cards/act_004_movement_003.jpg",
  "./assets/motion_cards/act_004_social_002.jpg",
  "./assets/motion_cards/act_004_social_003.jpg",
  "./assets/motion_cards/act_006_language_002.jpg",
  "./assets/motion_cards/act_006_movement_001.jpg",
  "./assets/motion_cards/act_006_social_001.jpg",
  "./assets/motion_cards/act_006_social_003.jpg",
  "./assets/motion_cards/act_006_language_003.jpg",
  "./assets/motion_cards/act_006_cognitive_003.jpg",
  "./assets/motion_cards/act_009_social_002.jpg",
  "./assets/motion_cards/act_009_language_001.jpg",
  "./assets/motion_cards/act_009_language_002.jpg",
  "./assets/motion_cards/act_009_language_003.jpg",
  "./assets/motion_cards/act_009_cognitive_003.jpg",
  "./assets/motion_cards/act_009_movement_003.jpg",
  "./assets/motion_cards/act_012_social_001.jpg",
  "./assets/motion_cards/act_012_language_001.jpg",
  "./assets/motion_cards/act_012_language_002.jpg",
  "./assets/motion_cards/act_012_movement_002.jpg",
  "./assets/motion_cards/act_012_social_003.jpg",
  "./assets/motion_cards/act_012_cognitive_003.jpg",
  "./manifest.webmanifest",
  "./app-icon.svg",
  "./app-icon-192.png",
  "./app-icon-512.png",
  "../prototype_stage4_ua/data_ua.js?v=20260704-p2-36-r1",
  "../prototype_stage4_ua/engine.js?v=20260704-p2-36-r1"
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
