import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Colors,
  BorderRadius,
  FontSize,
  Spacing,
  Shadow,
  Gradients,
  GradientKey,
} from '../../constants/theme';
import { Haptic } from '../../utils/haptics';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'gradient';

type HapticIntensity = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'none';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  gradient?: GradientKey | [string, string];
  fullWidth?: boolean;
  /** Override haptic feedback. Defaults: gradient/primary/danger=medium, others=light. */
  haptic?: HapticIntensity;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  gradient = 'brand',
  fullWidth,
  haptic,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isGradient = variant === 'gradient';

  const handlePress = () => {
    const intensity: HapticIntensity =
      haptic ??
      (variant === 'gradient' || variant === 'primary' || variant === 'danger'
        ? 'medium'
        : 'light');
    if (intensity !== 'none') Haptic[intensity]();
    onPress();
  };

  const innerContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? Colors.primary
              : '#fff'
          }
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}` as keyof typeof styles] as TextStyle,
              styles[`textSize_${size}`],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </>
  );

  const sizeStyle = styles[`size_${size}`];
  const baseStyle: ViewStyle[] = [
    styles.base,
    sizeStyle,
    fullWidth ? styles.fullWidth : undefined,
    isDisabled ? styles.disabled : undefined,
    style,
  ].filter(Boolean) as ViewStyle[];

  if (isGradient) {
    const colors = Array.isArray(gradient)
      ? gradient
      : (Gradients[gradient] as readonly string[]);
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[Shadow.brand, fullWidth ? { width: '100%' } : null]}
      >
        <LinearGradient
          colors={colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={baseStyle}
        >
          <View style={styles.row}>{innerContent}</View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        ...baseStyle,
        styles[variant as keyof typeof styles] as ViewStyle,
      ]}
    >
      {innerContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fullWidth: { width: '100%' },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.secondary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.error },
  gradient: {},
  disabled: { opacity: 0.5 },
  size_sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  size_md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
  size_lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl },
  text: { fontWeight: '600' },
  text_primary: { color: '#fff' },
  text_secondary: { color: '#fff' },
  text_outline: { color: Colors.text },
  text_ghost: { color: Colors.primary },
  text_danger: { color: '#fff' },
  text_gradient: { color: '#fff' },
  textSize_sm: { fontSize: FontSize.sm },
  textSize_md: { fontSize: FontSize.md },
  textSize_lg: { fontSize: FontSize.lg },
});
