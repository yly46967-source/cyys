/**
 * [FILE] task-preview-drawer.js
 * [POS] 任务预览抽屉组件 - 侧边抽屉预览任务摘要信息
 * [IN] 任务ID、用户点击、键盘事件
 * [OUT] 抽屉开关、内容渲染
 * [DEP] task-service.js (数据加载), task-view-model.js (数据格式化), task-hall.js (筛选抽屉互斥)
 * [SIDE EFFECT] DOM 操作、类名切换、焦点管理、滚动锁定
 * [TEST] 手动测试: 点击任务卡片打开抽屉、验证内容显示、验证关闭交互
 *
 * Task Preview Drawer Component
 * ============================================
 *
 * Indeed 风格两级导航模式的第一级：
 * - 点击任务卡片 → 侧边抽屉预览摘要信息
 * - 抽屉内点击"查看详情" → 跳转到独立详情页
 */

// ============================================
// DOM Elements
// ============================================

const Elements = {
    overlay: document.getElementById('taskPreviewDrawerOverlay'),
    drawer: document.getElementById('taskPreviewDrawer'),
    closeBtn: document.getElementById('taskPreviewDrawerCloseBtn'),
    body: document.getElementById('taskPreviewDrawerBody'),

    // States
    loadingState: document.getElementById('previewLoadingState'),
    errorState: document.getElementById('previewErrorState'),
    contentState: document.getElementById('previewContentState'),

    // Content elements
    status: document.getElementById('previewStatus'),
    title: document.getElementById('previewTitle'),
    publisher: document.getElementById('previewPublisher'),
    publisherAvatar: document.getElementById('previewPublisherAvatar'),
    publisherName: document.getElementById('previewPublisherName'),
    publisherVerified: document.getElementById('previewPublisherVerified'),
    publisherRating: document.getElementById('previewPublisherRating'),
    publisherRatingValue: document.getElementById('previewPublisherRatingValue'),
    description: document.getElementById('previewDescription'),
    descriptionText: document.getElementById('previewDescriptionText'),
    summary: document.getElementById('previewSummary'),
    budget: document.getElementById('previewBudget'),
    duration: document.getElementById('previewDuration'),
    deadline: document.getElementById('previewDeadline'),
    stacks: document.getElementById('previewStacks'),
    stacksList: document.getElementById('previewStacksList'),
    detailBtn: document.getElementById('previewDetailBtn')
};

// ============================================
// State
// ============================================

const State = {
    isOpen: false,
    currentTaskId: null,
    previousFocus: null
};

// ============================================
// Drawer Control
// ============================================

/**
 * Open the drawer with task data
 * @param {string} taskId - Task ID to load and display
 */
async function openDrawer(taskId) {
    if (!taskId) {
        console.warn('No taskId provided to openDrawer');
        return;
    }

    // Close filter drawer if open (mutual exclusion)
    if (typeof closeFilterDrawer === 'function') {
        const filterDrawer = document.getElementById('filterDrawer');
        if (filterDrawer && !filterDrawer.classList.contains('hidden')) {
            closeFilterDrawer();
        }
    }

    // Store previous focus for restoration
    State.previousFocus = document.activeElement;

    // Show loading state
    _showLoading();

    // Open drawer
    State.isOpen = true;
    State.currentTaskId = taskId;
    Elements.drawer.classList.add('open');
    Elements.drawer.classList.remove('hidden');
    Elements.overlay.classList.add('visible');
    Elements.drawer.setAttribute('aria-hidden', 'false');

    // Lock body scroll
    _lockScroll(true);

    // Load task data
    try {
        const task = await getTaskById(taskId);

        if (!task) {
            _showError();
            return;
        }

        _renderContent(task);
    } catch (error) {
        console.error('Failed to load task for preview:', error);
        _showError();
    }

    // Focus close button for accessibility
    setTimeout(() => {
        Elements.closeBtn?.focus();
    }, 100);
}

/**
 * Close the drawer
 */
function closeDrawer() {
    if (!State.isOpen) return;

    // Hide drawer
    State.isOpen = false;
    State.currentTaskId = null;
    Elements.drawer.classList.remove('open');
    Elements.drawer.classList.add('hidden');
    Elements.overlay.classList.remove('visible');
    Elements.drawer.setAttribute('aria-hidden', 'true');

    // Unlock body scroll
    _lockScroll(false);

    // Restore focus
    if (State.previousFocus && State.previousFocus.focus) {
        State.previousFocus.focus();
    }
}

