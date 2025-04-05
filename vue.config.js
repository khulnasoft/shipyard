const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');

// Get app mode: production, development, or test
const mode = process.env.NODE_ENV || 'production';

// Get current version
process.env.VUE_APP_VERSION = require('./package.json').version;

// Default PWA configuration
const pwaConfig = {
  name: 'Shipyard',
  themeColor: '#4DBA87',
  msTileColor: '#000000',
  appleMobileWebAppCapable: 'yes',
  appleMobileWebAppStatusBarStyle: 'black',
  workboxPluginMode: 'GenerateSW',
  workboxOptions: {
    navigateFallback: '/index.html',
    runtimeCaching: [
      {
        urlPattern: new RegExp('^https://'),
        handler: 'NetworkFirst',
        options: {
          networkTimeoutSeconds: 20,
          cacheName: 'https-calls',
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
};

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

// Add Node polyfill plugins
plugins.push(
  new webpack.ProvidePlugin({
    process: 'process/browser',
    Buffer: ['buffer', 'Buffer'],
  }),
);

// Add compression plugin for production
if (mode === 'production') {
  plugins.push(
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
  );
}

// Webpack Config
const configureWebpack = {
  devtool: mode === 'development' ? 'eval-source-map' : 'source-map',
  mode,
  plugins,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: mode === 'development',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
        include: [
          path.resolve(__dirname, 'src/assets/fonts'),
          path.resolve(__dirname, 'src/assets/widget-resources'),
        ],
      },
    ],
    noParse: /node_modules\/(bcrypt|node-pre-gyp)\//,
  },
  performance: {
    maxEntrypointSize: 10000000,
    maxAssetSize: 10000000,
    hints: mode === 'production' ? 'warning' : false,
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify'),
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      timers: require.resolve('timers-browserify'),
      zlib: require.resolve('browserify-zlib'),
      util: require.resolve('util/'),
      assert: require.resolve('assert/'),
      url: require.resolve('url/'),
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser'),
    },
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'public'),
      '~@': path.resolve(__dirname, 'src'),
    },
  },
  externals: [
    function handleExternals({ request }, callback) {
      if (/bcrypt/.test(request) || /@mapbox\/node-pre-gyp/.test(request)) {
        return callback(null, `commonjs ${request}`);
      }
      return callback();
    },
  ],
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    clean: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            if (!module.context) {
              return 'vendor.unknown';
            }

            const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
            if (!match || !match[1]) {
              return 'vendor.unknown';
            }

            const packageName = match[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
};

// Development server config
const devServer = {
  static: {
    directory: path.join(__dirname, 'public'),
    publicPath: '/',
    watch: true,
  },
  historyApiFallback: true,
  devMiddleware: {
    publicPath: '/',
  },
  hot: true,
  client: {
    overlay: {
      errors: true,
      warnings: false,
    },
  },
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
  },
};

// Application pages
const pages = {
  index: {
    entry: 'src/main.js',
    filename: 'index.html',
    template: 'public/index.html',
    title: 'Shipyard',
    // Add specific HTML options to handle asset generation properly
    chunks: ['chunk-vendors', 'chunk-common', 'index'],
    templateParameters: {
      BASE_URL: publicPath,
    },
  },
};

// Export the main Vue app config
module.exports = {
  publicPath,
  pwa: pwaConfig,
  integrity,
  // Configuration for production builds
  filenameHashing: true,
  productionSourceMap: mode !== 'production',
  configureWebpack: {
    ...configureWebpack,
    module: {
      ...configureWebpack.module,
      rules: [
        ...configureWebpack.module.rules,
      ],
    },
  },
  pages,
  devServer,
  css: {
    extract: process.env.NODE_ENV === 'production',
  },
  chainWebpack: config => {
    // Remove default SVG rule to avoid conflicts
    config.module.rules.delete('svg');

    // Enable filesystem caching
    config.cache({
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      compression: 'gzip',
      maxAge: 86400000,
      name: mode === 'production' ? 'production-cache' : 'development-cache',
      version: process.env.VUE_APP_VERSION || '1.0.0',
    });

    // Handle SVG files
    config.module
      .rule('svg')
      .test(/\.svg$/)
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .end()
      .end()
      .oneOf('external')
      .type('asset/resource')
      .set('generator', {
        filename: 'img/[name].[hash:8][ext]',
      });

    // Configure CSS loader
    const cssRule = config.module.rule('css');
    const sassRule = config.module.rule('scss');
    const lessRule = config.module.rule('less');
    const stylRule = config.module.rule('stylus');

    const addStyleResource = (rule) => {
      rule.oneOf('vue-modules').resourceQuery(/module/)
        .use('css-loader')
        .tap(options => ({ ...options, url: false }));

      rule.oneOf('vue').use('css-loader')
        .tap(options => ({ ...options, url: false }));

      rule.oneOf('normal-modules').test(/\.module\.\w+$/)
        .use('css-loader')
        .tap(options => ({ ...options, url: false }));

      rule.oneOf('normal').use('css-loader')
        .tap(options => ({ ...options, url: false }));
    };

    addStyleResource(cssRule);
    addStyleResource(sassRule);
    addStyleResource(lessRule);
    addStyleResource(stylRule);

    // Enable minification in production
    if (mode === 'production') {
      config.optimization.minimize(true);
    }

    // Handle HTML processing to prevent legacy assets issue
    config.plugin('html-index').tap((args) => {
      const newArgs = [...args];
      if (newArgs[0]) {
        newArgs[0].minify = mode === 'production' ? {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: false,
          collapseBooleanAttributes: true,
          removeScriptTypeAttributes: true,
        } : false;
        // Ensure proper asset handling
        newArgs[0].inject = true;
        newArgs[0].chunksSortMode = 'auto';
      }
      return newArgs;
    });
    // Ensure modern mode is disabled to prevent legacy assets issues
    // Get all plugin names
    const pluginNames = Object.keys(config.plugins.entries() || {});

    // Find and remove any legacy/modern plugins by name
    pluginNames.forEach(name => {
      const plugin = config.plugins.get(name);
      if (plugin && plugin.constructor && plugin.constructor.name
          && (plugin.constructor.name.includes('Modern')
           || plugin.constructor.name.includes('Legacy'))) {
        config.plugins.delete(name);
      }
    });

    // Override any legacy asset plugins that might be added later in the build process
    const originalProcessWebpackConfig = config.toConfig;
    // eslint-disable-next-line func-names, no-param-reassign
    config.toConfig = function () {
      const webpackConfig = originalProcessWebpackConfig.apply(this);
      // Ensure no legacy/modern plugins are in the final config
      if (webpackConfig.plugins) {
        // eslint-disable-next-line max-len
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => !(plugin && plugin.constructor && plugin.constructor.name && (plugin.constructor.name.includes('Modern') || plugin.constructor.name.includes('Legacy'))));
      }
      return webpackConfig;
    };
  },
};
