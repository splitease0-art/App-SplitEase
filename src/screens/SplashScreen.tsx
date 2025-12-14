import LottieView from "lottie-react-native";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext"; // ✅ Adjusted import
import { RootStackParamList } from "../navigation/AppNavigator";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // wait for Firebase to finish checking

    const timer = setTimeout(() => {
      const nextRoute: keyof RootStackParamList = user ? "Tabs" : "SignIn";
      navigation.reset({
        index: 0,
        routes: [{ name: nextRoute }],
      });
    }, 2500); // wait for animation (2.5 sec)
    return () => clearTimeout(timer);
  }, [user, loading, navigation]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/animations/splashscreen.json")}
        autoPlay
        loop={false}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  animation: {
    width,
    height,
  },
});
