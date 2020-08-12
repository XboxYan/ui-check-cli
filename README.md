# ui-check-cli

这是一个页面边界检测交互式命令行工具

## Features

很多情况下，HTML原型（小程序）都是最完美的状态，对于文字过多或者为空，图片尺寸大小等可能并没有做相关的设定，可能导致在实际上线后出现各种边界问题（比如文本溢出、高度塌陷、图片过大等等）

该命令行会件生成-test目录，可选择生成3种不同边界类型，分别是`empty`、`overflow`、`random`，如下

```
./test                 -> test生成目录
  |--empty             -> 文本内容为空、图片为空的情况
  |--overflow          -> 文本内容很多、图片尺寸随机的情况
  |--random            -> 文本图片资源随机的情况
```

> 提示：目前支持HTML原型(.html)、小程序(.wxml/.qml)、vue项目(.vue)

## Install

全局安装命令行工具

```
npm install ui-check-cli -g
```

## Usage

#### 在项目根目录执行

```
ui-check
```

#### 首先选择项目类型

```
? 请选择项目类型: (Use arrow keys)
❯ 原生web 
  微信小程序 
  qq小程序 
  vue工程 
```

#### 其次请选择生成类型

```
? 请选择生成类型: (Use arrow keys)
❯ 文本很多、图片尺寸随机的情况 
  文本为空、图片缺失的情况 
  文本、图片随机情况 
  以上三种情况 
```

#### 如果项目类型为`微信小程序`、`qq小程序`或者`vue工程`，还会选择

```
? 是否只处理动态内容？ (y/N) 
```

输入`y`或者`n`，默认为`n`

> 这里的动态内容指的是小程序中`{{}}`表达式的内容，大多数情况下页面固定的内容都是可控的，所以可以只处理动态部分

```html
<view>
  {{data.msg}}其他信息
</view>
```

处理后

```html
<view>
  {{data.msg}}{{data.msg}}{{data.msg}}{{data.msg}}其他信息
</view>
```

#### 接下来就自动生成了，提示信息如下

```
 compiling 正在生成中...
 success 生成完成!
```

#### 生成完成之后，可选择是否打开文件夹

```
? 是否立即打开该文件夹？ (y/N) 
```

输入`y`或者`n`，默认为`n`

```
? 是否立即打开该文件夹？ No
 文件位于 /Users/yanwenbin/Documents/test/yuewenListen-test
```

然后，如果是web项目，可以直接在浏览器查看生成的文件，如果是小程序项目，则需导入小程序开发者工具进行体验

## ScreenShot

![](https://imgservices-1252317822.image.myqcloud.com/image/20200812/wsdhimz541.gif)

**Enjoy!**
