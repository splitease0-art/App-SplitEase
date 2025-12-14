# Google Sign-In DEVELOPER_ERROR Fix Guide

## Problem
You're getting `DEVELOPER_ERROR (Code: 10)` when trying to sign in with Google.

## Root Cause
Your app's SHA-1 certificate fingerprint doesn't match what's registered in Firebase Console.

## Current SHA-1 Fingerprint
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

## Solution Steps

### Step 1: Add SHA-1 to Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **splitease0-app**
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. Find your Android app (package: `com.splitease`)
6. Click **Add fingerprint**
7. Paste this SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
8. Click **Save**

### Step 2: Verify Google Sign-In is Enabled
1. In Firebase Console, go to **Build** → **Authentication** → **Sign-in method**
2. Make sure **Google** is enabled
3. If not, click **Google** and enable it

### Step 3: Download Updated google-services.json
1. In Firebase Console → Project Settings
2. Scroll to **Your apps** → Android app
3. Click **Download google-services.json**
4. Replace the file at: `android/app/google-services.json`

### Step 4: Rebuild the App
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## Alternative: Use Global Debug Keystore
If you want to use the global Android debug keystore instead:

1. Remove or rename: `android/app/debug.keystore`
2. The app will automatically use: `C:\Users\narej\.android\debug.keystore`
3. The SHA-1 `C2:56:3E:EE:2B:AF:F3:30:D7:B3:B2:8E:44:30:13:87:E3:17:44:A8` is already registered

## Verification
After completing the steps, try Google Sign-In again. The error should be resolved.

## Additional Notes
- The webClientId in the code is correct: `631468976666-s3lnp0uk40f5q96m4c594ft1eg8r41l7.apps.googleusercontent.com`
- Package name matches: `com.splitease`
- The issue is specifically the SHA-1 certificate mismatch

