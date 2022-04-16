<template>
  <div class="scx-upload-list">

    <!-- 隐藏的 input 用于触发点击上传事件 -->
    <input ref="hiddenInputRef" multiple placeholder="file" style="display: none" type="file"
           @change="onHiddenInputChange">

    <!-- 上传按钮 -->
    <button @click="selectFile">点击上传</button>

    <scx-group v-model="uploadInfoList">
      <template #default="{index,item}">
        <div class="scx-upload-list-item">
          <img :src="item.previewURL" alt="img" class="preview-image">
          <a :href="item.downloadURL">{{ item.fileName }}</a>
          <progress v-if="item.progressVisible" :max="100" :value="item.progressValue" class="progress"></progress>
        </div>
      </template>
    </scx-group>

  </div>
</template>

<script>
import './index.css'
import {computed, inject, reactive, ref, watch} from "vue";
import {ScxIcon} from "../scx-icon.js";
import {CHECKING_MD5, UPLOADING} from "../scx-fss.js";
import {UploadInfo} from "../_scx-upload/UploadInfo.js";
import ScxGroup from "../_scx-group/index.vue";
import {arrayEquals} from "../vanilla-array-utils.js";

export default {
  name: "scx-upload-list",
  components: {
    ScxGroup,
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
     * 已上传的信息列表
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
    async function callUploadHandler(needUploadFiles) {
      if (props.beforeUpload) {
        const result = props.beforeUpload(needUploadFiles);
        if (!result) {
          return;
        }
      }
      for (const needUploadFile of needUploadFiles) {
        const i = new UploadInfo();
        i.fileName = needUploadFile.name;
        i.file = needUploadFile;
        i.progressState = "等待上传中...";
        i.progressVisible = true;
        i.progressValue = 0;
        uploadInfoList.value.push(i);
      }
      const uu = uploadInfoList.value.filter(u => u.progressState === "等待上传中...");
      for (let u of uu) {
        const uploadHandler = props.uploadHandler ? props.uploadHandler : scxFSSUploadHandler;
        const fileInfoHandler = props.fileInfoHandler ? props.fileInfoHandler : scxFSSFileInfoHandler;
        u.fileID = await uploadHandler(u.file, (v, s = "上传中") => {
          u.progressValue = v;
          u.progressState = s;
        });
        const {fileName, previewURL, downloadURL} = await fileInfoHandler(u.fileID);
        u.fileName = fileName;
        u.previewURL = previewURL;
        u.downloadURL = downloadURL;
        u.file = null;
        u.progressVisible = false;
        u.progressValue = 0;
      }
    }

    function onHiddenInputChange(e) {
      const needUploadFiles = Array.from(e.target.files);
      //重置 上传 input 的值 保证即使点击重复文件也可以上传
      hiddenInputRef.value.value = null;
      callUploadHandler(needUploadFiles);
    }

    async function scxFSSFileInfoHandler(fileID) {
      const previewURL = scxFSS.joinImageURL(fileID, {w: 150, h: 150});
      const downloadURL = scxFSS.joinDownloadURL(fileID);
      const item = await scxFSS.info(fileID);
      if (item) {
        return {previewURL, downloadURL, fileName: item.fileName};
      } else {
        return {previewURL: null, downloadURL: null, fileName: '文件无法读取 !!! id : ' + fileID};
      }
    }

    function getFileIDs(l) {
      return l.map(d => d.fileID).filter(d => d);
    }

    function callFileInfoHandler(fileIDs){
      if (!arrayEquals(fileIDs, getFileIDs(uploadInfoList.value))) {
        console.log("外部发生变化 !!!");
        const tempList = [];
        for (let fileID of fileIDs) {
          const u = reactive(new UploadInfo());
          u.fileID = fileID;
          tempList.push(u);
          const fileInfoHandler = props.fileInfoHandler ? props.fileInfoHandler : scxFSSFileInfoHandler;
          fileInfoHandler(u.fileID).then(item => {
            const {fileName, previewURL, downloadURL} = item;
            u.fileName = fileName;
            u.previewURL = previewURL;
            u.downloadURL = downloadURL;
            u.file = null;
            u.progressVisible = false;
            u.progressValue = 0;
          });
        }
        uploadInfoList.value = tempList;
      }
    }

    //我们根据 proxyModelValue 实时更新 fileInfo
    watch(proxyModelValue, (newVal) => callFileInfoHandler(newVal), {immediate: true});

    watch(uploadInfoList, (newVal, oldVal) => {
      const fileIDs = getFileIDs(newVal);
      if (!arrayEquals(fileIDs, proxyModelValue.value)) {
        console.log("内部发生变化 !!!");
        proxyModelValue.value = fileIDs;
      }
    }, {deep: true});

    return {
      hiddenInputRef,
      uploadInfoList,
      onHiddenInputChange,
      selectFile,
    }

  }
}
</script>