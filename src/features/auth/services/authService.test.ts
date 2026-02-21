/**
 * Auth Service Tests
 *
 * Tests for authentication service.
 * Uses mocked Firebase for unit testing.
 */

import {
  sendSignInLinkToEmail,
  signInAnonymously,
  signOut as firebaseSignOut,
  isSignInWithEmailLink,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  sendSignInLinkToEmail: jest.fn().mockResolvedValue(undefined),
  signInAnonymously: jest.fn().mockResolvedValue({ user: { uid: 'test-uid' } }),
  signOut: jest.fn().mockResolvedValue(undefined),
  isSignInWithEmailLink: jest.fn().mockReturnValue(false),
  onAuthStateChanged: jest.fn(),
  signInWithEmailLink: jest.fn(),
}));

// Mock Firebase config
jest.mock('../../../config/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({ exists: () => false }),
  setDoc: jest.fn().mockResolvedValue(undefined),
  serverTimestamp: jest.fn().mockReturnValue({}),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock theme
jest.mock('../../../config/theme', () => ({
  USER_COLORS: ['#ff0000', '#00ff00', '#0000ff'],
}));

// Mock Zustand stores
jest.mock('../../../stores/seasonStore', () => ({
  useSeasonStore: {
    getState: () => ({
      setCurrentSeasonId: jest.fn(),
    }),
  },
}));

jest.mock('../../../stores/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      setStatus: jest.fn(),
    }),
  },
}));

// Import after mocks
import {
  sendMagicLink,
  signOut,
  isMagicLink,
  getCurrentUser,
} from './authService';

