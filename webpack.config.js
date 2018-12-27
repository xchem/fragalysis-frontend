const path = require("path");
const webpack = require('webpack');
const BundleTracker = require("webpack-bundle-tracker");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {

  optimization: {
      minimizer: [new TerserPlugin({
          terserOptions:
          {
            ecma: 7,
            parallel: true,
            mangle: true,
            compress: false,
            keep_fnames: true,
            ie8: false,
            output: {
              comments: false
            }
          },
        })]
  },

  context: __dirname,

  entry: './js/index',

  output: {
      path: path.resolve('./bundles'),
      filename: "[name]-[hash].js",
  },

  stats: {
      // Configure the console output
      errorDetails: true, //this does show errors
      colors: false,
      modules: true,
      reasons: true
  },

  plugins: [
    new BundleTracker({filename: './webpack-stats.json', trackAssets:true}),

  ],

  module: {
    rules: [
      { test: /\.js$/, enforce: "pre", loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, enforce: "pre",  loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/, loader: 'url-loader?limit=100000' },
    ]
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  },

};
