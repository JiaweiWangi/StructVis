import { ref, computed } from 'vue';

// 将这些常量移到外部，避免每次调用函数都重新定义
const initialNodesData = [
  { id: 'A', x: 150, y: 200 }, { id: 'B', x: 300, y: 50 },
  { id: 'C', x: 300, y: 350 }, { id: 'D', x: 450, y: 50 },
  { id: 'E', x: 450, y: 350 }, { id: 'F', x: 600, y: 200 }
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
  { x: 150, y: 50 }, { x: 300, y: 50 }, { x: 450, y: 50 }, { x: 600, y: 50 },
  { x: 150, y: 200 }, { x: 300, y: 200 }, { x: 450, y: 200 }, { x: 600, y: 200 },
  { x: 150, y: 350 }, { x: 300, y: 350 }, { x: 450, y: 350 }, { x: 600, y: 350 },
];

// --- 主函数：useGraph ---
export function useGraph() {
  // --- 核心数据状态 ---
  // 注意：这里使用深拷贝 [...initial...]，防止修改影响到原始初始数据
  const nodes = ref(initialNodesData.map(n => ({ ...n })));
  const edges = ref(initialEdgesData.map(e => ({ ...e })));
  const startNode = ref(nodes.value.length > 0 ? nodes.value[0].id : '');
  const animationDelay = ref(500);
  const isVisualizing = ref(false);

  const commandOutput = ref('Ready.'); // 默认提示文本
  const isCommandError = ref(false);   // 是否显示为错误样式

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
    nodes.value = initialNodesData.map(n => ({ ...n }));
    edges.value = initialEdgesData.map(e => ({ ...e }));
    startNode.value = nodes.value.length > 0 ? nodes.value[0].id : '';
  };

  // --- 添加节点的纯逻辑 ---
  // 返回 true 表示成功，false 表示失败（比如ID重复）
  const addNode = (id, maxWidth, maxHeight) => {
    const finalId = id.trim().toUpperCase();

    // 1. 校验空值
    if (!finalId) return { success: false, message: 'ID 不能为空' };

    // 2. 校验重复
    if (nodes.value.some(n => n.id === finalId)) {
      return { success: false, message: '节点 ID 已存在' };
    }

    // 3. 计算坐标
    const x = 50 + Math.random() * (maxWidth - 100);
    const y = 50 + Math.random() * (maxHeight - 100);

    // 4. 添加数据
    nodes.value.push({ id: finalId, x, y });

    // 5. 如果是第一个节点，自动设为起点
    if (nodes.value.length === 1) {
      startNode.value = finalId;
    }

    return { success: true };
  };

  // --- 新增：添加边的纯逻辑 ---
  const addEdge = (source, target, weight) => {
    // 1. 校验自身环
    if (source === target) return { success: false, message: '起点和终点不能相同' };

    // 2. 校验边是否存在 (无向图逻辑：A->B 和 B->A 视为同一条边)
    const exists = edges.value.some(e =>
      (e.source === source && e.target === target) ||
      (e.source === target && e.target === source)
    );

    if (exists) return { success: false, message: '边已存在' };

    // 3. 添加数据
    edges.value.push({
      id: `e_${Date.now()}`, // 生成唯一ID
      source,
      target,
      weight: Number(weight) || 1
    });

    return { success: true };
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

  // --- DSL 命令行解析与执行 ---
  const executeCommand = (cmdString) => {
    // 0. 防御性检查
    if (!cmdString || !cmdString.trim()) return;

    // 1. 重置状态
    isCommandError.value = false;
    commandOutput.value = '';

    // 2. 解析命令
    const parts = cmdString.trim().split(/\s+/);
    const action = parts[0];
    const param = parts[1];

    try {
      switch (action) {
        // --- 帮助指令 ---
        case 'help':
        case '?': // 支持 ? 作为简写
          // 使用数组 join 拼接，方便维护
          commandOutput.value = [
            "📋 指令指南:",
            "1. add node <ID>          → 新增节点",
            "2. add edge <起> <终> [权重] → 新增边",
            "3. set start <ID>         → 设置起点",
            "4. run bfs / dfs          → 运行算法",
            "5. new random / default   → 生成图表",
            "6. delay <毫秒>           → 设动画速度"
          ].join('\n');
          break;

        // --- 工具命令 ---
        case 'new':
          if (param === 'default') {
            restoreDefaultGraph();
            commandOutput.value = "🔄 画布已重置";
          } else if (param === 'random') {
            generateRandomGraph();
            commandOutput.value = "🎲 已生成随机图";
          }
          break;

        // --- 添加命令 ---
        case 'add':
          if (parts[1] === 'node') {
            const nodeId = parts[2];
            // 假设画布范围 700x400，留出边距
            const result = addNode(nodeId, 700, 400);
            if (result.success) {
              commandOutput.value = `✅ 成功添加节点: ${nodeId.toUpperCase()}`;
            } else {
              throw new Error(result.message);
            }
          } else if (parts[1] === 'edge') {
            const source = parts[2];
            const target = parts[3];
            const weight = parts[4] || 1;

            if (!source || !target) throw new Error("缺少参数: add edge <起点> <终点>");

            const result = addEdge(source.toUpperCase(), target.toUpperCase(), weight);
            if (result.success) {
              commandOutput.value = `✅ 成功添加边: ${source}-${target} (权重: ${weight})`;
            } else {
              throw new Error(result.message);
            }
          } else {
            throw new Error("格式错误，请尝试: add node 或 add edge");
          }
          break;

        // --- 设置起点 ---
        case 'set':
          if (parts[1] === 'start') {
            const targetId = parts[2]?.toUpperCase();
            if (nodes.value.some(n => n.id === targetId)) {
              startNode.value = targetId;
              commandOutput.value = `🏁 起点已更新为: ${targetId}`;
            } else {
              throw new Error(`节点 ${targetId} 不存在`);
            }
          } else {
            throw new Error("未知 set 命令，请使用: set start <ID>");
          }
          break;

        // --- 算法运行 ---
        case 'run':
          if (isVisualizing.value) throw new Error("动画正在运行中，请稍候...");
          if (param == 'bfs') {
            commandOutput.value = `🚀 开始运行 BFS (起点: ${startNode.value})`;
            runBFS();
          } else if (param == 'dfs') {
            commandOutput.value = `🚀 开始运行 DFS (起点: ${startNode.value})`;
            runDFS();
          }
          break;

        case 'delay':
          const ms = parseInt(parts[1]);
          if (!isNaN(ms) && ms >= 0) {
            animationDelay.value = ms;
            commandOutput.value = `⏱️ 动画延迟已设置为 ${ms}ms`;
          } else {
            throw new Error("请输入有效的毫秒数");
          }
          break;

        default:
          throw new Error(`未知命令: "${action}"。输入 help 查看帮助。`);
      }
    } catch (err) {
      isCommandError.value = true;
      commandOutput.value = `❌ ${err.message}`;
    }
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

    addNode,
    addEdge,

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
    getEdgeWidth,
    commandOutput,   // 绑定给 CommandBar 显示消息
    isCommandError,  // 绑定给 CommandBar 显示红色错误
    executeCommand  // 绑定给 CommandBar 处理回车事件
  };
}