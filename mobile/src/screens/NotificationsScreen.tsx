import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import { notificationService, Notification } from '../services/notificationService';
import LoadingScreen from '../components/common/LoadingScreen';

export default function NotificationsScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res && res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.log('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, IsRead: true })));
    } catch (err) {
      console.log('Failed to mark all as read');
    }
  };

  const handleNotificationPress = async (item: Notification) => {
    if (!item.IsRead) {
      try {
        await notificationService.markAsRead(item.NotificationID);
        setNotifications(prev => prev.map(n => n.NotificationID === item.NotificationID ? { ...n, IsRead: true } : n));
      } catch (err) {}
    }

    if (item.EntityType === 'TICKET' && item.EntityID) {
      navigation.navigate('TicketDetails', { ticketId: item.EntityID });
    } else if (item.EntityType === 'PROJECT' && item.EntityID) {
      navigation.navigate('ProjectDetails', { projectId: item.EntityID });
    } else if (item.EntityType === 'ORGANIZATION' && item.EntityID) {
      navigation.navigate('OrganizationDetails', { organizationId: item.EntityID });
    }
  };

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'TICKET_ASSIGNED': return { name: 'user-plus', color: theme.colors.stats.purple.color, bg: theme.colors.stats.purple.bg };
      case 'TICKET_STATUS_CHANGED': return { name: 'activity', color: theme.colors.stats.blue.color, bg: theme.colors.stats.blue.bg };
      case 'PROJECT_ASSIGNED': return { name: 'folder', color: theme.colors.stats.orange.color, bg: theme.colors.stats.orange.bg };
      default: return { name: 'bell', color: theme.colors.primary, bg: theme.colors.primaryGlow };
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const iconConfig = getIconForType(item.Type);
    
    return (
      <TouchableOpacity 
        style={[styles.notificationCard, !item.IsRead && styles.unreadCard]} 
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        {!item.IsRead && <View style={styles.unreadIndicator} />}
        
        <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
          <Feather name={iconConfig.name as any} size={20} color={iconConfig.color} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.title, !item.IsRead && styles.unreadText]} numberOfLines={1}>{item.Title}</Text>
          <Text style={styles.body} numberOfLines={2}>{item.Body}</Text>
          <Text style={styles.time}>{formatTime(item.CreatedAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
          <Feather name="check-circle" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.NotificationID.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="bell-off" size={32} color={theme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>You have no new notifications.</Text>
          </View>
        }
      />
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.glass,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  markAllButton: {
    padding: 8,
    marginRight: -8,
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
    overflow: 'hidden',
  },
  unreadCard: {
    backgroundColor: theme.colors.surfaceHighlight,
    borderColor: theme.colors.borderHighlight,
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -8,
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '800',
  },
  body: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  time: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  }
});
