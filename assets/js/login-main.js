/**
 * [FILE] login-main.js
 * [POS] 登录页面入口文件 - 统一导入所有依赖并初始化
 * [IN] 无
 * [OUT] 登录页面初始化
 * [DEP] 所有登录相关模块
 * [SIDE EFFECT] 初始化登录页面
 * [TEST] 手动测试: 验证登录流程
 *
 * Login Page Entry Point
 * ============================================ */

// 导入所有依赖
import { USER_ROLES, ROLE_LABELS, API_ENDPOINTS, CODE_CONFIG, ERROR_CODES } from './auth-config.js';
import AuthStorage from './auth-storage.js';
import httpClient from './http-client.js';
import authService from './auth-service.js';
import authState from './auth-state.js';
import verificationCode from './verification-code.js';
import FormValidator from './form-validator.js';
import notification from './notification.js';
import { initSharedLayout } from './shared-layout.js';

// 导入登录逻辑
import { init as initLogin } from './login.js';

// 将核心对象挂载到 window（用于调试和跨模块访问）
window.authState = authState;
window.verificationCode = verificationCode;
window.FormValidator = FormValidator;
window.notification = notification;
window.httpClient = httpClient;
window.authService = authService;
window.AuthStorage = AuthStorage;

// 初始化所有组件
function initAll() {
    // 初始化共享布局
    if (typeof initSharedLayout === 'function') {
        initSharedLayout('auth');
    }

    // 初始化登录页面
    if (typeof initLogin === 'function') {
        initLogin();
    }
}

// 等待 DOM 准备就绪
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
