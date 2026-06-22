/**
 * [FILE] task-config.js
 * [POS] 任务配置 - 枚举值、常量定义、验证规则
 * [IN] 无
 * [OUT] 配置对象、枚举数组
 * [DEP] 无
 * [SIDE EFFECT] 无（纯数据配置）
 * [TEST] N/A（配置文件，通过使用测试）
 *
 * Task Configuration
 * ============================================
 *
 * 未来可由 API 返回可选项并替换本地常量
 */

// ============================================
// Task Category Options
// ============================================

const CATEGORY_OPTIONS = [
    { value: 'web', label: 'Web 开发', icon: 'globe' },
    { value: 'mobile', label: '移动应用', icon: 'smartphone' },
    { value: 'ai', label: 'AI/机器学习', icon: 'cpu' },
    { value: 'design-system', label: '设计系统', icon: 'palette' },
    { value: 'other', label: '其他', icon: 'more-horizontal' }
];

// ============================================
// Tech Stack Options
// ============================================

const STACK_OPTIONS = [
    { value: 'react', label: 'React', count: null },
    { value: 'vue', label: 'Vue.js', count: null },
    { value: 'typescript', label: 'TypeScript', count: null },
    { value: 'python', label: 'Python', count: null },
    { value: 'nodejs', label: 'Node.js', count: null },
    { value: 'fastapi', label: 'FastAPI', count: null },
    { value: 'nextjs', label: 'Next.js', count: null },
    { value: 'nestjs', label: 'NestJS', count: null },
    { value: 'django', label: 'Django', count: null },
    { value: 'flutter', label: 'Flutter', count: null },
    { value: 'swift', label: 'Swift', count: null },
    { value: 'go', label: 'Go', count: null },
    { value: 'other', label: '其他', count: null }
];

// ============================================
// Delivery Mode Options
// ============================================

const DELIVERY_MODE_OPTIONS = [
    { value: 'milestone', label: '里程碑分期', description: '按阶段验收付款' },
    { value: 'hourly', label: '按小时计费', description: '按工作时长结算' },
    { value: 'hybrid', label: '混合模式', description: '预付款 + 里程碑' }
];

// ============================================
// Budget Range Options
// ============================================

const BUDGET_RANGE_OPTIONS = [
    { value: 'lt-5k', label: '¥5,000 以下', min: 0, max: 5000 },
    { value: '5k-10k', label: '¥5,000 - ¥10,000', min: 5000, max: 10000 },
    { value: '10k-20k', label: '¥10,000 - ¥20,000', min: 10000, max: 20000 },
    { value: '20k-50k', label: '¥20,000 - ¥50,000', min: 20000, max: 50000 },
    { value: '50k-plus', label: '¥50,000 以上', min: 50000, max: Infinity }
];

// ============================================
// Duration Range Options
// ============================================

const DURATION_RANGE_OPTIONS = [
    { value: 'lt-8', label: '8 天以下', min: 0, max: 8 },
    { value: '8-15', label: '8 - 15 天', min: 8, max: 16 },
    { value: '16-30', label: '16 - 30 天', min: 16, max: 31 },
    { value: '31-60', label: '31 - 60 天', min: 31, max: 61 },
    { value: '60-plus', label: '60 天以上', min: 61, max: Infinity }
];

// ============================================
// Task Status Options
// ============================================

const STATUS_OPTIONS = [
    { value: 'recruiting', label: '招募中', color: 'success' },
    { value: 'in-progress', label: '进行中', color: 'primary' },
    { value: 'closed', label: '已结束', color: 'gray' }
];

// ============================================
// Sort Options
// ============================================

const SORT_OPTIONS = [
    { value: 'updated-desc', label: '最新更新' },
    { value: 'budget-desc', label: '预算从高到低' },
    { value: 'budget-asc', label: '预算从低到高' },
    { value: 'deadline-asc', label: '截止时间' }
];

// ============================================
// Pagination Config
// ============================================

const PAGINATION_CONFIG = {
    pageSize: 12,
    maxVisiblePages: 7
};

// ============================================
// URL Parameter Keys
// ============================================

const URL_PARAMS = {
    KEYWORD: 'keyword',
    CATEGORY: 'category',
    STACK: 'stack',
    DELIVERY_MODE: 'deliveryMode',
    BUDGET_RANGE: 'budgetRange',
    DURATION_RANGE: 'durationRange',
    STATUS: 'status',
    SORT: 'sort',
    PAGE: 'page'
};

// ============================================
// Default Values
// ============================================

const DEFAULTS = {
    sort: 'updated-desc',
    page: 1,
    status: ['recruiting'] // Default show only recruiting tasks
};

// ============================================
// Validation Rules
// ============================================

