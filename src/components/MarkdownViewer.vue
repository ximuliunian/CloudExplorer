<template>
    <div class="markdown-viewer">
        <div v-if="loading" class="loading-indicator">
            <div class="spinner"></div>
            <p>解析Markdown内容...</p>
        </div>

        <div v-else class="markdown-content">
            <div v-if="parsedContent" v-html="parsedContent"></div>
            <div v-else class="empty-message">
                <p>没有可显示的Markdown内容</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const props = defineProps({
    // 接受Markdown行数组
    lines: {
        type: Array,
        required: true,
        default: () => []
    }
})

const parsedContent = ref('')
const loading = ref(true)
const error = ref(null)

// 创建Markdown解析器实例
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>${hljs.highlight(str, {
                    language: lang,
                    ignoreIllegals: true
                }).value}</code></pre>`
            } catch (e) {
                console.error('代码高亮错误:', e)
            }
        }
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    }
})

// 解析Markdown内容
const parseMarkdown = () => {
    try {
        loading.value = true
        error.value = null

        if (!props.lines || props.lines.length === 0) {
            parsedContent.value = ''
            return
        }

        // 将行数组连接为完整的Markdown字符串
        const markdownText = props.lines.join('\n')

        // 使用markdown-it解析为HTML
        parsedContent.value = md.render(markdownText)
    } catch (err) {
        console.error('Markdown解析错误:', err)
        error.value = err.message
        parsedContent.value = `<div class="error-message">解析错误: ${err.message}</div>`
    } finally {
        loading.value = false
    }
}

// 监听lines属性变化
watch(() => props.lines, parseMarkdown, { immediate: true })
</script>

<style scoped>
.markdown-viewer {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-height: 200px;
}

.loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #42b983;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 15px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.empty-message {
    text-align: center;
    padding: 40px 0;
    color: #888;
    font-style: italic;
}

.error-message {
    color: #ff5252;
    padding: 20px;
    background-color: #fff0f0;
    border-radius: 4px;
    border-left: 4px solid #ff5252;
}
</style>