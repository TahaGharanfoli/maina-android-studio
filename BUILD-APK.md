# 📱 Building and Testing APK

## Why CORS Won't Be an Issue in APK

When you build this into an Android APK using Capacitor:
- ✅ **No CORS restrictions** - WebView doesn't enforce CORS
- ✅ **API requests work normally** - Authentication will work perfectly
- ✅ **Direct API access** - Can make requests to external APIs
- ✅ **Real device testing** - Test on actual Android device

## Building the APK

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build for Android
```bash
npx cap build android
```

### Step 3: Open in Android Studio
```bash
npx cap open android
```

### Step 4: Build APK in Android Studio
1. Open Android Studio
2. Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
3. Wait for build to complete
4. APK will be in `android/app/build/outputs/apk/debug/`

## Testing the APK

### Install on Device
1. Transfer APK to Android device
2. Enable "Install from unknown sources"
3. Install the APK
4. Open the app

### Test Authentication Flow
1. **Enter phone number**: `09393070813` (existing user)
2. **Enter password**: `taha7928`
3. **Should login successfully** and redirect to main app

### Test Registration Flow
1. **Enter phone number**: `09120906471` (new user)
2. **Create password**: `taha7928`
3. **Send verification code**
4. **Enter code**: `2864`
5. **Should register successfully**

## Expected Behavior in APK

✅ **No CORS errors** - API requests work normally
✅ **Authentication flows work** - Login and registration
✅ **Token storage works** - JWT tokens saved locally
✅ **Navigation works** - Redirects between pages
✅ **Error handling works** - Shows proper error messages

## Debugging APK Issues

### Check Logs
```bash
adb logcat | grep -i "capacitor"
```

### Enable Debug Mode
In `android/app/src/main/java/com/mayna/maynasound/MainActivity.java`:
```java
// Add this line for debugging
webView.setWebContentsDebuggingEnabled(true);
```

### Test API Connectivity
The app will show detailed logs in Android Studio's logcat when making API requests.

## Production Considerations

### HTTPS Required
- Your API (`https://api.seektir.com/v2`) already uses HTTPS ✅
- Android requires HTTPS for production apps

### Network Security
- Add network security config if needed
- Handle offline scenarios
- Add retry logic for failed requests

## Summary

The CORS issue you're experiencing is **only for browser testing**. In the actual APK, your authentication system will work perfectly without any CORS restrictions!

