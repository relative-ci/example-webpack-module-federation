const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleStatsWebpackPlugin } = require('bundle-stats-webpack-plugin');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const { RelativeCiAgentWebpackPlugin } = require('@relative-ci/agent');

const SRC_DIR = path.resolve(__dirname, 'src');
const OUT_DIR = path.resolve(__dirname, 'dist');

module.exports = {
  context: SRC_DIR,
  entry: './main.js',
  output: {
    path: OUT_DIR,
    filename: '[name].bundle.[contenthash].js',
    chunkFilename: '[name].chunk.[contenthash].js',
    assetModuleFilename: '[path][name].[contenthash][ext][query]',
    hashDigestLength: 8,
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: [SRC_DIR],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new StatsWriterPlugin({
      filename: '../artifacts/webpack-stats--plugin.json',
      stats: {
        assets: true,
        modules: true,
        excludeAssets: [/bundle-stats.html/],
      },
    }),
    new BundleStatsWebpackPlugin({
      stats: {
        excludeAssets: [/bundle-stats.html/],
      },
    }),
    new HtmlPlugin({
      title: 'Example webpack code splitting',
      template: './index.html',
      publicPath: '/',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].bundle.[contenthash].css',
      chunkFilename: '[name].chunk.[contenthash].css',
    }),
    new webpack.container.ModuleFederationPlugin({
      name: 'MFApp',
      remotes: {
        mfcomponents: 'mfcomponents@http://localhost:8080/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
        classnames: { singleton: true, eager: true },
      },
    }),
    new RelativeCiAgentWebpackPlugin(),
  ],
  stats: {
    preset: 'errors-only',
    assets: true,
    modules: true,
    excludeAssets: [/bundle-stats.html/, /webpack-stats/],
  },
  devServer: {
    historyApiFallback: true,
  },
};
