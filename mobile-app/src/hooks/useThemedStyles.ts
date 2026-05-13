import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeProvider';
import type { ThemeColors } from '../constants/theme';

/**
 * Build a StyleSheet that automatically rebuilds when the active theme palette
 * changes. The factory receives the resolved `ThemeColors` and is expected to
 * return a `StyleSheet.create(...)` result.
 *
 * Usage:
 *   const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
 *     container: { backgroundColor: Colors.background },
 *   });
 *   // inside component:
 *   const styles = useThemedStyles(makeStyles);
 *
 * Note on naming: the parameter is intentionally named `Colors` so existing
 * StyleSheet bodies that reference `Colors.x` keep compiling unchanged after
 * removing the top-level `Colors` import.
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: ThemeColors) => T,
): T {
  const colors = useColors();
  return useMemo(() => factory(colors), [colors, factory]);
}
