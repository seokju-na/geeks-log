const webpack = require('webpack');
const path = require('path');
const { readdirSync, statSync } = require('fs');
const nodeExternals = require('webpack-node-externals');

const { HotModuleReplacementPlugin, WatchIgnorePlugin } = webpack;

const SRC_DIR = path.resolve(__dirname, 'src/');
const sourceDirs = readdirSync(SRC_DIR).filter(pathname =>
  statSync(path.resolve(SRC_DIR, pathname)).isDirectory(),
);

const resolveAlias = sourceDirs.reduce((alias, dir) => {
  alias[dir] = path.resolve(SRC_DIR, dir);
  return alias;
}, {});

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  watch: true,
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: resolveAlias,
  },
  plugins: [new HotModuleReplacementPlugin(), new WatchIgnorePlugin([/\.js$/, /\.d\.ts$/])],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'dev.js',
  },
};
