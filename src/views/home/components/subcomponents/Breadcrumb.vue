<template>
    <div class="breadcrumb">
        <template v-for="(part, index) in breadcrumb" :key="index">
            <span class="breadcrumb-item" @click="handleNavigate(index)">{{ part }}</span>
            <span v-if="index < breadcrumb.length - 1" class="breadcrumb-separator">&gt;</span>
        </template>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface Props {
    breadcrumb: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
    navigate: [level: number];
}>();

const handleNavigate = (level: number) => {
    emit('navigate', level);
};
</script>

<style scoped>
.breadcrumb {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #334155;
    flex-wrap: wrap;
    min-width: 0;
    line-height: 1.5;
}

.breadcrumb-item {
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 4px;
    transition: background-color 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
}

.breadcrumb-item:hover {
    background-color: #e2e8f0;
}

.breadcrumb-item:last-child {
    font-weight: 600;
    color: #1e293b;
    cursor: default;
}

.breadcrumb-item:last-child:hover {
    background-color: transparent;
}

.breadcrumb-separator {
    padding: 0 4px;
    cursor: default;
    color: #94a3b8;
    user-select: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .breadcrumb {
        font-size: 13px;
    }

    .breadcrumb-item {
        max-width: 120px;
        padding: 4px;
    }
}

@media (max-width: 480px) {
    .breadcrumb-item {
        max-width: 80px;
    }
}
</style>