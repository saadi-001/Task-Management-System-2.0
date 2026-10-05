import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';
import AppButton from './AppButton';

interface Props { message: string; onRetry?: () => void; }

export default function ErrorState({ message, onRetry }: Props) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Feather name="alert-triangle" size={48} color={theme.colors.error} style={{ marginBottom: 16 }} />
        <Text style={styles.title}>SYSTEM FAULT</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <AppButton title="REBOOT PROCESS" variant="danger" onPress={onRetry} style={{ marginTop: 24, minWidth: 200 }} />
        )}
      </Animated.View>
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, padding: 32 },
  content: { alignItems: 'center', backgroundColor: theme.colors.surface, padding: 32, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.errorBg, width: '100%' },
  title: { ...theme.typography.h3, color: theme.colors.error, letterSpacing: 2, marginBottom: 8 },
  message: { ...theme.typography.body, color: theme.colors.textMuted, textAlign: 'center' },
});