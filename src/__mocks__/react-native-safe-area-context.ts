/**
 * React Native Safe Area Context Mock
 *
 * Mock for Jest testing.
 */

const React = require('react');

// Mock SafeAreaView component
export const SafeAreaView = (props: Record<string, unknown>) => {
  return React.createElement('SafeAreaView', props);
};

// Mock SafeAreaProvider
export const SafeAreaProvider = (props: Record<string, unknown>) => {
  return React.createElement('SafeAreaProvider', props);
};

// Mock useSafeAreaInsets hook
export const useSafeAreaInsets = () => ({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

// Mock useSafeAreaFrame hook
export const useSafeAreaFrame = () => ({
  x: 0,
  y: 0,
  width: 375,
  height: 812,
});

// Mock initialWindowMetrics
export const initialWindowMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
};
