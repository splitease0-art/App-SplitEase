import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import React, { useState } from "react";
import {
  Button,
  useColorScheme,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { auth } from "../../config/firebase";
import { RootStackParamList } from "../../navigation/AppNavigator";

export default function SignUp() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const PALETTE = {
    primary: "#059669",
    background: isDark ? "#000" : "#fff",
    text: isDark ? "#fff" : "#000",
    border: "#059669",
    card: "#111827",
  };

  const handleRegister = async () => {
    try {
      // Step 1: Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;

      // Step 2: Send a verification email
      await sendEmailVerification(user);

      // Step 3: Inform the user
      Alert.alert(
        "Verify your email",
        "A verification link has been sent to your email address. Please verify it before logging in."
      );

      // Step 4: Sign out to enforce email verification
      await auth.signOut();

      // Step 5: Redirect to login screen
      navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
    } catch (err) {
      // ✅ Type-safe error handling
      if (err instanceof Error) {
        Alert.alert("Registration Error", err.message);
      } else {
        Alert.alert("Registration Error", String(err));
      }
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: PALETTE.background }]}
    >
      <Text style={[styles.title, { color: PALETTE.text }]}>
        Sign Up
      </Text>

      <TextInput
        style={[
          styles.input,
          { color: PALETTE.text, borderColor: PALETTE.border },
        ]}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={PALETTE.card}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View
        style={[
          styles.input,
          styles.passwordWrapper,
          { borderColor: PALETTE.border },
        ]}
      >
        <TextInput
          style={[
            styles.passwordInput,
            { color: PALETTE.text, paddingVertical: 0 },
          ]}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={PALETTE.card}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={{ color: PALETTE.primary, fontWeight: "600" }}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: PALETTE.primary }]}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
        <Text style={[styles.linkText, { color: PALETTE.primary }]}>
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#059669",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginVertical: 10,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  linkText: {
    marginTop: 15,
    textAlign: "center",
  },
});
