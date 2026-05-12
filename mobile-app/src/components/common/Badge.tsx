import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Gradients,
  GradientKey,
} from '../../constants/theme';

type BadgeVariant = 'soft' | 'solid' | 'outline' | 'gradient';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
  variant?: BadgeVariant;
  gradient?: GradientKey | [string, string];
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Badge({
  label,
  color = Colors.primary,
  size = 'md',
  variant = 'soft',
  gradient = 'brand',
  icon,
  style,
}: BadgeProps) {
  const sizeStyle = size === 'sm' ? styles.sm : null;
  const textSizeStyle = size === 'sm' ? styles.smText : null;

  if (variant === 'gradient') {
    const colors = Array.isArray(gradient)
      ? gradient
      : (Gradients[gradient] as readonly string[]);
    return (
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.badge, sizeStyle, style]}
      >
        {icon}
        <Text style={[styles.text, { color: '#fff' }, textSizeStyle]}>
          {label}
        </Text>
      </LinearGradient>
    );
  }

  if (variant === 'solid') {
    return (
      <View
        style={[styles.badge, { backgroundColor: color }, sizeStyle, style]}
      >
        {icon}
        <Text style={[styles.text, { color: '#fff' }, textSizeStyle]}>
          {label}
        </Text>
      </View>
    );
  }

  if (variant === 'outline') {
    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: color + '55',
          },
          sizeStyle,
          style,
        ]}
      >
        {icon}
        <Text style={[styles.text, { color }, textSizeStyle]}>{label}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + '18' },
        sizeStyle,
        style,
      ]}
    >
      {icon}
      <Text style={[styles.text, { color }, textSizeStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  smText: { fontSize: FontSize.xs },
});
