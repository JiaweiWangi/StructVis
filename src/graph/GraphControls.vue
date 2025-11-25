<template>
  <div class="controls-wrapper">
    <div class="controls header-controls">
      <button @click="$emit('generate-random')" :disabled="isVisualizing" class="primary-btn" title="在固定网格位置上生成随机图">
        生成随机图
      </button>
      <button @click="$emit('restore-default')" :disabled="isVisualizing">
        恢复默认图
      </button>
    </div>

    <div class="controls main-controls">
      <div class="control-row">
        <div class="control-group">
          <input id="new-node-id" v-model="newNodeId" placeholder="新ID(如G)" :disabled="isVisualizing"
            style="width: 60px;" />
          <button @click="onAddNode" :disabled="isVisualizing || !newNodeId.trim()" class="small-btn">添加节点</button>
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

          <button @click="onAddEdge"
            :disabled="isVisualizing || !sourceNodeInput || !targetNodeInput || sourceNodeInput === targetNodeInput"
            class="small-btn">
            添加边
          </button>
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label for="start-node">起始点:</label>
          <select :value="startNode" @change="$emit('update:startNode', $event.target.value)" :disabled="isVisualizing" style="width: 60px;">
            <option v-for="node in nodes" :key="node.id" :value="node.id">
              {{ node.id }}
            </option>
          </select>
        </div>

        <button @click="$emit('run-bfs')" :disabled="isVisualizing || !startNode" class="algo-btn">
          广度优先 (BFS)
        </button>
        <button @click="$emit('run-dfs')" :disabled="isVisualizing || !startNode" class="algo-btn">
          深度优先 (DFS)
        </button>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label for="speed-slider">速度:</label>
          <input id="speed-slider" type="range" min="100" max="1500" step="100" 
            :value="animationDelay" @input="$emit('update:animationDelay', +$event.target.value)"
            title="调整动画速度" />
          <span style="font-size: 12px; width: 35px;">{{ animationDelay }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  isVisualizing: { type: Boolean, default: false },
  startNode: { type: String, default: '' },
  animationDelay: { type: Number, default: 500 }
});

const emit = defineEmits([
  'generate-random', 'restore-default', 
  'add-node', 'add-edge', 
  'run-bfs', 'run-dfs',
  'update:startNode', 'update:animationDelay'
]);

// 本地状态（表单输入）
const newNodeId = ref('');
const sourceNodeInput = ref('');
const targetNodeInput = ref('');
const edgeWeightInput = ref(1);

// 处理添加节点
const onAddNode = () => {
  emit('add-node', newNodeId.value);
  newNodeId.value = ''; // 清空输入框
};

// 处理添加边
const onAddEdge = () => {
  emit('add-edge', {
    source: sourceNodeInput.value,
    target: targetNodeInput.value,
    weight: edgeWeightInput.value
  });
  // 重置
  sourceNodeInput.value = '';
  targetNodeInput.value = '';
  edgeWeightInput.value = 1;
};
</script>

<style scoped>
/* 将原 controls 相关的 CSS 移动到这里 */
.controls-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
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

.main-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

input, select {
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

.primary-btn { background-color: #8e44ad; }
.primary-btn:hover:not(:disabled) { background-color: #9b59b6; }
.algo-btn { background-color: #27ae60; min-width: 90px; }
.algo-btn:hover:not(:disabled) { background-color: #2ecc71; }
.small-btn { padding: 5px 8px; font-size: 11px; }
.add-edge-group select { width: 65px; }
</style>