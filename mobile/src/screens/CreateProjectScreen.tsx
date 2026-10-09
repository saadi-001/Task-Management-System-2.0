import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import { projectService } from '../services/projectService';
import { organizationService, Organization } from '../services/organizationService';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import ConfirmModal from '../components/common/ConfirmModal';

export default function CreateProjectScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const route = useRoute<any>();
  const initialOrgId = route.params?.initialOrgId;
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(initialOrgId || null);
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fetchingOrgs, setFetchingOrgs] = useState(true);
  const [messageModal, setMessageModal] = useState({ visible: false, title: '', message: '', type: 'error' as 'error'|'success' });

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    try {
      const res = await organizationService.getOrganizations();
      if (res.data) {
        setOrgs(res.data);
        if (res.data.length > 0) {
          if (!initialOrgId) setSelectedOrgId(res.data[0].OrganizationID);
        }
      }
    } catch (err) {
      console.error('Failed to load orgs');
    } finally {
      setFetchingOrgs(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      showAlert({ title: 'Validation Error', message: 'Project name is required.', type: 'error' , cancelText: null });
      return;
    }
    if (!selectedOrgId) {
      showAlert({ title: 'Validation Error', message: 'Please select an organization.', type: 'error' , cancelText: null });
      return;
    }

    try {
      setLoading(true);
      await projectService.createProject({
        Name: name.trim(),
        Description: description.trim() || null,
        OrganizationID: selectedOrgId,
        OwnerID: user?.UserID || user?.id || 1,
      });
      
      setIsSuccess(true);
      showAlert({
        title: 'Success',
        message: 'Created successfully.',
        type: 'success',
        cancelText: null,
        onConfirm: () => navigation.goBack()
      });
    } catch (error: any) {
      setLoading(false);
      showAlert({
        title: 'Error',
        message: error.response?.data?.message || 'Operation failed.',
        type: 'error',
        cancelText: null
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Project</Text>
          <Text style={styles.subtitle}>Create a new project in your workspace.</Text>
        </View>

        <AppInput
          label="Project Name"
          placeholder="e.g. Q4 Marketing Strategy"
          value={name}
          onChangeText={setName}
          
        />

        <AppInput
          label="Description (Optional)"
          placeholder="Detailed project description..."
          value={description}
          onChangeText={setDescription}
          
          multiline
        />

        <View style={styles.selectorContainer}>
          <Text style={styles.label}>Organization</Text>
          {fetchingOrgs ? (
            <Text style={styles.helpText}>Loading available organizations...</Text>
          ) : orgs.length > 0 ? (
            <View style={styles.orgGrid}>
              {orgs.map(org => {
                const isSelected = selectedOrgId === org.OrganizationID;
                return (
                  <AppButton
                    key={org.OrganizationID}
                    title={org.Name}
                    variant={isSelected ? 'primary' : 'secondary'}
                    onPress={() => setSelectedOrgId(org.OrganizationID)}
                    style={styles.orgPill}
                  />
                );
              })}
            </View>
          ) : (
            <Text style={styles.helpText}>No organizations found. Please create one first.</Text>
          )}
        </View>

        <View style={{ height: 40 }} />
        <AppButton 
          title="DEPLOY PROJECT" 
          onPress={handleCreate} 
          loading={loading}
          disabled={!name.trim() || !selectedOrgId || loading || isSuccess}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl, paddingBottom: 60 },
  header: { marginBottom: 32 },
  title: { ...theme.typography.h1, color: theme.colors.textPrimary, marginBottom: 8 },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary },
  
  selectorContainer: { marginTop: 16, marginBottom: 24 },
  label: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  helpText: { ...theme.typography.body, color: theme.colors.textMuted },
  
  orgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  orgPill: { marginBottom: 8, marginRight: 8, alignSelf: 'flex-start' },
});
