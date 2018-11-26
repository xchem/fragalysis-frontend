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
      new UglifyJsPlugin({
          uglifyOptions: {
              ecma: 7,
              keep_fnames: true,
              ie8: false,
              output: {
                  comments: false
              }
          },
      }
      ),
      // new HtmlWebpackPlugin(),
      // new WebappWebpackPlugin({
      //     logo: './js/img/favicon.png',
      //     favicons: {
      //         appName: 'Fragalysis',
      //         appDescription: 'XChem fragment screening follow up selection interface',
      //         developerName: 'RicGillams',
      //         background: '#ddd',
      //         icons: {
      //             android: false,
      //             appleIcon: false,
      //             appleStartup: false,
      //             coast: false,
      //             favicons: true,
      //             firefox: true,
      //             windows: false,
      //             yandex: false,
      //         }
      //     }
      // })
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
