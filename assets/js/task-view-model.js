/**
 * [FILE] task-view-model.js
 * [POS] 任务视图模型 - 数据格式化和默认值处理
 * [IN] 任务对象 (task)、枚举值
 * [OUT] 格式化后的显示内容
 * [DEP] task-config.js (枚举常量)
 * [SIDE EFFECT] 无 (纯函数转换)
 * [TEST] 调用各方法验证输出格式正确性
 *
 * Task View Model
 * ============================================
 *
 * 提供统一的数据格式化接口，处理字段缺失情况
 * 被预览抽屉和详情页共享使用
 */

// ============================================
// Constants
// ============================================

const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="14"%3E%3F%3C/text%3E%3C/svg%3E';

// ============================================
// Budget Formatting
// ============================================

/**
 * Format task budget for display
 * @param {Object} task - Task object
 * @returns {string} Formatted budget string
 * @example
 * formatBudget({ budgetMin: 5000, budgetMax: 10000 }) // "¥5,000 - ¥10,000"
 * formatBudget({ budgetMin: 15000, budgetMax: 15000 }) // "¥15,000"
 * formatBudget({}) // "预算待定"
 */
function formatBudget(task) {
    if (!task || typeof task.budgetMin !== 'number' || typeof task.budgetMax !== 'number') {
        return '预算待定';
    }

    const min = task.budgetMin;
    const max = task.budgetMax;

    if (min === max) {
        return `¥${min.toLocaleString('zh-CN')}`;
    }

    return `¥${min.toLocaleString('zh-CN')} - ¥${max.toLocaleString('zh-CN')}`;
}

// ============================================
// Duration Formatting
// ============================================

/**
 * Format task duration for display
 * @param {Object} task - Task object
 * @returns {string} Formatted duration string
 * @example
 * formatDuration({ durationDays: 14 }) // "14 天"
 * formatDuration({}) // "工期待定"
 */
function formatDuration(task) {
    if (!task || typeof task.durationDays !== 'number') {
        return '工期待定';
    }

    return `${task.durationDays} 天`;
}

// ============================================
// Delivery Mode Formatting
// ============================================

/**
 * Format delivery mode for display
 * @param {string} mode - Delivery mode value
 * @returns {Object} Mode info with label and description
 * @example
 * formatDeliveryMode('milestone') // { label: '里程碑分期', description: '按阶段验收付款' }
 * formatDeliveryMode('unknown') // { label: '未知模式', description: '' }
 */
function formatDeliveryMode(mode) {
    // Import from task-config if available
    const options = typeof DELIVERY_MODE_OPTIONS !== 'undefined'
        ? DELIVERY_MODE_OPTIONS
        : [
            { value: 'milestone', label: '里程碑分期', description: '按阶段验收付款' },
            { value: 'hourly', label: '按小时计费', description: '按工作时长结算' },
            { value: 'hybrid', label: '混合模式', description: '预付款 + 里程碑' }
        ];

    const found = options.find(o => o.value === mode);
    return found || { label: '未知模式', description: '' };
}

// ============================================
// Status Formatting
// ============================================

/**
 * Format task status for display
 * @param {string} status - Status value
 * @returns {Object} Status info with label and color
 * @example
 * formatStatus('recruiting') // { label: '招募中', color: 'success' }
 * formatStatus('unknown') // { label: '未知状态', color: 'gray' }
 */
function formatStatus(status) {
    // Import from task-config if available
    const options = typeof STATUS_OPTIONS !== 'undefined'
        ? STATUS_OPTIONS
        : [
            { value: 'recruiting', label: '招募中', color: 'success' },
            { value: 'in-progress', label: '进行中', color: 'primary' },
            { value: 'closed', label: '已结束', color: 'gray' }
        ];

    const found = options.find(o => o.value === status);
    return found || { label: '未知状态', color: 'gray' };
}

// ============================================
// Category Formatting
// ============================================

/**
 * Format task category for display
 * @param {string} category - Category value
 * @returns {Object} Category info with label and icon
 * @example
 * formatCategory('web') // { label: 'Web 开发', icon: 'globe' }
 * formatCategory('unknown') // { label: '其他', icon: 'more-horizontal' }
 */
function formatCategory(category) {
    // Import from task-config if available
    const options = typeof CATEGORY_OPTIONS !== 'undefined'
        ? CATEGORY_OPTIONS
        : [
            { value: 'web', label: 'Web 开发', icon: 'globe' },
            { value: 'mobile', label: '移动应用', icon: 'smartphone' },
            { value: 'ai', label: 'AI/机器学习', icon: 'cpu' },
            { value: 'design-system', label: '设计系统', icon: 'palette' },
            { value: 'other', label: '其他', icon: 'more-horizontal' }
        ];

    const found = options.find(o => o.value === category);
    return found || { label: '其他', icon: 'more-horizontal' };
}

// ============================================
// Published Date Formatting
// ============================================

/**
 * Format published date for display
 * @param {string} dateStr - ISO 8601 date string
 * @returns {string} Formatted date string
 * @example
 * formatPublishedDate('2026-03-25T08:00:00+08:00') // "2026年3月25日"
 * formatPublishedDate(null) // ""
 */
