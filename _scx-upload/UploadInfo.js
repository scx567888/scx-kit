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
}

export {UploadInfo}