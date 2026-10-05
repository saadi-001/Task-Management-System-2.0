import React, { useRef } from 'react';
import { Text, StyleSheet, ActivityIndicator, TouchableWithoutFeedback, Animated, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';

interface Props {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export default function AppButton({ title, loading = false, variant = 'primary', disabled, style, onPress }: Props) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();
  };

  const isPrimary = variant === 'primary' && !disabled;
  const isSecondary = variant === 'secondary' && !disabled;
  const isDanger = variant === 'danger' && !disabled;

  return (
    <TouchableWithoutFeedback 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut} 
      onPress={disabled || loading ? undefined : onPress}
    >
      <Animated.View
        style={[
          styles.button,
          disabled && styles.disabledBorder,
          isSecondary && styles.secondaryBorder,
          isDanger && styles.dangerBorder,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        {isPrimary && (
          <LinearGradient
            colors={[theme.colors.primary, '#4f46e5']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        )}
        {isDanger && (
          <LinearGradient
            colors={[theme.colors.error, '#d32f2f']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        )}
        {(isSecondary || disabled) && (
          <LinearGradient
            colors={theme.colors.glassFill}
            style={StyleSheet.absoluteFill}
          />
        )}

        {loading ? (
          <ActivityIndicator color={isSecondary ? theme.colors.textPrimary : '#ffffff'} />
        ) : (
          <Text style={[
            styles.text, 
            isSecondary && { color: theme.colors.textPrimary },
            disabled && { color: theme.colors.textSecondary }
          ]}>
            {title}
          </Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  button: {
    height: 56,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  secondaryBorder: {
    borderColor: theme.colors.border,
  },
  dangerBorder: {
    borderColor: theme.colors.error,
  },
  disabledBorder: {
    borderColor: theme.colors.glassBorder,
  },
  text: {
    ...theme.typography.body,
    fontWeight: '700',
    fontSize: 16,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
});
