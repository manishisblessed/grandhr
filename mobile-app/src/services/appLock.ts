import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { APP_LOCK_KEY } from '../constants/config';
import { Flags } from '../constants/flags';

/**
 * Thin, lazy wrapper around expo-local-authentication. We import the
 * native module dynamically so the app still launches in environments
 * where the module hasn't been linked yet (e.g. Expo Go).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let LAModule: any = null;
function getLA() {
  if (LAModule) return LAModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    LAModule = require('expo-local-authentication');
  } catch {
    LAModule = null;
  }
  return LAModule;
}

export interface BiometricCapabilities {
  hardwareSupported: boolean;
  enrolled: boolean;
  types: string[];
}

export const AppLock = {
  async capabilities(): Promise<BiometricCapabilities> {
    const LA = getLA();
    if (!LA) return { hardwareSupported: false, enrolled: false, types: [] };
    try {
      const [hardware, enrolled, rawTypes] = await Promise.all([
        LA.hasHardwareAsync(),
        LA.isEnrolledAsync(),
        LA.supportedAuthenticationTypesAsync(),
      ]);
      const map: Record<number, string> = {
        1: 'fingerprint',
        2: 'face',
        3: 'iris',
      };
      const types = (rawTypes as number[]).map((t) => map[t] || String(t));
      return { hardwareSupported: Boolean(hardware), enrolled: Boolean(enrolled), types };
    } catch {
      return { hardwareSupported: false, enrolled: false, types: [] };
    }
  },

  async isEnabled(): Promise<boolean> {
    if (Flags.requireAppLock) return true;
    try {
      const v = await SecureStore.getItemAsync(APP_LOCK_KEY);
      return v === '1';
    } catch {
      return false;
    }
  },

  async setEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(APP_LOCK_KEY, enabled ? '1' : '0');
  },

  async authenticate(reason = 'Unlock GrandHR'): Promise<boolean> {
    const LA = getLA();
    if (!LA) return true; // fail-open when the module is unavailable
    try {
      const result = await LA.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use device passcode',
      });
      return Boolean(result?.success);
    } catch {
      return false;
    }
  },
};

/**
 * React hook that exposes the current lock preference and helpers to flip it,
 * used by the Settings screen.
 */
export function useAppLock() {
  const [enabled, setEnabledState] = useState<boolean>(Flags.requireAppLock);
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    hardwareSupported: false,
    enrolled: false,
    types: [],
  });
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const [en, caps] = await Promise.all([AppLock.isEnabled(), AppLock.capabilities()]);
    setEnabledState(en);
    setCapabilities(caps);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setEnabled = useCallback(
    async (next: boolean) => {
      if (next) {
        const ok = await AppLock.authenticate('Enable app lock');
        if (!ok) return false;
      }
      await AppLock.setEnabled(next);
      setEnabledState(next);
      return true;
    },
    [],
  );

  return {
    ready,
    enabled,
    capabilities,
    setEnabled,
    refresh,
    locked: Flags.requireAppLock || enabled,
  };
}
