/**
 * [FILE] message-detail-main.js
 * [POS] 消息详情页面主逻辑 - 展示消息详情、快捷操作、导航
 * [IN] URL 参数（id 消息 ID）
 * [OUT] DOM 更新、页面跳转、localStorage 更新
 * [DEP] auth-guard.js, auth-state.js, message-service.js, notification.js
 * [SIDE EFFECT] DOM 操作、API 调用、页面跳转
 * [TEST] 测试各种消息类型、异常场景、导航功能
 *
 * Message Detail Page Main Logic
 * ============================================ */

import authGuard from './auth-guard.js';
import authState from './auth-state.js';
import messageService from './message-service.js';
import notification from './notification.js';
import { MESSAGE_TYPE_CONFIG } from './profile-config.js';
import './shared-layout.js';

// ============================================
// 消息详情页面类
// ============================================
class MessageDetailPage {
    constructor() {
        this.container = document.querySelector('.message-detail-container');
        this.messageId = null;
        this.message = null;
        this.adjacentMessages = { previous: null, next: null };

        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        try {
            // 1. 路由守卫检查
            if (!authGuard.init()) {
                return; // 未登录，已被重定向
            }

            // 2. 初始化共享布局
            window.authState = authState;
            this.initSharedLayout();

            // 3. 获取消息 ID
            const urlParams = new URLSearchParams(window.location.search);
            this.messageId = urlParams.get('id');

            if (!this.messageId) {
                this.showEmptyState('无效的消息链接');
                return;
            }

            // 4. 加载消息详情
            await this.loadMessageDetail();

        } catch (error) {
            console.error('Message detail page init error:', error);
            this.showEmptyState('加载失败，请稍后重试');
        }
    }

