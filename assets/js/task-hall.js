/**
 * [FILE] task-hall.js
 * [POS] 任务大厅交互逻辑 - 筛选、搜索、排序、分页、URL 同步
 * [IN] DOM 元素、URL 参数、用户交互
 * [OUT] DOM 更新、URL 更新、任务卡片渲染
 * [DEP] task-config.js, task-service.js
 * [SIDE EFFECT] DOM 操作、URL 更新、事件绑定
 * [TEST] 手动测试: 验证所有交互功能
 *
 * Task Hall Page Logic
 * ============================================ */

// ============================================
// State
// ============================================

const state = {
    // Current filter values
    filters: {
        keyword: '',
        category: [],
        stack: [],
        deliveryMode: [],
        budgetRange: [],
        durationRange: [],
        status: [...DEFAULTS.status]
    },
    // Current sort
    sort: DEFAULTS.sort,
    // Current page
    page: DEFAULTS.page,
    // Task counts for filters
    filterCounts: {},
    // Loading state
    isLoading: false,
    // Mobile filter temp state
    mobileFiltersTemp: null
};

// ============================================
// DOM Elements
// ============================================

const elements = {
    // Search
    searchInput: document.getElementById('searchInput'),
    // Results
    resultsCount: document.getElementById('resultsCount'),
    // Sort
    sortSelect: document.getElementById('sortSelect'),
    // Clear filters
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),
    // Active filters
    activeFilters: document.getElementById('activeFilters'),
    // Filter sidebar
    filterSidebar: document.getElementById('filterSidebar'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    // States
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    emptyState: document.getElementById('emptyState'),
    retryBtn: document.getElementById('retryBtn'),
    clearEmptyFiltersBtn: document.getElementById('clearEmptyFiltersBtn'),
    // Task list
    taskList: document.getElementById('taskList'),
    // Pagination
    pagination: document.getElementById('pagination'),
    // Mobile filter
    filterToggleBtn: document.getElementById('filterToggleBtn'),
    drawerOverlay: document.getElementById('drawerOverlay'),
    filterDrawer: document.getElementById('filterDrawer'),
    drawerCloseBtn: document.getElementById('drawerCloseBtn'),
    drawerBody: document.getElementById('drawerBody'),
    drawerCancelBtn: document.getElementById('drawerCancelBtn'),
    drawerApplyBtn: document.getElementById('drawerApplyBtn')
};

// ============================================
// URL Parameter Management
// ============================================

/**
 * Parse URL parameters
 */
function parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    const parsed = {
        keyword: params.get(URL_PARAMS.KEYWORD) || '',
        category: params.get(URL_PARAMS.CATEGORY)?.split(',').filter(Boolean) || [],
        stack: params.get(URL_PARAMS.STACK)?.split(',').filter(Boolean) || [],
        deliveryMode: params.get(URL_PARAMS.DELIVERY_MODE)?.split(',').filter(Boolean) || [],
        budgetRange: params.get(URL_PARAMS.BUDGET_RANGE)?.split(',').filter(Boolean) || [],
        durationRange: params.get(URL_PARAMS.DURATION_RANGE)?.split(',').filter(Boolean) || [],
        status: params.get(URL_PARAMS.STATUS)?.split(',').filter(Boolean) || [...DEFAULTS.status],
        sort: params.get(URL_PARAMS.SORT) || DEFAULTS.sort,
        page: parseInt(params.get(URL_PARAMS.PAGE)) || DEFAULTS.page
    };

    // Validate all values
    Object.keys(parsed).forEach(key => {
        if (Array.isArray(parsed[key])) {
            parsed[key] = parsed[key]
                .map(v => validateParam(key, v))
                .filter(Boolean);
        } else {
            parsed[key] = validateParam(key, parsed[key]);
        }
    });

    return parsed;
}

/**
 * Update URL parameters
 */
