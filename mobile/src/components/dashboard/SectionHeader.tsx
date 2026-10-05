import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';

interface Props {
  title: string;
}

export default function SectionHeader({ title }: Props) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.gutter,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
  },
});
