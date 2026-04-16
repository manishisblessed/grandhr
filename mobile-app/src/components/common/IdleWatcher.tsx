import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, View, PanResponder, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { LAST_ACTIVE_KEY } from '../../constants/config';
import { Flags } from '../../constants/flags';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  children: React.ReactNode;
}

/**
 * Watches global touch activity and AppState. If the user has been idle for
 * `Flags.idleLogoutMinutes`, signs them out silently on the next tick.
 *
 * Uses a PanResponder that does NOT capture gestures (onStartShouldSet returns
 * false) so the UI underneath still receives every touch normally.
 */
export default function IdleWatcher({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const signOut = useAuthStore((s) => s.signOut);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const bump = () => {
    lastActivityRef.current = Date.now();
    // persist so backgrounding + resuming still respects the timeout.
    SecureStore.setItemAsync(LAST_ACTIVE_KEY, String(lastActivityRef.current)).catch(() => {});
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        bump();
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        bump();
        return false;
      },
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => false,
    }),
  ).current;

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    lastActivityRef.current = Date.now();
    const limitMs = Flags.idleLogoutMinutes * 60 * 1000;

    const tick = async () => {
      const stored = await SecureStore.getItemAsync(LAST_ACTIVE_KEY);
      const lastActive = stored ? Number(stored) || lastActivityRef.current : lastActivityRef.current;
      if (Date.now() - lastActive >= limitMs) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        await signOut({ silent: true });
      }
    };

    timerRef.current = setInterval(tick, 30 * 1000);

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') tick();
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      sub.remove();
    };
  }, [isAuthenticated, signOut]);

  return (
    <View style={styles.flex} {...panResponder.panHandlers} collapsable={false}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
