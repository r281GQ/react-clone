const path = require('path');

module.exports = {
  /**
   *  Environment. Browser or node.
   */
  target: 'node',
  /**
   *  Production or development optimization.
   */
  mode: 'development',
  /**
   *  Where to start the compilation from.
   */
  entry: './server.js',
  /**
   *  Where to put the transpiled and bundled files.
   */
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'server.js'
  },
  /**
   *  Set up babel with basic preset.
   */
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
