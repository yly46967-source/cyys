/**
 * [FILE] shared-layout.js
 * [POS] 共享布局组件 - 统一渲染导航和页脚，支持登录状态管理
 * [IN] DOM 容器 (通过 data-layout 属性定位)
 * [OUT] 动态插入导航和页脚 HTML
 * [DEP] auth-state.js (延迟加载，仅在需要时使用)
 * [SIDE EFFECT] 修改 DOM (插入 HTML、绑定事件)
 * [TEST] 手动测试: 验证导航和页脚渲染、移动端菜单、登录状态切换
 *
 * Shared Layout Components
 * ============================================ */

// ============================================
// Navigation Component
// ============================================

const NAV_ITEMS = [
    { href: '#work', text: '作品' },
    { href: 'task-hall.html', text: '任务大厅' },
    { href: '#services', text: '服务' },
    { href: '#about', text: '关于' }
];

function renderNavbar(activePage = 'home') {
    const navContainer = document.querySelector('[data-layout="navbar"]');
    if (!navContainer) return;

    const currentPage = activePage === 'task-hall' ? 'task-hall' : 'home';

    // 检查是否有 authState 可用（延迟加载）
    const authState = window.authState;
    const userData = authState ? authState.currentUser : null;
    const isAuthenticated = authState ? authState.isAuthenticated : false;

    // 根据登录状态渲染不同的导航栏
    navContainer.innerHTML = `
        <nav class="navbar">
            <div class="container">
                <a href="${currentPage === 'task-hall' ? 'index.html' : '#'}" class="brand">TechCraft</a>
                <div class="nav-links" id="navLinks">
                    ${NAV_ITEMS.map(item => `
                        <a href="${item.href}" class="nav-link ${
                            (currentPage === 'task-hall' && item.href.includes('task-hall')) ? 'active' : ''
                        }">${item.text}</a>
                    `).join('')}
                </div>
                <div class="nav-actions" id="navActions">
                    ${isAuthenticated && userData ? renderUserMenu(userData) : renderGuestMenu()}
                </div>
                <div class="nav-toggle" id="navToggle" aria-label="切换菜单">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    `;

    // Initialize navigation events
    initNavigation();

    // 如果已登录，初始化用户菜单事件
    if (isAuthenticated && userData) {
        initUserMenu();
    }
}

// 渲染未登录状态的菜单
function renderGuestMenu() {
    return `
        <a href="login.html" class="nav-link nav-link-login">登录</a>
        <a href="register.html" class="btn btn-primary">注册</a>
    `;
}

// 获取未读消息计数（新增）
function getUnreadMessageCount() {
    return window.authState ? window.authState.getUnreadMessageCount() : 0;
}

// 渲染已登录状态的用户菜单
function renderUserMenu(userData) {
    const avatarUrl = userData.avatar || userData.extension?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
    const profileUrl = userData.role === 'client' ? 'profile-client.html' : 'profile-developer.html';
    const taskSection = userData.role === 'client' ? 'my-tasks' : 'my-participations';
    const displayName = userData.name || '用户';

    return `
        <div class="user-menu" id="userMenu">
            <button class="user-menu-toggle" id="userMenuToggle">
                <div class="user-avatar-wrapper">
                    <img src="${avatarUrl}" alt="${displayName}" class="user-avatar">
                    ${renderAvatarBadge()}
                </div>
                <span class="user-name">${displayName}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="user-menu-arrow">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div class="user-menu-dropdown" id="userMenuDropdown">
                <a href="${profileUrl}" class="user-menu-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="user-menu-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    个人中心
                </a>
                <a href="${profileUrl}?tab=${taskSection}" class="user-menu-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="user-menu-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    我的任务
                </a>
                <a href="${profileUrl}?tab=messages" class="user-menu-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="user-menu-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    消息通知
                    ${renderMessageBadge()}
                </a>
                <a href="profile-edit.html?from=overview" class="user-menu-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="user-menu-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    账户设置
                </a>
                <div class="user-menu-divider"></div>
                <button class="user-menu-item user-menu-logout" id="logoutBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="user-menu-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    退出登录
                </button>
            </div>
        </div>
    `;
}

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (!navToggle || !navLinks) return;

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        // Animate hamburger
        const spans = navToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-6px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 64;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // Close mobile menu
                    navLinks?.classList.remove('active');
                }
            }
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

// ============================================
// Footer Component
// ============================================

