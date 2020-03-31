const path = require('path');
const slsw = require('serverless-webpack');

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  optimization: {
    minimize: false,
  },
  stats: 'errors-only',
  performance: {
    // Turn off size warnings for entry points
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    modules: false,
                    targets: {
                      node: '10.0.0',
                    },
                  },
                ],
              ],
            },
          },
        ],
      },
    ],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
};