/**
 * Toggle drawer open/close
 * @param {string} taskId - Task ID (required when opening)
 */
function toggleDrawer(taskId) {
    if (State.isOpen) {
        closeDrawer();
    } else if (taskId) {
        openDrawer(taskId);
    }
}

// ============================================
// Content Rendering
// ============================================

/**
 * Render task content in drawer
 * @param {Object} task - Task object
 */
function _renderContent(task) {
    // Hide all states first
    Elements.loadingState.style.display = 'none';
    Elements.errorState.style.display = 'none';
    Elements.contentState.style.display = 'block';

    // Status
    const statusInfo = formatStatus(task.status);
    Elements.status.textContent = statusInfo.label;
    Elements.status.className = `task-preview-drawer__status badge badge-${statusInfo.color}`;

    // Title
    Elements.title.textContent = task.title || '无标题';

    // Publisher info
    const publisherName = getPublisherName(task);
    const publisherAvatar = getPublisherAvatar(task);
    const isVerified = isPublisherVerified(task);
    const rating = getPublisherRating(task);

    Elements.publisherName.textContent = publisherName;
    Elements.publisherAvatar.src = publisherAvatar;
    Elements.publisherAvatar.alt = publisherName;

    if (isVerified) {
        Elements.publisherVerified.style.display = 'inline';
    } else {
        Elements.publisherVerified.style.display = 'none';
    }

    if (rating !== null) {
        Elements.publisherRating.style.display = 'flex';
        Elements.publisherRatingValue.textContent = rating.toFixed(1);
    } else {
        Elements.publisherRating.style.display = 'none';
    }

    // Description or summary
    if (hasDescription(task)) {
        Elements.description.style.display = 'block';
        Elements.descriptionText.textContent = getDescription(task);
        Elements.summary.style.display = 'none';
    } else {
        Elements.description.style.display = 'none';
        Elements.summary.style.display = 'block';
        Elements.summary.textContent = task.summary || '暂无描述';
    }

    // Key info
    Elements.budget.textContent = formatBudget(task);
    Elements.duration.textContent = formatDuration(task);

    // Format deadline
    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        Elements.deadline.textContent = deadlineDate.toLocaleDateString('zh-CN');
    } else {
        Elements.deadline.textContent = '未设置';
    }

    // Tech stacks
    const stacks = getStacks(task);
    if (stacks.length > 0) {
        Elements.stacks.style.display = 'block';
        Elements.stacksList.innerHTML = stacks.map(stack =>
            `<span class="task-preview-drawer__stack">${stack}</span>`
        ).join('');
    } else {
        Elements.stacks.style.display = 'none';
    }

    // Detail button link
    Elements.detailBtn.href = `task-detail.html?id=${task.id}`;
}

/**
 * Show loading state
 */
function _showLoading() {
    Elements.loadingState.style.display = 'block';
    Elements.errorState.style.display = 'none';
    Elements.contentState.style.display = 'none';
}

/**
 * Show error state
 */
function _showError() {
    Elements.loadingState.style.display = 'none';
    Elements.errorState.style.display = 'flex';
    Elements.contentState.style.display = 'none';
}

// ============================================
// Event Handlers
// ============================================

/**
 * Handle overlay click
 */
function handleOverlayClick(e) {
    if (e.target === Elements.overlay) {
        closeDrawer();
    }
}

/**
 * Handle close button click
 */
function handleCloseBtnClick() {
    closeDrawer();
}

/**
 * Handle ESC key press
 */
function handleEscapeKey(e) {
    if (e.key === 'Escape' && State.isOpen) {
        closeDrawer();
    }
}

// ============================================
// Scroll Lock
// ============================================

/**
 * Lock or unlock body scroll
 * @param {boolean} lock - Whether to lock scroll
 */
function _lockScroll(lock) {
    if (lock) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize event listeners
 */
function init() {
    // Overlay click
    if (Elements.overlay) {
        Elements.overlay.addEventListener('click', handleOverlayClick);
    }

    // Close button
    if (Elements.closeBtn) {
        Elements.closeBtn.addEventListener('click', handleCloseBtnClick);
    }

    // ESC key
    document.addEventListener('keydown', handleEscapeKey);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================
// Export
// ============================================

const TaskPreviewDrawer = {
    open: openDrawer,
    close: closeDrawer,
    toggle: toggleDrawer,
    isOpen: () => State.isOpen,
    getCurrentTaskId: () => State.currentTaskId
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskPreviewDrawer;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.TaskPreviewDrawer = TaskPreviewDrawer;
}
