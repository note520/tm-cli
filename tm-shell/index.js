#!/usr/bin/env node
'use strict';
const path = require('path');
const fs = require('fs');
const program = require('commander');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const ora = require('ora');
const chalk = require('chalk');
const util = require('util');
const pck = require('../package.json');
const Deferred = require('./Deferred');
const TmBuild = require('../tm-build/build');
const TmServer = require('../tm-build/server');
const { TM_CONFIG } = require('../common/constant');
const readFileSync = util.promisify(fs.readFile);
const writeFileSync = util.promisify(fs.writeFile);

class TmShell{

    constructor(){
        this.init();
        this._commandUI();
    }

    init(){
        this.cwd = process.cwd();
        this.tmConfigFile = TM_CONFIG;
        // 默认配置
        this.opts = {
            'author':  'ricopter@qq.com',
            'description': 'tm-cli-demo',
            'gitTplMap': {
                'tpl-admin-vue': {
                    'url': 'direct:https://github.com/note520/tpl-admin-vue/archive/master.zip'
                }
            }
        };
        // 交互方式命令行
        this.promptList = [
            {
                type: 'input',
                name: 'name',
                message: '项目名称:',
                default: "tm-cli-demo"
            },
            {
                type: 'list',
                name: 'template',
                message: '请选择项目模板:',
                choices: [
                    'demo'
                ]
            }
        ];
    }

    /**
     * 用户命令行
     * @private
     */
    _commandUI(){
        // 帮助提示
        program.on('--help', function () {

        });

        program.version(pck.version, '-v, --version');

        // 初始化模板
        program.command('init')
            .alias("i")
            .description('初始化模板名称->项目名称')
            .action((options) => {
                const userConfigPath = path.resolve(`${this.cwd}/${this.tmConfigFile}`);
                const isConfigFile = fs.existsSync(userConfigPath);

                const lastConfigPath = isConfigFile?userConfigPath:path.resolve(__dirname, '..',this.tmConfigFile);
                // 读取最终配置文件
                this._readConfig(lastConfigPath).then(configs=>{
                   return inquirer.prompt(this.promptList).then(answers =>{
                       console.log(answers); // 返回的结果
                       if(!configs.hasOwnProperty('gitTplMap')){
                           console.log(chalk.yellow('config gitTplMap key error!'))
                           process.exit();
                       }
                       const gitUrl = configs['gitTplMap'][answers.template]['url'];// 下载地址
                       const gitUrlOpts = configs['gitTplMap'][answers.template]['opts'] || {};// 下载参数
                       const projectName = answers.name;
                       if (!gitUrl || !projectName) {
                           console.log(chalk.red('init params error!'));
                           process.exit();
                       }
                       // 最终用户选择的配置信息
                       let lastConfig = {
                           ...configs,
                           url:gitUrl,
                           opts:gitUrlOpts,
                           projectName:projectName
                       };
                       //todo 本地项目重复文件名处理

                       return this._gitDownload(lastConfig)
                   })
                }).then(data=>{
                    console.log('rewrite PKG...')
                    return this._reWritePkg(data);
                }).catch(error => {
                    console.log(error)
                });
            });

        // 本地开发当前目录项目
        program.command('start')
            .alias("s")
            .description('运行本地项目开发命令')
            .option('-e, --env <APP_ENV>','开发union/test/prod环境')
            .action((options) => {
                process.env.APP_ENV = options.env || 'development';
                process.env.NODE_ENV = 'development';
                new TmServer();
            });

        // 构建打包当前目录项目
        program.command('build')
            .alias("b")
            .description('打包当前项目')
            .option('-e, --env <APP_ENV>','打包union/test/prod环境dist包')
            .action((options) => {
                process.env.APP_ENV = options.env || 'production';
                process.env.NODE_ENV = 'production';
                TmBuild()
            });

        // 执行命令
        program.parse(process.argv);
        if (!program.args.length) {
            program.help()
        }
    }

    /**
     * 读取配置
     * @returns {Promise<void>}
     * @private
     */
    _readConfig(configPath){
        const deferred = new Deferred();
        try {
            const isFile = fs.existsSync(configPath);
            if (isFile) {
                const fileData = require(configPath);
                this.opts = Object.assign({},this.opts,fileData);
                // 更新提示选择数组配置
                if(this.opts.gitTplMap){
                    this.promptList[1]['choices'] = Object.keys(this.opts.gitTplMap)
                }
                deferred.resolve(this.opts)
            }else {
                console.warn('readConfig file is not here!');
                deferred.reject({message: 'readConfig file is not here!',error:'404'})
            }
        }catch (e) {
            console.warn('readConfig err:',e);
            deferred.reject({message: 'read config error:',error:e})
        }
        return deferred.promise
    }

    /**
     * 下载git项目
     * @private
     */
    _gitDownload(lastConfig){
        const deferred = new Deferred();
        try {
            const spinner = ora(`Downloading please wait...${lastConfig.url} `);
            spinner.start();
            // clone:true 下载私有项目git clone 命令
            const _opts = Object.assign({},{ clone: false },lastConfig.opts) // 下载参数
            download(`${lastConfig.url}`, `./${lastConfig.projectName}`,_opts, (err) => {
                if (err) {
                    console.log(chalk.red(err));
                    spinner.stop();
                    process.exit()
                }
                spinner.stop();
                console.log("download git ok!");
                deferred.resolve(lastConfig)
            })
        }catch (e) {
            console.warn('_gitDownload err:',e);
            deferred.reject({message: '_gitDownload error:',error:e})
        }
        return deferred.promise
    }

    /**
     * 重写package.json 和项目名称
     * @private
     */
    async _reWritePkg(opts){
      const deferred = new Deferred();
      try {
          // 重写pkg
          const projectPkg = `./${opts.projectName}/package.json`;
          const isPkg = fs.existsSync(projectPkg);
          if(!isPkg){
              deferred.reject({message: 'project package.json is not here!:',error:'404'});
          }else {
              const packageStrData = await readFileSync(projectPkg, 'utf8');
              const packageJson = JSON.parse(packageStrData);
              packageJson.name = opts.projectName;
              packageJson.description = opts.description||'';
              packageJson.author = opts.author||'';

              const writeRes = await writeFileSync(projectPkg, JSON.stringify(packageJson, null, 2), 'utf8');
              console.log(chalk.green('project init successfully!'));
              console.log(` 
                ${chalk.yellow(`cd ${packageJson.name}`)}
                ${chalk.yellow('npm install')}
                ${chalk.yellow('npm run dev')}
            `);
              deferred.resolve(opts);
          }
      }catch (e) {
          console.warn('_reWritePkg err:',e);
          deferred.reject({message: '_reWritePkg error:',error:e})
      }
      return deferred.promise
    }
}

const tmShell = new TmShell();
