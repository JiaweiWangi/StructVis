<template>
  <div class="array-container">
    <transition-group name="list" tag="div" class="array-wrapper" :style="{ width: containerWidth + 'px' }">
      <div
        v-for="(num, index) in array"
        :key="num.id"
        class="array-bar"
        :style="{
          height: num.value + 'px',
          width: barWidth + 'px',
          backgroundColor: getBarColor(index),
          order: index
        }"
      >
        <span class="bar-value" v-if="arrayCount <= 30 && barWidth > 20">{{ num.value }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
// 定义该组件需要从父组件接收的数据
defineProps({
  array: { type: Array, required: true },
  arrayCount: { type: Number, required: true },
  barWidth: { type: Number, required: true },
  containerWidth: { type: Number, required: true },
  // getBarColor 是一个函数，也可以作为 prop 传递
  getBarColor: { type: Function, required: true }
});
</script>

<style scoped>
/* 将原文件中与条形图相关的样式剪切到这里 */
.array-container {
  min-height: 450px;
  background-color: #fdfdfd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 30px;
}

.array-wrapper {
    display: flex;
    align-items: flex-end;
    height: 420px;
    gap: 4px;
    position: relative;
}

.array-bar {
  /* background-color 由内联样式控制 */
  border-radius: 4px 4px 0 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  will-change: transform, background-color, height;
}

.bar-value {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  margin-top: 4px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
  pointer-events: none;
}

.list-move {
  transition: transform 0.3s ease;
}
</style>