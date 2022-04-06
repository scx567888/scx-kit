<template>
  <div class="scx-fss-upload" @click="callSelectFile">
    <input ref="hiddenInput" placeholder="file" style="display: none" type="file" @change="callUploadHandler"/>
    <!-- 有文件时显示的图片 -->
    <img v-if="imgFile" :src="callJoinImageURL(imgFile)" alt="img" class="preview-image">
    <!-- 删除按钮 -->
    <div v-if="imgFile" class="delete-button" @click="deleteImgFile">
      <scx-icon icon="outlined-close"/>
    </div>
    <!-- 没有文件时显示 -->
    <div v-if="!imgFile" class="no-preview-image">
      <scx-icon icon="outlined-plus-circle"/>
    </div>
    <!-- 以下为进度条 -->
    <progress v-if="uploadProgress.visible" :max="100" :value="uploadProgress.value" class="progress"></progress>
  </div>
</template>

<script>
import './index.css'
import {computed, inject, reactive, ref} from "vue";
import {ScxIcon} from "../scx-icon.js";

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
      default: null //优先级大于  uploadHandlerType 指定的
    },
    joinImageURL: {
      type: Function,
      default: null
    }
  },
  setup(props, ctx) {

    //隐藏 input 的上传 id
    const hiddenInput = ref(null);

    //注入的外部fss
    const scxFSS = inject("scx-fss", null);

    //进度条参数
    const uploadProgress = reactive({visible: false, value: 70});

    // 文件
    const imgFile = computed({
      get() {
        return props.modelValue;
      },
      set(value) {
        ctx.emit("update:modelValue", value);
      }
    });

    //拼接 image URL
    function callJoinImageURL(imgUrl) {
      if (props.joinImageURL) {
        return props.joinImageURL(imgUrl);
      } else {
        return scxFSS.joinImageURL(imgUrl, {w: 150, h: 150});//这里添加压缩参数
      }
    }

    //上传文件
    function callUploadHandler(e) {
      const needUploadFile = e.target.files[0];
      //重置上传文件对象
      resetHiddenInputValue();
      if (props.uploadHandler) {
        props.uploadHandler(needUploadFile)
      } else {
        scxFSSUploadHandler(needUploadFile);
      }
    }

    function scxFssUploadProgressCallback(type, v) {
      uploadProgress.visible = true
      //这里为了使计算 md5 和 上传各占一半的进度所以这里做一点特殊的计算
      if (type === 'checking-md5') {
        uploadProgress.value = v / 2;
      } else if (type === 'uploading') {
        uploadProgress.value = 50 + v / 2;
        if (v === 100) {
          //传完了隐藏进度条 并重置进度
          uploadProgress.visible = false;
          uploadProgress.value = 0;
        }
      }
    }

    function scxFSSUploadHandler(needUploadFile) {
      scxFSS.fssUpload(needUploadFile, scxFssUploadProgressCallback).then(d => {
        imgFile.value = d.item.fssObjectID;
      }).catch(e => {
        console.error(e);
      });
    }

    function callSelectFile() {
      hiddenInput.value.click();
    }

    function deleteImgFile(e) {
      e.stopPropagation();
      imgFile.value = null;
    }

    /**
     * 重置 上传组件的值 保证即使点击重复文件也可以上传
     */
    function resetHiddenInputValue() {
      hiddenInput.value.value = null;
    }

    return {
      hiddenInput,
      imgFile,
      uploadProgress,
      callJoinImageURL,
      callUploadHandler,
      callSelectFile,
      deleteImgFile
    }

  }
}
</script>