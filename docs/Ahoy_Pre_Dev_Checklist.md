# Pre-Development Checklist

**Complete these steps BEFORE starting development.**

---

## 1. Firebase Setup ✅ COMPLETE

### Project Created ✅
- [x] Project: `ahoyapp-24b36`
- [x] Console: https://console.firebase.google.com/project/ahoyapp-24b36

### Authentication ✅
- [x] Email/Password enabled
- [x] Email link (passwordless sign-in) enabled

### Firestore Database ✅
- [x] Database created
- [x] Test mode enabled

### Storage ✅
- [x] Storage enabled
- [x] Blaze plan activated
- [x] Bucket: `ahoyapp-24b36.firebasestorage.app`

### Config ✅
- [x] Web app registered: `ahoyapp`
- [x] Config saved to `ahoyapp.env`

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCZTkHsNaSioAS47sE06V61hgE1vNBFZdk
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ahoyapp-24b36.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ahoyapp-24b36
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ahoyapp-24b36.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=100344123026
EXPO_PUBLIC_FIREBASE_APP_ID=1:100344123026:web:e2326612cc3ac88ab5604b
```

---

## 2. Accounts Verified

- [ ] Apple Developer Account (for iOS release)
- [ ] Google Play Console (for Android release)
- [ ] Expo Account (expo.dev)

Note: These are needed for release, not for development.

---

## 3. Development Environment

- [ ] Node.js installed (v18 or later)
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] VS Code or other editor installed
- [ ] Xcode installed (for iOS simulator) — Mac only
- [ ] Android Studio installed (for Android emulator)
- [ ] Expo Go app on physical devices (optional but helpful)

---

## 4. Project Folder

- [ ] Create project folder: `ahoyapp`
- [ ] Create `/docs` subfolder
- [ ] Copy all documentation files to `/docs`:
  - `product-brief.md`
  - `tech-spec.md`
  - `screen-map.md`
  - `developer-guide.md`
  - `project-plan.md`
  - `claude-instructions.md`
- [ ] Create `/docs/logs` subfolder for session logs

---

## 5. Ready to Start

When all above is done:

1. Give Claude Code access to the project folder
2. Share the Firebase config
3. Tell Claude Code: "Read /docs/claude-instructions.md and start Phase 0"

---

## Firebase Config Template

Create this file at `/config/firebase-config.txt` (Claude Code will use it):

```
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=ahoyapp-24b36.firebaseapp.com
FIREBASE_PROJECT_ID=ahoyapp-24b36
FIREBASE_STORAGE_BUCKET=ahoyapp-24b36.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

---

## Questions?

If anything is unclear, ask before proceeding. It's easier to clarify now than fix later.
