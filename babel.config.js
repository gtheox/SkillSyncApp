module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@api': './src/api',
            '@contexts': './src/contexts',
            '@navigation': './src/navigation',
            '@utils': './src/utils',
            '@theme': './src/theme',
            '@types': './src/types',
          },
        },
      ],
    ],
  };
};
