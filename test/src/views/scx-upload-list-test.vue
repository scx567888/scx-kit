<template>
  <scx-upload-list v-model="nowFiles" />
  <br>
  <scx-upload-list v-model="nowFiles"/>
  <br>
  <input v-model="nowFiles">
  {{nowFiles}}
</template>

<script setup>
import {ref} from "vue";
import ScxUploadList from "../../../_scx-upload-list/index.vue";

const nowFiles = ref([]);

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