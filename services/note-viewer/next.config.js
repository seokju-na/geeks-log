const withPlugins = require('next-compose-plugins');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const sassPlugin = [
  require('@zeit/next-sass'),
  {
    cssModules: true,
    sassLoaderOptions: {
      includePaths: [path.resolve(__dirname, 'node_modules')],
    },
    cssLoaderOptions: IS_PRODUCTION ? undefined : {
      localIdentName: '[folder]__[local]-[hash:base64:5]',
      url: false,
    },
  },
];

module.exports = withPlugins([
  require('@zeit/next-css'),
  sassPlugin,
  require('@zeit/next-typescript'),
], {
  webpack(config, { isServer }) {
    if (isServer) {
      config.plugins.push(
        new ForkTsCheckerWebpackPlugin({
          tsconfig: path.resolve('./tsconfig.json'),
        }),
      );
    }

    return config;
  },
  env: {
    NOTE_DATA: JSON.stringify({
      value: 'ha1ha',
    }),
  },
});
