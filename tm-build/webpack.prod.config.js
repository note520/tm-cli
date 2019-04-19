/**
 * 打包配置
 */
'use strict'
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 复制html模板注入
const CopyWebpackPlugin = require('copy-webpack-plugin');// 复制文件插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');// 到处css 到一个文件
// const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin'); // 为 script 设置不同的部署选项进行编译 异步(async) 和 延迟(defer) dns-prefetch
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');// 混淆压缩js
const TerserPlugin = require('terser-webpack-plugin');// 混淆压缩js
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');// 压缩提取的CSS。消除来自不同组件的重复CSS。
const CompressionWebpackPlugin = require('compression-webpack-plugin');// 启用 gzip 压缩
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin // 构建优化分析
const baseWebpackConfig = require('./webpack.base.config');
const buildAppConfig = require('./build.app.config');// 构建配置文件
const { resolveDir, versionForTime, assetsPath, styleLoaders, resolveApp } = require('../common/utils');

const webpackConfig =merge(baseWebpackConfig,{
  mode: 'production',
  devtool:  buildAppConfig.build.productionSourceMap ? buildAppConfig.build.devtool : false,
  output: {
    path: resolveApp(buildAppConfig.distDir),// 文件输出目录相对于build目录
    filename: assetsPath('[name].js?='+versionForTime()),
    publicPath: buildAppConfig.build.assetsPublicPath
  },
  module: {
    rules: styleLoaders({
      sourceMap: buildAppConfig.build.productionSourceMap,
      extract: true,
      usePostCSS: true,
      isPx2Rem: buildAppConfig.extendConfig.isPx2Rem,
    })
  },
  // 第三方插件
  plugins: [
    new webpack.DefinePlugin({
      'process.env': Object.assign({},
          // 应用内部区分联调 测试环境
          buildAppConfig.build.ENV,
          {
          // 构建时间标记
          'BUILD_TAG':`"${buildAppConfig.appName}_${buildAppConfig.appVersion}_${versionForTime()}"`,// 构建时间标记
      }),
    }),
    new MiniCssExtractPlugin({
      filename: assetsPath('[name].css?='+versionForTime()),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      favicon: fs.existsSync(buildAppConfig.faviconUrl)?resolveApp(buildAppConfig.faviconUrl):'',
      title: buildAppConfig.appName,
      templateParameters: {
        BASE_URL: buildAppConfig.build.assetsPublicPath + buildAppConfig.build.assetsSubDirectory,
      },
      // html内标签是否压缩
      minify: {
        removeComments: false,
        collapseWhitespace: false,
        removeAttributeQuotes: false
      }
    }),
    // 复制静态资源
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, buildAppConfig.staticDir),
        to: buildAppConfig.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ],
  // 优化
  optimization: {
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
    },
    // 压缩
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: true,
          output: { comments: false },
          compress: { warnings: false }
        },
        sourceMap: buildAppConfig.build.productionSourceMap,
        cache: true,
        parallel: true
      }),
      new OptimizeCSSAssetsPlugin()
    ]
  }
});
// 是否开启gzip 需要服务器支持
if (buildAppConfig.build.productionGzip) {
  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' + buildAppConfig.build.productionGzipExtensions.join('|') + ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}
// 构建优化分析
if (buildAppConfig.build.generateAnalyzerReport || buildAppConfig.build.bundleAnalyzerReport) {

  if (buildAppConfig.build.bundleAnalyzerReport) {
    webpackConfig.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerPort: 8080,
        generateStatsFile: false
      })
    )
  }

  if (buildAppConfig.build.generateAnalyzerReport) {
    webpackConfig.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report.html',
        openAnalyzer: false
      })
    )
  }
}

module.exports = webpackConfig;
