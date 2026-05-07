import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { pushApi } from '../api/push';
import { urlBase64ToUint8Array } from '../lib/pwa';

/**
 * Manages the lifecycle of a Web Push subscription:
 *   - detects browser support + current permission state
 *   - subscribes/unsubscribes against /api/push/*
 *   - exposes a `sendTest` action so users can verify they'll get a push
 *
 * Designed to be safe to call on any page — failures degrade gracefully and
 * never throw. A user without a service worker just sees `supported = false`.
 */
export function usePushNotifications() {
  const [supported, setSupported] = useState(() => browserSupportsPush());
  const [permission, setPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  );
  const [subscribed, setSubscribed] = useState(null); // null = unknown
  const [busy, setBusy] = useState(false);

  // Detect current subscription state on mount.
  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (!cancelled) setSubscribed(!!existing);
      } catch {
        if (!cancelled) setSubscribed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported) {
      toast.error('Push notifications are not supported in this browser.');
      return false;
    }
    setBusy(true);
    try {
      let perm = permission;
      if (perm !== 'granted') {
        perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== 'granted') {
          toast.error('Notifications were blocked. You can enable them from your browser settings.');
          return false;
        }
      }

      const { publicKey } = await pushApi.publicKey();
      if (!publicKey) {
        toast.error('Push is not configured on the server.');
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const json = sub.toJSON();
      await pushApi.subscribe(
        { endpoint: json.endpoint, keys: json.keys },
        navigator.userAgent || undefined,
      );
      setSubscribed(true);
      toast.success("You're all set — we'll ping this device for important updates.");
      return true;
    } catch (err) {
      console.error('[push] subscribe failed:', err);
      toast.error(err?.message || 'Could not enable push notifications.');
      return false;
    } finally {
      setBusy(false);
    }
  }, [permission, supported]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return false;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await pushApi.unsubscribe(sub.endpoint).catch(() => {});
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast.message('Push notifications turned off for this device.');
      return true;
    } catch (err) {
      console.error('[push] unsubscribe failed:', err);
      toast.error(err?.message || 'Could not disable push notifications.');
      return false;
    } finally {
      setBusy(false);
    }
  }, [supported]);

  const sendTest = useCallback(async () => {
    setBusy(true);
    try {
      const res = await pushApi.test();
      toast.success(res?.message || 'Test push sent.');
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.friendlyMessage ||
          'Could not send test push.',
      );
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    supported,
    permission,
    subscribed,
    busy,
    subscribe,
    unsubscribe,
    sendTest,
  };
}

function browserSupportsPush() {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}
