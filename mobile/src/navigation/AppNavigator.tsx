import React from 'react';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OrganizationDetailsScreen from '../screens/OrganizationDetailsScreen';
import ProjectDetailsScreen from '../screens/ProjectDetailsScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import TicketDetailsScreen from '../screens/TicketDetailsScreen';
import CreateTicketScreen from '../screens/CreateTicketScreen';
import CreateProjectScreen from '../screens/CreateProjectScreen';
import CreateOrgScreen from '../screens/CreateOrgScreen';
import RolesScreen from '../screens/RolesScreen';
import RoleDetailsScreen from '../screens/RoleDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OrganizationsScreen from '../screens/OrganizationsScreen';
import UsersScreen from '../screens/UsersScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import LoadingScreen from '../components/common/LoadingScreen';
import NotificationManager from '../components/common/NotificationManager';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
  MainTabs: undefined;
  OrganizationDetails: { organizationId: number };
  ProjectDetails: { projectId: number };
  UserDetails: { userId: number };
  TicketDetails: { ticketId: number };
  CreateTicket: { projectId?: number };
  CreateProject: { initialOrgId?: number } | undefined;
  CreateOrg: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  Roles: undefined;
  RoleDetails: { roleId: number };
  Permissions: undefined;
  Organizations: undefined;
  Users: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { token, loading } = useAuth();
  const { theme } = useThemeContext();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <>
      <NotificationManager />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: { ...theme.typography.h3 },
          headerShadowVisible: false,
        }}
      >
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="OrganizationDetails" component={OrganizationDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="UserDetails" component={UserDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ title: 'Create Task' }} />
            <Stack.Screen name="CreateProject" component={CreateProjectScreen} options={{ title: 'Create Project', presentation: 'modal' }} />
            <Stack.Screen name="CreateOrg" component={CreateOrgScreen} options={{ title: 'Create Organization', presentation: 'modal' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false, presentation: 'modal' }} />
          </>
        )}
        <Stack.Screen name="Roles" component={RolesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RoleDetails" component={RoleDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Permissions" component={PermissionsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Organizations" component={OrganizationsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Users" component={UsersScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </>
    </>
  );
}
