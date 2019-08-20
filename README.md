# tm-cli

#### 安装环境

- node8.12.0+，npm6.4.1+，vue 2.5.17

#### 使用

```
// 全局安装
npm i -g tm-cli

// 查看命令
tm
```

#### 命令参数说明
    - tm 查看全部命令
    - tm -v 查看版本
    - tm i 初始化项目模板选择，构建新的项目(以中后台项目为主)
    - tm start 开发环境 默认打开 http://localhost:9090。可选参数 -e 可添加自定义  process.env.APP_ENV 的值，可作为区分应用环境。同时 process.env 中默认内置了版本号的标记和构建时间戳的标记
    - tm build  部署构建打包，生成dist目录。可选参数 -e 同上
    - 项目初始化浏览器控制台会打印 process.env 中的配置信息比如版本、构建时间

### tm.config.js 配置 

#### 配置参数：gitTplMap 
    - 配置下载远程模板路径信息 ，如果需要下载私有模板则需要git ssh配置比如mp-tpl-less-ssh。
    - url  远程下载地址 direct:xxxx
    - des 项目描述
    - opts 扩展参数，详情请参考 download-git-repo
 
#### 参数：webpackConfig
    - 覆盖内置webpack配置信息
    - dev 针对开发环境配置
    - build 部署环境配置
    - extendConfig 扩展配置

##### 场景一：中后台项目 常用配置
```
module.exports = {
  "description": "tm demo config",
  "author": "ricopter@qq.com",
  "webpackConfig":{
    "dev":{
      "devServerConfig":{
        "host":"0.0.0.0", //ip 访问
          "proxy": {
            "/api": {
              "target": "http://xx.xx.xx.xx:xxx",// api访问地址
              "pathRewrite": {
                "^/api": ""
              },
              "changeOrigin": true
            }
          }
      },  
    },
    // 打包自定义配置
    "build": {

    }
  }
}
```
##### 场景二：H5 web app移动端 常用配置
```
module.exports = {
  "description": "tm demo config",
  "author": "ricopter@qq.com",
  "webpackConfig":{
  	// 移动端需要开启以下功能
    "extendConfig":{
      //开启px转rem方案,移动端web中适配问题开启rem
      "px2remConfig":{
        rootValue: 37.5, //px 转rem的根比例
        propList: ['*',, '!border','!border-bottom','!border-top','!border-left','!border-right']
      }
    },
    "dev":{
      "devServerConfig":{
          "host":"0.0.0.0", //ip 访问
          // 本地代理
            "proxy": {
              "/api": {
                "target": "http://xx.xx.xx.xx:xxx",//api访问地址
                "pathRewrite": {
                  "^/api": ""
                },
                "changeOrigin": true
              }
        }
       },  
    },
    // 打包自定义配置
    "build": {

    }
  }
}
```

#### 常见问题解决
- tm-cli 默认是不会安装less less-loader  sass sass-loader，所以如果出现无法编译情况，请手动添加到本地 devDependencies
-  如果报此错误
````
Vue packages version mismatch:

- vue@2.6.10
- vue-template-compiler@2.5.17

This may cause things to work incorrectly. Make sure to use the same version for both.
If you are using vue-loader@>=10.0, simply update vue-template-compiler.
If you are using vue-loader@<10.0 or vueify, re-installing vue-loader/vueify should bump vue-template-compiler to the latest.
````
##### 解决方法：
- 方法1：先卸载**npm uninstall tm-cli -g** 然后**npm i tm-cli -g**升级到最新版本 
- 方法2：vue 版本的要求和 vue-loader限制，这要求我们vue版本 2.5.7.与vue-template-compiler匹配。（部分依赖包因升级了vue版本）
 cmd 执行命令 **npm ls vue -g** 全局检测vue版本。找到依赖的包中是否有vue版本不匹配，然后修改降低其包的版本号。如果还未能解决请[issues](https://github.com/note520/tm-cli/issues)