function updateURLParams(replace = true) {
    const params = new URLSearchParams();

    if (state.filters.keyword) {
        params.set(URL_PARAMS.KEYWORD, state.filters.keyword);
    }
    if (state.filters.category.length > 0) {
        params.set(URL_PARAMS.CATEGORY, state.filters.category.join(','));
    }
    if (state.filters.stack.length > 0) {
        params.set(URL_PARAMS.STACK, state.filters.stack.join(','));
    }
    if (state.filters.deliveryMode.length > 0) {
        params.set(URL_PARAMS.DELIVERY_MODE, state.filters.deliveryMode.join(','));
    }
    if (state.filters.budgetRange.length > 0) {
        params.set(URL_PARAMS.BUDGET_RANGE, state.filters.budgetRange.join(','));
    }
    if (state.filters.durationRange.length > 0) {
        params.set(URL_PARAMS.DURATION_RANGE, state.filters.durationRange.join(','));
    }
    if (state.filters.status.length > 0) {
        params.set(URL_PARAMS.STATUS, state.filters.status.join(','));
    }
    if (state.sort !== DEFAULTS.sort) {
        params.set(URL_PARAMS.SORT, state.sort);
    }
    if (state.page !== DEFAULTS.page) {
        params.set(URL_PARAMS.PAGE, state.page);
    }

    const queryString = params.toString();
    const url = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;

    if (replace) {
        window.history.replaceState(null, '', url);
    } else {
        window.history.pushState(null, '', url);
    }
}

// ============================================
// Filter Options Rendering
// ============================================

/**
 * Render filter options for a group
 */
function renderFilterOptions(type, options) {
    const container = document.getElementById(`filterOptions-${type}`);
    if (!container) {
        console.warn(`Filter container not found: filterOptions-${type}`);
        return;
    }

    console.log(`Rendering ${type} options:`, options.length, 'items');

    container.innerHTML = options.map(option => {
        const isChecked = state.filters[type]?.includes(option.value);
        const count = state.filterCounts[type]?.[option.value] || 0;

        return `
            <label class="filter-option">
                <input
                    type="checkbox"
                    name="${type}"
                    value="${option.value}"
                    ${isChecked ? 'checked' : ''}
                    data-filter-type="${type}"
                >
                <span>${option.label}</span>
                ${count > 0 ? `<span class="filter-count">${count}</span>` : ''}
            </label>
        `;
    }).join('');

    console.log(`Rendered ${type} options:`, container.children.length, 'checkboxes');
}

/**
 * Render all filter options
 */
function renderAllFilterOptions() {
    renderFilterOptions('category', CATEGORY_OPTIONS);
    renderFilterOptions('stack', STACK_OPTIONS);
    renderFilterOptions('deliveryMode', DELIVERY_MODE_OPTIONS);
    renderFilterOptions('budgetRange', BUDGET_RANGE_OPTIONS);
    renderFilterOptions('durationRange', DURATION_RANGE_OPTIONS);
    renderFilterOptions('status', STATUS_OPTIONS);
}

// ============================================
// Active Filters Display
// ============================================

/**
 * Get active filter labels
 */
function getActiveFilterLabels() {
    const labels = [];

    state.filters.category.forEach(v => {
        const option = CATEGORY_OPTIONS.find(o => o.value === v);
        if (option) labels.push({ type: 'category', value: v, label: option.label });
    });

    state.filters.stack.forEach(v => {
        const option = STACK_OPTIONS.find(o => o.value === v);
        if (option) labels.push({ type: 'stack', value: v, label: option.label });
    });

    state.filters.deliveryMode.forEach(v => {
        const option = DELIVERY_MODE_OPTIONS.find(o => o.value === v);
        if (option) labels.push({ type: 'deliveryMode', value: v, label: option.label });
    });

    state.filters.budgetRange.forEach(v => {
        const option = BUDGET_RANGE_OPTIONS.find(o => o.value === v);
        if (option) labels.push({ type: 'budgetRange', value: v, label: option.label });
    });

    state.filters.durationRange.forEach(v => {
        const option = DURATION_RANGE_OPTIONS.find(o => o.value === v);
        if (option) labels.push({ type: 'durationRange', value: v, label: option.label });
    });

    state.filters.status.forEach(v => {
        const option = STATUS_OPTIONS.find(o => o.value === v);
        if (option) labels.push({ type: 'status', value: v, label: option.label });
    });

    return labels;
}

/**
 * Render active filters
 */
