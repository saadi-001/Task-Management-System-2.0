import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: { navigation: LoginScreenNavigationProp }) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { loginUser } = useAuth();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res && res.token && res.user) {
        await loginUser(res.token, res.user, res.roles, res.permissions);
      } else {
        setError('Invalid initialization sequence.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primaryGlow, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
            <View style={styles.logoGlow} />
            <Feather name="check-circle" size={48} color={theme.colors.primary} style={{ marginBottom: 16 }} />
            <Text style={styles.appTitle}>TASK MANAGEMENT SYSTEM</Text>
            <Text style={styles.appSubtitle}>Secure Access Gateway</Text>
          </Animated.View>

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <AppInput 
              label="System ID / Email" 
              placeholder="Enter your email" 
              keyboardType="email-address" 
              autoCapitalize="none" 
              value={email} 
              onChangeText={setEmail} 
            />
            <AppInput 
              label="Passcode" 
              placeholder="Enter your password" 
              secureTextEntry 
              value={password} 
              onChangeText={setPassword} 
            />

            <AppButton title="LOGIN" onPress={handleLogin} loading={loading} style={{ marginTop: 24 }} />

            <AppButton title="Forgot Password" variant="secondary" onPress={() => navigation.navigate('ForgotPassword')} style={{ marginTop: 16 }} />
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Not authorized? </Text>
              <Text style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>Sign Up</Text>
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 48, position: 'relative' },
  logoGlow: { position: 'absolute', top: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.primaryGlow },
  appTitle: { ...theme.typography.h2, fontSize: 28, letterSpacing: 1, marginBottom: 8, color: theme.colors.textPrimary, textAlign: 'center' },
  appSubtitle: { ...theme.typography.caption, color: theme.colors.primary, letterSpacing: 2, textTransform: 'uppercase' },
  formContainer: { width: '100%', backgroundColor: theme.colors.surface, padding: 32, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border },
  errorContainer: { backgroundColor: theme.colors.errorBg, padding: 12, borderRadius: theme.radius.sm, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.error },
  errorText: { color: theme.colors.error, fontSize: 13, textAlign: 'center' },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  signupText: { color: theme.colors.textSecondary, fontSize: 13 },
  signupLink: { color: theme.colors.primary, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
});