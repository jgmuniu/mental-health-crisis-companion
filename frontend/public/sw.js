// SafeGuide Service Worker v2 — offline support + push notifications
const CACHE_NAME = 'safeguide-v2';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/checkin',
  '/journal',
  '/breathing',
  '/safety-plan',
  '/dashboard',
];

// ── Install — cache app shell ─────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(SHELL_ASSETS).catch(() => {
        // Some assets may not exist yet — fail gracefully
        return cache.add('/');
      });
    })
  );
  self.skipWaiting();
});

// ── Activate — clear old caches ───────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch strategy ────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept API calls — they need real network or should fail fast
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({
            success: false,
            error: 'offline',
            offline: true
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      )
    );
    return;
  }

  // For navigation requests: network first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful navigation responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then(cached => cached || caches.match('/'))
        )
    );
    return;
  }

  // For static assets: cache first, fallback to network
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          // Only cache successful same-origin responses
          if (response.ok && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 408 }));
      })
    );
  }
});

// ── Push notification received ────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = {
    title: 'SafeGuide',
    body: 'Time to check in with yourself.',
    type: 'checkin',
    url: '/checkin'
  };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: data.type,
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url || '/checkin' },
    })
  );
});

// ── Notification click ────────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/checkin';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin));
      if (existing) { existing.focus(); existing.navigate(url); }
      else clients.openWindow(url);
    })
  );
});

// ── Scheduled local notifications ─────────────────────────────────────────
const scheduledAlarms = new Map();

self.addEventListener('message', event => {
  if (event.data?.type === 'SCHEDULE') {
    scheduledAlarms.forEach(id => clearTimeout(id));
    scheduledAlarms.clear();

    event.data.notifications.forEach((notif, i) => {
      const delay = notif.fireAt - Date.now();
      if (delay < 0) return;
      const id = setTimeout(() => {
        self.registration.showNotification(notif.title, {
          body: notif.body,
          icon: '/icons/icon-192.png',
          tag: `scheduled-${i}`,
          data: { url: notif.url || '/checkin' },
          vibrate: [200, 100, 200],
        });
      }, delay);
      scheduledAlarms.set(i, id);
    });
  }
});