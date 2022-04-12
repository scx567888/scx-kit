<template>
  <div class="scx-fss-upload">

    <!-- 隐藏的 input 用于触发点击上传事件 -->
    <input ref="hiddenInput" placeholder="file" style="display: none" type="file" @change="onHiddenInputChange()"/>

    <!-- 有文件时预览文件 -->
    <div v-if="proxyModelValue" class="preview">
      <!-- 有预览图时显示预览图 -->
      <img v-if="fileInfo.previewUrl" :src="fileInfo.previewUrl" alt="img" class="preview-image">
      <!-- 没有预览图但是有文件名时显示文件名 -->
      <span v-else-if="fileInfo.fileName" class="preview-text">{{ fileInfo.fileName }}</span>
      <!-- 都没有时显示文件 id -->
      <span v-else class="preview-text">{{ proxyModelValue }}</span>
      <!-- 操作项 -->
      <div class="operation">
        <div class="operation-item" @click="downloadFile()">
          下载
        </div>
        <div class="operation-item" @click="selectFile()">
          替换
        </div>
        <div class="operation-item" @click="deleteFile()">
          删除
        </div>
      </div>
    </div>

    <!-- 没有文件时显示 -->
    <div v-else class="no-preview" @click="selectFile()" :class="dragover ?'dragover ':''" @dragleave="callDragleave()"
         @dragover="callDragover()" @drop="callDrop()">
      <scx-icon icon="outlined-plus-circle"/>
      <span class="no-preview-text">支持拖拽</span>
    </div>

    <!-- 以下为进度条 -->
    <progress v-if="uploadProgress.visible" :max="100" :value="uploadProgress.value" class="progress"></progress>

  </div>
</template>

<script>
import './index.css'
import {computed, inject, reactive, ref, watch} from "vue";
import {ScxIcon} from "../scx-icon.js";
import {CHECKING_MD5, UPLOADING} from "../scx-fss.js";
import {download} from "../vanilla-download.js";

export default {
  name: "scx-fss-upload",
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

    const hiddenInput = ref(null);// 隐藏 input 的上传 id

    const scxFSS = inject("scx-fss", null); // 注入的 scx-fss

    const uploadProgress = reactive({visible: false, value: 70}); // 进度条参数

    const proxyModelValue = computed({ //代理 modelValue
      get() {
        return props.modelValue;
      },
      set(value) {
        ctx.emit("update:modelValue", value);
      }
    });

    const fileInfo = reactive({fileName: '未知文件', previewUrl: null, downloadUrl: null});

    //默认的 scx-fss 的上传 handler
    const scxFSSUploadHandler = (needUploadFile, progress) => new Promise((resolve, reject) => {
      scxFSS.fssUpload(needUploadFile, (type, v) => {
        if (type === CHECKING_MD5) {
          progress(v / 2);
        } else if (type === UPLOADING) {
          progress(50 + v / 2);
        }
      }).then(d => resolve(d.item.fssObjectID)).catch(e => reject(e));
    });

    //默认的 scx-fss 的 fileInfoHandler
    const scxFSSFileInfoHandler = (fileID, onUpdate, onError) => {
      if (!fileID) {
        onUpdate({previewUrl: null, fileName: null, downloadUrl: null});
        return;
      }
      const previewUrl = scxFSS.joinImageURL(fileID, {w: 150, h: 150});
      const downloadUrl = scxFSS.joinDownloadURL(fileID);
      onUpdate({previewUrl, downloadUrl});
      scxFSS.getFSSObject([fileID]).then(d => {
        const item = d[0];
        onUpdate({previewUrl, downloadUrl, fileName: item.fileName,})
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
      uploadProgress.visible = true
      h(needUploadFile, (v) => uploadProgress.value = v).then(d => {
        proxyModelValue.value = d;
      }).catch(e => {
        console.error(e);
      }).finally(() => {
        uploadProgress.visible = false;
        uploadProgress.value = 0;
      });
    }

    function callFileInfoHandler(fileID) {
      const h = props.fileInfoHandler ? props.fileInfoHandler : scxFSSFileInfoHandler;
      h(fileID, (f) => {
        fileInfo.previewUrl = f.previewUrl;
        fileInfo.fileName = f.fileName;
        fileInfo.downloadUrl = f.downloadUrl;
      }, (e) => {
        console.log(e);
      });
    }

    function selectFile() {
      hiddenInput.value.click();
    }

    function deleteFile() {
      proxyModelValue.value = null;
    }

    function downloadFile() {
      if (fileInfo && fileInfo.downloadUrl) {
        if (fileInfo.fileName) {
          download(fileInfo.downloadUrl, fileInfo.fileName);
        } else {
          download(fileInfo.downloadUrl);
        }
      }
    }

    function onHiddenInputChange(e) {
      const needUploadFile = e.target.files[0];
      //重置 上传 input 的值 保证即使点击重复文件也可以上传
      hiddenInput.value.value = null;
      callUploadHandler(needUploadFile);
    }

    //我们根据 proxyModelValue 实时更新 fileInfo
    watch(proxyModelValue, (newVal) => callFileInfoHandler(newVal));

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
      hiddenInput,
      proxyModelValue,
      uploadProgress,
      fileInfo,
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