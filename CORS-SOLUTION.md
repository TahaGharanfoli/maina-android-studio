# 🔧 CORS Error Solution Guide

## The Problem
When you open an HTML file directly in your browser and try to make API requests to `https://api.seektir.com/v2`, you get "Failed to fetch" error due to CORS restrictions.

## Solutions (Try in Order)

### 🎯 Solution 1: CORS Browser Extension (Recommended)
1. **Install a CORS extension:**
   - Chrome: "CORS Unblock" or "Allow CORS: Access-Control-Allow-Origin"
   - Firefox: "CORS Everywhere"
   - Edge: "CORS Unblock"

2. **Enable the extension** and refresh your page

### 🎯 Solution 2: Use Chrome with CORS Disabled
1. **Close all Chrome windows**
2. **Run this command in Command Prompt:**
   ```bash
   chrome --disable-web-security --user-data-dir="%TEMP%\chrome_dev"
   ```
3. **Open your HTML files in this Chrome instance**

### 🎯 Solution 3: Use the Batch File
1. **Double-click `start-chrome-no-cors.bat`**
2. **Open your HTML files in the new Chrome window**

### 🎯 Solution 4: Test API First
1. **Open `test-direct-api.html`** in your browser
2. **Test the API endpoints** to verify connectivity
3. **Then use your main authentication page**

### 🎯 Solution 5: Use Local Server
```bash
npm install
npm start
```
Then open `http://localhost:3000`

## Quick Test
1. Open `test-direct-api.html`
2. Click "Test Check User" 
3. Check browser console (F12) for detailed error messages

## Debug Steps
1. **Open browser console** (F12)
2. **Check Network tab** for failed requests
3. **Look for CORS errors** in the console
4. **Try different solutions** above

## Why This Happens
- Browsers block cross-origin requests for security
- Local HTML files can't make requests to external APIs
- This is a browser security feature, not an API issue
