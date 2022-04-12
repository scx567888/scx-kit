<template>
  <scx-fss-upload v-model="nowFile" :before-upload="b"/>
  <input v-model="nowFile">
</template>

<script setup>
import {ref} from "vue";
import ScxFssUpload from "../../../_scx-fss-upload/index.vue";

const nowFile = ref('');

function b(file) {
  const arr = file.name.split(".");
  const extName = arr[arr.length - 1];
  if (extName === 'jpg' || extName === 'jpeg' || extName === 'png') {
    return true;
  } else {
    alert("文件必须是图片")
    return false;
  }
}
</script>