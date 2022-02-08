import {dirname, join, resolve} from "path";
import {fileURLToPath} from "url";
import fastGlob from "fast-glob";
import {readFileSync} from "fs";
import {Compiler} from 'svg-mixer'

/**
 * 虚拟 文件 id
 * @type {string}
 */
const VIRTUAL_FILE_ID = 'scx-icon/register';

/**
 * SVG DOM ID
 * @type {string}
 */
const SVG_DOM_ID = '__svg__icons__dom__' + new Date().getTime() + '__';

/**
 * 前缀
 * @type {string}
 */
const SVG_SYMBOL_ID_PREFIX = 'scx-icon_';

/**
 * 使用 html 实现
 * @returns {{transformIndexHtml(*): Promise<*>, name: string}|*}
 */
function use_html(SVG_ROOT_PATHS) {
    return {
        name: 'scx-icon:use-html',
        resolveId(id) {
            if (VIRTUAL_FILE_ID === id) {
                return id;
            }
        },
        load(id) {
            //只有 构建时才执行此方法
            if (VIRTUAL_FILE_ID === id) {
                return `export default {}`;
            }
        },
        async transformIndexHtml(html) {
            const allSymbol = await getAllSymbol(SVG_ROOT_PATHS);
            const svgSprite = `<svg id="${SVG_DOM_ID}" style="display: none">${allSymbol}</svg>\n</body>`;
            return html.replace('</body>', svgSprite);
        }
    }
}

/**
 * 使用 js 实现
 * @returns {string|{load(*): Promise<string|undefined>, configureServer({middlewares: *}): void, name: string, resolveId(*): (*|undefined), configResolved(*): void}|*}
 */
function use_js(SVG_ROOT_PATHS) {
    let isBuild = false;
    return {
        name: 'scx-icon:use-js',
        configResolved(resolvedConfig) {
            isBuild = resolvedConfig.isProduction || resolvedConfig.command === 'build';
        },
        resolveId(id) {
            if (VIRTUAL_FILE_ID === id) {
                return id;
            }
        },
        async load(id) {
            //只有 构建时才执行此方法
            if (isBuild && VIRTUAL_FILE_ID === id) {
                return await createModuleCode(SVG_ROOT_PATHS);
            }
        },
        configureServer({middlewares}) {
            middlewares.use(async (req, res, next) => {
                //只拦截 VIRTUAL_FILE_ID 的请求
                if (req.url.endsWith('/@id/' + VIRTUAL_FILE_ID)) {
                    res.setHeader('Content-Type', 'application/javascript');
                    const jsCode = await createModuleCode(SVG_ROOT_PATHS);
                    res.statusCode = 200;
                    res.end(jsCode);
                } else {
                    next();
                }
            });
        },
    };
}


/**
 * 获取 js 文件
 * @returns {Promise<string>}
 */
async function createModuleCode(SVG_ROOT_PATHS) {
    const allSymbol = await getAllSymbol(SVG_ROOT_PATHS);
    const code = `
       if (typeof window !== 'undefined') {
         function loadSvg() {
           let body = document.body;
           let svgDom = document.getElementById('${SVG_DOM_ID}');
           if(!svgDom) {
             svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
             svgDom.style.position = 'absolute';
             svgDom.style.width = '0';
             svgDom.style.height = '0';
             svgDom.id = '${SVG_DOM_ID}';
           }
           svgDom.innerHTML = ${JSON.stringify(allSymbol)};
           body.insertBefore(svgDom, body.firstChild);
         }
         if(document.readyState === 'interactive') {
           document.addEventListener('DOMContentLoaded', loadSvg);
         } else {
           loadSvg() 
         }
      }
        `;
    return `${code}\n export default {}`;
}

async function getAllSymbol(SVG_ROOT_PATHS) {
    const svgCompiler = Compiler.create();
    //svg 列表
    const svgSymbolList = [];
    for (const SVG_ROOT_PATH_KEY in SVG_ROOT_PATHS) {
        const SVG_ROOT_PATH = SVG_ROOT_PATHS[SVG_ROOT_PATH_KEY];
        //读取所有文件
        const svgFilesStats = fastGlob.sync('**/*.svg', {cwd: SVG_ROOT_PATH, stats: true, absolute: false});
        for (const {path} of svgFilesStats) {
            const symbolId = getSymbolId(path);
            //读取文件的内容
            const content = readFileSync(join(SVG_ROOT_PATH, path), 'utf-8');
            //获取 symbol 内容
            const symbolContent = await svgCompiler.createSymbol({id: symbolId, content: content, path: ''}).render();
            //内容不为空 添加
            if (symbolContent) {
                svgSymbolList.push(symbolContent);
            }
        }
        console.log('\x1B[32m%s\x1B[0m', `scx-icon : 已处理图标 ${svgFilesStats.length} 个 !!! 图标文件夹根路径 : ${SVG_ROOT_PATH}`);
    }
    return svgSymbolList.join('');
}

function getSymbolId(filePath) {
    //去除后缀 并将所有文件夹分割转换为 -
    return SVG_SYMBOL_ID_PREFIX + filePath.substring(0, filePath.length - 4).split("/").filter(s => s !== null && s !== '' && s !== undefined).join("-");
}

const scxIconPlugin = (rawOptions = {}) => {
    const {type, svgRoot} = rawOptions;
    let finalType = 'js';
    const finalSVGRoot = [resolve(dirname(fileURLToPath(import.meta.url)), "./_svg-icons")];
    if (type && (type === 'js' || type === 'html')) {
        finalType = type;
    }
    if (svgRoot) {
        if (Array.isArray(svgRoot)) {
            for (const optionsKey in svgRoot) {
                finalSVGRoot.push(resolve(svgRoot[optionsKey]))
            }
        } else {
            finalSVGRoot.push(resolve(svgRoot))
        }
    }
    return finalType === 'js' ? use_js(finalSVGRoot) : use_html(finalSVGRoot);
};

export {scxIconPlugin};