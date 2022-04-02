import {join, resolve} from "path";
import fastGlob from "fast-glob";
import {readFileSync} from "fs";
import {Compiler} from 'svg-mixer'

class ScxIconInterface {

    /**
     * 虚拟 文件 id
     * @type {string}
     */
    virtualModuleId = 'scx-icon/register';

    /**
     * SVG DOM ID
     *
     */
    svgDomId = '__scx__icon__dom__' + new Date().getTime() + '__';

    /**
     * 前缀
     * @type {string}
     */
    svgSymbolIdPrefix = 'scx-icon_';

    /**
     * 插件名称
     */
    name;

    /**
     * svgRoots
     */
    svgRoots;

    /**
     * vite 配置文件
     */
    viteConfig;

    constructor(name, svgRoots) {
        this.name = name;
        this.svgRoots = svgRoots;
    }

    configResolved(resolvedConfig) {
        this.viteConfig = resolvedConfig;
    }

    resolveId(id) {
        if (this.virtualModuleId === id) {
            return id;
        }
    }

    load(id) {
        //默认 返回一段空的代码
        if (this.virtualModuleId === id) {
            return `export default {}`;
        }
    }

    async getAllSymbol() {
        const svgCompiler = Compiler.create();
        const svgSymbolList = [];
        for (let svgRoot of this.svgRoots) {
            const svgFilesStats = fastGlob.sync('**/*.svg', {cwd: svgRoot, onlyFiles: true});
            for (const path of svgFilesStats) {
                const symbolContent = await svgCompiler.createSymbol({
                    id: this.getSymbolId(path), content: this.getFileContent(svgRoot, path), path: ''
                }).render();
                //内容不为空 添加
                if (symbolContent) {
                    svgSymbolList.push(symbolContent);
                }
            }
            console.log(`scx-icon-vite-plugins : ${svgRoot} , 已处理图标 ${svgFilesStats.length} 个 !!!`);
        }
        return svgSymbolList.join('');
    }

    getSymbolId(path) {
        return this.svgSymbolIdPrefix + path.substring(0, path.length - 4).split("/").filter(s => s).join("-");
    }

    getFileContent(svgRoot, path) {
        return readFileSync(join(svgRoot, path), 'utf-8')
    }

}

class UseHtml extends ScxIconInterface {

    constructor(svgRoots) {
        super('scx-icon:use-html', svgRoots);
    }

    async transformIndexHtml(html) {
        const allSymbol = await this.getAllSymbol();
        return [{
            tag: 'svg', attrs: {
                id: this.svgDomId, style: "display: none"
            }, children: allSymbol, injectTo: 'body'
        }];
    }

}

class UseJS extends ScxIconInterface {

    constructor(svgRoots) {
        super('scx-icon:use-js', svgRoots);
    }

    async load(id) {
        //只有 构建时才执行此方法
        if (this.viteConfig.isProduction && this.virtualModuleId === id) {
            const allSymbol = await this.getAllSymbol();
            return this.createModuleJsCode(allSymbol);
        }
    }

    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            //只拦截 我们需要的请求
            if (req.url.endsWith('/@id/' + this.virtualModuleId)) {
                this.getAllSymbol().then(allSymbol => {
                    res.setHeader('Content-Type', 'application/javascript');
                    res.statusCode = 200;
                    res.end(this.createModuleJsCode(allSymbol));
                });
            } else {
                next();
            }
        });
    }

    /**
     * 获取 js 文件
     * @returns {string}
     */
    createModuleJsCode(allSymbol) {
        return `if (typeof window !== 'undefined') {

    function loadScxIconSvg() {
        let svgDom = document.getElementById('${this.svgDomId}');
        if (!svgDom) {
            svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgDom.id = '${this.svgDomId}';
            svgDom.style.display = 'none';
        }
        svgDom.innerHTML = ${JSON.stringify(allSymbol)};
        document.body.appendChild(svgDom);
    }

    if (document.readyState === 'interactive') {
        document.addEventListener('DOMContentLoaded', loadScxIconSvg);
    } else {
        loadScxIconSvg()
    }

}`;
    }

}

/**
 * 直接由 class 创建的实例 vite 插件不能正确处理 需要转换为 普通对象
 * @param classInstance
 * @returns {{name}}
 */
function toVitePluginObject(classInstance) {
    const vitePluginObject = {name: classInstance.name};
    if (classInstance.configResolved) {
        vitePluginObject.configResolved = (resolvedConfig) => classInstance.configResolved(resolvedConfig);
    }
    if (classInstance.resolveId) {
        vitePluginObject.resolveId = (id) => classInstance.resolveId(id);
    }
    if (classInstance.transformIndexHtml) {
        vitePluginObject.transformIndexHtml = (html) => classInstance.transformIndexHtml(html);
    }
    if (classInstance.load) {
        vitePluginObject.load = (id) => classInstance.load(id);
    }
    if (classInstance.configureServer) {
        vitePluginObject.configureServer = (server) => classInstance.configureServer(server);
    }
    return vitePluginObject;
}


class ScxIconPluginOptions {
    type;
    svgRoot;
}

/**
 *
 * @param rawOptions {ScxIconPluginOptions}
 * @returns a
 */
function scxIconPlugin(rawOptions = {}) {
    const {
        type = "js", svgRoot = []
    } = rawOptions;

    const defaultSVGRoot = "./_svg-icons";

    const svgRoots = (Array.isArray(svgRoot) ? [defaultSVGRoot, ...svgRoot] : [defaultSVGRoot, svgRoot]).map(s => resolve(s));

    switch (type) {
        case 'js':
            return toVitePluginObject(new UseJS(svgRoots))
        case 'html':
            return toVitePluginObject(new UseHtml(svgRoots));
        default:
            throw new Error("type 类型必须是 js 或 html , type : " + type);
    }

}

export {scxIconPlugin};