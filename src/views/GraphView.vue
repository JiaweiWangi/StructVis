<template>
  <div class="graph-visualizer">
    <div class="controls header-controls">
      <button @click="generateRandomGraph" :disabled="isVisualizing" class="primary-btn" title="在固定网格位置上生成随机图">
        🎲 生成随机图 (网格布局)
      </button>
      <button @click="restoreDefaultGraph" :disabled="isVisualizing">
        ↩️ 恢复默认图
      </button>
    </div>

    <div class="controls main-controls">
      <div class="control-group">
        <input id="new-node-id" v-model="newNodeId" placeholder="新ID(如G)" :disabled="isVisualizing" style="width: 70px;"/>
        <button @click="addNode" :disabled="isVisualizing || !newNodeId.trim()" class="small-btn">添加节点</button>
      </div>

      <div class="control-group border-left add-edge-group">
        <select v-model="sourceNode" :disabled="isVisualizing || nodes.length === 0">
          <option value="">起点</option>
          <option v-for="node in nodes" :key="'src-'+node.id" :value="node.id">{{ node.id }}</option>
        </select>
        <span>→</span>
        <select v-model="targetNode" :disabled="isVisualizing || nodes.length === 0">
          <option value="">终点</option>
          <option v-for="node in nodes" :key="'tgt-'+node.id" :value="node.id">{{ node.id }}</option>
        </select>
        
        <input id="edge-weight" type="number" v-model.number="edgeWeight" min="1" placeholder="权重" :disabled="isVisualizing" style="width: 50px;" />
        
        <button @click="addEdge" :disabled="isVisualizing || !sourceNode || !targetNode || sourceNode === targetNode" class="small-btn">
          添加边
        </button>
      </div>

      <div class="control-group border-left">
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

      <div class="control-group border-left">
        <input
          id="speed-slider"
          type="range"
          min="100"
          max="1500"
          step="100"
          v-model.number="animationDelay"
          title="调整动画速度"
        />
        <span style="font-size: 12px; width: 40px;">{{ animationDelay }}ms</span>
      </div>
    </div>

    <div class="visualization-container">
    <svg :width="svgWidth" :height="svgHeight">
        <g class="edges">
          <line
            v-for="edge in edges"
            :key="edge.id"
            :x1="getNodeById(edge.source)?.x"
            :y1="getNodeById(edge.source)?.y"
            :x2="getNodeById(edge.target)?.x"
            :y2="getNodeById(edge.target)?.y"
            :stroke="getEdgeColor(edge.id)"
            :stroke-width="getEdgeWidth(edge.id)"
          />
        </g>
        
        <g class="edge-labels">
          <g v-for="edge in edges" :key="edge.id + '-label'">
            <text
              v-if="edge.weight !== undefined && getNodeById(edge.source) && getNodeById(edge.target)"
              :x="(getNodeById(edge.source).x + getNodeById(edge.target).x) / 2"
              :y="(getNodeById(edge.source).y + getNodeById(edge.target).y) / 2"
              text-anchor="middle"
              dy="-5"
            >
              {{ edge.weight }}
            </text>
        </g>
        </g>

        <g class="nodes">
          <g v-for="node in nodes" :key="node.id" :transform="`translate(${node.x}, ${node.y})`" class="node-group">
            <circle
              :r="nodeRadius"
              :fill="getNodeColor(node.id)"
              :stroke="getNodeStroke(node.id)"
              stroke-width="2"
            />
            <text
              fill="#fff"
              text-anchor="middle"
              dy=".3em"
              font-weight="bold"
              font-size="14px"
              pointer-events="none" 
            >
              {{ node.id }}
            </text>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// --- 初始数据定义 (保持不变，它们正好位于我们即将定义的网格上) ---
const initialNodes = [
  { id: 'A', x: 150, y: 300 },
  { id: 'B', x: 300, y: 150 },
  { id: 'C', x: 300, y: 450 },
  { id: 'D', x: 450, y: 150 },
  { id: 'E', x: 450, y: 450 },
  { id: 'F', x: 600, y: 300 }
];

const initialEdges = [
  { id: 'e1', source: 'A', target: 'B', weight: 5 },
  { id: 'e2', source: 'A', target: 'C', weight: 3 },
  { id: 'e3', source: 'B', target: 'D', weight: 2 },
  { id: 'e4', source: 'C', target: 'E', weight: 8 },
  { id: 'e5', source: 'D', target: 'F', weight: 4 },
  { id: 'e6', source: 'E', target: 'F', weight: 6 }
];

// --- 响应式状态 ---
const nodes = ref([...initialNodes]); 
const edges = ref([...initialEdges]);
const startNode = ref(nodes.value.length > 0 ? nodes.value[0].id : ''); 

const animationDelay = ref(500);
const isVisualizing = ref(false);

// --- 编辑控件状态 ---
const newNodeId = ref('');
const sourceNode = ref('');
const targetNode = ref('');
const edgeWeight = ref(1);

