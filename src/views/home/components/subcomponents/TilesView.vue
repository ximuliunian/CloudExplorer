<template>
    <div class="tiles-view">
        <div v-for="folder in folders" :key="'folder-' + folder.name" class="folder-tile" @click="handleOpenFolder(folder)">
            <div class="tile-content">
                <Icon :icon="getContentIcon('dir')" size="48" />
                <div class="tile-name">{{ folder.name }}</div>
            </div>
        </div>

        <div v-for="file in files" :key="'file-' + file.name" class="file-tile" :class="{ 'secret-file': file.is_secret }" @click="handleOpenFile(file)">
            <div class="tile-content">
                <Icon :icon="getContentIcon(file.type)" size="48" />
                <div class="tile-name">
                    {{ file.name }}
                    <Icon icon="icon-sys-lock" v-if="file.is_secret" size="14" class="lock-icon" />
                </div>
            </div>
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
.tiles-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
    padding: 16px;
}

.folder-tile,
.file-tile {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    height: 140px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

.folder-tile:hover,
.file-tile:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
}

.tile-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: 100%;
    justify-content: center;
}

.tile-name {
    font-weight: 500;
    color: #1e293b;
    word-break: break-all;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    width: 100%;
    justify-content: center;
    font-size: 14px;
}

.lock-icon {
    margin-left: 4px;
}

.file-tile.secret-file {
    background-color: #fff5f5;
    border-color: #fee2e2;
}

.file-tile.secret-file:hover {
    background-color: #ffebeb;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .tiles-view {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
        padding: 12px;
    }

    .tile-name {
        font-size: 13px;
    }
}

@media (max-width: 480px) {
    .tiles-view {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    .tile-content {
        padding: 12px 8px;
    }

    .folder-tile,
    .file-tile {
        height: 120px;
    }
}
</style>