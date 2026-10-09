import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { projectService, Project } from '../../services/projectService';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';
import AppButton from '../common/AppButton';

interface LinkProjectModalProps {
  visible: boolean;
  organizationId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LinkProjectModal({ visible, organizationId, onClose, onSuccess }: LinkProjectModalProps) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      loadProjects();
    } else {
      setSelectedProjectId(null);
      setError(null);
    }
  }, [visible]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectService.getProjects();
      if (res.success && res.data) {
        // Filter out projects that are already linked to this organization
        const availableProjects = res.data.filter(p => p.OrganizationID !== organizationId);
        setProjects(availableProjects);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedProjectId) return;
    try {
      setLinking(true);
      setError(null);
      await projectService.linkProject(selectedProjectId, organizationId);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to link project.');
    } finally {
      setLinking(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Link Project</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>Select an existing project to link to this organization.</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {loading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loaderText}>Loading projects...</Text>
            </View>
          ) : (
            <FlatList
              data={projects}
              keyExtractor={item => item.ProjectID.toString()}
              style={styles.list}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No available projects to link.</Text>
              }
              renderItem={({ item }) => {
                const isSelected = selectedProjectId === item.ProjectID;
                return (
                  <TouchableOpacity
                    style={[styles.projectItem, isSelected && styles.projectItemSelected]}
                    onPress={() => setSelectedProjectId(item.ProjectID)}
                  >
                    <View style={styles.projectInfo}>
                      <Text style={[styles.projectName, isSelected && { color: theme.colors.primary }]}>{item.Name}</Text>
                      <Text style={styles.projectId}>#{item.ProjectID}</Text>
                    </View>
                    {isSelected && <Feather name="check-circle" size={20} color={theme.colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <View style={styles.actions}>
            <AppButton title="CANCEL" onPress={onClose} variant="secondary" style={styles.btn} />
            <View style={{ width: 12 }} />
            <AppButton 
              title="LINK" 
              onPress={handleLink} 
              variant="primary" 
              loading={linking} 
              disabled={!selectedProjectId || loading} 
              style={styles.btn} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { ...theme.typography.h2, color: theme.colors.textPrimary },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: 20 },
  closeBtn: { padding: 4 },
  
  loaderBox: { padding: 40, alignItems: 'center' },
  loaderText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 12 },
  
  errorText: { ...theme.typography.caption, color: theme.colors.error, marginBottom: 16, textAlign: 'center' },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  
  list: { maxHeight: 400 },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
  },
  projectItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryGlow,
  },
  projectInfo: { flex: 1 },
  projectName: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 4 },
  projectId: { ...theme.typography.caption, color: theme.colors.textSecondary },
  
  actions: { flexDirection: 'row', marginTop: 20 },
  btn: { flex: 1 },
});
