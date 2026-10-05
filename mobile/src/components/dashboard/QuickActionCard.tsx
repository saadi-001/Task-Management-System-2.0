import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';

interface QuickActionProps {
  title: string;
  iconName: keyof typeof Feather.glyphMap;
  onPress: () => void;
}

export default function QuickActionCard({ title, iconName, onPress }: QuickActionProps) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={theme.colors.glassFill}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.iconContainer}>
          <Feather name={iconName} size={20} color={theme.colors.textPrimary} />
        </View>
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
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '600',
    flex: 1,
    color: theme.colors.textPrimary,
  },
});