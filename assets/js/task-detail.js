/**
 * [FILE] task-detail.js
 * [POS] 任务详情页交互逻辑 - 数据加载、状态处理、内容渲染
 * [IN] URL 参数 (id)、用户交互
 * [OUT] 页面状态切换、内容渲染
 * [DEP] task-service.js (数据加载), task-view-model.js (数据格式化)
 * [SIDE EFFECT] DOM 操作、状态切换、事件绑定
 * [TEST] 手动测试: 验证各状态显示、返回功能正常
 *
 * Task Detail Page Logic
 * ============================================
 */

// ============================================
// DOM Elements
// ============================================

const Elements = {
    // States
    loadingState: document.getElementById('detailLoadingState'),
    emptyState: document.getElementById('detailEmptyState'),
    errorState: document.getElementById('detailErrorState'),
    contentState: document.getElementById('detailContentState'),
    retryBtn: document.getElementById('retryLoadBtn'),
    backToHallBtn: document.getElementById('backToHallBtn'),

    // Title and Status
    title: document.getElementById('detailTitle'),
    status: document.getElementById('detailStatus'),
    category: document.getElementById('detailCategory'),

    // Sections
    descriptionSection: document.getElementById('detailDescriptionSection'),
    requirementsSection: document.getElementById('detailRequirementsSection'),
    deliverablesSection: document.getElementById('detailDeliverablesSection'),
    stacksSection: document.getElementById('detailStacksSection'),

    // Content
    description: document.getElementById('detailDescription'),
    requirements: document.getElementById('detailRequirements'),
    deliverables: document.getElementById('detailDeliverables'),
    stacks: document.getElementById('detailStacks'),

    // Key Info
    budget: document.getElementById('detailBudget'),
    deliveryMode: document.getElementById('detailDeliveryMode'),
    duration: document.getElementById('detailDuration'),
    deadline: document.getElementById('detailDeadline'),
    publishedAt: document.getElementById('detailPublishedAt'),
    updatedAt: document.getElementById('detailUpdatedAt'),

    // Publisher
    publisherAvatar: document.getElementById('detailPublisherAvatar'),
    publisherName: document.getElementById('detailPublisherName'),
    publisherVerified: document.getElementById('detailPublisherVerified'),
    publisherRating: document.getElementById('detailPublisherRating'),
    publisherRatingValue: document.getElementById('detailPublisherRatingValue'),
    publisherReviewCount: document.getElementById('detailPublisherReviewCount'),
    publisherStats: document.getElementById('detailPublisherStats'),
    publisherPublishedCount: document.getElementById('detailPublisherPublishedCount'),
    publisherCompletionRate: document.getElementById('detailPublisherCompletionRate'),

    // Actions
    acceptTaskBtn: document.getElementById('acceptTaskBtn')
};

// ============================================
// State
// ============================================

let currentTaskId = null;
let currentTaskData = null;
let authStateUnsubscribe = null;

function getCurrentUser() {
    return window.authState?.currentUser || null;
}

async function getCurrentUserApplication(taskId) {
    const currentUser = getCurrentUser();
    const repository = window.taskRuntimeRepository;

    if (!repository || !currentUser?.id) {
        return null;
    }

    return repository.getCurrentUserApplication(taskId, currentUser.id);
}

// ============================================
// URL Parameter Parsing
// ============================================

/**
 * Get task ID from URL parameters
 * @returns {string|null} Task ID or null
 */
function getTaskIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('id');
    return taskId || null;
}

/**
 * Validate task ID format
 * @param {string} taskId - Task ID to validate
 * @returns {boolean} Valid or not
 */
function isValidTaskId(taskId) {
    return typeof taskId === 'string' && taskId.trim().length > 0;
}

// ============================================
// State Display Management
// ============================================

/**
 * Show loading state
 */
function showLoading() {
    hideAllStates();
    Elements.loadingState.style.display = 'block';
}

/**
 * Show empty state (task not found)
 */
function showEmpty() {
    hideAllStates();
    Elements.emptyState.style.display = 'block';
}

/**
 * Show error state
 */
function showError() {
    hideAllStates();
    Elements.errorState.style.display = 'block';
}

/**
 * Show content state
 */
function showContent() {
    hideAllStates();
    Elements.contentState.style.display = 'block';
}

