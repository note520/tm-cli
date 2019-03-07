'use strict'
const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const pkg = require('../package.json');
const notifier = require('node-notifier')
/**
 * 当前路径拼接
 * @param dir
 * @returns {string|*}
 */
function resolveDir(dir) {
  return path.join(__dirname, '.', dir)
}

/**
 * tm 自身路径
 * @param args
 * @returns {*|string}
 */
function ownDir(...args) {
    return path.join(__dirname, '../', ...args)
}

/**
 * 当前应用程序路径拼接
 * @param relativePath
 * @returns {*}
 */
function resolveApp(relativePath) {
    const cwd = process.cwd();
    const appDirectory = fs.realpathSync(cwd);
    return path.resolve(appDirectory, relativePath)
}

/**
 * 获取打包当前时间
 * @returns {string}
 */
function versionForTime(){
  const _d = new Date();
  return _d.getFullYear().toString() + (_d.getMonth() + 1).toString() + _d.getDate() + '_' + _d.getHours() + _d.getMinutes();
}

/**
 * //打包后静态资源路径前缀目录
 * @param _path
 * @returns {string|*}
 */
function assetsPath (_path) {
  const buildAppConfig = require('../tm-build/build.app.config');
  const assetsSubDirectory = buildAppConfig.build.assetsSubDirectory;
  return path.posix.join(assetsSubDirectory, _path)
}

/**
 * css 加载器封装
 * @param options
 */
function cssLoaders(options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap,
      plugins: (loader) => [
          require('autoprefixer')(), //CSS浏览器兼容
          require('postcss-import')(),
          require('postcss-url')(),
      ]
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    const loaders = []

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      loaders.push(MiniCssExtractPlugin.loader)
    } else {
      loaders.push('vue-style-loader')
    }

    loaders.push(cssLoader)

    if (options.usePostCSS) {
      loaders.push(postcssLoader)
    }

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    return loaders
  }
  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', {
      indentedSyntax: true
    }),
    scss: generateLoaders('sass')
  }
}

function styleLoaders(options){
  const output = []
  const loaders = cssLoaders(options)
  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}

function createNotifierCallback (){

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: pkg.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

module.exports = {
  assetsPath,
  resolveDir,
  versionForTime,
  cssLoaders,
  styleLoaders,
  createNotifierCallback,
  resolveApp,
  ownDir
};
