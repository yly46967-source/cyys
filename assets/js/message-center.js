/**
 * [FILE] message-center.js
 * [POS] 消息中心组件 - 管理消息列表的展示和操作
 * [IN] 消息数据
 * [OUT] DOM 元素
 * [DEP] message-service.js, profile-config.js
 * [SIDE EFFECT] 修改 DOM，发送网络请求，更新未读计数
 * [TEST] 验证消息列表显示、筛选、标记已读、删除功能
 *
 * Message Center Component
 * ============================================
 */

import messageService from './message-service.js';
import { MESSAGE_TYPES, MESSAGE_TYPE_CONFIG } from './profile-config.js';

// ============================================
// Message Center Class
// ============================================

class MessageCenter {
    constructor(options = {}) {
        this.container = document.getElementById(options.containerId || 'messageList');
        this.filterContainer = document.getElementById(options.filterContainerId || 'messageFilter');
        this.messages = [];
        this.currentFilter = 'all';
        this.isLoading = false;
        this.pollingInterval = null;

        // 初始化
        this.init();
    }

    /**
     * 初始化组件
     */
    async init() {
        if (!this.container) {
            console.error(`MessageCenter: Container not found`);
            return;
        }

        this.renderFilter();
        this.bindEvents();
        await this.loadMessages();
        this.startPolling();
    }

