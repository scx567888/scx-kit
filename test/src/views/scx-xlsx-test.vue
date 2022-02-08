<template>
  <button @click="exportXLSX()">点击导出</button>
</template>

<script>
import {exportExcel} from "../../../scx-kit.js";

export default {
  name: "scx-xlsx-test",
  setup() {

    function exportXLSX() {
      var headTranslation = {name: '姓名', idCard: '身份证号码', age: "年龄",}
      var data = []
      for (let i = 0; i < 999; i++) {
        data.push({name: '张三' + 1, age: i, idCard: "202001999192929" + i})
      }
      exportExcel({headerTranslationMap: headTranslation, listData: data})
    }

    return {
      exportXLSX
    }
  }
}
</script>

<style scoped>

</style>