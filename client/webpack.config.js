const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestAssetPlugin = new CopyWebpackPlugin([ { from: 'src/assets/manifest.json', to: 'manifest.json' } ]);
const ConfigAssetPlugin = new CopyWebpackPlugin([ { from: 'src/assets/config.json', to: 'config.json' } ]);
const IconAssetPlugin = new CopyWebpackPlugin([ { from: 'src/images/icon-192x192.png', to: 'icon-192x192.png' } ]);
const WebConfigPlugin = new CopyWebpackPlugin([ { from: 'src/web.config', to: 'web.config' } ]);
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: './src/index.js',
  target: 'web',
  output: {
    path: path.resolve('public/build'),
    filename: 'index_bundle.js',
  },
  devServer: {
    historyApiFallback: {
      disableDotRule: true
    },
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    },
  },
  module: {
    rules: [
      { test: /\.json$/, use: 'json-loader' },
      { 
        test: /\.js$/, 
        loader: 'babel-loader', 
        exclude: /node_modules/, 
        query: {
            presets: ['es2017', 'react']
        } 
      },
      { 
        test: /\.jsx$/, 
        loader: 'babel-loader',
        exclude: /node_modules/, 
        query: {
            presets: ['es2017', 'react']
        } 
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
        loader: 'file-loader!url-loader',
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  },
  plugins: [
    HtmlWebpackPluginConfig, 
    ManifestAssetPlugin,
     ConfigAssetPlugin, 
     IconAssetPlugin, 
     WebConfigPlugin,
     new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })]
}
