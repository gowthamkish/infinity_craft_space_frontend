// Service Worker — makes Infinity Craft Space installable and resilient offline.
//
// Strategy:
//  - Page navigations: network-first, falling back to the cached app shell,
//    then to /offline.html. Users always get the latest deploy when online.
//  - Vite hashed assets (/assets/*-[hash].*): cache-first (filenames change per build).
//  - Icons / images / fonts on our origin: stale-while-revalidate.
//  - API calls (cross-origin backend) and non-GET requests are never touched,
//    so auth, cart and payment always hit the network.
//
// Bump VERSION to force old caches to be cleared.
const VERSION = "v2";
const SHELL_CACHE = `ics-shell-${VERSION}`;
const RUNTIME_CACHE = `ics-runtime-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [
  "/",
  OFFLINE_URL,
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((n) => n !== SHELL_CACHE && n !== RUNTIME_CACHE)
            .map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const isCacheable = (response) =>
  response && response.status === 200 && response.type === "basic";

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Leave cross-origin requests (backend API, Razorpay, analytics, Cloudinary) alone
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // SPA navigations
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isCacheable(response)) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((c) => c.put("/", copy));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match("/")) || (await cache.match(OFFLINE_URL));
        }),
    );
    return;
  }

  // Hashed build assets — immutable, cache-first
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (isCacheable(response)) {
              const copy = response.clone();
              caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Other static files (icons, images, fonts) — stale-while-revalidate
  if (/\.(png|jpe?g|webp|svg|gif|ico|woff2?|ttf)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (isCacheable(response)) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});

// Push notification handling
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Infinity Craft Space", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Infinity Craft Space", {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "infinity-craft-notification",
      data: { url: data.url || "/" },
    }),
  );
});

// Focus an open app window if there is one, otherwise open a new one
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((wins) => {
        const win = wins.find((w) => w.url.startsWith(self.location.origin));
        if (win) {
          win.navigate(target);
          return win.focus();
        }
        return self.clients.openWindow(target);
      }),
  );
});