/**
 * Hide all states
 */
function hideAllStates() {
    Elements.loadingState.style.display = 'none';
    Elements.emptyState.style.display = 'none';
    Elements.errorState.style.display = 'none';
    Elements.contentState.style.display = 'none';
}

// ============================================
// Content Rendering
// ============================================

/**
 * Render task detail content
 * @param {Object} task - Task object
 */
function setAcceptTaskButtonState({
    visible = false,
    disabled = false,
    text = '接受任务',
    href = '',
    title = ''
} = {}) {
    if (!Elements.acceptTaskBtn) return;

    if (!visible) {
        Elements.acceptTaskBtn.style.display = 'none';
        Elements.acceptTaskBtn.removeAttribute('href');
        Elements.acceptTaskBtn.removeAttribute('aria-disabled');
        Elements.acceptTaskBtn.style.pointerEvents = '';
        Elements.acceptTaskBtn.style.opacity = '';
        return;
    }

    Elements.acceptTaskBtn.style.display = '';
    Elements.acceptTaskBtn.href = href || '';
    Elements.acceptTaskBtn.title = title;
    Elements.acceptTaskBtn.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    Elements.acceptTaskBtn.style.pointerEvents = disabled ? 'none' : '';
    Elements.acceptTaskBtn.style.opacity = disabled ? '0.68' : '';
    Elements.acceptTaskBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        ${escapeHtml(text)}
    `;
}

function renderAcceptTaskAction(task, currentUserApplication) {
    const currentUser = getCurrentUser();

    // 非开发者用户：完全隐藏接取任务按钮
    if (!currentUser || currentUser.role !== 'developer') {
        setAcceptTaskButtonState({ visible: false });
        return;
    }

    // 开发者用户：根据任务状态和申请状态显示按钮
    if (task.status !== 'recruiting') {
        setAcceptTaskButtonState({
            visible: true,
            disabled: true,
            text: '当前不可申请',
            title: '只有招募中的任务可以提交申请'
        });
        return;
    }

    if (!currentUserApplication) {
        setAcceptTaskButtonState({
            visible: true,
            disabled: false,
            text: '接受任务',
            href: `accept-task.html?taskId=${encodeURIComponent(task.id)}`
        });
        return;
    }

    const statusTextMap = {
        pending: '已提交申请',
        accepted: '已被接受',
        rejected: '申请未通过',
        withdrawn: '申请已撤回'
    };

    setAcceptTaskButtonState({
        visible: true,
        disabled: true,
        text: statusTextMap[currentUserApplication.status] || '已提交申请',
        title: '当前任务已存在您的申请记录'
    });
}

function renderTaskDetail(task, currentUserApplication = null) {
    // Title and Status
    Elements.title.textContent = task.title || '无标题';

    const statusInfo = formatStatus(task.status);
    Elements.status.textContent = statusInfo.label;
    Elements.status.className = `task-detail-status badge badge-${statusInfo.color}`;

    const categoryInfo = formatCategory(task.category);
    Elements.category.textContent = categoryInfo.label;

    // Description
    if (hasDescription(task)) {
        Elements.descriptionSection.style.display = 'block';
        Elements.description.textContent = getDescription(task);
    } else {
        Elements.descriptionSection.style.display = 'none';
    }

    // Requirements
    if (hasRequirements(task)) {
        Elements.requirementsSection.style.display = 'block';
        const requirements = getRequirements(task);
        Elements.requirements.innerHTML = requirements.map(req =>
            `<li class="task-detail-list-item">${escapeHtml(req)}</li>`
        ).join('');
    } else {
        Elements.requirementsSection.style.display = 'none';
    }

    // Deliverables
    if (hasDeliverables(task)) {
        Elements.deliverablesSection.style.display = 'block';
        const deliverables = getDeliverables(task);
        Elements.deliverables.innerHTML = deliverables.map(del =>
            `<li class="task-detail-list-item">${escapeHtml(del)}</li>`
        ).join('');
    } else {
        Elements.deliverablesSection.style.display = 'none';
    }

    // Tech Stacks
    if (hasStacks(task)) {
        Elements.stacksSection.style.display = 'block';
        const stacks = getStacks(task);
        Elements.stacks.innerHTML = stacks.map(stack =>
            `<span class="task-detail-stack">${escapeHtml(stack)}</span>`
        ).join('');
    } else {
        Elements.stacksSection.style.display = 'none';
    }

    // Key Info
    Elements.budget.textContent = formatBudget(task);
    Elements.duration.textContent = formatDuration(task);

    const modeInfo = formatDeliveryMode(task.deliveryMode);
    Elements.deliveryMode.textContent = modeInfo.label;

    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        Elements.deadline.textContent = deadlineDate.toLocaleDateString('zh-CN');
    } else {
        Elements.deadline.textContent = '未设置';
    }

    if (task.publishedAt) {
        Elements.publishedAt.textContent = formatPublishedDate(task.publishedAt);
    } else {
        Elements.publishedAt.textContent = '未知';
    }

    if (task.updatedAt) {
        const updatedDate = new Date(task.updatedAt);
        Elements.updatedAt.textContent = updatedDate.toLocaleDateString('zh-CN');
    } else {
        Elements.updatedAt.textContent = '未知';
    }

    // Publisher Info
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

        const reviewCount = task.publisher?.reviewCount || 0;
        Elements.publisherReviewCount.textContent = `(${reviewCount} 条评价)`;
    } else {
        Elements.publisherRating.style.display = 'none';
    }

    // Publisher Stats
    if (task.publisher) {
        const publishedCount = task.publisher.publishedCount || 0;
        const completionRate = task.publisher.completionRate || 0;

        if (publishedCount > 0 || completionRate > 0) {
            Elements.publisherStats.style.display = 'flex';
            Elements.publisherPublishedCount.textContent = publishedCount;
            Elements.publisherCompletionRate.textContent = `${completionRate}%`;
        } else {
            Elements.publisherStats.style.display = 'none';
        }
    } else {
        Elements.publisherStats.style.display = 'none';
    }

    renderAcceptTaskAction(task, currentUserApplication);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Data Loading
// ============================================

/**
 * Load task data
 * @param {string} taskId - Task ID
 */
async function loadTask(taskId) {
    showLoading();

    try {
        const task = await getTaskById(taskId);

        if (!task) {
            showEmpty();
            return;
        }

        // 保存任务数据以便后续使用
        currentTaskData = task;

        const currentUserApplication = await getCurrentUserApplication(task.id);
        renderTaskDetail(task, currentUserApplication);
        showContent();
    } catch (error) {
        console.error('Failed to load task:', error);
        showError();
    }
}

// ============================================
// Event Handlers
// ============================================

/**
 * Handle retry button click
 */
function handleRetry() {
    if (currentTaskId) {
        loadTask(currentTaskId);
    }
}

/**
 * Handle back to hall button click
 */
function handleBackToHall() {
    // Use history.back() to preserve filter context
    history.back();
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize task detail page
 */
function initTaskDetail() {
    console.log('Initializing task detail page...');

    // Get task ID from URL
    const taskId = getTaskIdFromURL();

    if (!isValidTaskId(taskId)) {
        console.warn('Invalid or missing task ID');
        showEmpty();
        return;
    }

    currentTaskId = taskId;

    // Bind events
    if (Elements.retryBtn) {
        Elements.retryBtn.addEventListener('click', handleRetry);
    }

    if (Elements.backToHallBtn) {
        Elements.backToHallBtn.addEventListener('click', handleBackToHall);
    }

    // 订阅认证状态变化，以便在登录/退出时更新按钮状态
    if (window.authState && typeof window.authState.subscribe === 'function') {
        authStateUnsubscribe = window.authState.subscribe((event) => {
            if (event === window.authState.EVENTS.LOGIN ||
                event === window.authState.EVENTS.LOGOUT ||
                event === window.authState.EVENTS.USER_UPDATE) {
                // 重新渲染按钮状态
                if (currentTaskData) {
                    getCurrentUserApplication(currentTaskData.id).then(application => {
                        renderAcceptTaskAction(currentTaskData, application);
                    });
                }
            }
        });
    }

    // Load task data
    loadTask(taskId);

    console.log('Task detail page initialized');
}

// ============================================
// Export
// ============================================

// Export init function for task-detail-main.js
if (typeof window !== 'undefined') {
    window.initTaskDetail = initTaskDetail;
}
