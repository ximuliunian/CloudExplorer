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
    <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" />
  </svg>
</template>

<style scoped>
.svg-icon {
  display: inline-block;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
</style>