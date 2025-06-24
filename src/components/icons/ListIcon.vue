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
    <path d="M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z" />
  </svg>
</template>

<style scoped>
.svg-icon {
  display: inline-block;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
</style>