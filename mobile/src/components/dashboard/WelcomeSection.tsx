import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { User } from '../../services/authService';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';

interface Props {
  user: User | null;
  onLogout: () => void;
}

export default function WelcomeSection({ user, onLogout }: Props) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.Name || '')}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.welcomeSubtitle}>Welcome Back</Text>
          <Text style={styles.greeting}>{getGreeting()}, {user?.Name?.split(' ')[0] || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Feather name="log-out" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contextContainer}>
        <Text style={styles.contextTitle}>Dashboard</Text>
        <Text style={styles.contextSubtitle}>Manage your teams, projects, and tasks from one place.</Text>
      </View>
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.gutter,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
  },
  welcomeSubtitle: {
    ...theme.typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '600',
  },
  greeting: {
    ...theme.typography.h2,
  },
  logoutBtn: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contextContainer: {
    marginTop: theme.spacing.xs,
  },
  contextTitle: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xs,
  },
  contextSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
