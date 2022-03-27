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

    /**
     * 基本的 req
     * @param url
     * @param headers
     * @param body
     * @param method
     * @returns {Promise<unknown>}
     */
    static baseReq(url, method, body, headers) {
        //初始化 fetch 参数 , 此处携带 cookie
        const init = {
            method: method, headers: new Headers(), credentials: 'include', body: null
        };

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
                if (body instanceof FormData) {
                    init.body = body;
                } else {
                    init.headers.set('Content-Type', 'application/json;charset=utf-8');
                    init.body = JSON.stringify(body)
                }
            }
        }

        if (headers) {
            //循环设置 headers
            for (let k in headers) {
                if (!headers.hasOwnProperty(k)) continue;
                init.headers.set(k, headers[k]);
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
     * GET
     * @param url
     * @param headers
     * @param body
     * @returns {Promise<unknown>}
     */
    static get(url, body = null, headers = null,) {
        return ScxReq.baseReq(url, "GET", body, headers);
    }

    /**
     * POST
     * @param url
     * @param headers
     * @param body
     * @returns {Promise<unknown>}
     */
    static post(url, body = null, headers = null) {
        return ScxReq.baseReq(url, "POST", body, headers);
    }

    /**
     * PUT
     * @param url
     * @param headers
     * @param body
     * @returns {Promise<unknown>}
     */
    static put(url, body = null, headers = null) {
        return ScxReq.baseReq(url, "PUT", body, headers);
    }

    /**
     * DELETE
     * @param url
     * @param headers
     * @param body
     * @returns {Promise<unknown>}
     */
    static delete(url, body = null, headers = null) {
        return ScxReq.baseReq(url, "DELETE", body, headers);
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
     * @param headers
     * @returns {Promise<unknown>}
     */
    get(url, body = null, headers = null) {
        return this.checkPerms(ScxReq.get(this.scxApiHelper.joinHttpURL(url), body, this.mergeHeaders(headers)))
    }

    /**
     * POST 方法
     * @param url
     * @param body
     * @param headers
     * @returns {Promise<unknown>}
     */
    post(url, body = null, headers = null) {
        return this.checkPerms(ScxReq.post(this.scxApiHelper.joinHttpURL(url), body, this.mergeHeaders(headers)));
    }

    /**
     * PUT 方法
     * @param url
     * @param body
     * @param headers
     * @returns {Promise<unknown>}
     */
    put(url, body = null, headers = null) {
        return this.checkPerms(ScxReq.put(this.scxApiHelper.joinHttpURL(url), body, this.mergeHeaders(headers)))
    }

    /**
     * DELETE 方法
     * @param url
     * @param body
     * @param headers
     * @returns {Promise<unknown>}
     */
    delete(url, body = null, headers = null) {
        return this.checkPerms(ScxReq.delete(this.scxApiHelper.joinHttpURL(url), body, this.mergeHeaders(headers)))
    }

    mergeHeaders(headers) {
        const mergedHeaders = {};
        Object.assign(mergedHeaders, this.authHeaders())
        Object.assign(mergedHeaders, headers);
        return mergedHeaders;
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