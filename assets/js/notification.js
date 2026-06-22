/**
 * [FILE] notification.js
 * [POS] 统一通知组件 - 提供成功、错误、警告、信息等通知功能
 * [IN] 通知消息、类型
 * [OUT] 通知 UI 元素
 * [DEP] 无
 * [SIDE EFFECT] 动态创建和移除 DOM 元素
 * [TEST] 验证各种通知类型的显示和自动关闭
 *
 * Notification Component
 * ============================================ */

// ============================================
// 通知类型配置
// ============================================
const NOTIFICATION_TYPES = {
    SUCCESS: {
        type: 'success',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>',
        defaultDuration: 3000
    },
    ERROR: {
        type: 'error',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>',
        defaultDuration: 5000
    },
    WARNING: {
        type: 'warning',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>',
        defaultDuration: 4000
    },
    INFO: {
        type: 'info',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
        defaultDuration: 3000
    }
};

// ============================================
// 通知管理器
// ============================================
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 3;
        this.gap = 12;
    }

    /**
     * 初始化通知容器
     */
    initContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            this.container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 24px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: ${this.gap}px;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 (success | error | warning | info)
     * @param {Object} options - 选项
     * @returns {Object} 通知对象
     */
    show(message, type = 'info', options = {}) {
        const {
            duration = null,
            closable = true,
            onClose = null
        } = options;

        const typeConfig = NOTIFICATION_TYPES[type.toUpperCase()] || NOTIFICATION_TYPES.INFO;
        const autoCloseDuration = duration !== null ? duration : typeConfig.defaultDuration;

        // 初始化容器
        this.initContainer();

        // 创建通知元素
        const notification = this.createNotification(message, typeConfig, closable);

        // 添加到容器
        this.container.appendChild(notification);

        // 限制最大数量
        this.limitNotifications();

        // 动画进入
        requestAnimationFrame(() => {
            notification.style.animation = 'notificationSlideIn 0.3s ease forwards';
        });

        // 自动关闭
        let timeoutId;
        if (autoCloseDuration > 0) {
            timeoutId = setTimeout(() => {
                this.close(notification);
            }, autoCloseDuration);
        }

        // 返回通知控制对象
        return {
            element: notification,
            close: () => this.close(notification),
            update: (newMessage) => this.update(notification, newMessage)
        };
    }

    /**
     * 创建通知元素
     * @param {string} message - 消息
     * @param {Object} typeConfig - 类型配置
     * @param {boolean} closable - 是否可关闭
     * @returns {HTMLElement} 通知元素
     */
    createNotification(message, typeConfig, closable) {
        const notification = document.createElement('div');
        notification.className = `notification notification--${typeConfig.type}`;
        notification.style.cssText = `
            pointer-events: auto;
            min-width: 300px;
            max-width: 450px;
            padding: 16px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: flex-start;
            gap: 12px;
            opacity: 0;
            transform: translateX(100%);
        `;

        // 根据类型设置边框颜色
        const borderColors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        notification.style.borderLeft = `4px solid ${borderColors[typeConfig.type]}`;

        // 图标
        const icon = document.createElement('div');
        icon.className = 'notification__icon';
        icon.innerHTML = typeConfig.icon;
        icon.style.cssText = `
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            color: ${borderColors[typeConfig.type]};
        `;

        // 内容
        const content = document.createElement('div');
        content.className = 'notification__content';
        content.style.cssText = `
            flex: 1;
            font-size: 14px;
            line-height: 1.5;
            color: #0D0C22;
        `;
        content.textContent = message;

        // 关闭按钮
        if (closable) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'notification__close';
            closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>';
            closeBtn.style.cssText = `
                flex-shrink: 0;
                width: 20px;
                height: 20px;
                padding: 0;
                border: none;
                background: none;
                cursor: pointer;
                color: #9D9CAA;
                transition: color 0.2s;
            `;
            closeBtn.onmouseover = () => closeBtn.style.color = '#0D0C22';
            closeBtn.onmouseout = () => closeBtn.style.color = '#9D9CAA';
            closeBtn.onclick = () => this.close(notification);

            notification.appendChild(icon);
            notification.appendChild(content);
            notification.appendChild(closeBtn);
        } else {
            notification.appendChild(icon);
            notification.appendChild(content);
        }

        // 添加动画关键帧
        if (!document.getElementById('notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes notificationSlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes notificationSlideOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        return notification;
    }

    /**
     * 关闭通知
     * @param {HTMLElement} notification - 通知元素
     */
    close(notification) {
        if (!notification || !notification.parentNode) return;

        notification.style.animation = 'notificationSlideOut 0.3s ease forwards';

        notification.addEventListener('animationend', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    /**
     * 更新通知内容
     * @param {HTMLElement} notification - 通知元素
     * @param {string} newMessage - 新消息
     */
    update(notification, newMessage) {
        const content = notification.querySelector('.notification__content');
        if (content) {
            content.textContent = newMessage;
        }
    }

    /**
     * 限制通知数量
     */
    limitNotifications() {
        while (this.container.children.length > this.maxNotifications) {
            const oldest = this.container.firstChild;
            if (oldest) {
                this.close(oldest);
            }
        }
    }

    /**
     * 显示成功通知
     * @param {string} message - 消息
     * @param {Object} options - 选项
     * @returns {Object} 通知对象
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    /**
     * 显示错误通知
     * @param {string} message - 消息
     * @param {Object} options - 选项
     * @returns {Object} 通知对象
     */
    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    /**
     * 显示警告通知
     * @param {string} message - 消息
     * @param {Object} options - 选项
     * @returns {Object} 通知对象
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    /**
     * 显示信息通知
     * @param {string} message - 消息
     * @param {Object} options - 选项
     * @returns {Object} 通知对象
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * 清除所有通知
     */
    clearAll() {
        if (this.container) {
            Array.from(this.container.children).forEach(notification => {
                this.close(notification);
            });
        }
    }
}

// ============================================
// 单例导出
// ============================================
const notification = new NotificationManager();
export default notification;

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
    module.exports = notification;
}
