<template>
  <div class="scx-upload-list">

    <!-- 隐藏的 input 用于触发点击上传事件 -->
    <input ref="hiddenInputRef" multiple placeholder="file" style="display: none" type="file" @change="onHiddenInputChange">

    <!-- 上传按钮 -->
    <button @click="selectFile">点击上传</button>

    <!-- 删除按钮 -->
    <div v-for="(uploadInfo,i) in uploadInfoList" class="item">
      {{ uploadInfo }}
      <progress v-if="uploadInfo.progressState" :max="100" :value="uploadInfo.progressValue" class="progress"></progress>
      <div style="position: absolute;top: 0;right: 0;">
        <button v-if="i>0" @click="moveUp(i)">↑</button>
        <button v-if="i<uploadInfoList.length-1" @click="moveDown(i)">↓</button>
        <button @click="groupItemDelete(i)">X</button>
      </div>
    </div>

    {{s}}

  </div>
</template>

<script>
import './index.css'
import {computed, inject, ref, watch} from "vue";
import {ScxIcon} from "../scx-icon.js";
import {CHECKING_MD5, UPLOADING} from "../scx-fss.js";
import {UploadInfo} from "../_scx-upload/UploadInfo.js";
import { insertItem} from "../vanilla-array-utils.js";

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
    const s = [1, 2, 3];
    insertItem(s,1,999,888);
    console.log(s)
    /**
     *  隐藏的 input 上传组件
     *
     */
    const hiddenInputRef = ref(null);

    function selectFile() {
      hiddenInputRef.value.click();
    }

    /**
     * 注入的 scx-fss
     * @type {ScxFSS}
     */
    const scxFSS = inject("scx-fss", null);

    /**
     * 代理 modelValue
     * @type {WritableComputedRef<string[]>}
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
     * 上传信息列表
     * @type {Ref<UnwrapRef<UploadInfo[]>>}
     */
    const uploadInfoList = ref([]);

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

    //上传文件
    function callUploadHandler(needUploadFiles) {
      for (const needUploadFile of needUploadFiles) {
        const u = new UploadInfo();
        u.fileName = needUploadFile.name;
        u.file = needUploadFile;
        u.progressState = "等待上传中...";
        u.progressVisible = true;
        u.progressValue = 0;
        uploadInfoList.value.push(u);
      }
      const uu = uploadInfoList.value.filter(u => u.progressState === "等待上传中...");
      let ul = uu.length;
      for (let u of uu) {
        scxFSSUploadHandler(u.file, (v, s = "上传中") => {
          u.progressValue = v;
          u.progressState = s;
        }).then(d => {
          u.fileID = d;
        }).catch(e => {
          console.error(e);
        }).finally(() => {
          u.file = null;
          ul = ul - 1;
          if (ul === 0) {
            alert("全部上传完毕");
            // proxyModelValue.value.push(...nowUploadInfoTaskList.map(c => c.fileID));
          }
          // uploadProgress.visible = false;
          // uploadProgress.value = 0;
        });
      }
    }

    function deleteImgFile(e) {
      e.stopPropagation();
      proxyModelValue.value = null;
    }

    /**
     * 重置 上传组件的值 保证即使点击重复文件也可以上传
     */
    function resetHiddenInputValue() {

    }

    function onHiddenInputChange(e) {
      const needUploadFiles = Array.from(e.target.files);
      //重置 上传 input 的值 保证即使点击重复文件也可以上传
      hiddenInputRef.value.value = null;
      callUploadHandler(needUploadFiles);
    }

    function onModelValueChange(fileIDs) {

      // updateFileInfo({
      //   fileIDs,
      //   onUpdate(f) {
      //     fileInfo.previewUrl = f.previewUrl;
      //     fileInfo.fileName = f.fileName;
      //   },
      //   onError(e) {
      //     console.log(e);
      //   }
      // });
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

    function remove(){

    }

    function groupItemDelete(index) {
      uploadInfoList.value.splice(index, 1);
    }

    function moveUp(index) {
      if (index - 1 >= 0) {
        const temp = uploadInfoList.value[index];
        uploadInfoList.value[index] = uploadInfoList.value[index - 1];
        uploadInfoList.value[index - 1] = temp;
      }
    }

    function moveDown(index) {
      if (index + 1 <= uploadInfoList.value.length) {
        const temp = uploadInfoList.value[index];
        uploadInfoList.value[index] = uploadInfoList.value[index + 1];
        uploadInfoList.value[index + 1] = temp;
      }
    }

//我们根据 proxyModelValue 实时更新 fileInfo
    watch(proxyModelValue, (newVal) => onModelValueChange(newVal));

    return {
      hiddenInputRef,
      proxyModelValue,
      uploadInfoList,
      onHiddenInputChange,
      selectFile,
      deleteImgFile,
      groupItemDelete,
      moveDown,
      moveUp,
      s
    }

  }
}
</script>