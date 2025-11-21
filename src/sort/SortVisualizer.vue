<template>
  <div class="sort-visualizer">
    <SortControls
      v-model:arrayCount="arrayCount"
      v-model:animationDelay="animationDelay"
      :isSorting="isSorting"
      :arrayLength="array.length"
      @generate="generateRandomArray"
      @startSort="handleStartSort"
    />

    <SortBars
      :array="array"
      :arrayCount="arrayCount"
      :barWidth="barWidth"
      :containerWidth="containerWidth"
      :getBarColor="getBarColor"
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
  runBubbleSort,
  runSelectionSort,
  runInsertionSort,
  runQuickSort,
} = useSorting();

// 处理来自控件子组件的排序请求
const handleStartSort = (algorithmType) => {
    switch (algorithmType) {
        case 'bubble': runBubbleSort(); break;
        case 'selection': runSelectionSort(); break;
        case 'insertion': runInsertionSort(); break;
        case 'quick': runQuickSort(); break;
    }
}

// 生命周期
onMounted(() => {
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