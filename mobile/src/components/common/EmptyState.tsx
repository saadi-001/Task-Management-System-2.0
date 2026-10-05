import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  iconName?: keyof typeof Feather.glyphMap;
}

export default function EmptyState({ title, subtitle, iconName = 'inbox' }: Props) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <Feather name={iconName} size={48} color={theme.colors.textSecondary} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  icon: {
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
