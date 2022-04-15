<template>
  <div class="scx-group">
    <transition-group name="scx-group-list" @before-leave="fixedElement">
      <div v-for="(item,i) in list" :key="item" class="scx-group scx-group-item">
        <div class="scx-group-item-content">
          <slot :index="i" :item="item"></slot>
        </div>
        <div style="position: absolute;top: 0;right: 0;">
          <button v-if="showMoveUp(i)" @click="groupItemMoveUp(i)">↑</button>
          <button v-if="showMoveDown(i)" @click="groupItemMoveDown(i)">↓</button>
          <button @click="groupItemDelete(i)">X</button>
        </div>
      </div>
    </transition-group>
    <div @click="groupItemAdd()">
      <slot name="addButtonContent">
        <button>添加一条数据</button>
      </slot>
    </div>
  </div>
</template>

<script>
import './index.css'
import {computed} from "vue";
import {fixedElement} from "../thirdparty-vue-transition.js";
import {moveDownByIndex, moveUpByIndex, removeByIndex} from "../vanilla-array-utils.js";

export default {
  name: "scx-group",
  props: {
    modelValue: {
      type: Array,
      required: true,
      default: [],
    },
    defaultItemValue: {
      type: Object,
      required: true,
      default: {},
    },
    beforeAdd: { // 在这里我们还可以更改待添加的数据
      type: Function,
      default: null
    },
    beforeRemove: {
      type: Function,
      default: null
    },
    beforeMoveUp: {
      type: Function,
      default: null
    },
    beforeMoveDown: {
      type: Function,
      default: null
    },
    loop: {
      type: Boolean,
      default: true
    }
  },
  setup(props, ctx) {

    if (!props.modelValue) {
      ctx.emit("update:modelValue", []);
    }

    const list = computed({
      get() {
        return props.modelValue;
      },
      set(value) {
        ctx.emit("update:modelValue", value);
      }
    })

    function groupItemDelete(index) {
      if (props.beforeRemove) {
        //如果返回值是 false 则不添加
        if (!props.beforeRemove(list.value[index])) {
          return;
        }
      }
      list.value = removeByIndex(list.value, index);
    }

    function groupItemMoveUp(index) {
      if (props.beforeMoveUp) {
        //如果返回值是 false 则不添加
        if (!props.beforeMoveUp(index)) {
          return;
        }
      }
      list.value = moveUpByIndex(list.value, index, props.loop);
    }

    function groupItemMoveDown(index) {
      if (props.beforeMoveDown) {
        //如果返回值是 false 则不添加
        if (!props.beforeMoveDown(index)) {
          return;
        }
      }
      list.value = moveDownByIndex(list.value, index, props.loop);
    }

    function groupItemAdd() {
      const v = JSON.parse(JSON.stringify(props.defaultItemValue));
      if (props.beforeAdd) {
        //如果返回值是 false 则不添加
        if (!props.beforeAdd(v)) {
          return;
        }
      }
      list.value.push(v);
    }

    function showMoveUp(i) {
      const minIndex = 0;
      //数据量小的时候没必要显示
      if (list.value.length <= 2 && i === minIndex) {
        return false;
      } else {//数据量大的时候 如果没启用循环 第一项不显示
        return props.loop ? true : i !== minIndex;
      }
    }

    function showMoveDown(i) {
      const maxIndex = list.value.length - 1;
      //数据量小的时候没必要显示
      if (list.value.length <= 2 && i === maxIndex) {
        return false;
      } else { //数据量大的时候 如果没启用循环 最后一项不显示
        return props.loop ? true : i !== maxIndex;
      }
    }

    return {
      list,
      groupItemDelete,
      groupItemAdd,
      fixedElement,
      groupItemMoveUp,
      groupItemMoveDown,
      showMoveUp,
      showMoveDown
    }
  }
}
</script>