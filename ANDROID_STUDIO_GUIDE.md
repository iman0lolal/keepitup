# Android Studio - Complete Setup Guide

## Step 1: Create New Project (Already Done)

You should have created:
- Project Name: Keep It Up
- Package Name: com.ima.keepitup
- Language: Java or Kotlin

---

## Step 2: Add WebView Code

### A. Update AndroidManifest.xml

Location: `app/src/main/AndroidManifest.xml`

Add this **BEFORE** the `<application>` tag:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

Inside the `<application>` tag, add:

```xml
android:usesCleartextTraffic="true"
```

Full example:
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:usesCleartextTraffic="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.KeepItUp">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

---

### B. Update activity_main.xml

Location: `app/src/main/res/layout/activity_main.xml`

Replace ALL content with:

```xml
<?xml version="1.0" encoding="utf-8"?>
<WebView xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/webview"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

---

### C. Update MainActivity (Java)

Location: `app/src/main/java/com/ima/keepitup/MainActivity.java`

Replace ALL content with:

```java
package com.ima.keepitup;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        
        // Enable JavaScript
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        
        // Keep navigation within WebView
        webView.setWebViewClient(new WebViewClient());
        
        // Load your game
        webView.loadUrl("https://juegobolaima.web.app/");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
```

---

### C. Update MainActivity (Kotlin) - If you chose Kotlin

Location: `app/src/main/kotlin/com/ima/keepitup/MainActivity.kt`

Replace ALL content with:

```kotlin
package com.ima.keepitup

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        
        // Enable JavaScript
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.databaseEnabled = true
        
        // Keep navigation within WebView
        webView.webViewClient = WebViewClient()
        
        // Load your game
        webView.loadUrl("https://juegobolaima.web.app/")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
```

---

## Step 3: Build Signed App Bundle

### A. Generate Signing Key

1. In Android Studio, go to: **Build → Generate Signed Bundle / APK**
2. Select **Android App Bundle**
3. Click **Next**
4. Click **Create new...** (under Key store path)
5. Fill in:
   - **Key store path**: Choose a location (e.g., Desktop/keepitup-key.jks)
   - **Password**: Create a strong password (SAVE THIS!)
   - **Alias**: keepitup-key
   - **Alias password**: Same as above
   - **Validity**: 25 years
   - **First and Last Name**: Your name
   - **Organization**: Your name or company
   - **Country**: ES (or your country)
6. Click **OK**

### B. Build the Bundle

1. Make sure **release** is selected (not debug)
2. Check both signature versions (V1 and V2)
3. Click **Next**
4. Click **Finish**

### C. Find Your AAB File

After building, Android Studio will show a notification with a link to the file location.

Usually: `app/release/app-release.aab`

---

## Step 4: Upload to Google Play Console

1. Go to [play.google.com/console](https://play.google.com/console)
2. Click **Create app**
3. Fill in:
   - App name: Keep It Up!
   - Default language: Spanish (or your preference)
   - App or game: Game
   - Free or paid: Free
4. Accept declarations
5. Click **Create app**

### Upload the AAB:

1. Go to **Production** → **Create new release**
2. Upload the `app-release.aab` file
3. Fill in release notes
4. Click **Save** and **Review release**

### Complete Store Listing:

You'll need:
- **App icon** (512x512) - I already created this for you
- **Screenshots** - Take 2-8 screenshots of your game
- **Feature graphic** (1024x500) - Optional but recommended
- **Short description** (80 chars): "Tap to juggle! Compete globally, unlock power-ups!"
- **Full description**: Use the one I provided earlier
- **Privacy policy URL**: Required since you use Firebase

---

## Important Notes

✅ **Save your keystore file** (`keepitup-key.jks`) and password - you'll need it for all future updates!

✅ **Test before uploading**: Run the app on a real Android device first

✅ **Version updates**: Each update needs a higher version code

---

## Quick Checklist

- [ ] AndroidManifest.xml updated with permissions
- [ ] activity_main.xml has WebView
- [ ] MainActivity loads your game URL
- [ ] Generated signing key
- [ ] Built release AAB
- [ ] Created Play Console app
- [ ] Uploaded AAB
- [ ] Completed store listing
- [ ] Submitted for review

Good luck! 🚀
