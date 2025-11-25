<template>
  <div class="command-bar">
    <div class="command-input-wrapper">
      <span class="command-prompt">&gt;</span>
      <input type="text" v-model="internalInput" @keyup.enter="handleEnter" :disabled="isVisualizing"
        placeholder="输入指令，例如: add node G 或 add edge A B 5" class="command-input" />
    </div>
    <div v-if="output" class="command-output" :class="{ 'error': isError }">
      {{ output }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isVisualizing: Boolean,
  output: String,
  isError: Boolean
});

const emit = defineEmits(['execute']);
const internalInput = ref('');

const handleEnter = () => {
  emit('execute', internalInput.value);
  // 命令执行后是否清空，可以根据需求决定，这里不清空方便重复修改
  // internalInput.value = ''; 
};
</script>

<style scoped>
.command-bar {
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: #333;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  border: 1px solid #eee;
  box-sizing: border-box; /* 确保 padding 不会撑破容器 */
}

.command-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  transition: border-color 0.3s ease;
}

.command-input-wrapper:focus-within { border-color: #3498db; }
.command-prompt { color: #999; margin-right: 12px; font-weight: bold; font-size: 16px; }
.command-input { flex: 1; background: none; border: none; color: inherit; font-family: inherit; font-size: 14px; outline: none; padding: 0; }
.command-input::placeholder { color: #bbb; }
.command-input:disabled { cursor: not-allowed; opacity: 0.6; }

.command-output {
  margin-top: 12px;
  padding: 10px 15px;
  font-size: 13px;
  background-color: #f0f7fd;
  color: #333;
  border-left: 4px solid #3498db;
  border-radius: 4px;
}

.command-output.error {
  background-color: #fff5f5;
  color: #c0392b;
  border-left-color: #e74c3c;
}
</style>