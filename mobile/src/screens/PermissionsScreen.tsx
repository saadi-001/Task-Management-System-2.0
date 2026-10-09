import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { permissionService, Permission } from '../services/permissionService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';

export default function PermissionsScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPermissions(permissions);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredPermissions(permissions.filter(p => p.Name.toLowerCase().includes(lowerQuery)));
    }
  }, [searchQuery, permissions]);

  const loadPermissions = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const res = await permissionService.getPermissions();
      setPermissions(res.data || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Unauthorized: Administrator access required.');
      } else {
        setError('Failed to fetch permissions.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderPermission = ({ item }: { item: Permission }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Feather name="key" size={20} color={theme.colors.stats.purple.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.permName}>{item.Name}</Text>
        <Text style={styles.permId}>PERM-ID: {item.PermissionID}</Text>
      </View>
    </View>
  );

  if (loading) return <LoadingScreen message="Verifying Permissions..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Permissions</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search permissions..."
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
          data={filteredPermissions}
          keyExtractor={(item) => item.PermissionID.toString()}
          renderItem={renderPermission}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadPermissions(true)} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="key" size={48} color={theme.colors.border} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No permissions match your search.' : 'No permissions found.'}
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
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: 8,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  iconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.stats.purple.bg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  permName: { ...theme.typography.body, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 2 },
  permId: { ...theme.typography.caption, color: theme.colors.textSecondary },
  
  emptyContainer: { padding: 40, alignItems: 'center', marginTop: 40 },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary },
});
