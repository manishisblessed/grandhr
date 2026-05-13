import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppLock } from '../../services/appLock';
import { useAuthStore } from '../../store/useAuthStore';
import { FontSize, Spacing, BorderRadius, ThemeColors } from '../../constants/theme';
import { useColors } from '../../theme/ThemeProvider';
import { useThemedStyles } from '../../hooks/useThemedStyles';

/**
 * Renders a full-screen overlay that blurs/hides app content whenever the app
 * returns to foreground and a user-enabled (or build-forced) biometric lock
 * hasn't been satisfied this session.
 *
 * Expected to only be mounted inside the authenticated tree (see AppNavigator).
 */
export default function AppLockGate() {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const signOut = useAuthStore((s) => s.signOut);
  const [locked, setLocked] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentState = useRef<AppStateStatus>(AppState.currentState);

  const maybeLock = async () => {
    const enabled = await AppLock.isEnabled();
    if (enabled) {
      setLocked(true);
      setError(null);
      // auto-prompt once; user can retry via button
      tryUnlock();
    }
  };

  const tryUnlock = async () => {
    setAuthenticating(true);
    setError(null);
    try {
      const ok = await AppLock.authenticate('Unlock GrandHR');
      if (ok) {
        setLocked(false);
      } else {
        setError('Authentication failed');
      }
    } catch {
      setError('Authentication error');
    } finally {
      setAuthenticating(false);
    }
  };

  useEffect(() => {
    // lock on mount (enter authenticated tree)
    maybeLock();

    const sub = AppState.addEventListener('change', (next) => {
      const prev = currentState.current;
      currentState.current = next;
      // Lock when returning from background/inactive to active
      if (
        (prev === 'background' || prev === 'inactive') &&
        next === 'active'
      ) {
        maybeLock();
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!locked) return null;

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons
            name={Platform.OS === 'ios' ? 'finger-print' : 'lock-closed'}
            size={48}
            color={Colors.primary}
          />
        </View>
        <Text style={styles.title}>GrandHR is locked</Text>
        <Text style={styles.subtitle}>
          Authenticate to access your HR workspace.
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity
          style={styles.primary}
          onPress={tryUnlock}
          disabled={authenticating}
        >
          <Text style={styles.primaryText}>
            {authenticating ? 'Waiting...' : 'Unlock'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghost} onPress={() => signOut()}>
          <Text style={styles.ghostText}>Sign out instead</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  card: {
    width: '86%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  iconWrap: { marginBottom: Spacing.lg },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  primary: {
    alignSelf: 'stretch',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: FontSize.md },
  ghost: { paddingVertical: Spacing.sm },
  ghostText: { color: Colors.textSecondary, fontWeight: '500', fontSize: FontSize.sm },
});
