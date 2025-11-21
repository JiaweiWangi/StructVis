<template>
  <div class="sort-visualizer">
    <div class="controls">
      <div class="control-group">
        <label for="size-slider">数组大小</label>
        <input
          id="size-slider"
          type="range"
          min="5"
          max="100"
          v-model.number="arrayCount"
          :disabled="isSorting"
          @input="generateRandomArray"
        />
        <span>{{ arrayCount }}</span>
      </div>

      <button @click="generateRandomArray" :disabled="isSorting">
        生成随机数组
      </button>
      
      <button @click="runBubbleSort" :disabled="isSorting || array.length === 0">冒泡排序</button>
      <button @click="runSelectionSort" :disabled="isSorting || array.length === 0">简单选择排序</button>
      <button @click="runInsertionSort" :disabled="isSorting || array.length === 0">直接插入排序</button>
      <button @click="runQuickSort" :disabled="isSorting || array.length === 0">快速排序</button>

      <div class="control-group">
        <label for="speed-slider">动画延迟(ms)</label>
        <input
          id="speed-slider"
          type="range"
          min="5"
          max="500"
          step="5"
          v-model.number="animationDelay"
        />
        <span>{{ animationDelay }}ms</span>
      </div>
    </div>

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
            // 使用 flex 布局和 order，而不是绝对定位和 transform，这样配合 transition-group 效果更好
            order: index 
          }"
        >
        <span class="bar-value" v-if="arrayCount <= 30 && barWidth > 20">{{ num.value }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';

// --- 响应式状态 ---
// 数组元素改为对象 {id, value}，以便 transition-group 正确追踪身份
const array = ref([]); 
const arrayCount = ref(20);
const animationDelay = ref(50); // 默认延迟调小一点
const isSorting = ref(false);

// --- 样式与布局相关 ---
const maxValue = 400;
const minValue = 20;
const barGap = 4; // 稍微增加间隔

// --- 排序过程中的颜色高亮状态 ---
const yellowIndices = ref([]); // 比较中
const redIndices = ref([]);    // 交换中
const greenIndices = ref([]);  // 已排序
const purpleIndices = ref([]); // 特殊标记（如基准值、当前最小值）

// --- 计算属性 ---
const barWidth = computed(() => {
  if (arrayCount.value === 0) return 0;
  const containerMaxWidth = 1000;
  // 保证最小宽度，避免太细
  return Math.max(5, Math.floor((containerMaxWidth - (arrayCount.value - 1) * barGap) / arrayCount.value));
});

const containerWidth = computed(() => {
  return arrayCount.value * barWidth.value + (arrayCount.value - 1) * barGap;
});

// --- 基础工具方法 ---

// 暂停函数 (核心)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 重置所有高亮颜色
const clearHighlights = () => {
  yellowIndices.value = [];
  redIndices.value = [];
  purpleIndices.value = [];
  // 注意：不清除绿色，因为绿色表示已完成的状态
};

// 完全重置状态（包括绿色）
const resetState = () => {
  clearHighlights();
  greenIndices.value = [];
};

// 根据索引获取颜色
const getBarColor = (index) => {
  if (redIndices.value.includes(index)) return '#e74c3c'; // 红色优先 (交换)
  if (greenIndices.value.includes(index)) return '#2ecc71'; // 绿色 (已排序)
  if (yellowIndices.value.includes(index)) return '#f1c40f'; // 黄色 (比较)
  if (purpleIndices.value.includes(index)) return '#9b59b6'; // 紫色 (特殊)
  return '#3498db'; // 默认蓝色
};

// 生成随机数组 (前端实现)
const generateRandomArray = () => {
  if (isSorting.value) return;
  resetState();
  const newArray = [];
  for (let i = 0; i < arrayCount.value; i++) {
    newArray.push({
      id: i, // 使用唯一的 ID
      value: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
    });
  }
  array.value = newArray;
};


// --- 动画辅助函数 (核心) ---

// 高亮显示正在比较的元素
const highlightCompare = async (i, j) => {
    // 清除之前的非持久高亮
    clearHighlights(); 
    yellowIndices.value = [i, j];
    await sleep(animationDelay.value);
}

// 执行交换并伴随动画
const performSwap = async (i, j) => {
    // 高亮显示要交换的元素为红色
    clearHighlights();
    redIndices.value = [i, j];
    await sleep(animationDelay.value);

    // --- 真正的数据交换 ---
    // Vue 3 中直接交换数组元素是响应式的
    let temp = array.value[i];
    array.value[i] = array.value[j];
    array.value[j] = temp;

    // 交换后保持红色一小段时间，让用户看清
    await sleep(animationDelay.value);
    // 交换完成，清除红色
    redIndices.value = [];
};


// --- 排序算法实现 (异步版本) ---

// 通用排序包装器，处理开始/结束状态
const runSortAlgorithm = async (algorithmFn) => {
  if (isSorting.value || array.value.length === 0) return;
  isSorting.value = true;
  resetState();
  try {
    await algorithmFn();
    // 排序完成后，确保所有元素都变绿
    clearHighlights();
    greenIndices.value = [...Array(array.value.length).keys()];
  } catch (e) {
    console.error("Sorting interrupted or errored:", e);
  } finally {
    isSorting.value = false;
  }
}

// 1. 冒泡排序
const bubbleSort = async () => {
  let len = array.value.length;
  for (let i = 0; i < len - 1; i++) {
    for (let j = 0; j < len - 1 - i; j++) {
      // 动画：比较
      await highlightCompare(j, j+1);
      
      if (array.value[j].value > array.value[j + 1].value) {
        // 动画：交换
        await performSwap(j, j + 1);
      }
    }
    // 每一轮末尾的元素已排序，标记为绿色
    greenIndices.value.push(len - 1 - i);
  }
  // 循环结束，第一个元素肯定也排好了
  greenIndices.value.push(0);
};


// 2. 简单选择排序
const selectionSort = async () => {
    let len = array.value.length;
    for (let i = 0; i < len - 1; i++) {
        let minIndex = i;
        // 用紫色标记当前轮次的起始位置
        purpleIndices.value = [i]; 

        for (let j = i + 1; j < len; j++) {
            // 动画：比较当前最小值和 J
            await highlightCompare(minIndex, j);
            if (array.value[j].value < array.value[minIndex].value) {
                minIndex = j;
                // 可选：可以把新的 minIndex 标为另一种颜色，这里暂不复杂化
            }
        }

        if (minIndex !== i) {
            // 动画：交换找到的最小值到当前位置
            await performSwap(i, minIndex);
        }
        // i 位置已确定
        greenIndices.value.push(i);
        clearHighlights();
    }
};


// 3. 直接插入排序 (使用交换方式实现，视觉效果更好)
const insertionSort = async () => {
    let len = array.value.length;
    // 默认第一个元素是已排序区
    greenIndices.value.push(0);

    for (let i = 1; i < len; i++) {
        let j = i;
        // 用紫色标记当前待插入的元素
        purpleIndices.value = [i]; 
        await sleep(animationDelay.value / 2);
        
        // 向前冒泡找到正确位置
        while (j > 0) {
            await highlightCompare(j - 1, j);
            if (array.value[j - 1].value > array.value[j].value) {
                await performSwap(j - 1, j);
                j--;
            } else {
                break;
            }
        }
        // 这一轮结束后，0 到 i 都是有序的了
        for(let k=0; k<=i; k++) {
             if(!greenIndices.value.includes(k)) greenIndices.value.push(k);
        }
        clearHighlights();
    }
};


// 4. 快速排序
// 分区函数
const partition = async (low, high) => {
    let pivotIndex = high;
    let pivotValue = array.value[pivotIndex].value;
    // 用紫色标记基准值
    purpleIndices.value = [pivotIndex]; 
    await sleep(animationDelay.value);

    let i = (low - 1);
    for (let j = low; j <= high - 1; j++) {
        await highlightCompare(j, pivotIndex);
        if (array.value[j].value < pivotValue) {
            i++;
            await performSwap(i, j);
        }
    }
    await performSwap(i + 1, high);
    return (i + 1);
}

// 递归主函数
const quickSortRecursive = async (low, high) => {
    if (low < high) {
        let pi = await partition(low, high);
        // 基准值位置已确定，标绿
        greenIndices.value.push(pi); 
        await sleep(animationDelay.value);

        await quickSortRecursive(low, pi - 1);
        await quickSortRecursive(pi + 1, high);
    } 
}

const quickSort = async () => {
    await quickSortRecursive(0, array.value.length - 1);
}


// --- 按钮点击事件绑定 ---
const runBubbleSort = () => runSortAlgorithm(bubbleSort);
const runSelectionSort = () => runSortAlgorithm(selectionSort);
const runInsertionSort = () => runSortAlgorithm(insertionSort);
const runQuickSort = () => runSortAlgorithm(quickSort);


// --- 生命周期钩子 ---
onMounted(() => {
  generateRandomArray();
});
</script>

<style scoped>
.sort-visualizer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.controls {
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  justify-content: center;
  padding: 15px 25px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.control-group label {
  font-weight: 600;
}

input[type=range] {
    cursor: pointer;
}

.controls button {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  min-width: 100px;
  box-shadow: 0 2px 5px rgba(52, 152, 219, 0.3);
}

.controls button:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.4);
}

