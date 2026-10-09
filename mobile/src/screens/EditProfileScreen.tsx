import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { View, Text, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';

export default function EditProfileScreen() {
  const { showAlert } = useAlert();
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user: authUser } = useAuth();
  
  const targetUser = route.params?.user || authUser;
  const isEditingOther = targetUser && authUser && targetUser.UserID !== authUser.UserID;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{name?: string, email?: string, global?: string}>({});

  useEffect(() => {
    if (targetUser) {
      setName(targetUser.Name || '');
      setEmail(targetUser.Email || '');
    }
  }, [targetUser]);

  const handleSave = async () => {
    setErrors({});
    let newErrors: any = {};
    if (!name.trim()) newErrors.name = 'Name cannot be empty';
    
    if (!email.trim()) {
      newErrors.email = 'Email cannot be empty';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await userService.updateUser(targetUser?.UserID || 0, { Name: name.trim(), Email: email.trim() });
      showAlert({ title: 'Success', message: 'Profile updated successfully.', type: 'success', cancelText: null, onConfirm: () => navigation.goBack() });
    } catch (err: any) {
      setErrors({ global: err.message || 'Could not update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} onPress={() => navigation.goBack()} style={styles.backIcon} />
        <Text style={styles.headerTitle}>{isEditingOther ? 'Edit User' : 'Edit Profile'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {errors.global && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.global}</Text>
          </View>
        )}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
          </View>
          <Text style={styles.avatarHint}>Your avatar is generated from your name.</Text>
        </View>

        <AppInput 
          label="Full Name" 
          placeholder="Enter your full name" 
          value={name} 
          onChangeText={(t) => {setName(t); setErrors({...errors, name: undefined});}} 
          error={errors.name} 
        />

        <AppInput 
          label="Email Address" 
          placeholder="Enter your email" 
          keyboardType="email-address" 
          autoCapitalize="none" 
          value={email} 
          onChangeText={(t) => {setEmail(t); setErrors({...errors, email: undefined});}} 
          error={errors.email} 
        />

        <View style={styles.actionContainer}>
          <AppButton title="Save Changes" onPress={handleSave} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backIcon: { padding: 8, marginLeft: -8 },
  headerTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
  
  content: { padding: theme.spacing.lg },

  avatarContainer: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  avatarRing: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2, borderColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: theme.colors.primaryGlow,
  },
  avatarInner: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: theme.colors.primary },
  avatarHint: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: 12 },

  formGroup: { marginBottom: 20 },
  label: { ...theme.typography.body, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, ...theme.typography.body, color: theme.colors.textPrimary },

    actionContainer: { marginTop: 12 },
  errorContainer: { backgroundColor: theme.colors.errorBg, padding: 12, borderRadius: theme.radius.sm, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.error },
  errorText: { color: theme.colors.error, fontSize: 13, textAlign: 'center' },
});
