const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
      }),
    ],
  },
};

