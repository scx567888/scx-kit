<template>
  <input type="file" @change="upload">
  <img v-if="nowFile.fssObjectID" :src="fss.getImageURL(nowFile.fssObjectID)" style="height: 500px;width: 500px;">
  <br>
  {{ nowFile }}
</template>

<script setup>
import {ScxFSS} from "../../../scx-fss.js";
import {ScxApiHelper} from "../../../scx-api-helper.js";
import {ScxReq} from "../../../scx-req.js";
import {ref} from "vue";

const apiHelper = new ScxApiHelper("http://127.0.0.1:8080/");
const req = new ScxReq(apiHelper);
const fss = new ScxFSS(req);
const nowFile = ref({fssObjectID: null});

function upload(e) {
  const file = e.target.files[0];
  if (file) {
    return fss.fssUpload(file).then(data => {
      nowFile.value = data.item;
      console.log(data.type)
    })
  }
}
</script>

<style scoped>

</style>