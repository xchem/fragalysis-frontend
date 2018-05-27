const path = require("path");
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const CompressionPlugin = require("compression-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  context: __dirname,

  entry: './js/index',

  output: {
      path: path.resolve('./bundles'),
      filename: "[name]-[hash].js",
  },

  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: 'webpack-stats.json',
      trackAssets: true,}),
    new CompressionPlugin({asset: "[path].gz[query]",
      algorithm: "gzip",
      deleteOriginalAssets: true,
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8}),
  ],

  module: {
    rules: [
      { test: /\.js$/, enforce: "pre", loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, enforce: "pre",  loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  },

};
