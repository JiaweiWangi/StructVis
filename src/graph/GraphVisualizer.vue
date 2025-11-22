<template>
  <div class="graph-visualizer">
    <div class="main-content">
      <div class="left-panel">

        <!-- 生成随机图与恢复默认图 -->
        <div class="controls header-controls">
          <button @click="generateRandomGraph" :disabled="isVisualizing" class="primary-btn" title="在固定网格位置上生成随机图">
            生成随机图
          </button>
          <button @click="restoreDefaultGraph" :disabled="isVisualizing">
            恢复默认图
          </button>
        </div>

        <!-- 主控件区 -->
        <div class="controls main-controls">
          <div class="control-row">
            <div class="control-group">
              <input id="new-node-id" v-model="newNodeId" placeholder="新ID(如G)" :disabled="isVisualizing"
                style="width: 60px;" />
              <button @click="handleAddNode" :disabled="isVisualizing || !newNodeId.trim()"
                class="small-btn">添加节点</button>
            </div>

            <div class="control-group add-edge-group">
              <select v-model="sourceNodeInput" :disabled="isVisualizing || nodes.length === 0">
                <option value="">起点</option>
                <option v-for="node in nodes" :key="'src-' + node.id" :value="node.id">{{ node.id }}</option>
              </select>
              <span>→</span>
              <select v-model="targetNodeInput" :disabled="isVisualizing || nodes.length === 0">
                <option value="">终点</option>
                <option v-for="node in nodes" :key="'tgt-' + node.id" :value="node.id">{{ node.id }}</option>
              </select>

              <input id="edge-weight" type="number" v-model.number="edgeWeightInput" min="1" placeholder="权重"
                :disabled="isVisualizing" style="width: 40px;" />

              <button @click="handleAddEdge"
                :disabled="isVisualizing || !sourceNodeInput || !targetNodeInput || sourceNodeInput === targetNodeInput"
                class="small-btn">
                添加边
              </button>
            </div>
          </div>

          <div class="control-row">
            <div class="control-group">
              <label for="start-node">起始点:</label>
              <select v-model="startNode" :disabled="isVisualizing" style="width: 60px;">
                <option v-for="node in nodes" :key="node.id" :value="node.id">
                  {{ node.id }}
                </option>
              </select>
            </div>

            <button @click="runBFS" :disabled="isVisualizing || !startNode" class="algo-btn">
              广度优先 (BFS)
            </button>
            <button @click="runDFS" :disabled="isVisualizing || !startNode" class="algo-btn">
              深度优先 (DFS)
            </button>
          </div>

          <div class="control-row">
            <div class="control-group">
              <label for="speed-slider">速度:</label>
              <input id="speed-slider" type="range" min="100" max="1500" step="100" v-model.number="animationDelay"
                title="调整动画速度" />
              <span style="font-size: 12px; width: 35px;">{{ animationDelay }}ms</span>
            </div>
          </div>
        </div>

        <!-- 数据可视化展示区 -->
        <div class="visualization-container">
          <svg :width="svgWidth" :height="svgHeight">
            <g class="edges">
              <line v-for="edge in edges" :key="edge.id" :x1="getNodeById(edge.source)?.x"
                :y1="getNodeById(edge.source)?.y" :x2="getNodeById(edge.target)?.x" :y2="getNodeById(edge.target)?.y"
                :stroke="getEdgeColor(edge.id)" :stroke-width="getEdgeWidth(edge.id)" />
            </g>
            <g class="edge-labels">
              <g v-for="edge in edges" :key="edge.id + '-label'">
                <text v-if="edge.weight !== undefined && getNodeById(edge.source) && getNodeById(edge.target)"
                  :x="(getNodeById(edge.source).x + getNodeById(edge.target).x) / 2"
                  :y="(getNodeById(edge.source).y + getNodeById(edge.target).y) / 2" text-anchor="middle" dy="-5">
                  {{ edge.weight }}
                </text>
              </g>
            </g>
            <g class="nodes">
              <g v-for="node in nodes" :key="node.id" :transform="`translate(${node.x}, ${node.y})`" class="node-group">
                <circle :r="nodeRadius" :fill="getNodeColor(node.id)" :stroke="getNodeStroke(node.id)"
                  stroke-width="2" />
                <text fill="#fff" text-anchor="middle" dy=".3em" font-weight="bold" font-size="14px"
                  pointer-events="none">
                  {{ node.id }}
                </text>
              </g>
            </g>
          </svg>
        </div>

        <!-- DSL 输入栏 -->
        <div class="command-bar">
          <div class="command-input-wrapper">
            <span class="command-prompt">&gt;</span>
            <input type="text" v-model="commandInput" @keyup.enter="executeCommand" :disabled="isVisualizing"
              placeholder="输入指令，例如: add node G 或 add edge A B 5，然后按回车" class="command-input" />
          </div>
          <div v-if="commandOutput" class="command-output" :class="{ 'error': isCommandError }">
            {{ commandOutput }}
          </div>
        </div>

      </div>

      <div class="right-panel">
        <GraphDataViews :nodes="nodes" :edges="edges" />
      </div>

    </div>
    <AIChatWindow :context="'图算法'" />

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
// 1. 引入我们编写的 Composable
import { useGraph } from './useGraph.js';
// 2. 引入子组件
import GraphDataViews from './GraphDataViews.vue';
import AIChatWindow from '../chat/AIChatWindow.vue';

