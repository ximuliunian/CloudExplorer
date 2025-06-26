<template>
    <div class="file-explorer">
        <!-- 工具栏 -->
        <div class="toolbar">
            <div class="nav-controls">
                <button class="back-button" @click="goBack" v-if="breadcrumb.length > 1" title="返回上一级">
                    <Icon icon="icon-sys-left" size="20" />
                </button>
                <div class="breadcrumb">
                    <template v-for="(part, index) in breadcrumb" :key="index">
                        <span class="breadcrumb-item" @click="navigateTo(index)">{{ part }}</span>
                        <span v-if="index < breadcrumb.length - 1" class="breadcrumb-separator">&gt;</span>
                    </template>
                </div>
            </div>
            <div class="view-toggle">
                <button :class="['view-btn', { 'active': viewMode === 'list' }]" @click="viewMode = 'list'"
                    title="列表视图">
                    <Icon icon="icon-sys-list" size="20" />
                </button>
                <button :class="['view-btn', { 'active': viewMode === 'tiles' }]" @click="viewMode = 'tiles'"
                    title="平铺视图">
                    <Icon icon="icon-sys-tiles" size="20" />
                </button>
            </div>
        </div>

        <!-- 文件浏览器主体 -->
        <div class="explorer-body">
            <!-- 列表视图 -->
            <div v-if="viewMode === 'list'" class="list-view">
                <div class="table-container">
                    <table class="file-table">
                        <tbody>
                            <!-- 文件夹 -->
                            <tr v-for="folder in currentFolders" :key="'folder-' + folder.name" class="folder-item"
                                @click="openFolder(folder)">
                                <td class="name-col">
                                    <div class="item-name">
                                        <Icon icon="icon-sys-folder" size="25" />
                                        <span>{{ folder.name }}</span>
                                    </div>
                                </td>
                            </tr>

                            <!-- 文件 -->
                            <tr v-for="file in currentFiles" :key="'file-' + file.name" class="file-item"
                                :class="{ 'secret-file': file.is_secret }" @click="openFile(file)">
                                <td class="name-col">
                                    <div class="item-name">
                                        <Icon icon="icon-sys-file" size="25" />
                                        <span>{{ file.name }}</span>
                                        <Icon icon="icon-sys-lock" v-if="file.is_secret" size="14" class="lock-icon" />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 平铺视图 -->
            <div v-else class="tiles-view">
                <div v-for="folder in currentFolders" :key="'folder-' + folder.name" class="folder-tile"
                    @click="openFolder(folder)">
                    <div class="tile-content">
                        <Icon icon="icon-sys-folder" size="48" />
                        <div class="tile-name">{{ folder.name }}</div>
                    </div>
                </div>

                <div v-for="file in currentFiles" :key="'file-' + file.name" class="file-tile"
                    :class="{ 'secret-file': file.is_secret }" @click="openFile(file)">
                    <div class="tile-content">
                        <Icon icon="icon-sys-file" size="48" />
                        <div class="tile-name">
                            {{ file.name }}
                            <Icon icon="icon-sys-lock" v-if="file.is_secret" size="14" class="lock-icon" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-overlay">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <div class="loading-text">加载中...</div>
                </div>
            </div>
        </div>

        <!-- 状态栏 -->
        <div class="status-bar">
            <div class="status-item">
                <Icon icon="icon-sys-folder" size="14" />
                <span>{{ currentFolders.length }} 个文件夹</span>
            </div>
            <div class="status-item">
                <Icon icon="icon-sys-file" size="14" />
                <span>{{ currentFiles.length }} 个文件</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type PathTree from '@/types/PathTree';
import type { FileDetail } from '@/types/PathTree';
import { getPath, getPathByName } from '@/api/pathApi';
import { useRouter } from 'vue-router';
import HandleRouter from '@/hooks/handle/HandleRouter';
import { useFileInfoStore } from '@/stores/FileInfoStore';
import HandleSecret from '@/hooks/handle/HandleSecret';
import { notification } from '@/utils/notify';
import Icon from '@/components/Icon.vue';

// 路由
const router = useRouter();

// 当前视图模式
const viewMode = ref<'list' | 'tiles'>('list');

// 面包屑导航路径
const breadcrumb = ref<string[]>(['所有位置']);

// 当前显示的文件夹和文件
const currentFolders = ref<PathTree[]>([]);
const currentFiles = ref<FileDetail[]>([]);

// 文件信息
const fileInfoStore = useFileInfoStore();

// 加载状态
const loading = ref(false);

// 虚拟根节点
const virtualRoot = ref<PathTree>({
    name: '所有位置',
    children: [],
    files: []
});

// 导航到指定路径
const navigateTo = (level: number) => {
    breadcrumb.value = breadcrumb.value.slice(0, level + 1);
    router.push({ name: 'home', params: { urlParams: handleBreadcrumb() } });
    loadContent();
};

// 返回上一级
const goBack = () => {
    if (breadcrumb.value.length > 1) {
        breadcrumb.value.pop();
        router.push({ name: 'home', params: { urlParams: handleBreadcrumb() } });
        loadContent();
    }
};

