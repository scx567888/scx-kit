<template>
  <scx-upload-list v-model="nowFiles" :before-upload="b"/>
  <br>
  <scx-upload-list v-model="nowFiles"/>
  {{ nowFiles }}

</template>

<script setup>
import {ref} from "vue";
import ScxUploadList from "../../../scx-component/scx-upload-list/index.vue";

const nowFiles = ref([]);

function b(files) {
  for (let file of files) {
    const arr = file.name.split(".");
    const extName = arr[arr.length - 1];
    if (extName !== 'jpg' && extName !== 'jpeg' && extName !== 'png') {
      alert("文件必须是图片")
      return false;
    }
  }
  return true;
}
</script>