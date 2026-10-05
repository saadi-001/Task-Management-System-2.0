import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import { ticketService } from '../services/ticketService';
import { projectService, Project } from '../services/projectService';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';

type ParamList = { CreateTicket: { projectId?: number; }; };

export default function CreateTicketScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'CreateTicket'>>();
  
  const initialProjectId = route.params?.projectId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialProjectId || null);
  const [loading, setLoading] = useState(false);
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
    if (!title.trim() || !selectedProjectId) {
      Alert.alert('Validation Error', 'Title and Project Context are required.');
      return;
    }

    try {
      setLoading(true);
      const ticketData = { 
        Title: title, 
        Description: description, 
        ProjectID: selectedProjectId, 
        Status: 'Open', 
        Priority: 'Medium' 
      };
      
      const res = await ticketService.createTicket(ticketData);
      
      if (res && res.success) {
        Alert.alert('Success', 'Task sequence initialized successfully.', [
          { text: 'PROCEED', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to initialize task.';
      Alert.alert('Upload Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Initialize Task</Text>
          <Text style={styles.subtitle}>Queue a new objective in the system pipeline.</Text>
        </View>

        <AppInput label="Task Title" placeholder="e.g. Update Neural Net Weights" value={title} onChangeText={setTitle}  />
        <AppInput label="Description (Optional)" placeholder="Detailed task directives..." value={description} onChangeText={setDescription}  multiline />

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
        <AppButton title="EXECUTE DEPLOYMENT" onPress={handleCreate} loading={loading} disabled={!title.trim() || !selectedProjectId} />
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
