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

        <div class="form-container">
            <div class="form-section">
                <div class="form-group">
                    <label class="required">标题</label>
                    <input type="text" v-model="formData.title" placeholder="输入标题" />
                </div>

                <div class="form-group">
                    <label>简介</label>
                    <textarea v-model="formData.summary" placeholder="输入简介" rows="3"></textarea>
                </div>

                <div class="form-group">
                    <label>封面URL</label>
                    <div class="cover-preview-container">
                        <input type="text" v-model="formData.cover" placeholder="输入封面图片URL" />
                        <div class="cover-preview" v-if="formData.cover">
                            <img :src="formData.cover" alt="封面预览" />
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <div class="checkbox-container">
                        <input type="checkbox" id="isSecret" v-model="formData.is_secret" />
                        <label for="isSecret">保密内容</label>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="section-header">
                    <h3>
                        <Icon icon="icon-sys-content" size="20" /> 介绍内容 (Markdown格式)
                    </h3>
                    <div class="section-tip">注：在JSON中将按行分割为数组</div>
                </div>
                <div class="form-group">
                    <textarea v-model="formData.description" placeholder="输入Markdown格式的介绍内容..." rows="8"
                        class="md-textarea"></textarea>
                </div>
            </div>

            <div class="form-section">
                <div class="section-header">
                    <h3>
                        <Icon icon="icon-sys-link" size="20" /> 文件下载链接
                    </h3>
                    <button class="add-btn" @click="addFileUrl">
                        <Icon icon="icon-sys-add" size="16" />
                        <span>添加文件组</span>
                    </button>
                </div>

                <div class="file-url-container">
                    <div v-for="(fileUrl, fileUrlIndex) in formData.file_url" :key="fileUrlIndex"
                        class="file-url-group">
                        <div class="file-url-header">
                            <div class="form-group">
                                <label class="required">文件组标题</label>
                                <input type="text" v-model="fileUrl.title" placeholder="输入文件组标题" />
                            </div>
                            <button class="remove-btn" @click="removeFileUrl(fileUrlIndex)">
                                <Icon icon="icon-sys-delete" size="16" />
                                <span>删除组</span>
                            </button>
                        </div>

                        <div class="content-items">
                            <div class="content-item" v-for="(content, contentIndex) in fileUrl.content"
                                :key="contentIndex">
                                <div class="content-inputs">
                                    <div class="form-group">
                                        <label class="required">链接名称</label>
                                        <input type="text" v-model="content.name" placeholder="输入链接名称" />
                                    </div>
                                    <div class="form-group">
                                        <label class="required">链接地址</label>
                                        <input type="text" v-model="content.url" placeholder="输入链接地址" />
                                    </div>
                                </div>
                                <button class="remove-btn" @click="removeContent(fileUrlIndex, contentIndex)">
                                    <Icon icon="icon-sys-delete" size="16" />
                                    <span>删除</span>
                                </button>
                            </div>

                            <div class="group-footer">
                                <button class="add-content-btn" @click="addContent(fileUrlIndex)">
                                    <Icon icon="icon-sys-add" size="16" />
                                    <span>添加链接</span>
                                </button>
                                <button class="add-group-below-btn" @click="insertFileUrlAfter(fileUrlIndex)">
                                    <Icon icon="icon-sys-add" size="16" />
                                    <span>在此下方添加文件组</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="formData.file_url.length === 0" class="empty-state">
                        <Icon icon="icon-sys-folder" size="48" />
                        <p>暂无文件组，请点击上方"添加文件组"按钮</p>
                    </div>
                </div>
            </div>
        </div>

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
import { ref, computed, reactive, onMounted } from 'vue';
import Icon from '@/components/Icon.vue';
import type ShareContent from '@/types/ShareContent';
import { notification } from '@/utils/notify';

// 定义表单数据类型
interface FormData {
    is_secret: boolean;
    title: string;
    summary: string;
    cover: string;
    file_url: Array<{
        title: string;
        content: Array<{
            name: string;
            url: string;
        }>;
    }>;
    description: string; // 字符串类型
}

// 表单数据
const formData = reactive<FormData>({
    is_secret: false,
    title: '',
    summary: '',
    cover: '',
    file_url: [],
    description: ''
})

// 响应式变量
const fileInput = ref<HTMLInputElement | null>(null)

// 计算属性：验证表单
const isFormValid = computed(() => {
    if (!formData.title.trim()) return false

    if (formData.file_url.length === 0) return false

    for (const fileUrl of formData.file_url) {
        if (!fileUrl.title.trim()) return false

        if (fileUrl.content.length === 0) return false

        for (const content of fileUrl.content) {
            if (!content.name.trim() || !content.url.trim()) return false
        }
    }

    return true
})

// 计算属性：格式化JSON预览
const formattedJsonPreview = computed(() => {
    const dataToExport: any = {
        is_secret: formData.is_secret,
        title: formData.title,
        file_url: formData.file_url.map(fu => ({
            title: fu.title,
            content: fu.content.map(c => ({ name: c.name, url: c.url }))
        }))
    }

    if (formData.summary) dataToExport.summary = formData.summary
    if (formData.cover) dataToExport.cover = formData.cover

    // 处理描述内容：按行分割为数组
    if (formData.description && formData.description.trim()) {
        dataToExport.description = formData.description
            .split('\n')
    }

    return JSON.stringify(dataToExport, null, 2)
})

