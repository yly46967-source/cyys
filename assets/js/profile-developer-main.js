/**
 * [FILE] profile-developer-main.js
 * [POS] 开发者用户中心入口 - 初始化所有组件和事件
 * [IN] 无
 * [OUT] 初始化后的页面
 * [DEP] auth-state.js, auth-guard.js, shared-layout.js, profile-config.js
 * [DEP] profile-header.js, profile-editor.js, task-list-manager.js, message-center.js
 * [SIDE EFFECT] 初始化组件，绑定事件，修改 DOM
 * [TEST] 验证页面初始化、导航切换、组件交互
 *
 * Developer Profile Page Main Entry
 * ============================================
 */

import { initSharedLayout } from './shared-layout.js';
import authState from './auth-state.js';
import authGuard from './auth-guard.js';
import { getRoleConfig, formatValue, APPLICATION_STATUS_CONFIG } from './profile-config.js';
import ProfileHeader from './profile-header.js';
import ProfileEditor from './profile-editor.js';
import TaskListManager from './task-list-manager.js';
import MessageCenter from './message-center.js';
import userService from './user-service.js';
import messageService from './message-service.js';
import myTasksService from './my-tasks-service.js';

// ============================================
// Application State
// ============================================

const appState = {
    role: 'developer',
    currentSection: 'overview',
    components: {}
};

const VALID_SECTIONS = ['overview', 'my-participations', 'messages'];

// ============================================
// Initialize Application
// ============================================

async function initApp() {
    // 1. 暴露 authState 到 window
    window.authState = authState;

    // 2. 初始化共享布局
    initSharedLayout();

    // 3. 检查路由权限
    const guardResult = authGuard.init();
    if (!guardResult) {
        return; // 被重定向
    }

    // 4. 检查角色
    if (authState.currentUser?.role !== 'developer') {
        window.location.href = 'profile-client.html';
        return;
    }

    // 5. 初始化组件
    await initComponents();

    // 6. 绑定导航事件
    bindNavigation();
    setActiveSection(getInitialSection());

    // 7. 绑定退出登录
    bindLogout();

    // 8. 绑定移动端抽屉
    bindDrawer();

    // 9. 订阅状态变化
    subscribeToStateChanges();
}

// ============================================
// Initialize Components
// ============================================

async function initComponents() {
    const config = getRoleConfig(appState.role);

    // 初始化个人资料头部
    appState.components.profileHeader = new ProfileHeader('profileCard', {
        role: appState.role,
        onEdit: (userData) => {
            appState.components.profileEditor.open(userData);
        }
    });
    await appState.components.profileHeader.init();

    // 初始化资料编辑器
    appState.components.profileEditor = new ProfileEditor({
        role: appState.role
    });

    // 初始化任务列表管理器
    appState.components.taskListManager = new TaskListManager({
        role: appState.role,
        containerId: 'taskList',
        tabsContainerId: 'taskTabs'
    });

    // 初始化消息中心
    appState.components.messageCenter = new MessageCenter({
        containerId: 'messageList',
        filterContainerId: 'messageFilter'
    });

    // 渲染统计卡片
    await renderStatsCards(config);

    // 渲染最近参与（仅概览页）
    await renderRecentTasks();

    // 渲染最新消息（仅概览页）
    await renderLatestMessages();
}

// ============================================
// Render Stats Cards
// ============================================

