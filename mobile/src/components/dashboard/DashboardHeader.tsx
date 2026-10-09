
import { View, Text, StyleSheet, Animated, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAlert } from '../../context/AlertContext';
import { AppTheme } from '../../constants/theme';

interface Props {
  userName?: string;
  role?: string;
}

export default function DashboardHeader({ userName = 'Agent', role = 'Member' }: Props) {
  const { showAlert } = useAlert();
  const navigation = useNavigation<any>();
  const { theme, themeOption, setThemeOption } = useThemeContext();
  const { logout } = useAuth();
  const styles = getStyles(theme);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadNotifications = async () => {
        try {
          const res = await notificationService.getNotifications();
          if (res && res.success) {
            const count = res.data.filter((n: any) => !n.IsRead).length;
            setUnreadCount(count);
          }
        } catch(e) {}
      };
      loadNotifications();
    }, [])
  );


  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true })
    ]).start();

    // Pulse animation for the notification badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

  const handleLogoutClick = () => {
    showAlert({
      title: 'Logout',
      message: 'Are you sure you want to exit your session?',
      type: 'warning',
      cancelText: 'Cancel',
      confirmText: 'Logout',
      onConfirm: logout
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <LinearGradient
        colors={[theme.colors.primaryGlow, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <View style={styles.content}>
        {/* Left Side: Avatar & Info */}
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.8} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatarGlow} />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(userName)}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name} numberOfLines={1}>{userName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Right Side: Theme & Notification */}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity 
            style={[styles.bellButton, { marginRight: 8 }]} 
            activeOpacity={0.7} 
            onPress={() => setThemeOption(themeOption === 'futuristic' ? 'system' : 'futuristic')}
          >
            <Feather name="zap" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bellButton} 
          activeOpacity={0.7} 
          onPress={() => navigation.navigate('Notifications')}
        >
          <Feather name="bell" size={22} color={theme.colors.textPrimary} />
          
          {/* Unseen Indication (Badge or Pulsing Dot) */}
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.5], outputRange: [0.5, 0] }) }]} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 25,
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
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    width: 54,
    height: 54,
    marginRight: 16,
  },
  avatarGlow: {
    position: 'absolute',
    top: -6, left: -6, right: -6, bottom: -6,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryGlow,
  },
  avatar: {
    width: 54, height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: theme.colors.surface,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: theme.colors.iconBg,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: theme.colors.border,
  },
  roleText: {
    fontSize: 9, fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  
  bellButton: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.iconBg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -2, right: -2,
    justifyContent: 'center', alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 24, height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    opacity: 0.3,
  },
  badge: {
    backgroundColor: theme.colors.error,
    minWidth: 18, height: 18,
    borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: theme.colors.surface,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff', fontSize: 10, fontWeight: 'bold'
  }
});


