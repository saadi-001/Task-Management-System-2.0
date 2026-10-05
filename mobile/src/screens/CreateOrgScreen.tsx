import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import { organizationService } from '../services/organizationService';
import { useAuth } from '../context/AuthContext';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';

export default function CreateOrgScreen() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [themeColor, setThemeColor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Organization name is required.');
      return;
    }

    try {
      setLoading(true);
      await organizationService.createOrganization({
        name: name.trim(),
        theme: themeColor.trim() || undefined,
        ownerID: user?.UserID || 0,
      });
      
      Alert.alert('Success', 'Organization established.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to establish organization.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Establish Organization</Text>
          <Text style={styles.subtitle}>Create a new corporate entity in the neural net.</Text>
        </View>

        <AppInput label="Organization Name" placeholder="e.g. Cyberdyne Systems" value={name} onChangeText={setName} />
        <AppInput label="Theme Color (Optional)" placeholder="e.g. #FF0000" value={themeColor} onChangeText={setThemeColor} />

        <View style={{ height: 40 }} />
        <AppButton title="ESTABLISH ORG" onPress={handleCreate} loading={loading} disabled={!name.trim()} />
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