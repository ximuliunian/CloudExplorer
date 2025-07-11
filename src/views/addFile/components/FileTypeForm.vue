<template>
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
                <div v-for="(fileUrl, fileUrlIndex) in formData.file_url" :key="fileUrlIndex" class="file-url-group">
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
                        <div class="content-item" v-for="(content, contentIndex) in fileUrl.content" :key="contentIndex">
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
</template>

<script setup lang="ts">
import { watch, reactive } from 'vue';
import Icon from '@/components/Icon.vue';

const props = defineProps({
    formData: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:formData', 'update:valid']);

// 表单数据
const formData = reactive(props.formData);

// 监听表单变化
watch(formData, () => {
    emit('update:formData', formData);
    validateForm();
}, { deep: true });

// 验证表单
const validateForm = () => {
    let valid = true;
    
    if (!formData.title.trim()) valid = false;

    if (formData.file_url.length === 0) valid = false;

    for (const fileUrl of formData.file_url) {
        if (!fileUrl.title.trim()) valid = false;

        if (fileUrl.content.length === 0) valid = false;

        for (const content of fileUrl.content) {
            if (!content.name.trim() || !content.url.trim()) valid = false;
        }
    }
    
    emit('update:valid', valid);
};

// 方法：添加文件URL组
const addFileUrl = () => {
    formData.file_url.unshift({
        title: '',
        content: [{ name: '', url: '' }]
    });
};

// 方法：在指定索引后插入文件URL组
const insertFileUrlAfter = (index: number) => {
    formData.file_url.splice(index + 1, 0, {
        title: '',
        content: [{ name: '', url: '' }]
    });
};

// 方法：移除文件URL组
const removeFileUrl = (index: number) => {
    formData.file_url.splice(index, 1);
};

// 方法：添加内容链接
const addContent = (fileUrlIndex: number) => {
    formData.file_url[fileUrlIndex].content.push({
        name: '',
        url: ''
    });
};

// 方法：移除内容链接
const removeContent = (fileUrlIndex: number, contentIndex: number) => {
    formData.file_url[fileUrlIndex].content.splice(contentIndex, 1);
};

// 初始化验证
validateForm();
</script>

<style scoped>
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

.group-footer {
    display: flex;
    border-top: 1px dashed #e2e8f0;
    padding-top: 16px;
    margin-top: 8px;
    gap: 10px;
    flex-wrap: wrap;
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
    transition: background-color 0.2s;
}

.add-group-below-btn:hover {
    background-color: #bfdbfe;
}

@media (max-width: 768px) {
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

    .group-footer {
        flex-direction: column;
    }
}
</style>