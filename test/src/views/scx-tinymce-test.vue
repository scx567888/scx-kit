<template>
  <scx-tinymce v-model="content"/>
  <scx-tinymce v-model="content"/>
  <div v-html="content"></div>
</template>

<script setup>
import ScxTinymce from "../../../_scx-tinymce/index.vue";

import {ref} from "vue";

const content = ref('');

</script>

<style scoped>

</style>