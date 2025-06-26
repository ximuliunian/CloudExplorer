<template>
    <div v-if="showDialog" class="disclaimer-dialog">
        <div class="dialog-overlay" @click="handleOverlayClick"></div>

        <div class="dialog-container">
            <div class="dialog-header">
                <h2>
                    <Icon icon="icon-sys-warning" size="24" />
                    <span>免责声明</span>
                </h2>
                <button class="close-btn" @click="closeDialog">
                    <Icon icon="icon-sys-close" size="18" />
                </button>
            </div>

            <div class="dialog-content">
                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div>
                    <p>正在加载免责声明内容...</p>
                </div>

                <div v-else-if="error" class="error-state">
                    <Icon icon="icon-sys-error" size="48" color="#f56c6c" />
                    <h3>内容加载失败</h3>
                    <p>{{ errorMessage }}</p>
                    <button class="retry-btn" @click="fetchDisclaimer">
                        <Icon icon="icon-sys-refresh" size="16" />
                        <span>重新加载</span>
                    </button>
                </div>

                <MarkdownViewer v-else :lines="disclaimerLines" />
            </div>

            <div class="dialog-footer">
                <div class="agreement-check">
                    <input type="checkbox" id="agreeCheckbox" v-model="agreed" />
                    <label for="agreeCheckbox">我已阅读并同意以上免责声明</label>
                </div>
                <button class="confirm-btn" :disabled="!agreed" @click="confirmAgreement">
                    确认
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDisclaimerFile } from '@/api/filesApi';
import MarkdownViewer from '@/components/MarkdownViewer.vue';
import Icon from '@/components/Icon.vue';

// 本地存储键名
const STORAGE_KEY = 'disclaimerAccepted';

// 响应式状态
const showDialog = ref(false);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const agreed = ref(false);
const disclaimerLines = ref<string[]>([]);

// 检查用户是否已同意
const checkDisclaimerStatus = () => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    return accepted === 'true';
};

// 获取免责声明内容
const fetchDisclaimer = async () => {
    try {
        loading.value = true;
        error.value = false;

        const response = await getDisclaimerFile();

        // 按行分割Markdown内容
        disclaimerLines.value = response.data.split('\n');
        // 检查是否包含<!DOCTYPE html>，如果没有则显示免责声明
        if (disclaimerLines.value[0].indexOf('<!DOCTYPE html>') === -1) {
            showDialog.value = true;
        }
    } catch (err) {
        error.value = true;
        errorMessage.value = '无法加载免责声明内容，请检查网络连接后重试';
        console.error('加载免责声明失败:', err);
    } finally {
        loading.value = false;
    }
};

// 确认同意
const confirmAgreement = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    showDialog.value = false;
};

// 关闭弹窗
const closeDialog = () => {
    showDialog.value = false;
};

// 处理遮罩层点击
const handleOverlayClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('dialog-overlay')) {
        closeDialog();
    }
};

// 组件挂载时初始化
onMounted(() => {
    if (!checkDisclaimerStatus()) {
        fetchDisclaimer();
    }
});
</script>

<style scoped>
.disclaimer-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dialog-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
}

.dialog-container {
    position: relative;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1001;
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border-bottom: 1px solid #e2e8f0;
}

.dialog-header h2 {
    margin: 0;
    font-size: 22px;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 12px;
}

.close-btn {
    background: none;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: #64748b;
}

.close-btn:hover {
    background-color: #f1f5f9;
    color: #334155;
    transform: rotate(90deg);
}

.dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    max-height: 60vh;
    background-color: #fff;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(59, 130, 246, 0.2);
    border-radius: 50%;
    border-top-color: #3b82f6;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.error-state {
    text-align: center;
    padding: 30px 0;
}

.error-state h3 {
    color: #f56c6c;
    margin: 15px 0 10px;
}

.error-state p {
    color: #606266;
    margin-bottom: 20px;
}

.retry-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.retry-btn:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.dialog-footer {
    padding: 16px 24px;
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.agreement-check {
    display: flex;
    align-items: center;
    gap: 10px;
}

.agreement-check input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #3b82f6;
}

.agreement-check label {
    color: #334155;
    font-size: 16px;
    cursor: pointer;
}

.confirm-btn {
    padding: 10px 30px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
}

.confirm-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #cbd5e1;
}

.confirm-btn:not(:disabled):hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .dialog-container {
        width: 95%;
        max-height: 85vh;
    }

    .dialog-header {
        padding: 16px;
    }

    .dialog-content {
        padding: 16px;
    }

    .dialog-footer {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .agreement-check {
        margin-bottom: 10px;
    }

    .confirm-btn {
        width: 100%;
        padding: 12px;
    }
}
</style>