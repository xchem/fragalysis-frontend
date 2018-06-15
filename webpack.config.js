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
    new BundleTracker({filename: './webpack-stats.json', trackAssets:true}),
    new UglifyJsPlugin(),
  ],

  module: {
    rules: [
      { test: /\.js$/, enforce: "pre", loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, enforce: "pre",  loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ],

      loaders: [{
      test: /\.jsx?$/,
      include: path.join(__dirname, '/client/src'),
      loader: 'babel-loader',
      query: {
        presets: ["react", "es2015", "stage-1"]
      }
    },
    {
      test: /\.(gif|svg|jpg|png)$/,
      loader: "file-loader",
    }],
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  },

};
