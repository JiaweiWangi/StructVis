<template>
  <div class="right-panel-content">
    <div class="data-box matrix-box">
      <h3>邻接矩阵 (Adjacency Matrix)</h3>
      <div class="table-container">
        <table v-if="nodes.length > 0">
          <thead>
            <tr>
              <th></th>
              <th v-for="node in nodes" :key="'h-'+node.id">{{ node.id }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in computedMatrix" :key="'row-'+rowIndex">
              <th>{{ nodes[rowIndex].id }}</th>
              <td v-for="(cell, cellIndex) in row" :key="'cell-'+cellIndex" :class="{ 'has-edge': cell > 0 }">
                {{ cell === 0 ? '∞' : cell }}
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="no-data">暂无节点</p>
      </div>
    </div>

    <div class="data-box list-box">
      <h3>邻接表 (Adjacency List)</h3>
      <div class="list-container">
        <ul v-if="nodes.length > 0">
          <li v-for="item in computedAdjacencyList" :key="'list-'+item.id" class="adj-list-item">
            <div class="list-head">{{ item.id }}</div>
            <div class="list-neighbors">
                <span v-for="(neighbor, idx) in item.neighbors" :key="idx" class="neighbor-node">
                  → {{ neighbor.target }}<span class="weight-tag">({{neighbor.weight}})</span>
                </span>
                <span v-if="item.neighbors.length === 0" class="no-neighbor">→ NULL</span>
            </div>
          </li>
        </ul>
          <p v-else class="no-data">暂无节点</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// --- 定义 Props ---
// 这是一个子组件，它需要从父组件接收 nodes 和 edges 数据
const props = defineProps({
  nodes: {
    type: Array,
    required: true,
    default: () => []
  },
  edges: {
    type: Array,
    required: true,
    default: () => []
  }
});

// --- 计算属性 (基于 props 计算) ---

// 1. 计算邻接矩阵
const computedMatrix = computed(() => {
    const n = props.nodes.length;
    if (n === 0) return [];

    const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
    const idMap = new Map(props.nodes.map((node, idx) => [node.id, idx]));

    props.edges.forEach(edge => {
        const uIdx = idMap.get(edge.source);
        const vIdx = idMap.get(edge.target);
        if (uIdx !== undefined && vIdx !== undefined) {
            const w = edge.weight || 1;
            matrix[uIdx][vIdx] = w;
            matrix[vIdx][uIdx] = w;
        }
    });
    return matrix;
});

// 2. 计算邻接表
const computedAdjacencyList = computed(() => {
    if (props.nodes.length === 0) return [];

    const list = props.nodes.map(node => ({ id: node.id, neighbors: [] }));
    const idMap = new Map(list.map((item, idx) => [item.id, idx]));

    props.edges.forEach(edge => {
        const uIdx = idMap.get(edge.source);
        const vIdx = idMap.get(edge.target);
         if (uIdx !== undefined && vIdx !== undefined) {
             list[uIdx].neighbors.push({ target: edge.target, weight: edge.weight });
             list[vIdx].neighbors.push({ target: edge.source, weight: edge.weight });
         }
    });

    list.forEach(item => {
        item.neighbors.sort((a, b) => a.target.localeCompare(b.target));
    });

    return list;
});
</script>

<style scoped>
/* 将原文件中与右侧视图相关的样式剪切到这里 */
.right-panel-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.data-box {
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.data-box h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #34495e;
  text-align: center;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 8px;
}

/* 邻接矩阵表格样式 */
.table-container {
  overflow-x: auto; 
}

.matrix-box table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: center;
}

.matrix-box th, .matrix-box td {
  border: 1px solid #e0e0e0;
  padding: 6px 4px;
  min-width: 24px;
}

.matrix-box th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #2c3e50;
}

.matrix-box td.has-edge {
  background-color: #e8f6f3;
  color: #27ae60;
  font-weight: bold;
}

/* 邻接表样式 */
.list-container {
  max-height: 400px;
  overflow-y: auto;
}

.list-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.adj-list-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.list-head {
  font-weight: bold;
  background-color: #3498db;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  flex-shrink: 0;
}

.list-neighbors {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.neighbor-node {
  background-color: #f0f2f5;
  padding: 3px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.weight-tag {
  font-size: 11px;
  color: #7f8c8d;
  margin-left: 2px;
}

.no-neighbor {
  color: #95a5a6;
  font-style: italic;
}

.no-data {
  text-align: center;
  color: #999;
  font-style: italic;
}
</style>