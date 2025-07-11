<template>
    <div class="json-generator-container">
        <div class="header">
            <h1> JSON 在线生成器 </h1>
            <p>快速创建或修改源文件</p>
        </div>

        <div class="actions">
            <button class="upload-btn" @click="handleUpload">
                <Icon icon="icon-sys-upload" size="18" />
                <span>上传JSON</span>
            </button>
            <button class="download-btn" @click="downloadJson" :disabled="!isFormValid">
                <Icon icon="icon-sys-download" size="18" />
                <span>下载JSON</span>
            </button>
            <input type="file" ref="fileInput" accept=".json" @change="parseJsonFile" style="display: none" />
        </div>

        <div class="file-type">
            <button :class="{ 'file-type-check': currentType === 'file' }" @click="currentType = 'file'">
                <Icon icon="icon-sys-file" size="18" />
                <span>站内文件</span>
            </button>

            <button :class="{ 'file-type-check': currentType === 'url' }" @click="currentType = 'url'">
                <Icon icon="icon-sys-url" size="18" />
                <span>URL</span>
            </button>
        </div>

        <!-- 动态渲染表单 -->
        <FileTypeForm
            v-if="currentType === 'file'"
            ref="fileForm"
            v-model:formData="fileFormData"
            @update:valid="updateFileFormValid"
        />
        
        <UrlTypeForm 
            v-else
            ref="urlForm"
            v-model:formData="urlFormData"
            @update:valid="updateUrlFormValid"
        />

        <div class="json-preview-container">
            <div class="preview-header">
                <div class="preview-title">
                    <Icon icon="icon-sys-preview" size="20" />
                    <span>JSON预览</span>
                </div>
                <div class="preview-actions">
                    <button class="copy-btn" @click="copyToClipboard">
                        <Icon icon="icon-sys-copy" size="16" />
                        <span>复制JSON</span>
                    </button>
                    <button class="download-btn" @click="downloadJson" :disabled="!isFormValid">
                        <Icon icon="icon-sys-download" size="18" />
                        <span>下载JSON</span>
                    </button>
                </div>
            </div>

            <div class="preview-content">
                <pre><code>{{ formattedJsonPreview }}</code></pre>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import Icon from '@/components/Icon.vue';
import type ShareContent from '@/types/ShareContent';
import { notification } from '@/utils/notify';
import UrlTypeForm from './components/UrlTypeForm.vue';
import FileTypeForm from './components/FileTypeForm.vue';

// 当前选择的表单类型
const currentType = ref<'file' | 'url'>('file');

// 文件类型表单数据
const fileFormData = reactive({
    is_secret: false,
    title: '',
    type: 'file' as const,
    summary: '',
    cover: '',
    file_url: [] as Array<{
        title: string;
        content: Array<{ name: string; url: string }>;
    }>,
    description: ''
});

// URL类型表单数据
const urlFormData = reactive({
    is_secret: false,
    title: '',
    type: 'url' as const,
    url: ''
});

// 表单验证状态
const isFileFormValid = ref(false);
const isUrlFormValid = ref(false);
const isFormValid = computed(() => 
    currentType.value === 'file' ? isFileFormValid.value : isUrlFormValid.value
);

// 更新表单验证状态
const updateFileFormValid = (valid: boolean) => {
    isFileFormValid.value = valid;
};
const updateUrlFormValid = (valid: boolean) => {
    isUrlFormValid.value = valid;
};

// 响应式变量
const fileInput = ref<HTMLInputElement | null>(null);
const fileForm = ref<InstanceType<typeof FileTypeForm> | null>(null);
const urlForm = ref<InstanceType<typeof UrlTypeForm> | null>(null);

// 计算属性：格式化JSON预览
const formattedJsonPreview = computed(() => {
    if (currentType.value === 'file') {
        const dataToExport: any = {
            is_secret: fileFormData.is_secret,
            title: fileFormData.title,
            type: 'file',
            file_url: fileFormData.file_url.map(fu => ({
                title: fu.title,
                content: fu.content.map(c => ({ name: c.name, url: c.url }))
            }))
        };

        if (fileFormData.summary) dataToExport.summary = fileFormData.summary;
        if (fileFormData.cover) dataToExport.cover = fileFormData.cover;
        if (fileFormData.description) {
            dataToExport.description = fileFormData.description.split('\n');
        }

        return JSON.stringify(dataToExport, null, 2);
    } else {
        return JSON.stringify({
            is_secret: urlFormData.is_secret,
            title: urlFormData.title,
            type: 'url',
            url: urlFormData.url
        }, null, 2);
    }
});

