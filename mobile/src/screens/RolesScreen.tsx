import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { roleService, Role } from '../services/roleService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';

export default function RolesScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRoles(roles);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredRoles(roles.filter(r => r.RoleName.toLowerCase().includes(lowerQuery)));
    }
  }, [searchQuery, roles]);

  const loadRoles = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const res = await roleService.getRoles();
      setRoles(res.data || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Unauthorized: Administrator clearance required.');
      } else {
        setError('Failed to fetch roles.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderRole = ({ item }: { item: Role }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {}}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Feather name="shield" size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.roleName}>{item.RoleName}</Text>
        <Text style={styles.roleId}>ROLE-ID: {item.RoleID}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );

  if (loading) return <LoadingScreen message="Verifying Clearance..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Roles</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search roles..."
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
          <Feather name="lock" size={48} color={theme.colors.error} style={{ marginBottom: 20 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRoles}
          keyExtractor={(item) => item.RoleID.toString()}
          renderItem={renderRole}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRoles(true)} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="shield" size={48} color={theme.colors.border} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No roles match your search.' : 'No roles found.'}
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
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.iconBg, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  info: { flex: 1 },
  roleName: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 4 },
  roleId: { ...theme.typography.caption, color: theme.colors.textSecondary },
  
  emptyContainer: { padding: 40, alignItems: 'center', marginTop: 40 },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary },
});