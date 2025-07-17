module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '@store': './src/store',
          '@screens': './src/screens',
          '@services': './src/services',
          '@models': './src/models',
          '@data': './src/data',
          '@constants': './src/constants',
        },
      },
    ],
  ],
};
