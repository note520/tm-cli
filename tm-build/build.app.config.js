'use strict'
const path = require('path');
const fs = require('fs');
const util = require('util');
const { resolveApp } = require('../common/utils');
const { TM_CONFIG } = require('../common/constant');
let defaultENV;
// 应用环境判断
switch (process.env.APP_ENV) {
  // 正式部署
  case 'production':
    defaultENV = {
      NODE_ENV: '"production"',
      APP_ENV: '"production"'
    };
    break;
   // 联调开发
  case 'union':
    defaultENV = {
      NODE_ENV: '"production"',
      APP_ENV: '"union"'
    };
    break;
  case 'test':
   // 测试uat环境
    defaultENV = {
      NODE_ENV: '"production"',
      APP_ENV: '"test"'
    };
    break;
    // 开发环境
  case 'development':
    defaultENV = {
      NODE_ENV: '"development"',
      APP_ENV: '"development"'
    };
    break;
  default:
    defaultENV = {
      NODE_ENV: '"development"',
      APP_ENV: '"development"'
    }
}
// 开发环境appENV处理
if(!process.env.NODE_ENV || process.env.NODE_ENV === 'development'){
  defaultENV = Object.assign({},defaultENV,{ NODE_ENV:'"development"'})
}
console.log('currentENV:',defaultENV);
// 应用pkg
const pkgPath = resolveApp('./package.json');
const isPkg = fs.existsSync(resolveApp(pkgPath));
const pkg = isPkg?require(pkgPath):'../package.json';
/**
 * 默认内置配置
*/
let appConfig = {
    appName:pkg.name,
    appVersion:pkg.version,
    distDir: resolveApp('./dist'), // 打包后目录
    staticDir: resolveApp('./static'), // 本地静态资源目录
    faviconUrl: resolveApp('./favicon.ico'),
    // 入口文件配置
    appEntry:{
        app: './src/main.js',
    },
    isPx2Rem:false,// 是否开启px转换rem
    // 开发环境
    dev:{
        assetsPublicPath: '/',
        assetsSubDirectory: 'static',
        devtool:'cheap-source-map',
        cssSourceMap:false,
        host:'127.0.0.1',
        port:'9090',
        // 代理配置
        proxyTable: {
            '/api': {
                target: 'http://areaboss.dev2.xsyxsc.cn', // 'http://areaboss.dev2.xsyxsc.cn', http://uatareaboss.frxs.cn
                pathRewrite: {
                    '^/api': ''
                },
                changeOrigin: true // target是域名的话，需要这个参数，
                // secure: false,          // 使用的是https，会有安全校验，所以设置secure为false
            }
        },
        // 自定义process.env全局变量
        ENV:defaultENV
    },
    // 打包
    build:{
        assetsPublicPath: '/', // CDN 静态公共路径
        assetsSubDirectory: '',// 最终dist中的静态资源子目录 static
        //sourceMap
        productionSourceMap:false,
        devtool: 'source-map',
        // gzip
        productionGzip:false,
        productionGzipExtensions: ['js', 'css'],
        // 构建优化分析
        bundleAnalyzerReport: process['env']['npm_config_report'] || false,
        generateAnalyzerReport: process['env']['npm_config_generate_report'] || false,// `npm run build:prod --generate_report`
        // 联调 测试 process.env全局变量
        ENV:defaultENV
    }
};

let buildAppConfig = appConfig;

// 当前应用是否含有配置文件
const userConfigPath = resolveApp(TM_CONFIG);
const isUserConfig = fs.existsSync(userConfigPath);

function readUserConfig(configPath) {
   try {
       const fileData = require(configPath);
       const userWpConfig =  fileData.webpackConfig;
       if(userWpConfig && userWpConfig['dev']){
           buildAppConfig.dev = {...appConfig.dev,...userWpConfig['dev']}
       }
       if(userWpConfig && userWpConfig['build']){
           buildAppConfig.build = {...appConfig.build,...userWpConfig['build']}
       }
       if(userWpConfig && userWpConfig['appEntry'] ){
           buildAppConfig.appEntry = {...appConfig.appEntry,...userWpConfig['appEntry']}
       }
   }catch (e) {
       console.warn('readUserConfig error:',e)
   }
}
/**
 * 应用自定义参数打包配置
 */
if(isUserConfig){
   readUserConfig(userConfigPath);
}
module.exports = buildAppConfig;
