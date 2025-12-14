import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationProp } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import SignIn from "../screens/auth/signin";
import SignUp from "../screens/auth/signup";
import Home from "../screens/tabs/Home";

export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Tabs: undefined;
};

export type TabsParamList = {
  Home: undefined;
};

export type RootNavigation = NavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabsParamList>();

function TabsNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={Home} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Tabs" component={TabsNavigator} />
    </Stack.Navigator>
  );
}
