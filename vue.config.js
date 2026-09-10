const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const mode = process.env.NODE_ENV || 'production'

process.env.VUE_APP_VERSION = require('./package.json').version

const { pwa } = require('./src/utils/defaults')

const publicPath = process.env.BASE_URL || '/'
const integrity = process.env.INTEGRITY === 'true'
const isServer = process.env.IS_DOCKER || process.env.IS_SERVER || false

const plugins = !isServer
  ? [
      new CopyWebpackPlugin({
        patterns: [{ from: './user-data', to: './' }],
      }),
    ]
  : []

const configureWebpack = {
  devtool: 'source-map',
  mode,
  plugins,

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: { appendTsSuffixTo: [/\.vue$/] },
      },
    ],
  },

  resolve: {
    fallback: {
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      url: require.resolve('url/'),
      timers: require.resolve('timers-browserify'),
    },
  },

  performance: {
    maxEntrypointSize: 10000000,
    maxAssetSize: 10000000,
  },
}

const userDataDir = path.join(
  __dirname,
  process.env.USER_DATA_DIR || 'user-data'
)

const devServer = {
  static: {
    directory: path.join(__dirname, 'public'),
  },
  watchFiles: {
    paths: [userDataDir],
  },
}

const pages = {
  index: {
    entry: 'src/main.js',
    filename: 'index.html',
  },
}

module.exports = {
  publicPath,
  pwa,
  integrity,
  configureWebpack,
  pages,
  devServer,

  chainWebpack: config => {
    config.plugin('eslint').tap(options => {
      if (options[0] && typeof options[0] === 'object' && options[0].extensions) {
        delete options[0].extensions
      }
      return options
    })

    config.cache({
      type: 'filesystem',
    })
  },
}
