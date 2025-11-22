<template>
  <div class="home-container">
    <header class="hero-section">
      <h1 class="main-title">Algorithm Visualizer</h1>
      <p class="subtitle">数据结构与算法可视化演示平台</p>
    </header>

    <div class="cards-wrapper">
      
      <div class="nav-card sort-card" @click="navigateTo('/sort')">
        <div class="icon-box">
          <svg viewBox="0 0 64 64" width="64" height="64">
            <rect x="8" y="30" width="8" height="26" fill="#3498db" rx="2"/>
            <rect x="20" y="15" width="8" height="41" fill="#9b59b6" rx="2"/>
            <rect x="32" y="40" width="8" height="16" fill="#e74c3c" rx="2"/>
            <rect x="44" y="8" width="8" height="48" fill="#2ecc71" rx="2"/>
          </svg>
        </div>
        <div class="card-content">
          <h3>排序算法</h3>
          <p class="description">冒泡、选择、插入、快速排序</p>
          <span class="link-text">开始演示 &rarr;</span>
        </div>
      </div>

      <div class="nav-card graph-card" @click="navigateTo('/graph')">
        <div class="icon-box">
          <svg viewBox="0 0 64 64" width="64" height="64">
            <line x1="16" y1="16" x2="48" y2="16" stroke="#bdc3c7" stroke-width="3"/>
            <line x1="16" y1="16" x2="32" y2="48" stroke="#bdc3c7" stroke-width="3"/>
            <line x1="48" y1="16" x2="32" y2="48" stroke="#bdc3c7" stroke-width="3"/>
            <circle cx="16" cy="16" r="8" fill="#3498db"/>
            <circle cx="48" cy="16" r="8" fill="#9b59b6"/>
            <circle cx="32" cy="48" r="8" fill="#e67e22"/>
          </svg>
        </div>
        <div class="card-content">
          <h3>图论算法</h3>
          <p class="description">广度优先 (BFS)、深度优先 (DFS)</p>
          <span class="link-text">开始演示 &rarr;</span>
        </div>
      </div>

    </div>

    <footer class="footer">
      <p>Built with Vue 3 & Composition API</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();

onMounted(() => {
  document.title = "数据结构与算法可视化演示平台";
});
const navigateTo = (path) => {
  router.push(path);
};
</script>

<style scoped>
/* 全屏容器：保持背景色一致 */
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fcfcfc;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  padding: 20px;
}

/* 标题区 */
.hero-section {
  text-align: center;
  margin-bottom: 60px;
  animation: fadeInDown 0.8s ease;
}

.main-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #3498db, #8e44ad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  font-weight: 300;
}

/* 卡片容器 */
.cards-wrapper {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 60px;
}

/* 单个卡片样式 */
.nav-card {
  background: #fff;
  width: 280px;
  border-radius: 16px;
  padding: 30px 20px;
  cursor: pointer;
  text-align: center;
  /* 统一的边框和阴影风格 */
  border: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

/* 悬停效果 */
.nav-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #e0e0e0;
}

/* 图标区域 */
.icon-box {
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.nav-card:hover .icon-box {
  transform: scale(1.1);
}

/* 文字内容 */
.nav-card h3 {
  font-size: 1.5rem;
  margin: 0 0 10px;
  color: #34495e;
}

.description {
  color: #95a5a6;
  font-size: 0.95rem;
  margin-bottom: 25px;
  line-height: 1.5;
}

.link-text {
  color: #3498db;
  font-weight: 600;
  font-size: 0.9rem;
  transition: padding-left 0.2s ease;
}

.nav-card:hover .link-text {
  padding-left: 5px;
}

/* 底部 */
.footer {
  margin-top: auto;
  color: #bdc3c7;
  font-size: 0.85rem;
}

/* 简单的入场动画 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .main-title { font-size: 2rem; }
  .cards-wrapper { gap: 20px; }
  .nav-card { width: 100%; max-width: 320px; }
}
</style>