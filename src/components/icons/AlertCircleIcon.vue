<!-- /components/icons/AlertCircleIcon.vue -->
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
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" />
  </svg>
</template>

<style scoped>
.svg-icon {
  display: inline-block;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
</style>