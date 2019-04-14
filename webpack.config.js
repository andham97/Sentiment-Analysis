const path = require('path');

module.exports = {
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      include: /src\/client/,
      use: {
        loader: 'babel-loader',
      },
    },
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    },
    {
      test: /\.(gif)$/,
      use: [{ loader: 'url-loader' }],
    }],
  },
  entry: path.resolve(__dirname, 'src/client/client.js'),
  output: {
    path: path.resolve(__dirname, 'build/client'),
  },
  mode: 'development',
};