function formatPublishedDate(dateStr) {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}年${month}月${day}日`;
}

/**
 * Format published date as relative time
 * @param {string} dateStr - ISO 8601 date string
 * @returns {string} Relative time string
 * @example
 * formatPublishedDateRelative('2026-03-25T08:00:00+08:00') // "14天前"
 * formatPublishedDateRelative(null) // ""
 */
function formatPublishedDateRelative(dateStr) {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return '今天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
    return `${Math.floor(diffDays / 365)}年前`;
}

// ============================================
// Publisher Information
// ============================================

/**
 * Get publisher name from task
 * @param {Object} task - Task object
 * @returns {string} Publisher name
 * @example
 * getPublisherName({ publisher: { name: 'ABC公司' } }) // "ABC公司"
 * getPublisherName({ clientName: 'ABC公司' }) // "ABC公司"
 * getPublisherName({}) // "未知发布方"
 */
function getPublisherName(task) {
    if (!task) return '未知发布方';

    // Priority: publisher.name > clientName
    if (task.publisher && task.publisher.name) {
        return task.publisher.name;
    }

    if (task.clientName) {
        return task.clientName;
    }

    return '未知发布方';
}

/**
 * Get publisher avatar from task
 * @param {Object} task - Task object
 * @returns {string} Avatar URL
 * @example
 * getPublisherAvatar({ publisher: { avatar: 'https://...' } }) // "https://..."
 * getPublisherAvatar({}) // DEFAULT_AVATAR
 */
function getPublisherAvatar(task) {
    if (!task) return DEFAULT_AVATAR;

    if (task.publisher && task.publisher.avatar) {
        return task.publisher.avatar;
    }

    return DEFAULT_AVATAR;
}

/**
 * Get publisher rating from task
 * @param {Object} task - Task object
 * @returns {number|null} Rating value (0-5) or null if not available
 * @example
 * getPublisherRating({ publisher: { rating: 4.8 } }) // 4.8
 * getPublisherRating({}) // null
 */
function getPublisherRating(task) {
    if (!task || !task.publisher || typeof task.publisher.rating !== 'number') {
        return null;
    }
    return task.publisher.rating;
}

/**
 * Check if publisher is verified
 * @param {Object} task - Task object
 * @returns {boolean} Verified status
 * @example
 * isPublisherVerified({ publisher: { verified: true } }) // true
 * isPublisherVerified({}) // false
 */
function isPublisherVerified(task) {
    if (!task || !task.publisher) return false;
    return Boolean(task.publisher.verified);
}

// ============================================
// Task Content Checks
// ============================================

/**
 * Check if task has description
 * @param {Object} task - Task object
 * @returns {boolean} Has description
 * @example
 * hasDescription({ description: 'Some text' }) // true
 * hasDescription({}) // false
 */
function hasDescription(task) {
    if (!task || !task.description) return false;
    return typeof task.description === 'string' && task.description.trim().length > 0;
}

/**
 * Check if task has requirements
 * @param {Object} task - Task object
 * @returns {boolean} Has requirements
 * @example
 * hasRequirements({ requirements: ['A', 'B'] }) // true
 * hasRequirements({ requirements: [] }) // false
 * hasRequirements({}) // false
 */
function hasRequirements(task) {
    if (!task || !task.requirements) return false;
    return Array.isArray(task.requirements) && task.requirements.length > 0;
}

/**
 * Check if task has deliverables
 * @param {Object} task - Task object
 * @returns {boolean} Has deliverables
 * @example
 * hasDeliverables({ deliverables: ['A', 'B'] }) // true
 * hasDeliverables({ deliverables: [] }) // false
 * hasDeliverables({}) // false
 */
function hasDeliverables(task) {
    if (!task || !task.deliverables) return false;
    return Array.isArray(task.deliverables) && task.deliverables.length > 0;
}

/**
 * Check if task has tech stacks
 * @param {Object} task - Task object
 * @returns {boolean} Has tech stacks
 * @example
 * hasStacks({ stacks: ['react', 'vue'] }) // true
 * hasStacks({ stacks: [] }) // false
 * hasStacks({}) // false
 */
function hasStacks(task) {
    if (!task || !task.stacks) return false;
    return Array.isArray(task.stacks) && task.stacks.length > 0;
}

// ============================================
// Safe Getters (with defaults)
// ============================================

/**
 * Safely get task description
 * @param {Object} task - Task object
 * @returns {string} Description or empty string
 */
function getDescription(task) {
    if (!hasDescription(task)) return '';
    return task.description.trim();
}

/**
 * Safely get task requirements
 * @param {Object} task - Task object
 * @returns {Array} Requirements array or empty array
 */
function getRequirements(task) {
    if (!hasRequirements(task)) return [];
    return task.requirements;
}

/**
 * Safely get task deliverables
 * @param {Object} task - Task object
 * @returns {Array} Deliverables array or empty array
 */
function getDeliverables(task) {
    if (!hasDeliverables(task)) return [];
    return task.deliverables;
}

/**
 * Safely get task stacks
 * @param {Object} task - Task object
 * @returns {Array} Stacks array or empty array
 */
function getStacks(task) {
    if (!hasStacks(task)) return [];
    return task.stacks;
}

// ============================================
// Export
// ============================================

const TaskViewModel = {
    // Formatting
    formatBudget,
    formatDuration,
    formatDeliveryMode,
    formatStatus,
    formatCategory,
    formatPublishedDate,
    formatPublishedDateRelative,

    // Publisher
    getPublisherName,
    getPublisherAvatar,
    getPublisherRating,
    isPublisherVerified,

    // Content checks
    hasDescription,
    hasRequirements,
    hasDeliverables,
    hasStacks,

    // Safe getters
    getDescription,
    getRequirements,
    getDeliverables,
    getStacks
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskViewModel;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.TaskViewModel = TaskViewModel;
}
