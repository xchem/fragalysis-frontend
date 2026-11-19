const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const LegacyBundleTrackerPlugin = require('./webpack/LegacyBundleTrackerPlugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 7,
          mangle: true,
          compress: false,
          keep_fnames: true,
          ie8: false,
          format: {
            comments: false
          }
        }
      })
    ]
  },

  context: __dirname,

  entry: ['babel-polyfill', './js/publicPath', './js/index'],

  output: {
    path: path.resolve(__dirname, 'bundles'),
    filename: '[name]-[fullhash].js',
    chunkFilename: '[name]-[contenthash].js',
    publicPath: ''
  },

  stats: {
    // Configure the console output
    errorDetails: true, //this does show errors
    colors: false,
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
    new webpack.DefinePlugin({
      __FRAGALYSIS_MOORHEN_PROOF_ENABLED__: JSON.stringify(process.env.MOORHEN_PROOF_ENABLED || ''),
      __FRAGALYSIS_MOORHEN_ASSET_URL__: JSON.stringify(process.env.MOORHEN_ASSET_URL || '')
    }),
    new Dotenv()
  ],

  module: {
    rules: [
      {
        test: /contacts[\\/]vendor[\\/]detector\.mjs$/,
        type: 'asset/source'
      },
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        loader: 'babel-loader'
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

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  }
};
