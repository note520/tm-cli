/**
 * Created with WebStorm.
 * User: rico ricopter@qq.com
 * Date: 2018/6/22/022
 * Time: 10:45
 * 压缩dist文件夹
 * //todo 1-dist空目录判断 2-添加项目版本号
 * */
'use strict';
const path = require('path');
const fs= require('fs');
const AdmZip = require('adm-zip');

/**
 * 压缩dist成zip包
 */
function packZip() {
  const zip = new AdmZip();
  const timeStr = formatNowDate();
  const parentPath = path.resolve(__dirname, '..');
  const proName = path.basename(parentPath);
  const agrs = process.argv.splice(2);
  const targetDir = './dist'; // 编译后的项目生成文件目录
  const outputDir = './output'; // 打包压缩zip最终目录
  let zipName = `${proName}_v${timeStr}.zip`;
  if(agrs){
    zipName = `${proName}_${agrs}_v${timeStr}.zip`;
  }
  // 初始化
  const isOutput = fs.existsSync(outputDir);
  if(!isOutput){
    fs.mkdir(outputDir,function (err) {
      if (err) {
        return console.error(`创建${this.outputDir}目录失败!`,err);
      }
      console.log('========create outputDir ok!============');
      createZip(zip,targetDir,outputDir,zipName)
    })
  }else {
   createZip(zip,targetDir,outputDir,zipName)
  }
}
/**
 * 创建压缩包
 */
function createZip(zip,targetDir,outputDir,zipName) {
  console.log('========creatDistZip start!============');
  const isDist = fs.existsSync(targetDir);
  const zipOuput = path.resolve(outputDir,zipName);
  if(!isDist){
    console.warn(`${targetDir} is not here!`);
    fs.mkdir(targetDir,function (err) {
      if (err) {
        return console.error(`创建${targetDir}目录失败!`,err);
      }
      zip.addLocalFolder(targetDir);
      zip.writeZip(zipOuput);
      console.log(`========creatDistZip ${zipOuput} ok!============`);
    })
  }else {
    zip.addLocalFolder(targetDir);
    zip.writeZip(zipOuput);
    console.log(`========creatDistZip ${zipOuput} ok!============`);
  }
}
/**
 * 时间补0
 * @param m
 * @returns {string}
 */
function addZero(m) {
  return (m<10?'0'+m:m).toString();
}
/**
 * 当前时间格式化
 * @returns {*}
 */
function formatNowDate() {
  let time = new Date();
  let y = time.getFullYear();
  let m = time.getMonth()+1;
  let d = time.getDate();
  let h = time.getHours();
  let mm = time.getMinutes();
  let s = time.getSeconds();
  return y+addZero(m)+addZero(d)+addZero(h)+addZero(mm);
}
/**初始化**/
packZip();

