import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTheme, AppTheme } from '../constants/theme';

export type ThemeOption = 'light' | 'dark' | 'system' | 'futuristic';

interface ThemeContextData {
  theme: AppTheme;
  themeOption: ThemeOption;
  setThemeOption: (option: ThemeOption) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeOption, setThemeOptionState] = useState<ThemeOption>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('themeOption').then((saved) => {
      if (saved && ['light', 'dark', 'system', 'futuristic'].includes(saved)) {
        setThemeOptionState(saved as ThemeOption);
      }
      setIsReady(true);
    });
  }, []);

  const setThemeOption = async (option: ThemeOption) => {
    setThemeOptionState(option);
    await AsyncStorage.setItem('themeOption', option);
  };

  const isDark = themeOption === 'system' ? (systemColorScheme === 'dark') : (themeOption === 'dark');
  const isFuturistic = themeOption === 'futuristic';
  const theme = createTheme(isDark, isFuturistic);

  if (!isReady) return null;

  return (
    <ThemeContext.Provider value={{ theme, themeOption, setThemeOption }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);