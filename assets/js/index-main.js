/**
 * [FILE] index-main.js
 * [POS] 主页面入口文件 - 统一导入所有依赖并初始化
 * [IN] 无
 * [OUT] 主页面初始化
 * [DEP] 所有主页面相关模块
 * [SIDE EFFECT] 初始化主页面
 * [TEST] 手动测试: 验证主页面功能
 *
 * Index Page Entry Point
 * ============================================ */

// 导入所有依赖
import { USER_ROLES, ROLE_LABELS, API_ENDPOINTS, CODE_CONFIG, ERROR_CODES } from './auth-config.js';
import AuthStorage from './auth-storage.js';
import httpClient from './http-client.js';
import authService from './auth-service.js';
import authState from './auth-state.js';
import { initSharedLayout } from './shared-layout.js';

// 将核心对象挂载到 window（用于 shared-layout.js 访问）
window.authState = authState;
window.AuthStorage = AuthStorage;
window.httpClient = httpClient;
window.authService = authService;

// 初始化所有组件
function initAll() {
    // 初始化共享布局（会自动渲染导航栏和页脚）
    if (typeof initSharedLayout === 'function') {
        initSharedLayout('home');
    }

    // 初始化主页面交互（main.js 的功能）
    initMainPageInteractions();
}

// 主页面交互逻辑（从 main.js 迁移过来）
function initMainPageInteractions() {
    // Navigation
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
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
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (navToggle) {
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
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

                    if (navLinks) navLinks.classList.remove('active');
                }
            }
        });
    });

    // Tab filtering
    const workTabs = document.getElementById('workTabs');
    const worksGrid = document.getElementById('worksGrid');

    if (workTabs) {
        workTabs.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs
                workTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                // Add active to clicked tab
                tab.classList.add('active');

                // Filter works
                const filter = tab.dataset.filter;
                if (worksGrid) {
                    worksGrid.querySelectorAll('.work-card').forEach(card => {
                        if (filter === 'all' || card.dataset.category === filter) {
                            card.style.display = '';
                            // Add fade-in animation
                            card.style.animation = 'fadeIn 0.3s ease forwards';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                }
            });
        });
    }

    // Load more button
    const loadMoreBtn = document.getElementById('loadMore');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadMoreBtn.textContent = '加载中...';
            loadMoreBtn.disabled = true;

            // Simulate loading
            setTimeout(() => {
                loadMoreBtn.textContent = '没有更多了';
                loadMoreBtn.disabled = false;
                loadMoreBtn.classList.add('btn-secondary');
            }, 1500);
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            // Simple validation
            if (!name || !email || !message) {
                alert('请填写所有字段');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('请输入有效的邮箱地址');
                return;
            }

            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.textContent = '发送中...';
            submitBtn.disabled = true;

            setTimeout(() => {
                alert('消息已发送！我们会尽快回复您。');
                contactForm.reset();
                submitBtn.textContent = '发送消息';
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // Back to top button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            if (navbar) navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        } else {
            if (navbar) navbar.style.boxShadow = 'none';
        }

        // Show/hide back to top button
        if (backToTopBtn) {
            if (currentScroll > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // Add fadeIn animation
    if (!document.getElementById('fadeInAnimation')) {
        const style = document.createElement('style');
        style.id = 'fadeInAnimation';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}

// 等待 DOM 准备就绪
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
