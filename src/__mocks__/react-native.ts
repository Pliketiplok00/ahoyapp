/**
 * React Native Mock
 *
 * Mock for Jest testing of React Native components.
 */

import React from 'react';

// Mock component factory
const mockComponent = (name: string) => {
  return function MockComponent(props: Record<string, unknown>) {
    return React.createElement(name, props);
  };
};

// Core components
export const View = mockComponent('View');
export const Text = mockComponent('Text');
export const TouchableOpacity = mockComponent('TouchableOpacity');
export const TextInput = mockComponent('TextInput');
export const ScrollView = mockComponent('ScrollView');
export const Modal = mockComponent('Modal');
export const Pressable = mockComponent('Pressable');
export const ActivityIndicator = mockComponent('ActivityIndicator');
export const KeyboardAvoidingView = mockComponent('KeyboardAvoidingView');
export const StatusBar = mockComponent('StatusBar');
export const Image = mockComponent('Image');

// Platform
export const Platform = {
  OS: 'ios',
  select: jest.fn((obj: Record<string, unknown>) => obj.ios),
};

// StyleSheet
export const StyleSheet = {
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
};

// Dimensions
export const Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 812 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// PixelRatio
export const PixelRatio = {
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size: number) => size * 2),
  roundToNearestPixel: jest.fn((size: number) => size),
};

// Keyboard
export const Keyboard = {
  dismiss: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
};

// Animated
export const Animated = {
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
};

// Alert
export const Alert = {
  alert: jest.fn(),
};

// Linking
export const Linking = {
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
};
