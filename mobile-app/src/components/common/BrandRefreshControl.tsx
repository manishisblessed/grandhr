import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';
import { useColors } from '../../theme/ThemeProvider';

/**
 * Drop-in `<RefreshControl>` styled with the brand palette so the pull-to-
 * refresh indicator matches the rest of the app on both iOS (tint) and
 * Android (colors + progressBackground). Automatically themes for dark mode.
 */
export default function BrandRefreshControl(
  props: Omit<RefreshControlProps, 'tintColor' | 'colors' | 'progressBackgroundColor'>,
) {
  const Colors = useColors();
  return (
    <RefreshControl
      {...props}
      tintColor={Colors.primary}
      colors={[Colors.primary, Colors.accent]}
      progressBackgroundColor={Colors.surface}
    />
  );
}
