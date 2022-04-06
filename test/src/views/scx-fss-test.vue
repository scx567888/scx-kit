<template>
  <scx-fss-upload v-model="nowFile"/>
  {{ nowFile }}
</template>

<script setup>
import {ref} from "vue";

const nowFile = ref('');
</script>