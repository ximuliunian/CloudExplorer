<template>
    <div class="form-container">
        <div class="form-section">
            <div class="form-group">
                <label class="required">标题</label>
                <input type="text" v-model="formData.title" placeholder="输入标题" />
            </div>

            <div class="form-group">
                <label class="required">URL地址</label>
                <input type="text" v-model="formData.url" placeholder="输入URL地址" />
            </div>

            <div class="form-group">
                <div class="checkbox-container">
                    <input type="checkbox" id="isSecret" v-model="formData.is_secret" />
                    <label for="isSecret">保密内容</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, reactive } from 'vue';

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
    const valid = !!formData.title.trim() && !!formData.url.trim();
    emit('update:valid', valid);
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

input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s ease;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.checkbox-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.checkbox-container input {
    width: auto;
}
</style>