function renderFooter() {
    const footerContainer = document.querySelector('[data-layout="footer"]');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-brand">
                        <span class="brand-logo">TechCraft</span>
                        <p>专业软件定制服务</p>
                        <div class="social-links">
                            <a href="#" aria-label="GitHub">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </a>
                            <a href="#" aria-label="Twitter">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>
                            <a href="#" aria-label="Dribbble">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                                    <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35 1.527-1.925 4.489-4.726 7.33-.127-.246-.323-.615-.567-1.044-.785-1.383-1.922-3.383-2.597-4.54 1.482-.355 3.163-.467 4.91-.26.133-.79.267-1.493.397-2.127.277-.318.543-.636.797-.953zm-5.846 9.07c-2.656 2.357-5.143 3.616-6.666 3.998.93-1.34 2.035-3.085 2.622-4.667.858.236 1.795.43 2.814.545.493.054.935.08 1.322.08 1.456 0 2.527-.252 3.168-.533-.345.78-.796 1.547-1.26 2.21-.945-.06-2.17-.22-3.615-.523-.61-1.795-1.663-3.906-2.25-4.86 1.55-.51 3.27-.666 5.053-.46.232.78.533 1.725.895 2.82.054.164.11.33.166.493-1.382.27-2.738.38-3.868.353-.353-.01-.672-.033-.957-.068-.726-2.077-1.545-4.25-2.01-5.422 1.317-1.234 2.95-1.98 4.66-2.116.508 1.314 1.247 3.24 1.95 4.565.047.087.094.174.14.26-1.69.112-3.276.045-4.666.244-.054-.09-.108-.18-.16-.27-1.01-1.748-2.03-3.775-2.578-4.93 1.726-.272 3.556-.08 5.28.52.633.22 1.256.487 1.866.795.876-1.474 1.7-2.837 2.22-3.803.486.083.97.182 1.446.295 1.15-2.07 2.088-3.75 2.596-4.72.515.328 1.026.695 1.53 1.098.87.692 1.7 1.513 2.475 2.433-.385.07-.796.116-1.23.134-.89.037-1.874.03-2.915-.065-1.48-.13-2.896-.4-4.065-.757.745 1.13 1.65 2.687 2.366 4.18 1.06.22 2.25.34 3.536.34.11 0 .22-.002.33-.005.676-1.015 1.523-2.45 2.27-4.05.395.03.795.046 1.197.046 1.06 0 2.057-.135 2.94-.37.55 1.34 1.18 2.93 1.59 3.97-.28.1-.575.19-.88.27-1.69.447-3.73.646-6.14.514-.72-.037-1.402-.12-2.045-.244-.068 1.028-.14 2.045-.18 2.957.7.157 1.46.244 2.26.244 1.96 0 3.727-.413 5.1-1.127.642.96 1.265 2.023 1.69 2.83 2.56-.487 4.58-1.703 5.73-3.358zm-8.563-1.23c-.488-1.262-1.078-2.748-1.607-4.047-1.546-.31-3.04-.436-4.383-.358.475 1.12 1.288 2.91 2.164 4.59.945.053 1.89.024 2.826-.094-.332-.033-.663-.065-.993-.09zm-3.58-6.58c.494 1.092 1.307 2.836 2.18 4.557 1.35-.166 2.712-.242 4.01-.205-.63-1.458-1.34-3.07-1.92-4.406-1.615-.243-3.178-.22-4.65.022.126.01.252.02.38.032zm10.876 5.24c-.574-1.06-1.39-2.52-2.23-4.05-1.05.29-2.24.447-3.534.447-.195 0-.39-.005-.58-.014.546 1.15 1.28 2.795 2.09 4.25 1.44-.19 2.69-.45 3.75-.774.17-.29.334-.58.494-.86z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div class="footer-links">
                        <div class="footer-column">
                            <h4>服务</h4>
                            <a href="#">网站开发</a>
                            <a href="#">App 设计</a>
                            <a href="#">品牌设计</a>
                            <a href="#">系统开发</a>
                        </div>
                        <div class="footer-column">
                            <h4>公司</h4>
                            <a href="#">关于我们</a>
                            <a href="#">案例</a>
                            <a href="#">联系</a>
                            <a href="#">加入我们</a>
                        </div>
                        <div class="footer-column">
                            <h4>资源</h4>
                            <a href="#">博客</a>
                            <a href="#">帮助中心</a>
                            <a href="#">隐私政策</a>
                            <a href="#">服务条款</a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 TechCraft. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;
}

// ============================================
// Back to Top Component
// ============================================

function renderBackToTop() {
    const backToTopContainer = document.querySelector('[data-layout="back-to-top"]');
    if (!backToTopContainer) return;

    backToTopContainer.innerHTML = `
        <button class="back-to-top" id="backToTop" aria-label="回到顶部">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </button>
    `;

    // Initialize back to top behavior
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Show/hide on scroll
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });
    }
}

// ============================================
// Message Badge Rendering（新增）
// ============================================

