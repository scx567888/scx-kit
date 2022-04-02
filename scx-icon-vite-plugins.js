import {dirname, join, resolve} from "path";
import {fileURLToPath} from "url";
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

    /**
     * a
     *
     */
    svgCompiler = Compiler.create();

    /**
     * 缓存
     */
    allSymbolCache;

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
            return '';
        }
    }

    async getAllSymbol() {
        if (!this.allSymbolCache) {
            this.allSymbolCache = await this.createAllSymbol();
        }
        return this.allSymbolCache;
    }

    async createAllSymbol() {
        const svgSymbolList = [];
        for (let svgRoot of this.svgRoots) {
            const svgFilesStats = fastGlob.sync('**/*.svg', {cwd: svgRoot, onlyFiles: true});
            for (const path of svgFilesStats) {
                const symbolContent = await this.svgToSymbol(this.getSymbolId(path), this.getFileContent(svgRoot, path));
                //内容不为空 添加
                if (symbolContent) {
                    svgSymbolList.push(symbolContent);
                }
            }
            console.log(`scx-icon-vite-plugins : ${svgRoot} , 已处理图标 ${svgFilesStats.length} 个 !!!`);
        }
        return svgSymbolList.join('');
    }

    svgToSymbol(id, content) {
        return this.svgCompiler.createSymbol({id, content, path: ''}).render();
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

    async transformIndexHtml() {
        const allSymbol = await this.getAllSymbol();
        return [{
            tag: 'svg', attrs: {
                id: this.svgDomId, style: "display: none"
            }, children: allSymbol, injectTo: 'body'
        }];
    }

}

class UseJS extends ScxIconInterface {

    /**
     * 缓存
     */
    moduleJsCodeCache;

    constructor(svgRoots) {
        super('scx-icon:use-js', svgRoots);
    }

    async load(id) {
        //只有 构建时才执行此方法
        if (this.viteConfig.isProduction && this.virtualModuleId === id) {
            return await this.getModuleJsCode();
        }
    }

    async getModuleJsCode() {
        if (!this.moduleJsCodeCache) {
            this.moduleJsCodeCache = this.createModuleJsCode();
        }
        return this.moduleJsCodeCache;
    }

    configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
            //只拦截 我们需要的请求
            if (req.url.endsWith('/@id/' + this.virtualModuleId)) {
                res.setHeader('Content-Type', 'application/javascript');
                res.statusCode = 200;
                res.end(await this.getModuleJsCode());
            } else {
                next();
            }
        });
    }

    /**
     * 获取 js 文件
     * @returns {string}
     */
    async createModuleJsCode() {
        const allSymbol = await this.getAllSymbol();
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
    const vitePluginObject = {
        name: classInstance.name, load(id) {
            return classInstance.load(id)
        }, configResolved(resolvedConfig) {
            return classInstance.configResolved(resolvedConfig);
        }, resolveId(id) {
            return classInstance.resolveId(id);
        }
    };
    if (classInstance.transformIndexHtml) {
        vitePluginObject.transformIndexHtml = (html) => classInstance.transformIndexHtml(html);
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

    const defaultSVGRoot = resolve(dirname(fileURLToPath(import.meta.url)), "./_svg-icons");

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