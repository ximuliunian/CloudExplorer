<template>
    <div class="list-view">
        <div class="table-container">
            <table class="file-table">
                <tbody>
                    <!-- 文件夹 -->
                    <tr v-for="folder in folders" :key="'folder-' + folder.name" class="folder-item" @click="handleOpenFolder(folder)">
                        <td class="name-col">
                            <div class="item-name">
                                <Icon :icon="getContentIcon('dir')" size="25" />
                                <span>{{ folder.name }}</span>
                            </div>
                        </td>
                    </tr>

                    <!-- 文件 -->
                    <tr v-for="file in files" :key="'file-' + file.name" class="file-item" :class="{ 'secret-file': file.is_secret }" @click="handleOpenFile(file)">
                        <td class="name-col">
                            <div class="item-name">
                                <Icon :icon="getContentIcon(file.type)" size="25" />
                                <span>{{ file.name }}</span>
                                <Icon icon="icon-sys-lock" v-if="file.is_secret" size="14" class="lock-icon" />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type PathTree from '@/types/PathTree';
import type { FileDetail } from '@/types/PathTree';
import Icon from '@/components/Icon.vue';

interface Props {
    folders: PathTree[];
    files: FileDetail[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
    openFolder: [folder: PathTree];
    openFile: [file: FileDetail];
}>();

// 获取内容图标
const getContentIcon = (type: string): string => {
    switch (type) {
        case 'file': return 'icon-sys-file';
        case 'dir': return 'icon-sys-folder';
        case 'url': return 'icon-sys-url';
        default: return 'icon-sys-unknown';
    }
}

const handleOpenFolder = (folder: PathTree) => {
    emit('openFolder', folder);
};

const handleOpenFile = (file: FileDetail) => {
    emit('openFile', file);
};
</script>

<style scoped>
.list-view {
    width: 100%;
    height: 100%;
}

.table-container {
    height: 100%;
    overflow: auto;
}

.file-table {
    width: 100%;
    border-collapse: collapse;
}

.file-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
}

.name-col {
    width: 100%;
}

.folder-item,
.file-item {
    cursor: pointer;
    transition: background-color 0.2s;
}

.folder-item:hover,
.file-item:hover {
    background-color: #f8fafc;
}

.item-name {
    display: flex;
    align-items: center;
    gap: 12px;
}

.lock-icon {
    margin-left: 8px;
}

.secret-file {
    background-color: #fff5f5;
}

.secret-file:hover {
    background-color: #ffebeb;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .file-table td {
        padding: 14px 16px;
    }

    .item-name {
        gap: 10px;
    }
}
</style>