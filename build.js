const fs = require('fs');

const path = require('path');


/*
** 创建路径对应的文件夹（如果没有）
** @params path 目标路径
*/
const createPath = function (path) {
	// 路径有下面这几种
	// 1. /User/...      OS X
	// 2. E:/mydir/...   window
	// 3. a/b/...        下面3个相对地址，与系统无关
	// 4. ./a/b/...
	// 5. ../../a/b/...

	path = path.replace(/\\/g, '/');

	var pathHTML = '.';
	if (path.slice(0,1) == '/') {
		pathHTML = '/';
	} else if (/:/.test(path)) {
		pathHTML = '';
	}

	path.split('/').forEach(function(filename) {
		if (filename) {
			// 如果是数据盘地址，忽略
			if (/:/.test(filename) == false) {
				pathHTML = pathHTML + '/' + filename;
				// 如果文件不存在
				if(!fs.existsSync(pathHTML)) {
					// console.log('路径' + pathHTML + '不存在，新建之');
					fs.mkdirSync(pathHTML);
				}
			} else {
				pathHTML = filename;
			}
		}
	});
}

/*
** 删除文件极其目录方法
** @src 删除的目录
*/
const clean = function (src) {
	if (!fs.existsSync(src)) {
		return;
	}

	// 读取目录中的所有文件/目录
	var paths = fs.readdirSync(src);

	paths.forEach(function (dir) {
		let _src = path.join(src, dir);

		let st = fs.statSync(_src);

		if (st.isFile()) {
			// 如果是文件，则删除
			fs.unlinkSync(_src);
		} else if (st.isDirectory() && !_src.includes('node_modules')) {
			// 作为文件夹
			clean(_src);
		}
	});

	// 删除文件夹
	try {
		fs.rmdirSync(src);
		// console.log('已清空文件夹' + src);
	} catch(e) {}
};

/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
const copy = function (extname, src, dst, callback, building) {
	// 读取目录中的所有文件/目录
	var paths = fs.readdirSync(src);
	paths.forEach(function (dir) {
		var _src = path.join(src, dir);
		var	_dst = path.join(dst, dir);

        let st = fs.statSync(_src);

		// 判断是否为文件
		if (st.isFile()) {
            if( path.extname(_src) === extname ){
                fs.readFile(_src,'utf8',function(err,file){
                    const filename = path.join(dst, path.basename(_src));
                    file = callback(file,dst);
                    fs.writeFile(filename,file,function(){
						building && building(filename);
                    })
                })
            }else{
                const readable = fs.createReadStream(_src);
                // 创建写入流
                const writable = fs.createWriteStream(_dst);
                // 通过管道来传输流
                readable.pipe(writable);
            }

		} else if (st.isDirectory() && !_src.includes('.git') && !_src.includes('node_modules')) {
			// 作为文件夹处理
			createPath(_dst);
			copy(extname, _src, _dst, callback, building);
		}
	});
};


const imglist = [
    'https://imgservices-1252317822.image.myqcloud.com/image/20200701/obiovu02uy.jpg',
	'https://imgservices-1252317822.image.myqcloud.com/image/20200701/f0tutqgdiv.jpg',
	'https://imgservices-1252317822.image.myqcloud.com/image/20200701/zh6l6azztp.jpg',
	'https://imgservices-1252317822.image.myqcloud.com/image/20200701/8dzh5p5jg7.jpg',
	'https://imgservices-1252317822.image.myqcloud.com/image/20200701/scmo69275p.jpg',
	'https://imgservices-1252317822.image.myqcloud.com/image/20200701/c5g6yl6np0.jpg',
	'https://imgservices-1252317822.image.myqcloud.com/image/20200701/73dajixpc6.jpg'
]

const tasks = [
    {
        desc: '内容比较多的情况',
        dir: 'overflow/',
        times: 4,
        img: true
    },
    {
        desc: '内容为空的情况',
        dir: 'empty/',
        times: 0,
        img: false
    },
    {
        desc: '内容随机的情况',
        dir: 'random/',
        random: true,
    },
]

const randomImg = function(){
    const len = imglist.length;
    return imglist[Math.floor(Math.random()*len)];
}

const renderTxt = function(str,task,dynamic){
	if(dynamic){
		return str.replace(/{{[^\{\}]+}}/g,function(txt){
			if(task.random){
				return txt.repeat(Math.floor(Math.random()*4))
			}
			return txt.repeat(task.times);
		})
	}
	if(str.trim()){
		if(task.random){
			return str.repeat(Math.floor(Math.random()*4))
		}
		return str.repeat(task.times);
	}else{
		return str;
	}
}

const renderImg = function(match,source,task,dynamic){
	if(dynamic){
		if(source.startsWith('{{')){
			if(task.random){
				return match.replace(source,Math.random()>.5?randomImg():null)
			}
			return match.replace(source,task.img?randomImg():null);
		}else{
			return match
		}
	}
	if(task.random){
		return match.replace(source,Math.random()>.5?randomImg():null)
	}
	return match.replace(source,task.img?randomImg():null);
}

const source_map = {
	'web':{
		'extname' : '.html',
		'reg_txt' : /(?<=(?<!script[^>]*)>)[^<>]+(?=<(?!\/title|\/style|\/script))/g,
		'reg_img' : /<img [^>]*src=['"]([^'"]+)[^>]*>/gi
	},
	'wx':{
		'extname' : '.wxml',
		'reg_txt' : /(?<=>)[^<>]+(?=<)/g,
		'reg_img' : /<image [^>]*src=['"]([^'"]+)[^>]*>/gi
	},
	'qq':{
		'extname' : '.qml',
		'reg_txt' : /(?<=>)[^<>]+(?=<)/g,
		'reg_img' : /<image [^>]*src=['"]([^'"]+)[^>]*>/gi
	},
	'vue':{
		'extname' : '.vue',
		'reg_txt' : /(?<=(?<!script[^>]*)>)[^<>]+(?=<(?!\/style|\/script))/g,
		'reg_img' : /<img [^>]*src=['"]([^'"]+)[^>]*>/gi
	},
}

const bulid = function(config,building){
	const pathSrc = process.cwd();
	const pathDist = path.join(pathSrc,'.') + '-test';
	clean(pathDist);
	tasks.filter(el=>el.dir.includes(config.type)||config.type === 'all').forEach(function(task){
		const dist = path.join(pathDist,task.dir);
		createPath(dist);
		const source = source_map[config.source];
		copy(source.extname,pathSrc,dist,function(file){
			return file.replace(source.reg_txt,function(str){
				return renderTxt(str,task,config.dynamic);
			}).replace(source.reg_img, function (match, src) {
				return renderImg(match,src,task,config.dynamic);
			});
		},building);
	})
}

module.exports = bulid;

