/**
 * [FILE] profile-config.js
 * [POS] 用户中心配置 - 双页面共享配置，定义差异化行为
 * [IN] 无
 * [OUT] 配置对象
 * [DEP] 无
 * [SIDE EFFECT] 无（纯数据配置）
 * [TEST] 验证配置对象结构正确
 *
 * User Center Profile Configuration
 * ============================================
 *
 * 设计原则：双页面共享模板和配置，避免维护两份代码
 */

// ============================================
// Feature Flags（功能开关）
// ============================================
export const FEATURE_FLAGS = {
    MESSAGE_CENTER: true,    // 消息中心开关
    TASK_MANAGEMENT: true,   // 任务管理开关
    PROFILE_EDIT: true,      // 资料编辑开关
    OVERVIEW_STATS: true     // 概览统计开关
};

// ============================================
// Message Types（消息类型配置）
// ============================================
export const MESSAGE_TYPES = {
    SYSTEM: 'system',    // 系统通知
    TASK: 'task'        // 任务相关（暂不实现 private 私信）
};

export const MESSAGE_TYPE_CONFIG = {
    [MESSAGE_TYPES.SYSTEM]: {
        label: '系统通知',
        icon: 'bell',
        canDelete: true
    },
    [MESSAGE_TYPES.TASK]: {
        label: '任务消息',
        icon: 'document',
        canDelete: true
    }
};

// ============================================
// Application Status（申请状态配置）
// ============================================
export const APPLICATION_STATUS = {
    PENDING: 'pending',       // 竞标中
    ACCEPTED: 'accepted',     // 已接受
    REJECTED: 'rejected',     // 已拒绝
    WITHDRAWN: 'withdrawn'    // 已撤销
};

export const APPLICATION_STATUS_CONFIG = {
    [APPLICATION_STATUS.PENDING]: {
        label: '竞标中',
        color: 'warning'
    },
    [APPLICATION_STATUS.ACCEPTED]: {
        label: '已接受',
        color: 'success'
    },
    [APPLICATION_STATUS.REJECTED]: {
        label: '已拒绝',
        color: 'danger'
    },
    [APPLICATION_STATUS.WITHDRAWN]: {
        label: '已撤销',
        color: 'gray'
    }
};

// ============================================
// Profile Configuration（用户中心配置）
// ============================================
export const PROFILE_CONFIG = {
    client: {
        title: '客户中心',
        role: 'client',
        menuItems: [
            { id: 'overview', label: '概览', icon: 'dashboard' },
            { id: 'my-tasks', label: '我的任务', icon: 'tasks' },
            { id: 'messages', label: '消息中心', icon: 'messages' }
        ],
        taskTabs: [
            { id: 'all', label: '全部任务', filter: () => true },
            { id: 'recruiting', label: '招募中', filter: t => t.status === 'recruiting' },
            { id: 'in-progress', label: '进行中', filter: t => t.status === 'in-progress' },
            { id: 'closed', label: '已关闭', filter: t => t.status === 'closed' }
        ],
        statsCards: [
            { id: 'postedTasks', label: '发布任务', icon: 'briefcase', valuePath: 'stats.postedTasks' },
            { id: 'totalBudget', label: '总预算', icon: 'currency', valuePath: 'stats.totalBudget', format: 'currency' },
            { id: 'inProgressTasks', label: '进行中', icon: 'clock', valuePath: 'stats.inProgressTasks' },
            { id: 'completedTasks', label: '已完成', icon: 'check-circle', valuePath: 'stats.completedTasks' }
        ],
        emptyStates: {
            tasks: {
                title: '还没有发布任务',
                description: '去任务大厅看看，或发布您的第一个任务',
                actionLabel: '发布任务',
                actionLink: 'create-task.html'
            }
        }
    },
    developer: {
        title: '开发者中心',
        role: 'developer',
        menuItems: [
            { id: 'overview', label: '概览', icon: 'dashboard' },
            { id: 'my-participations', label: '我参与的', icon: 'participations' },
            { id: 'messages', label: '消息中心', icon: 'messages' }
        ],
        taskTabs: [
            { id: 'all', label: '全部参与', filter: () => true },
            { id: 'pending', label: '竞标中', filter: t => t.developerExtension?.applicationStatus === APPLICATION_STATUS.PENDING },
            { id: 'accepted', label: '已接受', filter: t => t.developerExtension?.applicationStatus === APPLICATION_STATUS.ACCEPTED },
            { id: 'completed', label: '已完成', filter: t => t.status === 'closed' && t.developerExtension?.applicationStatus === APPLICATION_STATUS.ACCEPTED }
        ],
        statsCards: [
            { id: 'completedTasks', label: '完成任务', icon: 'check-circle', valuePath: 'stats.completedTasks' },
            { id: 'totalEarnings', label: '总收入', icon: 'currency', valuePath: 'stats.totalEarnings', format: 'currency' },
            { id: 'rating', label: '评分', icon: 'star', valuePath: 'stats.rating', format: 'rating' },
            { id: 'responseRate', label: '响应率', icon: 'pulse', valuePath: 'stats.responseRate', format: 'percent' }
        ],
        emptyStates: {
            tasks: {
                title: '还没有参与任务',
                description: '去任务大厅看看，参与您感兴趣的任务',
                actionLabel: '浏览任务',
                actionLink: 'task-hall.html'
            }
        }
    }
};

