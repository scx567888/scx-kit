<template>
  <div class="scx-upload">

    <!-- 隐藏的 input 用于触发点击上传事件 -->
    <input ref="hiddenInputRef" placeholder="file" style="display: none" type="file" @change="onHiddenInputChange"/>

    <!-- 有文件时预览文件 -->
    <div v-if="proxyModelValue" class="preview">
      <!-- 有预览图时显示预览图 -->
      <img v-if="uploadInfo.previewURL" :src="uploadInfo.previewURL" alt="img" class="preview-image">
      <!-- 没有预览图但是有文件名时显示文件名 -->
      <div v-else-if="uploadInfo.fileName" class="preview-text">
        <div>{{ uploadInfo.fileName }}</div>
      </div>
      <!-- 都没有时显示文件 id -->
      <div v-else class="preview-text">
        <div>{{ proxyModelValue }}</div>
      </div>
      <!-- 操作项 -->
      <div class="operation">
        <div class="item-download" @click="downloadFile">
          下载
        </div>
        <div class="item-replace" @click="selectFile">
          替换
        </div>
        <div class="item-delete" @click="deleteFile">
          删除
        </div>
      </div>
    </div>

    <!-- 没有文件时显示 -->
    <div v-else :class="dragover ?'dragover ':''" class="no-preview" @click="selectFile" @dragleave="callDragleave"
         @dragover="callDragover" @drop="callDrop">
      <scx-icon icon="outlined-plus-circle"/>
      <span>点击或拖拽</span>
    </div>

    <div v-if="uploadInfo.progressVisible" class="progress">
      <div class="temp-file-name">
        <div>
          {{ uploadInfo.fileName }}
        </div>
      </div>
      <div class="progress-state">
        <div>
          <div>{{ uploadInfo.progressState }}</div>
          <div>{{ uploadInfo.progressValue }}%</div>
        </div>
        <!-- 以下为进度条 -->
        <progress :max="100" :value="uploadInfo.progressValue"></progress>
      </div>

    </div>

  </div>
</template>

<script>
import './index.css'
import {computed, inject, reactive, ref, watch} from "vue";
import {ScxIcon} from "../scx-icon.js";
import {CHECKING_MD5, UPLOADING} from "../scx-fss.js";
import {download} from "../vanilla-download.js";
import {percentage} from "../vanilla-percentage.js";
import {UploadInfo} from "./UploadInfo.js";

export default {
  name: "scx-upload",
  components: {
    ScxIcon
  },
  props: {
    modelValue: {
      type: String,
      default: null
    },
    uploadHandler: {
      type: Function,
      default: null
    },
    fileInfoHandler: {
      type: Function,
      default: null
    },
    beforeUpload: {
      type: Function,
      default: null
    }
  },
  setup(props, ctx) {

    /**
     *  隐藏的 input 上传组件
     *
     */
    const hiddenInputRef = ref(null);

    /**
     * 注入的 scx-fss
     * @type {ScxFSS}
     */
    const scxFSS = inject("scx-fss", null);

    /**
     * 代理 modelValue
     * @type {WritableComputedRef<string>}
     */
    const proxyModelValue = computed({
      get() {
        return props.modelValue;
      },
      set(value) {
        ctx.emit("update:modelValue", value);
      }
    });

    /**
     * 上传信息
     * @type {UnwrapNestedRefs<UploadInfo>}
     */
    const uploadInfo = reactive(new UploadInfo());

    //默认的 scx-fss 的上传 handler
    const scxFSSUploadHandler = (needUploadFile, progress) => new Promise((resolve, reject) => {
      scxFSS.upload(needUploadFile, (state, value) => {
        if (state === CHECKING_MD5) {
          progress(value, "校验中");
        } else if (state === UPLOADING) {
          progress(value, "上传中");
        }
      }).then(d => resolve(d.item.fssObjectID)).catch(e => reject(e));
    });

    //默认的 scx-fss 的 fileInfoHandler
    const scxFSSFileInfoHandler = (fileID, onUpdate, onError) => {
      if (!fileID) {
        onUpdate({previewURL: null, downloadURL: null, fileName: null});
        return;
      }
      const previewURL = scxFSS.joinImageURL(fileID, {w: 150, h: 150});
      const downloadURL = scxFSS.joinDownloadURL(fileID);
      onUpdate({previewURL, downloadURL});
      scxFSS.info(fileID).then(item => {
        if (item) {
          onUpdate({previewURL, downloadURL, fileName: item.fileName});
        } else {
          onUpdate({previewURL: null, downloadURL: null, fileName: '文件无法读取 !!! id : ' + fileID});
        }
      }).catch(c => {
        onError(c)
      });
    };

    //上传文件
    function callUploadHandler(needUploadFile) {
      if (props.beforeUpload) {
        const result = props.beforeUpload(needUploadFile);
        if (!result) {
          return;
        }
      }
      const h = props.uploadHandler ? props.uploadHandler : scxFSSUploadHandler;
      uploadInfo.progressVisible = true;
      uploadInfo.fileName = needUploadFile.name;
      h(needUploadFile, (v, s = "上传中") => {
        //处理一下百分比的格式防止  33.33333333333339 这种情况出现
        uploadInfo.progressState = s;
        uploadInfo.progressValue = percentage(v, 100);
      }).then(d => {
        proxyModelValue.value = d;
      }).catch(e => {
        console.error(e);
      }).finally(() => {
        uploadInfo.progressVisible = false;
        uploadInfo.progressValue = 0;
      });
    }

    function callFileInfoHandler(fileID) {
      const h = props.fileInfoHandler ? props.fileInfoHandler : scxFSSFileInfoHandler;
      h(fileID, (f) => {
        uploadInfo.fileName = f.fileName;
        uploadInfo.previewURL = f.previewURL;
        uploadInfo.downloadURL = f.downloadURL;
      }, (e) => {
        console.log(e);
      });
    }

    function selectFile() {
      hiddenInputRef.value.click();
    }

    function deleteFile() {
      proxyModelValue.value = null;
    }

    function downloadFile() {
      if (uploadInfo && uploadInfo.downloadURL) {
        if (uploadInfo.fileName) {
          download(uploadInfo.downloadURL, uploadInfo.fileName);
        } else {
          download(uploadInfo.downloadURL);
        }
      }
    }

    function onHiddenInputChange(e) {
      const needUploadFile = e.target.files[0];
      //重置 上传 input 的值 保证即使点击重复文件也可以上传
      hiddenInputRef.value.value = null;
      callUploadHandler(needUploadFile);
    }

    //我们根据 proxyModelValue 实时更新 fileInfo
    watch(proxyModelValue, (newVal) => callFileInfoHandler(newVal), {immediate: true});

    //拖拽状态
    const dragover = ref(false);

    function callDrop(e) {
      e.preventDefault();
      dragover.value = false;
      const needUploadFile = e.dataTransfer.files[0];
      callUploadHandler(needUploadFile);
    }

    function callDragover(e) {
      e.preventDefault();
      dragover.value = true;
    }

    function callDragleave(e) {
      e.preventDefault();
      dragover.value = false;
    }

    return {
      hiddenInputRef,
      proxyModelValue,
      uploadInfo,
      dragover,
      onHiddenInputChange,
      selectFile,
      deleteFile,
      downloadFile,
      callDrop,
      callDragover,
      callDragleave
    }

  }
}
</script>