async function renderStatsCards(config) {
    const container = document.getElementById('statsGrid');
    if (!container) return;

    try {
        const user = await userService.getUserProfile();
        const stats = user.stats || {};

        container.innerHTML = config.statsCards.map(card => {
            const valuePath = card.valuePath.split('.');
            let value = stats;
            for (const key of valuePath) {
                value = value?.[key];
            }

            const formattedValue = formatValue(value, card.format);

            return `
                <div class="profile-stat-card">
                    <svg class="profile-stat-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        ${getIconSvg(card.icon)}
                    </svg>
                    <div class="profile-stat-value">${formattedValue}</div>
                    <div class="profile-stat-label">${card.label}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to render stats:', error);
        container.innerHTML = '<p class="text-center text-gray-500">加载统计失败</p>';
    }
}

// ============================================
// Render Recent Tasks
// ============================================

async function renderRecentTasks() {
    const container = document.getElementById('recentTasks');
    if (!container) return;

    try {
        const result = await myTasksService.getMyTasks({
            role: 'developer',
            page: 1,
            limit: 3
        });
        const tasks = result.tasks || [];
        if (tasks.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">暂无参与</p>';
            return;
        }

        container.innerHTML = `
            <div class="profile-task-list">
                ${tasks.map(task => renderTaskSummary(task)).join('')}
            </div>
            <a href="#" class="btn btn-secondary btn-block" data-section="my-participations">查看全部</a>
        `;
    } catch (error) {
        console.error('Failed to render recent tasks:', error);
        container.innerHTML = '<p class="text-center text-gray-500">加载失败</p>';
    }
}

function renderTaskSummary(task) {
    const extension = task.developerExtension || {};
    return `
        <div class="profile-task-card">
            <h3 class="profile-task-title">${escapeHtml(task.title)}</h3>
            <div class="profile-task-meta">
                <span>我的报价：¥${extension.proposedBudget?.toLocaleString() || '-'}</span>
                <span>${APPLICATION_STATUS_CONFIG[extension.applicationStatus]?.label || '-'}</span>
            </div>
        </div>
    `;
}

// ============================================
// Render Latest Messages
// ============================================

async function renderLatestMessages() {
    const container = document.getElementById('latestMessages');
    if (!container) return;

    try {
        const result = await messageService.getMessages({ limit: 3 });
        const messages = result.messages || [];

        if (messages.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">暂无消息</p>';
            return;
        }

        container.innerHTML = `
            <div class="profile-message-list">
                ${messages.map(msg => renderMessageSummary(msg)).join('')}
            </div>
            <a href="#" class="btn btn-secondary btn-block" data-section="messages">查看全部</a>
        `;
    } catch (error) {
        console.error('Failed to render latest messages:', error);
        container.innerHTML = '<p class="text-center text-gray-500">加载失败</p>';
    }
}

function renderMessageSummary(message) {
    return `
        <div class="profile-message-card ${message.isRead ? '' : 'unread'}">
            <h4 class="profile-message-title">${escapeHtml(message.title)}</h4>
            <p class="profile-message-text">${escapeHtml(message.content)}</p>
            <span class="profile-message-time">${formatRelativeTime(message.createdAt)}</span>
        </div>
    `;
}

// ============================================
// Navigation
// ============================================

function normalizeSection(sectionId) {
    const normalized = (sectionId || '').replace(/^#/, '').replace(/^section-/, '');
    return VALID_SECTIONS.includes(normalized) ? normalized : 'overview';
}

function getInitialSection() {
    const params = new URLSearchParams(window.location.search);
    return normalizeSection(params.get('tab') || params.get('section') || window.location.hash);
}

function setActiveSection(sectionId) {
    const targetSection = normalizeSection(sectionId);
    const navItems = document.querySelectorAll('.profile-nav-item');
    const sections = document.querySelectorAll('.profile-section');

    navItems.forEach(nav => {
        nav.classList.toggle('active', nav.dataset.section === targetSection);
    });

    sections.forEach(section => {
        section.classList.toggle('profile-hidden', section.id !== `section-${targetSection}`);
    });

    appState.currentSection = targetSection;

    document.querySelector('.profile-sidebar')?.classList.remove('active');
    document.getElementById('drawerOverlay')?.classList.remove('active');
}

function bindNavigation() {
    const navItems = document.querySelectorAll('.profile-nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.dataset.section;
            if (!sectionId) return;

            setActiveSection(sectionId);
        });
    });

    // "查看全部"链接点击
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            setActiveSection(sectionId);
        });
    });
}

// ============================================
// Logout
// ============================================

function bindLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('确定要退出登录吗？')) {
                await authState.onLogout();
                window.location.href = 'index.html';
            }
        });
    }
}

// ============================================
// Mobile Drawer
// ============================================

function bindDrawer() {
    const sidebar = document.querySelector('.profile-sidebar');
    const overlay = document.getElementById('drawerOverlay');

    if (!sidebar || !overlay) return;

    // 点击遮罩关闭抽屉
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// ============================================
// State Changes
// ============================================

function subscribeToStateChanges() {
    // 监听用户资料更新
    window.addEventListener('profile-updated', async () => {
        await appState.components.profileHeader.init();
        const config = getRoleConfig(appState.role);
        await renderStatsCards(config);
    });

    // 监听认证状态变化
    authState.subscribe((event, data) => {
        if (event === 'logout') {
            window.location.href = 'index.html';
        }
    });
}

// ============================================
// Utility Functions
// ============================================

function getIconSvg(iconName) {
    const icons = {
        'check-circle': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />',
        currency: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
        star: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />',
        pulse: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />'
    };
    return icons[iconName] || icons['check-circle'];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString('zh-CN');
}

// ============================================
// Start Application
// ============================================

// 等待 DOM 加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
