import { createApp, h } from 'vue';
import Notification from '@/components/Notification.vue';

type NotificationType = 'success' | 'error' | 'warning' | 'info';      // 通知类型
type PositionType = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';  // 位置

// 通知选项
interface NotificationOptions {
    type?: NotificationType;  // 通知类型
    message: string;          // 通知内容
    duration?: number;        // 通知显示时间（毫秒）
    position?: PositionType;  // 通知位置
}

export const notify = (options: NotificationOptions) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
        render() {
            return h(Notification, {
                type: options.type,
                message: options.message,
                duration: options.duration,
                position: options.position,
                onVnodeUnmounted: () => {
                    setTimeout(() => {
                        document.body.removeChild(container);
                        app.unmount();
                    }, 300);
                }
            });
        }
    });

    app.mount(container);
};

// 快捷方法
export const notification = {
    success: (msg: string, duration = 2000) => notify({ type: 'success', message: msg, duration }),
    error: (msg: string, duration = 3000) => notify({ type: 'error', message: msg, duration }),
    warning: (msg: string, duration = 2500) => notify({ type: 'warning', message: msg, duration }),
    info: (msg: string, duration = 2000) => notify({ type: 'info', message: msg, duration })
};
