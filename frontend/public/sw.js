/* GrandHR Service Worker */
/* eslint-disable no-restricted-globals */

const CACHE_VERSION = 'grandhr-v1';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/logo.jpeg',
  '/icons/icon.svg',
  '/icons/icon-maskable.svg',
  '/offline.html',
];

const QUEUE_DB = 'grandhr-offline-queue';
const QUEUE_STORE = 'requests';
const SYNC_TAG = 'grandhr-sync-queue';

// ---------------- Lifecycle ----------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // Best-effort — if the offline.html or any asset isn't on the server yet
      // (e.g. during local dev), don't fail the install.
      await Promise.all(
        APP_SHELL.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => null),
        ),
      );
      self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

// ---------------- Fetch ----------------

const isApiPost = (request) => {
  if (request.method !== 'POST' && request.method !== 'PUT') return false;
  return /\/api\//.test(request.url);
};

const isPunchRequest = (request) => /\/api\/attendance\/clock-(in|out)$/.test(request.url);

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Punch in / out — queue when offline so the user can hit the button on the
  // commute and have it sync once a connection comes back.
  if (isPunchRequest(request)) {
    event.respondWith(handlePunch(request.clone()));
    return;
  }

  // Navigation requests — network first, fall back to cache, then offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/offline.html');
        }
      })(),
    );
    return;
  }

  // Don't intercept API mutations beyond the punch flow above — let them error
  // naturally if offline. (Auth, payroll edits, etc. need fresh data.)
  if (isApiPost(request)) return;

  // Same-origin GET requests — cache-first with background refresh for static
  // assets, network-first for everything else.
  if (request.method === 'GET' && new URL(request.url).origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const fetched = fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => null);
  return cached || (await fetched) || new Response('', { status: 504 });
}

// ---------------- Offline queue ----------------

const openQueue = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(QUEUE_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const enqueue = async (entry) => {
  const db = await openQueue();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    tx.objectStore(QUEUE_STORE).add(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const drainQueue = async () => {
  const db = await openQueue();
  const entries = await new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const store = tx.objectStore(QUEUE_STORE);
    const out = [];
    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor) {
        out.push({ id: cursor.key, value: cursor.value });
        cursor.continue();
      } else resolve(out);
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });

  let succeeded = 0;
  for (const entry of entries) {
    try {
      const res = await fetch(entry.value.url, {
        method: entry.value.method,
        headers: entry.value.headers,
        body: entry.value.body,
        credentials: 'include',
      });
      if (res.ok) {
        succeeded += 1;
        await new Promise((resolve, reject) => {
          const tx = db.transaction(QUEUE_STORE, 'readwrite');
          tx.objectStore(QUEUE_STORE).delete(entry.id);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    } catch {
      // Connection still flaky — try again on the next sync.
    }
  }

  if (succeeded > 0) {
    const all = await self.clients.matchAll({ includeUncontrolled: true });
    for (const c of all) {
      c.postMessage({ type: 'queue-flushed', count: succeeded });
    }
  }
  return succeeded;
};

const handlePunch = async (request) => {
  try {
    return await fetch(request);
  } catch {
    // Offline — capture the request and queue it for the next sync.
    const url = request.url;
    const method = request.method;
    const headers = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    const body = await request.text();
    await enqueue({ url, method, headers, body, queuedAt: Date.now() });
    if ('sync' in self.registration) {
      try {
        await self.registration.sync.register(SYNC_TAG);
      } catch {
        /* ignore */
      }
    }
    return new Response(
      JSON.stringify({
        offline: true,
        queued: true,
        message: 'You are offline — your punch has been queued and will sync when back online.',
      }),
      { status: 202, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(drainQueue());
  }
});

// Manual flush trigger from the page (used when we hear "online" without
// background-sync support, e.g. iOS Safari).
self.addEventListener('message', (event) => {
  if (event.data?.type === 'flush-queue') {
    event.waitUntil(drainQueue());
  }
  if (event.data?.type === 'skip-waiting') {
    self.skipWaiting();
  }
});

// ---------------- Push notifications ----------------

self.addEventListener('push', (event) => {
  let payload = { title: 'GrandHR', body: 'You have a new notification.' };
  try {
    if (event.data) payload = event.data.json();
  } catch {
    if (event.data) payload.body = event.data.text();
  }

  const title = payload.title || 'GrandHR';
  const body = payload.body || payload.message || 'You have a new notification.';
  const icon = payload.icon || '/icons/icon.svg';
  const badge = payload.badge || '/icons/icon.svg';
  const data = { url: payload.url || payload.link || '/', ...payload.data };
  const tag = payload.tag || 'grandhr-notification';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      data,
      requireInteraction: !!payload.requireInteraction,
      actions: payload.actions || [],
      vibrate: [80, 40, 80],
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/';
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of all) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            client.focus();
            client.postMessage({ type: 'navigate', url: target });
            return;
          }
        } catch {
          /* ignore */
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
