import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BorderRadius,
  FontSize,
  Spacing,
  Shadow,
  Gradients,
  GradientKey,
  ThemeColors,
} from '../../constants/theme';
import { useColors } from '../../theme/ThemeProvider';
import { useThemedStyles } from '../../hooks/useThemedStyles';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  gradient?: GradientKey | [string, string];
  subtitle?: string;
  progress?: number;
  delta?: string;
  style?: StyleProp<ViewStyle>;
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  gradient,
  subtitle,
  progress,
  delta,
  style,
}: StatCardProps) {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const resolvedColor = color ?? Colors.primary;
  const gradientColors = gradient
    ? Array.isArray(gradient)
      ? gradient
      : (Gradients[gradient] as readonly string[])
    : null;

  return (
    <View style={[styles.card, Shadow.sm, style]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
          {(subtitle || delta) && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle || delta}
            </Text>
          )}
        </View>

        {gradientColors ? (
          <LinearGradient
            colors={gradientColors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name={icon} size={20} color="#fff" />
          </LinearGradient>
        ) : (
          <View style={[styles.iconWrap, { backgroundColor: resolvedColor + '18' }]}>
            <Ionicons name={icon} size={20} color={resolvedColor} />
          </View>
        )}
      </View>

      {typeof progress === 'number' && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(0, Math.min(100, progress))}%`,
                backgroundColor: gradientColors
                  ? (gradientColors[0] as string)
                  : resolvedColor,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minWidth: 140,
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: { flex: 1, paddingRight: Spacing.sm },
  title: {
    fontSize: 10,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
