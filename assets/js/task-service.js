/**
 * [FILE] task-service.js
 * [POS] 数据服务层 - 任务数据访问、筛选、排序、分页
 * [IN] URL 参数、筛选条件
 * [OUT] 筛选后的任务数据
 * [DEP] tasks.mock.json (数据源), task-config.js (配置)
 * [SIDE EFFECT] HTTP 请求获取 mock 数据
 * [TEST] 手动测试: 验证数据获取、筛选、排序、分页
 *
 * Task Service
 * ============================================
 *
 * 后续接真实 API 时，仅替换此文件的数据获取逻辑
 */

// ============================================
// State
// ============================================

let cachedTasks = null;
let loadPromise = null; // Promise cache to prevent race conditions
let cachedVersion = -1;

function getRepository() {
    if (typeof window !== 'undefined' && window.taskRuntimeRepository) {
        return window.taskRuntimeRepository;
    }

    throw new Error('taskRuntimeRepository is not available');
}

// ============================================
// Data Fetching
// ============================================

/**
 * Fetch all tasks from mock data
 * @returns {Promise<Array>} Array of task objects
 */
async function fetchTasks() {
    const repository = getRepository();
    const repositoryVersion = repository.getVersion();

    // Return cached tasks if available
    if (cachedTasks && cachedVersion === repositoryVersion) {
        console.log('Using cached tasks:', cachedTasks.length);
        return cachedTasks;
    }

    // Return existing promise if already loading (prevents race condition)
    if (loadPromise) {
        console.log('Tasks already loading, waiting for existing promise...');
        return loadPromise;
    }

    // Create and cache the loading promise
    loadPromise = (async () => {
        console.log('Fetching tasks from taskRuntimeRepository...');

        try {
            cachedTasks = await repository.getAllTasks();
            cachedVersion = repositoryVersion;
            console.log('Tasks loaded successfully:', cachedTasks.length);
            return cachedTasks;
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            console.error('Error details:', error.message);
            throw error;
        } finally {
            // Clear the promise cache after completion
            loadPromise = null;
        }
    })();

    return loadPromise;
}

/**
 * Clear cached tasks (for testing or refresh)
 */
function clearTaskCache() {
    cachedTasks = null;
    cachedVersion = -1;
}

// ============================================
// Filtering
// ============================================

/**
 * Check if task matches budget range
 */
function matchesBudgetRange(task, budgetRange) {
    const bounds = getBudgetRangeBounds(budgetRange);
    if (!bounds) return false;

    // Use average budget for matching
    const avgBudget = (task.budgetMin + task.budgetMax) / 2;
    return avgBudget >= bounds.min && avgBudget < bounds.max;
}

/**
 * Check if task matches duration range
 */
function matchesDurationRange(task, durationRange) {
    const bounds = getDurationRangeBounds(durationRange);
    if (!bounds) return false;

    return task.durationDays >= bounds.min && task.durationDays < bounds.max;
}

/**
 * Filter tasks by criteria
 * @param {Array} tasks - Array of task objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered tasks
 */
function filterTasks(tasks, filters) {
    let filtered = [...tasks];

    // Keyword search (AND with other filters)
    if (filters.keyword && filters.keyword.trim()) {
        const keyword = filters.keyword.toLowerCase().trim();
        filtered = filtered.filter(task =>
            task.title.toLowerCase().includes(keyword) ||
            task.summary.toLowerCase().includes(keyword) ||
            task.clientName.toLowerCase().includes(keyword)
        );
    }

    // Category (OR within group)
    if (filters.category && filters.category.length > 0) {
        filtered = filtered.filter(task =>
            filters.category.includes(task.category)
        );
    }

    // Tech stack (OR within group)
    if (filters.stack && filters.stack.length > 0) {
        filtered = filtered.filter(task =>
            task.stacks.some(s => filters.stack.includes(s))
        );
    }

    // Delivery mode (OR within group)
    if (filters.deliveryMode && filters.deliveryMode.length > 0) {
        filtered = filtered.filter(task =>
            filters.deliveryMode.includes(task.deliveryMode)
        );
    }

    // Budget range (OR within group)
    if (filters.budgetRange && filters.budgetRange.length > 0) {
        filtered = filtered.filter(task =>
            filters.budgetRange.some(range => matchesBudgetRange(task, range))
        );
    }

    // Duration range (OR within group)
    if (filters.durationRange && filters.durationRange.length > 0) {
        filtered = filtered.filter(task =>
            filters.durationRange.some(range => matchesDurationRange(task, range))
        );
    }

    // Status (OR within group)
    if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(task =>
            filters.status.includes(task.status)
        );
    }

    return filtered;
}