// Helper to set NODE_ENV
const setNodeEnv = (value: string) => {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value,
    writable: true,
    configurable: true,
  });
};

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset NODE_ENV for each test
    setNodeEnv('test');
  });

  describe('sendMagicLink', () => {
    describe('email validation (tests isValidEmail indirectly)', () => {
      it('rejects empty email', async () => {
        const result = await sendMagicLink('');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid email address');
        expect(sendSignInLinkToEmail).not.toHaveBeenCalled();
      });

      it('rejects email without @', async () => {
        const result = await sendMagicLink('invalid-email');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid email address');
      });

      it('rejects email without domain', async () => {
        const result = await sendMagicLink('test@');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid email address');
      });

      it('rejects email with spaces', async () => {
        const result = await sendMagicLink('test @test.com');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid email address');
      });

      it('accepts valid email', async () => {
        const result = await sendMagicLink('valid@test.com');
        expect(result.success).toBe(true);
        expect(sendSignInLinkToEmail).toHaveBeenCalled();
      });

      it('normalizes email to lowercase', async () => {
        await sendMagicLink('USER@EXAMPLE.COM');
        expect(sendSignInLinkToEmail).toHaveBeenCalledWith(
          expect.anything(),
          'user@example.com',
          expect.any(Object)
        );
      });

      it('trims whitespace from email', async () => {
        await sendMagicLink('  user@example.com  ');
        expect(sendSignInLinkToEmail).toHaveBeenCalledWith(
          expect.anything(),
          'user@example.com',
          expect.any(Object)
        );
      });
    });

    describe('Firebase integration', () => {
      it('calls sendSignInLinkToEmail with correct parameters', async () => {
        await sendMagicLink('user@example.com');

        expect(sendSignInLinkToEmail).toHaveBeenCalledWith(
          expect.anything(), // auth instance
          'user@example.com',
          expect.objectContaining({
            handleCodeInApp: true,
            url: expect.any(String),
          })
        );
      });

      it('stores email in AsyncStorage for later verification', async () => {
        await sendMagicLink('user@example.com');

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@ahoy/auth_email',
          'user@example.com'
        );
      });

      it('handles Firebase errors gracefully', async () => {
        (sendSignInLinkToEmail as jest.Mock).mockRejectedValueOnce({
          code: 'auth/network-request-failed',
        });

        const result = await sendMagicLink('user@example.com');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Network error. Please check your connection.');
      });

      it('handles unknown errors', async () => {
        (sendSignInLinkToEmail as jest.Mock).mockRejectedValueOnce(
          new Error('Unknown error')
        );

        const result = await sendMagicLink('user@example.com');

        expect(result.success).toBe(false);
        expect(result.error).toBe('An unexpected error occurred.');
      });
    });

    describe('dev bypass', () => {
      beforeEach(() => {
        setNodeEnv('development');
      });

      it('uses anonymous auth for dev1@ahoy.test in dev mode', async () => {
        const result = await sendMagicLink('dev1@ahoy.test');

        expect(result.success).toBe(true);
        expect(result.devBypassed).toBe(true);
        expect(signInAnonymously).toHaveBeenCalled();
        expect(sendSignInLinkToEmail).not.toHaveBeenCalled();
      });

      it('uses anonymous auth for dev2@ahoy.test in dev mode', async () => {
        const result = await sendMagicLink('dev2@ahoy.test');

        expect(result.success).toBe(true);
        expect(result.devBypassed).toBe(true);
      });

      it('uses anonymous auth for dev3@ahoy.test in dev mode', async () => {
        const result = await sendMagicLink('dev3@ahoy.test');

        expect(result.success).toBe(true);
        expect(result.devBypassed).toBe(true);
      });

      it('does NOT bypass for non-dev emails in dev mode', async () => {
        await sendMagicLink('real@user.com');

        expect(signInAnonymously).not.toHaveBeenCalled();
        expect(sendSignInLinkToEmail).toHaveBeenCalled();
      });

      it('does NOT bypass in production mode', async () => {
        setNodeEnv('production');

        await sendMagicLink('dev1@ahoy.test');

        expect(signInAnonymously).not.toHaveBeenCalled();
        expect(sendSignInLinkToEmail).toHaveBeenCalled();
      });
    });
  });

  describe('signOut', () => {
    it('calls Firebase signOut', async () => {
      await signOut();
      expect(firebaseSignOut).toHaveBeenCalled();
    });

    it('clears stored email from AsyncStorage', async () => {
      await signOut();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@ahoy/auth_email');
    });
  });

  describe('isMagicLink', () => {
    it('delegates to Firebase isSignInWithEmailLink', () => {
      (isSignInWithEmailLink as jest.Mock).mockReturnValue(true);

      const result = isMagicLink('https://example.com/auth?code=123');

      expect(isSignInWithEmailLink).toHaveBeenCalledWith(
        expect.anything(),
        'https://example.com/auth?code=123'
      );
      expect(result).toBe(true);
    });

    it('returns false for non-magic-link URLs', () => {
      (isSignInWithEmailLink as jest.Mock).mockReturnValue(false);

      const result = isMagicLink('https://example.com/random');

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no user is logged in', () => {
      const result = getCurrentUser();
      expect(result).toBeNull();
    });
  });

  // TODO Phase 11: Firebase Emulator integration tests
  // - Test actual magic link flow end-to-end
  // - Test auth state persistence
  // - Test concurrent auth sessions
});

describe('getAuthErrorMessage (tested indirectly)', () => {
  it('maps auth/invalid-email to user-friendly message', async () => {
    (sendSignInLinkToEmail as jest.Mock).mockRejectedValueOnce({
      code: 'auth/invalid-email',
    });

    const result = await sendMagicLink('valid@test.com');
    expect(result.error).toBe('Invalid email address.');
  });

  it('maps auth/expired-action-code to user-friendly message', async () => {
    (sendSignInLinkToEmail as jest.Mock).mockRejectedValueOnce({
      code: 'auth/expired-action-code',
    });

    const result = await sendMagicLink('valid@test.com');
    expect(result.error).toBe('This link has expired. Please request a new one.');
  });

  it('maps auth/too-many-requests to user-friendly message', async () => {
    (sendSignInLinkToEmail as jest.Mock).mockRejectedValueOnce({
      code: 'auth/too-many-requests',
    });

    const result = await sendMagicLink('valid@test.com');
    expect(result.error).toBe('Too many attempts. Please try again later.');
  });

  it('returns generic message for unknown error codes', async () => {
    (sendSignInLinkToEmail as jest.Mock).mockRejectedValueOnce({
      code: 'auth/unknown-error',
    });

    const result = await sendMagicLink('valid@test.com');
    expect(result.error).toBe('An error occurred. Please try again.');
  });
});
