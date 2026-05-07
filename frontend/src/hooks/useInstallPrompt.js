import { useCallback, useEffect, useState } from 'react';
import {
  getInstallPromptAvailable,
  isStandalone,
  onInstallAvailableChange,
  promptInstall,
} from '../lib/pwa';

/**
 * Surfaces the deferred `beforeinstallprompt` event so the UI can render a
 * branded "Install app" button. On iOS (where this event isn't supported) the
 * caller can read `iosInstallHint` and show the manual "Share → Add to home
 * screen" instructions instead.
 */
export function useInstallPrompt() {
  const [available, setAvailable] = useState(getInstallPromptAvailable());
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const off = onInstallAvailableChange((isAvailable) => setAvailable(isAvailable));
    const onAppInstalled = () => setInstalled(true);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      off();
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    const choice = await promptInstall();
    return choice;
  }, []);

  const isIOS = typeof navigator !== 'undefined' && /iP(hone|od|ad)/.test(navigator.userAgent);

  return {
    available,
    installed,
    install,
    iosInstallHint: isIOS && !installed,
  };
}
