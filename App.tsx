import React from "react";
import { StatusBar, useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

function App() {
  const colorScheme = useColorScheme();
  const navTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar
            barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
