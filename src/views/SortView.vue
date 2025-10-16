<template>
  <div class="sort-visualizer">
    <div class="controls">
      <div class="control-group">
        <label for="size-slider">数组大小</label>
        <input
          id="size-slider"
          type="range"
          min="5"
          max="50"
          v-model.number="arrayCount"
          :disabled="isSorting"
        />
        <span>{{ arrayCount }}</span>
      </div>

      <!-- <button @click="generateRandomArray" :disabled="isSorting">生成随机数组</button> -->
      <button @click="fetchArrayFromBackend" :disabled="isSorting || isLoading">
        <span v-if="isLoading">加载中...</span>
        <span v-else>获取随机数组</span>
      </button>
      <button @click="startBubbleSort" :disabled="isSorting || array.length === 0">开始冒泡排序</button>
      <button @click="startSimpleSelectSort" :disabled="isSorting || array.length === 0">开始简单选择排序</button>
      

      <div class="control-group">
        <label for="speed-slider">动画速度</label>
        <input
          id="speed-slider"
          type="range"
          min="10"
          max="500"
          step="10"
          v-model.number="animationSpeed"
        />
        <span>{{ animationSpeed }}ms</span>
      </div>
    </div>

    <div v-if="fetchError" class="error-message">
      {{ fetchError }}
    </div>

    <div class="array-container">
      <div
        v-for="(num, index) in array"
        :key="index"
        class="array-bar"
        :style="{
          height: num + 'px',
          width: barWidth + 'px',
          backgroundColor: getBarColor(index),
          transform: `translateX(${index * (barWidth + barGap)}px)`
        }"
      >
        <span class="bar-value" v-if="array.length <= 30 && barWidth > 15">{{ num }}</span>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// --- 响应式状态 ---
const array = ref([]);
const arrayCount = ref(10); // 改为 ref，使其可动态修改
const animationSpeed = ref(250);
const isSorting = ref(false);
const isLoading = ref(false); // 新增：加载状态
const fetchError = ref(null); // 新增：错误信息
const steps = ref([]);

// --- 样式与布局相关 ---
const maxValue = 400; // 条形图最大高度
const barGap = 2; // 条形图之间的间隔

// --- 排序过程中的状态 ---
const yellowIndices = ref([]);
const redIndices = ref([]);
const blueIndices = ref([]);

// --- 计算属性 (Computed Properties) ---

// 条形图宽度改为动态计算，以适应不同数量的数组
const barWidth = computed(() => {
  if (arrayCount.value === 0) return 0;
  // 假设容器最大宽度为 1200px
  const containerMaxWidth = 1200;
  return Math.max(2, Math.floor(containerMaxWidth / arrayCount.value) - barGap);
});

// 容器宽度也变为动态
const containerWidth = computed(() => {
  return arrayCount.value * (barWidth.value + barGap);
});

// --- 方法 (Methods) ---

// 重置排序状态，提取为公共函数
const resetState = () => {
  isSorting.value = false;
  fetchError.value = null;
  yellowIndices.value = [];
  redIndices.value = [];
  blueIndices.value = [];
};

// 根据索引获取条形图的颜色
const getBarColor = (index) => {
  if (redIndices.value.includes(index)) return '#e74c3c'; // 红色 - 交换
  if (yellowIndices.value.includes(index)) return '#f1c40f'; // 黄色 - 比较
  if (blueIndices.value.includes(index)) return '#2ecc71'; // 绿色 - 已排序
  return '#3498db'; // 蓝色 - 默认
};

// 生成随机数组
const generateRandomArray = () => {
  if (isSorting.value) return;
  resetState();
  const newArray = [];
  for (let i = 0; i < arrayCount.value; i++) {
    newArray.push(Math.floor(Math.random() * (maxValue - 20) + 20));
  }
  array.value = newArray;
};

// 从后端获取数组
const fetchArrayFromBackend = async () => {
  if (isSorting.value) return;
  isLoading.value = true;
  resetState();
  try {
    // 使用 arrayCount.value 动态请求数组大小
    const response = await axios.get(`/api/sort/getRandom?size=${arrayCount.value}`);
    array.value = response.data.data;
  } catch (error) {
    console.error('从后端获取数组失败:', error);
    fetchError.value = '无法从后端获取数据。请确保后端服务正在运行。';
    array.value = []; // 获取失败时清空数组
  } finally {
    isLoading.value = false;
  }
};

