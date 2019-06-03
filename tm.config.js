module.exports = {
    "description": "tm demo config",
    "author": "ricopter@qq.com",
    "gitTplMap":{
        "tpl-admin-vue":{
            "url": "direct:https://github.com/note520/tpl-admin-vue/archive/master.zip",
            "des": ""
        },
        "mp-tpl-less-ssh": {
            "url": "direct:git@gitee.com:4g/mp-tpl-less.git",
            "des": "",
            "opts":{
                "clone": true
            }
        }
    },
    "webpackConfig":{
        "dev":{
            // 开发环境本地服务器配置
            "devServerConfig":{}
        },
        "build":{}
    }
}