// ============================================
// Pagination Config（分页配置）
// ============================================
export const PAGINATION_CONFIG = {
    messages: {
        pageSize: 20,
        maxVisiblePages: 5
    },
    tasks: {
        pageSize: 10,
        maxVisiblePages: 5
    }
};

// ============================================
// Validation Rules（验证规则）
// ============================================
export const VALIDATION_RULES = {
    profile: {
        name: {
            minLength: 2,
            maxLength: 20,
            required: true
        },
        bio: {
            maxLength: 200,
            required: false
        },
        website: {
            pattern: /^https?:\/\/.+/,
            required: false
        },
        location: {
            maxLength: 50,
            required: false
        }
    },
    avatar: {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxWidth: 500,
        maxHeight: 500
    },
    skills: {
        maxCount: 5
    }
};

// ============================================
// Polling Config（轮询配置）
// ============================================
export const POLLING_CONFIG = {
    messages: {
        interval: 30000, // 30秒
        enabled: true
    },
    tasks: {
        interval: 60000, // 60秒
        enabled: true
    }
};

// ============================================
// Helper Functions（辅助函数）
// ============================================

/**
 * 获取角色配置
 * @param {string} role - 角色 (client | developer)
 * @returns {Object} 角色配置
 */
export function getRoleConfig(role) {
    return PROFILE_CONFIG[role] || PROFILE_CONFIG.client;
}

/**
 * 获取申请状态配置
 * @param {string} status - 状态
 * @returns {Object} 状态配置
 */
export function getApplicationStatusConfig(status) {
    return APPLICATION_STATUS_CONFIG[status] || APPLICATION_STATUS_CONFIG[APPLICATION_STATUS.PENDING];
}

/**
 * 获取消息类型配置
 * @param {string} type - 消息类型
 * @returns {Object} 类型配置
 */
export function getMessageTypeConfig(type) {
    return MESSAGE_TYPE_CONFIG[type] || MESSAGE_TYPE_CONFIG[MESSAGE_TYPES.SYSTEM];
}

/**
 * 格式化数值
 * @param {*} value - 原始值
 * @param {string} format - 格式类型 (currency | percent | rating)
 * @returns {string} 格式化后的值
 */
export function formatValue(value, format) {
    if (value === null || value === undefined) {
        return '-';
    }

    switch (format) {
        case 'currency':
            return `¥${value.toLocaleString()}`;
        case 'percent':
            return `${value}%`;
        case 'rating':
            return value.toFixed(1);
        default:
            return value.toString();
    }
}

// ============================================
// Export（导出）
// ============================================
export default {
    FEATURE_FLAGS,
    MESSAGE_TYPES,
    MESSAGE_TYPE_CONFIG,
    APPLICATION_STATUS,
    APPLICATION_STATUS_CONFIG,
    PROFILE_CONFIG,
    PAGINATION_CONFIG,
    VALIDATION_RULES,
    POLLING_CONFIG,
    getRoleConfig,
    getApplicationStatusConfig,
    getMessageTypeConfig,
    formatValue
};
