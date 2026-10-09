import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import { projectService, Project } from '../services/projectService';
import { ticketService, Ticket } from '../services/ticketService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';
import AppButton from '../components/common/AppButton';
import UpdateProjectModal from '../components/project/UpdateProjectModal';

export default function ProjectDetailsScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const projectId = route.params?.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;
    try {
      setLoading(true); setError(null);
      const [projRes, tickRes] = await Promise.all([
        projectService.getProject(projectId),
        ticketService.getTicketsByProject(projectId)
      ]);
      setProject(projRes.data);
      if (tickRes.data) {
        setTickets(tickRes.data);
      }
    } catch (err) {
      setError('Failed to load deployment details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (name: string, description: string) => {
    try {
      setUpdating(true);
      await projectService.updateProject(projectId, { Name: name, Description: description });
      Alert.alert('Success', 'Project updated successfully.');
      setModalVisible(false);
      loadData();
    } catch (err) {
      Alert.alert('Error', 'Failed to update project.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this project? This action cannot be reversed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await projectService.deleteProject(projectId);
          Alert.alert('Deleted', 'Project deleted successfully.');
          navigation.goBack();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete project.');
        }
      }}
    ]);
  };

  if (loading) return <LoadingScreen message="Decrypting Sector Data..." />;
  if (error || !project) return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>{error || 'Sector Not Found'}</Text>
      <AppButton title="RETURN" onPress={() => navigation.goBack()} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deployment Sector</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editBtn}>
          <Feather name="edit-2" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.projectTitle}>{project.Name}</Text>
          <Text style={styles.projectId}>SECTOR-ID: {project.ProjectID}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Directives</Text>
          <Text style={styles.description}>{project.Description || 'No description provided.'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Tasks ({tickets.length})</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateTicket', { projectId: project.ProjectID })} 
              style={styles.addBtn}
            >
              <Feather name="plus" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {tickets.length > 0 ? tickets.map((t: Ticket) => (
            <TouchableOpacity 
              key={t.TaskID} 
              style={styles.ticketRow}
              onPress={() => navigation.navigate('TicketDetails', { ticketId: t.TaskID })}
            >
              <View style={styles.ticketIconBox}>
                <Feather name="terminal" size={16} color={theme.colors.primary} />
              </View>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketTitle} numberOfLines={1}>{t.Title}</Text>
                <Text style={styles.ticketMeta}>{t.Status} • {t.Priority}</Text>
              </View>
            </TouchableOpacity>
          )) : (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyText}>No active tasks in this sector.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
        <AppButton title="DELETE SECTOR" variant="danger" onPress={handleDelete} />
      </ScrollView>

      <UpdateProjectModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleUpdate}
        initialName={project.Name}
        initialDescription={project.Description || ''}
        loading={updating}
      />
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
  editBtn: { padding: 8, marginRight: -8, backgroundColor: theme.colors.primaryGlow, borderRadius: 20 },
  headerTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
  
  content: { padding: theme.spacing.lg, paddingBottom: 100 },
  
  titleSection: { marginBottom: 24 },
  projectTitle: { ...theme.typography.h1, fontSize: 32, color: theme.colors.textPrimary, marginBottom: 8 },
  projectId: { ...theme.typography.caption, color: theme.colors.textSecondary, letterSpacing: 1 },
  
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
  description: { ...theme.typography.body, color: theme.colors.textSecondary },
  addBtn: { padding: 6, backgroundColor: theme.colors.primaryGlow, borderRadius: 12 },
  
  ticketRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  ticketIconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.colors.iconBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  ticketInfo: { flex: 1 },
  ticketTitle: { ...theme.typography.body, color: theme.colors.textPrimary, fontWeight: '600', marginBottom: 4 },
  ticketMeta: { ...theme.typography.caption, color: theme.colors.textSecondary },
  
  emptyTasks: { padding: 20, alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary, fontStyle: 'italic' }
});