import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import { organizationService } from '../services/organizationService';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import ConfirmModal from '../components/common/ConfirmModal';

export default function CreateOrgScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [themeColor, setThemeColor] = useState('');
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [messageModal, setMessageModal] = useState({ visible: false, title: '', message: '', type: 'error' as 'error'|'success' });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      showAlert({ title: 'Validation Error', message: 'Organization name is required.', type: 'error' , cancelText: null });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showAlert({ title: 'Validation Error', message: 'A valid organization email is required.', type: 'error' , cancelText: null });
      return;
    }
    if (!contactNo.trim()) {
      showAlert({ title: 'Validation Error', message: 'Contact number is required.', type: 'error' , cancelText: null });
      return;
    }

    try {
      setLoading(true);
      await organizationService.createOrganization({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        contactNo: contactNo.trim(),
        theme: themeColor.trim() || undefined,
        ownerID: user?.UserID || 0,
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
          <Text style={styles.title}>Create Organization</Text>
          <Text style={styles.subtitle}>Create a new organization in your workspace.</Text>
        </View>

        <AppInput label="Organization Name" placeholder="e.g. Cyberdyne Systems" value={name} onChangeText={setName} />
        <AppInput label="Organization Email" placeholder="e.g. contact@cyberdyne.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <AppInput label="Contact Number" placeholder="e.g. +1 234 567 890" value={contactNo} onChangeText={setContactNo} keyboardType="phone-pad" />
        <AppInput label="Theme Color (Optional)" placeholder="e.g. #FF0000" value={themeColor} onChangeText={setThemeColor} />

        <View style={{ height: 40 }} />
        <AppButton title="CREATE ORGANIZATION" onPress={handleCreate} loading={loading} disabled={!name.trim() || !email.trim() || !contactNo.trim() || loading || isSuccess} />
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
});