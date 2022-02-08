/**
 * 基本的 req
 * @param url
 * @param headers
 * @param body
 * @param method
 * @returns {Promise<unknown>}
 */
function baseReq(url, headers, body, method) {
    //初始化 fetch 参数 , 此处携带 cookie
    const init = {
        method: method,
        headers: new Headers(),
        credentials: 'include',
        body: null
    };

    //循环设置 headers
    for (let k in headers) {
        if (!headers.hasOwnProperty(k)) continue;
        init.headers.set(k, headers[k]);
    }

    //根据 body 类型设置请求头
    if (body) {
        if (init.method === 'GET') {
            const urlSearchParams = new URLSearchParams();
            //循环设置 body
            for (let k in body) {
                if (!body.hasOwnProperty(k)) continue;
                urlSearchParams.set(k, body[k]);
            }
            url = url + '?' + urlSearchParams.toString();
        } else {
            if (Object.prototype.toString.call(body) === '[object FormData]') {
                init.body = body
            } else {
                init.headers.set('Content-Type', 'application/json;charset=utf-8');
                init.body = JSON.stringify(body)
            }
        }
    }

    return new Promise((resolve, reject) => fetch(url, init).then(res => {
        //fetch 默认只把网络失败的作为 error 这里我们做进一步处理
        //将所有状态码不在 200-299 范围内的都视为错误
        if (res.ok) {
            //此处有可能无法转换为 json 所以做一个处理
            try {
                resolve(res.json());
            } catch (e) {
                resolve(res);
            }
        } else {
            reject(res);
        }
    }).catch(error => {
        console.error(error);
        reject(error);
    }));

}


/**
 * 纯 request 向外暴露四个方法 get , post , put , delete
 */
class ScxReq0 {
    constructor() {

        /**
         * GET
         * @param url
         * @param headers
         * @param body
         * @returns {Promise<unknown>}
         */
        this.get = (url, headers, body) => baseReq(url, headers, body, "GET");

        /**
         * POST
         * @param url
         * @param headers
         * @param body
         * @returns {Promise<unknown>}
         */
        this.post = (url, headers, body) => baseReq(url, headers, body, "POST");

        /**
         * PUT
         * @param url
         * @param headers
         * @param body
         * @returns {Promise<unknown>}
         */
        this.put = (url, headers, body) => baseReq(url, headers, body, "PUT");

        /**
         * DELETE
         * @param url
         * @param headers
         * @param body
         * @returns {Promise<unknown>}
         */
        this.delete = (url, headers, body) => baseReq(url, headers, body, "DELETE");
    }
}

/**
 * 唯一的 req0 对象
 * @type {ScxReq0}
 */
const scxReq0 = new ScxReq0();

/**
 *  在 Req0 之上封装的附带权限校验的
 */
class ScxReq {

    /**
     *
     * @param scxBaseApiUrl {ScxBaseApiUrl}
     * @param authHeaders
     * @param noPermHandler
     * @param unauthorizedHandler
     * @param serverErrorHandler
     * @param unKnowErrorHandler
     */
    constructor({
                    scxBaseApiUrl,
                    authHeaders,
                    noPermHandler,
                    unauthorizedHandler,
                    serverErrorHandler,
                    unKnowErrorHandler
                }) {
        const _authHeaders = authHeaders ? authHeaders : () => {
        };
        const _noPermHandler = noPermHandler ? noPermHandler : () => console.warn('NoPerm!!!');
        const _unauthorizedHandler = unauthorizedHandler ? unauthorizedHandler : () => console.warn('Unauthorized!!!');
        const _serverErrorHandler = serverErrorHandler ? serverErrorHandler : () => console.warn('ServerError!!!');
        const _unKnowErrorHandler = unKnowErrorHandler ? unKnowErrorHandler : (data) => console.warn('UnKnowError : ' + data);

        //这里将两种情况视为错误
        //一个是由 req0 返回的错误 包括 : 网络错误 和 状态码不在 200-299 之间
        //另一个是根据后台 json 的格式约定 将所有 message != ok 的视为 错误
        const _checkPerms = (_req0) => new Promise((resolve, reject) =>
            _req0.then(res => {
                if (res.message === 'ok') {
                    resolve(res.data);
                } else {
                    //这里将错误传递给调用者 由调用者自行判断处理方式
                    reject(res);
                }
            }).catch(error => {
                //此处针对一些常见的 错误进行处理 例如 权限问题
                const status = error.status;
                if (status === 401) {
                    _unauthorizedHandler();
                } else if (status === 403) {
                    _noPermHandler();
                } else if (status === 500) {
                    _serverErrorHandler();
                } else {
                    _unKnowErrorHandler(error);
                }
                reject(error);
            }));

        /**
         * GET 方法
         * @param url
         * @param data
         * @returns {Promise<unknown>}
         */
        this.get = (url, data) => _checkPerms(scxReq0.get(scxBaseApiUrl.joinHttpUrl(url), _authHeaders(), data));

        /**
         * POST 方法
         * @param url
         * @param data
         * @returns {Promise<unknown>}
         */
        this.post = (url, data) => _checkPerms(scxReq0.post(scxBaseApiUrl.joinHttpUrl(url), _authHeaders(), data));

        /**
         * PUT 方法
         * @param url
         * @param data
         * @returns {Promise<unknown>}
         */
        this.put = (url, data) => _checkPerms(scxReq0.put(scxBaseApiUrl.joinHttpUrl(url), _authHeaders(), data));

        /**
         * DELETE 方法
         * @param url
         * @param data
         * @returns {Promise<unknown>}
         */
        this.delete = (url, data) => _checkPerms(scxReq0.delete(scxBaseApiUrl.joinHttpUrl(url), _authHeaders(), data));
    }
}

export {
    ScxReq,
    scxReq0
}