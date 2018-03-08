var path = require("path");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  context: __dirname,

  entry: './js/index',

  output: {
      path: path.resolve('./bundles'),
      filename: "[name]-[hash].js",
  },

  plugins: [
    new BundleTracker({filename: 'webpack-stats.json'}),
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