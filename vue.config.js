/**
 * Shipyard is built using Vue (2). This is the main Vue and Webpack configuration
 *
 * User Configurable Options:
 * - NODE_ENV: Sets the app mode (production, development, test).
 * - BASE_URL: Root URL for the app deployment (defaults to '/').
 * - INTEGRITY: Enables SRI, set to 'true' to activate.
 * - USER_DATA_DIR: Sets an alternative dir for user data (defaults ./user-data).
 * - IS_DOCKER: Indicates if running in a Docker container.
 * - IS_SERVER: Indicates if running as a server (as opposed to static build).
 *
 * Documentation:
 * - Vue CLI Config options: https://cli.vuejs.org/config
 * - For Shipyard docs, see the repo: https://github.com/khulnasoft/shipyard
 *
 * Note: ES7 syntax is not supported in this configuration context.
 * Licensed under the MIT License, (C) KhulnaSoft Ltd 2024 (see LICENSE for details).
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

// Get app mode: production, development, or test
const mode = process.env.NODE_ENV || 'production';

// Get current version
process.env.VUE_APP_VERSION = require('./package.json').version;

// Get default info for PWA
const { pwa } = require('./src/utils/defaults');

// Get base URL
const publicPath = process.env.BASE_URL || '/';

// Should enable Subresource Integrity (SRI) on link and script tags
const integrity = process.env.INTEGRITY === 'true';

// If neither env vars are set, then it's a static build
const isServer = process.env.IS_DOCKER || process.env.IS_SERVER || false;

// Use copy-webpack-plugin to copy user-data to dist IF not running as a server
const plugins = !isServer ? [
  new CopyWebpackPlugin({
    patterns: [
      { from: './user-data', to: './' },
    ],
  }),
] : [];

// Webpack Config
const configureWebpack = {
  devtool: 'source-map',
  mode,
  plugins: [
    ...plugins,
    new NodePolyfillPlugin(),
  ],
  module: {
    rules: [
      { test: /.svg$/, loader: 'vue-svg-loader' },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: { appendTsSuffixTo: [/\.vue$/] },
      },
      {
        test: /\.(woff2?|ttf|eot)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },
  resolve: {
    fallback: {
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      timers: require.resolve('timers-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      assert: require.resolve('assert/'),
      fs: false,
      tls: false,
      net: false,
      path: false,
      zlib: false,
      os: false,
    },
  },
  performance: {
    maxEntrypointSize: 10000000,
    maxAssetSize: 10000000,
  },
  // Add output configuration to ensure unique filenames
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
  },
};

// Development server config
const devServer = {
  static: {
    directory: path.join(__dirname, 'public'),
    publicPath: '/',
    watch: true,
    staticOptions: {
      fallthrough: true,
    },
  },
  historyApiFallback: true,
  // Add additional static content from user-data directory
  setupMiddlewares: (middlewares, devServer) => {
    devServer.app.use(
      '/',
      require('express').static(
        path.join(__dirname, process.env.USER_DATA_DIR || 'user-data'),
      ),
    );
    return middlewares;
  },
};

// Application pages
const pages = {
  shipyard: {
    entry: 'src/main.js',
    filename: 'index.html',
  },
};

// Export the main Vue app config
module.exports = {
  publicPath,
  pwa: {
    name: 'Shipyard',
    manifestPath: 'manifest.[hash:8].json',
    manifestOptions: {
      background_color: '#ffffff',
      display: 'standalone',
      name: 'Shipyard',
      short_name: 'Shipyard',
      start_url: '.',
      theme_color: '#4DBA87',
    },
    workboxOptions: {
      exclude: [/\.map$/, /_redirects/],
      skipWaiting: true,
    },
  },
  integrity,
  configureWebpack: {
    ...configureWebpack,
    output: {
      ...configureWebpack.output,
      // Ensure unique filename for manifest
      filename: (pathData) => (pathData.chunk.name === 'manifest'
        ? 'js/[name].[hash:8].js'
        : configureWebpack.output.filename),
    },
  },
  pages,
  devServer,
  chainWebpack: config => {
    config.module.rules.delete('svg');
    config.cache({
      type: 'filesystem',
    });
  },
};