// 打开文件夹
const openFolder = (folder: PathTree) => {
    breadcrumb.value.push(folder.name);
    router.push({ name: 'home', params: { urlParams: handleBreadcrumb() } });
    loadContent();
};

// 打开文件
const openFile = (file: FileDetail) => {
    router.push({
        name: 'home',
        params: { urlParams: [...handleBreadcrumb(), `${file.name}.f`] }
    });

    fileInfoStore.setFileDetails(HandleRouter.getUrlParams(), file);
};

// 处理面包屑导航路径
const handleBreadcrumb = () => {
    return breadcrumb.value.slice(1);
};

// 加载内容（同步方式）
const loadContent = () => {
    loading.value = true;

    try {
        // 根目录
        if (breadcrumb.value.length === 1) {
            currentFolders.value = virtualRoot.value.children || [];
            currentFiles.value = virtualRoot.value.files || [];
        }
        // 子目录
        else {
            // 从虚拟根节点的子节点开始查找
            let current: PathTree[] = virtualRoot.value.children || [];
            let targetFolder: PathTree | null = null;

            // 遍历面包屑路径 (跳过根节点)
            for (let i = 1; i < breadcrumb.value.length; i++) {
                const name = breadcrumb.value[i];
                const folder = current.find(item => item.name === name);

                if (folder) {
                    // 找到目标文件夹
                    if (i === breadcrumb.value.length - 1) {
                        targetFolder = folder;
                    }
                    // 继续深入子目录
                    else {
                        current = folder.children || [];
                    }
                } else {
                    targetFolder = null;
                    break;
                }
            }

            if (targetFolder) {
                currentFolders.value = targetFolder.children || [];
                currentFiles.value = targetFolder.files || [];
            } else {
                currentFolders.value = [];
                currentFiles.value = [];
            }
        }
    } catch (error) {
        notification.error('加载内容失败')
        currentFolders.value = [];
        currentFiles.value = [];
    } finally {
        loading.value = false;
    }
};

// 初始化加载根目录内容
onMounted(async () => {
    HandleRouter.registerPathChangeCallback(handlePathChange)

    loading.value = true;
    const data = (await getPath()).data;

    virtualRoot.value = {
        name: '所有位置',
        children: data.children || [],
        files: data.files || []
    };

    // 注册校验成功回调函数，当密钥被解密成功后，重新加载根目录内容
    HandleSecret.registerCheckSuccessCallback(handleSecretPath)

    // 注册校验回调函数，当密钥被解密失败后，重新加载根目录内容
    HandleSecret.registerCheckCallback((b: boolean) => {
        if (!b) {
            handlePathChange(HandleRouter.getUrlParams())
        }
    })
});

/**
 * 注册回调函数，当密钥被解密后，重新加载根目录内容
 */
const handleSecretPath = (md5: string) => {
    getPathByName(md5).then(resp => {
        const data = resp.data as PathTree;
        if (!data) {
            handlePathChange(HandleRouter.getUrlParams())
            return;
        }

        virtualRoot.value = {
            name: '所有位置',
            children: data.children || [],
            files: data.files || []
        };

        handlePathChange(HandleRouter.getUrlParams())
    })
}


// 监听路由变化
const handlePathChange = (pathList: string[], newPath?: string | undefined, oldPath?: string | undefined) => {
    loadContent();

    if (!pathList) return;

    let fileName = null;
    // 判断最后一个元素是否以 .f 结尾
    if (pathList.length > 0 && pathList[pathList.length - 1].endsWith('.f')) {
        fileName = pathList.pop(); // 移除.f 结尾的元素
    }

    breadcrumb.value = [breadcrumb.value[0], ...pathList]
    loadContent();

    // 如果有文件名，打开文件
    if (fileName) {
        const file = currentFiles.value.find(f => f.name === fileName.replace('.f', ''));
        if (file) {
            fileInfoStore.setFileDetails(HandleRouter.getUrlParams(), file);
            router.resolve({
                name: 'home',
                params: { urlParams: [...handleBreadcrumb(), `${file.name}.f`] }
            });
        } else {
            notification.error('文件不存在')
        }
    }
}
</script>

<style scoped>
.file-explorer {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

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

.explorer-body {
    flex: 1;
    overflow: auto;
    position: relative;
    background-color: #ffffff;
}

/* 列表视图样式 */
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

/* 平铺视图样式 */
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

/* 加载状态 */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
}

.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.loading-text {
    color: #64748b;
    font-weight: 500;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(59, 130, 246, 0.2);
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 状态栏 */
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
    .toolbar {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        padding: 10px;
    }

    .nav-controls {
        width: 100%;
    }

    .breadcrumb {
        font-size: 13px;
    }

    .breadcrumb-item {
        max-width: 120px;
        padding: 4px;
    }

    .tiles-view {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
        padding: 12px;
    }

    .file-table td {
        padding: 14px 16px;
    }

    .item-name {
        gap: 10px;
    }

    .tile-name {
        font-size: 13px;
    }
}

@media (max-width: 480px) {
    .breadcrumb-item {
        max-width: 80px;
    }

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