<template>
    <div class="view-toggle">
        <button :class="['view-btn', { 'active': viewMode === 'list' }]" @click="setViewMode('list')" title="列表视图">
            <Icon icon="icon-sys-list" size="20" />
        </button>
        <button :class="['view-btn', { 'active': viewMode === 'tiles' }]" @click="setViewMode('tiles')" title="平铺视图">
            <Icon icon="icon-sys-tiles" size="20" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import Icon from '@/components/Icon.vue';

interface Props {
    viewMode: 'list' | 'tiles';
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:viewMode': ['list' | 'tiles'];
}>();

const setViewMode = (mode: 'list' | 'tiles') => {
    emit('update:viewMode', mode);
};
</script>

<style scoped>
.view-toggle {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.view-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.view-btn:hover {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
}

.view-btn.active {
    background-color: #e0f2fe;
    border-color: #7dd3fc;
    color: #0ea5e9;
}
</style>