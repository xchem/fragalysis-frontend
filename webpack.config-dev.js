const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const BundleTracker = require('webpack-bundle-tracker');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development',
  context: __dirname,

  devServer: {
    hot: true
  },

  entry: [
    'babel-polyfill',
    'webpack-hot-middleware/client?reload=true&path=http://localhost:3030/__webpack_hmr',
    './js/index'
  ],

  output: {
    crossOriginLoading: 'anonymous',
    path: path.resolve('./bundles'),
    filename: '[name]-[hash].js',
    publicPath: 'http://localhost:3030/bundles/' // Tell django to use this URL to load packages and not use STATIC_URL + bundle_name
  },

  devtool: 'cheap-module-source-map',

  stats: {
    // Configure the console output
    errorDetails: true, //this does show errors
    colors: true,
    modules: true,
    reasons: true
  },

  plugins: [
    new BundleTracker({ filename: './webpack-stats.json', trackAssets: true }),
    new ErrorOverlayPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(), // don't reload if there is an error
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
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  }
};
