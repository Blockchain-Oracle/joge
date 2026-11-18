/*
 * Jōge's service worker (F20, F24). It shows round results and agent proposals the engine pushes, opens the right page
 * when one is tapped, and keeps the app shell available offline (Kakure's rules: built assets cache-first, pages
 * network-first with the last copy as a fallback, live data and APIs never cached). On localhost it caches nothing,
 * so development reloads stay fresh.
 */
const CACHE = "joge-v1";
const ICON = "/icons/icon-192.png";
const BADGE = "/icons/badge-96.png";
/** Buzz, pause, buzz (milliseconds). */
const BUZZ_MS = 100;
const PAUSE_MS = 50;
const VIBRATE = [BUZZ_MS, PAUSE_MS, BUZZ_MS];
const CACHING = self.location.hostname !== "localhost" && self.location.hostname !== "127.0.0.1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (!CACHING || event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(event.request).then(
        (hit) =>
          hit ??
          fetch(event.request).then((response) => {
            const copy = response.clone();
            void caches.open(CACHE).then((cache) => cache.put(event.request, copy));
            return response;
          }),
      ),
    );
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((hit) => hit ?? caches.match("/rounds"))),
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const notice = event.data.json();
  event.waitUntil(
    self.registration.showNotification(notice.title, {
      body: notice.body,
      icon: ICON,
      badge: BADGE,
      tag: notice.tag,
      vibrate: VIBRATE,
      data: { url: notice.url ?? "/rounds" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url ?? "/rounds", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => client.url.startsWith(self.location.origin));
      if (open) return open.navigate(url).then((client) => (client ?? open).focus());
      return self.clients.openWindow(url);
    }),
  );
});