// ============================================
// Sorting
// ============================================

/**
 * Sort tasks by criteria
 * @param {Array} tasks - Array of task objects
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted tasks
 */
function sortTasks(tasks, sortBy = 'updated-desc') {
    const sorted = [...tasks];

    switch (sortBy) {
        case 'updated-desc':
            sorted.sort((a, b) =>
                new Date(b.updatedAt) - new Date(a.updatedAt)
            );
            break;

        case 'budget-desc':
            sorted.sort((a, b) => b.budgetMax - a.budgetMax);
            break;

        case 'budget-asc':
            sorted.sort((a, b) => a.budgetMin - b.budgetMin);
            break;

        case 'deadline-asc':
            sorted.sort((a, b) =>
                new Date(a.deadline) - new Date(b.deadline)
            );
            break;

        default:
            // Default to updated-desc
            sorted.sort((a, b) =>
                new Date(b.updatedAt) - new Date(a.updatedAt)
            );
    }

    return sorted;
}

// ============================================
// Pagination
// ============================================

/**
 * Paginate tasks
 * @param {Array} tasks - Array of task objects
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Items per page
 * @returns {Object} Paginated result
 */
function paginateTasks(tasks, page = 1, pageSize = 12) {
    const totalItems = tasks.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = tasks.slice(startIndex, endIndex);

    return {
        items,
        pagination: {
            currentPage,
            totalPages,
            totalItems,
            pageSize,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1
        }
    };
}

// ============================================
// Main Query Function
// ============================================

/**
 * Query tasks with filters, sorting, and pagination
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function queryTasks(params = {}) {
    // Fetch all tasks
    const allTasks = await fetchTasks();

    // Apply filters
    const filteredTasks = filterTasks(allTasks, {
        keyword: params.keyword || '',
        category: params.category || [],
        stack: params.stack || [],
        deliveryMode: params.deliveryMode || [],
        budgetRange: params.budgetRange || [],
        durationRange: params.durationRange || [],
        status: params.status || []
    });

    // Apply sorting
    const sortedTasks = sortTasks(filteredTasks, params.sort);

    // Apply pagination
    const { items, pagination } = paginateTasks(
        sortedTasks,
        params.page || 1,
        params.pageSize || PAGINATION_CONFIG.pageSize
    );

    return {
        tasks: items,
        pagination,
        filterCount: filteredTasks.length
    };
}

// ============================================
// Single Task Query
// ============================================

/**
 * Get a single task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise<Object|null>} Task object or null if not found
 */
async function getTaskById(taskId) {
    if (!taskId || typeof taskId !== 'string') {
        console.warn('Invalid taskId provided to getTaskById:', taskId);
        return null;
    }

    const repository = getRepository();
    const task = await repository.getTaskById(taskId);

    if (!task) {
        console.warn('Task not found:', taskId);
        return null;
    }

    return task;
}

// ============================================
// Export
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchTasks,
        clearTaskCache,
        filterTasks,
        sortTasks,
        paginateTasks,
        queryTasks,
        getTaskById
    };
}

if (typeof window !== 'undefined') {
    window.fetchTasks = fetchTasks;
    window.clearTaskCache = clearTaskCache;
    window.filterTasks = filterTasks;
    window.sortTasks = sortTasks;
    window.paginateTasks = paginateTasks;
    window.queryTasks = queryTasks;
    window.getTaskById = getTaskById;
}
