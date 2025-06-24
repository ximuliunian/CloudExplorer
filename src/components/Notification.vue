<template>
    <transition name="notification">
        <div v-if="visible" class="notification" :class="[typeClass, positionClass]">
            <i :class="iconClass"></i>
            <span class="notification-content">{{ message }}</span>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
    type: {
        type: String as () => 'success' | 'error' | 'warning' | 'info',
        default: 'info'
    },
    message: String,
    duration: {
        type: Number,
        default: 2000
    },
    position: {
        type: String as () => 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
        default: 'top-right'
    }
});

const visible = ref(false);
const typeStyles = {
    success: { icon: 'fas fa-check-circle', bg: '#10b981' },
    error: { icon: 'fas fa-times-circle', bg: '#ef4444' },
    warning: { icon: 'fas fa-exclamation-triangle', bg: '#f59e0b' },
    info: { icon: 'fas fa-info-circle', bg: '#3b82f6' }
};

const typeClass = computed(() => `notification-${props.type}`);
const iconClass = computed(() => typeStyles[props.type].icon);
const positionClass = computed(() => `notification-${props.position}`);

onMounted(() => {
    visible.value = true;
    setTimeout(() => {
        visible.value = false;
    }, props.duration);
});
</script>

<style scoped>
.notification {
    /* 保持原有样式并添加定位 */
    position: fixed;
    z-index: 9999;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 350px;
    transition: all 0.3s;
}

.notification-top-right {
    top: 20px;
    right: 20px;
}

.notification-top-left {
    top: 20px;
    left: 20px;
}

.notification-bottom-right {
    bottom: 20px;
    right: 20px;
}

.notification-bottom-left {
    bottom: 20px;
    left: 20px;
}

/* 不同类型背景色 */
.notification-success {
    background: v-bind('typeStyles.success.bg');
}

.notification-error {
    background: v-bind('typeStyles.error.bg');
}

.notification-warning {
    background: v-bind('typeStyles.warning.bg');
}

.notification-info {
    background: v-bind('typeStyles.info.bg');
}

.notification-enter-active {
    animation: slideIn 0.3s ease;
}

.notification-leave-active {
    animation: fadeOut 0.3s ease;
}

@keyframes slideIn {
    from {
        transform: translateY(100px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}
</style>