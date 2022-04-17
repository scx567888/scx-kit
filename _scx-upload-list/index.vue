<template>
  <div class="scx-upload-list">

    <!-- 隐藏的 input 用于触发点击上传事件 -->
    <input ref="hiddenInputRef" multiple placeholder="file" style="display: none" type="file"
           @change="onHiddenInputChange">

    <scx-group v-model="uploadInfoList">
      <template #before>
        <!-- 上传按钮 -->
        <button class="upload-button" @click="selectFile">点击上传, 当前共 {{ proxyModelValue.length }} 个文件</button>
      </template>
      <template #default="{index,item}">
        <div class="preview-item">
          <img :src="item.previewURL" alt="img" class="preview-image">
          <div class="preview-text">
            <a v-if="item.downloadURL" :href="item.downloadURL">{{ item.fileName }}</a>
            <span v-else>{{ item.fileName }}</span>
            <div v-if="item.progressVisible" class="progress-state">
              <div>{{ item.progressState }}</div>
              <progress :max="100" :value="item.progressValue"></progress>
            </div>
            <div v-else class="item-info">
              <div>上传时间 : {{ item.uploadTime }}</div>
              <div>文件大小 : {{ item.fileSizeDisplay }}</div>
            </div>
          </div>
        </div>
      </template>
    </scx-group>

  </div>
</template>

<script>
import './index.css'
import {computed, inject, reactive, ref, watch} from "vue";
import {ScxIcon} from "../scx-icon.js";
import {ScxFSSHelper, UploadInfo} from "../_scx-upload/helper.js";
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

    const scxFSS = inject("scx-fss", null);

    const scxFSSHelper = new ScxFSSHelper(scxFSS);

    function getFileInfoHandler() {
      return props.fileInfoHandler ? props.fileInfoHandler : (fileID) => scxFSSHelper.fileInfoHandler(fileID);
    }

    function getUploadHandler() {
      return props.uploadHandler ? props.uploadHandler : (needUploadFile, progress) => scxFSSHelper.uploadHandler(needUploadFile, progress);
    }

    const hiddenInputRef = ref(null);

    function selectFile() {
      hiddenInputRef.value.click();
    }

    function onHiddenInputChange(e) {
      const needUploadFiles = Array.from(e.target.files);
      //重置 上传 input 的值 保证即使点击重复文件也可以上传
      hiddenInputRef.value.value = null;
      callUploadHandler(needUploadFiles);
    }

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
        const progress = (v, s = "上传中") => {
          u.progressValue = v;
          u.progressState = s;
        };
        u.fileID = await getUploadHandler()(u.file, progress);
        const item = await getFileInfoHandler()(u.fileID);
        u.fill(item);
        u.file = null;
        u.progressVisible = false;
        u.progressValue = 0;
      }
    }

    function getFileIDs(l) {
      return l.map(d => d.fileID).filter(d => d);
    }

    function callFileInfoHandler(fileIDs) {
      if (!arrayEquals(fileIDs, getFileIDs(uploadInfoList.value))) {
        console.log("外部发生变化 !!!");
        const tempList = [];
        for (let fileID of fileIDs) {
          const u = reactive(new UploadInfo());
          u.fileID = fileID;
          tempList.push(u);
          getFileInfoHandler()(u.fileID).then(item => {
            u.fill(item);
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

    function callProxyModelHandler(list) {
      const fileIDs = getFileIDs(list);
      if (!arrayEquals(fileIDs, proxyModelValue.value)) {
        console.log("内部发生变化  !!!");
        proxyModelValue.value = fileIDs;
      }
    }

    watch(uploadInfoList, (newVal) => callProxyModelHandler(newVal), {deep: true});

    return {
      hiddenInputRef,
      uploadInfoList,
      proxyModelValue,
      onHiddenInputChange,
      selectFile,
    }

  }
}
</script>