<template>
  <div class="sort-visualizer">
    <SortControls
      v-model:arrayCount="arrayCount"
      v-model:animationDelay="animationDelay"
      :isSorting="isSorting"
      :arrayLength="array.length"
      @generate="generateRandomArray"
      @startSort="triggerSort"
    />

    <SortBars
      :array="array"
      :arrayCount="arrayCount"
      :barWidth="barWidth"
      :containerWidth="containerWidth"
      :getBarColor="getBarColor"
    />

    <CommandBar
      :disabled="isSorting"
      :outputMessage="commandOutput"
      :isError="isCommandError"
      placeholder="输入指令，例如: gen 20 或 run bubble"
      @command="executeCommand"
    />
  </div>


  
</template>

<script setup>
import { onMounted } from 'vue';
// 1. 引入逻辑 Composable
import { useSorting } from './useSorting.js'; // 假设放在同一目录
// 2. 引入 UI 子组件
import SortControls from './SortControls.vue';
import SortBars from './SortBars.vue';
import CommandBar from './CommandBar.vue';

// 3. 调用 Composable 获取数据和方法
const {
  array,
  arrayCount,
  animationDelay,
  isSorting,
  barWidth,
  containerWidth,
  getBarColor,
  generateRandomArray,
  commandOutput,   // 绑定给 CommandBar 显示消息
  isCommandError,  // 绑定给 CommandBar 显示红色错误
  executeCommand,  // 绑定给 CommandBar 处理回车事件
  triggerSort      // 绑定给 Controls 按钮点击
} = useSorting();

// 生命周期
onMounted(() => {
  document.title = '排序算法可视化器';
  generateRandomArray();
});
</script>

<style scoped>
/* 主组件只保留最外层的布局样式 */
.sort-visualizer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
}
</style>