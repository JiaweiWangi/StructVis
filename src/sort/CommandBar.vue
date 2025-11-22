<template>
  <div class="command-bar">
    <div class="command-input-wrapper">
      <span class="command-prompt">&gt;</span>
      <input 
        type="text" 
        v-model="inputValue" 
        @keyup.enter="onEnter" 
        :disabled="disabled"
        :placeholder="placeholder" 
        class="command-input" 
      />
    </div>
    <div v-if="outputMessage" class="command-output" :class="{ 'error': isError }">
      {{ outputMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// --- 定义组件接收的属性 ---
const props = defineProps({
  // 是否禁用输入（例如正在动画时）
  disabled: {
    type: Boolean,
    default: false
  },
  // 输入框提示文字
  placeholder: {
    type: String,
    default: '输入指令然后按回车...'
  },
  // 父组件处理完后的反馈信息
  outputMessage: {
    type: String,
    default: ''
  },
  // 是否是错误信息（用于显示红色）
  isError: {
    type: Boolean,
    default: false
  }
});

// --- 定义向父组件发送的事件 ---
const emit = defineEmits(['command']);

const inputValue = ref('');

const onEnter = () => {
  const cmd = inputValue.value.trim();
  if (!cmd) return;
  
  // 将指令发送给父组件去执行
  emit('command', cmd);
  
  // 清空输入框
  inputValue.value = '';
};
</script>

<style scoped>
.command-bar {
  width: 100%;
  max-width: 1200px;
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: #333;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  border: 1px solid #eee;
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

.command-input-wrapper:focus-within {
  border-color: #3498db;
}

.command-prompt {
  color: #999;
  margin-right: 12px;
  font-weight: bold;
  font-size: 16px;
}

.command-input {
  flex: 1;
  background: none;
  border: none;
  color: inherit;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  padding: 0;
}

.command-input::placeholder {
  color: #bbb;
}

.command-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

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