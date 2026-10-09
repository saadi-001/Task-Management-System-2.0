import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Platform } from 'react-native';
import ConfirmModal from '../components/common/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useThemeContext, ThemeOption } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen({ navigation }: any) {
  const { user, roles, permissions, logout } = useAuth();
  const { theme, themeOption, setThemeOption } = useThemeContext();
  const styles = getStyles(theme);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };
  const [showPermissions, setShowPermissions] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

  const renderThemeOption = (option: ThemeOption, icon: keyof typeof Feather.glyphMap, label: string) => {
    const isSelected = themeOption === option;
    return (
      <TouchableOpacity 
        style={[styles.themeOption, isSelected && styles.themeOptionSelected]} 
        activeOpacity={0.7}
        onPress={() => setThemeOption(option)}
      >
        <Feather name={icon} size={20} color={isSelected ? theme.colors.primary : theme.colors.textSecondary} />
        <Text style={[styles.themeOptionText, isSelected && styles.themeOptionTextSelected]}>{label}</Text>
        {isSelected && <View style={styles.themeOptionDot} />}
      </TouchableOpacity>
    );
  };

  const isAdmin = roles?.includes('Administrator') || roles?.includes('Admin') || permissions?.includes('MANAGE_ROLE');

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primaryGlow, 'transparent']} style={StyleSheet.absoluteFill} start={{x:0, y:0}} end={{x:0, y:0.4}} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Animated.View style={[styles.headerCard, { opacity: fadeAnim }]}>
          <LinearGradient colors={[theme.colors.surfaceHighlight, 'transparent']} style={StyleSheet.absoluteFill} />
          
          {/* Stable Professional Avatar Ring */}
          <View style={styles.avatarOuterRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.Name || '')}</Text>
            </View>
          </View>

          <Text style={styles.name}>{user?.Name}</Text>
          <Text style={styles.email}>{user?.Email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roles?.[0] || 'Member'}</Text>
          </View>
        </Animated.View>

        {/* Collapsible Permissions Folder */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>AUTHORIZATION</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => setShowPermissions(!showPermissions)}
              activeOpacity={0.7}
            >
              <Feather name={showPermissions ? "folder-minus" : "folder"} size={20} color={theme.colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>View Effective Permissions</Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{permissions?.length || 0}</Text>
              </View>
              <Feather name={showPermissions ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            {showPermissions && (
              <>
                <View style={styles.divider} />
                <View style={styles.permissionsContainer}>
                  {permissions && permissions.length > 0 ? (
                    permissions.map((perm, index) => (
                      <View key={index} style={styles.permBadge}>
                        <Text style={styles.permText}>{perm}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.helpText}>No specific permissions granted.</Text>
                  )}
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {isAdmin && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>ADMINISTRATION</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Roles')}>
                <Feather name="shield" size={20} color={theme.colors.textSecondary} style={styles.menuIcon} />
                <Text style={styles.menuText}>Roles & Groups</Text>
                <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Permissions')}>
                <Feather name="key" size={20} color={theme.colors.textSecondary} style={styles.menuIcon} />
                <Text style={styles.menuText}>System Permissions</Text>
                <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Users')}>
                <Feather name="users" size={20} color={theme.colors.textSecondary} style={styles.menuIcon} />
                <Text style={styles.menuText}>Team Directory</Text>
                <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          <View style={styles.card}>
            {renderThemeOption('light', 'sun', 'Light Interface')}
            <View style={styles.divider} />
            {renderThemeOption('dark', 'moon', 'Dark Interface')}
            <View style={styles.divider} />
            {renderThemeOption('system', 'smartphone', 'System Default')}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("EditProfile")}>
              <Feather name="user" size={20} color={theme.colors.textSecondary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Edit Profile</Text>
              <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Feather name="log-out" size={20} color={theme.colors.error} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: theme.colors.error }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TASK MANAGEMENT SYSTEM</Text>
          <Text style={styles.versionText}>v2.0.0 (Neural Core)</Text>
        </View>
        
      </ScrollView>
      <ConfirmModal
        visible={logoutModalVisible}
        title="Logout"
        message="Are you sure you want to securely disconnect your session and logout of the neural core?"
        confirmText="Logout"
        iconName="power"
        variant="danger"
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={() => {
          setLogoutModalVisible(false);
            setTimeout(() => logout(), 300);
        }}
      />
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 100 },
  
  headerCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 1, borderColor: theme.colors.border,
    ...theme.shadows.glass,
    overflow: 'hidden',
    position: 'relative',
  },

  avatarOuterRing: {
    width: 104, 
    height: 104, 
    borderRadius: 52, 
    backgroundColor: theme.colors.primaryGlow,
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: theme.colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: theme.colors.surface,
    ...theme.shadows.medium,
  },
  
  avatarText: { fontSize: 32, fontWeight: '700', color: '#ffffff' },
  name: { ...theme.typography.h1, fontSize: 24, color: theme.colors.textPrimary, marginBottom: 4, zIndex: 2 },
  email: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: 16, zIndex: 2 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: theme.colors.iconBg, borderRadius: 20, zIndex: 2 },
  roleText: { ...theme.typography.caption, color: theme.colors.textPrimary, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  
  section: { marginBottom: 24 },
  sectionTitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 12, marginLeft: 8, letterSpacing: 1 },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: 50 },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg },
  menuIcon: { marginRight: 16 },
  menuText: { flex: 1, ...theme.typography.body, color: theme.colors.textPrimary, fontWeight: '500' },
  
  badgeCount: { backgroundColor: theme.colors.primaryGlow, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 12 },
  badgeCountText: { fontSize: 12, fontWeight: '700', color: theme.colors.primary },

  themeOption: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg },
  themeOptionSelected: { backgroundColor: theme.colors.primaryGlow },
  themeOptionText: { flex: 1, marginLeft: 16, ...theme.typography.body, color: theme.colors.textPrimary, fontWeight: '500' },
  themeOptionTextSelected: { color: theme.colors.primary },
  themeOptionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  
  permissionsContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: theme.spacing.md, backgroundColor: theme.colors.iconBg },
  permBadge: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderHighlight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  permText: { fontSize: 11, color: theme.colors.textPrimary, fontWeight: '600' },
  helpText: { ...theme.typography.body, color: theme.colors.textSecondary, marginLeft: 8 },

  footer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  footerText: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  versionText: { ...theme.typography.caption, color: theme.colors.textMuted },
});



