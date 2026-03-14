/**
 * Expo Router Mock
 *
 * Mock for Jest testing.
 */

// Mock useRouter hook
export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  setParams: jest.fn(),
});

// Mock useLocalSearchParams hook
export const useLocalSearchParams = () => ({});

// Mock useGlobalSearchParams hook
export const useGlobalSearchParams = () => ({});

// Mock useSegments hook
export const useSegments = () => [];

// Mock usePathname hook
export const usePathname = () => '/';

// Mock useFocusEffect hook
export const useFocusEffect = jest.fn();

// Mock Link component
export const Link = jest.fn(() => null);

// Mock Redirect component
export const Redirect = jest.fn(() => null);

// Mock Stack component
export const Stack = jest.fn(() => null);

// Mock Tabs component
export const Tabs = jest.fn(() => null);
