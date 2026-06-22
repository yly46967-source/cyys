/**
 * [FILE] task-list-manager.js
 * [POS] 任务列表管理组件 - 管理"我的任务"列表的展示和操作
 * [IN] 任务数据
 * [OUT] DOM 元素
 * [DEP] my-tasks-service.js, profile-config.js
 * [SIDE EFFECT] 修改 DOM，发送网络请求
 * [TEST] 验证任务列表显示、Tab 切换、操作功能
 *
 * Task List Manager Component
 * ============================================
 */

import myTasksService from './my-tasks-service.js';
import { getRoleConfig, APPLICATION_STATUS, APPLICATION_STATUS_CONFIG, formatValue } from './profile-config.js';

const STATUS_OPTIONS = window.STATUS_OPTIONS || [
    { value: 'recruiting', label: '招募中', color: 'success' },
    { value: 'in-progress', label: '进行中', color: 'primary' },
    { value: 'closed', label: '已结束', color: 'gray' }
];

// ============================================
// Task List Manager Class
// ============================================

class TaskListManager {
    constructor(options = {}) {
        this.role = options.role || 'client';
        this.container = document.getElementById(options.containerId || 'taskList');
        this.tabsContainer = document.getElementById(options.tabsContainerId || 'taskTabs');
        this.config = getRoleConfig(this.role);
        this.tasks = [];
        this.currentTab = 'all';
        this.isLoading = false;

        // 初始化
        this.init();
    }

    /**
     * 初始化组件
     */
    async init() {
        if (!this.container) {
            console.error(`TaskListManager: Container not found`);
            return;
        }

        this.renderTabs();
        this.bindEvents();
        await this.loadTasks();
    }