onMounted(() => {
  document.title = '图算法可视化器';
});

// --- 使用 Composable ---
// 调用 useGraph()，解构出我们需要的所有数据和方法
const {
  nodes,
  edges,
  startNode,
  animationDelay,
  isVisualizing,
  restoreDefaultGraph,
  generateRandomGraph,
  runBFS,
  runDFS,
  getNodeColor,
  getNodeStroke,
  getEdgeColor,
  getEdgeWidth
} = useGraph();

// --- UI 交互相关的状态 (这些属于当前组件的私有状态) ---
const newNodeId = ref('');
const sourceNodeInput = ref('');
const targetNodeInput = ref('');
const edgeWeightInput = ref(1);

// --- 布局常量 ---
const svgWidth = ref(700);
const svgHeight = ref(400);
const nodeRadius = 20;

// --- 辅助方法 (仅用于模板渲染) ---
// 这个方法因为要依赖 nodes.value，写在这里比较方便
const getNodeById = (id) => nodes.value.find(node => node.id === id);


// --- UI 交互处理函数 ---
// 这些函数处理表单输入，然后操作从 useGraph 导入的数据
const handleAddNode = () => {
  const id = newNodeId.value.trim().toUpperCase();
  if (!id || nodes.value.some(node => node.id === id)) {
    alert(`节点 ID 无效或已存在！`); return;
  }
  const x = 50 + Math.random() * (svgWidth.value - 100);
  const y = 50 + Math.random() * (svgHeight.value - 100);
  // 直接修改导入的 nodes 数据
  nodes.value.push({ id, x, y });
  newNodeId.value = '';
  if (nodes.value.length === 1) startNode.value = id;
};

const handleAddEdge = () => {
  if (!sourceNodeInput.value || !targetNodeInput.value || sourceNodeInput.value === targetNodeInput.value) return;
  const edgeExists = edges.value.some(edge =>
    (edge.source === sourceNodeInput.value && edge.target === targetNodeInput.value) ||
    (edge.source === targetNodeInput.value && edge.target === sourceNodeInput.value)
  );
  if (edgeExists) { alert(`边已存在！`); return; }
  // 直接修改导入的 edges 数据
  edges.value.push({
    id: `e_${Date.now()}`,
    source: sourceNodeInput.value,
    target: targetNodeInput.value,
    weight: edgeWeightInput.value || 1
  });
  // 重置输入框
  sourceNodeInput.value = '';
  targetNodeInput.value = '';
  edgeWeightInput.value = 1;
};
</script>

<style scoped>
/* 这里只保留主布局、左侧控件和 SVG 相关的样式。
  右侧视图的样式已经移到了 GraphDataViews.vue 中。
*/
.graph-visualizer {
  display: flex;
  flex-direction: column;
  /* align-items: center; */

  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
}