    /**
     * 初始化共享布局
     */
    initSharedLayout() {
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initNavbar();
                this.initFooter();
            });
        } else {
            this.initNavbar();
            this.initFooter();
        }
    }

    /**
     * 初始化导航栏
     */
    initNavbar() {
        const navbar = document.querySelector('[data-layout="navbar"]');
        if (!navbar) return;

        // 注入当前用户信息
        if (authState.currentUser) {
            navbar.dataset.currentUser = JSON.stringify(authState.currentUser);
        }

        // 触发导航栏渲染
        if (typeof window.renderNavbar === 'function') {
            window.renderNavbar();
        }
    }

    /**
     * 初始化页脚
     */
    initFooter() {
        const footer = document.querySelector('[data-layout="footer"]');
        if (!footer) return;

        // 触发页脚渲染
        if (typeof window.renderFooter === 'function') {
            window.renderFooter();
        }
    }

    /**
     * 加载消息详情
     */
    async loadMessageDetail() {
        try {
            this.showLoading();

            // 获取消息详情
            this.message = await messageService.getMessageById(this.messageId);

            if (!this.message) {
                this.showEmptyState('消息不存在或已删除');
                return;
            }

            // 加载上一条/下一条
            this.adjacentMessages = await messageService.getAdjacentMessages(this.messageId);

            // 渲染消息详情
            this.renderMessageDetail();

            // 自动标记已读
            if (!this.message.isRead) {
                await messageService.markMessageRead(this.messageId);
                authState.decrementUnreadCount();
            }
        } catch (error) {
            console.error('Load message detail error:', error);
            this.showEmptyState('加载失败，请稍后重试');
        }
    }

    /**
     * 渲染消息详情
     */
    renderMessageDetail() {
        const typeConfig = MESSAGE_TYPE_CONFIG[this.message.type] || MESSAGE_TYPE_CONFIG['system'];

        this.container.innerHTML = `
            <div class="message-detail-header">
                <div class="message-detail-nav">
                    <button class="btn btn-back" id="backBtn">
                        <span class="icon">←</span>
                        <span>返回</span>
                    </button>
                </div>
                <div class="message-meta">
                    <span class="message-icon">${typeConfig.icon}</span>
                    <span class="message-type">${typeConfig.label}</span>
                    <span class="message-time">${this.formatTime(this.message.createdAt)}</span>
                </div>
                <div class="message-actions">
                    <button class="btn btn-secondary mark-read-btn" ${this.message.isRead ? 'disabled' : ''}>
                        ${this.message.isRead ? '已标记已读' : '标记已读'}
                    </button>
                    <button class="btn btn-danger delete-btn">删除</button>
                </div>
            </div>

            <div class="message-detail-content">
                <h1 class="message-title">${this.escapeHtml(this.message.title)}</h1>
                <div class="message-body">${this.escapeHtml(this.message.content)}</div>
            </div>

            <div class="message-detail-footer">
                ${this.renderQuickActions()}
            </div>

            <div class="message-detail-navigation">
                <button class="btn btn-secondary previous-btn"
                        data-id="${this.adjacentMessages.previous?.id || ''}"
                        ${!this.adjacentMessages.previous ? 'disabled' : ''}>
                    ← 上一条
                </button>
                <button class="btn btn-secondary next-btn"
                        data-id="${this.adjacentMessages.next?.id || ''}"
                        ${!this.adjacentMessages.next ? 'disabled' : ''}>
                    下一条 →
                </button>
            </div>
        `;

        // 绑定事件
        this.bindEvents();
    }

    /**
     * 渲染快捷操作
     */
    renderQuickActions() {
        let actions = '';

        // 如果有关联任务，显示"前往任务"按钮
        if (this.message.actionUrl && !this.isTaskDeleted()) {
            actions += `
                <button class="btn btn-primary action-btn" data-url="${this.message.actionUrl}">
                    ${this.message.actionLabel || '前往任务'}
                </button>
            `;
        }

        // 如果是实名认证提醒，显示"前往认证"按钮
        if (this.message.type === 'system' && this.message.title && this.message.title.includes('实名认证')) {
            actions += `
                <button class="btn btn-primary action-btn" data-url="real-name-auth.html">
                    前往认证
                </button>
            `;
        }

        return actions ? `<div class="quick-actions">${actions}</div>` : '';
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 返回按钮
        const backBtn = this.container.querySelector('.btn-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBackToList());
        }

        // 标记已读按钮
        const markReadBtn = this.container.querySelector('.mark-read-btn');
        if (markReadBtn && !markReadBtn.disabled) {
            markReadBtn.addEventListener('click', () => this.handleMarkRead());
        }

        // 删除按钮
        const deleteBtn = this.container.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDelete());
        }

        // 快捷操作按钮
        const actionBtns = this.container.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.dataset.url;
                if (url) {
                    window.location.href = url;
                }
            });
        });

        // 上一条/下一条按钮
        const previousBtn = this.container.querySelector('.previous-btn');
        const nextBtn = this.container.querySelector('.next-btn');

        if (previousBtn && !previousBtn.disabled) {
            previousBtn.addEventListener('click', () => {
                this.navigateToMessage(this.adjacentMessages.previous.id);
            });
        }

        if (nextBtn && !nextBtn.disabled) {
            nextBtn.addEventListener('click', () => {
                this.navigateToMessage(this.adjacentMessages.next.id);
            });
        }
    }

    /**
     * 处理标记已读
     */
    async handleMarkRead() {
        try {
            await messageService.markMessageRead(this.messageId);
            authState.decrementUnreadCount();
            notification.show('已标记为已读', 'success');

            // 更新按钮状态
            const markReadBtn = this.container.querySelector('.mark-read-btn');
            if (markReadBtn) {
                markReadBtn.disabled = true;
                markReadBtn.textContent = '已标记已读';
            }
        } catch (error) {
            console.error('Mark read error:', error);
            notification.show('操作失败', 'error');
        }
    }

    /**
     * 处理删除
     */
    async handleDelete() {
        const confirmed = confirm('确定要删除这条消息吗？');
        if (!confirmed) {
            return;
        }

        try {
            await messageService.deleteMessage(this.messageId);

            // 如果消息原本未读，减少未读计数
            if (!this.message.isRead) {
                authState.decrementUnreadCount();
            }

            notification.show('消息已删除', 'success');

            // 3秒后返回列表
            setTimeout(() => {
                this.goBackToList();
            }, 2000);

        } catch (error) {
            console.error('Delete error:', error);
            notification.show('删除失败', 'error');
        }
    }

    /**
     * 导航到指定消息
     */
    navigateToMessage(messageId) {
        if (messageId) {
            window.location.href = `message-detail.html?id=${messageId}`;
        }
    }

    /**
     * 返回消息列表
     */
    goBackToList() {
        const user = authState.currentUser;
        const role = user?.role || 'client';
        window.location.href = `profile-${role}.html#messages`;
    }

    /**
     * 检查关联任务是否已删除
     */
    isTaskDeleted() {
        // 检查关联任务是否已删除（如果实现了任务删除功能）
        return false;
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>加载中...</p>
            </div>
        `;
    }

    /**
     * 显示空态
     */
    showEmptyState(message) {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-title">${message}</div>
                <div class="empty-description">
                    该消息可能已被删除或不存在
                </div>
                <button class="btn btn-primary" id="backToListBtn">
                    返回消息列表
                </button>
            </div>
        `;

        // 绑定返回按钮事件
        const backBtn = this.container.querySelector('#backToListBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBackToList());
        }

        // 3秒后自动返回
        setTimeout(() => {
            this.goBackToList();
        }, 3000);
    }

    /**
     * 格式化时间
     */
    formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) { // 24小时内
            return `${Math.floor(diff / 3600000)}小时前`;
        } else if (diff < 604800000) { // 7天内
            return `${Math.floor(diff / 86400000)}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    /**
     * HTML 转义（防止 XSS）
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// 页面初始化
// ============================================
const messageDetailPage = new MessageDetailPage();

export default messageDetailPage;
