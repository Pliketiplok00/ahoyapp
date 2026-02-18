/**
 * Metro Configuration
 *
 * Standard Expo Metro configuration with Firebase compatibility fixes.
 * Firebase JS SDK uses CommonJS modules (.cjs) which require special handling
 * in Expo SDK 53+ due to unstable_enablePackageExports being enabled by default.
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase compatibility fixes for Expo SDK 54
// Add .cjs to source extensions for Firebase's CommonJS modules
config.resolver.sourceExts.push('cjs');

// Disable package exports resolution to ensure Firebase modules resolve correctly
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
