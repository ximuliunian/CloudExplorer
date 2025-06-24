<template>
    <svg :style="style" aria-hidden="true" fill="currentColor">
        <use :xlink:href='`#${icon}`'></use>
    </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    icon: {
        type: String,
        required: true
    },
    size: {
        type: [Number, String],
        default: 24
    },
    rotate: {
        type: [Number, String],
        default: 0
    }
})

const style = computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    transform: props.rotate ? `rotate(${props.rotate}deg)` : 'none'
}));
</script>

<style scoped></style>