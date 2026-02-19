# Auth Feature

Handles authentication flow using Firebase Auth with magic link (passwordless) authentication.

## Structure

```
src/features/auth/
├── README.md           ← This file
├── index.ts            ← Public exports
├── types.ts            ← Auth types
├── components/         ← (empty - no UI components yet)
├── hooks/
│   ├── index.ts
│   ├── useAuth.ts      ← Main auth hook
│   └── useDeepLinkAuth.ts ← Deep link handling for magic links
└── services/
    ├── index.ts
    └── authService.ts  ← Firebase auth operations
```

## Usage

### Check Auth State

```tsx
import { useAuth } from '../features/auth';

function MyComponent() {
  const { isAuthenticated, isLoading, firebaseUser } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <LoginScreen />;

  return <MainApp user={firebaseUser} />;
}
```

### Send Magic Link

```tsx
import { useAuth } from '../features/auth';

function LoginScreen() {
  const { sendMagicLink, isLoading, error } = useAuth();

  const handleLogin = async (email: string) => {
    const result = await sendMagicLink(email);
    if (result.success) {
      // Show "check your email" message
      // If dev bypass, auth state changes automatically
    }
  };
}
```

### Sign Out

```tsx
const { signOut } = useAuth();

const handleLogout = async () => {
  await signOut();
  // User is now logged out, auth state will update
};
```

## Dev Bypass

In development, these emails bypass magic link and use anonymous auth:
- `test@test.com`
- `dev@test.com`
- `admin@test.com`

## Service Methods

| Method | Description |
|--------|-------------|
| `sendMagicLink(email)` | Send magic link email |
| `handleDeepLink(url)` | Process magic link callback |
| `signOut()` | Sign out current user |

## Auth Store

Auth state is managed in `src/stores/authStore.ts` using Zustand with AsyncStorage persistence.

| State | Type | Description |
|-------|------|-------------|
| `firebaseUser` | `User \| null` | Firebase user object |
| `isAuthenticated` | `boolean` | Login status |
| `isLoading` | `boolean` | Auth operation in progress |
| `error` | `string \| null` | Last error message |

## Related Docs

- [Product Brief: §19 Onboarding Flow](/docs/Ahoy_Brief_v2.md)
- [Tech Spec: §8.1 useAuth](/docs/Ahoy_Tech_Spec.md)
