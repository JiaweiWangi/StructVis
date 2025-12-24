<template>
  <div class="sort-visualizer">
    <button class="back-btn" @click="goBack">
      &lt; 返回上一页
    </button>

    <SortControls
      v-model:arrayCount="arrayCount"
      v-model:animationDelay="animationDelay"
      :isSorting="isSorting"
      :arrayLength="array.length"
      @generate="generateRandomArray"
      @startSort="triggerSort"
      @save-sorting="handleSaveSorting"
      @load-sorting="handleLoadSorting"
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
      placeholder="输入指令，例如: gen 20 或 run bubble，按下回车执行"
      @command="executeCommand"
    />
  </div>

  <AIChatWindow
    :context="'排序算法'"
    :on-command="executeCommand"
  />
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 引入逻辑 Composable
import { useSorting } from './useSorting.js';
// 引入 UI 子组件
import SortControls from './SortControls.vue';
import SortBars from './SortBars.vue';
import CommandBar from '../components/CommandBar.vue';
import AIChatWindow from '../chat/AIChatWindow.vue';

// 初始化 Router
const router = useRouter();

// 定义返回函数
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};

// 调用 Composable 获取数据和方法
const {
  array,
  arrayCount,
  animationDelay,
  isSorting,
  barWidth,
  containerWidth,
  getBarColor,
  generateRandomArray,
  commandOutput,
  isCommandError,
  executeCommand,
  triggerSort,
  saveSortingData,
  loadSortingData
} = useSorting();

// 生命周期
onMounted(() => {
  document.title = '排序算法可视化器';
  generateRandomArray();
});

// 处理保存
const handleSaveSorting = () => {
  saveSortingData();
};

// 处理加载
const handleLoadSorting = async (file) => {
  try {
    await loadSortingData(file);
  } catch (err) {
    console.error('加载文件失败:', err);
  }
};
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

/* --- 返回按钮：悬浮固定在左上角 --- */
.back-btn {
  position: fixed; 
  top: 20px;       
  left: 20px;    
  z-index: 1000; 

  padding: 8px 16px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.back-btn:hover {
  background-color: #f5f5f5;
  color: #333;
  border-color: #ccc;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>