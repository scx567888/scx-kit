<p align="center">
    <img src="https://scx.cool/img/scx-kit-logo.svg" width="300px"  alt="scx-kit-logo"/>
</p>
<p align="center">
    <a target="_blank" href="https://github.com/scx567888/scx-kit/actions/workflows/ci.yml">
        <img src="https://github.com/scx567888/scx-kit/actions/workflows/ci.yml/badge.svg" alt="CI"/>
    </a>
    <a target="_blank" href="https://www.npmjs.com/package/scx-kit">
        <img src="https://img.shields.io/npm/v/scx-kit.svg?color=ff69b4" alt="npm package"/>
    </a>
    <a target="_blank" href="https://github.com/scx567888/scx-kit">
        <img src="https://img.shields.io/github/languages/code-size/scx567888/scx-kit?color=orange" alt="code-size"/>
    </a>
    <a target="_blank" href="https://github.com/scx567888/scx-kit/issues">
        <img src="https://img.shields.io/github/issues/scx567888/scx-kit" alt="issues"/>
    </a> 
    <a target="_blank" href="https://github.com/scx567888/scx-kit/blob/master/LICENSE">
        <img src="https://img.shields.io/github/license/scx567888/scx-kit" alt="license"/>
    </a>
</p>
<p align="center">
   <a target="_blank" href="https://github.com/vitejs/vite">
        <img src="https://img.shields.io/github/package-json/dependency-version/scx567888/scx-kit/dev/vite?color=f44336" alt="Vite"/>
    </a>
    <a target="_blank" href="https://github.com/satazor/js-spark-md5">
        <img src="https://img.shields.io/github/package-json/dependency-version/scx567888/scx-kit/spark-md5?color=ff8000" alt="js-spark-md5"/>
    </a>
    <a target="_blank" href="https://github.com/JetBrains/svg-mixer">
        <img src="https://img.shields.io/github/package-json/dependency-version/scx567888/scx-kit/svg-mixer?color=44be16" alt="svg-mixer"/>
    </a> 
    <a target="_blank" href="https://github.com/vuejs/core">
        <img src="https://img.shields.io/github/package-json/dependency-version/scx567888/scx-kit/vue?color=29aaf5" alt="vue"/>
    </a> 
    <a target="_blank" href="https://github.com/SheetJS/sheetjs">
        <img src="https://img.shields.io/github/package-json/dependency-version/scx567888/scx-kit/xlsx?color=9c27b0" alt="SheetJS"/>
    </a>
</p>

简体中文 | [English](./README.md)

> 用于 SCX 的一些前端套件

## NPM

```
npm install scx-kit
```

## 快速开始

#### 1. 安装用于 ScxIcon 图标的 vite 插件 。

```javascript
import {scxIconPlugin} from 'scx-kit/scx-icon-vite-plugins.js';

export default {
    base: './',
    plugins: [scxIconPlugin({
        //图标注入类型, js (用 js 动态注入) 或 html (直接注入到 index.html)
        type: 'js',
        //您自己的svg图标文件夹 , 也可以是一个数组 []
        svgRoot: 'your-svg-root',
    })]
}
```

#### 2. 安装 ScxIcon 图标组件 。

```javascript
import {createApp} from 'vue';
import {ScxKitComponentInstaller} from 'scx-kit/scx-kit-component-installer.js';
import App from './App.vue';
import 'scx-icon/register'; //如果 type = js 则需要再次引入虚拟模块

createApp(App)
    .use(ScxKitComponentInstaller)
    .mount('#app');
```

#### 3. 使用 ScxIcon 图标组件 。

```html
<!-- 你会看见一个笑脸图标 -->
<scx-icon icon="outlined-face-smile"/>
```

有关更多信息，请参阅 [文档](https://scx.cool/docs/scx/index.html)
