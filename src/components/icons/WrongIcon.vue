<script setup lang="ts">
import { computed } from 'vue';

// 定义props
const props = defineProps({
  size: {
    type: [Number, String],
    default: 24 // 默认大小
  },
  color: {
    type: String,
    default: 'currentColor' // 默认颜色
  },
  rotate: {
    type: Number,
    default: 0 // 默认不旋转
  }
});

// 根据props计算style
const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: props.color,
  transform: props.rotate ? `rotate(${props.rotate}deg)` : 'none'
}));
</script>

<template>
  <!-- 定义svg图标 -->
  <svg 
    class="svg-icon" 
    :style="style" 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <!-- x符号的路径 -->
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
</template>

<style scoped>
/* svg图标的样式 */
.svg-icon {
  display: inline-block;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
</style>