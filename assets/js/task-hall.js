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
function renderTaskCard(task) {
    const statusInfo = getStatusInfo(task.status);
    const categoryInfo = getCategoryInfo(task.category);

    return `
        <article class="task-card" data-task-id="${task.id}">
            <div class="task-card__header">
                <h3 class="task-card__title">${escapeHtml(task.title)}</h3>
                <div class="task-card__status">
                    <span class="status-badge status-badge--${task.status}">
                        ${statusInfo?.label || task.status}
                    </span>
                </div>
            </div>
            <p class="task-card__summary">${escapeHtml(task.summary)}</p>
            <div class="task-card__meta">
                <div class="task-card__client">
                    <svg class="task-card__client-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    ${escapeHtml(task.clientName)}
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
