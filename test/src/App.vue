<template>
  <router-link style="margin-right: 5px" to="/scx-contextmenu-test">右键菜单测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-drag-test">拖动测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-eventbus-test">事件总线测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-icon-test">图标测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-xlsx-test">XLSX导出测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-crud-test">ScxCrud测试</router-link>
  <router-link style="margin-right: 5px" to="/scx-group-test">ScxGroup测试</router-link>
  <router-view/>
</template>

<script>
export default {
  name: "App"
}
</script>

<style scoped>

</style>