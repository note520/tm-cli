'use strict'
const path = require('path');
const fs = require('fs');
const util = require('util');
const { resolveApp } = require('../common/utils');
const { TM_CONFIG } = require('../common/constant');
let defaultENV;
// 应用环境判断 //todo 自定义APP_ENV
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
    currentENV:defaultENV,
    distDir: resolveApp('./dist'), // 打包后目录
    staticDir: resolveApp('./static'), // 本地静态资源目录
    faviconUrl: resolveApp('./favicon.ico'),
    // 扩展配置
    extendConfig:{
        // 入口文件配置
        appEntry:{
            app: './src/main.js',
        },
        px2remConfig:null,// 是否开启px转换rem
    },
    // 开发环境
    dev:{
        assetsPublicPath: '/',
        assetsSubDirectory: 'static',
        cssSourceMap:false,
        devtool:'cheap-source-map',
        // devServerConfig 需要和webpack dev-server保持一致
        devServerConfig:{
            publicPath:'/',
            host:'127.0.0.1',
            port:'9090',
            // 代理配置
            proxy: {
                // '/api': {
                //     target: 'http://xxx.xxx.cn',
                //     pathRewrite: {
                //         '^/api': ''
                //     },
                //     changeOrigin: true // target是域名的话，需要这个参数，
                //     // secure: false,          // 使用的是https，会有安全校验，所以设置secure为false
                // }
            },
        },
        // 自定义process.env全局变量
        ENV:defaultENV,
        // 模块加载器配置
        moduleRules:{
            // 图片加载器配置
            imgLoaderOptions:{
                limit: 10000,
            },
            // 字体加载器配置
            fontLoaderOptions:{
                limit: 10000,
            },
            // 加载器配置
            mediaLoaderOptions:{
                limit: 10000,
            },
        },
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
        ENV:defaultENV,
        // 模块加载器配置
        moduleRules:{
            // 图片加载器配置
            imgLoaderOptions:{
                limit: 10000,
            },
            // 字体加载器配置
            fontLoaderOptions:{
                limit: 10000,
            },
            // 加载器配置
            mediaLoaderOptions:{
                limit: 10000,
            },
        },
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
           let userDevConfig = appConfig.dev;
           // 兼容0.1.6以下版本
           for(let x in userWpConfig['dev']){
               const val = userWpConfig['dev'][x];
               if(x ==='proxyTable'){
                   userDevConfig['devServerConfig']['proxy']= val;
               }else {
                   userDevConfig[x]= val;
               }
           }
           buildAppConfig.dev = userDevConfig;
       }
       if(userWpConfig && userWpConfig['build']){
           buildAppConfig.build = {...appConfig.build,...userWpConfig['build']}
       }
       if(userWpConfig && userWpConfig['extendConfig'] ){
          buildAppConfig.extendConfig = {...appConfig.extendConfig,...userWpConfig['extendConfig']}
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
