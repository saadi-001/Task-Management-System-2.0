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

export const darkColors: ThemeColors = {
  primary: '#2DD4BF',
  primaryGlow: 'rgba(45, 212, 191, 0.35)',
  background: '#040D12',
  surface: 'rgba(255, 255, 255, 0.04)',
  surfaceHighlight: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#ffffff',
  textSecondary: '#8B949E',
  textMuted: 'rgba(255,255,255,0.5)',
  border: 'rgba(255, 255, 255, 0.07)',
  borderHighlight: 'rgba(45, 212, 191, 0.3)',
  error: '#ff453a',
  errorBg: 'rgba(255, 69, 58, 0.1)',
  success: '#30d158',
  successBg: 'rgba(48, 209, 88, 0.1)',
  iconBg: 'rgba(255, 255, 255, 0.06)',
  glassFill: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.01)'],
  glassGlow: 'rgba(255,255,255,0.03)',
  glassBorder: 'rgba(255,255,255,0.05)',
  stats: {
    purple: { color: '#bf5af2', bg: 'rgba(191, 90, 242, 0.1)' },
    blue: { color: '#0a84ff', bg: 'rgba(10, 132, 255, 0.1)' },
    green: { color: '#30d158', bg: 'rgba(48, 209, 88, 0.1)' },
    orange: { color: '#ff9f0a', bg: 'rgba(255, 159, 10, 0.1)' },
  }
};

export const lightColors: ThemeColors = {
  primary: '#0D9488',
  primaryGlow: 'rgba(13, 148, 136, 0.2)',
  background: '#F0FDF4',
  surface: '#FFFFFF',
  surfaceHighlight: '#F1F3F5',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: 'rgba(17, 24, 39, 0.5)',
  border: 'rgba(0, 0, 0, 0.08)',
  borderHighlight: 'rgba(13, 148, 136, 0.3)',
  error: '#DC2626',
  errorBg: 'rgba(220, 38, 38, 0.1)',
  success: '#16A34A',
  successBg: 'rgba(22, 163, 74, 0.1)',
  iconBg: 'rgba(0, 0, 0, 0.04)',
  glassFill: ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.00)'],
  glassGlow: 'rgba(0,0,0,0.02)',
  glassBorder: 'rgba(0,0,0,0.05)',
  stats: {
    purple: { color: '#9333ea', bg: 'rgba(147, 51, 234, 0.1)' },
    blue: { color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
    green: { color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)' },
    orange: { color: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)' },
  }
};

export const commonTheme = {
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, gutter: 20,
  },
  radius: {
    sm: 10, md: 16, lg: 24, xl: 32, full: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '600' as const, letterSpacing: -0.5 },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 15, lineHeight: 22 },
    caption: { fontSize: 13 },
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
        shadowOpacity: isDark ? 0.4 : 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
      glass: {
        shadowColor: isDark ? '#000000' : '#4B5563',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.5 : 0.1,
        shadowRadius: 24,
        elevation: 10,
      },
    },
  };
};

export type AppTheme = ReturnType<typeof createTheme>;

