import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { organizationService, Organization } from '../services/organizationService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import LoadingScreen from '../components/common/LoadingScreen';
import AppButton from '../components/common/AppButton';
import UpdateOrgModal from '../components/organization/UpdateOrgModal';

export default function OrganizationDetailsScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const organizationId = route.params?.organizationId;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [organizationId]);

  const loadData = async () => {
    if (!organizationId) return;
    try {
      setLoading(true); setError(null);
      const res = await organizationService.getOrganization(organizationId);
      setOrganization(res.data);
    } catch (err) {
      setError('Failed to load corporate entity.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (name: string, themeColor: string) => {
    try {
      setUpdating(true);
      await organizationService.updateOrganization(organizationId, { name, theme: themeColor || undefined });
      Alert.alert('Success', 'Organization updated successfully.');
      setModalVisible(false);
      loadData();
    } catch (err) {
      Alert.alert('Error', 'Failed to update organization.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this organization? All associated data will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await organizationService.deleteOrganization(organizationId);
          Alert.alert('Deleted', 'Organization deleted successfully.');
          navigation.goBack();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete organization.');
        }
      }}
    ]);
  };

  if (loading) return <LoadingScreen message="Decrypting Entity Data..." />;
  if (error || !organization) return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>{error || 'Entity Not Found'}</Text>
      <AppButton title="RETURN" onPress={() => navigation.goBack()} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entity Profile</Text>
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

        <View style={{ height: 40 }} />
        <AppButton title="DISSOLVE ENTITY" variant="danger" onPress={handleDelete} />
      </ScrollView>

      <UpdateOrgModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleUpdate}
        initialName={organization.Name}
        initialTheme={organization.Theme || ''}
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