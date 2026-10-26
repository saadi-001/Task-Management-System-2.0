import React, { useEffect, useState } from "react";
import { LogBox, View, ActivityIndicator, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AlertProvider } from "./src/context/AlertContext";
import { WorkspaceProvider } from "./src/context/WorkspaceContext";
import { ensureFeatherLoaded } from "./src/utils/fontLoader";

// Suppress known harmless dev-mode warnings globally
LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
  'Response.blob()',
  'Method downloadAsync',
  'Method uploadAsync',
  'Unable to download asset from url',
  'ExpoAsset.downloadAsync',
]);

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureFeatherLoaded().finally(() => {
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#040D12" }}>
        <ActivityIndicator size="large" color="#2DD4BF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AlertProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <NavigationContainer>
                <StatusBar barStyle="dark-content" />
                <AppNavigator />
              </NavigationContainer>
            </WorkspaceProvider>
          </AuthProvider>
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
