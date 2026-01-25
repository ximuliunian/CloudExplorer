<template>
    <div class="status-bar">
        <div class="status-item">
            <Icon icon="icon-sys-folder" size="14" />
            <span>{{ folderCount }} 个文件夹</span>
        </div>
        <div class="status-item">
            <Icon icon="icon-sys-file" size="14" />
            <span>{{ fileCount }} 个文件</span>
        </div>
        <div class="status-item">
            <Icon icon="icon-sys-url" size="14" />
            <span>{{ urlCount }} 个链接</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import Icon from '@/components/Icon.vue';

interface Props {
    folderCount: number;
    fileCount: number;
    urlCount: number;
}

const props = defineProps<Props>();
</script>

<style scoped>
.status-bar {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
    font-size: 12px;
    color: #64748b;
}

.status-item {
    padding: 0 8px;
    display: flex;
    align-items: center;
    gap: 4px;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .status-bar {
        padding: 8px 12px;
        font-size: 12px;
    }
}
</style>