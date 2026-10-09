export type ThemeColors = {
  primary: string;
  primaryGlow: string;
  background: string;
  surface: string;
  surfaceHighlight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderHighlight: string;
  error: string;
  errorBg: string;
  success: string;
  successBg: string;
  iconBg: string;
  glassFill: [string, string];
  glassGlow: string;
  glassBorder: string;
  stats: {
    purple: { color: string; bg: string };
    blue: { color: string; bg: string };
    green: { color: string; bg: string };
    orange: { color: string; bg: string };
  };
};

// Yomoloko iPhone Feel
export const darkColors: ThemeColors = {
  primary: '#32D74B', // iOS Greenish
  primaryGlow: 'rgba(50, 215, 75, 0.3)',
  background: '#000000', // Pure OLED Black
  surface: '#1C1C1E', // iOS Dark Elevated
  surfaceHighlight: '#2C2C2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93', // iOS Gray
  textMuted: 'rgba(235,235,245,0.3)',
  border: '#38383A',
  borderHighlight: 'rgba(50, 215, 75, 0.4)',
  error: '#FF453A',
  errorBg: 'rgba(255, 69, 58, 0.12)',
  success: '#32D74B',
  successBg: 'rgba(50, 215, 75, 0.12)',
  iconBg: 'rgba(255, 255, 255, 0.08)',
  glassFill: ['rgba(28,28,30,0.7)', 'rgba(28,28,30,0.4)'],
  glassGlow: 'rgba(255,255,255,0.02)',
  glassBorder: 'rgba(255,255,255,0.1)',
  stats: {
    purple: { color: '#BF5AF2', bg: 'rgba(191, 90, 242, 0.12)' },
    blue: { color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.12)' },
    green: { color: '#32D74B', bg: 'rgba(50, 215, 75, 0.12)' },
    orange: { color: '#FF9F0A', bg: 'rgba(255, 159, 10, 0.12)' },
  }
};

export const lightColors: ThemeColors = {
  primary: '#007AFF', // iOS Blue
  primaryGlow: 'rgba(0, 122, 255, 0.2)',
  background: '#F2F2F7', // iOS Light Background
  surface: '#FFFFFF',
  surfaceHighlight: '#F2F2F7',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  textMuted: 'rgba(60, 60, 67, 0.3)',
  border: '#C6C6C8', // iOS Light Border
  borderHighlight: 'rgba(0, 122, 255, 0.3)',
  error: '#FF3B30',
  errorBg: 'rgba(255, 59, 48, 0.1)',
  success: '#34C759',
  successBg: 'rgba(52, 199, 89, 0.1)',
  iconBg: 'rgba(0, 0, 0, 0.05)',
  glassFill: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)'],
  glassGlow: 'rgba(255,255,255,0.5)',
  glassBorder: 'rgba(0,0,0,0.05)',
  stats: {
    purple: { color: '#AF52DE', bg: 'rgba(175, 82, 222, 0.1)' },
    blue: { color: '#007AFF', bg: 'rgba(0, 122, 255, 0.1)' },
    green: { color: '#34C759', bg: 'rgba(52, 199, 89, 0.1)' },
    orange: { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)' },
  }
};

export const commonTheme = {
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 20, xl: 32, gutter: 16,
  },
  radius: {
    sm: 12, md: 18, lg: 24, xl: 32, full: 9999, // iOS typical roundings
  },
  typography: {
    h1: { fontSize: 34, fontWeight: '800' as const, letterSpacing: 0.4 },
    h2: { fontSize: 28, fontWeight: '700' as const, letterSpacing: 0.3 },
    h3: { fontSize: 20, fontWeight: '600' as const, letterSpacing: 0.3 },
    body: { fontSize: 17, lineHeight: 22, letterSpacing: -0.4 }, // iOS Body
    caption: { fontSize: 13, letterSpacing: -0.1 },
  }
};

export const createTheme = (isDark: boolean) => {
  const colors = isDark ? darkColors : lightColors;
  return {
    colors,
    isDark,
    ...commonTheme,
    shadows: {
      neon: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.3 : 0.2,
        shadowRadius: 12,
        elevation: 6,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
      glass: {
        shadowColor: isDark ? '#000000' : '#8E8E93',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDark ? 0.6 : 0.15,
        shadowRadius: 30,
        elevation: 10,
      },
    },
  };
};

export type AppTheme = ReturnType<typeof createTheme>;
