<template>
    <div class="search-container" :class="{ 'focused': isFocused }">
        <!-- 遮罩层 - 只要输入框有焦点就显示 -->
        <div v-if="isFocused" class="overlay-mask" @click="handleBlur"></div>

        <div class="search-bar">
            <div class="search-input-wrapper">
                <!-- 搜索图标容器 -->
                <div class="icon-container">
                    <Icon icon="icon-sys-search" size="20" />
                </div>

                <input ref="searchInput" type="text" v-model="searchQuery" placeholder="搜索文件或目录..." @input="handleInput"
                    @keyup.enter="handleSearch" @focus="handleFocus" />

                <button v-if="searchQuery" class="clear-button" @mousedown.prevent @click="clearSearch">
                    <Icon icon="icon-sys-wrong" size="20" />
                </button>
            </div>

            <button class="search-button" @mousedown.prevent @click="handleSearch">
                <span>搜索</span>
                <Icon icon="icon-sys-xia" size="20" rotate="180" />
            </button>
        </div>

        <transition name="slide-fade">
            <div class="suggestions-container" v-if="(suggestions.length > 0 || searching) && isFocused">
                <div v-if="searching" class="searching-indicator">
                    <div class="spinner"></div>
                    <span>正在搜索...</span>
                </div>
                <div v-else>
                    <div class="suggestions-header">
                        <span>搜索结果</span>
                        <span class="results-count">{{ suggestions.length }} 个匹配项</span>
                    </div>
                    <ul class="suggestions">
                        <li v-for="(item, index) in suggestions" :key="index" @click="selectSuggestion(item)"
                            :class="{ 'secret-item': item.is_secret }">
                            <div class="item-icon">
                                <Icon :icon="getContentIcon(item.type)" size="24" />
                            </div>
                            <div class="item-details">
                                <div class="name-row">
                                    <span class="item-name" v-html="highlightMatch(item.name, searchQuery)"></span>
                                    <Icon icon="icon-sys-lock" size="16" class="lock-icon" />
                                </div>
                                <span class="item-path">{{ item.path }}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSearch, getSearchByName } from '@/api/searchApi';
import type SearchList from '@/types/SearchList';
import HandleSecret from '@/hooks/handle/HandleSecret';
import { useRouter } from 'vue-router';
import Icon from '@/components/Icon.vue';

const searchQuery = ref('');    // 搜索查询
const suggestions = ref<SearchList[]>([]);  // 搜索建议
const searchData = ref<SearchList[]>([]);   // 搜索数据
const searching = ref(false);   // 搜索状态
const isFocused = ref(false);   // 输入框焦点状态
const searchInput = ref<HTMLInputElement | null>(null); // 输入框引用
let debounceTimer: number | null = null;    // 防抖定时器
const router = useRouter() // 路由实例

onMounted(async () => {
    const res = await getSearch();
    searchData.value = res.data;

    // 初始化输入框引用
    searchInput.value = document.querySelector('#searchInput') as HTMLInputElement;
    // 添加全局点击事件监听器
    document.addEventListener('click', handleDocumentClick);

    HandleSecret.registerCheckSuccessCallback(handleSecretSearch)
});

// 全局点击事件处理
const handleDocumentClick = (event: MouseEvent) => {
    if (!isFocused.value) return;

    // 检查点击是否在搜索组件内部
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(event.target as Node)) {
        handleBlur();
    }
};

// 处理输入框获得焦点
const handleFocus = () => {
    isFocused.value = true;
    if (searchQuery.value) {
        handleInput();
    }
};

// 处理输入框失去焦点
const handleBlur = () => {
    isFocused.value = false;
    suggestions.value = [];
};

// 获取内容图标
const getContentIcon = (type: string): string => {
    switch (type) {
        case 'file': return 'icon-sys-file';
        case 'dir': return 'icon-sys-folder';
        case 'url': return 'icon-sys-url';
        default: return 'icon-sys-unknown';
    }
}

