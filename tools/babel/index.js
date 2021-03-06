const defaultConfig = {
  presets: [
    [
      require('@babel/preset-env'),
      {
        useBuiltIns: 'entry',
        corejs: 3,
      },
    ],
    require('@babel/preset-react'),
    require('@babel/preset-typescript'),
  ],
  plugins: [
    [require('@babel/plugin-proposal-class-properties'), { loose: true }],
    require('@babel/plugin-proposal-optional-chaining'),
    require('@babel/plugin-proposal-nullish-coalescing-operator'),
    require('@babel/plugin-proposal-numeric-separator'),
  ],
};

module.exports = {
  createConfig(options = {}) {
    const { withEmotion = false, extraConfigs } = options;
    const config = { ...defaultConfig };

    if (withEmotion) {
      config.presets.push(require('@emotion/babel-preset-css-prop'));
      config.plugins.push(require('babel-plugin-emotion'));
    }

    return typeof extraConfigs === 'function' ? extraConfigs(config) : config;
  },
};
