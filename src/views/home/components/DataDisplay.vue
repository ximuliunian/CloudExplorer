<template>
    <div class="file-explorer">
        <!-- 工具栏 -->
        <Toolbar :breadcrumb="breadcrumb" :view-mode="viewMode" @update:viewMode="viewMode = $event" @back="goBack"
            @navigate="navigateTo" />

        <!-- 文件浏览器主体 -->
        <div class="explorer-body">
            <!-- 列表视图 -->
            <ListView v-if="viewMode === 'list'" :folders="currentFolders" :files="currentFiles"
                @openFolder="openFolder" @openFile="openFile" />

            <!-- 平铺视图 -->
            <TilesView v-else :folders="currentFolders" :files="currentFiles" @openFolder="openFolder"
                @openFile="openFile" />

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-overlay">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <div class="loading-text">加载中...</div>
                </div>
            </div>
        </div>

        <!-- 状态栏 -->
        <StatusBar :folder-count="currentFolders.length"
            :file-count="currentFiles.filter(item => item.type === 'file').length"
            :url-count="currentFiles.filter(item => item.type === 'url').length" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type PathTree from '@/types/PathTree';
import type { FileDetail } from '@/types/PathTree';
import { useRouter } from 'vue-router';
import HandleRouter from '@/hooks/handle/HandleRouter';
import { notification } from '@/utils/notify';
import Toolbar from './subcomponents/Toolbar.vue';
import ListView from './subcomponents/ListView.vue';
import TilesView from './subcomponents/TilesView.vue';
import StatusBar from './subcomponents/StatusBar.vue';
import { useBaseShowInfoStore } from '@/stores/BaseShowInfo';
import HandleSecret from '@/hooks/handle/HandleSecret';

// 路由
const router = useRouter();

// 当前视图模式
const viewMode = ref<'list' | 'tiles'>('list');

// 当前显示的文件夹和文件
const currentFolders = ref<PathTree[]>([]);
const currentFiles = ref<FileDetail[]>([]);
// 系统展示信息
const baseShowInfoStore = useBaseShowInfoStore();
// 面包屑导航路径
const breadcrumb = ref<string[]>([baseShowInfoStore.pathTreeInfo.name]);
// 加载状态
const loading = ref(false);

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

// 处理面包屑导航路径
const handleBreadcrumb = () => {
    return breadcrumb.value.slice(1);
};

// 打开文件
const openFile = (file: FileDetail) => {
    switch (file.type) {
        case 'file':
            router.push({
                name: 'display',
                params: {
                    urlParams: [...HandleRouter.getUrlParams()],
                    fileName: file.name
                },
            });
            break;

        case 'url':
            window.open(file.json_name);
            break;
    }
};


// 加载内容（异步方式）
const loadContent = async () => {
    loading.value = true;

    try {
        // 根目录
        if (breadcrumb.value.length === 1) {
            currentFolders.value = baseShowInfoStore.pathTreeInfo.children || [];
            currentFiles.value = baseShowInfoStore.pathTreeInfo.files || [];
        }
        // 子目录
        else {
            // 从虚拟根节点的子节点开始查找
            let current: PathTree[] = baseShowInfoStore.pathTreeInfo.children || [];
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
    HandleRouter.registerPathChangeCallback(processPathChange)
    HandleSecret.registerCheckSuccessCallback(async MD5 => {
        await baseShowInfoStore.initPathTreeInfo(MD5);
        await loadContent()
    })

    loading.value = true;
    await loadContent(); // 直接调用loadContent加载内容

    await processPathChange(HandleRouter.getUrlParams()); // 加载完成后处理当前路由
});

// 处理路由变化的实际逻辑
const processPathChange = async (pathList: string[]) => {
    if (!pathList) return;
    breadcrumb.value = [breadcrumb.value[0], ...pathList]
    loadContent();
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

.explorer-body {
    flex: 1;
    overflow: auto;
    position: relative;
    background-color: #ffffff;
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
</style>