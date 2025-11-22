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

    <button @click="$emit('startSort', 'bubble')" :disabled="isSorting || arrayLength === 0">冒泡排序</button>
    <button @click="$emit('startSort', 'selection')" :disabled="isSorting || arrayLength === 0">简单选择排序</button>
    <button @click="$emit('startSort', 'insertion')" :disabled="isSorting || arrayLength === 0">直接插入排序</button>
    <button @click="$emit('startSort', 'quick')" :disabled="isSorting || arrayLength === 0">快速排序</button>

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
  </div>
</template>

<script setup>
// 定义接收的 props
defineProps({
  arrayCount: { type: Number, required: true },
  animationDelay: { type: Number, required: true },
  isSorting: { type: Boolean, required: true },
  arrayLength: { type: Number, required: true }
});

// 定义组件抛出的事件
defineEmits([
    'update:arrayCount',
    'update:animationDelay',
    'generate',
    'startSort'
]);
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
</style>