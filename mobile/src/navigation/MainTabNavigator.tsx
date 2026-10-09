import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
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
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrapper, isFocused ? styles.iconActive : styles.iconInactive]}>
                <Feather 
                  name={iconName} 
                  size={22} 
                  color={isFocused ? theme.colors.primary : theme.colors.textSecondary} 
                  style={isFocused ? styles.iconNeon : undefined}
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
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 24,
    right: 24,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    backgroundColor: theme.isDark ? '#040D12' : '#FFFFFF', 
    ...theme.shadows.glass,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 20,
    borderColor: theme.colors.primary,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    backgroundColor: theme.colors.primaryGlow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderHighlight,
  },
  iconInactive: {
    backgroundColor: 'transparent',
  },
  iconNeon: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  }
});
