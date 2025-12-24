<template>
  <div class="graph-visualizer">
    <button class="back-btn" @click="goBack">
      &lt; 返回上一页
    </button>

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
          @save-graph="handleSaveGraph"
          @load-graph="handleLoadGraph"
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
          :placeholder="'输入指令，例如: new random 或 run bfs，按下回车执行'"
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
import { useRouter } from 'vue-router';
import { useGraph } from './useGraph.js'; 
import GraphControls from './GraphControls.vue';
import GraphCanvas from './GraphCanvas.vue';
import CommandBar from '../components/CommandBar.vue';
import GraphDataViews from './GraphDataViews.vue';
import AIChatWindow from '../chat/AIChatWindow.vue';

const router = useRouter();

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};

onMounted(() => {
  document.title = '图算法可视化器';
});

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
  commandOutput,
  isCommandError,
  executeCommand,
  saveGraphData,
  loadGraphData
} = useGraph();

const svgWidth = ref(700);
const svgHeight = ref(400);

const handleAddNode = (id) => {
  const result = addNode(id, svgWidth.value, svgHeight.value);
  if (!result.success) alert(result.message);
};

const handleAddEdge = ({ source, target, weight }) => {
  const result = addEdge(source, target, weight);
  if (!result.success) alert(result.message);
};

const handleSaveGraph = () => {
  saveGraphData();
};

const handleLoadGraph = async (file) => {
  try {
    await loadGraphData(file);
  } catch (err) {
    console.error('加载文件失败:', err);
  }
};
</script>

<style scoped>
/* 主布局样式 */
.graph-visualizer {
  display: flex;
  flex-direction: column;
  padding: 20px; 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
}

/* --- 返回按钮：悬浮固定在左上角 --- */
.back-btn {
  position: fixed; 
  top: 20px;       
  left: 20px;     
  z-index: 1000;  
  
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.back-btn:hover {
  background-color: #f5f5f5;
  color: #333;
  border-color: #ccc;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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