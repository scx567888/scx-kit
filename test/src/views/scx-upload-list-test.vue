<template>
  <scx-upload-list v-model="nowFiles"/>
  <br>
  <scx-group v-model="nowFiles">
    <template #default="{item,index}">
      {{item}}
    </template>
  </scx-group>
  <input v-model="nowFiles">
  {{ nowFiles }}

</template>

<script setup>
import {ref} from "vue";
import ScxUploadList from "../../../_scx-upload-list/index.vue";
import ScxGroup from "../../../_scx-group/index.vue";

const nowFiles = ref(["c0f033b3-6555-4a89-aa8d-aa34086d108d","45769a69-c632-4124-9b09-9e2934e977aa","e2d755bc-8e4c-46f1-a9a1-0e4e11510148","e66ed361-5d3f-4133-84ac-fedb6688fe9f","e26e47e6-1620-40c7-afe7-bc2559af0cee","7b2f21df-049a-44ff-bcc8-d7a8a6c1a352","90e67c10-e714-474d-9c62-85b0a1e8fdad","29780ecc-c46f-4bdf-8d78-00d69b22d20e","4b4ed640-8dec-455f-80cc-b73c7832314a","5dac53d3-4517-443a-beca-4923dda800d3","477bf86a-e773-4ab7-979c-0ee64a64f3ed","abe4c50e-eb02-4728-814f-31b25001b5d1","ce216a43-1dc0-4b51-bbb6-8d2f88557a8f","a4468308-4bd7-409e-89a0-3ba7b5849993","05cd5de1-2084-47b7-8228-597b2148341f","476d1980-c4e9-47c5-bde2-1a5a488e0549","82bd772c-e4c0-483d-a46a-5d5cb6608df4"]);


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