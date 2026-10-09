import React, { useState } from 'react';
import { useAlert } from '../context/AlertContext';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { authService } from '../services/authService';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: { navigation: NavigationProp }) {
  const { showAlert } = useAlert();
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string, global?: string}>({});

  const handleReset = async () => {
    setErrors({});
    let newErrors: any = {};
    if (!email) {
      newErrors.email = 'Please enter your email address';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res && res.success) {
        showAlert({ title: 'Success', message: 'Password reset instructions sent to your email.', type: 'success', cancelText: null });
        navigation.navigate('Login');
      } else {
        setErrors({ global: res?.message || 'Failed to request reset' });
      }
    } catch (err: any) {
      setErrors({ global: err.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <Text style={styles.appTitle}>Reset Password</Text>
            <Text style={styles.appSubtitle}>Enter your email to receive instructions</Text>
          </View>

          <View style={styles.formContainer}>
            {errors.global && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.global}</Text>
              </View>
            )}
            <AppInput label="Email Address" error={errors.email} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={(t) => {setEmail(t); setErrors({...errors, email: undefined});}} />

            <AppButton title="Send Instructions" onPress={handleReset} loading={loading} style={{ marginTop: 10 }} />
            <AppButton title="Back to Login" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  keyboardAvoid: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  headerContainer: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  appTitle: { ...theme.typography.h1, fontSize: 28, marginBottom: 8 },
  appSubtitle: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' },
  formContainer: { width: '100%' },
    inputGroup: { marginBottom: 20 },
  errorContainer: { backgroundColor: theme.colors.errorBg, padding: 12, borderRadius: theme.radius.sm, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.error },
  errorText: { color: theme.colors.error, fontSize: 13, textAlign: 'center' },
  label: { ...theme.typography.body, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
});