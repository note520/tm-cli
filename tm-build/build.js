'use strict';
const path = require('path');
const fs = require('fs');
const util = require('util');
const rm = require('rimraf');
const webpack = require('webpack');
const connect = require('connect')
const serveStatic = require('serve-static')
const rmAsync = util.promisify(rm);

async function webpackBuild() {
    const buildAppConfig = require('./build.app.config');
    const webpackConfig = require('./webpack.prod.config');
    const _distPath = buildAppConfig.distDir;
    const isDist = fs.existsSync(_distPath);
    if (isDist) {
        await rmAsync(_distPath);
    }
    webpack(webpackConfig, (err, stats) => {
        if (err) throw err
        process.stdout.write(
            stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n\n'
        )

        if (stats.hasErrors()) {
            console.warn(' Build failed with errors.\n')
            process.exit(1)
        }
        console.log(' Build complete.\n')
        console.log(' Tip: built files are meant to be served over an HTTP server.\n'
            + " Opening index.html over file:// won't work.\n")

        if (process.env.npm_config_preview) {
            // 配合 webpack-bundle-analyzer 模块分析
            const port = 9526
            const host = 'http://localhost:' + port
            const basePath = buildAppConfig.build.assetsPublicPath
            const app = connect()

            app.use(
                basePath,
                serveStatic('./dist', {
                    index: ['index.html', '/']
                })
            )

            app.listen(port, function () {
                console.log(`> Listening at  http://localhost:${port}${basePath}`)
            })
        }

    })
}

module.exports = webpackBuild
