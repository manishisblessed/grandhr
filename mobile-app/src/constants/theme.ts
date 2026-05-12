export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  accent: string;

  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceVariant: string;
  surfaceMuted: string;
  border: string;
  borderLight: string;

  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  skeleton: string;
  whatsapp: string;
}

export const LightColors: ThemeColors = {
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  secondary: '#6366F1',
  secondaryLight: '#A5B4FC',
  accent: '#EC4899',

  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  background: '#F8FAFC',
  backgroundAlt: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceVariant: '#F8FAFC',
  surfaceMuted: '#F5F3FF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  skeleton: '#E2E8F0',
  whatsapp: '#25D366',
};

// Dark-mode tokens. Brand hues stay vivid; surfaces shift to deep slate;
// text/border get high-contrast equivalents. Used by ThemeProvider.
export const DarkColors: ThemeColors = {
  primary: '#A78BFA',
  primaryLight: '#C4B5FD',
  primaryDark: '#7C3AED',
  secondary: '#818CF8',
  secondaryLight: '#A5B4FC',
  accent: '#F472B6',

  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  error: '#F87171',
  errorLight: '#7F1D1D',
  info: '#60A5FA',
  infoLight: '#1E3A8A',

  background: '#0B1020',
  backgroundAlt: '#0F172A',
  surface: '#111827',
  surfaceVariant: '#1F2937',
  surfaceMuted: '#1A1730',
  border: '#1F2937',
  borderLight: '#111827',

  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',

  skeleton: '#1F2937',
  whatsapp: '#25D366',
};

// Default `Colors` export remains the light palette so static StyleSheets keep
// rendering. Components that need dark mode opt in via `useColors()`.
export const Colors: ThemeColors = LightColors;

// Gradient pairs that mirror the web `from-x-500 to-y-500` Tailwind palette.
export const Gradients = {
  primary: ['#8B5CF6', '#6366F1'] as [string, string],
  brand: ['#7C3AED', '#EC4899'] as [string, string],
  hero: ['#EDE9FE', '#FFFFFF', '#FCE7F3'] as [string, string, string],
  violetIndigo: ['#8B5CF6', '#6366F1'] as [string, string],
  emeraldTeal: ['#10B981', '#14B8A6'] as [string, string],
  amberOrange: ['#F59E0B', '#F97316'] as [string, string],
  pinkRose: ['#EC4899', '#F43F5E'] as [string, string],
  violetIndigoSoft: ['#A78BFA', '#818CF8'] as [string, string],
  cyanSky: ['#06B6D4', '#0EA5E9'] as [string, string],
  redOrange: ['#EF4444', '#F97316'] as [string, string],
} as const;

export type GradientKey = keyof typeof Gradients;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  full: 999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  brand: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
