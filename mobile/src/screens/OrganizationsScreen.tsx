import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { organizationService, Organization } from '../services/organizationService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';

export default function OrganizationsScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrgs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrgs(orgs);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredOrgs(orgs.filter(o => o.Name.toLowerCase().includes(lowerQuery)));
    }
  }, [searchQuery, orgs]);

  const loadOrgs = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const res = await organizationService.getOrganizations();
      setOrgs(res.data || []);
    } catch (err) {
      setError('Failed to load organizations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderOrg = ({ item }: { item: Organization }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('OrganizationDetails', { organizationId: item.OrganizationID })}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, item.Theme ? { backgroundColor: item.Theme + '20' } : {}]}>
        <Text style={[styles.iconText, item.Theme ? { color: item.Theme } : { color: theme.colors.primary }]}>
          {item.Name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.orgName}>{item.Name}</Text>
        <Text style={styles.orgId}>ORG-ID: {item.OrganizationID}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );

  if (loading) return <LoadingScreen message="Loading Organizations..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Organizations</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateOrg')} style={styles.addBtn}>
          <Feather name="plus" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search organizations..."
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
          data={filteredOrgs}
          keyExtractor={(item) => item.OrganizationID.toString()}
          renderItem={renderOrg}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadOrgs(true)} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="briefcase" size={48} color={theme.colors.border} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No organizations match your search.' : 'No organizations found.'}
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
  
  list: { padding: theme.spacing.lg, paddingBottom: 100 },
  
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border,
    ...theme.shadows.glass,
  },
  iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryGlow, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  iconText: { fontSize: 20, fontWeight: '700' },
  info: { flex: 1 },
  orgName: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 4 },
  orgId: { ...theme.typography.caption, color: theme.colors.textSecondary },
  
  emptyContainer: { padding: 40, alignItems: 'center', marginTop: 40 },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary },
});