// --- 布局常量 ---
const svgWidth = ref(800);
const svgHeight = ref(600);
const nodeRadius = 20;

// --- 可视化状态 ---
const highlightedNodes = ref([]); 
const visitedNodes = ref([]);     
const queuedNodes = ref([]);      
const highlightedEdges = ref([]); 

// --- 基础工具方法 ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getNodeById = (id) => nodes.value.find(node => node.id === id);

const clearVisualizationState = () => {
  highlightedNodes.value = [];
  visitedNodes.value = [];
  queuedNodes.value = [];
  highlightedEdges.value = [];
};

const restoreDefaultGraph = () => {
    if (isVisualizing.value) return;
    clearVisualizationState();
    nodes.value = [...initialNodes];
    edges.value = [...initialEdges];
    startNode.value = nodes.value.length > 0 ? nodes.value[0].id : '';
}

// --- 核心修改：生成固定位置的随机图 ---

// 1. 定义预设的网格位置池 (4列 x 3行 = 12个位置)
const predefinedPositions = [
    { x: 150, y: 150 }, { x: 300, y: 150 }, { x: 450, y: 150 }, { x: 600, y: 150 }, // 第一行
    { x: 150, y: 300 }, { x: 300, y: 300 }, { x: 450, y: 300 }, { x: 600, y: 300 }, // 第二行
    { x: 150, y: 450 }, { x: 300, y: 450 }, { x: 450, y: 450 }, { x: 600, y: 450 }, // 第三行
];

// 辅助函数：洗牌数组 (Fisher-Yates Shuffle)
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const generateRandomGraph = () => {
    if (isVisualizing.value) return;
    clearVisualizationState();

    // 2. 随机确定节点数量 (例如 5 到 10 个，不能超过位置池总量)
    const maxNodes = Math.min(10, predefinedPositions.length);
    const minNodes = 5;
    const numNodes = Math.floor(Math.random() * (maxNodes - minNodes + 1)) + minNodes;
    
    const newNodes = [];
    const nodeIds = [];

    // 3. 打乱位置池，选取前 numNodes 个位置
    const selectedPositions = shuffleArray(predefinedPositions).slice(0, numNodes);

    // 4. 生成节点，分配选中的固定位置
    for (let i = 0; i < numNodes; i++) {
        const id = String.fromCharCode(65 + i); // A, B, C...
        nodeIds.push(id);
        newNodes.push({
            id: id,
            x: selectedPositions[i].x,
            y: selectedPositions[i].y,
        });
    }

    // 5. 生成边 (这部分逻辑保持不变，依然是随机连接)
    const newEdges = [];
    // 目标边数：大约节点数的 1.2 到 1.8 倍
    const densityMultiplier = 1.2 + Math.random() * 0.6; 
    const targetNumEdges = Math.floor(numNodes * densityMultiplier); 
    
    let attempts = 0;
    const maxAttempts = targetNumEdges * 10; // 防止死循环

    while (newEdges.length < targetNumEdges && attempts < maxAttempts) {
        attempts++;
        const i = Math.floor(Math.random() * numNodes);
        let j = Math.floor(Math.random() * numNodes);
        while (j === i) j = Math.floor(Math.random() * numNodes); // 无自环

        const sourceId = nodeIds[i];
        const targetId = nodeIds[j];

        // 无向图检查重复边
        const edgeExists = newEdges.some(e =>
            (e.source === sourceId && e.target === targetId) ||
            (e.source === targetId && e.target === sourceId)
        );

        if (!edgeExists) {
            newEdges.push({
                id: `e_${Date.now()}_${newEdges.length}`,
                source: sourceId,
                target: targetId,
                weight: Math.floor(Math.random() * 9) + 1 // 权重 1-9
            });
        }
    }

    // 6. 更新状态
    nodes.value = newNodes;
    edges.value = newEdges;
    startNode.value = nodes.value.length > 0 ? nodes.value[0].id : '';
};


// --- 颜色计算计算属性 (保持不变) ---
const getNodeColor = (nodeId) => {
  if (highlightedNodes.value.includes(nodeId)) return '#f1c40f'; 
  if (visitedNodes.value.includes(nodeId)) return '#2ecc71';     
  if (queuedNodes.value.includes(nodeId)) return '#9b59b6';      
  return '#3498db'; 
};

const getNodeStroke = (nodeId) => {
    if (highlightedNodes.value.includes(nodeId)) return '#d35400';
    return '#2980b9';
}

const getEdgeColor = (edgeId) => {
  if (highlightedEdges.value.includes(edgeId)) return '#f1c40f'; 
  return '#ccc'; 
};

const getEdgeWidth = (edgeId) => {
    return highlightedEdges.value.includes(edgeId) ? 5 : 3;
}