// 防抖函数
const handleInput = () => {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    searching.value = true;

    // 如果查询为空，清空建议并返回
    debounceTimer = setTimeout(() => {
        if (!searchQuery.value.trim()) {
            suggestions.value = [];
            searching.value = false;
            return;
        }

        const query = searchQuery.value.toLowerCase();
        suggestions.value = searchData.value.filter(item =>
            item.name.toLowerCase().includes(query)
        );

        searching.value = false;
    }, 300);
};

// 搜索按钮点击事件
const handleSearch = () => {
    if (searchQuery.value.trim()) {
        HandleSecret.checkSecret(searchQuery.value)
        handleInput();

        // 保持输入框焦点
        if (searchInput.value) {
            searchInput.value.focus();
        }
    }
};

// 触发隐秘文件搜索
const handleSecretSearch = (md5: string) => {
    getSearchByName(md5).then(resp => searchData.value = resp.data)
}

// 选择建议
const selectSuggestion = (item: SearchList) => {
    router.push({ name: 'home', params: { urlParams: item.path.split('/') } })
};

// 高亮匹配文本
const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
};

// 清除搜索栏内容
const clearSearch = () => {
    searchQuery.value = '';
    suggestions.value = [];
    searching.value = false;

    // 清除后保持焦点
    if (searchInput.value) {
        searchInput.value.blur();
    }
};
</script>

<style scoped>
.search-container {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
    transition: all 0.3s ease;
}

/* 优化遮罩层 - 只要输入框有焦点就显示 */
.overlay-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
    cursor: pointer;
    backdrop-filter: blur(4px);
    background: rgba(0, 0, 0, 0.01);
}

.search-bar {
    display: flex;
    gap: 12px;
    position: relative;
    background-color: #f8fafc;
    border-radius: 8px;
    padding: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
}

.search-container.focused .search-bar {
    background-color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
    transform: translateY(-2px);
    z-index: 20;
}

.search-input-wrapper {
    flex: 1;
    position: relative;
}

.search-input-wrapper input {
    width: 100%;
    border: 2px solid #e2e8f0;
    padding: 14px 48px 14px 48px;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s ease;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-input-wrapper input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* 修复图标垂直居中问题 */
.icon-container {
    position: absolute;
    left: 16px;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
}

.clear-button {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    opacity: 0.7;
    transition: all 0.2s;
}

.clear-button:hover {
    opacity: 1;
    background-color: #f1f5f9;
    border-radius: 50%;
}

.search-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100px;
    height: 48px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    font-weight: 500;
}

.search-button:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.search-button:active {
    transform: translateY(0);
}

.suggestions-container {
    margin-top: 8px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    border: 1px solid #e2e8f0;
    position: absolute;
    width: 100%;
    z-index: 30;
}

.suggestions-header {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
}

.results-count {
    color: #3b82f6;
    font-weight: 700;
}

.suggestions {
    list-style-type: none;
    padding: 0;
    margin: 0;
    max-height: 350px;
    overflow-y: auto;
}

.suggestions li {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #f1f5f9;
}

.suggestions li:last-child {
    border-bottom: none;
}

.suggestions li:hover {
    background-color: #f8fafc;
}

.item-icon {
    margin-right: 12px;
    display: flex;
    align-items: center;
}

.item-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.item-name {
    font-weight: 500;
    color: #1e293b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.highlight {
    background-color: #ffedd5;
    color: #ea580c;
    font-weight: 700;
    padding: 0 2px;
    border-radius: 3px;
}

.lock-icon {
    margin-left: 4px;
    flex-shrink: 0;
}

.item-path {
    font-size: 12px;
    color: #64748b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.secret-item {
    background-color: #fff5f5;
}

.secret-item:hover {
    background-color: #ffebeb;
}

.searching-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    color: #64748b;
    font-size: 14px;
    background: white;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(59, 130, 246, 0.2);
    border-top: 3px solid #3b82f6;
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

/* 动画效果 */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .search-bar {
        flex-direction: column;
        padding: 12px;
    }

    .search-input-wrapper input {
        padding: 12px 40px 12px 40px;
    }

    .icon-container {
        left: 12px;
    }

    .clear-button {
        right: 12px;
    }

    .search-button {
        width: 100%;
        margin-top: 8px;
    }
}
</style>