'use strict';
const webpack = require('webpack');
const open = require('opn')
const WebpackDevServer = require('webpack-dev-server');
const addDevServerEntrypoints = require('webpack-dev-server/lib/utils/addEntries');
const createDomain = require('webpack-dev-server/lib/utils/createDomain');
const portfinder = require('portfinder');
// webpack-dev-server --host 0.0.0.0 --inline --progress --config build/webpack.dev.conf.js
class Serve {
    constructor() {
        const webpackConfig = require('./webpack.dev.config');
        this.webpackConfig = webpackConfig;
        let options = webpackConfig.devServer;
        this.options = options;
        this.suffix = (options.inline !== false || options.lazy === true ? '/' : '/webpack-dev-server/');
        this.startDevServer();
    }

    kill() {
        this.server && this.server.close()
    }

    startDevServer() {
        let webpackConfig = this.webpackConfig;
        let options = this.options;
        addDevServerEntrypoints(webpackConfig, options);
        this.createCompiler();
        this.createServer();
        this.process();
        this.createPort();
    }

    createCompiler() {
        try {
            this.compiler = webpack(this.webpackConfig)
        } catch (e) {
            if (e instanceof webpack.WebpackOptionsValidationError) {
                console.error(log.error(e.message))
                process.exit(1)
            }
            throw e
        }
    }

    createServer() {
        try {
            this.server = new WebpackDevServer(this.compiler, this.options)
        } catch (e) {
            const OptionsValidationError = require('webpack-dev-server/lib/OptionsValidationError')
            if (e instanceof OptionsValidationError) {
                console.error(log.error(e.message))
                process.exit(1)
            }
            throw e
        }
    }

    process() {
        ['SIGINT', 'SIGTERM'].forEach((sig) => {
            process.on(sig, () => {
                this.server.close(() => {
                    process.exit()
                })
            })
        })
    }

    createPort() {
        let server = this.server
        let options = this.options
        // 当前端口被占用检测
        this.checkPort(options.port).then(port=>{

            server.listen(port, options.host, (err) => {
                if (err) throw err;
                if (options.bonjour) this.broadcastZeroconf(options);
                const uri = createDomain(options, server.listeningApp) + this.suffix;
                console.log('create http server:',uri);
                this.reportReadiness(uri, options);
            })

        }).catch(e=>{
            console.warn('checkPort error:',e)
        });
    }

    checkPort(port){
        return new Promise((resolve, reject) => {
            portfinder.basePort = port
            portfinder.getPort((err, port) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(port)
                }
            })
        })
    }

    reportReadiness(uri, options) {
        const useColor = options.color
        const contentBase = Array.isArray(options.contentBase) ? options.contentBase.join(', ') : options.contentBase

        if (!options.quiet) {
            let startSentence = `Project is running at ${uri}`
            if (options.socket) {
                startSentence = `Listening to socket at ${options.socket}`
            }
            console.log((options.progress ? '\n' : '') + startSentence)

            console.log(`webpack output is served from ${options.publicPath}`)

            if (contentBase) { console.log(`Content not from webpack is served from ${contentBase}`) }

            if (options.historyApiFallback) { console.log(`404s will fallback to ${options.historyApiFallback.index || '/index.html'}`) }

            if (options.bonjour) { console.log('Broadcasting "http" with subtype of "webpack" via ZeroConf DNS (Bonjour)') }
        }
        // 启动重复自动打开页面
        // if (options.open) {
        //     let openOptions = {}
        //     let openMessage = 'Unable to open browser'
        //
        //     if (typeof options.open === 'string') {
        //         openOptions = { app: options.open }
        //         openMessage += `: ${options.open}`
        //     }
        //
        //     open(uri + (options.openPage || ''), openOptions).catch(() => {
        //         console.log(`${openMessage}. If you are running in a headless environment, please do not use the open flag.`)
        //     })
        // }
    }

    broadcastZeroconf(options) {
        const bonjour = require('bonjour')()
        bonjour.publish({
            name: 'Webpack Dev Server',
            port: options.port,
            type: 'http',
            subtypes: ['webpack']
        })
        process.on('exit', () => {
            bonjour.unpublishAll(() => {
                bonjour.destroy()
            })
        })
    }
}

module.exports = Serve;
