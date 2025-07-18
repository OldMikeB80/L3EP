const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    extraNodeModules: {
      '@store': path.resolve(__dirname, 'src/store'),
      '@screens': path.resolve(__dirname, 'src/screens'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@models': path.resolve(__dirname, 'src/models'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      // Fix metro resolution for RN 0.80 AbortController polyfill
      'abort-controller': path.resolve(__dirname, 'node_modules/abort-controller'),
      'abort-controller/dist/abort-controller': path.resolve(
        __dirname,
        'node_modules/abort-controller/dist/abort-controller',
      ),
    },
    // Custom resolver removed – handled via extraNodeModules alias above
  },
  watchFolders: [path.resolve(__dirname, 'src')],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
