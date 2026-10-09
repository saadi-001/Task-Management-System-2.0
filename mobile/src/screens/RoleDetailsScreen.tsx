import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { roleService, Role } from '../services/roleService';
import { permissionService, Permission } from '../services/permissionService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';

export default function RoleDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { roleId } = route.params;
  
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]); // Array of PermissionIDs
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [roleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [roleRes, allPermsRes, rolePermsRes] = await Promise.all([
        roleService.getRole(roleId),
        permissionService.getPermissions(),
        roleService.getRolePermissions(roleId)
      ]);
      
      setRole(roleRes.data);
      setAllPermissions(allPermsRes.data || []);
      
      // Extract PermissionIDs that the role currently has
      // Depending on backend, rolePermsRes.data might be an array of objects
      const assignedIds = rolePermsRes.data?.map((rp: any) => rp.PermissionID) || [];
      setRolePermissions(assignedIds);
      
    } catch (err: any) {
      console.log('Error loading role details', err);
      setError('Failed to fetch role details. Administrator access may be required.');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (permissionId: number, isCurrentlyAssigned: boolean) => {
    // Optimistic UI Update
    if (isCurrentlyAssigned) {
      setRolePermissions(prev => prev.filter(id => id !== permissionId));
      try {
        await roleService.removePermission(roleId, permissionId);
      } catch (e) {
        // Revert on failure
        setRolePermissions(prev => [...prev, permissionId]);
      }
    } else {
      setRolePermissions(prev => [...prev, permissionId]);
      try {
        await roleService.assignPermission(roleId, permissionId);
      } catch (e) {
        // Revert on failure
        setRolePermissions(prev => prev.filter(id => id !== permissionId));
      }
    }
  };

  const renderPermission = ({ item }: { item: Permission }) => {
    const isAssigned = rolePermissions.includes(item.PermissionID);
    
    return (
      <View style={styles.permCard}>
        <View style={styles.permInfo}>
          <Feather name="key" size={18} color={isAssigned ? theme.colors.primary : theme.colors.textMuted} style={{ marginRight: 12 }} />
          <Text style={[styles.permName, isAssigned && styles.permNameActive]}>{item.Name}</Text>
        </View>
        <Switch
          value={isAssigned}
          onValueChange={() => togglePermission(item.PermissionID, isAssigned)}
          trackColor={{ false: theme.colors.border, true: theme.colors.primaryGlow }}
          thumbColor={isAssigned ? theme.colors.primary : theme.colors.textMuted}
        />
      </View>
    );
  };

  if (loading) return <LoadingScreen message="Loading Role Data..." />;
  if (error || !role) return (
    <View style={styles.centerContainer}>
      <Feather name="alert-triangle" size={48} color={theme.colors.error} style={{ marginBottom: 20 }} />
      <Text style={styles.errorText}>{error || 'Role Not Found'}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.retryBtnText}>GO BACK</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Role Configuration</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.roleOverview}>
        <View style={styles.roleIconBadge}>
          <Feather name="shield" size={32} color={theme.colors.primary} />
        </View>
        <Text style={styles.roleTitle}>{role.Name}</Text>
        <Text style={styles.roleSubtitle}>ID: {role.RoleID}  •  {rolePermissions.length} Permissions Active</Text>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>SYSTEM PERMISSIONS</Text>
      </View>

      <FlatList
        data={allPermissions}
        keyExtractor={(item) => item.PermissionID.toString()}
        renderItem={renderPermission}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  errorText: { ...theme.typography.body, color: theme.colors.error, textAlign: 'center', marginBottom: 20 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: theme.colors.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border },
  retryBtnText: { ...theme.typography.h3, color: theme.colors.textPrimary },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
  
  roleOverview: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderColor: theme.colors.border,
  },
  roleIconBadge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: theme.colors.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2, borderColor: theme.colors.primary,
    ...theme.shadows.neon,
  },
  roleTitle: { ...theme.typography.h1, color: theme.colors.textPrimary, marginBottom: 4 },
  roleSubtitle: { ...theme.typography.body, color: theme.colors.textSecondary },

  listHeader: { paddingHorizontal: theme.spacing.lg, paddingTop: 24, paddingBottom: 12 },
  listTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, letterSpacing: 1 },

  list: { paddingHorizontal: theme.spacing.lg, paddingBottom: 100 },
  permCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.radius.md,
    marginBottom: 12,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  permInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  permName: { ...theme.typography.body, color: theme.colors.textSecondary, fontWeight: '500' },
  permNameActive: { color: theme.colors.textPrimary, fontWeight: '700' },
});
