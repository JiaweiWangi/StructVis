<template>
  <div class="chat-widget-container">

    <transition name="slide-fade">
      <div v-if="isOpen" class="chat-card">
        <div class="card-header">
          <div class="header-info">
            <span class="status-dot"></span>
            <h3>{{ context }}助手</h3>
          </div>
          <button class="close-btn" @click="toggleChat">×</button>
        </div>

        <div class="card-body" ref="messagesContainer">
          <div class="notice">👋 有什么关于{{ context }}的问题都可以问我！</div>

          <div v-for="(msg, index) in messages" :key="index" class="message-row" :class="msg.role">
            <div v-if="msg.role === 'ai'" class="avatar ai">AI</div>
            <div class="bubble">{{ msg.content }}</div>
          </div>

          <div v-if="isLoading" class="message-row ai">
            <div class="avatar ai">AI</div>
            <div class="bubble loading">...</div>
          </div>
        </div>

        <div class="card-footer">
          <input type="text" v-model="inputContent" placeholder="输入你的问题..." @keydown.enter="sendMessage" />
          <button class="send-icon" @click="sendMessage" :disabled="!inputContent.trim()">
            ➤
          </button>
        </div>
      </div>
    </transition>

    <div class="chat-fab" @click="toggleChat" :class="{ 'active': isOpen }">
      <span v-if="!isOpen" class="fab-icon">💬</span>
      <span v-else class="fab-icon">▼</span>
    </div>

  </div>
</template>

<script setup>
// 【修正】这里必须引入 watch
import { ref, nextTick, watch } from 'vue';

const props = defineProps({
  context: {
    type: String,
    default: '通用'
  }
});

const isOpen = ref(false);
const inputContent = ref('');
const isLoading = ref(false);
const messagesContainer = ref(null);
const messages = ref([]);

// 监听 context 变化，如果页面切换，自动重置欢迎语
// immediate: true 确保组件第一次加载时也会执行
watch(() => props.context, (newVal) => {
  messages.value = [
    { role: 'ai', content: `你好！我是你的${newVal}小助手，请问有什么可以帮你？` }
  ];
}, { immediate: true });

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const sendMessage = () => {
  const text = inputContent.value.trim();
  if (!text) return;

  // 用户消息
  messages.value.push({ role: 'user', content: text });
  inputContent.value = '';
  scrollToBottom();

  // 模拟 AI 回复
  isLoading.value = true;

  // 模拟网络请求
  setTimeout(() => {
    // 这里也可以用 props.context 来模拟不同的回复口吻
    messages.value.push({
      role: 'ai',
      content: `[${props.context}模式] 针对"${text}"的回答：这是一个非常好的问题...`
    });
    isLoading.value = false;
    scrollToBottom();
  }, 800);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};
</script>

<style scoped>
/* 你的 CSS 写得没问题，直接保留即可 */
.chat-widget-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: 'Segoe UI', sans-serif;
}

.chat-fab {
  width: 56px;
  height: 56px;
  background-color: #3498db;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  margin-top: 15px;
}

.chat-fab:hover {
  background-color: #2980b9;
  transform: scale(1.05);
}

.chat-fab.active {
  background-color: #e74c3c;
  transform: rotate(180deg);
}

.fab-icon {
  font-size: 24px;
  color: white;
  user-select: none;
}

.chat-card {
  width: 320px;
  height: 450px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #eee;
  transform-origin: bottom right;
}

.card-header {
  background: linear-gradient(135deg, #3498db, #2980b9);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #2ecc71;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  opacity: 0.8;
}

.close-btn:hover {
  opacity: 1;
}

.card-body {
  flex: 1;
  background-color: #f8f9fa;
  padding: 12px;
  overflow-y: auto;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-bottom: 5px;
}

.message-row {
  display: flex;
  gap: 8px;
  max-width: 85%;
}

.message-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ddd;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  flex-shrink: 0;
}

.avatar.ai {
  background-color: #3498db;
  color: white;
}

.bubble {
  padding: 8px 12px;
  border-radius: 12px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-row.ai .bubble {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-top-left-radius: 2px;
  color: #333;
}

.message-row.user .bubble {
  background-color: #3498db;
  color: white;
  border-top-right-radius: 2px;
}

.bubble.loading {
  color: #aaa;
  letter-spacing: 2px;
}

.card-footer {
  padding: 10px;
  background-color: white;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}

.card-footer input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.card-footer input:focus {
  border-color: #3498db;
}

.send-icon {
  background: none;
  border: none;
  color: #3498db;
  font-size: 18px;
  cursor: pointer;
  padding: 0 5px;
  transition: transform 0.1s;
}

.send-icon:hover {
  transform: scale(1.1);
}

.send-icon:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}
</style>