    /**
     * 渲染筛选器
     */
    renderFilter() {
        if (!this.filterContainer) return;

        const filters = [
            { id: 'all', label: '全部消息' },
            { id: 'unread', label: '未读消息' },
            { id: MESSAGE_TYPES.SYSTEM, label: '系统通知' },
            { id: MESSAGE_TYPES.TASK, label: '任务消息' }
        ];

        this.filterContainer.innerHTML = filters.map(filter => `
            <button class="profile-tab ${filter.id === 'all' ? 'active' : ''}" data-filter="${filter.id}">
                ${filter.label}
            </button>
        `).join('');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 筛选器切换
        if (this.filterContainer) {
            this.filterContainer.addEventListener('click', (e) => {
                const tab = e.target.closest('.profile-tab');
                if (tab) {
                    this.switchFilter(tab.dataset.filter);
                }
            });
        }

        // 消息操作
        this.container.addEventListener('click', (e) => {
            const messageCard = e.target.closest('.profile-message-card');
            if (!messageCard) return;

            const messageId = messageCard.dataset.messageId;

            // 检查点击的是哪个按钮
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                this.handleAction(actionBtn.dataset.action, messageId);
            } else {
                // 点击消息卡片，标记已读并跳转
                this.handleMessageClick(messageId, messageCard);
            }
        });
    }

    /**
     * 切换筛选器
     */
    switchFilter(filterId) {
        this.currentFilter = filterId;

        // 更新筛选器样式
        const tabs = this.filterContainer.querySelectorAll('.profile-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filterId);
        });

        // 过滤并渲染消息列表
        this.renderMessages();
    }

    /**
     * 加载消息数据
     */
    async loadMessages() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.renderLoading();

        try {
            const result = await messageService.getMessages({
                page: 1,
                limit: 50
            });

            this.messages = result.messages || [];
            this.renderMessages();
        } catch (error) {
            console.error('Failed to load messages:', error);
            this.renderError('加载消息失败');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 渲染消息列表
     */
    renderMessages() {
        let filteredMessages = this.messages.filter(m => !m.deletedAt);

        // 根据筛选器过滤
        if (this.currentFilter === 'unread') {
            filteredMessages = filteredMessages.filter(m => !m.isRead);
        } else if (this.currentFilter !== 'all') {
            filteredMessages = filteredMessages.filter(m => m.type === this.currentFilter);
        }

        if (filteredMessages.length === 0) {
            this.renderEmpty();
            return;
        }

        this.container.innerHTML = filteredMessages.map(msg => this.renderMessageCard(msg)).join('');
    }

    /**
     * 渲染单个消息卡片
     */
    renderMessageCard(message) {
        const typeConfig = MESSAGE_TYPE_CONFIG[message.type] || MESSAGE_TYPE_CONFIG[MESSAGE_TYPES.SYSTEM];

        return `
            <div class="profile-message-card ${message.isRead ? '' : 'unread'}" data-message-id="${message.id}">
                <div class="profile-message-header">
                    <svg class="profile-message-icon ${message.type}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        ${this.getMessageIconSvg(message.type)}
                    </svg>
                    <div class="profile-message-content">
                        <h3 class="profile-message-title">${this.escapeHtml(message.title)}</h3>
                        <p class="profile-message-time">${this.formatRelativeTime(message.createdAt)}</p>
                    </div>
                </div>
                <p class="profile-message-text">${this.escapeHtml(message.content)}</p>
                <div class="profile-message-footer">
                    <span class="profile-message-time">${this.formatRelativeTime(message.createdAt)}</span>
                    <div class="profile-message-actions">
                        ${message.lifecycle?.canDelete ? `
                            <button class="btn btn-sm btn-link" data-action="delete" data-message-id="${message.id}">
                                删除
                            </button>
                        ` : ''}
                        ${!message.isRead ? `
                            <button class="btn btn-sm btn-link" data-action="mark-read" data-message-id="${message.id}">
                                标记已读
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取消息图标 SVG
     */
    getMessageIconSvg(type) {
        const icons = {
            [MESSAGE_TYPES.SYSTEM]: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />',
            [MESSAGE_TYPES.TASK]: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />'
        };
        return icons[type] || icons[MESSAGE_TYPES.SYSTEM];
    }

    /**
     * 处理消息点击
     */
    async handleMessageClick(messageId, cardElement) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        // 跳转到消息详情页
        window.location.href = `message-detail.html?id=${messageId}`;
    }

    /**
     * 处理消息操作
     */
    async handleAction(action, messageId) {
        switch (action) {
            case 'mark-read':
                await this.markAsRead(messageId);
                break;
            case 'delete':
                await this.deleteMessage(messageId);
                break;
        }
    }

    /**
     * 标记消息已读
     */
    async markAsRead(messageId) {
        try {
            await messageService.markMessageRead(messageId);

            // 更新本地状态
            const message = this.messages.find(m => m.id === messageId);
            if (message) {
                message.isRead = true;
            }

            this.renderMessages();
            this.updateUnreadCount();
        } catch (error) {
            console.error('Mark read error:', error);
            alert('标记失败：' + error.message);
        }
    }

    /**
     * 删除消息
     */
    async deleteMessage(messageId) {
        if (!confirm('确定要删除这条消息吗？')) return;

        try {
            await messageService.deleteMessage(messageId);

            // 更新本地状态
            const message = this.messages.find(m => m.id === messageId);
            if (message) {
                message.deletedAt = new Date().toISOString();
            }

            this.renderMessages();
            this.updateUnreadCount();
        } catch (error) {
            console.error('Delete message error:', error);
            alert('删除失败：' + error.message);
        }
    }

    /**
     * 更新未读消息计数
     */
    updateUnreadCount() {
        const unreadCount = this.messages.filter(m => !m.isRead && !m.deletedAt).length;

        // 通过 authState 更新
        if (window.authState) {
            window.authState.setUnreadMessageCount(unreadCount);
        }
    }

    /**
     * 开始轮询（定时更新未读计数）
     */
    startPolling() {
        // 每 30 秒轮询一次
        this.pollingInterval = setInterval(async () => {
            try {
                // 只获取未读数，不重新加载整个列表
                const unreadCount = await messageService.getUnreadCount();

                if (window.authState) {
                    window.authState.setUnreadMessageCount(unreadCount);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 30000);
    }

    /**
     * 停止轮询
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * 渲染加载状态
     */
    renderLoading() {
        this.container.innerHTML = `
            <div class="profile-loading">
                <div class="profile-spinner"></div>
            </div>
        `;
    }

    /**
     * 渲染空状态
     */
    renderEmpty() {
        this.container.innerHTML = `
            <div class="profile-empty-state">
                <svg class="profile-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 class="profile-empty-title">暂无消息</h3>
                <p class="profile-empty-description">您还没有收到任何消息</p>
            </div>
        `;
    }

    /**
     * 渲染错误状态
     */
    renderError(message) {
        this.container.innerHTML = `
            <div class="profile-empty-state">
                <svg class="profile-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="profile-empty-title">加载失败</h3>
                <p class="profile-empty-description">${message}</p>
                <button class="btn btn-primary" id="retryLoadBtn">重试</button>
            </div>
        `;

        document.getElementById('retryLoadBtn')?.addEventListener('click', () => this.loadMessages());
    }

    /**
     * 格式化相对时间
     */
    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes} 分钟前`;
        if (hours < 24) return `${hours} 小时前`;
        if (days === 1) return '昨天';
        if (days < 7) return `${days} 天前`;

        return date.toLocaleDateString('zh-CN');
    }

    /**
     * HTML 转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// Export
// ============================================

export default MessageCenter;

// Also expose to window for non-module usage
if (typeof window !== 'undefined') {
    window.MessageCenter = MessageCenter;
}
