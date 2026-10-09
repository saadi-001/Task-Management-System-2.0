import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { userService, User } from '../services/userService';
import { ticketService, Ticket } from '../services/ticketService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';

export default function UserDetailsScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userId = route.params?.userId;

  const [user, setUser] = useState<User | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) loadData();
    else setError('Invalid User ID');
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [userRes, tasksRes] = await Promise.all([
        userService.getUser(userId),
        ticketService.getTickets().catch(() => ({ data: [] }))
      ]);
      
      if (userRes && userRes.success) {
        setUser(userRes.data);
      } else {
        throw new Error('Failed to load user profile.');
      }

      if (tasksRes?.data) {
        setAssignedTasks(tasksRes.data.filter((t: Ticket) => t.AssignedTo === userId));
      }
    } catch (err: any) {
      setError(err.message || 'Error loading details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'done': return theme.colors.success;
      case 'in progress': return theme.colors.stats.blue.color;
      case 'review': return theme.colors.stats.purple.color;
      case 'testing': return theme.colors.stats.orange.color;
      case 'blocked': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };
  
  const getStatusBg = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'done': return theme.colors.successBg;
      case 'in progress': return theme.colors.stats.blue.bg;
      case 'review': return theme.colors.stats.purple.bg;
      case 'testing': return theme.colors.stats.orange.bg;
      case 'blocked': return theme.colors.errorBg;
      default: return theme.colors.iconBg;
    }
  };

  if (loading) return <LoadingScreen message="Loading User Profile..." />;
  if (error || !user) return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>{error || 'User not found'}</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 12, backgroundColor: theme.colors.primary, borderRadius: 8 }}>
        <Text style={{ color: '#fff' }}>Return</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personnel File</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { user: user })} style={styles.backBtn}>
          <Feather name="edit-2" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.Name ? user.Name.charAt(0).toUpperCase() : 'U'}</Text>
          </View>
          <Text style={styles.title}>{user.Name}</Text>
          <Text style={styles.email}>{user.Email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>ID: {user.UserID}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ASSIGNED TASKS ({assignedTasks.length})</Text>

        {assignedTasks.length > 0 ? (
          assignedTasks.map((t) => (
            <TouchableOpacity 
              key={t.TaskID}
              style={styles.taskCard}
              onPress={() => navigation.navigate('TicketDetails', { ticketId: t.TaskID })}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: getStatusBg(t.Status) }]}>
                  <Text style={[styles.badgeText, { color: getStatusColor(t.Status) }]}>{t.Status}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
              </View>
              <Text style={styles.ticketTitle} numberOfLines={1}>{t.Title}</Text>
              <View style={styles.ticketFooter}>
                <Feather name="hash" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.ticketMeta}>TM-{t.TaskID} • {t.Priority}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={40} color={theme.colors.border} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No tasks currently assigned.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  errorText: { color: theme.colors.error, marginBottom: 20 },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
  
  content: { padding: theme.spacing.lg, paddingBottom: 100 },
  
  profileCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.xl, borderRadius: theme.radius.lg, ...theme.shadows.glass, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: '#ffffff', fontSize: 32, fontWeight: '700' },
  title: { ...theme.typography.h2, marginBottom: 4, color: theme.colors.textPrimary },
  email: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: 12 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: theme.colors.iconBg, borderRadius: 12 },
  roleText: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: '600' },
  
  sectionTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 16, letterSpacing: 1 },
  
  taskCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  ticketTitle: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 12 },
  ticketFooter: { flexDirection: 'row', alignItems: 'center' },
  ticketMeta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginLeft: 6 },
  
  emptyContainer: { padding: 40, alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed' },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary },
});