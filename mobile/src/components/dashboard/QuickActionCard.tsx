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
  description?: string;
}

export default function QuickActionCard({ title, iconName, onPress, description }: QuickActionProps) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
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
          <Feather name={iconName} size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {description && <Text style={styles.description} numberOfLines={1}>{description}</Text>}
        </View>
        <View style={styles.arrowContainer}>
          <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  arrowContainer: {
    paddingLeft: 8,
  },
});
