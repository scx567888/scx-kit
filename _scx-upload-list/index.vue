<template>
  <div class="scx-upload-list">
    <!-- 隐藏的 input 用于触发点击上传事件 -->
    <input ref="hiddenInput" multiple placeholder="file" style="display: none" type="file"
           @change="onHiddenInputChange"/>
    <!-- 有文件时显示的图片 -->
    <button @click="callSelectFile">点击上传</button>
    <!-- 删除按钮 -->

    <div v-for="fileInfo in fileInfoList">
      {{ fileInfo }}
    </div>
    <!-- 以下为进度条 -->
    <progress v-if="uploadProgress.visible" :max="100" :value="uploadProgress.value" class="progress"></progress>
  </div>
</template>

<script>
import './index.css'
import {computed, inject, reactive, ref, watch} from "vue";
import {ScxIcon} from "../scx-icon.js";

export default {
  name: "scx-upload-list",
  components: {
    ScxIcon
  },
  props: {
    modelValue: {
      type: Array,
      default: null
    },
    uploadHandler: {
      type: Function,
      default: null
    },
    beforeUpload: {
      type: Function,
      default: null
    }
  },
  setup(props, ctx) {

    //隐藏 input 的上传 id
    const hiddenInput = ref(null);

    /**
     * 注入的外部fss
     * @type {ScxFSS}
     */
    const scxFSS = inject("scx-fss", null);

    //进度条参数
    const uploadProgress = reactive({visible: false, value: 70});

    //拖拽状态
    const dragover = ref(false);

    // 文件
    const proxyModelValue = computed({
      get() {
        return props.modelValue;
      },
      set(value) {
        ctx.emit("update:modelValue", value);
      }
    });

    const fileInfoList = ref([]);

    const scxFSSUploadHandler = (needUploadFile, progress) => new Promise((resolve, reject) => {
      scxFSS.fssUpload({
        needUploadFile, uploadProgressCallback(type, v) {
          if (type === 'checking-md5') {
            progress(v / 2);
          } else if (type === 'uploading') {
            progress(50 + v / 2);
          }
        }
      }).then(d => resolve(d.item.fssObjectID)).catch(e => reject(e));
    });

    //上传文件
    function callUploadHandler(needUploadFiles) {
      const nowUploadInfoTaskList = [];
      for (const needUploadFile of needUploadFiles) {
        let needUploadTask = reactive({fileName: needUploadFile.name, file: needUploadFile});
        nowUploadInfoTaskList.push(needUploadTask);
        fileInfoList.value.push(needUploadTask);
      }
      var s = nowUploadInfoTaskList.length;
      for (let task of nowUploadInfoTaskList) {
        scxFSSUploadHandler(task.file, (type, v) => {
          task.type = type
          task.v = v
        }).then(d => {
          task.fileID = d;
        }).catch(e => {
          console.error(e);
        }).finally(() => {
          task.file = null;
          s = s - 1;
          if (s === 0) {
            // alert("全部上传完毕");
            proxyModelValue.value.push(...nowUploadInfoTaskList.map(c => c.fileID))
          }
          // uploadProgress.visible = false;
          // uploadProgress.value = 0;
        });
      }
    }

    // const h = props.uploadHandler ? props.uploadHandler : scxFSSUploadHandler;
    // uploadProgress.visible = true
    // scxFSSUploadHandler(needUploadFile, (v) => uploadProgress.value = v)
    //     .then(d => {
    //       proxyModelValue.value = d;
    //     })
    //     .catch(e => {
    //       console.error(e);
    //     })
    //     .finally(() => {
    //       uploadProgress.visible = false;
    //       uploadProgress.value = 0;
    //     });

    function callSelectFile() {
      hiddenInput.value.click();
    }

    function deleteImgFile(e) {
      e.stopPropagation();
      proxyModelValue.value = null;
    }

    /**
     * 重置 上传组件的值 保证即使点击重复文件也可以上传
     */
    function resetHiddenInputValue() {
      hiddenInput.value.value = null;
    }

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

    function onHiddenInputChange(e) {
      const needUploadFiles = [];
      for (let file of e.target.files) {
        needUploadFiles.push(file);
      }
      resetHiddenInputValue();
      //重置上传文件对象
      callUploadHandler(needUploadFiles);
    }

    function onModelValueChange(fileIDs) {

      updateFileInfo({
        fileIDs,
        onUpdate(f) {
          fileInfo.previewUrl = f.previewUrl;
          fileInfo.fileName = f.fileName;
        },
        onError(e) {
          console.log(e);
        }
      });
    }

    function updateFileInfo({fileID, onUpdate, onError}) {
      if (!fileID) {
        onUpdate({previewUrl: null, fileName: null});
        return;
      }
      const previewUrl = scxFSS.joinImageURL(fileID, {w: 150, h: 150});
      onUpdate({previewUrl: previewUrl});
      scxFSS.getFSSObject([fileID]).then(d => {
        const item = d[0];
        onUpdate({previewUrl: previewUrl, fileName: item.fileName})
      }).catch(c => {
        onError(c)
      });
    }

//我们根据 proxyModelValue 实时更新 fileInfo
    watch(proxyModelValue, (newVal) => onModelValueChange(newVal));

    return {
      hiddenInput,
      proxyModelValue,
      dragover,
      uploadProgress,
      fileInfoList,
      callDragleave,
      callDrop,
      callDragover,
      onHiddenInputChange,
      callSelectFile,
      deleteImgFile
    }

  }
}
</script>