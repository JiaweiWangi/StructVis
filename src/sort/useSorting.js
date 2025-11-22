// useSorting.js
import { ref, computed } from 'vue';

export function useSorting() {
  // --- 响应式状态 ---
  const array = ref([]);
  const arrayCount = ref(20);
  const animationDelay = ref(50);
  const isSorting = ref(false);

  // --- DSL 命令行的状态 ---
  const commandOutput = ref('');
  const isCommandError = ref(false);

  // --- 样式与布局常量 ---
  const maxValue = 400;
  const minValue = 20;
  const barGap = 4;

  // --- 排序过程中的颜色高亮状态 ---
  const yellowIndices = ref([]); // 比较中
  const redIndices = ref([]);    // 交换中
  const greenIndices = ref([]);  // 已排序
  const purpleIndices = ref([]); // 特殊标记

  // --- 计算属性 (布局相关) ---
  // 这些计算属性依赖于上面的状态，所以放在这里
  const barWidth = computed(() => {
    if (arrayCount.value === 0) return 0;
    const containerMaxWidth = 1000;
    return Math.max(5, Math.floor((containerMaxWidth - (arrayCount.value - 1) * barGap) / arrayCount.value));
  });

  const containerWidth = computed(() => {
    return arrayCount.value * barWidth.value + (arrayCount.value - 1) * barGap;
  });

  // --- 基础工具方法 ---
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const clearHighlights = () => {
    yellowIndices.value = [];
    redIndices.value = [];
    purpleIndices.value = [];
  };

  const resetState = () => {
    clearHighlights();
    greenIndices.value = [];
  };

  // 获取颜色的逻辑也属于核心业务逻辑
  const getBarColor = (index) => {
    if (redIndices.value.includes(index)) return '#e74c3c';
    if (greenIndices.value.includes(index)) return '#2ecc71';
    if (yellowIndices.value.includes(index)) return '#f1c40f';
    if (purpleIndices.value.includes(index)) return '#9b59b6';
    return '#3498db';
  };

  const generateRandomArray = () => {
    if (isSorting.value) return;
    resetState();
    const newArray = [];
    for (let i = 0; i < arrayCount.value; i++) {
      newArray.push({
        id: i,
        value: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
      });
    }
    array.value = newArray;
  };

  // --- 动画辅助函数 ---
  const highlightCompare = async (i, j) => {
    clearHighlights();
    yellowIndices.value = [i, j];
    await sleep(animationDelay.value);
  }

  const performSwap = async (i, j) => {
    clearHighlights();
    redIndices.value = [i, j];
    await sleep(animationDelay.value);

    let temp = array.value[i];
    array.value[i] = array.value[j];
    array.value[j] = temp;

    await sleep(animationDelay.value);
    redIndices.value = [];
  };


  // --- 排序算法实现 (全部移到这里) ---

  // 通用包装器
  const runSortAlgorithm = async (algorithmFn) => {
    if (isSorting.value || array.value.length === 0) return;
    isSorting.value = true;
    resetState();
    try {
      await algorithmFn();
      clearHighlights();
      greenIndices.value = [...Array(array.value.length).keys()];
    } catch (e) {
      console.error("Sorting error:", e);
    } finally {
      isSorting.value = false;
    }
  }

  // 1. 冒泡排序
  const bubbleSort = async () => {
    let len = array.value.length;
    for (let i = 0; i < len - 1; i++) {
      for (let j = 0; j < len - 1 - i; j++) {
        await highlightCompare(j, j + 1);
        if (array.value[j].value > array.value[j + 1].value) {
          await performSwap(j, j + 1);
        }
      }
      greenIndices.value.push(len - 1 - i);
    }
    greenIndices.value.push(0);
  };

  // 2. 简单选择排序
  const selectionSort = async () => {
    let len = array.value.length;
    for (let i = 0; i < len - 1; i++) {
      let minIndex = i;
      purpleIndices.value = [i];
      for (let j = i + 1; j < len; j++) {
        await highlightCompare(minIndex, j);
        if (array.value[j].value < array.value[minIndex].value) {
          minIndex = j;
        }
      }
      if (minIndex !== i) {
        await performSwap(i, minIndex);
      }
      greenIndices.value.push(i);
      clearHighlights();
    }
  };

  // 3. 直接插入排序
  const insertionSort = async () => {
    let len = array.value.length;
    greenIndices.value.push(0);
    for (let i = 1; i < len; i++) {
      let j = i;
      purpleIndices.value = [i];
      await sleep(animationDelay.value / 2);
      while (j > 0) {
        await highlightCompare(j - 1, j);
        if (array.value[j - 1].value > array.value[j].value) {
          await performSwap(j - 1, j);
          j--;
        } else {
          break;
        }
      }
      for (let k = 0; k <= i; k++) {
        if (!greenIndices.value.includes(k)) greenIndices.value.push(k);
      }
      clearHighlights();
    }
  };

  // 4. 快速排序
  const partition = async (low, high) => {
    let pivotIndex = high;
    let pivotValue = array.value[pivotIndex].value;
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

  const quickSortRecursive = async (low, high) => {
    if (low < high) {
      let pi = await partition(low, high);
      greenIndices.value.push(pi);
      await sleep(animationDelay.value);
      await quickSortRecursive(low, pi - 1);
      await quickSortRecursive(pi + 1, high);
    }
  }

  const quickSort = async () => {
    await quickSortRecursive(0, array.value.length - 1);
  }

  const triggerSort = (type) => {
    const t = type.toLowerCase();
    if (t.includes('bubble') || t === '冒泡') runSortAlgorithm(bubbleSort);
    else if (t.includes('select') || t === '选择') runSortAlgorithm(selectionSort);
    else if (t.includes('insert') || t === '插入') runSortAlgorithm(insertionSort);
    else if (t.includes('quick') || t === '快速') runSortAlgorithm(quickSort);
    else throw new Error('未知的排序算法');
  };

  const addElement = async (value) => {
    if (isSorting.value) return;
    if (isNaN(value)) {
      throw new Error('添加的值必须是数字');
    }
    const newItem = {
      id: arrayCount.value, 
      value: value
    };
    array.value.push(newItem);
    arrayCount.value = array.value.length;
    resetState();
  }

  const executeCommand = (cmdString) => {
    // 1. 重置状态
    isCommandError.value = false;
    commandOutput.value = '';

    const rawCmd = cmdString.trim();
    if (!rawCmd) return;

    try {
      // 2. 解析字符串
      const parts = rawCmd.toLowerCase().split(/\s+/); // 按空格分割
      const action = parts[0];
      const param = parts[1];

      // 3. 执行逻辑
      switch (action) {
        case 'gen':
        case 'generate':
        case 'new':
          let count = parseInt(param);
          if(isNaN(count)){
            count = 10; // 默认值
          }
          if ( count < 5 || count > 100) {
            throw new Error('请输入 5 到 100 之间的数字');
          }
          arrayCount.value = count; // 直接修改内部状态
          generateRandomArray();    // 直接调用内部函数
          commandOutput.value = `已生成 ${count} 个随机数据`;
          break;

        case 'run':
        case 'sort':
          if (!param) throw new Error('请指定算法 (例如: run bubble)');
          triggerSort(param); // 调用上面的辅助函数
          commandOutput.value = `开始执行 ${param} 排序...`;
          break;

        case 'speed':
          const delay = parseInt(param);
          if (isNaN(delay) || delay < 1) throw new Error('请输入有效的速度值(ms)');
          animationDelay.value = delay;
          commandOutput.value = `动画延迟已设置为 ${delay}ms`;
          break;

        case 'add':
          addElement(parseInt(param));
          break;

        case 'help':
          commandOutput.value = '指令: gen [数量], run [算法], add [元素], speed [ms]';
          break;

        default:
          throw new Error(`未知指令: ${action}`);
      }
    } catch (e) {
      // 4. 捕获错误并更新状态
      isCommandError.value = true;
      commandOutput.value = e.message;
    }
  }

  // --- 暴露给外部组件使用的方法和数据 ---
  return {
    // 数据
    array,
    arrayCount,
    animationDelay,
    isSorting,

    // dsl
    commandOutput, 
    isCommandError,

    // 计算属性
    barWidth,
    containerWidth,

    // 方法
    getBarColor,
    generateRandomArray,
    executeCommand,
    triggerSort,
  };
}