    /**
     * 渲染 Tab 切换
     */
    renderTabs() {
        if (!this.tabsContainer) return;

        this.tabsContainer.innerHTML = this.config.taskTabs.map(tab => `
            <button class="profile-tab ${tab.id === 'all' ? 'active' : ''}" data-tab="${tab.id}">
                ${tab.label}
            </button>
        `).join('');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // Tab 切换
        if (this.tabsContainer) {
            this.tabsContainer.addEventListener('click', (e) => {
                const tab = e.target.closest('.profile-tab');
                if (tab) {
                    this.switchTab(tab.dataset.tab);
                }
            });
        }

        // 任务操作
        this.container.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                this.handleAction(actionBtn.dataset.action, actionBtn.dataset.taskId, actionBtn.dataset.version);
            }
        });
    }

    /**
     * 切换 Tab
     */
    switchTab(tabId) {
        this.currentTab = tabId;

        // 更新 Tab 样式
        const tabs = this.tabsContainer.querySelectorAll('.profile-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        // 过滤并渲染任务列表
        this.renderTasks();
    }

    /**
     * 加载任务数据
     */
    async loadTasks() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.renderLoading();

        try {
            const result = await myTasksService.getMyTasks({
                role: this.role,
                page: 1,
                limit: 50
            });

            this.tasks = result.tasks || [];
            this.renderTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.renderError('加载任务失败');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 渲染任务列表
     */
    renderTasks() {
        const tabConfig = this.config.taskTabs.find(t => t.id === this.currentTab);
        const filteredTasks = tabConfig ? this.tasks.filter(tabConfig.filter) : this.tasks;

        if (filteredTasks.length === 0) {
            this.renderEmpty();
            return;
        }

        this.container.innerHTML = filteredTasks.map(task => this.renderTaskCard(task)).join('');
    }

    /**
     * 渲染单个任务卡片
     */
    renderTaskCard(task) {
        const isClient = this.role === 'client';
        const extension = isClient ? task.clientExtension : task.developerExtension;

        return `
            <div class="profile-task-card" data-task-id="${task.id}">
                <div class="profile-task-header">
                    <div>
                        <h3 class="profile-task-title">${this.escapeHtml(task.title)}</h3>
                        <div class="profile-task-meta">
                            <span class="profile-task-meta-item">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                ${this.formatDate(task.deadline)}
                            </span>
                            <span class="profile-task-meta-item">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                ¥${task.budget.min.toLocaleString()} - ¥${task.budget.max.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    ${this.renderTaskStatus(task, isClient)}
                </div>

                <p class="profile-task-description">${this.escapeHtml(task.description)}</p>

                <div class="profile-task-footer">
                    <div class="profile-task-meta">
                        ${this.renderTaskExtension(task, extension, isClient)}
                    </div>
                    <div class="profile-task-actions">
                        ${this.renderTaskActions(task, extension, isClient)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染任务状态
     */
    renderTaskStatus(task, isClient) {
        const statusConfig = STATUS_OPTIONS.find(s => s.value === task.status);
        const statusLabel = statusConfig ? statusConfig.label : task.status;

        // 开发者视角：显示申请状态
        if (!isClient && task.developerExtension) {
            const appStatus = task.developerExtension.applicationStatus;
            const appStatusConfig = APPLICATION_STATUS_CONFIG[appStatus];

            if (appStatusConfig && appStatus !== APPLICATION_STATUS.ACCEPTED) {
                return `<span class="tag tag-${appStatusConfig.color}">${appStatusConfig.label}</span>`;
            }
        }

        return `<span class="tag tag-${statusConfig?.color || 'gray'}">${statusLabel}</span>`;
    }

    /**
     * 渲染任务扩展信息
     */
    renderTaskExtension(task, extension, isClient) {
        if (isClient) {
            return `
                <span class="profile-task-meta-item">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    ${extension.applicationsCount || 0} 人竞标
                    ${extension.unreadApplications > 0 ? `<span class="badge badge-danger">${extension.unreadApplications} 新</span>` : ''}
                </span>
            `;
        } else {
            return `
                <span class="profile-task-meta-item">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    我的报价：¥${extension.proposedBudget?.toLocaleString() || '-'}
                </span>
            `;
        }
    }

    /**
     * 渲染任务操作按钮
     */
    renderTaskActions(task, extension, isClient) {
        if (isClient) {
            return `
                ${task.status === 'recruiting' ? `
                    <button class="btn btn-sm btn-secondary" data-action="edit" data-task-id="${task.id}" data-version="${extension.version}">
                        编辑
                    </button>
                    <button class="btn btn-sm btn-danger" data-action="close" data-task-id="${task.id}" data-version="${extension.version}">
                        关闭
                    </button>
                ` : ''}
                ${task.status === 'in-progress' ? `
                    <button class="btn btn-sm btn-secondary" data-action="view-applications" data-task-id="${task.id}">
                        查看竞标
                    </button>
                    <button class="btn btn-sm btn-danger" data-action="close" data-task-id="${task.id}" data-version="${extension.version}">
                        关闭
                    </button>
                ` : ''}
                ${task.status === 'closed' ? `
                    <button class="btn btn-sm btn-secondary" data-action="repost" data-task-id="${task.id}">
                        重新发布
                    </button>
                ` : ''}
            `;
        } else {
            return `
                ${extension.applicationStatus === APPLICATION_STATUS.PENDING ? `
                    <button class="btn btn-sm btn-danger" data-action="withdraw" data-task-id="${task.id}" data-version="${extension.version}">
                        撤销竞标
                    </button>
                ` : ''}
                ${extension.applicationStatus === APPLICATION_STATUS.ACCEPTED && task.status === 'in-progress' ? `
                    <button class="btn btn-sm btn-success" data-action="mark-complete" data-task-id="${task.id}">
                        标记完成
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-secondary ${extension.isFavorite ? 'btn-active' : ''}" data-action="toggle-favorite" data-task-id="${task.id}">
                    ${extension.isFavorite ? '已收藏' : '收藏'}
                </button>
            `;
        }
    }

    /**
     * 处理任务操作
     */
    async handleAction(action, taskId, version) {
        switch (action) {
            case 'close':
                await this.closeTask(taskId, version);
                break;
            case 'withdraw':
                await this.withdrawApplication(taskId, version);
                break;
            case 'toggle-favorite':
                await this.toggleFavorite(taskId);
                break;
            case 'edit':
                // TODO: 打开编辑表单
                alert('编辑功能待实现');
                break;
            case 'view-applications':
                // TODO: 打开竞标列表
                alert('查看竞标功能待实现');
                break;
            case 'repost':
                // TODO: 重新发布任务
                alert('重新发布功能待实现');
                break;
            case 'mark-complete':
                // TODO: 标记完成
                alert('标记完成功能待实现');
                break;
        }
    }

    /**
     * 关闭任务
     */
    async closeTask(taskId, version) {
        if (!confirm('确定要关闭这个任务吗？')) return;

        try {
            await myTasksService.closeTask(taskId, parseInt(version));
            alert('任务已关闭');
            await this.loadTasks();
        } catch (error) {
            if (error.code === 'VERSION_CONFLICT') {
                alert('任务已被他人修改，正在刷新...');
                await this.loadTasks();
            } else {
                alert('关闭失败：' + error.message);
            }
        }
    }

    /**
     * 撤销竞标
     */
    async withdrawApplication(taskId, version) {
        if (!confirm('确定要撤销竞标吗？')) return;

        try {
            await myTasksService.withdrawApplication(taskId, parseInt(version));
            alert('竞标已撤销');
            await this.loadTasks();
        } catch (error) {
            alert('撤销失败：' + error.message);
        }
    }

    /**
     * 切换收藏
     */
    async toggleFavorite(taskId) {
        try {
            const task = this.tasks.find(t => t.id === taskId);
            const isFavorite = task?.developerExtension?.isFavorite || false;

            await myTasksService.toggleFavorite(taskId, !isFavorite);
            await this.loadTasks();
        } catch (error) {
            alert('操作失败：' + error.message);
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
        const emptyConfig = this.config.emptyStates?.tasks;
        if (!emptyConfig) {
            this.container.innerHTML = '<p class="text-center text-gray-500">暂无任务</p>';
            return;
        }

        this.container.innerHTML = `
            <div class="profile-empty-state">
                <svg class="profile-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 class="profile-empty-title">${emptyConfig.title}</h3>
                <p class="profile-empty-description">${emptyConfig.description}</p>
                <a href="${emptyConfig.actionLink}" class="btn btn-primary">${emptyConfig.actionLabel}</a>
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

        document.getElementById('retryLoadBtn')?.addEventListener('click', () => this.loadTasks());
    }

    /**
     * 格式化日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = date - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return '已截止';
        if (days === 0) return '今天截止';
        if (days === 1) return '明天截止';
        if (days <= 7) return `${days} 天后截止`;

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

export default TaskListManager;

// Also expose to window for non-module usage
if (typeof window !== 'undefined') {
    window.TaskListManager = TaskListManager;
}