/**
 * 渲染消息红点徽章
 */
function renderMessageBadge() {
    const unreadCount = getUnreadMessageCount();
    if (unreadCount > 0) {
        return `<span class="user-menu-badge" aria-label="${unreadCount} 条未读消息">${unreadCount > 99 ? '99+' : unreadCount}</span>`;
    }
    return '';
}

/**
 * 渲染头像上的红点
 */
function renderAvatarBadge() {
    const unreadCount = getUnreadMessageCount();
    if (unreadCount > 0) {
        return `<span class="avatar-badge" aria-label="${unreadCount} 条未读消息"></span>`;
    }
    return '';
}

/**
 * 更新消息红点（用于动态更新）
 */
function updateMessageBadges() {
    const badges = document.querySelectorAll('.user-menu-badge');
    const avatarBadges = document.querySelectorAll('.avatar-badge');
    const unreadCount = getUnreadMessageCount();

    // 更新菜单徽章
    const messageItem = document.querySelector('.user-menu-item[href*="tab=messages"]');
    if (messageItem) {
        const existingBadge = messageItem.querySelector('.user-menu-badge');
        if (unreadCount > 0) {
            if (!existingBadge) {
                const badge = document.createElement('span');
                badge.className = 'user-menu-badge';
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.setAttribute('aria-label', `${unreadCount} 条未读消息`);
                messageItem.appendChild(badge);
            } else {
                existingBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                existingBadge.setAttribute('aria-label', `${unreadCount} 条未读消息`);
            }
        } else if (existingBadge) {
            existingBadge.remove();
        }
    }

    // 更新头像徽章
    const avatarWrapper = document.querySelector('.user-avatar-wrapper');
    if (avatarWrapper) {
        const existingAvatarBadge = avatarWrapper.querySelector('.avatar-badge');
        if (unreadCount > 0) {
            if (!existingAvatarBadge) {
                const avatarBadge = document.createElement('span');
                avatarBadge.className = 'avatar-badge';
                avatarBadge.setAttribute('aria-label', `${unreadCount} 条未读消息`);
                avatarWrapper.appendChild(avatarBadge);
            }
        } else if (existingAvatarBadge) {
            existingAvatarBadge.remove();
        }
    }
}

// ============================================
// User Menu Initialization
// ============================================

function initUserMenu() {
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!userMenuToggle || !userMenuDropdown) return;

    // 切换下拉菜单
    userMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenuDropdown.classList.toggle('active');
        userMenuToggle.classList.toggle('active');
    });

    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            userMenuDropdown.classList.remove('active');
            userMenuToggle.classList.remove('active');
        }
    });

    // 退出登录
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            if (window.authState) {
                await window.authState.onLogout();
                // 重新渲染导航栏
                renderNavbar(getCurrentPage());
            }
        });
    }
}

// ============================================
// Global Function: Refresh Navbar on Auth State Change
// ============================================

window.renderNavbarAuth = function() {
    const currentPage = getCurrentPage();
    renderNavbar(currentPage);
};

// 获取当前页面标识
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();

    if (filename === 'task-hall.html') {
        return 'task-hall';
    } else if (filename === 'login.html' || filename === 'register.html') {
        return 'auth';
    }
    return 'home';
}

// ============================================
// Initialize All Layout Components
// ============================================

function initSharedLayout(activePage = 'home') {
    renderNavbar(activePage);
    renderFooter();
    renderBackToTop();

    // 监听认证状态变化（如果 authState 可用）
    if (window.authState) {
        window.authState.subscribe((event, data) => {
            if (event === 'login' || event === 'logout') {
                // 重新渲染导航栏
                setTimeout(() => {
                    renderNavbar(getCurrentPage());
                }, 100);
            } else if (event === 'message_count') {
                // 更新消息红点（新增）
                updateMessageBadges();
            }
        });
    }
}

// Export for manual initialization (only in module environment)
if (typeof module !== 'undefined') {
    // ES6 modules
    if (typeof module.exports !== 'undefined') {
        module.exports = {
            initSharedLayout,
            renderNavbar,
            renderFooter,
            renderBackToTop,
            initUserMenu
        };
    }
}

// Also export as ES6 if in browser module context
if (typeof window !== 'undefined') {
    // Expose to window for non-module usage
    // 避免重复赋值，先检查是否已存在
    if (!window.initSharedLayout) {
        window.initSharedLayout = initSharedLayout;
        window.renderNavbar = renderNavbar;
        window.renderFooter = renderFooter;
        window.renderBackToTop = renderBackToTop;
        window.initUserMenu = initUserMenu;
    }
}

// ES6 export for module usage
export { initSharedLayout, renderNavbar, renderFooter, renderBackToTop, initUserMenu };
