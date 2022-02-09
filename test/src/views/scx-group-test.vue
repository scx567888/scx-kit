<template>
  <scx-group v-model="data" :beforeAdd="aaa"
             :beforeRemove="bbb"
             :default-item-value="{name:'',age:'',c:[]}"
  >
    <template #default="{item,index}">
      <div class="test-input-wrapper">
        姓名
        <input v-model="item.name"/>
        年龄:
        <input v-model="item.age"/>
      </div>
      <h3>子数据</h3>
      <scx-group v-model="item.c" :default-item-value="{b:'',d:''}">
        <template #default="h">
          <div class="test-input-wrapper">
            B
            <input v-model="h.item.b"/>
            D:
            <input v-model="h.item.d"/>
          </div>
        </template>
      </scx-group>
    </template>
    <template #addButtonContent>
      <button>自定义的父级添加按钮</button>
    </template>
    <template #deleteButtonContent="{index,item}">
      <button>自定义的父级删除按钮 此条数据的姓名是 : {{ item.name }}</button>
    </template>
  </scx-group>
  {{ data }}
</template>

<script setup>
import {ref} from "vue";

const data = ref([{
  name: '', age: '', c: [
    {b: '', d: ''},
    {b: '', d: ''},
    {b: '', d: ''},
    {b: '', d: ''},
    {b: '', d: ''},
    {b: '', d: ''},
    {b: '', d: ''},
  ]
}, {
  name: '', age: '', c: [
    {b: '', d: ''},
    {b: '', d: ''},
    {b: '', d: ''},
    {b: '', d: ''},
    {b: '', d: ''},
    {b: '', d: ''},
    {b: '', d: ''},
  ]
}]);

function aaa(v) {
  v.name = 11111
  return true
}

function bbb(i) {
  console.log(i)
  alert("删除成功");
  return true
}
</script>
<style scoped>
.test-input-wrapper {
  display: flex;
  justify-content: center;
}
</style>