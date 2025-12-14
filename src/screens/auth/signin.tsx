import React, { useEffect, useState } from "react";
import {
  NavigationProp,
  useNavigation,
  useTheme,
} from "@react-navigation/native";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "../../config/firebase";
import { RootStackParamList } from "../../navigation/AppNavigator";

export default function SignIn() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const PALETTE = {
    primary: "#059669",
    background: colors.background,
    card: "#111827",
    text: colors.text,
    border: "#059669",
  };

  useEffect(() => {
    // Configure Google Sign-In with provided web client ID
    GoogleSignin.configure({
      webClientId:
        "631468976666-s3lnp0uk40f5q96m4c594ft1eg8r41l7.apps.googleusercontent.com",
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);


  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      
      const signInResult = await GoogleSignin.signIn();
      console.log('Google raw result:', signInResult);

      // Handle the result structure - check both possible formats
      let idToken: string | null = null;
      
      if (signInResult.type === "success" && signInResult.data?.idToken) {
        idToken = signInResult.data.idToken;
      } else if ((signInResult as any).idToken) {
        // Fallback for different response structure
        idToken = (signInResult as any).idToken;
      }
      
      if (!idToken) {
        return Alert.alert(
          "Google Sign-In Failed",
          "Unable to retrieve an ID token from Google."
        );
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const userEmail = userCredential.user.email;
      
      if (userEmail) {
        await saveEmailToFirestore(userEmail);
      }
      
      navigation.reset({ index: 0, routes: [{ name: "Tabs" }] });
    } catch (error: any) {
      console.log('Google Sign-In error:', error);
      
      // Better error handling using statusCodes
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
        // Don't show alert for cancellation
        return;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation (e.g. sign in) is in progress already
        Alert.alert('Sign In', 'Sign in is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available or outdated.');
      } else {
        // Some other error
        Alert.alert(
          'Google Sign-In Failed',
          error.message || JSON.stringify(error)
        );
      }
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      return Alert.alert(
        "Missing Fields",
        "Please enter both email and password."
      );
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check email verification without reloading (faster)
      if (!user.emailVerified) {
        return Alert.alert(
          "Email Not Verified",
          "Your email address has not been verified yet.\nPlease check your inbox for the verification email."
        );
      }

      // Navigate immediately, save to Firestore in background (non-blocking)
      navigation.reset({ index: 0, routes: [{ name: "Tabs" }] });
      
      // Save to Firestore in background (fire and forget)
      if (user.email) {
        saveEmailToFirestore(user.email).catch(() => {
          // Silently handle errors in background operation
        });
      }
    } catch (err: any) {
      let message = "An error occurred while logging in.";
      switch (err.code) {
        case "auth/invalid-email":
          message = "The email address is not valid.";
          break;
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;
        case "auth/wrong-password":
          message = "Incorrect password.";
          break;
        default:
          message = err.message;
      }
      Alert.alert("Login Failed", message);
    }
  };

  const saveEmailToFirestore = async (email: string) => {
    try {
      const userRef = doc(db, "users", email);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, { email });
        console.log("Email saved to Firestore:", email);
      }
    } catch (fireErr: any) {
      console.log("Firestore save skipped/offline:", fireErr?.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: PALETTE.background }]}>
      <Text style={[styles.title, { color: PALETTE.text }]}>Sign In</Text>

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
            { color: PALETTE.text },
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
        onPress={handleEmailLogin}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <View style={{ marginVertical: 10 }} />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: PALETTE.card, borderWidth: 1, borderColor: PALETTE.primary },
        ]}
        onPress={handleGoogleLogin}
      >
        <Text style={[styles.buttonText, { color: PALETTE.primary }]}>
          Continue with Google
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={[styles.linkText, { color: PALETTE.primary }]}>
          Don&apos;t have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
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
    paddingVertical: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  linkText: { marginTop: 15, textAlign: "center" },
});
