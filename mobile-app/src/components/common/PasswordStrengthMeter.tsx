import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import {
  passwordIssues,
  passwordStrength,
  PASSWORD_MIN_LENGTH,
} from '../../utils/password';

interface Props {
  value: string;
}

const levelMeta: Record<
  ReturnType<typeof passwordStrength>,
  { label: string; color: string; fill: number }
> = {
  empty: { label: '', color: Colors.border, fill: 0 },
  weak: { label: 'Weak', color: Colors.error, fill: 0.33 },
  fair: { label: 'Fair', color: Colors.warning, fill: 0.66 },
  strong: { label: 'Strong', color: Colors.success, fill: 1 },
};

export default function PasswordStrengthMeter({ value }: Props) {
  if (!value) return null;
  const strength = passwordStrength(value);
  const meta = levelMeta[strength];
  const issues = passwordIssues(value);

  const remaining: string[] = [];
  if (issues.tooShort) remaining.push(`${PASSWORD_MIN_LENGTH}+ chars`);
  if (issues.missingUpper) remaining.push('uppercase');
  if (issues.missingLower) remaining.push('lowercase');
  if (issues.missingDigit) remaining.push('digit');
  if (issues.missingSymbol) remaining.push('symbol');

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <View
          style={[styles.fill, { width: `${meta.fill * 100}%`, backgroundColor: meta.color }]}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
        {remaining.length > 0 && (
          <Text style={styles.hint}>Need: {remaining.join(', ')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: -Spacing.md, marginBottom: Spacing.md },
  bar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: BorderRadius.full },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  label: { fontSize: FontSize.xs, fontWeight: '600' },
  hint: { fontSize: FontSize.xs, color: Colors.textTertiary, flex: 1, textAlign: 'right' },
});
