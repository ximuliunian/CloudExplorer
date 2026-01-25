<template>
    <div class="file-explorer">
        <!-- 工具栏 -->
        <Toolbar 
            :breadcrumb="breadcrumb"
            :view-mode="viewMode"
            @update:viewMode="viewMode = $event"
            @back="goBack"
            @navigate="navigateTo"
        />

        <!-- 文件浏览器主体 -->
        <div class="explorer-body">
            <!-- 列表视图 -->
            <ListView 
                v-if="viewMode === 'list'"
                :folders="currentFolders"
                :files="currentFiles"
                @openFolder="openFolder"
                @openFile="openFile"
            />

            <!-- 平铺视图 -->
            <TilesView 
                v-else
                :folders="currentFolders"
                :files="currentFiles"
                @openFolder="openFolder"
                @openFile="openFile"
            />

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-overlay">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <div class="loading-text">加载中...</div>
                </div>
            </div>
        </div>

        <!-- 状态栏 -->
        <StatusBar 
            :folder-count="currentFolders.length"
            :file-count="currentFiles.filter(item => item.type === 'file').length"
            :url-count="currentFiles.filter(item => item.type === 'url').length"
        />
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
import Toolbar from './subcomponents/Toolbar.vue';
import ListView from './subcomponents/ListView.vue';
import TilesView from './subcomponents/TilesView.vue';
import StatusBar from './subcomponents/StatusBar.vue';

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
const pathJsonLoaded = ref(false); // 标记path.json是否加载完成

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
    switch (file.type) {
        case 'file':
            // 构建新的路由参数
            const newUrlParams = [...handleBreadcrumb(), `${file.name}.f`];
            // 添加时间戳作为查询参数
            const timestamp = Date.now();

            router.push({
                name: 'home',
                params: { urlParams: newUrlParams },
                query: { timestamp: timestamp.toString() }
            });
            break;

        case 'url':
            window.open(file.json_name);
            break;
    }
};

// 获取内容图标 - 已移动到子组件中

// 处理面包屑导航路径
const handleBreadcrumb = () => {
    return breadcrumb.value.slice(1);
};

// 加载内容（异步方式）
const loadContent = async () => {
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

    pathJsonLoaded.value = true; // 标记path.json加载完成
    handlePathChange(HandleRouter.getUrlParams()); // 加载完成后处理当前路由

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
const handleSecretPath = async (md5: string) => {
    try {
        const resp = await getPathByName(md5);
        const data = resp.data as PathTree;
        if (!data) {
            await handlePathChange(HandleRouter.getUrlParams());
            return;
        }

        virtualRoot.value = {
            name: '所有位置',
            children: data.children || [],
            files: data.files || []
        };

        // 加载完秘笈版本path后，立即更新当前文件信息
        await handlePathChange(HandleRouter.getUrlParams());
    } catch (error) {
        console.error('加载秘笈版本path失败:', error);
        await handlePathChange(HandleRouter.getUrlParams());
    }
}


// 监听路由变化
const handlePathChange = async (pathList: string[], newPath?: string | undefined, oldPath?: string | undefined) => {
    if (!pathJsonLoaded.value) {
        console.log('path.json 尚未加载完成，等待加载后处理路由');
        return; // 如果path.json还没加载完成，直接返回，等待加载完成后再处理
    }

    // 检查是否有有效的密钥，如果有，确保已加载被保护资源路径
    const md5 = HandleSecret.getMd5();
    if (md5) {
        // 如果已有被保护资源路径，则直接处理路由
        // 如果没有或资源可能不完整，则重新获取
        try {
            const resp = await getPathByName(md5);
            const data = resp.data as PathTree;
            if (data) {
                virtualRoot.value = {
                    name: '所有位置',
                    children: data.children || [],
                    files: data.files || []
                };
            }
        } catch (error) {
            console.error('获取被保护资源路径失败:', error);
        } finally {
            // 处理路由变化
            await processPathChange(pathList, newPath, oldPath);
        }
    } else {
        // 没有密钥，直接处理路由
        await processPathChange(pathList, newPath, oldPath);
    }
};

// 处理路由变化的实际逻辑
const processPathChange = async (pathList: string[], newPath?: string | undefined, oldPath?: string | undefined) => {
    if (!pathList) return;

    let fileName = null;
    // 判断最后一个元素是否以 .f 结尾
    if (pathList.length > 0 && pathList[pathList.length - 1].endsWith('.f')) {
        fileName = pathList.pop(); // 移除.f 结尾的元素
    }

    breadcrumb.value = [breadcrumb.value[0], ...pathList]
    await loadContent(); // 等待loadContent完成，确保currentFiles已更新

    // 如果有文件名，打开文件
    if (fileName) {
        const file = currentFiles.value.find(f => f.name === fileName.replace('.f', ''));
        if (file) {
            // 从新的path中获取文件信息，包含完整的is_secret标记
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