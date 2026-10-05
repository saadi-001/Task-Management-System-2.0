import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { authService } from '../services/authService';
import AppButton from '../components/common/AppButton';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: { navigation: NavigationProp }) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res && res.success) {
        Alert.alert('Success', 'Password reset instructions sent to your email.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', res?.message || 'Failed to request reset');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Network error');
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
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>

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
  label: { ...theme.typography.body, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
});