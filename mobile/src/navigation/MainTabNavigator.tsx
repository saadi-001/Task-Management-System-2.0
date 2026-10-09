import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import DashboardScreen from '../screens/DashboardScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import TicketsScreen from '../screens/TicketsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useThemeContext } from '../context/ThemeContext';
import { AppTheme } from '../constants/theme';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation, theme, styles }: BottomTabBarProps & { theme: AppTheme, styles: any }) {
  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={theme.isDark ? 50 : 80} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: keyof typeof Feather.glyphMap = 'circle';
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Projects') iconName = 'folder';
          else if (route.name === 'Tickets') iconName = 'check-square';
          else if (route.name === 'Profile') iconName = 'user';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isFocused ? styles.iconActive : styles.iconInactive]}>
                <Feather 
                  name={iconName} 
                  size={24} 
                  color={isFocused ? theme.colors.primary : theme.colors.textSecondary} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function MainTabNavigator() {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} theme={theme} styles={styles} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          ...theme.typography.h3,
          fontSize: 18,
        },
        headerTintColor: theme.colors.textPrimary,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Projects" component={ProjectsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Tickets" component={TicketsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 70, // iOS style height
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
    backgroundColor: theme.isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: 22,
  },
  iconInactive: {
    backgroundColor: 'transparent',
  },
});
