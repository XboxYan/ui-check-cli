#!/usr/bin/env node
const inquirer = require('inquirer');
const path = require('path');
const exec = require('child_process').exec;
const isWin = /^win/.test(process.platform);
const build = require('./build');

const promptList = [{
    type: 'list',
    message: '请选择项目类型:',
    name: 'source',
    choices: [
       {
           name: "原生web",
           value: "web"
       },
       {
           name: "微信小程序",
           value: "wx"
       },
       {
           name: "qq小程序",
           value: "qq"
       },
       {
           name: "vue工程",
           value: "vue"
       },
    ],
},{
    type: 'list',
    message: '请选择生成类型:',
    name: 'type',
    choices: [
        {
            name: "文本很多、图片尺寸随机的情况",
            value: "overflow"
        },
        {
            name: "文本为空、图片缺失的情况",
            value: "empty"
        },
        {
            name: "文本、图片随机情况",
            value: "random"
        },
        {
            name: "以上三种情况",
            value: "all"
        },
    ],
}];


const promptConfirm = [{
    type: 'confirm',
    name: 'dynamic',
    message: '是否只处理动态内容？',
    default: false
}];

const promptOpen = [{
    type: 'confirm',
    name: 'file',
    message: '是否立即打开该文件夹？',
    default: false
}];

// if (program.debug) console.log(program.opts());
// console.log('pizza details:');
// if (program.small) console.log('- small pizza size');
// if (program.pizzaType) console.log(`- ${program.pizzaType}`);

const config = {
    source: '',
    type: '',
    dynamic: false
}

inquirer.prompt(promptList).then(answers => {
    config.source = answers.source;
    config.type = answers.type;
    if(answers.source!=='web'){
        return inquirer.prompt(promptConfirm)
    }
    return config
}).then(data => {
    config.dynamic = data.dynamic;
    console.log(`\x1B[33m compiling \x1B[39m正在生成中...`)
    build(config,function(filename){
        this.timer && clearTimeout(this.timer);
		this.timer = setTimeout(() => {
            console.log(`\x1B[32m success \x1B[39m生成完成!`)
            return inquirer.prompt(promptOpen).then(open => {
                const pathDist = path.join(process.cwd(),'.') + '-test';
                if(open.file){
                    if(isWin){
                        exec('explorer.exe "'+pathDist+'"');
                    }else{
                        exec('open "'+pathDist+'"');
                    }
                }else{
                    console.log('\x1B[32m 文件位于 \x1B[39m\033[4m'+pathDist+'\033[0m');
                }
            })
        }, 300)
    })
})