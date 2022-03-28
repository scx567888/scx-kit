const HttpHeaderValues = {
    APPLICATION_JSON: "application/json",
    APPLICATION_XML: "application/xml",
    MULTIPART_FORM_DATA: "multipart/form-data"
}

const HttpHeaderNames = {
    CONTENT_TYPE: "content-type"
}

class ScxReqOptions {
    method;

    headers;

    /**
     *  代表返回值是否特殊处理 为 true 则直接返回 fetch 对象
     */
    originalResults;

    /**
     * 想如何处理返回值 取值如下 [auto, arrayBuffer, blob, formData, json, text, jsonVO] (注意 originalResults 为 true 时此属性无效)
     * jsonVO 是针对后台业务 JsonVo 进行特殊配置 1, 会仅将返回值中 message 字段为 ok 的作为正确请求 2, 会直接提取返回值中的 data 字段作为返回对象
     *
     */
    responseType;

    /**
     * 在 fetch 中只有网络错误才会 reject
     * 若此字段为 true  , 则将会对所有非 2xx 范围的相应拒绝
     * 若此字段为 false , 则何 fetch 保持一致
     */
    rejectIfResponseNotOK;
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
     * @returns {Promise<Object>}
     * @param url
     * @param body {Object}
     * @param options {ScxReqOptions}
     */
    static request(url, body = {}, options = {}) {
        const {
            method = "GET",
            headers,
            originalResults = false,
            responseType = "auto",
            rejectIfResponseNotOK = true
        } = options;
        //初始化 fetch 参数 , 此处携带 cookie
        const init = {
            method,
            headers: new Headers(),
            credentials: 'include',
            body: null
        };
        //根据 body 类型设置请求头
        if (body) {
            if (init.method === 'GET') {
                if (Object.keys(body).length > 0) {
                    url = url + '?' + ScxReq.toURLSearchParams(body);
                }
            } else if (body instanceof FormData) {
                init.body = body;
            } else {
                if (Object.keys(body).length > 0) {
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

        if (originalResults) {
            return fetch(url, init);
        } else {
            //此处进行特殊处理 1, 直接返回结果 2, 将非 2xx 的状态码表示为错误
            return new Promise((resolve, reject) => fetch(url, init).then(res => {
                if (rejectIfResponseNotOK && !res.ok) {
                    reject({error: res, errorType: 'responseNotOK'});
                    return;
                }
                switch (responseType) {
                    case "arrayBuffer": {
                        resolve(res.arrayBuffer());
                        break;
                    }
                    case "blob": {
                        resolve(res.blob());
                        break;
                    }
                    case "formData": {
                        resolve(res.formData());
                        break;
                    }
                    case "json": {
                        resolve(res.json());
                        break;
                    }
                    case "text": {
                        resolve(res.text());
                        break;
                    }
                    case "jsonVO": {
                        //这里是特殊处理
                        res.json().then(d => {
                            if (d.message === 'ok') {
                                resolve(d.data);
                            } else {
                                reject({error: d, errorType: 'jsonVO'});
                            }
                        }).catch(error => reject({error: error, errorType: 'fetch'}))
                        break;
                    }
                    case "auto":
                    default : {
                        let contentType = res.headers.get(HttpHeaderNames.CONTENT_TYPE);
                        if (contentType != null) {
                            contentType = contentType.toLowerCase();
                            if (contentType.startsWith(HttpHeaderValues.APPLICATION_JSON)) {
                                resolve(res.json());
                            } else if (contentType.startsWith("text/") || contentType.startsWith(HttpHeaderValues.APPLICATION_XML)) {
                                resolve(res.text());
                            } else if (contentType.startsWith(HttpHeaderValues.MULTIPART_FORM_DATA)) {
                                resolve(res.formData());
                            } else {
                                resolve(res.arrayBuffer());
                            }
                        } else {
                            resolve(res.arrayBuffer());
                        }
                    }
                }
            }).catch(error => reject({error, errorType: 'fetch'})));
        }

    }

    /**
     * GET 方法
     * @param url
     * @param body {Object}
     * @param options {ScxReqOptions}
     * @returns {Promise<Object>}
     */
    static get(url, body = {}, options = {}) {
        return ScxReq.request(url, body, {...options, method: "GET"});
    }

    /**
     * POST 方法
     * @param url
     * @param body {Object}
     * @param options {ScxReqOptions}
     * @returns {Promise<Object>}
     */
    static post(url, body = {}, options = {}) {
        return ScxReq.request(url, body, {...options, method: "POST"});
    }

    /**
     * PUT 方法
     * @param url
     * @param body {Object}
     * @param options {ScxReqOptions}
     * @returns {Promise<Object>}
     */
    static put(url, body = {}, options = {}) {
        return ScxReq.request(url, body, {...options, method: "PUT"});
    }

    /**
     * DELETE 方法
     * @param url
     * @param body {Object}
     * @param options {ScxReqOptions}
     * @returns {Promise<Object>}
     */
    static delete(url, body = {}, options = {}) {
        return ScxReq.request(url, body, {...options, method: "DELETE"});
    }

    checkPerms(p) {
        return new Promise((resolve, reject) => p.then(v => resolve(v)).catch(error => {
            if (error.errorType === 'responseNotOK') {
                //此处针对一些常见的 错误进行处理 例如 权限问题
                const status = error.error.status;
                if (status === 401) {
                    this.unauthorizedHandler(error);
                } else if (status === 403) {
                    this.noPermHandler(error);
                } else if (status === 500) {
                    this.serverErrorHandler(error);
                } else {
                    this.unKnowErrorHandler(error);
                }
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
        return this.checkPerms(ScxReq.get(this.scxApiHelper.joinHttpURL(url), body, this.mergeOptions(options)));
    }

    /**
     * POST 方法
     * @param url
     * @param body
     * @param options
     * @returns {Promise<unknown>}
     */
    post(url, body = null, options = {}) {
        return this.checkPerms(ScxReq.post(this.scxApiHelper.joinHttpURL(url), body, this.mergeOptions(options)));
    }

    /**
     * PUT 方法
     * @param url
     * @param body
     * @param options
     * @returns {Promise<unknown>}
     */
    put(url, body = null, options = {}) {
        return this.checkPerms(ScxReq.put(this.scxApiHelper.joinHttpURL(url), body, this.mergeOptions(options)));
    }

    /**
     * DELETE 方法
     * @param url
     * @param body
     * @param options
     * @returns {Promise<unknown>}
     */
    delete(url, body = null, options = {}) {
        return this.checkPerms(ScxReq.delete(this.scxApiHelper.joinHttpURL(url), body, this.mergeOptions(options)));
    }

    mergeOptions(options = {}) {
        const finalOptions = {responseType: 'jsonVO', ...options};
        finalOptions.headers = {...this.authHeaders(), ...options.headers};
        return finalOptions;
    }

    authHeaders() {
        return {};
    }

    noPermHandler(error) {
        console.warn('NoPerm!!!');
    }

    unauthorizedHandler(error) {
        console.warn('Unauthorized!!!');
    }

    serverErrorHandler(error) {
        console.warn('ServerError!!!');
    }

    unKnowErrorHandler(error) {
        console.warn('UnKnowError : ', error);
    }

}

export {ScxReq}