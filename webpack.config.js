const path = require("path");
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const CompressionPlugin = require("compression-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  context: __dirname,

  entry: './js/index',

  output: {
      path: path.resolve('./bundles'),
      filename: "[name]-[hash].js",
  },

  plugins: [
      new CopyWebpackPlugin([{
          from: path.resolve(__dirname, './js/src'),
          to: path.resolve(__dirname, '../build'),
      }
      ]),
      new BundleTracker({filename: './webpack-stats.json', trackAssets:true}),
      new UglifyJsPlugin({
          uglifyOptions: {
              ecma: 7,
              keep_fnames: true,
              ie8: false,
              output: {
                  comments: false
              },
          }
      }
    ),
  ],

  module: {
    rules: [
      { test: /\.js$/, enforce: "pre", loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, enforce: "pre",  loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg|ico)(\?[a-z0-9=.]+)?$/, loader: 'url-loader?limit=100000' },
    ]
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  },

};
