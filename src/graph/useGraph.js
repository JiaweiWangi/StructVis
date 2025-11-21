import { ref, computed } from 'vue';

// 将这些常量移到外部，避免每次调用函数都重新定义
const initialNodesData = [
  { id: 'A', x: 150, y: 300 }, { id: 'B', x: 300, y: 150 },
  { id: 'C', x: 300, y: 450 }, { id: 'D', x: 450, y: 150 },
  { id: 'E', x: 450, y: 450 }, { id: 'F', x: 600, y: 300 }
];

const initialEdgesData = [
  { id: 'e1', source: 'A', target: 'B', weight: 5 },
  { id: 'e2', source: 'A', target: 'C', weight: 3 },
  { id: 'e3', source: 'B', target: 'D', weight: 2 },
  { id: 'e4', source: 'C', target: 'E', weight: 8 },
  { id: 'e5', source: 'D', target: 'F', weight: 4 },
  { id: 'e6', source: 'E', target: 'F', weight: 6 }
];

const predefinedPositions = [
    { x: 150, y: 150 }, { x: 300, y: 150 }, { x: 450, y: 150 }, { x: 600, y: 150 },
    { x: 150, y: 300 }, { x: 300, y: 300 }, { x: 450, y: 300 }, { x: 600, y: 300 },
    { x: 150, y: 450 }, { x: 300, y: 450 }, { x: 450, y: 450 }, { x: 600, y: 450 },
];

// --- 主函数：useGraph ---
// 这是一个约定俗成的命名方式，以 'use' 开头
export function useGraph() {
  // --- 核心数据状态 ---
  // 注意：这里使用深拷贝 [...initial...]，防止修改影响到原始初始数据
  const nodes = ref(initialNodesData.map(n => ({...n})));
  const edges = ref(initialEdgesData.map(e => ({...e})));
  const startNode = ref(nodes.value.length > 0 ? nodes.value[0].id : '');
  const animationDelay = ref(500);
  const isVisualizing = ref(false);

  // --- 可视化状态 (颜色高亮) ---
  const highlightedNodes = ref([]);
  const visitedNodes = ref([]);
  const queuedNodes = ref([]);
  const highlightedEdges = ref([]);

  // --- 基础工具方法 ---
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  const clearVisualizationState = () => {
    highlightedNodes.value = [];
    visitedNodes.value = [];
    queuedNodes.value = [];
    highlightedEdges.value = [];
  };

  const restoreDefaultGraph = () => {
    if (isVisualizing.value) return;
    clearVisualizationState();
    nodes.value = initialNodesData.map(n => ({...n}));
    edges.value = initialEdgesData.map(e => ({...e}));
    startNode.value = nodes.value.length > 0 ? nodes.value[0].id : '';
  };

  // --- 辅助函数：洗牌和构建邻接表 ---
  const shuffleArray = (array) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
  };

  const buildAdjacencyList = () => {
    const adj = new Map();
    nodes.value.forEach(node => adj.set(node.id, []));
    edges.value.forEach(edge => {
      // 确保源和目标都存在于节点列表中才添加
      if (adj.has(edge.source) && adj.has(edge.target)) {
          adj.get(edge.source).push({ target: edge.target, id: edge.id, weight: edge.weight });
          adj.get(edge.target).push({ target: edge.source, id: edge.id, weight: edge.weight });
      }
    });
    return adj;
  };

  // --- 核心功能：生成随机图 ---
  const generateRandomGraph = () => {
      if (isVisualizing.value) return;
      clearVisualizationState();
      const maxNodes = Math.min(10, predefinedPositions.length);
      const minNodes = 5;
      const numNodes = Math.floor(Math.random() * (maxNodes - minNodes + 1)) + minNodes;
      
      const newNodes = [];
      const nodeIds = [];
      const selectedPositions = shuffleArray(predefinedPositions).slice(0, numNodes);

      for (let i = 0; i < numNodes; i++) {
          const id = String.fromCharCode(65 + i);
          nodeIds.push(id);
          newNodes.push({ id: id, x: selectedPositions[i].x, y: selectedPositions[i].y });
      }

      const newEdges = [];
      const densityMultiplier = 1.2 + Math.random() * 0.6; 
      const targetNumEdges = Math.floor(numNodes * densityMultiplier); 
      let attempts = 0;
      const maxAttempts = targetNumEdges * 10;

      while (newEdges.length < targetNumEdges && attempts < maxAttempts) {
          attempts++;
          const i = Math.floor(Math.random() * numNodes);
          let j = Math.floor(Math.random() * numNodes);
          while (j === i) j = Math.floor(Math.random() * numNodes);

          const sourceId = nodeIds[i];
          const targetId = nodeIds[j];

          const edgeExists = newEdges.some(e =>
              (e.source === sourceId && e.target === targetId) ||
              (e.source === targetId && e.target === sourceId)
          );

          if (!edgeExists) {
              newEdges.push({
                  id: `e_${Date.now()}_${newEdges.length}`,
                  source: sourceId, target: targetId,
                  weight: Math.floor(Math.random() * 9) + 1
              });
          }
      }
      nodes.value = newNodes;
      edges.value = newEdges;
      startNode.value = nodes.value.length > 0 ? nodes.value[0].id : '';
  };

  // --- 算法：BFS ---
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

  // --- 算法：DFS ---
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

  // --- 颜色计算 ---
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

  // --- **重要：返回外部组件需要用到的所有数据和方法** ---
  return {
    // 数据 ref
    nodes,
    edges,
    startNode,
    animationDelay,
    isVisualizing,
    // 可视化状态 ref (虽然不直接修改，但 SVG 需要读取它们)
    highlightedNodes,
    visitedNodes,
    queuedNodes,
    highlightedEdges,
    // 方法
    restoreDefaultGraph,
    generateRandomGraph,
    runBFS,
    runDFS,
    // 颜色获取方法
    getNodeColor,
    getNodeStroke,
    getEdgeColor,
    getEdgeWidth
  };
}