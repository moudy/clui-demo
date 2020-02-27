const path = require('path');
const webpack = require('webpack');
const ReactRefreshPlugin = require('@webhotelier/webpack-fast-refresh');

const clientRoot = path.join(__dirname, '../client');

const webpackCompiler = webpack({
  target: 'web',
  devtool: 'eval-cheap-source-map',
  // watch: true,
  mode: 'development',
  entry: [
    require.resolve('webpack-hot-middleware/client'),
    path.resolve(clientRoot, 'index.jsx')
  ],
  output: {
    publicPath: '/public'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: clientRoot,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: [
                '@babel/plugin-transform-runtime',
                'react-refresh/babel',
                ['styled-jsx/babel', { optimizeForSpeed: true }]
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [new ReactRefreshPlugin(), new webpack.HotModuleReplacementPlugin()],
  resolve: {
    extensions: ['.js', '.jsx'],
    symlinks: false
  }
});

module.exports = server => {
  server.use(
    require('webpack-dev-middleware')(webpackCompiler, {
      lazy: false,
      publicPath: '/public',
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  );

  server.use(
    require('webpack-hot-middleware')(webpackCompiler, {
      path: '/__webpack_hmr',
      publicPath: '/public',
      heartbeat: 10 * 1000,
      noInfo: false,
      quiet: false
    })
  );
};
