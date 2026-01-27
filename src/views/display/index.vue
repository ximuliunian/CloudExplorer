<template>
    <div class="share-container" :class="{ 'secret-container': content?.is_secret }">
        <!-- 保密内容提示 -->
        <div v-if="content?.is_secret" class="secret-banner">
            <Icon icon="icon-sys-lock" size="21" />
            <span>此内容包含受保护信息，请勿在公共场合展示</span>
        </div>

        <!-- 标题和封面 -->
        <div class="content-header">
            <div class="cover-container">
                <div v-if="content?.cover" class="cover-icon">
                    <img :src="content.cover" alt="🤐">
                </div>
                <div v-else class="cover-placeholder">
                    <Icon icon="icon-sys-share-2" size="35" />
                </div>
            </div>

            <div class="header-content">
                <h1 class="title">{{ content?.title }}</h1>
                <p v-if="content?.summary" class="summary">{{ content.summary }}</p>
            </div>
        </div>

        <!-- 移动端操作栏 -->
        <div class="mobile-actions">
            <button class="mobile-btn" @click="goBack" v-if="isMobileView">
                <Icon icon="icon-sys-left" size="21" />
                <span>返回</span>
            </button>
            <button class="mobile-btn" @click="shareContent">
                <Icon icon="icon-sys-share" size="21" />
                <span>分享</span>
            </button>
            <button v-if="showIndex" class="mobile-btn" @click="toggleIndex">
                <Icon icon="icon-sys-index" size="21" />
                <span>索引</span>
            </button>
            <button class="mobile-btn" @click="toggleViewMode">
                <Icon :icon="viewMode === 'cards' ? 'icon-sys-list' : 'icon-sys-tiles'" size="21" />
                <span>{{ viewMode === 'cards' ? '列表' : '卡片' }}</span>
            </button>
        </div>

        <!-- 移动端索引抽屉 -->
        <div v-if="showIndex" class="mobile-index-container" :class="{ 'show': showMobileIndex }">
            <div class="index-header">
                <h3>内容索引</h3>
                <button @click="toggleIndex">
                    <Icon icon="icon-sys-wrong" size="25" />
                </button>
            </div>
            <div class="index-scroll">
                <div v-for="(group, index) in content?.file_url" :key="index" class="index-item"
                    @click="scrollToGroup(index); toggleIndex()">
                    <div class="index-icon">
                        <Icon icon="icon-sys-folder" size="25" />
                    </div>
                    <div class="index-info">
                        <div class="index-title">{{ group.title }}</div>
                        <div class="item-count">{{ group.content.length }} 项</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 桌面端索引目录 -->
        <div v-if="showIndex" class="index-container desktop-only">
            <div class="section-title">
                <i class="fas fa-list"></i>
                <span>内容索引</span>
            </div>
            <div class="index-grid">
                <div v-for="(group, index) in content?.file_url" :key="index" class="index-card"
                    @click="scrollToGroup(index)">
                    <div class="index-icon">
                        <Icon icon="icon-sys-folder" size="25" />
                    </div>
                    <div class="index-title">
                        {{ group.title }}
                        <span class="item-count">{{ group.content.length }} 项</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 描述内容插槽 (可选) -->
        <div v-if="content?.description && content?.description.length > 0" class="description-container">
            <div class="description-title">
                <Icon icon="icon-sys-content" size="25" />
                <span>内容介绍</span>
            </div>
            <MarkdownViewer :lines="content.description" />
        </div>

        <!-- 文件下载链接 -->
        <div class="file-section">
            <div class="section-header">
                <div class="section-title">
                    <Icon icon="icon-sys-download" size="25" />
                    <span>资源下载链接</span>
                </div>
                <div class="view-toggle desktop-only">
                    <button :class="['view-btn', { 'active': viewMode === 'cards' }]" @click="viewMode = 'cards'"
                        title="卡片视图">
                        <Icon icon="icon-sys-tiles" size="20" />
                    </button>
                    <button :class="['view-btn', { 'active': viewMode === 'list' }]" @click="viewMode = 'list'"
                        title="列表视图">
                        <Icon icon="icon-sys-list" size="20" />
                    </button>
                </div>
            </div>

            <!-- 卡片视图 -->
            <div v-if="viewMode === 'cards'" class="file-cards">
                <div v-for="(group, groupIndex) in content?.file_url" :key="groupIndex" class="file-group"
                    :class="{ 'secret-file': content?.is_secret, 'highlighted': highlightedGroup === groupIndex }"
                    :id="`group-${groupIndex}`">
                    <div class="group-header">
                        <div class="group-title">
                            <Icon icon="icon-sys-folder-1" size="20" />
                            <span>{{ group.title }}</span>
                            <span class="group-index">#{{ groupIndex + 1 }}</span>
                        </div>
                        <button v-if="group.content.length > 0" class="copy-all-btn" @click="copyGroupLinks(group)">
                            <Icon icon="icon-sys-copy" size="20" />
                            <span class="desktop-only">复制全部链接</span>
                        </button>
                    </div>

                    <div class="file-list">
                        <a v-for="(item, itemIndex) in group.content" :key="itemIndex" :href="item.url" target="_blank"
                            class="file-item">
                            <div class="file-info">
                                <div class="file-name">
                                    <span class="item-index">{{ groupIndex + 1 }}.{{ itemIndex + 1 }}</span>
                                    {{ item.name }}
                                </div>
                                <div class="file-url">{{ item.url }}</div>
                            </div>
                            <div class="external-icon">
                                <Icon icon="icon-sys-share-1" size="20" />
                            </div>
                            <button class="copy-btn" @click.prevent="copyLink(item.url)">
                                <Icon icon="icon-sys-copy" size="25" />
                            </button>
                        </a>
                    </div>
                </div>
            </div>

            <!-- 列表视图 - 移动端优化 -->
            <div v-else class="file-list-view">
                <div class="list-container">
                    <div v-for="(group, groupIndex) in content?.file_url" :key="groupIndex" class="list-group"
                        :class="{ 'highlighted': highlightedGroup === groupIndex }" :id="`group-${groupIndex}`">
                        <div class="list-group-header">
                            <div class="group-title">
                                <Icon icon="icon-sys-folder-1" size="20" />
                                <span>{{ group.title }}</span>
                                <span class="group-index">#{{ groupIndex + 1 }}</span>
                            </div>
                            <button v-if="group.content.length > 0" class="copy-all-btn" @click="copyGroupLinks(group)">
                                <Icon icon="icon-sys-copy" size="20" />
                                <span class="desktop-only">复制全部链接</span>
                            </button>
                        </div>

                        <div class="list-items">
                            <a v-for="(item, itemIndex) in group.content" :key="itemIndex" :href="item.url"
                                target="_blank" class="list-item">
                                <div class="mobile-item-index">{{ groupIndex + 1 }}.{{ itemIndex + 1 }}</div>
                                <div class="item-info">
                                    <div class="item-name">{{ item.name }}</div>
                                    <div class="item-url">{{ item.url }}</div>
                                </div>
                                <div class="item-actions">
                                    <button class="copy-btn" @click.prevent="copyLink(item.url)">
                                        <Icon icon="icon-sys-copy" size="25" />
                                    </button>
                                    <div class="external-icon">
                                        <Icon icon="icon-sys-share-1" size="20" />
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部操作栏 - 桌面端 -->
        <div class="action-bar desktop-only">
            <button class="action-btn back-btn" @click="goBack" v-if="!isMobileView">
                <Icon icon="icon-sys-left" size="25" />
                返回上一级
            </button>
            <button class="action-btn" @click="shareContent">
                <Icon icon="icon-sys-share" size="25" />
                分享此内容
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type ShareContent from '@/types/ShareContent';
import type { FileUrl } from '@/types/ShareContent';
import { notification } from '@/utils/notify';
import { getFile, getSecretFile } from '@/api/filesApi';
import HandleSecret from '@/hooks/handle/HandleSecret';
import { useRouter } from 'vue-router';
import MarkdownViewer from '@/components/MarkdownViewer.vue';
import Icon from '@/components/Icon.vue';
import HandleRouter from '@/hooks/handle/HandleRouter';
import { useBaseShowInfoStore } from '@/stores/BaseShowInfo';
import type { FileDetail } from '@/types/PathTree';

