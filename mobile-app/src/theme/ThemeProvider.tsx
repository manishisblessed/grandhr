import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LightColors,
  DarkColors,
  ThemeColors,
} from '../constants/theme';

export type AppearanceMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = '@grandhr/appearance-mode';

interface ThemeContextValue {
  /** User's chosen mode — system follows OS, light/dark are explicit overrides. */
  mode: AppearanceMode;
  /** Effective color scheme after resolving `mode` against the OS preference. */
  scheme: 'light' | 'dark';
  /** Active palette for the resolved scheme. */
  colors: ThemeColors;
  /** Persist a new appearance preference. */
  setMode: (mode: AppearanceMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const resolveScheme = (
  mode: AppearanceMode,
  systemScheme: ColorSchemeName,
): 'light' | 'dark' => {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return systemScheme === 'dark' ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<AppearanceMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );
  const [hydrated, setHydrated] = useState(false);

  // Hydrate stored preference on mount.
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (!mounted) return;
        if (v === 'light' || v === 'dark' || v === 'system') {
          setModeState(v);
        }
      })
      .finally(() => mounted && setHydrated(true));
    return () => {
      mounted = false;
    };
  }, []);

  // Track OS-level appearance changes so `system` mode stays in sync.
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const setMode = async (next: AppearanceMode) => {
    setModeState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const value = useMemo<ThemeContextValue>(() => {
    const scheme = resolveScheme(mode, systemScheme);
    return {
      mode,
      scheme,
      colors: scheme === 'dark' ? DarkColors : LightColors,
      setMode,
    };
  }, [mode, systemScheme]);

  // Avoid a flash by waiting for storage hydration before painting children.
  if (!hydrated) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for components rendered outside the provider (e.g. unit tests
    // or legacy entry points). Returns a light-mode snapshot with a no-op
    // setter so callers stay defensive.
    return {
      mode: 'system',
      scheme: 'light',
      colors: LightColors,
      setMode: async () => {},
    };
  }
  return ctx;
}

/** Convenience hook for components that only need the active palette. */
export function useColors(): ThemeColors {
  return useTheme().colors;
}
