import React, { useEffect, useState } from 'react';
import { useAlert } from '../context/AlertContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import ConfirmModal from '../components/common/ConfirmModal';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import { organizationService, Organization } from '../services/organizationService';
import { projectService, Project } from '../services/projectService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';
import AppButton from '../components/common/AppButton';
import UpdateOrgModal from '../components/organization/UpdateOrgModal';
import LinkProjectModal from '../components/organization/LinkProjectModal';

export default function OrganizationDetailsScreen() {
  const { showAlert } = useAlert();
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const organizationId = route.params?.organizationId;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [linkModalVisible, setLinkModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [organizationId])
  );

  const loadData = async () => {
    if (!organizationId) return;
    try {
      setLoading(true); setError(null);
      const [orgRes, projRes] = await Promise.all([
        organizationService.getOrganization(organizationId),
        projectService.getProjectsByOrganization(organizationId)
      ]);
      setOrganization(orgRes.data);
      if (projRes.data) setProjects(projRes.data);
    } catch (err) {
      setError('Failed to load organization.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (name: string, themeColor: string) => {
    try {
      setUpdating(true);
      await organizationService.updateOrganization(organizationId, { name, theme: themeColor || undefined });
      showAlert({ title: 'Success', message: 'Organization updated successfully.', type: 'success', cancelText: null });
      setModalVisible(false);
      loadData();
    } catch (err) {
      showAlert({ title: 'Error', message: 'Failed to update organization.', type: 'error', cancelText: null });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteModalVisible(false);
      setTimeout(async () => {
        await organizationService.deleteOrganization(organizationId);
        navigation.goBack();
      }, 350);
    } catch(e) {}
  };

  if (loading) return <LoadingScreen message="Loading Organization..." />;
  if (error || !organization) return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>{error || 'Organization Not Found'}</Text>
      <AppButton title="RETURN" onPress={() => navigation.goBack()} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Organization Profile</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editBtn}>
          <Feather name="edit-2" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, organization.Theme ? { backgroundColor: organization.Theme } : {}]}>
            <Text style={styles.logoText}>{organization.Name.charAt(0)}</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.orgTitle}>{organization.Name}</Text>
          <Text style={styles.orgId}>ORG-ID: {organization.OrganizationID}</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <Text style={styles.description}>{organization.Theme || 'Default System Theme'}</Text>
        </View>

        
        {/* PROJECTS SECTION */}
        <View style={styles.projectsContainer}>
          <Text style={styles.projectsMainTitle}>Projects</Text>
          
          <View style={styles.projectsHeaderControls}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{projects.length} project{projects.length !== 1 ? 's' : ''}</Text>
            </View>
            
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('CreateProject', { initialOrgId: organizationId })}>
                <Text style={styles.outlineBtnText}>+ Add Project</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn} onPress={() => setLinkModalVisible(true)}>
                <Text style={styles.outlineBtnText}>Link Existing Project</Text>
              </TouchableOpacity>
            </View>
          </View>

          {projects.length === 0 ? (
            <Text style={styles.emptyText}>No projects found. Add or link a project to get started.</Text>
          ) : (
            projects.map(p => (
              <View key={p.ProjectID} style={styles.projectCardPro}>
                <View style={styles.projectCardHeaderRow}>
                  <Text style={styles.projectNamePro}>{p.Name}</Text>
                </View>
                <Text style={styles.projectIdPro}>#{p.ProjectID}</Text>
                
                <Text style={styles.projectDescPro} numberOfLines={2}>
                  {p.Description || 'No description provided.'}
                </Text>

                <View style={styles.projectCardActions}>
                  <TouchableOpacity style={styles.cardActionBtn} onPress={() => navigation.navigate('ProjectDetails', { projectId: p.ProjectID })}>
                    <Text style={styles.cardActionBtnText}>Open Project</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cardActionBtn} onPress={() => { /* Unlink logic */ showAlert({
     title: 'Unlink Project',
     message: 'Are you sure you want to remove this project from the organization?',
     type: 'warning',
     confirmText: 'Unlink',
     cancelText: 'Cancel',
     onConfirm: async () => {
        try {
          await projectService.unlinkProject(p.ProjectID);
          loadData();
        } catch (e: any) {
          showAlert({ title: 'Error', message: e.response?.data?.message || 'Failed to unlink.', type: 'error', cancelText: null });
        }
     }
  }) }}>
                    <Text style={styles.cardActionBtnText}>Unlink</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.cardActionBtn, styles.cardActionBtnDanger]} onPress={() => {
                     // Normally you'd open a confirm modal, but for now just basic confirm logic
                     showAlert({
                       title: 'Delete Project',
                       message: 'Are you sure you want to delete this project?',
                       type: 'warning',
                       confirmText: 'Delete',
                       cancelText: 'Cancel',
                       onConfirm: async () => {
                          try {
                            await projectService.deleteProject(p.ProjectID);
                            loadData(); // reload
                          } catch (e) {}
                       }
                     });
                  }}>
                    <Text style={styles.cardActionBtnTextDanger}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
        <AppButton title="DELETE ORGANIZATION" variant="danger" onPress={() => setDeleteModalVisible(true)} />
      </ScrollView>

      <UpdateOrgModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleUpdate}
        initialName={organization.Name}
        initialTheme={organization.Theme || ''}
        loading={updating}
      />
    
      <ConfirmModal
        visible={deleteModalVisible}
        title="Confirm Deletion"
        message="Are you sure you want to delete this? All associated data will be lost."
        confirmText="DELETE"
        iconName="trash-2"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    
      <LinkProjectModal
        visible={linkModalVisible}
        organizationId={organizationId}
        onClose={() => setLinkModalVisible(false)}
        onSuccess={() => {
          setLinkModalVisible(false);
          showAlert({ title: 'Success', message: 'Project linked successfully.', type: 'success', cancelText: null });
          loadData();
        }}
      />
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  errorText: { color: theme.colors.error, marginBottom: 20 },
  projectsContainer: { marginTop: 24 },
  projectsMainTitle: { ...theme.typography.h2, color: theme.colors.textPrimary, marginBottom: 12 },
  projectsHeaderControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
  badge: { backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border },
  badgeText: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: '600' },
  actionButtonsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  outlineBtn: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: theme.colors.surface },
  outlineBtnText: { ...theme.typography.body, fontSize: 13, color: theme.colors.textPrimary, fontWeight: '600' },
  
  
  projectCardPro: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  projectCardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectNamePro: { ...theme.typography.h3, color: '#1a1a24', fontSize: 18 },
  projectIdPro: { ...theme.typography.caption, color: '#888', marginTop: 2, marginBottom: 8 },
  projectDescPro: { ...theme.typography.body, color: '#555', marginBottom: 16, fontSize: 14, lineHeight: 20 },
  
  projectCardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cardActionBtn: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f9f9f9' },
  cardActionBtnText: { color: '#333', fontSize: 13, fontWeight: '600' },
  cardActionBtnDanger: { borderColor: '#ffd6d6', backgroundColor: '#fff5f5' },
  cardActionBtnTextDanger: { color: '#d32f2f', fontSize: 13, fontWeight: '600' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 24 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addButtonText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  projectCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  projectName: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 4 },
  projectDesc: { ...theme.typography.caption, color: theme.colors.textSecondary, maxWidth: 250 },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary, fontStyle: 'italic', marginBottom: 16 },

  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  editBtn: { padding: 8, marginRight: -8, backgroundColor: theme.colors.primaryGlow, borderRadius: 20 },
  headerTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
  
  content: { padding: theme.spacing.lg, paddingBottom: 100, alignItems: 'center' },
  
  logoContainer: { marginBottom: 24, marginTop: 24 },
  logo: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', ...theme.shadows.neon },
  logoText: { fontSize: 40, fontWeight: '700', color: '#ffffff' },
  
  titleSection: { marginBottom: 32, alignItems: 'center' },
  orgTitle: { ...theme.typography.h1, fontSize: 32, color: theme.colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  orgId: { ...theme.typography.caption, color: theme.colors.textSecondary, letterSpacing: 1 },
  
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 8 },
  description: { ...theme.typography.body, color: theme.colors.textSecondary },
});