.header-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}

.main-content {
  display: flex;
  gap: 20px;
  width: 100%;
  align-items: flex-start;
}

.left-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* gap 样式移到了子组件里，这里可以去掉了 */
  min-width: 300px;
}

.main-controls {
  /* margin-bottom 等原有样式保留 */
  display: flex;
  flex-direction: column;
  /* 关键：改为垂直方向 */
  gap: 10px;
  /* 行与行之间的间距 */
  align-items: center;
  /* 让每一行在容器中居中对齐 */
  padding: 20px;
  /* 稍微增加点内边距 */
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 新增：每一行的容器样式 */
.control-row {
  display: flex;
  /* 行内部依然是水平 Flex */
  flex-wrap: wrap;
  /* 允许小屏幕下换行 */
  gap: 15px;
  /* 行内元素之间的间距 */
  align-items: center;
  justify-content: center;
  /* 行内元素居中 */
  width: 100%;
  /* 占满整行宽度 */
}

/* --- 通用控件样式 (保留) --- */
.control-group {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.border-left {
  border-left: 1px solid #eee;
  padding-left: 15px;
  /* 增加一点左侧间距 */
}

input,
select {
  padding: 5px 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

button {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.primary-btn {
  background-color: #8e44ad;
}

.primary-btn:hover:not(:disabled) {
  background-color: #9b59b6;
}

.algo-btn {
  background-color: #27ae60;
  min-width: 90px;
}

.algo-btn:hover:not(:disabled) {
  background-color: #2ecc71;
}

.small-btn {
  padding: 5px 8px;
  font-size: 11px;
}

.add-edge-group select {
  width: 65px;
}

/* SVG 样式 (保留) */
.visualization-container {
  background-color: #fcfcfc;
  border-radius: 12px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #eee;
  overflow: hidden;
}

.edge-labels text {
  font-size: 12px;
  font-weight: bold;
  fill: #555;
  stroke: #fcfcfc;
  stroke-width: 4px;
  paint-order: stroke;
  pointer-events: none;
}

.nodes circle {
  cursor: pointer;
}

.nodes circle,
.edges line {
  transition: fill 0.4s ease, stroke 0.4s ease, stroke-width 0.4s ease, r 0.4s ease;
}

.node-group:hover circle {
  r: 23;
  stroke-width: 3;
}

.command-bar {
  width: 100%;
  /* 改为白色背景，与上方控件区一致 */
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  /* 使用一致的柔和阴影 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: #333;
  /* 保留等宽字体以便于阅读代码和对齐，但颜色不再是刺眼的高亮色 */
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  border: 1px solid #eee;
}

.command-input-wrapper {
  display: flex;
  align-items: center;
  /* 输入框背景改为非常浅的灰色，以区分外部容器 */
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 8px 12px;
  /* 使用标准的浅灰色边框 */
  border: 1px solid #ddd;
  transition: border-color 0.3s ease;
}

/* 输入框聚焦时的效果，增加一点交互感 */
.command-input-wrapper:focus-within {
  border-color: #3498db;
}

.command-prompt {
  /* 提示符改为低调的灰色 */
  color: #999;
  margin-right: 12px;
  font-weight: bold;
  font-size: 16px;
}

.command-input {
  flex: 1;
  background: none;
  border: none;
  /* 文字颜色跟随父元素 */
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

/* 输出区域样式 */
.command-output {
  margin-top: 12px;
  padding: 10px 15px;
  font-size: 13px;
  /* 成功/普通信息使用非常浅的蓝色背景 */
  background-color: #f0f7fd;
  color: #333;
  /* 左侧边框使用主题蓝色 */
  border-left: 4px solid #3498db;
  border-radius: 4px;
}

/* 错误信息样式 */
.command-output.error {
  /* 错误信息使用非常浅的红色背景 */
  background-color: #fff5f5;
  color: #c0392b;
  /* 左侧边框使用红色 */
  border-left-color: #e74c3c;
}
</style>