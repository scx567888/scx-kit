/**
 * 是否是外链
 * @param {string} path
 * @returns {boolean}
 */
function isExternal(path) {
    return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * BaseUrl 类
 */
class ScxBaseApiUrl {
    constructor(configApiUrl) {
        const httpUrl = configApiUrl.endsWith("/") ? configApiUrl.substring(0, configApiUrl.length - 1) : configApiUrl;
        //此处判断是否是 https
        const webSocketPrefix = httpUrl.startsWith("https://") ? 'wss://' : 'ws://';
        const webSocketUrl = webSocketPrefix + httpUrl.split("://")[1];
        //raw 的 url
        const rawUrl = '/api/fss/raw/';
        //image 的 url
        const imageUrl = '/api/fss/image/';
        //download 的 url
        const downloadUrl = '/api/fss/download/';

        /**
         * 拼接 http url
         * @param url
         * @returns {*}
         */
        this.joinHttpUrl = (url) => isExternal(url) ? url : httpUrl + (url.startsWith("/") ? url : '/' + url);

        /**
         * 拼接 wsUrl
         * @param url
         * @returns {string}
         */
        this.joinWSUrl = (url) => webSocketUrl + (url.startsWith("/") ? url : '/' + url);

        /**
         * 获取 raw url
         * @param fssObjectID
         */
        this.getRawUrl = (fssObjectID) => this.joinHttpUrl(rawUrl) + fssObjectID;

        /**
         * 获取 img url
         * @param fssObjectID
         */
        this.getImageUrl = (fssObjectID) => this.joinHttpUrl(imageUrl) + fssObjectID;

        /**
         * 获取 download url
         * @param fssObjectID
         */
        this.getDownloadUrl = (fssObjectID) => this.joinHttpUrl(downloadUrl) + fssObjectID;

        /**
         * 获取 http 的 URL
         * @returns {string|*}
         */
        this.getHttpUrl = () => httpUrl;

        /**
         * 获取 webSocket 的 URL
         * @returns {string}
         */
        this.getWebSocketUrl = () => webSocketUrl;

    }
}

export {ScxBaseApiUrl}