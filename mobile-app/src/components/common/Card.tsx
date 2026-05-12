import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Colors,
  BorderRadius,
  Spacing,
  Shadow,
  Gradients,
  GradientKey,
} from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outline' | 'ghost';
  padding?: keyof typeof Spacing | 'none';
  gradient?: GradientKey | [string, string] | [string, string, string];
}

export default function Card({
  children,
  style,
  variant = 'default',
  padding = 'lg',
  gradient,
}: CardProps) {
  const paddingValue = padding === 'none' ? 0 : Spacing[padding];

  const baseStyle: StyleProp<ViewStyle> = [
    styles.card,
    { padding: paddingValue },
    variant === 'elevated' && Shadow.md,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    style,
  ];

  if (gradient) {
    const colors = Array.isArray(gradient)
      ? gradient
      : (Gradients[gradient] as readonly string[]);
    return (
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={baseStyle}
      >
        {children}
      </LinearGradient>
    );
  }

  return <View style={baseStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});
