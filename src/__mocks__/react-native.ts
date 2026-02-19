/**
 * React Native Mock
 *
 * Mock for Jest testing of React Native components.
 */

const React = require('react');

// Mock component factory
const mockComponent = (name: string) => {
  return function MockComponent(props: Record<string, unknown>) {
    return React.createElement(name, props);
  };
};

module.exports = {
  // Core components
  View: mockComponent('View'),
  Text: mockComponent('Text'),
  TouchableOpacity: mockComponent('TouchableOpacity'),
  TextInput: mockComponent('TextInput'),
  ScrollView: mockComponent('ScrollView'),
  Modal: mockComponent('Modal'),
  Pressable: mockComponent('Pressable'),
  ActivityIndicator: mockComponent('ActivityIndicator'),
  KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
  StatusBar: mockComponent('StatusBar'),
  Image: mockComponent('Image'),

  // Platform
  Platform: {
    OS: 'ios',
    select: jest.fn((obj: Record<string, unknown>) => obj.ios),
  },

  // StyleSheet
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
    flatten: jest.fn((style: unknown) => style),
    absoluteFill: {},
    absoluteFillObject: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    hairlineWidth: 1,
  },

  // Dimensions
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  // PixelRatio
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((size: number) => size * 2),
    roundToNearestPixel: jest.fn((size: number) => size),
  },

  // Keyboard
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
  },

  // Animated
  Animated: {
    View: mockComponent('Animated.View'),
    Text: mockComponent('Animated.Text'),
    Image: mockComponent('Animated.Image'),
    ScrollView: mockComponent('Animated.ScrollView'),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => 0),
    })),
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn() })),
    parallel: jest.fn(() => ({ start: jest.fn() })),
    event: jest.fn(),
  },

  // Alert
  Alert: {
    alert: jest.fn(),
  },

  // Linking
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },
};
