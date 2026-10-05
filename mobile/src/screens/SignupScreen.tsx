import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated, Alert } from 'react-native';
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
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.signup(name, email, password);
      if (res && res.success) {
        Alert.alert('Clearance Granted', 'Account configured. Proceed to initialize session.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', res?.message || 'Access denied.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Network failure.');
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
            <Text style={styles.appSubtitle}>Register your identity</Text>
          </Animated.View>
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            <AppInput label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} />
            <AppInput label="Email Address" placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <AppInput label="Password" placeholder="Create a strong passcode" secureTextEntry value={password} onChangeText={setPassword} />
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
});