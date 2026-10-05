import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';

interface Props {
  userName?: string;
  role?: string;
}

export default function DashboardHeader({ userName = 'Agent', role = 'Member' }: Props) {
  const navigation = useNavigation<any>();
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true })
    ]).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <LinearGradient
        colors={[theme.colors.primaryGlow, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name} numberOfLines={1}>{userName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role.toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.7} onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatarGlow} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(userName)}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 20,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.glass,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  name: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: theme.colors.iconBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  avatarContainer: {
    position: 'relative',
    width: 60,
    height: 60,
  },
  avatarGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryGlow,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  avatarText: {
    color: '#ffffff', // Avatar text stays white for contrast inside primary colored circle
    fontSize: 24,
    fontWeight: '700',
  }
});


