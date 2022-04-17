import {CHECKING_MD5, UPLOADING} from "../scx-fss.js";

class UploadInfo {

    /**
     * a
     * @type {string}
     */
    fileName = '';

    /**
     * a
     * @type {string}
     */
    previewURL = null;

    /**
     *
     * @type {string}
     */
    downloadURL = null;

    /**
     *
     * @type {number}
     */
    progressValue = 0;

    /**
     * a
     * @type {string}
     */
    progressState = '上传中';

    /**
     * a
     * @type {boolean}
     */
    progressVisible = false;

    /**
     *
     * @type {File}
     */
    file = null;

    /**
     * a
     * @type {string}
     */
    fileID = '';

    /**
     * 上传时间
     * @type {null}
     */
    uploadTime = null;

    /**
     * 文件大小
     * @type {null}
     */
    fileSizeDisplay = null;

    reset() {
        this.fileName = null;
        this.previewURL = null;
        this.downloadURL = null;
        this.uploadTime = null;
        this.fileSizeDisplay = null;
    }

    fill(rawOptions) {
        const {
            fileName, previewURL, downloadURL, uploadTime, fileSizeDisplay
        } = rawOptions;
        this.fileName = fileName;
        this.previewURL = previewURL;
        this.downloadURL = downloadURL;
        this.uploadTime = uploadTime;
        this.fileSizeDisplay = fileSizeDisplay;
    }

}

class ScxFSSHelper {

    /**
     * @type ScxFSS
     */
    scxFSS

    constructor(scxFSS) {
        this.scxFSS = scxFSS;
    }

    /**
     *  默认的 scx-fss 的 fileInfoHandler
     *
     * @param fileID
     * @returns {Promise<{fileName: string}|{[p: string]: *}>}
     */
    fileInfoHandler(fileID) {
        const previewURL = this.scxFSS.joinImageURL(fileID, {w: 150, h: 150});
        const downloadURL = this.scxFSS.joinDownloadURL(fileID);
        return new Promise((resolve, reject) => {
            this.scxFSS.info(fileID).then(item => {
                if (item) {
                    resolve({...item, previewURL, downloadURL});
                } else {
                    resolve({fileName: '文件无法读取 !!! id : ' + fileID});
                }
            }).catch(e => reject(e));
        });
    }

    /**
     * 默认的 scx-fss 的上传 handler
     * @param needUploadFile
     * @param progress
     * @returns {Promise<unknown>}
     */
    uploadHandler(needUploadFile, progress) {
        const onProgress = (state, value) => {
            //前 50% 是校验 md5 后 50% 才是真正的文件上传
            if (state === CHECKING_MD5) {
                progress(value * 0.5, "校验中");
            } else if (state === UPLOADING) {
                progress(50 + value * 0.5, "上传中");
            }
        };
        return new Promise((resolve, reject) => {
            this.scxFSS.upload(needUploadFile, onProgress).then(d => {
                resolve(d.item.fssObjectID);
            }).catch(e => reject(e));
        })
    }

}

export {UploadInfo, ScxFSSHelper}