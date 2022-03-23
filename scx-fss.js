import SparkMD5 from "spark-md5";

class FSSObject {
    fssObjectID;//文件的 id
    fileName;//文件的名称
    uploadTime;//上传时间
    fileMD5;//文件 md5
    fileSizeDisplay;//文件大小 格式化值
    fileSize;//文件大小

    constructor({fssObjectID, fileName, uploadTime, fileMD5, fileSizeDisplay, fileSize}) {
        this.fssObjectID = fssObjectID;
        this.fileName = fileName;
        this.uploadTime = uploadTime;
        this.fileMD5 = fileMD5;
        this.fileSizeDisplay = fileSizeDisplay;
        this.fileSize = fileSize;
    }
}

/**
 * req
 */
class ScxFSS {
    scxReq
    maxUploadSize = 10 * 1024 * 1024 * 1024;//最大上传文件 写死 10GB
    chunkSize = 2 * 1024 * 1024;//切片大小 这里写死 2MB
    uploadURL = '/api/fss/upload'; //上传 url
    listURL = '/api/fss/list'; // 列表 url
    rawURL = '/api/fss/raw/';//raw 的 url
    imageURL = '/api/fss/image/';//image 的 url
    downloadURL = '/api/fss/download/'; //download 的 url
    checkAnyFileExistsByThisMD5URL = '/api/fss/check-any-file-exists-by-this-md5';

    /**
     * req 对象
     * @param scxReq {ScxReq}
     */
    constructor(scxReq) {
        this.scxReq = scxReq;
    }

    /**
     * 格式化显示文件大小
     * @param value
     * @returns {string}
     */
    static formatFileSize(value) {
        if (null == value || value === '') {
            return "0 Bytes";
        }
        const unitArr = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        let index;
        const srcSize = parseFloat(value);
        index = Math.floor(Math.log(srcSize) / Math.log(1024));
        let size = srcSize / Math.pow(1024, index);
        size = size.toFixed(2);//保留的小数位数
        return size + unitArr[index];
    }

    /**
     * 获取 分块和 MD5
     * @param needUploadFile
     * @param uploadProgressCallback
     * @param chunkSize
     * @returns {Promise<unknown>}
     */
    static getChunkAndMD5(needUploadFile, uploadProgressCallback, chunkSize) {
        return new Promise((resolve, reject) => {
            //创建一个对象先
            const chunkAndMD5 = {
                chunk: [],
                md5: ''
            }
            //计算需要分块的数量
            const chunks = Math.ceil(needUploadFile.size / chunkSize);
            //当前分块
            let currentChunk = 0;
            //创建 MD5 校验对象
            const spark = new SparkMD5.ArrayBuffer();
            //创建文件读取对象
            const fileReader = new FileReader();

            //设置加载文件回调
            fileReader.onload = (e) => {
                //设置计算MD5的进度
                uploadProgressCallback('checking-md5', Math.round(currentChunk / chunks * 10000) / 100.00)
                //读取
                spark.append(e.target.result);
                currentChunk = currentChunk + 1;
                //还没有读完
                if (currentChunk < chunks) {
                    loadNext();
                } else { //读完了 赋值MD5 并返回
                    chunkAndMD5.md5 = spark.end(false);
                    //设置校验 md5 为 100%
                    uploadProgressCallback('checking-md5', 100);
                    resolve(chunkAndMD5);
                }
            };

            //发生错误
            fileReader.onerror = () => reject();

            //加载区块方法
            const loadNext = () => {
                //获取起始位置字节数
                const start = currentChunk * chunkSize;
                //获取结束位置字节数
                const end = start + chunkSize >= needUploadFile.size ? needUploadFile.size : start + chunkSize;
                //按照 分块的大小进行切割文件
                const tempFileChunk = needUploadFile.slice(start, end);
                //将切割后的区块放入 fileInfo 对象的 chunk 中以便之后使用
                chunkAndMD5.chunk.push(tempFileChunk);
                //读取 (这里起始就是走的 fileReader.onload 方法)
                fileReader.readAsArrayBuffer(tempFileChunk);
            }

            //开始加载
            loadNext();
        })
    }

    defaultUploadProgressCallback = (uploadState, uploadProgress) => {
        console.log({UploadState: uploadState, UploadProgress: uploadProgress});
    }

    /**
     * 上传到 fss 中
     * @param needUploadFile 待上传的文件
     * @param uploadProgressCallback 上传进度回调
     * @returns {Promise<unknown>} r
     */

