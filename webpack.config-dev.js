const path = require("path");
const webpack = require('webpack');
const BundleTracker = require("webpack-bundle-tracker");

module.exports = {
  mode: 'development',
  context: __dirname,

  entry: [
    'webpack-hot-middleware/client?reload=true&path=http://localhost:3030/__webpack_hmr',
    './js/index'
  ],

  output: {
    path: path.resolve('./bundles'),
    filename: "[name]-[hash].js",
    publicPath: 'http://localhost:3030/bundles/', // Tell django to use this URL to load packages and not use STATIC_URL + bundle_name
  },

  stats: {
    // Configure the console output
    errorDetails: true, //this does show errors
    colors: false,
    modules: true,
    reasons: true
  },

  plugins: [
    new BundleTracker({ filename: './webpack-stats.json', trackAssets: true }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(), // don't reload if there is an error
  ],

  module: {
    rules: [
      // we pass the output from babel loader to react-hot loader
      { test: /\.js$/, enforce: "pre", loaders: ['react-hot-loader/webpack', 'babel-loader'], exclude: /node_modules/ },
      { test: /\.jsx$/, enforce: "pre", loaders: ['react-hot-loader/webpack', 'babel-loader'], exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/, loader: 'url-loader?limit=100000' },
    ]
  },
  devtool: 'source-map',
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  },

};
