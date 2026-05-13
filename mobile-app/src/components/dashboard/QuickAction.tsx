import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BorderRadius,
  FontSize,
  Spacing,
  Gradients,
  GradientKey,
  ThemeColors,
} from '../../constants/theme';
import { useColors } from '../../theme/ThemeProvider';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Haptic } from '../../utils/haptics';

interface QuickActionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  gradient?: GradientKey | [string, string];
  onPress: () => void;
  description?: string;
  variant?: 'tile' | 'card';
}

export default function QuickAction({
  title,
  icon,
  color,
  gradient,
  onPress,
  description,
  variant = 'tile',
}: QuickActionProps) {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const resolvedColor = color ?? Colors.primary;
  const handlePress = () => {
    Haptic.light();
    onPress();
  };
  const gradientColors = gradient
    ? Array.isArray(gradient)
      ? gradient
      : (Gradients[gradient] as readonly string[])
    : null;

  const iconBlock = gradientColors ? (
    <LinearGradient
      colors={gradientColors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.iconWrap, styles.iconShadow]}
    >
      <Ionicons name={icon} size={20} color="#fff" />
    </LinearGradient>
  ) : (
    <View style={[styles.iconWrap, { backgroundColor: resolvedColor + '18' }]}>
      <Ionicons name={icon} size={20} color={resolvedColor} />
    </View>
  );

  if (variant === 'card') {
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {iconBlock}
        <Text style={styles.cardTitle}>{title}</Text>
        {description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <View style={styles.arrow}>
          <Ionicons
            name="arrow-forward"
            size={14}
            color={Colors.textTertiary}
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.tileContainer}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {iconBlock}
      <Text style={styles.tileLabel} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  tileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
    minHeight: 92,
  },
  tileLabel: {
    fontSize: FontSize.xs,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
    minHeight: 120,
    minWidth: 150,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  cardDescription: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  arrow: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
});
