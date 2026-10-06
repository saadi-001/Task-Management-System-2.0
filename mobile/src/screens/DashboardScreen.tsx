import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatCard from '../components/dashboard/StatCard';
import SectionHeader from '../components/dashboard/SectionHeader';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import TaskProgressBar from '../components/dashboard/TaskProgressBar';
import LoadingScreen from '../components/common/LoadingScreen';

interface Ticket {
  TaskID: number;
  Title: string;
  Status: string;
  Priority: string;
  AssignedTo?: number;
}

interface DashboardStats {
  projects: number | null;
  organizations: number | null;
  tickets: number | null;
  users: number | null;
  recentTickets: Ticket[];
  doneTickets: number;
  inProgressTickets: number;
}

export default function DashboardScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const { user, roles } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    projects: null, organizations: null, tickets: null, users: null, recentTickets: [], doneTickets: 0, inProgressTickets: 0
  });

  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true); setError(null);
      const data = await dashboardService.getDashboardStats();
      setStats(data as any);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
      ]).start();
    } catch (err) {
      setError('Unable to connect to neural net. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'done': return theme.colors.success;
      case 'in progress': return theme.colors.stats.blue.color;
      case 'review': return theme.colors.stats.purple.color;
      default: return theme.colors.textSecondary;
    }
  };
  
  const getStatusBg = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'done': return theme.colors.successBg;
      case 'in progress': return theme.colors.stats.blue.bg;
      case 'review': return theme.colors.stats.purple.bg;
      default: return theme.colors.iconBg;
    }
  };

  const renderRecentTask = (ticket: Ticket) => (
    <TouchableOpacity 
      key={ticket.TaskID} 
      style={styles.taskCard} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('TicketDetails', { ticketId: ticket.TaskID })}
    >
      <LinearGradient colors={theme.colors.glassFill} style={StyleSheet.absoluteFill} />
      <View style={styles.taskHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(ticket.Status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(ticket.Status) }]}>{ticket.Status}</Text>
        </View>
        <Feather name="code" size={20} color={theme.colors.primary} style={styles.taskIcon} />
      </View>
      <Text style={styles.taskTitle} numberOfLines={1}>{ticket.Title}</Text>
      <View style={styles.taskFooter}>
        <View style={styles.assigneeAvatar}>
          <Feather name="user" size={12} color="#fff" />
        </View>
        <Text style={styles.taskMeta}>ID: TM-{ticket.TaskID} - {ticket.Priority}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LoadingScreen message="Initializing Subsystems..." />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DashboardHeader userName={user?.Name} role={roles?.[0] || 'Member'} />
        
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], paddingHorizontal: theme.spacing.lg }}>
          
          <TaskProgressBar total={stats.tickets || 0} done={stats.doneTickets || 0} inProgress={stats.inProgressTickets || 0} />

          
          <SectionHeader title="METRICS" />
          <View style={styles.statsGrid}>
            <StatCard title="Orgs" value={stats.organizations} iconName="briefcase" colorTheme={theme.colors.stats.purple} onPress={() => navigation.navigate('Organizations')} />
            <StatCard title="Projects" value={stats.projects} iconName="folder" colorTheme={theme.colors.stats.blue} onPress={() => navigation.navigate('Projects')} />
            <StatCard title="Tasks" value={stats.tickets} iconName="check-square" colorTheme={theme.colors.stats.green} onPress={() => navigation.navigate('Tickets')} />
            <StatCard title="Users" value={stats.users} iconName="users" colorTheme={theme.colors.stats.orange} onPress={() => navigation.navigate('Users')} />
          </View>

          <SectionHeader title="SYSTEM ACTIONS" />
          <View style={styles.actionsGrid}>
            <QuickActionCard title="Deploy Project" iconName="folder-plus" onPress={() => navigation.navigate('CreateProject')} />
            <QuickActionCard title="Initialize Task" iconName="file-plus" onPress={() => navigation.navigate('CreateTicket')} />
            <QuickActionCard title="Scale Org" iconName="briefcase" onPress={() => navigation.navigate('CreateOrg')} />
          </View>

          <SectionHeader title="RECENT TASKS" />
          {stats.recentTickets.length > 0 ? (
            stats.recentTickets.map(renderRecentTask)
          ) : (
            <View style={styles.emptyTasks}>
              <Feather name="activity" size={32} color={theme.colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No recent activity detected in the system.</Text>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 160 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: theme.spacing.xl },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xl },
  
  taskCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  taskIcon: { opacity: 0.7 },
  taskTitle: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 16 },
  taskFooter: { flexDirection: 'row', alignItems: 'center' },
  assigneeAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  taskMeta: { ...theme.typography.caption, color: theme.colors.textSecondary },
  
  emptyTasks: { padding: theme.spacing.xl, alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed' },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary, fontStyle: 'italic' },
});
