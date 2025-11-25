<template>
  <div class="visualization-container">
    <svg :width="svgWidth" :height="svgHeight">
      <g class="edges">
        <line v-for="edge in edges" :key="edge.id" 
          :x1="getNodeById(edge.source)?.x"
          :y1="getNodeById(edge.source)?.y" 
          :x2="getNodeById(edge.target)?.x" 
          :y2="getNodeById(edge.target)?.y"
          :stroke="getEdgeColor(edge.id)" 
          :stroke-width="getEdgeWidth(edge.id)" />
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
</template>

<script setup>
const props = defineProps({
  nodes: { type: Array, required: true },
  edges: { type: Array, required: true },
  svgWidth: { type: Number, default: 700 },
  svgHeight: { type: Number, default: 400 },
  // 函数Props，用于获取样式
  getNodeColor: { type: Function, required: true },
  getNodeStroke: { type: Function, required: true },
  getEdgeColor: { type: Function, required: true },
  getEdgeWidth: { type: Function, required: true }
});

const nodeRadius = 20;

// 辅助函数：根据ID查找节点对象（复用父组件传下来的nodes）
const getNodeById = (id) => props.nodes.find(node => node.id === id);
</script>

<style scoped>
/* SVG 相关的样式 */
.visualization-container {
  background-color: #fcfcfc;
  border-radius: 12px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #eee;
  overflow: hidden;
  /* 确保 SVG 居中 */
  display: flex;
  justify-content: center; 
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

.node-group:hover circle {
  r: 23;
  stroke-width: 3;
}
</style>