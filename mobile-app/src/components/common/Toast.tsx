import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../constants/theme';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
  durationMs: number;
}

interface ToastContextShape {
  show: (message: string, opts?: { kind?: ToastKind; durationMs?: number }) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  warning: (message: string, durationMs?: number) => void;
}

const noop = () => {};
const ToastContext = createContext<ToastContextShape>({
  show: noop,
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
});

export const useToast = () => useContext(ToastContext);

interface Props {
  children: React.ReactNode;
}

export function ToastProvider({ children }: Props) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const show = useCallback(
    (message: string, opts?: { kind?: ToastKind; durationMs?: number }) => {
      const id = ++idRef.current;
      const item: ToastItem = {
        id,
        message,
        kind: opts?.kind ?? 'info',
        durationMs: opts?.durationMs ?? 2500,
      };
      setItems((prev) => [...prev, item]);
    },
    [],
  );

  const value = useMemo<ToastContextShape>(
    () => ({
      show,
      success: (m, d) => show(m, { kind: 'success', durationMs: d }),
      error: (m, d) => show(m, { kind: 'error', durationMs: d ?? 4000 }),
      info: (m, d) => show(m, { kind: 'info', durationMs: d }),
      warning: (m, d) => show(m, { kind: 'warning', durationMs: d }),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <SafeAreaView
        pointerEvents="box-none"
        style={styles.stack}
        edges={['top']}
      >
        {items.map((item) => (
          <ToastRow key={item.id} item={item} onDismiss={() => remove(item.id)} />
        ))}
      </SafeAreaView>
    </ToastContext.Provider>
  );
}

function ToastRow({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(-16)).current;
  const kindMeta = KIND_META[item.kind];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translate, { toValue: -16, duration: 180, useNativeDriver: true }),
      ]).start(onDismiss);
    }, item.durationMs);
    return () => clearTimeout(t);
  }, [item, opacity, translate, onDismiss]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: kindMeta.bg, opacity, transform: [{ translateY: translate }] },
      ]}
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={kindMeta.icon} size={18} color={kindMeta.iconColor} />
      <Text style={styles.msg} numberOfLines={3}>
        {item.message}
      </Text>
    </Animated.View>
  );
}

const KIND_META: Record<
  ToastKind,
  { bg: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
  success: { bg: '#0F172A', icon: 'checkmark-circle', iconColor: Colors.success },
  error: { bg: '#0F172A', icon: 'alert-circle', iconColor: Colors.error },
  info: { bg: '#0F172A', icon: 'information-circle', iconColor: Colors.info },
  warning: { bg: '#0F172A', icon: 'warning', iconColor: Colors.warning },
};

const styles = StyleSheet.create({
  stack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'android' ? Spacing.md : 0,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    maxWidth: 480,
    minWidth: 220,
    ...Shadow.md,
  },
  msg: { flex: 1, color: '#fff', fontSize: FontSize.sm, fontWeight: '500' },
});
