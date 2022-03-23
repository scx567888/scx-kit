/**
 *  在 Req0 之上封装的附带权限校验的
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
    static baseReq(url, headers, body, method) {
        //初始化 fetch 参数 , 此处携带 cookie
        const init = {
            method: method, headers: new Headers(), credentials: 'include', body: null
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
     * GET
     * @param url
     * @param headers
     * @param body
     * @returns {Promise<unknown>}
     */
    static get(url, headers, body) {
        return ScxReq.baseReq(url, headers, body, "GET");
    }

    /**
     * POST
     * @param url
     * @param headers
     * @param body
     * @returns {Promise<unknown>}
     */
    static post(url, headers, body) {
        return ScxReq.baseReq(url, headers, body, "POST");
    }

    /**
     * PUT
     * @param url
     * @param headers
     * @param body
     * @returns {Promise<unknown>}
     */
    static put(url, headers, body) {
        return ScxReq.baseReq(url, headers, body, "PUT");
    }

    /**
     * DELETE
     * @param url
     * @param headers
     * @param body
     * @returns {Promise<unknown>}
     */
    static delete(url, headers, body) {
        return ScxReq.baseReq(url, headers, body, "DELETE");
    }

    authHeaders = () => {
        return {};
    };

    noPermHandler = () => console.warn('NoPerm!!!');

    unauthorizedHandler = () => console.warn('Unauthorized!!!');

    serverErrorHandler = () => console.warn('ServerError!!!');

    unKnowErrorHandler = (data) => console.warn('UnKnowError : ' + data);

    //这里将两种情况视为错误
    //一个是由 req0 返回的错误 包括 : 网络错误 和 状态码不在 200-299 之间

    setAuthHeaders(authHeaders) {
        this.authHeaders = authHeaders;
        return this;
    }

    setNoPermHandler(noPermHandler) {
        this.noPermHandler = noPermHandler;
        return this;
    }

    setUnauthorizedHandler(unauthorizedHandler) {
        this.unauthorizedHandler = unauthorizedHandler;
        return this;
    }

    setServerErrorHandler(serverErrorHandler) {
        this.serverErrorHandler = serverErrorHandler;
        return this;
    }

    setUnKnowErrorHandler(unKnowErrorHandler) {
        this.unKnowErrorHandler = unKnowErrorHandler;
        return this;
    }

    //另一个是根据后台 json 的格式约定 将所有 message != ok 的视为 错误
    checkPerms(p) {
        return new Promise((resolve, reject) => p.then(res => {
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
     * @param data
     * @returns {Promise<unknown>}
     */
    get(url, data = null) {
        return this.checkPerms(ScxReq.get(this.scxApiHelper.joinHttpUrl(url), this.authHeaders(), data))
    };

    /**
     * POST 方法
     * @param url
     * @param data
     * @returns {Promise<unknown>}
     */
    post(url, data = null) {
        return this.checkPerms(ScxReq.post(this.scxApiHelper.joinHttpUrl(url), this.authHeaders(), data));
    };

    /**
     * PUT 方法
     * @param url
     * @param data
     * @returns {Promise<unknown>}
     */
    put(url, data = null) {
        return this.checkPerms(ScxReq.put(this.scxApiHelper.joinHttpUrl(url), this.authHeaders(), data))
    };

    /**
     * DELETE 方法
     * @param url
     * @param data
     * @returns {Promise<unknown>}
     */
    delete(url, data = null) {
        return this.checkPerms(ScxReq.delete(this.scxApiHelper.joinHttpUrl(url), this.authHeaders(), data))
    };
}

export {
    ScxReq
}