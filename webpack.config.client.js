const path = require('path');

module.exports = {
  /**
   *  Environment. Browser or node.
   */
  target: 'web',
  /**
   *  Production or development optimization.
   */
  mode: 'development',
  /**
   *  Where to start the compilation from.
   */
  entry: './src/index.js',
  /**
   *  Where to put the transpiled and bundled files.
   */
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  /**
   *  Set up babel with basic preset and JSX && React transpilation.
   */
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  }
};
