import React from "react";
import { LogBox } from "react-native";

// Suppress known harmless dev-mode warnings globally
LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
  'Response.blob()',
  'Method downloadAsync',
  'Method uploadAsync',
]);
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AlertProvider } from "./src/context/AlertContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider><AlertProvider><AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider></AlertProvider></ThemeProvider>
    </SafeAreaProvider>
  );
}


