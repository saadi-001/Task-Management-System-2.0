import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';

interface StatCardProps {
  onPress?: () => void;
  title: string;
  value: number | string | null;
  iconName: keyof typeof Feather.glyphMap;
  colorTheme: { bg: string; color: string };
}

export default function StatCard({ title, value, iconName, colorTheme, onPress }: StatCardProps) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();
  };

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={theme.colors.glassFill}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.glow} />
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colorTheme.bg }]}>
            <Feather name={iconName} size={20} color={colorTheme.color} />
          </View>
        </View>
        <Text style={styles.value} numberOfLines={1}>{value !== null ? value : '-'}</Text>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{title}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.glassGlow,
    transform: [{ scale: 2 }],
  },
  header: { marginBottom: theme.spacing.md },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  value: { ...theme.typography.h1, fontSize: 34, marginBottom: 2, color: theme.colors.textPrimary },
  title: { ...theme.typography.caption, fontSize: 13, fontWeight: '600', letterSpacing: 1, color: theme.colors.textMuted, textTransform: 'uppercase' },
});
