import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { FontSize, Spacing, ThemeColors } from '../../constants/theme';
import { useColors } from '../../theme/ThemeProvider';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  showLegend?: boolean;
}

export default function Donut({
  segments,
  size = 160,
  thickness = 16,
  centerLabel,
  centerValue,
  showLegend = true,
}: DonutProps) {
  const Colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const fraction = seg.value / total;
    const length = circumference * fraction;
    const offset = circumference - length;
    const rotation = (cumulative / total) * 360 - 90;
    cumulative += seg.value;
    return { seg, length, offset, rotation };
  });

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <G>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.borderLight}
              strokeWidth={thickness}
              fill="none"
            />
            {arcs.map((a, i) => (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={a.seg.color}
                strokeWidth={thickness}
                fill="none"
                strokeDasharray={`${a.length} ${circumference}`}
                strokeLinecap="round"
                transform={`rotate(${a.rotation} ${size / 2} ${size / 2})`}
              />
            ))}
          </G>
        </Svg>
        {(centerLabel || centerValue) && (
          <View
            style={[
              styles.center,
              { width: size, height: size, top: 0, left: 0 },
            ]}
            pointerEvents="none"
          >
            {centerValue ? (
              <Text style={styles.centerValue}>{centerValue}</Text>
            ) : null}
            {centerLabel ? (
              <Text style={styles.centerLabel}>{centerLabel}</Text>
            ) : null}
          </View>
        )}
      </View>

      {showLegend && (
        <View style={styles.legend}>
          {segments.map((s) => {
            const pct = ((s.value / total) * 100).toFixed(0);
            return (
              <View key={s.label} style={styles.legendRow}>
                <View
                  style={[styles.legendDot, { backgroundColor: s.color }]}
                />
                <Text style={styles.legendName}>{s.label}</Text>
                <Text style={styles.legendValue}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  wrap: { gap: Spacing.md, alignItems: 'center' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  centerValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  centerLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  legend: { width: '100%', gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  legendValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
});
