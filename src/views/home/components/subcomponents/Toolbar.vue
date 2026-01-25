<template>
    <div class="toolbar">
        <div class="nav-controls">
            <button class="back-button" @click="$emit('back')" v-if="breadcrumb.length > 1" title="返回上一级">
                <Icon icon="icon-sys-left" size="20" />
            </button>
            <Breadcrumb :breadcrumb="breadcrumb" @navigate="handleNavigate" />
        </div>
        <div class="view-toggle">
            <button :class="['view-btn', { 'active': viewMode === 'list' }]" @click="$emit('update:viewMode', 'list')" title="列表视图">
                <Icon icon="icon-sys-list" size="20" />
            </button>
            <button :class="['view-btn', { 'active': viewMode === 'tiles' }]" @click="$emit('update:viewMode', 'tiles')" title="平铺视图">
                <Icon icon="icon-sys-tiles" size="20" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import Icon from '@/components/Icon.vue';
import Breadcrumb from './Breadcrumb.vue';

interface Props {
    breadcrumb: string[];
    viewMode: 'list' | 'tiles';
}

const props = defineProps<Props>();

const emit = defineEmits<{
    back: [];
    navigate: [level: number];
    'update:viewMode': ['list' | 'tiles'];
}>();

const handleNavigate = (level: number) => {
    emit('navigate', level);
};
</script>

<style scoped>
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.nav-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
}

.back-button {
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
    flex-shrink: 0;
}

.back-button:hover {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
}

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

/* 移动端适配 */
@media (max-width: 768px) {
    .toolbar {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        padding: 10px;
    }

    .nav-controls {
        width: 100%;
    }
}
</style>