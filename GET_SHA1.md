# How to Get SHA-1 Fingerprint

## Method 1: Using Gradle (Recommended)
```bash
cd android
./gradlew signingReport
```

Look for the output under **Variant: debug** → **SHA1:** 

## Method 2: Using Keytool (Alternative)
```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Look for **SHA1:** in the output.

## Your Current SHA-1
**Local Keystore (app is using this):**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**Global Keystore (already in Firebase, but app is NOT using this):**
```
C2:56:3E:EE:2B:AF:F3:30:D7:B3:B2:8E:44:30:13:87:E3:17:44:A8
```

## Which One to Use?
✅ **Use the LOCAL one:** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

This is the SHA-1 from `android/app/debug.keystore` which your app is currently using.