// 视图模式
const viewMode = ref('cards'); // 'cards' 或 'list'
const showIndex = computed(() => (content.value?.file_url?.length ?? 0) > 1);
const showMobileIndex = ref(false);
const highlightedGroup = ref<number | null>(null);
const isMobileView = ref(false);
const baseShowInfoStore = useBaseShowInfoStore();   // 基础显示信息
const content = ref<ShareContent>();
const router = useRouter();  // 路由

// 复制单个链接
const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
        notification.success('链接已复制到剪贴板');
    }).catch(err => {
        notification.error('复制失败，请手动复制');
    });
};

// 复制整个分组链接
const copyGroupLinks = (group: FileUrl) => {
    const links = group.content.map(item => `${item.name}: ${item.url}`).join('\n');
    navigator.clipboard.writeText(links).then(() => {
        notification.success(`"${content.value?.title}" 的 "${group.title}" 的所有链接已复制`);
    }).catch(err => {
        notification.error('复制失败，请手动复制');
    });
};

// 分享内容（复制当前URL）
const shareContent = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
        notification.success('内容链接已复制到剪贴板');
    }).catch(err => {
        notification.error('复制失败，请手动复制');
    })
};

// 滚动到指定分组
const scrollToGroup = (index: number) => {
    highlightedGroup.value = index;
    const element = document.getElementById(`group-${index}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 3秒后移除高亮
        setTimeout(() => {
            highlightedGroup.value = null;
        }, 3000);
    }
};

// 切换移动端索引显示
const toggleIndex = () => {
    showMobileIndex.value = !showMobileIndex.value;
};

// 切换视图模式
const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'cards' ? 'list' : 'cards';
};

// 返回上一级
const goBack = () => {
    router.push({ name: 'home', params: { urlParams: [...HandleRouter.getUrlParams()] } });
};

// 检查窗口大小
const checkViewport = () => {
    isMobileView.value = window.innerWidth < 768;
};

// 获取数据内容
const getContent = async () => {
    // 等待 HandleSecret.isChecked() 返回有效值
    if (!HandleSecret.isChecked()) {
        await new Promise<void>(resolve => {
            const checkIsChecked = () => {
                if (HandleSecret.isChecked()) {
                    resolve();
                } else {
                    setTimeout(checkIsChecked, 100);
                }
            };
            checkIsChecked();
        });
    }

    // 等待 pathTreeInfoBool 完成初始化
    if (!baseShowInfoStore.pathTreeInfoBool) {
        await new Promise<void>(resolve => {
            const checkPathTreeInfo = () => {
                if (baseShowInfoStore.pathTreeInfoBool) {
                    resolve();
                } else {
                    setTimeout(checkPathTreeInfo, 100);
                }
            };
            checkPathTreeInfo();
        });
    }

    const fileDetails: FileDetail = baseShowInfoStore.currentResourceInfo;
    if (!fileDetails) {
        notification.error('资源不存在');
        goBack();
        return;
    }

    return fileDetails?.is_secret
        ? getSecretFile(fileDetails.json_name, HandleSecret.getMd5())
        : getFile(fileDetails!.json_name)
}

// 根据内容自动选择视图模式
onMounted(async () => {
    content.value = (await getContent())?.data;
    // 如果地址栏目标变量需要刷新重新获取数据
    HandleRouter.registerPathChangeCallback(async () => {
        content.value = (await getContent())?.data;
    });

    checkViewport();
    window.addEventListener('resize', checkViewport);

    // 移动设备默认使用列表视图
    if (isMobileView.value) {
        viewMode.value = 'list';
    }
    // 桌面设备：如果只有一个分组且内容少于4个，默认使用列表视图
    else if (content.value?.file_url?.length === 1 && content.value?.file_url[0].content.length <= 4) {
        viewMode.value = 'list';
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', checkViewport);
});
</script>

<style scoped>
/* 删除以下两行外部引用 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.share-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    max-width: 1000px;
    margin: 20px auto;
    color: #334155;
    position: relative;
}

/* 保密内容样式 */
.secret-container {
    box-shadow: 0 10px 25px -5px rgba(248, 113, 113, 0.15), 0 8px 10px -6px rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.2);
}

.secret-banner {
    background: linear-gradient(90deg, #fecaca, #f87171);
    color: #7f1d1d;
    padding: 15px 25px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    font-size: 16px;
}

.secret-banner i {
    font-size: 18px;
}

/* 头部内容 */
.content-header {
    padding: 20px;
    display: flex;
    gap: 20px;
    border-bottom: 1px solid #e2e8f0;
    position: relative;
}

@media (max-width: 768px) {
    .content-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 15px;
        padding: 15px;
    }
}

.cover-container {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
}

.cover-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.cover-icon {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
}

.cover-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #e0f2fe, #bae6fd);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0ea5e9;
    font-size: 32px;
}

.header-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 10px;
    color: #0f172a;
    line-height: 1.3;
}

@media (min-width: 768px) {
    .title {
        font-size: 28px;
    }
}

.summary {
    font-size: 16px;
    color: #64748b;
    line-height: 1.6;
    max-width: 800px;
}

/* 移动端操作栏 */
.mobile-actions {
    display: flex;
    justify-content: space-around;
    padding: 10px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 10;
}

@media (min-width: 769px) {
    .mobile-actions {
        display: none;
    }
}

.mobile-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: transparent;
    border: none;
    color: #334155;
    font-size: 12px;
    gap: 4px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 8px;
    transition: all 0.2s;
    min-width: 70px;
}

.mobile-btn:hover {
    background: #e2e8f0;
}

.mobile-btn i {
    font-size: 18px;
}

/* 移动端索引容器 */
.mobile-index-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 100;
    display: flex;
    flex-direction: column;
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.mobile-index-container.show {
    transform: translateY(0);
}

.index-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.index-header h3 {
    font-size: 20px;
    font-weight: 600;
    color: #0f172a;
}

.index-header button {
    background: transparent;
    border: none;
    font-size: 20px;
    color: #64748b;
    cursor: pointer;
}

.index-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
}

.index-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border-radius: 12px;
    background: #f8fafc;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.2s;
}

.index-item:hover {
    background: #e2e8f0;
}

.index-icon {
    width: 40px;
    height: 40px;
    background: #e0f2fe;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0ea5e9;
    font-size: 18px;
}

.index-info {
    flex: 1;
}

.index-title {
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 4px;
    font-size: 16px;
}

.item-count {
    font-size: 14px;
    color: #64748b;
}

/* 桌面端索引目录 */
.index-container {
    padding: 20px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
    .desktop-only {
        display: none;
    }
}

.section-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 15px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 10px;
}

.index-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
}

.index-card {
    background: white;
    border-radius: 12px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
}

.index-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
}

/* 描述内容 */
.description-container {
    padding: 20px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
    .description-container {
        padding: 15px;
    }
}

.description-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 10px;
}

/* 文件下载区域 */
.file-section {
    padding: 20px;
}

@media (max-width: 768px) {
    .file-section {
        padding: 15px;
    }
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.view-toggle {
    display: flex;
    gap: 8px;
}

.view-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.2s;
}

.view-btn:hover {
    background: #e2e8f0;
    color: #0ea5e9;
}

.view-btn.active {
    background: #0ea5e9;
    color: white;
    border-color: #0ea5e9;
}

.file-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.file-group {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 20px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    border: 1px solid #e2e8f0;
}

.file-group.highlighted {
    animation: highlight 1.5s ease;
    border: 2px solid #0ea5e9;
}

@keyframes highlight {
    0% {
        box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4);
    }

    50% {
        box-shadow: 0 0 0 10px rgba(14, 165, 233, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(14, 165, 233, 0);
    }
}

.group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
    gap: 12px;
}

.group-title {
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.group-index {
    background: #e0f2fe;
    color: #0ea5e9;
    font-size: 13px;
    padding: 2px 8px;
    border-radius: 20px;
    margin-left: 6px;
    white-space: nowrap;
}

.copy-all-btn {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.copy-all-btn:hover {
    background: #e2e8f0;
}

.file-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.file-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    background: #f8fafc;
    transition: all 0.2s;
    text-decoration: none;
    color: #334155;
    border: 1px solid #e2e8f0;
    position: relative;
    gap: 12px;
}

.file-item:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateX(3px);
}

.file-info {
    flex: 1;
    min-width: 0;
}

.file-name {
    font-weight: 500;
    margin-bottom: 4px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    flex-wrap: wrap;
}

.item-index {
    background: #e0f2fe;
    color: #0ea5e9;
    font-size: 11px;
    font-weight: 600;
    width: 36px;
    height: 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.file-url {
    font-size: 13px;
    color: #64748b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-left: 44px;
}

.external-icon {
    color: #94a3b8;
    font-size: 16px;
    margin-left: auto;
}

.copy-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
}

.copy-btn:hover {
    background: #e2e8f0;
    color: #0ea5e9;
}

/* 列表视图 - 移动端优化 */
.file-list-view {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
}

.list-group {
    border-bottom: 1px solid #e2e8f0;
}

.list-group.highlighted {
    animation: highlight 1.5s ease;
    border-left: 3px solid #0ea5e9;
}

.list-group:last-child {
    border-bottom: none;
}

.list-group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    flex-wrap: wrap;
    gap: 10px;
}

.list-items {
    padding: 8px 0;
}

.list-item {
    display: flex;
    padding: 12px 15px;
    text-decoration: none;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
    align-items: center;
    gap: 10px;
}

.list-item:last-child {
    border-bottom: none;
}

.list-item:hover {
    background: #f8fafc;
}

.mobile-item-index {
    background: #e0f2fe;
    color: #0ea5e9;
    font-size: 12px;
    font-weight: 600;
    width: 36px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.item-info {
    flex: 1;
    min-width: 0;
}

.item-name {
    font-weight: 500;
    color: #0f172a;
    font-size: 15px;
    margin-bottom: 4px;
}

.item-url {
    font-size: 13px;
    color: #64748b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.item-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* 操作栏 */
.action-bar {
    display: flex;
    justify-content: center;
    padding: 20px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    gap: 15px;
}

.action-btn {
    background: #0ea5e9;
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
}

.action-btn:hover {
    background: #0284c7;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(2, 132, 199, 0.2);
}

.back-btn {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
}

.back-btn:hover {
    background: #e2e8f0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

/* 响应式调整 */
@media (max-width: 768px) {
    .file-cards {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .content-header {
        padding: 15px;
    }

    .title {
        font-size: 22px;
    }

    .index-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }

    .file-group {
        padding: 15px;
    }

    .file-item {
        padding: 10px;
    }

    .file-url {
        display: none;
    }

    .list-item {
        padding: 10px 12px;
    }

    .item-url {
        display: none;
    }

    .copy-all-btn span {
        display: none;
    }

    .group-title {
        font-size: 16px;
        flex-wrap: wrap;
        gap: 6px;
    }

    .group-index {
        margin-left: 4px;
    }

    .file-name {
        font-size: 14px;
    }

    .description-container,
    .file-section {
        padding: 15px;
    }

    /* 移动端分组标题优化 */
    .group-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .list-group-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .group-title,
    .list-group-header .group-title {
        width: 100%;
    }

    .copy-all-btn {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .list-item {
        gap: 8px;
    }

    .item-actions {
        flex-direction: column;
        gap: 5px;
    }

    .title {
        font-size: 20px;
    }

    .summary {
        font-size: 14px;
    }

    .mobile-actions {
        padding: 8px 5px;
    }

    .mobile-btn {
        min-width: 60px;
        padding: 5px;
        font-size: 11px;
    }

    .file-name {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .item-index {
        margin-right: 0;
    }

    /* 图标响应式调整 */
    .file-section .section-title svg,
    .file-group .group-title svg,
    .list-group .group-title svg {
        width: 18px !important;
        height: 18px !important;
    }

    .file-item .external-icon svg,
    .file-item .copy-btn svg,
    .list-item .copy-btn svg {
        width: 20px !important;
        height: 20px !important;
    }

    /* 文件项布局优化 */
    .file-item {
        flex-wrap: wrap;
        gap: 8px;
        position: relative;
        padding-right: 70px;
        /* 为右侧图标留出空间 */
    }

    .file-info {
        width: 100%;
    }

    .file-name {
        margin-bottom: 0;
    }

    .external-icon,
    .copy-btn {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
    }

    .external-icon {
        right: 45px;
    }

    .list-item {
        flex-wrap: wrap;
        position: relative;
        padding: 15px 10px 15px 50px;
        /* 为左侧索引和右侧图标留出空间 */
        align-items: center;
    }

    .mobile-item-index {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
    }

    .item-info {
        width: calc(100% - 60px);
        /* 减去图标区域宽度 */
    }

    .item-actions {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        flex-direction: row;
        gap: 15px;
    }
}
</style>