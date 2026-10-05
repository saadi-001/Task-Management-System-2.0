import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Animated } from 'react-native';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export default function AppInput({ label, error, style, ...rest }: Props) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const [isFocused, setIsFocused] = useState(false);
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    rest.onFocus && rest.onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    rest.onBlur && rest.onBlur(e);
  };

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.borderHighlight]
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.inputWrapper, { borderColor: error ? theme.colors.error : borderColor }]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
});