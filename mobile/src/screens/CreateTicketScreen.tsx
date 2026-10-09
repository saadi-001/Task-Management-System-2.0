import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import { ticketService } from '../services/ticketService';
import { projectService, Project } from '../services/projectService';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import ConfirmModal from '../components/common/ConfirmModal';

type ParamList = { CreateTicket: { projectId?: number; }; };

export default function CreateTicketScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const route = useRoute<RouteProp<ParamList, 'CreateTicket'>>();
  
  const initialProjectId = route.params?.projectId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialProjectId || null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [messageModal, setMessageModal] = useState({ visible: false, title: '', message: '', type: 'error' as 'error'|'success' });
  const [fetchingProjects, setFetchingProjects] = useState(!initialProjectId);

  useEffect(() => {
    if (!initialProjectId) {
      loadProjects();
    }
  }, [initialProjectId]);

  const loadProjects = async () => {
    try {
      const res = await projectService.getProjects();
      if (res.data) {
        setProjects(res.data);
        if (res.data.length > 0) {
          setSelectedProjectId(res.data[0].ProjectID);
        }
      }
    } catch (err) {
      console.error('Failed to load projects');
    } finally {
      setFetchingProjects(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      showAlert({ title: 'Validation Error', message: 'Task title is required.', type: 'error' , cancelText: null });
      return;
    }
    if (!selectedProjectId) {
      showAlert({ title: 'Validation Error', message: 'Please select a project.', type: 'error' , cancelText: null });
      return;
    }

    try {
      setLoading(true);
      await ticketService.createTicket({
        Title: title.trim(),
        Description: description.trim() || undefined,
        ProjectID: selectedProjectId,
          AssignedTo: user?.UserID || user?.id || 1,
        Status: 'Open',
        Priority: 'Medium',
        
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Task</Text>
          <Text style={styles.subtitle}>Create a new task for your project.</Text>
        </View>

        <AppInput label="Task Title" placeholder="e.g. Update Neural Net Weights" value={title} onChangeText={setTitle}  />
        <AppInput label="Description (Optional)" placeholder="Detailed task description..." value={description} onChangeText={setDescription}  multiline />

        {!initialProjectId && (
          <View style={styles.selectorContainer}>
            <Text style={styles.label}>Target Project</Text>
            {fetchingProjects ? (
              <Text style={styles.helpText}>Loading available projects...</Text>
            ) : projects.length > 0 ? (
              <View style={styles.pillGrid}>
                {projects.map(proj => {
                  const isSelected = selectedProjectId === proj.ProjectID;
                  return (
                    <AppButton
                      key={proj.ProjectID}
                      title={proj.Name}
                      variant={isSelected ? 'primary' : 'secondary'}
                      onPress={() => setSelectedProjectId(proj.ProjectID)}
                      style={styles.pill}
                    />
                  );
                })}
              </View>
            ) : (
              <Text style={styles.helpText}>No projects found. Create one first.</Text>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
        <AppButton title="EXECUTE DEPLOYMENT" onPress={handleCreate} loading={loading} disabled={!title.trim() || !selectedProjectId || loading || isSuccess} />
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
  
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { marginBottom: 8, marginRight: 8, alignSelf: 'flex-start' },
});
