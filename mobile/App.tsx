import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider><AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider></ThemeProvider>
    </SafeAreaProvider>
  );
}