.controls button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  box-shadow: none;
}

/* 容器样式调整 */
.array-container {
  min-height: 450px;
  /* 移除底部边框，改用背景色块衬托 */
  /* border-bottom: 2px solid #333; */
  background-color: #fdfdfd; 
  border-radius: 8px;
  padding: 20px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
  display: flex;
  justify-content: center; /* 居中显示 */
}

/* 改为使用 flex 布局容器配合 transition-group
  不再使用绝对定位
*/
.array-wrapper {
    display: flex;
    align-items: flex-end;
    height: 420px;
    gap: 4px; /* 使用 CSS gap 替代 JS 计算的 margin */
    position: relative;
}


.array-bar {
  /* 默认颜色在 JS 中设置 */
  background-color: #3498db; 
  border-radius: 4px 4px 0 0; /* 顶部圆角 */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  /* 增加阴影增加立体感 */
  box-shadow: 0 -2px 5px rgba(0,0,0,0.1); 
  /* 重要：确保 transform 变化有过渡效果 */
  transition: all 0.3s ease;
  /* 使用 will-change 提示浏览器优化性能，
    因为在 transition-group 中，元素位置改变会触发 transform
  */
  will-change: transform, background-color, height;
}

.bar-value {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  margin-top: 4px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
  pointer-events: none; /* 防止文字干扰鼠标事件 */
}

/* --- Vue Transition Group 动画样式 --- */
/* 当元素位置改变时应用的过渡 */
.list-move {
  transition: transform 0.3s ease;
}

/* 确保在移动过程中被交换的元素位于顶层 */
.array-bar.red-highlight {
    z-index: 10;
}
</style>