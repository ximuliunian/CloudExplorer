<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  rotate: {
    type: Number,
    default: 0
  }
});

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: props.color,
  transform: props.rotate ? `rotate(${props.rotate}deg)` : 'none'
}));
</script>

<template>
  <svg 
    class="svg-icon" 
    :style="style" 
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M3 3V11H11V3H3ZM9 9H5V5H9V9ZM3 13V21H11V13H3ZM9 19H5V15H9V19ZM13 3V11H21V3H13ZM19 9H15V5H19V9ZM13 13V21H21V13H13ZM19 19H15V15H19V19Z" />
  </svg>
</template>

<style scoped>
.svg-icon {
  display: inline-block;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
</style>