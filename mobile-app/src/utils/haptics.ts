import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Centralised haptic helpers. iOS uses native haptic engine; Android falls back
 * to a subtle vibration via expo-haptics' built-in mapping. All calls are
 * fire-and-forget — failures (older devices, no haptic engine) are swallowed
 * so screens never need to await or try/catch them.
 */

const safe = (p: Promise<unknown>) => {
  p.catch(() => {});
};

export const Haptic = {
  /** Subtle tap — use for general button presses, switch toggles. */
  light() {
    safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  },
  /** Standard tap — use for primary actions (CTA, list-item open). */
  medium() {
    safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  },
  /** Strong tap — use for destructive confirms or important actions. */
  heavy() {
    safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
  },
  /** Tick — use when a value changes (filter selected, segment switched). */
  selection() {
    safe(Haptics.selectionAsync());
  },
  /** Success notification haptic — use on save / approve / clock-in success. */
  success() {
    safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  },
  /** Warning notification haptic — use on validation errors / soft warnings. */
  warning() {
    safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
  },
  /** Error notification haptic — use on hard failures / rejections. */
  error() {
    safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
  },
  /** Disabled on web; passthrough for everything else. */
  isEnabled() {
    return Platform.OS !== 'web';
  },
};
