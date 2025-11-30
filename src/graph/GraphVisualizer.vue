<template>
  <div class="graph-visualizer">
    <div class="main-content">
      
      <div class="left-panel">
        
        <GraphControls 
          :nodes="nodes"
          :is-visualizing="isVisualizing"
          v-model:start-node="startNode"
          v-model:animation-delay="animationDelay"
          @generate-random="generateRandomGraph"
          @restore-default="restoreDefaultGraph"
          @add-node="handleAddNode"
          @add-edge="handleAddEdge"
          @run-bfs="runBFS"
          @run-dfs="runDFS"
        />

        <GraphCanvas
          :nodes="nodes"
          :edges="edges"
          :svg-width="svgWidth"
          :svg-height="svgHeight"
          :get-node-color="getNodeColor"
          :get-node-stroke="getNodeStroke"
          :get-edge-color="getEdgeColor"
          :get-edge-width="getEdgeWidth"
        />

        <CommandBar 
          :is-visualizing="isVisualizing"
          :output="commandOutput"
          :is-error="isCommandError"
          @execute="executeCommand"
        />
        
      </div>

      <div class="right-panel">
        <GraphDataViews :nodes="nodes" :edges="edges" />
      </div>

    </div>
    
    <AIChatWindow 
    :context="'图论算法'"
    :on-command="executeCommand"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useGraph } from './useGraph.js'; // 假设这个路径没变
// 引入拆分后的组件
import GraphControls from './GraphControls.vue';
import GraphCanvas from './GraphCanvas.vue';
import CommandBar from './CommandBar.vue';
import GraphDataViews from './GraphDataViews.vue';
import AIChatWindow from '../chat/AIChatWindow.vue';

onMounted(() => {
  document.title = '图算法可视化器';
});

// --- 使用 Composable ---
const {
  nodes,
  edges,
  startNode,
  addNode, 
  addEdge,
  animationDelay,
  isVisualizing,
  restoreDefaultGraph,
  generateRandomGraph,
  runBFS,
  runDFS,
  getNodeColor,
  getNodeStroke,
  getEdgeColor,
  getEdgeWidth,
  commandOutput,   // 绑定给 CommandBar 显示消息
  isCommandError,  // 绑定给 CommandBar 显示红色错误
  executeCommand,  // 绑定给 CommandBar 处理回车事件
} = useGraph();

// --- 布局常量 ---
const svgWidth = ref(700);
const svgHeight = ref(400);

// --- 处理来自子组件的事件 ---
const handleAddNode = (id) => {
  // 调用 JS 里的逻辑，传入 ID 和 画布宽高
  const result = addNode(id, svgWidth.value, svgHeight.value);
  
  if (!result.success) {
    alert(result.message); // UI 层负责弹出提示
  }
};

const handleAddEdge = ({ source, target, weight }) => {
  const result = addEdge(source, target, weight);
  
  if (!result.success) {
    alert(result.message);
  }
};
</script>

<style scoped>
/* 主布局样式 */
.graph-visualizer {
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
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
  min-width: 300px;
}
</style>