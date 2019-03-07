'use strict'
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 复制html模板注入
const CopyWebpackPlugin = require('copy-webpack-plugin');// 复制文件插件
const portfinder = require('portfinder');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.config');
const buildAppConfig = require('./build.app.config');
const { resolveDir, versionForTime, assetsPath,styleLoaders, resolveApp } = require('../common/utils');

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  module: {
    rules: styleLoaders({
      sourceMap: buildAppConfig.dev.cssSourceMap,
      usePostCSS: true
    })
  },
  devtool: buildAppConfig.dev.devtool,
  devServer: {
    publicPath: buildAppConfig.dev.assetsPublicPath,
    proxy: buildAppConfig.dev.proxyTable,
    clientLogLevel: 'warning',
    historyApiFallback: true,
    hot: true,
    compress: true,
    host: HOST || buildAppConfig.dev.host || '127.0.0.1',// ip 访问 0.0.0.0
    port: PORT || buildAppConfig.dev.port || 9090,
    open: true,
    overlay:{ warnings: false, errors: true },
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: false
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': Object.assign({},
      buildAppConfig.dev.ENV,
      {
        'BUILD_TAG':`"${buildAppConfig.appName}_${buildAppConfig.appVersion}_${versionForTime()}"`,// 构建时间标记
      }),
    }),
    new webpack.HotModuleReplacementPlugin(),
    // 模板注入替换
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      favicon: resolveApp(buildAppConfig.faviconUrl),
      title: buildAppConfig.appName
    }),
    // 复制静态资源
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, buildAppConfig.staticDir),
        to: buildAppConfig.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ],
  // 优化
  optimization:{
    // 提取公共代码
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        libs: {
          name: 'common',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial' // 只打包初始时依赖的第三方
        },
      }
    }
  }
});

module.exports = devWebpackConfig

// module.exports = new Promise((resolve, reject) => {
//   portfinder.basePort = process.env.PORT || devWebpackConfig.devServer.port
//   portfinder.getPort((err, port) => {
//     if (err) {
//       reject(err)
//     } else {
//       process.env.PORT = port
//       devWebpackConfig.devServer.port = port
//       // Add FriendlyErrorsPlugin
//       devWebpackConfig.plugins.push(
//         new FriendlyErrorsPlugin({
//           compilationSuccessInfo: {
//             messages: [
//               `Your application is running here: http://${
//                 devWebpackConfig.devServer.host
//                 }:${port}`
//             ]
//           },
//           onErrors: buildAppConfig.dev.notifyOnErrors
//             ? createNotifierCallback()
//             : undefined
//         })
//       );
//       resolve(devWebpackConfig)
//     }
//   })
// })