const VALIDATION = {
    // Whitelist of allowed enum values
    allowedCategories: CATEGORY_OPTIONS.map(o => o.value),
    allowedStacks: STACK_OPTIONS.map(o => o.value),
    allowedDeliveryModes: DELIVERY_MODE_OPTIONS.map(o => o.value),
    allowedBudgetRanges: BUDGET_RANGE_OPTIONS.map(o => o.value),
    allowedDurationRanges: DURATION_RANGE_OPTIONS.map(o => o.value),
    allowedStatuses: STATUS_OPTIONS.map(o => o.value),
    allowedSorts: SORT_OPTIONS.map(o => o.value),

    // Page constraints
    minPage: 1,
    maxPage: 1000,

    // Search constraints
    maxKeywordLength: 100,
    searchDebounceMs: 300
};

// ============================================
// Helper Functions
// ============================================ */

/**
 * Check if a value is in the allowed list
 */
function isAllowedValue(value, allowedList) {
    return allowedList.includes(value);
}

/**
 * Validate and sanitize URL parameter values
 */
function validateParam(key, value) {
    switch (key) {
        case URL_PARAMS.CATEGORY:
            return isAllowedValue(value, VALIDATION.allowedCategories) ? value : null;
        case URL_PARAMS.STACK:
            return isAllowedValue(value, VALIDATION.allowedStacks) ? value : null;
        case URL_PARAMS.DELIVERY_MODE:
            return isAllowedValue(value, VALIDATION.allowedDeliveryModes) ? value : null;
        case URL_PARAMS.BUDGET_RANGE:
            return isAllowedValue(value, VALIDATION.allowedBudgetRanges) ? value : null;
        case URL_PARAMS.DURATION_RANGE:
            return isAllowedValue(value, VALIDATION.allowedDurationRanges) ? value : null;
        case URL_PARAMS.STATUS:
            return isAllowedValue(value, VALIDATION.allowedStatuses) ? value : null;
        case URL_PARAMS.SORT:
            return isAllowedValue(value, VALIDATION.allowedSorts) ? value : DEFAULTS.sort;
        case URL_PARAMS.PAGE:
            const page = parseInt(value, 10);
            if (isNaN(page) || page < VALIDATION.minPage) return DEFAULTS.page;
            if (page > VALIDATION.maxPage) return VALIDATION.maxPage;
            return page;
        case URL_PARAMS.KEYWORD:
            if (typeof value !== 'string') return '';
            if (value.length > VALIDATION.maxKeywordLength) {
                return value.substring(0, VALIDATION.maxKeywordLength);
            }
            // XSS protection: basic sanitization
            return value.replace(/[<>]/g, '');
        default:
            return null;
    }
}

/**
 * Get budget range bounds
 */
function getBudgetRangeBounds(rangeValue) {
    const option = BUDGET_RANGE_OPTIONS.find(o => o.value === rangeValue);
    return option ? { min: option.min, max: option.max } : null;
}

/**
 * Get duration range bounds
 */
function getDurationRangeBounds(rangeValue) {
    const option = DURATION_RANGE_OPTIONS.find(o => o.value === rangeValue);
    return option ? { min: option.min, max: option.max } : null;
}

/**
 * Get status display info
 */
function getStatusInfo(statusValue) {
    return STATUS_OPTIONS.find(o => o.value === statusValue) || null;
}

/**
 * Get category display info
 */
function getCategoryInfo(categoryValue) {
    return CATEGORY_OPTIONS.find(o => o.value === categoryValue) || null;
}

// ============================================
// Export
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CATEGORY_OPTIONS,
        STACK_OPTIONS,
        DELIVERY_MODE_OPTIONS,
        BUDGET_RANGE_OPTIONS,
        DURATION_RANGE_OPTIONS,
        STATUS_OPTIONS,
        SORT_OPTIONS,
        PAGINATION_CONFIG,
        URL_PARAMS,
        DEFAULTS,
        VALIDATION,
        validateParam,
        getBudgetRangeBounds,
        getDurationRangeBounds,
        getStatusInfo,
        getCategoryInfo
    };
}

if (typeof window !== 'undefined') {
    window.CATEGORY_OPTIONS = CATEGORY_OPTIONS;
    window.STACK_OPTIONS = STACK_OPTIONS;
    window.DELIVERY_MODE_OPTIONS = DELIVERY_MODE_OPTIONS;
    window.BUDGET_RANGE_OPTIONS = BUDGET_RANGE_OPTIONS;
    window.DURATION_RANGE_OPTIONS = DURATION_RANGE_OPTIONS;
    window.STATUS_OPTIONS = STATUS_OPTIONS;
    window.SORT_OPTIONS = SORT_OPTIONS;
    window.PAGINATION_CONFIG = PAGINATION_CONFIG;
    window.URL_PARAMS = URL_PARAMS;
    window.DEFAULTS = DEFAULTS;
    window.TASK_VALIDATION = VALIDATION;
    window.validateTaskParam = validateParam;
    window.getBudgetRangeBounds = getBudgetRangeBounds;
    window.getDurationRangeBounds = getDurationRangeBounds;
    window.getStatusInfo = getStatusInfo;
    window.getCategoryInfo = getCategoryInfo;
}
