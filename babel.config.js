/**
 * Babel Configuration
 *
 * Standard Expo configuration.
 */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
