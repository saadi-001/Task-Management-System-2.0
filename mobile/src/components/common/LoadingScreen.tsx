import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';

interface Props { message?: string; }

export default function LoadingScreen({ message = 'INITIALIZING...' }: Props) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['rgba(99, 102, 241, 0.05)', 'transparent']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, { opacity: pulseAnim, transform: [{ scale: pulseAnim }] }]} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  glow: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20, marginBottom: 32 },
  text: { ...theme.typography.caption, color: theme.colors.primary, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
});
