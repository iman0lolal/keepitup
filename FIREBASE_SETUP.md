# Firebase Setup Instructions

To enable the global leaderboard, you need to set up a Firebase project. Follow these steps:

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it "Keep It Up" (or any name you prefer)
4. Disable Google Analytics (optional)
5. Click "Create project"

## 2. Set up Realtime Database

1. In your Firebase project, go to "Build" → "Realtime Database"
2. Click "Create Database"
3. Choose a location (closest to your users)
4. Start in **test mode** for now (we'll secure it later)
5. Click "Enable"

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

## 4. Update game.js

Replace the Firebase configuration in `game.js` (around line 117) with your actual config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_ID",
    appId: "YOUR_APP_ID"
};
```

## 5. Secure Your Database (Important!)

Once testing is complete, update your database rules:

1. Go to Realtime Database → Rules
2. Replace with:

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      ".write": true,
      "$score": {
        ".validate": "newData.hasChildren(['nickname', 'score', 'timestamp'])"
      }
    }
  }
}
```

This allows anyone to read/write scores but validates the data structure.

## 6. Test the Leaderboard

1. Open `index.html` in your browser
2. Enter a nickname
3. Play the game
4. Check the leaderboard to see your score!

## Notes

- The free Firebase tier includes 1GB storage and 10GB/month bandwidth
- Scores are stored permanently unless you delete them
- You can view/manage scores in the Firebase Console
