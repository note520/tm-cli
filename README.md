# tm-cli

#### 安装环境

- node v10.15.0+，npm6.4.1+

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

##### [详细中文文档](http://4g.gitee.io/tm-cli/)

