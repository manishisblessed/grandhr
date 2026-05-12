import { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { PushService } from '../../services/push.service';

/**
 * Headless component: registers the device for push when authenticated and
 * wires foreground / tap handlers into the in-app notification store. Has no
 * visual output.
 */
export default function PushManager() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchNotifications = useNotificationStore((s) => s.fetch);

  useEffect(() => {
    if (!isAuthenticated) {
      // Drop the cached token on sign-out so the next user gets a fresh
      // registration on the same device.
      PushService.clearStoredToken().catch(() => {});
      return;
    }

    let cancelled = false;
    PushService.register().catch(() => {});

    const detach = PushService.attachListeners({
      onReceive: () => {
        if (!cancelled) fetchNotifications().catch(() => {});
      },
      onTap: () => {
        if (!cancelled) fetchNotifications().catch(() => {});
      },
    });

    return () => {
      cancelled = true;
      detach();
    };
  }, [isAuthenticated, fetchNotifications]);

  return null;
}