// 方法：触发文件上传
const handleUpload = () => {
    if (fileInput.value) {
        fileInput.value.value = '';
        fileInput.value.click();
    }
};

// 方法：解析JSON文件
const parseJsonFile = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const jsonData = JSON.parse(content) as ShareContent;

            // 自动识别类型：如果包含 file_url 则识别为文件类型
            if (jsonData.file_url) {
                currentType.value = 'file';
                Object.assign(fileFormData, {
                    is_secret: jsonData.is_secret || false,
                    title: jsonData.title || '',
                    summary: jsonData.summary || '',
                    cover: jsonData.cover || '',
                    file_url: jsonData.file_url?.map(fu => ({
                        title: fu.title || '',
                        content: fu.content?.map(c => ({
                            name: c.name || '',
                            url: c.url || ''
                        })) || []
                    })) || [],
                    description: Array.isArray(jsonData.description) 
                        ? jsonData.description.join('\n') 
                        : jsonData.description || ''
                });
            } 
            // 如果包含 url 字段则识别为 URL 类型
            else if (jsonData.url) {
                currentType.value = 'url';
                Object.assign(urlFormData, {
                    is_secret: jsonData.is_secret || false,
                    title: jsonData.title || '',
                    url: jsonData.url || ''
                });
            }
            // 如果都不包含，默认使用文件类型
            else {
                currentType.value = 'file';
                Object.assign(fileFormData, {
                    is_secret: jsonData.is_secret || false,
                    title: jsonData.title || '',
                    summary: jsonData.summary || '',
                    cover: jsonData.cover || '',
                    file_url: [],
                    description: Array.isArray(jsonData.description) 
                        ? jsonData.description.join('\n') 
                        : jsonData.description || ''
                });
            }
        } catch (error) {
            notification.error("无法解析JSON文件，请检查文件格式是否正确。");
        }
    };

    reader.readAsText(file);
};

// 方法：下载JSON
const downloadJson = () => {
    const dataStr = formattedJsonPreview.value;
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${(currentType.value === 'file' 
        ? fileFormData.title 
        : urlFormData.title
    ).replace(/\s+/g, '_')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};

// 方法：复制JSON到剪贴板
const copyToClipboard = () => {
    const textarea = document.createElement('textarea');
    textarea.value = formattedJsonPreview.value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    notification.success("JSON已复制到剪贴板！");
};
</script>

<style scoped>
/* 保留原有样式，已删除表单部分样式 */
.json-generator-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 24px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header {
    text-align: center;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;
}

.header h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 28px;
    color: #1e293b;
    margin-bottom: 8px;
}

.header p {
    font-size: 16px;
    color: #64748b;
}

.actions {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
}

.actions button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;
}

.file-type {
    display: flex;
    gap: 16px;
    background-color: #f8fafc;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #e2e8f0;
    margin-bottom: 30px;
}

.file-type button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;
}

.file-type button:hover {
    background-color: #e2e8f0;
}

.file-type-check {
    background-color: #e2e8f0;
}

.upload-btn {
    background-color: #e2e8f0;
    color: #334155;
}

.upload-btn:hover {
    background-color: #cbd5e1;
}

.download-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
}

.download-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.download-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.json-preview-container {
    background-color: #f8fafc;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #e2e8f0;
    margin-bottom: 20px;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.preview-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: #334155;
    font-size: 18px;
}

.preview-actions {
    display: flex;
    gap: 10px;
}

.copy-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    background: #e0f2fe;
    color: #0ea5e9;
}

.copy-btn:hover {
    background: #bae6fd;
}

.preview-content {
    max-height: 400px;
    overflow: auto;
    border-radius: 8px;
    background-color: #f8fafc;
    color: #334155;
    padding: 15px;
    border: 1px solid #e2e8f0;
}

.preview-content pre {
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .json-generator-container {
        padding: 16px;
    }

    .actions {
        flex-direction: column;
    }

    .preview-actions {
        flex-direction: column;
        gap: 8px;
    }
}
</style>