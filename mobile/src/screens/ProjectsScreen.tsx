import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { projectService, Project } from '../services/projectService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';

export default function ProjectsScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredProjects(projects.filter(p => 
        p.Name.toLowerCase().includes(lowerQuery) || 
        (p.Description && p.Description.toLowerCase().includes(lowerQuery))
      ));
    }
  }, [searchQuery, projects]);

  const loadProjects = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const res = await projectService.getProjects();
      setProjects(res.data || []);
    } catch (err) {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ProjectDetails', { projectId: item.ProjectID })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Feather name="folder" size={20} color={theme.colors.stats.blue.color} />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Active</Text>
        </View>
      </View>
      <Text style={styles.projectName} numberOfLines={1}>{item.Name}</Text>
      <Text style={styles.projectDesc} numberOfLines={2}>
        {item.Description || 'No description provided.'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) return <LoadingScreen message="Loading Projects..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Projects</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateProject')} style={styles.addBtn}>
          <Feather name="plus" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
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
          data={filteredProjects}
          keyExtractor={(item) => item.ProjectID.toString()}
          renderItem={renderProject}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProjects(true)} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="folder" size={48} color={theme.colors.border} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No projects match your search.' : 'No projects found.'}
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
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border,
    ...theme.shadows.glass,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.stats.blue.bg, justifyContent: 'center', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: theme.colors.successBg },
  badgeText: { fontSize: 12, fontWeight: '600', color: theme.colors.success },
  projectName: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 6 },
  projectDesc: { ...theme.typography.body, color: theme.colors.textSecondary, fontSize: 14 },
  
  emptyContainer: { padding: 40, alignItems: 'center', marginTop: 40 },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary },
});