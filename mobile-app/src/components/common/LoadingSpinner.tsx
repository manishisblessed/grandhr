import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Colors,
  FontSize,
  Spacing,
  Gradients,
  BorderRadius,
  Shadow,
} from '../../constants/theme';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  /** Pixel size of the rotating brand ring. Defaults to 56. */
  size?: number;
}

/**
 * Brand-themed loader: a rotating gradient ring with a soft pulsing core.
 * Replaces the default ActivityIndicator for a more on-brand loading state.
 */
export default function LoadingSpinner({
  message,
  fullScreen = true,
  size = 56,
}: LoadingSpinnerProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [spin, pulse]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.05],
  });
  const coreSize = size * 0.55;

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={[styles.ringWrap, { width: size, height: size }]}>
        <Animated.View
          style={[
            styles.ringSpinner,
            { width: size, height: size, borderRadius: size / 2 },
            { transform: [{ rotate }] },
          ]}
        >
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.ringFill,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          />
          {/* Notch in the ring creates the "spinner" arc effect. */}
          <View
            style={[
              styles.ringNotch,
              {
                width: size * 0.55,
                height: size * 0.55,
                top: -size * 0.06,
                right: -size * 0.06,
                backgroundColor: fullScreen
                  ? Colors.background
                  : Colors.surface,
              },
            ]}
          />
          {/* Center hole punches the donut. */}
          <View
            style={[
              styles.ringHole,
              {
                width: size * 0.7,
                height: size * 0.7,
                borderRadius: (size * 0.7) / 2,
                backgroundColor: fullScreen
                  ? Colors.background
                  : Colors.surface,
              },
            ]}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.core,
            {
              width: coreSize,
              height: coreSize,
              borderRadius: coreSize / 2,
              transform: [{ scale }],
            },
            Shadow.brand,
          ]}
        >
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              StyleSheet.absoluteFillObject,
              { borderRadius: coreSize / 2, opacity: 0.18 },
            ]}
          />
        </Animated.View>
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  fullScreen: { flex: 1, backgroundColor: Colors.background },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSpinner: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringFill: { position: 'absolute', top: 0, left: 0 },
  ringNotch: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
  },
  ringHole: {
    position: 'absolute',
  },
  core: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  message: {
    marginTop: Spacing.lg,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
