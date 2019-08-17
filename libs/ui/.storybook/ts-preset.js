// https://github.com/storybookjs/storybook/issues/7196
const path = require('path');

async function managerWebpack(baseConfig) {
  baseConfig.resolve.extensions.push('.ts', '.tsx');
  baseConfig.module.rules.push({
    test: /\.(js|jsx|ts|tsx)$/,
    loader: 'babel-loader',
    include: [
      path.resolve(__dirname, '../.storybook'),
      path.resolve(__dirname, '../src'),
      path.resolve(__dirname, '../stories'),
    ],
  });
  return baseConfig;
}

module.exports = {
  managerWebpack: managerWebpack,
};
