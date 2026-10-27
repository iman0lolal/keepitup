# Publishing to Google Play Store - Complete Guide

Your game is currently a web app (HTML/CSS/JS). To publish it on the Play Store, you need to convert it into an Android app using one of these methods:

## Option 1: Trusted Web Activity (TWA) - Recommended ✅

TWA allows you to package your web app as a native Android app without writing Java/Kotlin code.

### Prerequisites
- Google Play Console account ($25 one-time fee)
- Android Studio installed
- Your game hosted on a public HTTPS URL (required!)

### Steps:

#### 1. Host Your Game Online
You need to host your game on a web server with HTTPS. Options:
- **Firebase Hosting** (Free, recommended)
- **Netlify** (Free)
- **Vercel** (Free)
- **GitHub Pages** (Free, but needs custom domain for HTTPS)

**Firebase Hosting Setup:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize in your game folder
cd "c:/Users/imano/Desktop/prog juegos"
firebase init hosting

# Deploy
firebase deploy
```

#### 2. Use Bubblewrap to Create Android App

Bubblewrap is Google's official tool for creating TWAs.

```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize your app
bubblewrap init --manifest https://your-game-url.web.app

# Build the app
bubblewrap build

# This creates an .aab file (Android App Bundle)
```

#### 3. Sign Your App

```bash
# Generate signing key
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias

# Sign the bundle (Bubblewrap does this automatically)
```

#### 4. Upload to Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Upload the `.aab` file from `app-release-bundle.aab`
4. Fill in store listing, screenshots, etc.
5. Submit for review

---

## Option 2: Capacitor (More Control)

Capacitor by Ionic allows more native features and customization.

### Steps:

```bash
# Install Capacitor
npm init -y
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Initialize Capacitor
npx cap init

# Add Android platform
npx cap add android

# Copy web files
npx cap copy

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle/APK
2. Choose "Android App Bundle"
3. Create/select signing key
4. Build release bundle
5. Upload to Play Console

---

## Option 3: Apache Cordova

```bash
# Install Cordova
npm install -g cordova

# Create project
cordova create KeepItUp com.yourname.keepitup KeepItUp

# Copy your files to www/ folder
# Replace everything in www/ with your game files

# Add Android platform
cordova platform add android

# Build release
cordova build android --release

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks platforms/android/app/build/outputs/bundle/release/app-release.aab my-key-alias
```

---

## Required Assets for Play Store

Before uploading, prepare:

### 1. App Icon
- 512x512 PNG (for Play Store listing)
- Adaptive icon (foreground + background layers)

### 2. Screenshots
- At least 2 screenshots
- Recommended: 1080x1920 (portrait) or 1920x1080 (landscape)
- Show gameplay, shop, leaderboard

### 3. Feature Graphic
- 1024x500 PNG
- Banner image for store listing

### 4. Privacy Policy
- Required if you collect data (you do - Firebase leaderboard)
- Host it on a public URL

### 5. App Details
- Title: "Keep It Up!"
- Short description (80 chars)
- Full description (4000 chars)
- Category: Games → Casual
- Content rating: Everyone

---

## Quick Start: Firebase + Bubblewrap (Easiest)

```bash
# 1. Install tools
npm install -g firebase-tools @bubblewrap/cli

# 2. Deploy to Firebase
cd "c:/Users/imano/Desktop/prog juegos"
firebase login
firebase init hosting
firebase deploy

# 3. Create manifest.json in your game folder
# (See below)

# 4. Build Android app
bubblewrap init --manifest https://your-project.web.app/manifest.json
bubblewrap build

# 5. Upload app-release-bundle.aab to Play Console
```

---

## Create manifest.json

Add this file to your game folder:

```json
{
  "name": "Keep It Up!",
  "short_name": "Keep It Up",
  "description": "Tap to keep the ball juggling!",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#1e1b4b",
  "theme_color": "#38bdf8",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Important Notes

⚠️ **HTTPS Required**: Your game MUST be hosted on HTTPS for TWA to work
⚠️ **Firebase Config**: Make sure your Firebase config is correct and database is accessible
⚠️ **Testing**: Test the APK on a real Android device before uploading
⚠️ **Review Time**: Google review takes 1-7 days
⚠️ **Updates**: When you update your web game, users get updates automatically (TWA benefit!)

---

## Recommended Workflow

1. ✅ Host game on Firebase Hosting (free, HTTPS included)
2. ✅ Create manifest.json
3. ✅ Use Bubblewrap to generate Android app
4. ✅ Test on Android device
5. ✅ Upload to Play Console
6. ✅ Future updates: Just update Firebase Hosting!

This is the easiest path and doesn't require Android Studio or coding knowledge!
