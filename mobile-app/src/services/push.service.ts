import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const PUSH_TOKEN_KEY = 'grandhr_expo_push_token';
const PUSH_REGISTERED_AT_KEY = 'grandhr_push_registered_at';
// re-register at most once a week to keep the server view fresh.
const RE_REGISTER_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as any),
});

export interface PushRegistrationResult {
  token: string | null;
  granted: boolean;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#7C3AED',
  });
}

async function getProjectId(): Promise<string | undefined> {
  return (
    (Constants.expoConfig?.extra as any)?.eas?.projectId ||
    (Constants as any)?.easConfig?.projectId ||
    undefined
  );
}

async function postTokenToServer(token: string) {
  try {
    await api.post('/notifications/push-token', {
      token,
      platform: Platform.OS,
      device: Device.modelName || 'unknown',
    });
    await AsyncStorage.setItem(PUSH_REGISTERED_AT_KEY, String(Date.now()));
  } catch {
    // best-effort: backend may not implement this yet
  }
}

export const PushService = {
  /**
   * Idempotently register the device for push. Safe to call on every
   * authenticated app launch.
   */
  async register(): Promise<PushRegistrationResult> {
    if (!Device.isDevice) return { token: null, granted: false };

    await ensureAndroidChannel();

    const settings = await Notifications.getPermissionsAsync();
    let status = settings.status;
    if (status !== 'granted') {
      const ask = await Notifications.requestPermissionsAsync();
      status = ask.status;
    }
    if (status !== 'granted') return { token: null, granted: false };

    const projectId = await getProjectId();
    let token: string | null = null;
    try {
      const tokenRes = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      token = tokenRes.data;
    } catch {
      return { token: null, granted: true };
    }

    const cached = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    const lastRegistered = Number(
      (await AsyncStorage.getItem(PUSH_REGISTERED_AT_KEY)) || 0,
    );
    const stale = Date.now() - lastRegistered > RE_REGISTER_INTERVAL_MS;

    if (token && (cached !== token || stale)) {
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      await postTokenToServer(token);
    }

    return { token, granted: true };
  },

  /**
   * Subscribe to incoming notifications while the app is in the foreground
   * and to taps that open the app from a notification. Returns a single
   * unsubscribe function.
   */
  attachListeners(opts: {
    onReceive?: (n: Notifications.Notification) => void;
    onTap?: (r: Notifications.NotificationResponse) => void;
  }) {
    const sub1 = opts.onReceive
      ? Notifications.addNotificationReceivedListener(opts.onReceive)
      : null;
    const sub2 = opts.onTap
      ? Notifications.addNotificationResponseReceivedListener(opts.onTap)
      : null;
    return () => {
      sub1?.remove();
      sub2?.remove();
    };
  },

  async clearStoredToken() {
    await AsyncStorage.multiRemove([PUSH_TOKEN_KEY, PUSH_REGISTERED_AT_KEY]);
  },
};
