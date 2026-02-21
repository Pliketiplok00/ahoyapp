/**
 * Babel Configuration
 *
 * Standard Expo configuration with module-resolver for path aliases.
 * Aliases match tsconfig.json paths configuration.
 */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/features': './src/features',
            '@/config': './src/config',
            '@/constants': './src/constants',
            '@/hooks': './src/hooks',
            '@/services': './src/services',
            '@/stores': './src/stores',
            '@/types': './src/types',
            '@/utils': './src/utils',
          },
        },
      ],
    ],
  };
};
