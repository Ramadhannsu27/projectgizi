// Service Worker for Project Gizi - Offline Support

const CACHE_NAME = "projectgizi-v1";
const OFFLINE_URL = "/offline";

const STATIC_ASSETS = [
  "/",
  "/login",
  "/dashboard",
  "/pemeriksaan",
  "/siswa",
  "/laporan",
  "/manifest.json",
  "/icon.svg",
];

// Install event - cache static pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API calls and external resources
  if (url.pathname.startsWith("/api/") || url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;

          // For navigation requests, show offline page
          if (request.mode === "navigate") {
            return caches.match(OFFLINE_URL).then((offline) => {
              if (offline) return offline;
              // Fallback if no offline page cached
              return new Response("Offline — koneksi internet terputus", {
                status: 503,
                headers: { "Content-Type": "text/plain" },
              });
            });
          }

          return new Response("Offline", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        });
      })
  );
});
