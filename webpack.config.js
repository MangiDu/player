var path = require('path')

var SRC_PATH = path.resolve(__dirname, 'src')
var DIST_PATH = path.resolve(__dirname, 'dist')

module.exports = {
  entry: path.resolve(SRC_PATH, 'player.js'),
  output: {
    filename: 'player.js',
    path: DIST_PATH,
    library: 'Player',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devServer: {
    publicPath: "/dist/",
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: SRC_PATH,
      use: {
        loader: 'babel-loader',
        options: {
          presets: 'es2015'
        }
      }
    }, {
      test: /\.(scss|sass)$/,
      include: SRC_PATH,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
        'sass-loader'
      ]
    }, {
      test: /\.(png|jpg)$/,
      include: SRC_PATH,
      use: {
        loader: 'url-loader'
      }
    }]
  }
}