// 暂停函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 处理后端返回的排序步骤（冒泡排序）
const processBubbleSteps = async () => {
  const n = steps.value.length;
  for (let i = 0; i < n; i++) {
    const step = steps.value[i];
    if (!step || step.length === 0) continue;

    switch (step[0]) {
      case 1:
        yellowIndices.value = step.slice(1);
        await sleep(animationSpeed.value);
        yellowIndices.value = [];
        break;
      case 2:
        redIndices.value = step.slice(1);
        await sleep(animationSpeed.value);
        [array.value[step[1]], array.value[step[2]]] = [array.value[step[2]], array.value[step[1]]];
        await sleep(animationSpeed.value);
        redIndices.value = [];
        break;
      case 3:
        redIndices.value = step.slice(1);
        await sleep(animationSpeed.value);
        break;
      case 4:
        blueIndices.value.push(step[1]);
        break;
      default:
        break;
    }
  }
  await sleep(1000);
  resetState();
};

// 冒泡排序逻辑
const startBubbleSort = async () => {
  if (isSorting.value || array.value.length === 0) return;

  isSorting.value = true;
  fetchError.value = null; // 开始排序时清除错误信息
  try {
    // 使用 arrayCount.value 动态请求数组大小
    const response = await axios.get(`/api/sort/BubbleSort`);
    steps.value = response.data.steps;
  } catch (error) {
    console.error('从后端获取数组失败:', error);
    fetchError.value = '无法从后端获取数据。请确保后端服务正在运行。';
  } finally {
    isLoading.value = false;
  }

  await processBubbleSteps();
};

// 简单选择排序逻辑
const startSimpleSelectSort = async () => {
  if (isSorting.value || array.value.length === 0) return;

  isSorting.value = true;
  fetchError.value = null; // 开始排序时清除错误信息
  try {
    // 使用 arrayCount.value 动态请求数组大小
    const response = await axios.get(`/api/sort/SimpleSelectSort`);
    steps.value = response.data.steps;
  } catch (error) {
    console.error('从后端获取数组失败:', error);
    fetchError.value = '无法从后端获取数据。请确保后端服务正在运行。';
  } finally {
    isLoading.value = false;
  }
  const n = steps.value.length;

  let j = 0;
  for(let i = 0; i < n; i++){
    yellowIndices.value = [steps.value[i][0]];
    redIndices.value = [steps.value[i][1]];
    await sleep(animationSpeed.value);
    if(steps.value[i][2] !== -1){
      redIndices.value = [steps.value[i][1], steps.value[i][2]];
      await sleep(animationSpeed.value);
      [array.value[steps.value[i][0]], array.value[steps.value[i][1]]] = [array.value[steps.value[i][1]], array.value[steps.value[i][0]]];
      await sleep(animationSpeed.value);
      blueIndices.value.push(steps.value[i][2]);
    }
  }
  yellowIndices.value = [];
  redIndices.value = [];
  blueIndices.value.push(0);

  await sleep(1500);

  resetState();
};

// --- 生命周期钩子 (Lifecycle Hooks) ---
onMounted(() => {
  fetchArrayFromBackend(); // 初始时生成一个随机数组，而不是从后端获取
});
</script>

<style scoped>
.sort-visualizer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: sans-serif;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 20px;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background-color: #f4f4f4;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-group label {
  font-weight: bold;
}

.controls button {
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  min-width: 120px; /* 按钮最小宽度 */
}

.controls button:hover:not(:disabled) {
  background-color: #2980b9;
}

.controls button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  background-color: #fdd;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.array-container {
  display: flex;
  align-items: flex-end;
  margin-top: 20px;
  min-height: 420px; /* 保证容器有最小高度 */
  border-bottom: 2px solid #333;
  position: relative;
  width: v-bind(containerWidth + 'px'); /* 动态宽度 */
  transition: width 0.3s ease; /* 容器宽度变化动画 */
}

.array-bar {
  background-color: #3498db;
  position: absolute;
  bottom: 0;
  transition: height 0.3s ease, background-color 0.3s ease, transform 0.3s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
}

.bar-value {
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  position: relative;
  top: -15px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}
</style>