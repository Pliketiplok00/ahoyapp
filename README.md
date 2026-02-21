# AhoyApp

Yacht crew expense management app.

## Features

- APA (Advance Provisioning Allowance) tracking
- Receipt scanning with AI (Gemini OCR)
- Crew management & tip splitting
- Season calendar view
- Export reports (PDF, Excel, ZIP)
- Crew score/leaderboard

## Tech Stack

- React Native (Expo)
- Firebase (Auth, Firestore, Storage)
- TypeScript
- Google Gemini AI (OCR)

## Setup

1. Clone repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in Firebase/Gemini keys
4. `npx expo start`

## Environment Variables

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
EXPO_PUBLIC_GEMINI_API_KEY=
```

## Testing

```bash
npm test           # Run all tests
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm run precheck   # All checks
```

## Project Structure

```
src/
├── components/    # Shared UI components
├── config/        # Theme, Firebase config
├── features/      # Feature modules (auth, booking, expense, etc.)
├── stores/        # Zustand stores
├── types/         # TypeScript types
└── utils/         # Utility functions

app/
├── (auth)/        # Auth screens (login, join)
├── (main)/        # Main app screens
└── _layout.tsx    # Root layout
```

## License

Private - All rights reserved