function renderActiveFilters() {
    if (!elements.activeFilters) return;

    const labels = getActiveFilterLabels();

    if (labels.length === 0) {
        elements.activeFilters.innerHTML = '';
        elements.clearFiltersBtn?.classList.add('hidden');
        return;
    }

    elements.clearFiltersBtn?.classList.remove('hidden');

    elements.activeFilters.innerHTML = labels.map(filter => `
        <span class="active-filter-tag">
            ${filter.label}
            <button type="button" data-remove-filter="${filter.type}:${filter.value}" aria-label="移除">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </span>
    `).join('');

    // Bind remove events
    elements.activeFilters.querySelectorAll('[data-remove-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            const [type, value] = btn.dataset.removeFilter.split(':');
            removeFilter(type, value);
        });
    });
}

// ============================================
// Task Card Rendering
// ============================================

/**
 * Render a single task card
 */
function getCategoryIconSvg(category) {
    const paths = {
        web: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m-9 9h18M3 8.25h18M3 15.75h18"/>',
        mobile: '<path d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>',
        ai: '<path d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 7h10v10H7z"/>',
        'design-system': '<path d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88"/>',
        other: '<path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>'
    };
    return paths[category] || paths.other;
}

const AVATAR_PHOTOS = [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces'
];

function initialAvatarDataUri(name) {
    const safe = (name || '?').trim() || '?';
    const ch = safe.charAt(0).toUpperCase();
    const colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];
    let h = 0;
    for (let i = 0; i < safe.length; i++) h = safe.charCodeAt(i) + ((h << 5) - h);
    const color = colors[Math.abs(h) % colors.length];
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='" + color + "'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' fill='#ffffff' font-family='Inter,sans-serif' font-size='34' font-weight='600'>" + ch + "</text></svg>";
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function publisherAvatarUrl(pubId, name) {
    const m = /(\d+)$/.exec(pubId || '');
    if (m) return AVATAR_PHOTOS[(parseInt(m[1], 10) - 1) % AVATAR_PHOTOS.length];
    return initialAvatarDataUri(name);
}

function renderTaskCard(task) {
    const statusInfo = getStatusInfo(task.status);
    const categoryInfo = getCategoryInfo(task.category);
    const pubId = (task.publisher && task.publisher.id) || '';
    const pubName = (task.publisher && task.publisher.name) ? task.publisher.name : task.clientName;
    const pubRating = (task.publisher && typeof task.publisher.rating === 'number') ? task.publisher.rating.toFixed(1) : '';
    const isVerified = !!(task.publisher && task.publisher.verified);
    const avatarFallback = initialAvatarDataUri(pubName);
    const avatarUrl = publisherAvatarUrl(pubId, pubName);

    return `
        <article class="task-card" data-task-id="${task.id}">
            <div class="task-card__header">
                <div class="task-card__lead">
                    <span class="task-card__cat task-card__cat--${task.category}" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${getCategoryIconSvg(task.category)}</svg>
                    </span>
                    <h3 class="task-card__title">${escapeHtml(task.title)}</h3>
                </div>
                <div class="task-card__status">
                    <span class="status-badge status-badge--${task.status}">
                        ${statusInfo?.label || task.status}
                    </span>
                </div>
            </div>
            <p class="task-card__summary">${escapeHtml(task.summary)}</p>
            <div class="task-card__meta">
                <div class="task-card__client">
                    <img class="task-card__avatar" src="${avatarUrl}" alt="${escapeHtml(pubName)}" loading="lazy" onerror="this.onerror=null;this.src='${avatarFallback}'">
                    <span class="task-card__client-name">${escapeHtml(task.clientName)}</span>
                    ${isVerified ? '<span class="task-card__verified" title="已认证企业" aria-label="已认证企业"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>' : ''}
                    ${pubRating ? `<span class="task-card__rating">★ ${pubRating}</span>` : ''}
                </div>
            </div>
            <div class="task-card__tags">
                <span class="task-card__tag task-card__tag--primary">${categoryInfo?.label || task.category}</span>
                ${task.stacks.slice(0, 3).map(stack =>
                    `<span class="task-card__tag">${stack}</span>`
                ).join('')}
            </div>
            <div class="task-card__footer">
                <div class="task-card__info">
                    <div class="task-card__info-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="task-card__budget">¥${task.budgetMin.toLocaleString()} - ¥${task.budgetMax.toLocaleString()}</span>
                    </div>
                    <div class="task-card__info-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>${task.durationDays} 天</span>
                    </div>
                </div>
                <div class="task-card__action">
                    查看任务
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </article>
    `;
}

