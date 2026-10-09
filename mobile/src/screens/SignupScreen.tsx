import React, { useState } from 'react';
import { useAlert } from '../context/AlertContext';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated, Alert, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { authService } from '../services/authService';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: { navigation: NavigationProp }) {
  const { showAlert } = useAlert();
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<{name?: string, email?: string, password?: string, terms?: string, global?: string}>({});
  const [loading, setLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const handleSignup = async () => {
    setErrors({});
    let newErrors: any = {};
    
    if (!name) newErrors.name = 'Full name is required';
    
    if (!email) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!acceptedTerms) newErrors.terms = 'You must accept the platform rules';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.signup(name, email, password, acceptedTerms);
      if (res && res.success) {
        showAlert({ title: 'Account Created', message: 'Your account has been created. Please log in.', type: 'success', cancelText: null });
        navigation.navigate('Login');
      } else {
        setErrors({ global: res?.message || 'Access denied.' });
      }
    } catch (err: any) {
      setErrors({ global: err.message || 'Network failure.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primaryGlow, 'transparent']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
            <Feather name="check-circle" size={40} color={theme.colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.appTitle}>SIGN UP</Text>
            <Text style={styles.appSubtitle}>Create your account</Text>
          </Animated.View>
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            {errors.global && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.global}</Text>
              </View>
            )}
            <AppInput label="Full Name" placeholder="John Doe" value={name} onChangeText={(t) => {setName(t); setErrors({...errors, name: undefined});}} error={errors.name} />
            <AppInput label="Email Address" placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={(t) => {setEmail(t); setErrors({...errors, email: undefined});}} error={errors.email} />
            <AppInput label="Password" placeholder="Create a strong password" secureTextEntry value={password} onChangeText={(t) => {setPassword(t); setErrors({...errors, password: undefined});}} error={errors.password} />
            
            <TouchableOpacity style={styles.termsContainer} onPress={() => {setAcceptedTerms(!acceptedTerms); setErrors({...errors, terms: undefined});}} activeOpacity={0.7}>
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
                {acceptedTerms && <Feather name="check" size={14} color="#fff" />}
              </View>
              <Text style={styles.termsText}>I accept the platform rules & guidelines</Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.inlineErrorText}>{errors.terms}</Text>}
            <AppButton title="SIGN UP" onPress={handleSignup} loading={loading} style={{ marginTop: 24 }} />
            <AppButton title="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  appTitle: { ...theme.typography.h2, letterSpacing: 2, marginBottom: 8, color: theme.colors.textPrimary },
  appSubtitle: { ...theme.typography.caption, color: theme.colors.primary, letterSpacing: 1, textTransform: 'uppercase' },
  
  formContainer: { width: '100%', backgroundColor: theme.colors.surface, padding: 32, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border },
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    termsText: { flex: 1, fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 },
  errorContainer: { backgroundColor: theme.colors.errorBg, padding: 12, borderRadius: theme.radius.sm, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.error },
  errorText: { color: theme.colors.error, fontSize: 13, textAlign: 'center' },
  inlineErrorText: { color: theme.colors.error, fontSize: 13, marginTop: -8, marginBottom: 16, marginLeft: 4 },

});