// 方法：添加文件URL组
const addFileUrl = () => {
    formData.file_url.unshift({
        title: '',
        content: [{
            name: '',
            url: ''
        }]
    })
}

// 方法：在指定索引后插入文件URL组
const insertFileUrlAfter = (index: number) => {
    formData.file_url.splice(index + 1, 0, {
        title: '',
        content: [{
            name: '',
            url: ''
        }]
    });
}

// 方法：移除文件URL组
const removeFileUrl = (index: number) => {
    formData.file_url.splice(index, 1)
}

// 方法：添加内容链接
const addContent = (fileUrlIndex: number) => {
    formData.file_url[fileUrlIndex].content.push({
        name: '',
        url: ''
    })
}

// 方法：移除内容链接
const removeContent = (fileUrlIndex: number, contentIndex: number) => {
    formData.file_url[fileUrlIndex].content.splice(contentIndex, 1)
}

// 方法：触发文件上传
const handleUpload = () => {
    if (fileInput.value) {
        fileInput.value.value = ''
        fileInput.value.click()
    }
}

// 方法：解析JSON文件
const parseJsonFile = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
        try {
            const content = e.target?.result as string
            const jsonData = JSON.parse(content) as ShareContent

            // 重置表单数据
            Object.assign(formData, {
                is_secret: jsonData.is_secret || false,
                title: jsonData.title || '',
                summary: jsonData.summary || '',
                cover: jsonData.cover || '',
                file_url: []
            })

            // 处理描述内容（数组转字符串）
            if (jsonData.description) {
                formData.description = Array.isArray(jsonData.description)
                    ? jsonData.description.join('\n')
                    : jsonData.description;
            }

            // 处理文件URL
            if (jsonData.file_url && jsonData.file_url.length > 0) {
                formData.file_url = jsonData.file_url.map(fu => ({
                    title: fu.title || '',
                    content: fu.content ? fu.content.map(c => ({
                        name: c.name || '',
                        url: c.url || ''
                    })) : []
                }))
            }
        } catch (error) {
            notification.error("无法解析JSON文件，请检查文件格式是否正确。")
        }
    }

    reader.readAsText(file)
}

// 方法：下载JSON
const downloadJson = () => {
    const dataStr = formattedJsonPreview.value
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${formData.title.replace(/\s+/g, '_')}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
}

// 方法：复制JSON到剪贴板
const copyToClipboard = () => {
    const textarea = document.createElement('textarea')
    textarea.value = formattedJsonPreview.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)

    notification.success("JSON已复制到剪贴板！")
}
</script>

<style scoped>
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

/* 新增样式 */
.group-footer {
    border-top: 1px dashed #e2e8f0;
    display: flex;
}

.add-group-below-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background-color: #dbeafe;
    color: #3b82f6;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 10px;
    margin-left: 10px;
    transition: background-color 0.2s;
}

.add-group-below-btn:hover {
    background-color: #bfdbfe;
}


.file-url-container>.add-btn {
    margin-bottom: 16px;
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

.form-container {
    display: flex;
    flex-direction: column;
    gap: 32px;
    margin-bottom: 32px;
}

.form-section {
    background-color: #f8fafc;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #e2e8f0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
}

.section-header h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 20px;
    color: #1e293b;
}

.section-tip {
    font-size: 14px;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 6px 12px;
    border-radius: 6px;
    margin-top: 5px;
}

.add-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.add-btn:hover {
    background-color: #059669;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #334155;
}

label.required::after {
    content: ' *';
    color: #ef4444;
}

input,
textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s ease;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

input:focus,
textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

textarea {
    min-height: 80px;
    resize: vertical;
}

.md-textarea {
    font-family: 'Courier New', monospace;
    min-height: 150px;
}

.checkbox-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.checkbox-container input {
    width: auto;
}

.cover-preview-container {
    display: flex;
    gap: 16px;
    align-items: flex-start;
}

.cover-preview {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    display: flex;
    align-items: center;
    justify-content: center;
}

.cover-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.cover-preview:empty::before {
    content: "封面预览";
    color: #94a3b8;
    font-size: 12px;
    text-align: center;
    padding: 10px;
}

.file-url-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.file-url-group {
    background-color: white;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.file-url-header {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
}

.file-url-header .form-group {
    flex: 1;
    margin-bottom: 0;
}

.content-items {
    padding-left: 20px;
    border-left: 2px dashed #cbd5e1;
}

.content-item {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    padding: 16px;
    background-color: #f8fafc;
    border-radius: 8px;
    position: relative;
}

.content-inputs {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.remove-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background-color: #fee2e2;
    color: #ef4444;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    height: 42px;
    align-self: flex-start;
}

.remove-btn:hover {
    background-color: #fecaca;
}

.add-content-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background-color: #dbeafe;
    color: #3b82f6;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 10px;
}

.add-content-btn:hover {
    background-color: #bfdbfe;
}

.empty-state {
    text-align: center;
    padding: 30px 20px;
    background: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    color: #64748b;
}

.empty-state p {
    margin-top: 15px;
    font-size: 16px;
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

    .content-item {
        flex-direction: column;
        gap: 12px;
    }

    .content-inputs {
        grid-template-columns: 1fr;
    }

    .cover-preview-container {
        flex-direction: column;
    }

    .cover-preview {
        width: 100%;
        height: 150px;
    }

    .file-url-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .preview-actions {
        flex-direction: column;
        gap: 8px;
    }
}
</style>