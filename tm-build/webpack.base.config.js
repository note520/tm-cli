'use strict'
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader')
// const ManifestPlugin = require('webpack-manifest-plugin');// manifest.json SourceMap映射表
const { resolveDir, versionForTime, assetsPath,resolveApp,ownDir } = require('../common/utils');
const buildAppConfig = require('./build.app.config');

module.exports = {
    mode: 'production',
  // 开发环境 debug SourceMap 错误定位
    devtool: 'inline-source-map',
    devServer: {
        clientLogLevel: 'warning',
        historyApiFallback: true,
        compress: true,
        host: 'localhost',
        port: 9090,
        contentBase: path.join(__dirname, 'static'), // 为开发本地静态资源提供服务目录
    },
    // 入口文件
    entry: buildAppConfig.appEntry,
    // 输出文件
    output: {
        filename: '[name].bundle.js?='+versionForTime(),
        path: resolveApp('./dist'),// 文件输出目录相对于build目录
        publicPath: '/' // CDN 静态公共路径
    },
    // loader 加载器 使用 tm 本身的loader 和 应用程序的
    resolveLoader:{
        modules: [
            resolveApp('node_modules'),
            ownDir('node_modules')
        ]
    },
    // 模块加载器和规则
    module: {
      // 多个loader是有顺序要求的，从右往左写，因为转换的时候是从右往左转换的
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            // 以及 `.vue` 文件中的 `<script>` 块
            {
                test: /\.js$/,
                exclude: /node_modules|\/build|\/mock|\/dist/,
                use: {
                    loader: 'babel-loader?cacheDirectory',
                    options: {
                        babelrc: false,
                        presets: [
                            [
                                require('babel-preset-env'),
                                {
                                    'modules': false,
                                    'targets': {
                                        'browsers': [
                                            '> 1%',
                                            'last 2 versions',
                                            'not ie <= 8'
                                        ]
                                    }
                                }
                            ],
                            require('babel-preset-stage-2'),
                            require('babel-preset-es2015')
                        ],
                        plugins: [
                            require('babel-plugin-transform-vue-jsx'),
                            require('babel-plugin-transform-runtime')
                        ],
                        env: {
                            'development': {
                                'plugins': [
                                    require('babel-plugin-dynamic-import-node')
                                ]
                            }
                        }
                    }
                }
            },
            // css加载
            // {
            //     test: /\.css$/,
            //     use: [
            //         'vue-style-loader',
            //         'style-loader',
            //         'css-loader'
            //     ]
            // },
            // 图片加载
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                  limit: 10000,
                  name: assetsPath('[name].[hash:7].[ext]')
                }
            },
            // 字体加载
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                loader: 'url-loader',
                options: {
                  limit: 10000,
                  name: assetsPath('[name].[hash:7].[ext]')
                }
            },
          // 多媒体
            {
              test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
              loader: 'url-loader',
              options: {
                limit: 10000,
                name: assetsPath('[name].[hash:7].[ext]')
              }
            },
            // ts
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules|\/build|\/mock|\/dist/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                }
            },
        ]
    },
    // 第三方插件
    plugins:[
        new VueLoaderPlugin(),// 请确保引入这个插件！
        // new ManifestPlugin()
    ],
    // 自定义解析
    resolve:{
        extensions: ['.js','.ts', '.vue', '.json'],
        alias:{
          '@':resolveApp('src'),
          'vue$': 'vue/dist/vue.esm.js'
        }
    },
    // 外部扩展
    externals:{
      'QMap': 'window.qq.maps',
      'BMap': 'window.BMap',
      'wx':'window.wx'
        // lodash : {
        //     commonjs: 'lodash',
        //     amd: 'lodash',
        //     root: '_' // 指向全局变量
        // }
    },
    node: {
      setImmediate: false, // 阻止Webpack注入无用的setimmediate polyfill
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty'
    }
};
