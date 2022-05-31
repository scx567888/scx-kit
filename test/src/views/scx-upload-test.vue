<template>
  <p>这个添加了类型校验</p>
  <scx-upload v-model="nowFile" :before-upload="b"/>
  <p>这个没有添加类型校验</p>
  <scx-upload v-model="nowFile" disabled/>
  <br>
  <input v-model="nowFile">
</template>

<script setup>
import {ref} from "vue";
import ScxUpload from "../../../_scx-upload/index.vue";

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