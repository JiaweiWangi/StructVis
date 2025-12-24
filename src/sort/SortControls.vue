<template>
  <div class="controls">
    <div class="control-group">
      <label for="size-slider">数组大小</label>
      <input
        id="size-slider"
        type="range"
        min="5"
        max="100"
        :value="arrayCount"
        @input="$emit('update:arrayCount', Number($event.target.value))"
        :disabled="isSorting"
      />
      <span>{{ arrayCount }}</span>
    </div>

    <button @click="$emit('generate')" :disabled="isSorting">
      生成随机数组
    </button>

    <button @click="$emit('startSort', 'bubble')" :disabled="isSorting || arrayLength === 0">Bubble Sort</button>
    <button @click="$emit('startSort', 'selection')" :disabled="isSorting || arrayLength === 0">Selection Sort</button>
    <button @click="$emit('startSort', 'insertion')" :disabled="isSorting || arrayLength === 0">Insertion Sort</button>
    <button @click="$emit('startSort', 'quick')" :disabled="isSorting || arrayLength === 0">Quick Sort</button>

    <div class="control-group">
      <label for="speed-slider">动画延迟(ms)</label>
      <input
        id="speed-slider"
        type="range"
        min="5"
        max="500"
        step="5"
        :value="animationDelay"
        @input="$emit('update:animationDelay', Number($event.target.value))"
      />
      <span>{{ animationDelay }}ms</span>
    </div>

    <button @click="$emit('save-sorting')" :disabled="isSorting || arrayLength === 0" class="save-btn" title="保存当前排序数据">
      💾 保存
    </button>
    <button @click="triggerLoadFile" :disabled="isSorting" class="load-btn" title="加载排序数据">
      📂 打开
    </button>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none;"
      @change="onFileSelected"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 定义接收的 props
defineProps({
  arrayCount: { type: Number, required: true },
  animationDelay: { type: Number, required: true },
  isSorting: { type: Boolean, required: true },
  arrayLength: { type: Number, required: true }
});

// 定义组件抛出的事件
const emit = defineEmits([
    'update:arrayCount',
    'update:animationDelay',
    'generate',
    'startSort',
    'save-sorting',
    'load-sorting'
]);

const fileInput = ref(null);

// 触发文件选择
const triggerLoadFile = () => {
  fileInput.value?.click();
};

// 处理文件选择
const onFileSelected = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    emit('load-sorting', file);
    // 重置文件输入
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};
</script>

<style scoped>
/* 将原文件中与控制栏相关的样式剪切到这里 */
.controls {
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

.save-btn { background-color: #3498db; }
.save-btn:hover:not(:disabled) { background-color: #2980b9; }
.load-btn { background-color: #16a085; }
.load-btn:hover:not(:disabled) { background-color: #1abc9c; }
</style>