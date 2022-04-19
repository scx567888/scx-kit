<template>
  <router-link style="margin-right: 5px" to="/">Home</router-link>
  <router-link style="margin-right: 5px" to="/scx-contextmenu-test">右键菜单测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-drag-test">拖动测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-eventbus-test">事件总线测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-icon-test">图标测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-xlsx-test">XLSX导出测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-crud-test">ScxCrud测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-group-test">ScxGroup测试</router-link>
  <router-link style="margin-right: 5px" to="/list-to-tree-test">ListToTree测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-upload-test">ScxUpload 测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-upload-list-test">ScxUploadList 测试</router-link>
  <router-view/>
</template>

<script>
import {provide} from "vue";
import {scxApiHelper, scxEventBus, scxFSS, scxReq} from "./_scx/index.js";

export default {
  name: "App",
  setup() {
    provide("scx-api-helper", scxApiHelper);
    provide("scx-req", scxReq);
    provide("scx-event-bus", scxEventBus);
    provide("scx-fss", scxFSS);
  }
}
</script>

<style scoped>

</style>