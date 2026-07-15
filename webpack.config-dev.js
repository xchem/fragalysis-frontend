const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const LegacyBundleTrackerPlugin = require('./webpack/LegacyBundleTrackerPlugin');
const DEV_SERVER_PORT = Number(process.env.DEV_SERVER_PORT || 3030);
const DEV_SERVER_ORIGIN = `http://localhost:${DEV_SERVER_PORT}`;

module.exports = {
  mode: 'development',
  context: __dirname,

  entry: [
    'babel-polyfill',
    `webpack-hot-middleware/client?reload=true&path=${DEV_SERVER_ORIGIN}/__webpack_hmr`,
    './js/index'
  ],

  output: {
    crossOriginLoading: 'anonymous',
    path: path.resolve(__dirname, 'bundles'),
    filename: '[name]-[fullhash].js',
    publicPath: `${DEV_SERVER_ORIGIN}/bundles/` // Tell django to use this URL to load packages and not use STATIC_URL + bundle_name
  },

  devtool: 'cheap-module-source-map',

  stats: {
    // Configure the console output
    errorDetails: true, //this does show errors
    colors: true,
    modules: true,
    reasons: true
  },

  // react-datepicker probes for its optional date-fns-tz dependency dynamically.
  ignoreWarnings: [
    {
      module: /react-datepicker[\\/]dist[\\/]index\.es\.js$/,
      message: /Critical dependency: the request of a dependency is an expression/i
    }
  ],

  plugins: [
    new LegacyBundleTrackerPlugin({ path: __dirname }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      __FRAGALYSIS_VIEWER_ENGINE__: JSON.stringify(process.env.VIEWER_ENGINE || '')
    }),
    new Dotenv(),
    new ReactRefreshWebpackPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            plugins: [require.resolve('react-refresh/babel')].filter(Boolean)
          }
        }
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 100000
          }
        }
      }
    ]
  },
  optimization: {
    emitOnErrors: false,
    moduleIds: 'named'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  }
};
