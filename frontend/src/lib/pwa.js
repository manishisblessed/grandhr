/**
 * Lightweight PWA helpers for GrandHR.
 *
 *   - registerServiceWorker(): install /sw.js, expose readiness, listen for SW
 *     messages (e.g. "queue-flushed" so the UI can refetch).
 *   - listenForInstallPrompt(): captures `beforeinstallprompt` so the app can
 *     surface a custom "Install app" button.
 *   - urlBase64ToUint8Array(): VAPID key conversion for push subscriptions.
 *
 * Service workers are best-effort. Browsers that don't support them (most
 * Safari versions older than 16, all in-app browsers, etc.) silently fall
 * back to normal online operation.
 */

let deferredInstallEvent = null;
const installListeners = new Set();
const messageListeners = new Set();

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  // Avoid registering on dev when there's no built sw, but keep simple: the
  // file lives in public/ so Vite serves it identically in dev and prod.
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // When a new SW takes over, ask the user to refresh once on next idle.
        if (reg.waiting) reg.waiting.postMessage({ type: 'skip-waiting' });
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              reg.waiting?.postMessage({ type: 'skip-waiting' });
            }
          });
        });
      })
      .catch((err) => console.warn('[PWA] Service worker registration failed:', err));
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    for (const listener of messageListeners) {
      try {
        listener(event.data);
      } catch (err) {
        console.warn('[PWA] message listener error:', err);
      }
    }
  });

  // When the network comes back, prompt the SW to flush any queued punches.
  window.addEventListener('online', () => flushOfflineQueue());
}

export function flushOfflineQueue() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((reg) => {
      reg.active?.postMessage({ type: 'flush-queue' });
    })
    .catch(() => {});
}

export function onSwMessage(listener) {
  messageListeners.add(listener);
  return () => messageListeners.delete(listener);
}

export function listenForInstallPrompt() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallEvent = event;
    installListeners.forEach((l) => l(true));
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallEvent = null;
    installListeners.forEach((l) => l(false));
  });
}

export function getInstallPromptAvailable() {
  return !!deferredInstallEvent;
}

export function onInstallAvailableChange(listener) {
  installListeners.add(listener);
  return () => installListeners.delete(listener);
}

export async function promptInstall() {
  if (!deferredInstallEvent) return { outcome: 'unavailable' };
  const ev = deferredInstallEvent;
  deferredInstallEvent = null;
  installListeners.forEach((l) => l(false));
  try {
    await ev.prompt();
    const choice = await ev.userChoice;
    return choice;
  } catch {
    return { outcome: 'dismissed' };
  }
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // Safari iOS
    window.navigator.standalone === true
  );
}

// VAPID base64-url → Uint8Array (required by PushManager.subscribe).
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}
