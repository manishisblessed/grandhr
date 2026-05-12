import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  showDots?: boolean;
}

export default function Sparkline({
  data,
  width = 280,
  height = 60,
  stroke = '#7C3AED',
  fill,
  showDots = false,
}: SparklineProps) {
  if (!data.length) return <View style={{ width, height }} />;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const padY = 6;
  const innerH = height - padY * 2;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = padY + innerH - ((v - min) / range) * innerH;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const areaPath =
    `${linePath} L ${(points[points.length - 1].x).toFixed(2)} ${height} ` +
    `L 0 ${height} Z`;

  const gradId = `spark-grad-${Math.random().toString(36).slice(2, 8)}`;
  const fillColor = fill || stroke;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={fillColor} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={fillColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill={`url(#${gradId})`} />
        <Path
          d={linePath}
          stroke={stroke}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showDots &&
          points.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={3} fill={stroke} />
          ))}
      </Svg>
    </View>
  );
}