    fssUpload(needUploadFile, uploadProgressCallback = this.defaultUploadProgressCallback) {
        return new Promise((resolve, reject) => {
            //先判断待上传的文件是否为空或者是否为 File 对象
            if (needUploadFile == null || !(needUploadFile instanceof File)) {
                reject('文件不能为空并且类型必须为文件!!!');
                return;
            }
            //判断文件大小是否超出最大限制
            if (needUploadFile.size > this.maxUploadSize) {
                reject('文件不能大于 ' + ScxFSS.formatFileSize(this.maxUploadSize) + '!!! 问题文件 : ' + needUploadFile.name);
                return;
            }

            //先将上传的回调设置为 待上传
            uploadProgressCallback('to-be-upload', 0);

            //开始获取 md5和 分块
            ScxFSS.getChunkAndMD5(needUploadFile, uploadProgressCallback, this.chunkSize).then(chunkAndMD5 => {
                const fileName = needUploadFile.name;
                const fileSize = needUploadFile.size;
                const chunk = chunkAndMD5.chunk;
                const md5 = chunkAndMD5.md5;
                let i = 0;

                //创建上传方法
                const uploadNext = () => {
                    //设置进度条 此处由已上传区块数量和全部区块数量计算而得
                    uploadProgressCallback('uploading', Math.round(i / chunkAndMD5.chunk.length * 10000) / 100.00);
                    const uploadFormData = new FormData();
                    uploadFormData.append('fileName', fileName);
                    uploadFormData.append('fileData', chunk[i]);
                    uploadFormData.append('fileSize', fileSize + '');
                    uploadFormData.append('fileMD5', md5);
                    uploadFormData.append('chunkLength', chunk.length + '');
                    uploadFormData.append('nowChunkIndex', i + '');

                    //向后台发送请求
                    this.scxReq.post(this.uploadURL, uploadFormData).then((data) => {
                        //这里因为有断点续传的功能所以可以直接设置 i 以便跳过已经上传过的区块
                        if (data.type === 'need-more') {
                            i = data.item;
                            uploadNext();
                        } else if (data.type === 'upload-success') {
                            uploadProgressCallback('uploading', 100)
                            resolve(data);
                        } else { //这里就属于返回一些别的 类型了 我们虽然不知道是啥,但肯定不对 所以返回错误
                            reject(data)
                        }
                    }).catch(e => {
                        reject(e);
                    });
                }

                //这里先检查一下服务器是否已经有相同MD5的文件了 有的话就不传了
                this.scxReq.post(this.checkAnyFileExistsByThisMD5URL, {
                    fileName: fileName,
                    fileSize: fileSize,
                    fileMD5: md5
                }).then(data => {
                    //这里表示服务器已经有这个文件了
                    uploadProgressCallback('uploading', 100);
                    resolve(data);
                }).catch(error => {//这里表示服务器没找到这个文件 还是老老实实的传吧
                    //这里错误的种类比较多 也可能是网络错误或者权限错误啥的 这里判断一下先
                    if (error.message === 'no-any-file-exists-for-this-md5') {
                        //开始递归上传
                        uploadNext();
                    } else {
                        reject(error)
                    }
                });

            }).catch(e => {
                reject(e)
            })
        })
    };

    /**
     *根据文件 id 获取文件基本信息
     * @param fssObjectIDs s
     * @returns {Promise<unknown>}
     */
    getFSSObject(fssObjectIDs) {
        return new Promise((resolve, reject) => {
            this.scxReq.post(this.listURL, {fssObjectIDs: fssObjectIDs}).then(data => {
                //可以读取的文件
                const canReadFileList = data.items.map(i => new FSSObject(i));
                //此处过滤出 无法读取的文件
                const loseFSSObjectIDs = fssObjectIDs.filter(f => canReadFileList.filter(s => s.fssObjectID === f).length === 0);
                if (loseFSSObjectIDs !== 0 && loseFSSObjectIDs[0] !== '') {
                    loseFSSObjectIDs.forEach(fssObjectID => {
                        const fi = new FSSObject({
                            fssObjectID: fssObjectID,
                            fileMD5: '',
                            fileName: '文件无法读取!!! id 为:' + fssObjectID,
                            fileSizeDisplay: '未知!!!',
                            fileSize: 0,
                            uploadTime: '未知!!!',
                        });
                        canReadFileList.unshift(fi);
                    })
                }
                resolve(canReadFileList);
            });
        })
    };

    /**
     * 获取 raw url
     * @param fssObjectID
     */
    joinRawURL(fssObjectID) {
        return this.scxReq.scxApiHelper.joinHttpURL(this.rawURL) + fssObjectID
    };

    /**
     * 获取 img url
     * @param fssObjectID
     */
    joinImageURL(fssObjectID) {
        return this.scxReq.scxApiHelper.joinHttpURL(this.imageURL) + fssObjectID;
    };

    /**
     * 获取 download url
     * @param fssObjectID
     */
    joinDownloadURL(fssObjectID) {
        return this.scxReq.scxApiHelper.joinHttpURL(this.downloadURL) + fssObjectID
    };

}

export {
    ScxFSS
}