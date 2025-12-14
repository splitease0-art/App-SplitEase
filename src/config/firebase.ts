import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ import Firestore

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA3nsctCVv4i8TrJjPj3l9Ex21dSuzABTs",
  authDomain: "splitease0-app.firebaseapp.com",
  projectId: "splitease0-app",
  storageBucket: "splitease0-app.firebasestorage.app",
  messagingSenderId: "631468976666",
  appId: "1:631468976666:web:9e95227059b208cdc3ffa3",
  measurementId: "G-2SVC5EPB0W"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // ✅ export Firestore

export default app;
