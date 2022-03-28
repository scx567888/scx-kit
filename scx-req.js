const HttpHeaderValues = {
    APPLICATION_JSON: "application/json"
}

const HttpHeaderNames = {
    CONTENT_TYPE: "content-type"
}

class ScxReqOptions {
    method;
    headers
}

/**
 *  ScxReq : 针对 fetch 的简单封装
 */
class ScxReq {

    scxApiHelper;

    /**
     *
     * @param scxApiHelper {ScxApiHelper}
     *
     */
    constructor(scxApiHelper) {
        this.scxApiHelper = scxApiHelper;
    }

    static toURLSearchParams(body) {
        if (body) {
            const urlSearchParams = new URLSearchParams();
            //循环设置 body
            for (let k in body) {
                if (body.hasOwnProperty(k)) {
                    urlSearchParams.set(k, body[k]);
                }
            }
            return urlSearchParams.toString();
        } else {
            return "";
        }
    }

    /**
     * 基本的 req
     * @returns {Promise<unknown>}
     * @param url
     * @param body
     * @param options {ScxReqOptions}
     */
    static request(url, body, options = {}) {
        const {method = "GET", headers} = options;
        //初始化 fetch 参数 , 此处携带 cookie
        const init = {
            method: method, headers: new Headers(), credentials: 'include', body: null
        };

        //根据 body 类型设置请求头
        if (body) {
            if (init.method === 'GET') {
                url = url + '?' + this.toURLSearchParams(body);
            } else {
                if (body instanceof FormData) {
                    init.body = body;
                } else {
                    init.headers.set(HttpHeaderNames.CONTENT_TYPE, HttpHeaderValues.APPLICATION_JSON + ';charset=utf-8');
                    init.body = JSON.stringify(body);
                }
            }
        }

        if (headers) {
            //循环设置 headers
            for (let k in headers) {
                if (headers.hasOwnProperty(k)) {
                    init.headers.set(k, headers[k]);
                }
            }
        }

        return new Promise((resolve, reject) => fetch(url, init).then(res => {
            let contentType = res.headers.get(HttpHeaderNames.CONTENT_TYPE);
            if (contentType != null && contentType.toLowerCase().startsWith(HttpHeaderValues.APPLICATION_JSON)) {
                resolve(res.json());
            } else {
                resolve(res);
            }
        }).catch(error => reject(error)));

    }

    /**
     * GET 方法
     * @param url
     * @param body
     * @param options
     * @returns {Promise<unknown>}
     */
    static get(url, body = null, options = {}) {
        return ScxReq.request(url, body, {...options, method: "GET"});
    }

    /**
     * POST 方法
     * @param url
     * @param body
     * @param options
     * @returns {Promise<unknown>}
     */
    static post(url, body = null, options = {}) {
        return ScxReq.request(url, body, {...options, method: "POST"});
    }

    /**
     * PUT 方法
     * @param url
     * @param body
     * @param options
     * @returns {Promise<unknown>}
     */
    static put(url, body = null, options = {}) {
        return ScxReq.request(url, body, {...options, method: "PUT"});
    }

    /**
     * DELETE 方法
     * @param url
     * @param body
     * @param options
     * @returns {Promise<unknown>}
     */
    static delete(url, body = null, options = {}) {
        return ScxReq.request(url, body, {...options, method: "DELETE"});
    }

    checkPerms(p) {
        return new Promise((resolve, reject) => p.then(res => {
            //这里将两种情况视为错误
            //一个是由 req0 返回的错误 包括 : 网络错误 和 状态码不在 200-299 之间
            //另一个是根据后台 json 的格式约定 将所有 message != ok 的视为 错误
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
                this.unauthorizedHandler();
            } else if (status === 403) {
                this.noPermHandler();
            } else if (status === 500) {
                this.serverErrorHandler();
            } else {
                this.unKnowErrorHandler(error);
            }
            reject(error);
        }));
    }

    /**
     * GET 方法
     * @param url
     * @param body
     * @param options
     * @returns {Promise<unknown>}
     */
    get(url, body = null, options = {}) {
        return this.checkPerms(ScxReq.get(this.scxApiHelper.joinHttpURL(url), body, this.mergeHeaders(options)));
    }

    /**
     * POST 方法
     * @param url
     * @param body
     * @param options
     * @returns {Promise<unknown>}
     */
    post(url, body = null, options = {}) {
        return this.checkPerms(ScxReq.post(this.scxApiHelper.joinHttpURL(url), body, this.mergeHeaders(options)));
    }

    /**
     * PUT 方法
     * @param url
     * @param body
     * @param options
     * @returns {Promise<unknown>}
     */
    put(url, body = null, options = {}) {
        return this.checkPerms(ScxReq.put(this.scxApiHelper.joinHttpURL(url), body, this.mergeHeaders(options)));
    }

    /**
     * DELETE 方法
     * @param url
     * @param body
     * @param options
     * @returns {Promise<unknown>}
     */
    delete(url, body = null, options = {}) {
        return this.checkPerms(ScxReq.delete(this.scxApiHelper.joinHttpURL(url), body, this.mergeHeaders(options)));
    }

    mergeHeaders(options = {}) {
        const finalOptions = {...options};
        finalOptions.headers = {...this.authHeaders(), ...options.headers};
        return finalOptions;
    }

    authHeaders() {
        return {};
    }

    noPermHandler() {
        console.warn('NoPerm!!!');
    }

    unauthorizedHandler() {
        console.warn('Unauthorized!!!');
    }

    serverErrorHandler() {
        console.warn('ServerError!!!');
    }

    unKnowErrorHandler(data) {
        console.warn('UnKnowError : ' + data);
    }

}

export {ScxReq}