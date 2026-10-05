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
import OrganizationsScreen from '../screens/OrganizationsScreen';
import UsersScreen from '../screens/UsersScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import LoadingScreen from '../components/common/LoadingScreen';

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
  CreateProject: undefined;
  CreateOrg: undefined;
  Roles: undefined;
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
          <Stack.Screen name="OrganizationDetails" component={OrganizationDetailsScreen} options={{ title: 'Organization' }} />
          <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} options={{ title: 'Deployment Details' }} />
          <Stack.Screen name="UserDetails" component={UserDetailsScreen} options={{ title: 'Identity Profile' }} />
          <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} options={{ title: 'Task Telemetry' }} />
          <Stack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ title: 'Initialize Task' }} />
          <Stack.Screen name="CreateProject" component={CreateProjectScreen} options={{ title: 'Initialize Project', presentation: 'modal' }} />
          <Stack.Screen name="CreateOrg" component={CreateOrgScreen} options={{ title: 'Establish Org', presentation: 'modal' }} />
        </>
      )}
      <Stack.Screen name="Roles" component={RolesScreen} />
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="Organizations" component={OrganizationsScreen} options={{ title: 'Organizations' }} />
          <Stack.Screen name="Users" component={UsersScreen} options={{ title: 'Team Directory' }} />
        </Stack.Navigator>
    </>
  );
}






