const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = env => {
  isProduction = env.production || false
  const plugins = [
    new MiniCssExtractPlugin({
      filename: isProduction ? '[name].[hash].css' : '[name].css',
      chunkFilename: '[id].css'
    })
  ]
  const devPlugins = [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/404.html',
      filename: '404.html',
    }),
    new CopyWebpackPlugin([
      { from: './src/assets/js/vendor', to: 'js/vendor' },
      { from: './src/favicon.ico' }
    ]),
    new CleanWebpackPlugin(
      [
        'dist',
      ],
      {
        verbose:  isProduction,
      }
    )
  ]

  console.log('Production:', isProduction)

  let config = {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'main.[hash].js' : 'main.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.scss$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader',
          ],
        },
        /*{
          test: /\.html$/,
          use: [ {
            loader: 'html-loader',
            options: {
              minimize: isProduction,
              removeComments: false
            }
          }],
        },*/
        {
          test: /\.(jpe?g|gif|png|svg)$/,
          loader: "file-loader",
          options: {
            name: isProduction ? '[name].[hash].[ext]' : '[name].[ext]',
            publicPath: 'img/',
            outputPath: 'img/'
          }
        }
      ]
    },
    plugins: isProduction ? devPlugins.concat(plugins) : devPlugins
  }

  if (isProduction) {
    config.optimization = {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  }

  return config
}