// --- 核心：纯前端图算法实现 (保持不变) ---
const buildAdjacencyList = () => {
  const adj = new Map();
  nodes.value.forEach(node => adj.set(node.id, []));
  edges.value.forEach(edge => {
    if (adj.has(edge.source) && adj.has(edge.target)) {
        adj.get(edge.source).push({ target: edge.target, id: edge.id, weight: edge.weight });
        adj.get(edge.target).push({ target: edge.source, id: edge.id, weight: edge.weight });
    }
  });
  return adj;
};

// BFS (保持不变)
const runBFS = async () => {
  if (isVisualizing.value || !startNode.value) return;
  isVisualizing.value = true;
  clearVisualizationState();

  const adj = buildAdjacencyList();
  const queue = [startNode.value];
  queuedNodes.value.push(startNode.value);
  visitedNodes.value.push(startNode.value); 
  await sleep(animationDelay.value);

  while (queue.length > 0) {
    const currentNodeId = queue.shift();
    queuedNodes.value = queuedNodes.value.filter(id => id !== currentNodeId);
    highlightedNodes.value = [currentNodeId];
    await sleep(animationDelay.value);

    const neighbors = adj.get(currentNodeId) || [];
    for (const neighbor of neighbors) {
      if (!visitedNodes.value.includes(neighbor.target)) {
        highlightedEdges.value = [neighbor.id];
        await sleep(animationDelay.value / 2);
        visitedNodes.value.push(neighbor.target);
        queue.push(neighbor.target);
        queuedNodes.value.push(neighbor.target);
        await sleep(animationDelay.value / 2);
      }
    }
    highlightedNodes.value = [];
    highlightedEdges.value = [];
    await sleep(animationDelay.value);
  }
  isVisualizing.value = false;
};

// DFS (保持不变)
const runDFS = async () => {
  if (isVisualizing.value || !startNode.value) return;
  isVisualizing.value = true;
  clearVisualizationState();
  const adj = buildAdjacencyList();
  const visitedSet = new Set();
  await dfsRecursive(startNode.value, adj, visitedSet);
  highlightedNodes.value = [];
  isVisualizing.value = false;
};

const dfsRecursive = async (currentNodeId, adj, visitedSet) => {
    visitedSet.add(currentNodeId);
    visitedNodes.value.push(currentNodeId);
    highlightedNodes.value = [currentNodeId];
    await sleep(animationDelay.value);

    const neighbors = adj.get(currentNodeId) || [];
    for (const neighbor of neighbors) {
        if (!visitedSet.has(neighbor.target)) {
            highlightedEdges.value = [neighbor.id];
            highlightedNodes.value = []; 
            await sleep(animationDelay.value);
            await dfsRecursive(neighbor.target, adj, visitedSet);
            highlightedEdges.value = [];
            highlightedNodes.value = [currentNodeId];
            await sleep(animationDelay.value);
        }
    }
}


// --- 编辑功能实现 (保持不变) ---
const addNode = () => {
  const id = newNodeId.value.trim().toUpperCase(); 
  if (!id || nodes.value.some(node => node.id === id)) {
    alert(`节点 ID 无效或已存在！`); return;
  }
  // 手动添加的节点仍然使用随机位置，以示区别，或者你可以让它们吸附到最近的空闲网格点（更复杂）
  const x = 50 + Math.random() * (svgWidth.value - 100);
  const y = 50 + Math.random() * (svgHeight.value - 100);
  nodes.value.push({ id, x, y });
  newNodeId.value = '';
  if (nodes.value.length === 1) startNode.value = id;
};

const addEdge = () => {
  if (!sourceNode.value || !targetNode.value || sourceNode.value === targetNode.value) return;
  const edgeExists = edges.value.some(edge => 
    (edge.source === sourceNode.value && edge.target === targetNode.value) ||
    (edge.source === targetNode.value && edge.target === sourceNode.value)
  );
  if (edgeExists) { alert(`边已存在！`); return; }
  edges.value.push({
    id: `e_${Date.now()}`,
    source: sourceNode.value,
    target: targetNode.value,
    weight: edgeWeight.value || 1
  });
};
</script>

<style scoped>
/* 样式保持不变，省略以节省篇幅 ... */
.graph-visualizer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

.header-controls {
    margin-bottom: 15px;
    padding: 10px 20px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px; /* 加个圆角 */
}

.controls {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.border-left {
    border-left: 1px solid #eee;
    padding-left: 12px;
}

input, select {
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
}

button {
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.primary-btn { background-color: #8e44ad; } 
.primary-btn:hover:not(:disabled) { background-color: #9b59b6; }

.algo-btn { background-color: #27ae60; min-width: 100px; } 
.algo-btn:hover:not(:disabled) { background-color: #2ecc71; }

.small-btn { padding: 6px 10px; font-size: 12px;}

.add-edge-group select { width: 75px; }


.visualization-container {
    background-color: #fcfcfc;
    border-radius: 12px;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.03);
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

.nodes circle { cursor: pointer; }
.nodes circle, .edges line {
  transition: fill 0.4s ease, stroke 0.4s ease, stroke-width 0.4s ease, r 0.4s ease;
}
.node-group:hover circle { r: 23; stroke-width: 3; }
</style>