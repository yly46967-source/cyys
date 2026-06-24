/**
 * [FILE] navbar-standalone.js
 * [POS] 静态导航栏渲染 - 不依赖 ES 模块，用于 file:// 协议访问
 * [IN] 无
 * [OUT] 导航栏 HTML
 * [DEP] 无
 * [SIDE EFFECT] 修改 DOM
 * [TEST] 直接用浏览器打开 HTML 文件验证
 *
 * Static Navbar Renderer (Non-module)
 * ============================================ */

(function() {
    'use strict';

    // 检查是否已经渲染过导航栏
    if (document.querySelector('.navbar')) {
        return;
    }

    // 获取当前页面标识
    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().toLowerCase();

        if (filename === 'task-hall.html') {
            return 'task-hall';
        } else if (filename === 'login.html' || filename === 'register.html') {
            return 'auth';
        }
        return 'home';
    }

    // 渲染导航栏
    function renderNavbar() {
        const currentPage = getCurrentPage();
        const navContainer = document.querySelector('[data-layout="navbar"]');

        if (!navContainer) return;

        // 导航项配置
        const navItems = [
            { href: '#work', text: '作品' },
            { href: 'task-hall.html', text: '任务大厅' },
            { href: '#services', text: '服务' },
            { href: '#about', text: '关于' }
        ];

        // 检查是否有 authState 可用（可能在其他脚本中加载）
        const isAuthenticated = window.authState && window.authState.isAuthenticated;
        const userData = window.authState ? window.authState.currentUser : null;

        // 渲染导航栏 HTML
        navContainer.innerHTML = `
            <nav class="navbar">
                <div class="container">
                    <a href="${currentPage === 'task-hall' ? 'index.html' : '#'}" class="brand">TechCraft</a>
                    <div class="nav-links" id="navLinks">
                        ${navItems.map(item => `
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

        // 初始化导航事件
        initNavigation();

        // 如果已登录，初始化用户菜单
        if (isAuthenticated && userData) {
            initUserMenu();
        }
    }

    // 渲染未登录菜单
    function renderGuestMenu() {
        return `
            <a href="login.html" class="nav-link nav-link-login">登录</a>
            <a href="register.html" class="btn btn-primary">注册</a>
        `;
    }

    // 渲染已登录用户菜单
    function renderUserMenu(userData) {
        const avatarUrl = userData.avatar || userData.extension?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
        const profileUrl = userData.role === 'client' ? 'profile-client.html' : 'profile-developer.html';
        const taskSection = userData.role === 'client' ? 'my-tasks' : 'my-participations';
        const displayName = userData.name || '用户';

        return `
            <div class="user-menu" id="userMenu">
                <button class="user-menu-toggle" id="userMenuToggle">
                    <img src="${avatarUrl}" alt="${displayName}" class="user-avatar">
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

    // 初始化导航事件
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');

        if (!navToggle || !navLinks) return;

        // 移动端菜单切换
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');

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

        // 点击外部关闭菜单
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.navbar') && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });

        // 平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
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

                        if (navLinks) navLinks.classList.remove('active');
                    } else {
                        // 目标锚点不在当前页，跳转到首页对应位置
                        window.location.href = 'index.html' + href;
                    }
                }
            });
        });

        // 导航栏滚动效果
        const navbar = document.querySelector('.navbar');
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 100) {
                navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        }, { passive: true });
    }

    // 初始化用户菜单
    function initUserMenu() {
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userMenuDropdown = document.getElementById('userMenuDropdown');
        const logoutBtn = document.getElementById('logoutBtn');

        if (!userMenuToggle || !userMenuDropdown) return;

        // 切换下拉菜单
        userMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            userMenuDropdown.classList.toggle('active');
            userMenuToggle.classList.toggle('active');
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.user-menu')) {
                userMenuDropdown.classList.remove('active');
                userMenuToggle.classList.remove('active');
            }
        });

        // 退出登录
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function(e) {
                e.preventDefault();

                if (window.authState) {
                    await window.authState.onLogout();
                    // 重新渲染导航栏
                    renderNavbar();
                }
            });
        }
    }

    // 全局函数：重新渲染导航栏（用于登录状态变化）
    window.renderNavbarAuth = function() {
        renderNavbar();
    };

    // 页面加载完成后渲染导航栏
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderNavbar);
    } else {
        renderNavbar();
    }

})();