/**
 * Render task list
 */
function renderTaskList(tasks) {
    if (!elements.taskList) return;

    if (tasks.length === 0) {
        elements.taskList.innerHTML = '';
        return;
    }

    elements.taskList.innerHTML = tasks.map(renderTaskCard).join('');
}

// ============================================
// Pagination Rendering
// ============================================

/**
 * Render pagination
 */
function renderPagination(pagination) {
    if (!elements.pagination) return;

    if (pagination.totalPages <= 1) {
        elements.pagination.innerHTML = '';
        return;
    }

    const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination;

    let html = '';

    // Previous button
    html += `
        <button
            type="button"
            class="pagination-item ${hasPrevPage ? '' : 'disabled'}"
            ${hasPrevPage ? `data-goto-page="${currentPage - 1}"` : 'disabled'}
            aria-label="上一页"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    `;

    // Page numbers
    const maxVisible = PAGINATION_CONFIG.maxVisiblePages;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        html += `<button type="button" class="pagination-item" data-goto-page="1">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button
                type="button"
                class="pagination-item ${i === currentPage ? 'active' : ''}"
                data-goto-page="${i}"
            >
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
        html += `<button type="button" class="pagination-item" data-goto-page="${totalPages}">${totalPages}</button>`;
    }

    // Next button
    html += `
        <button
            type="button"
            class="pagination-item ${hasNextPage ? '' : 'disabled'}"
            ${hasNextPage ? `data-goto-page="${currentPage + 1}"` : 'disabled'}
            aria-label="下一页"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    `;

    elements.pagination.innerHTML = html;

    // Bind click events
    elements.pagination.querySelectorAll('[data-goto-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.gotoPage);
            goToPage(page);
        });
    });
}

// ============================================
// State Display Management
// ============================================

/**
 * Show loading state
 */
function showLoading() {
    elements.loadingState.style.display = 'grid';
    elements.errorState.style.display = 'none';
    elements.emptyState.style.display = 'none';
    elements.taskList.style.display = 'none';

    // Render skeleton cards
    elements.loadingState.innerHTML = Array(6).fill('').map(() => `
        <div class="skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text-short"></div>
            </div>
        </div>
    `).join('');
}

/**
 * Show error state
 */
function showError() {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'flex';
    elements.emptyState.style.display = 'none';
    elements.taskList.style.display = 'none';
}

/**
 * Show empty state
 */
function showEmpty() {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.emptyState.style.display = 'flex';
    elements.taskList.style.display = 'none';
}

/**
 * Show task list
 */
function showTaskList() {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.emptyState.style.display = 'none';
    elements.taskList.style.display = 'grid';
}

// ============================================
// Filter Actions
// ============================================

/**
 * Add filter
 */
function addFilter(type, value) {
    if (!state.filters[type]) {
        state.filters[type] = [];
    }
    if (!state.filters[type].includes(value)) {
        state.filters[type].push(value);
        state.page = 1; // Reset to page 1
        applyFilters();
    }
}

/**
 * Remove filter
 */
function removeFilter(type, value) {
    if (state.filters[type]) {
        state.filters[type] = state.filters[type].filter(v => v !== value);
        state.page = 1; // Reset to page 1
        applyFilters();
    }
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    state.filters = {
        keyword: '',
        category: [],
        stack: [],
        deliveryMode: [],
        budgetRange: [],
        durationRange: [],
        status: [...DEFAULTS.status]
    };
    state.sort = DEFAULTS.sort;
    state.page = DEFAULTS.page;
    applyFilters();
}

/**
 * Apply filters and fetch tasks
 */
async function applyFilters() {
    console.log('Applying filters:', state.filters, 'sort:', state.sort, 'page:', state.page);

    showLoading();
    updateURLParams(true);

    try {
        const result = await queryTasks({
            ...state.filters,
            sort: state.sort,
            page: state.page,
            pageSize: PAGINATION_CONFIG.pageSize
        });

        console.log('Query result:', result);

        // Update results count
        if (elements.resultsCount) {
            elements.resultsCount.textContent = result.filterCount.toLocaleString();
        }

        // Render results
        if (result.tasks.length === 0) {
            console.log('No tasks found, showing empty state');
            showEmpty();
        } else {
            console.log('Rendering', result.tasks.length, 'tasks');
            showTaskList();
            renderTaskList(result.tasks);
        }

        // Render pagination
        renderPagination(result.pagination);

        // Re-render filter options and active filters
        renderAllFilterOptions();
        renderActiveFilters();

        // Sync checkbox states
        syncFilterCheckboxes();

    } catch (error) {
        console.error('Failed to apply filters:', error);
        showError();
    }
}

/**
 * Sync checkbox states with current filters
 */
function syncFilterCheckboxes() {
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        const type = checkbox.dataset.filterType;
        const value = checkbox.value;
        checkbox.checked = state.filters[type]?.includes(value);
    });

    // Sync sort select
    if (elements.sortSelect) {
        elements.sortSelect.value = state.sort;
    }
}

/**
 * Go to specific page
 */
function goToPage(page) {
    state.page = page;
    applyFilters();
    // Scroll to top of filter bar
    elements.filterSidebar?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// Search Debounce
// ============================================

let searchDebounceTimer = null;

function handleSearchInput(value) {
    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(() => {
        state.filters.keyword = value;
        state.page = 1;
        applyFilters();
    }, VALIDATION.searchDebounceMs);
}

// ============================================
// Mobile Filter Drawer
// ============================================

function openMobileFilterDrawer() {
    // Clone filter options to drawer
    const sidebarContent = elements.filterSidebar?.querySelector('.filter-sidebar__header')?.nextSibling;
    if (sidebarContent && elements.drawerBody) {
        // Store current filters as temp
        state.mobileFiltersTemp = JSON.parse(JSON.stringify(state.filters));

        // Clone all filter groups
        const filterGroups = elements.filterSidebar?.querySelectorAll('.filter-group');
        if (filterGroups && elements.drawerBody) {
            elements.drawerBody.innerHTML = '';
            filterGroups.forEach(group => {
                const clone = group.cloneNode(true);
                elements.drawerBody.appendChild(clone);
            });
        }
    }

    elements.drawerOverlay?.classList.add('active');
    elements.filterDrawer?.classList.add('active');
    elements.filterDrawer?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeMobileFilterDrawer() {
    elements.drawerOverlay?.classList.remove('active');
    elements.filterDrawer?.classList.remove('active');
    elements.filterDrawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function applyMobileFilters() {
    // Read filters from drawer
    const drawerCheckboxes = elements.drawerBody?.querySelectorAll('input[type="checkbox"]');
    if (drawerCheckboxes) {
        drawerCheckboxes.forEach(checkbox => {
            const type = checkbox.dataset.filterType;
            const value = checkbox.value;
            const checked = checkbox.checked;

            if (checked && !state.filters[type]?.includes(value)) {
                if (!state.filters[type]) state.filters[type] = [];
                state.filters[type].push(value);
            } else if (!checked && state.filters[type]?.includes(value)) {
                state.filters[type] = state.filters[type].filter(v => v !== value);
            }
        });
    }

    state.page = 1;
    applyFilters();
    closeMobileFilterDrawer();
}

function cancelMobileFilters() {
    // Restore temp filters
    if (state.mobileFiltersTemp) {
        state.filters = state.mobileFiltersTemp;
        syncFilterCheckboxes();
    }
    closeMobileFilterDrawer();
}

// ============================================
// Utility Functions
// ============================================

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Event Binding
// ============================================

function bindEvents() {
    // Search input with debounce
    elements.searchInput?.addEventListener('input', (e) => {
        handleSearchInput(e.target.value);
    });

    // Update URL on search enter/blur
    elements.searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(searchDebounceTimer);
            state.filters.keyword = e.target.value;
            state.page = 1;
            applyFilters();
        }
    });

    elements.searchInput?.addEventListener('blur', () => {
        clearTimeout(searchDebounceTimer);
        state.filters.keyword = elements.searchInput.value;
        updateURLParams(true);
    });

    // Sort change
    elements.sortSelect?.addEventListener('change', (e) => {
        state.sort = e.target.value;
        state.page = 1;
        applyFilters();
    });

    // Clear filters
    elements.clearFiltersBtn?.addEventListener('click', clearAllFilters);
    elements.clearEmptyFiltersBtn?.addEventListener('click', clearAllFilters);
    elements.resetFiltersBtn?.addEventListener('click', clearAllFilters);

    // Retry button
    elements.retryBtn?.addEventListener('click', applyFilters);

    // Filter checkboxes (desktop)
    document.addEventListener('change', (e) => {
        if (e.target.matches('.filter-option input[type="checkbox"]')) {
            const type = e.target.dataset.filterType;
            const value = e.target.value;
            if (e.target.checked) {
                addFilter(type, value);
            } else {
                removeFilter(type, value);
            }
        }
    });

    // Filter group toggle
    document.addEventListener('click', (e) => {
        if (e.target.matches('.filter-group__toggle') || e.target.closest('.filter-group__toggle')) {
            const toggle = e.target.matches('.filter-group__toggle') ? e.target : e.target.closest('.filter-group__toggle');
            const content = toggle.nextElementSibling;
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

            toggle.setAttribute('aria-expanded', !isExpanded);
            if (content) {
                if (isExpanded) {
                    content.setAttribute('hidden', '');
                    content.style.maxHeight = '0';
                } else {
                    content.removeAttribute('hidden');
                    content.style.maxHeight = '300px';
                }
            }
        }
    });

    // Mobile filter drawer
    elements.filterToggleBtn?.addEventListener('click', openMobileFilterDrawer);
    elements.drawerCloseBtn?.addEventListener('click', closeMobileFilterDrawer);
    elements.drawerOverlay?.addEventListener('click', closeMobileFilterDrawer);
    elements.drawerCancelBtn?.addEventListener('click', cancelMobileFilters);
    elements.drawerApplyBtn?.addEventListener('click', applyMobileFilters);

    // Browser back/forward
    window.addEventListener('popstate', () => {
        const params = parseURLParams();
        state.filters = {
            keyword: params.keyword,
            category: params.category,
            stack: params.stack,
            deliveryMode: params.deliveryMode,
            budgetRange: params.budgetRange,
            durationRange: params.durationRange,
            status: params.status
        };
        state.sort = params.sort;
        state.page = params.page;
        applyFilters();
    });

    // Task card click - open preview drawer
    elements.taskList?.addEventListener('click', (e) => {
        // Find closest task card
        const card = e.target.closest('.task-card');
        if (!card) return;

        // Get task ID
        const taskId = card.dataset.taskId;
        if (!taskId) return;

        // Check if clicked on a link or button (don't open drawer)
        if (e.target.closest('a, button')) return;

        // Open preview drawer
        if (typeof TaskPreviewDrawer !== 'undefined' && TaskPreviewDrawer.open) {
            TaskPreviewDrawer.open(taskId);
        }
    });
}

// ============================================
// Initialization
// ============================================

async function init() {
    console.log('=== Task Hall Init Starting ===');

    // 1. First, render filter options (must be done before URL parsing)
    console.log('Rendering filter options...');
    renderAllFilterOptions();
    console.log('Filter options rendered');

    // 2. Parse URL parameters
    const params = parseURLParams();
    console.log('URL params parsed:', params);

    // 3. Update state
    state.filters = {
        keyword: params.keyword,
        category: params.category,
        stack: params.stack,
        deliveryMode: params.deliveryMode,
        budgetRange: params.budgetRange,
        durationRange: params.durationRange,
        status: params.status
    };
    state.sort = params.sort;
    state.page = params.page;
    console.log('State updated:', state);

    // 4. Sync checkbox states
    syncFilterCheckboxes();
    console.log('Checkbox states synced');

    // 5. Bind events
    bindEvents();
    console.log('Events bound');

    // 6. Initial load
    console.log('Loading tasks...');
    await applyFilters();
    console.log('Tasks loaded');

    // 7. Update search input value
    if (elements.searchInput && state.filters.keyword) {
        elements.searchInput.value = state.filters.keyword;
    }

    console.log('=== Task Hall Initialized ===');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================
// Export
// ============================================

// Export closeFilterDrawer for preview drawer mutual exclusion
if (typeof window !== 'undefined') {
    window.closeFilterDrawer = closeMobileFilterDrawer;
}
