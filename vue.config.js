
const { name } = require('./package');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  transpileDependencies: true,
  lintOnSave: true,
  publicPath: '/',
  outputDir: 'dist',
  pages: {
    example: {
      entry: 'src/example/main.js',
      template: 'src/example/index.html',
      filename: 'index.html',
    },
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  configureWebpack: {
    output: {
      library: `${name}`,
      libraryTarget: 'umd',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },
    plugins: [
      // new CopyWebpackPlugin({
      //   patterns: [
      //     { from: 'node_modules/tinymce', to: 'tinymce' },
      //   ],
      // }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public/tinymce', to: 'tinymce' },
        ],
      }),
    ]
  }
};
