import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { ticketService, Ticket } from '../services/ticketService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';

export default function TicketsScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    let result = tickets;
    
    if (statusFilter) {
      const lowerFilter = statusFilter.toLowerCase();
      result = result.filter(t => t.Status?.toLowerCase().includes(lowerFilter));
    }
    
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.Title.toLowerCase().includes(lowerQuery) || 
        t.Status.toLowerCase().includes(lowerQuery) ||
        (t.Description && t.Description.toLowerCase().includes(lowerQuery))
      );
    }
    
    setFilteredTickets(result);
  }, [searchQuery, statusFilter, tickets]);

  const loadTickets = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const res = await ticketService.getTickets();
      setTickets(res.data || []);
    } catch (err) {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const renderTicket = ({ item }: { item: Ticket }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('TicketDetails', { ticketId: item.TaskID })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: getStatusBg(item.Status) }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.Status) }]}>{item.Status}</Text>
        </View>
        <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
      </View>
      <Text style={styles.ticketTitle} numberOfLines={1}>{item.Title}</Text>
      <View style={styles.ticketFooter}>
        <Feather name="hash" size={14} color={theme.colors.textSecondary} />
        <Text style={styles.ticketMeta}>TM-{item.TaskID} • {item.Priority}</Text>
      </View>
    </TouchableOpacity>
  );

  const toggleFilter = (filter: string) => {
    setStatusFilter(prev => prev === filter ? null : filter);
  };

  const renderMetrics = () => {
    const readyCount = tickets.filter(t => t.Status?.toLowerCase() === 'ready to do' || t.Status?.toLowerCase() === 'open').length;
    const progressCount = tickets.filter(t => t.Status?.toLowerCase() === 'in progress').length;
    const reviewCount = tickets.filter(t => t.Status?.toLowerCase() === 'testing' || t.Status?.toLowerCase() === 'review').length;
    const doneCount = tickets.filter(t => t.Status?.toLowerCase() === 'done').length;

    return (
      <View>
        <Text style={styles.metricsTitle}>Tap to filter by status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsContainer}>
          <TouchableOpacity style={[styles.metricCard, statusFilter === 'ready' && styles.metricCardActive]} onPress={() => toggleFilter('ready')} activeOpacity={0.7}>
            <Text style={[styles.metricValue, statusFilter === 'ready' && { color: theme.colors.primary }]}>{readyCount}</Text>
            <Text style={styles.metricLabel}>Ready</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.metricCard, statusFilter === 'progress' && styles.metricCardActive]} onPress={() => toggleFilter('progress')} activeOpacity={0.7}>
            <Text style={[styles.metricValue, statusFilter === 'progress' && { color: theme.colors.primary }]}>{progressCount}</Text>
            <Text style={styles.metricLabel}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.metricCard, statusFilter === 'testing' && styles.metricCardActive]} onPress={() => toggleFilter('testing')} activeOpacity={0.7}>
            <Text style={[styles.metricValue, statusFilter === 'testing' && { color: theme.colors.primary }]}>{reviewCount}</Text>
            <Text style={styles.metricLabel}>Testing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.metricCard, statusFilter === 'done' && styles.metricCardActive]} onPress={() => toggleFilter('done')} activeOpacity={0.7}>
            <Text style={[styles.metricValue, statusFilter === 'done' && { color: theme.colors.primary }]}>{doneCount}</Text>
            <Text style={styles.metricLabel}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  if (loading) return <LoadingScreen message="Loading Tasks..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks & Tickets</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateTicket')} style={styles.addBtn}>
          <Feather name="plus" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Feather name="x-circle" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.TaskID.toString()}
          renderItem={renderTicket}
          ListHeaderComponent={renderMetrics}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTickets(true)} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="check-square" size={48} color={theme.colors.border} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>
                {searchQuery || statusFilter ? 'No tasks match your filters.' : 'No tasks found.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  errorText: { ...theme.typography.body, color: theme.colors.error, textAlign: 'center' },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
  addBtn: { padding: 8, marginRight: -8, backgroundColor: theme.colors.primaryGlow, borderRadius: 20 },
  
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, ...theme.typography.body, color: theme.colors.textPrimary, height: '100%' },
  clearBtn: { padding: 4 },
  
  metricsTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 24, marginLeft: 20, marginBottom: 8 },
  metricsContainer: { paddingBottom: theme.spacing.lg, paddingLeft: theme.spacing.lg, paddingRight: 4 },
  metricCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginRight: 12,
    minWidth: 90,
    borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'center',
    ...theme.shadows.glass,
  },
  metricCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryGlow,
  },
  metricValue: { ...theme.typography.h2, fontSize: 24, color: theme.colors.textPrimary, marginBottom: 4 },
  metricLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 },
  
  list: { paddingBottom: 100 },
  
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border,
    ...theme.shadows.glass,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  ticketTitle: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 12 },
  ticketFooter: { flexDirection: 'row', alignItems: 'center' },
  ticketMeta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginLeft: 6 },
  
  emptyContainer: { padding: 40, alignItems: 'center', marginTop: 20 },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary },
});