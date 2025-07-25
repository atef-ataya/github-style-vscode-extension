const path = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/, /vscode-extension/],
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
};