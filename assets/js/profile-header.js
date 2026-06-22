/**
 * [FILE] profile-header.js
 * [POS] 个人资料头部组件 - 渲染用户资料卡片和编辑功能
 * [IN] 用户数据
 * [OUT] DOM 元素
 * [DEP] user-service.js, profile-config.js
 * [SIDE EFFECT] 修改 DOM，触发事件
 * [TEST] 验证资料卡片显示、编辑功能、头像上传
 *
 * Profile Header Component
 * ============================================
 */

import userService from './user-service.js';
import { VALIDATION_RULES, getRoleConfig } from './profile-config.js';

// ============================================
// Profile Header Class
// ============================================

class ProfileHeader {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.role = options.role || 'client';
        this.onEdit = typeof options.onEdit === 'function' ? options.onEdit : null;
        this.userData = null;
        this.hasUnsavedChanges = false;
    }

    /**
     * 初始化组件
     */
    async init() {
        if (!this.container) {
            console.error(`ProfileHeader: Container "${this.containerId}" not found`);
            return;
        }

        await this.loadUserData();
        this.render();
        this.bindEvents();
    }

    /**
     * 加载用户数据
     */
    async loadUserData() {
        try {
            this.userData = await userService.getUserProfile();
        } catch (error) {
            console.error('Failed to load user data:', error);
            this.showError('加载用户数据失败');
        }
    }

    /**
     * 渲染组件
     */
    render() {
        if (!this.userData) {
            this.renderLoading();
            return;
        }

        const extension = this.userData.extension || {};
        const stats = this.userData.stats || {};
        const config = getRoleConfig(this.role);

        this.container.innerHTML = `
            <div class="profile-card">
                <img
                    src="${extension.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}"
                    alt="${this.userData.name}"
                    class="profile-card-avatar"
                    id="profileAvatar"
                >
                <h2 class="profile-card-name">${this.escapeHtml(this.userData.name)}</h2>
                <span class="profile-card-role">${config.title}</span>
                ${extension.bio ? `<p class="profile-card-bio">${this.escapeHtml(extension.bio)}</p>` : ''}
                <div class="profile-card-actions">
                    <button type="button" class="btn btn-sm btn-primary" id="editProfileBtn">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        编辑资料
                    </button>
                </div>
            </div>
        `;
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
     * 绑定事件
     */
    bindEvents() {
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.handleEdit());
        }
    }

    /**
     * 处理编辑按钮点击
     */
    handleEdit() {
        if (this.onEdit) {
            this.onEdit(this.userData);
            return;
        }

        // 跳转到独立编辑页面，携带当前 section 参数
        const currentSection = document.querySelector('.profile-nav-item.active')?.dataset.section || 'overview';
        window.location.href = `profile-edit.html?from=${currentSection}`;
    }

    /**
     * 更新用户数据
     */
    async updateUserData(updates) {
        try {
            this.userData = await userService.updateUserProfile(updates);
            this.render();
            return { success: true, user: this.userData };
        } catch (error) {
            console.error('Failed to update user data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 显示错误消息
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="profile-card">
                <p class="profile-error-message">${this.escapeHtml(message)}</p>
                <button type="button" class="btn btn-sm btn-primary" id="retryLoadBtn">重试</button>
            </div>
        `;

        const retryBtn = document.getElementById('retryLoadBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.init());
        }
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

export default ProfileHeader;

// Also expose to window for non-module usage
if (typeof window !== 'undefined') {
    window.ProfileHeader = ProfileHeader;
}
