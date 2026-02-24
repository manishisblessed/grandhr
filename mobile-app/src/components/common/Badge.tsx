import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontSize, Spacing, BorderRadius } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export default function Badge({ label, color, size = 'md' }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + '18' },
        size === 'sm' && styles.sm,
      ]}
    >
      <Text style={[styles.text, { color }, size === 'sm' && styles.smText]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
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
    textTransform: 'capitalize',
  },
  smText: { fontSize: FontSize.xs },
});
