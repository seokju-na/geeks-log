const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = ({ config }) => {
  config.module.rules = [
    ...(config.module.rules || []),
    // TypeScript Config
    {
      test: /\.(js|jsx|ts|tsx)$/,
      loader: 'babel-loader',
      options: { cacheDirectory: true },
      include: [path.resolve(__dirname, '../src'), path.resolve(__dirname, '../stories')],
    },
    // Style loader:
    // https://storybook.js.org/docs/configurations/custom-webpack-config/#full-control-mode
    {
      test: /\.scss$/,
      sideEffects: true,
      loaders: ['style-loader', 'css-loader', 'sass-loader'],
      include: [path.resolve(__dirname, '../src')],
      exclude: [path.resolve(__dirname, 'node_modules')],
    },
  ];
  config.resolve.plugins = [
    ...(config.resolve.plugins || []),
    new TsconfigPathsPlugin({
      configFile: path.resolve(__dirname, '../tsconfig.json'),
    }),
  ];
  config.resolve.extensions = [...(config.resolve.extensions || []), '.ts', '.tsx'];

  return config;
};
