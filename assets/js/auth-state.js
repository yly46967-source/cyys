/**
 * [FILE] auth-state.js
 * [POS] 认证状态管理 - 管理全局认证状态，通知订阅者，支持跨标签页同步
 * [IN] 用户数据、Token
 * [OUT] 状态更新事件
 * [DEP] auth-storage.js, auth-service.js
 * [SIDE EFFECT] 触发状态变化事件，写入 storage 事件
 * [TEST] 验证状态变化、事件通知、跨标签页同步
 *
 * Authentication State Manager
 * ============================================ */

import AuthStorage from './auth-storage.js';
import authService from './auth-service.js';
import userService from './user-service.js';
import httpClient from './http-client.js';

// ============================================
// 认证状态管理器
// ============================================
class AuthStateManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.listeners = [];

        // 事件类型
        this.EVENTS = {
            LOGIN: 'login',
            LOGOUT: 'logout',
            TOKEN_REFRESH: 'refresh',
            USER_UPDATE: 'update',
            REAL_NAME_STATUS: 'realname',
            MESSAGE_COUNT: 'message_count'  // 新增：未读消息计数变化
        };

        // 未读消息计数（新增）
        this.unreadMessageCount = 0;

        // 初始化
        this.init();
        this.setupCrossTabSync();

        // 设置 httpClient 的 authState 引用
        httpClient.setAuthState(this);
    }

    /**
     * 获取当前登录用户
     * @returns {Object|null} 当前用户数据，未登录返回 null
     */
    getCurrentUser() {
        return this.currentUser || null;
    }

    /**
     * 初始化：从存储恢复状态
     */
    init() {
        if (AuthStorage.isAuthenticated()) {
            const userData = AuthStorage.getUserData();
            if (userData) {
                this.currentUser = userData;
                this.isAuthenticated = true;
                console.log('Auth state restored:', userData);
            }
        }
    }

    /**
     * 设置跨标签页同步
     */
    setupCrossTabSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'techcraft_auth_event' && e.newValue) {
                try {
                    const { type, data } = JSON.parse(e.newValue);

                    // 忽略自己广播的事件
                    const storage = AuthStorage.getCurrentStorage();
                    const currentEventData = storage.getItem('techcraft_auth_event');
                    if (e.newValue === currentEventData) {
                        return;
                    }

                    this.handleCrossTabEvent(type, data);
                } catch (error) {
                    console.error('Cross-tab sync error:', error);
                }
            }
        });
    }

    /**
     * 处理跨标签页事件
     * @param {string} type - 事件类型
     * @param {Object} data - 事件数据
     */
    handleCrossTabEvent(type, data) {
        switch (type) {
            case this.EVENTS.LOGOUT:
                // 其他标签页退出登录，当前标签页同步退出
                this.currentUser = null;
                this.isAuthenticated = false;
                this.notifyListeners(this.EVENTS.LOGOUT);

                // 刷新页面或跳转首页
                const currentPath = window.location.pathname;
                if (currentPath !== '/index.html' && currentPath !== '/') {
                    window.location.href = '/index.html';
                }
                break;

            case this.EVENTS.USER_UPDATE:
                // 其他标签页更新了用户信息
                this.currentUser = data;
                const isLocalStorage = AuthStorage.getCurrentStorage() === localStorage;
                AuthStorage.saveUserData(data, isLocalStorage);
                this.notifyListeners(this.EVENTS.USER_UPDATE, data);

                // 刷新导航栏用户信息
                this.refreshNavbar();
                break;

            case this.EVENTS.REAL_NAME_STATUS:
                // 实名认证状态变化
                if (this.currentUser) {
                    this.currentUser.realNameStatus = data.status;
                    this.notifyListeners(this.EVENTS.REAL_NAME_STATUS, data);
                }
                break;

            case this.EVENTS.MESSAGE_COUNT:
                // 未读消息计数变化（新增）
                this.unreadMessageCount = data.count;
                this.notifyListeners(this.EVENTS.MESSAGE_COUNT, data);
                break;
        }
    }

    /**
     * 订阅状态变化
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消订阅函数
     */
    subscribe(callback) {
        this.listeners.push(callback);

        // 返回取消订阅函数
        return () => {
            this.listeners = this.listeners.filter(fn => fn !== callback);
        };
    }

    /**
     * 通知所有订阅者
     * @param {string} event - 事件类型
     * @param {Object} data - 事件数据
     */
    notifyListeners(event, data = null) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Listener error:', error);
            }
        });
    }

    /**
     * 登录成功处理
     * @param {string} phone - 手机号
     * @param {string} code - 验证码
     * @param {boolean} rememberMe - 是否记住我
     * @returns {Promise<Object>} 登录结果
     */
    async onLoginSuccess(phone, code, rememberMe = false) {
        try {
            const response = await authService.login(phone, code, rememberMe);
            const { user, tokens } = response.data;

            // 保存 Token 和用户数据
            AuthStorage.saveTokens(
                tokens.accessToken,
                tokens.refreshToken,
                rememberMe
            );
            AuthStorage.saveUserData(user, rememberMe);

            // 更新状态
            this.currentUser = user;
            this.isAuthenticated = true;

            // 广播登录事件（跨标签页同步）
            AuthStorage.broadcastAuthEvent(this.EVENTS.LOGIN, user);

            // 通知订阅者
            this.notifyListeners(this.EVENTS.LOGIN, user);

            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.error?.message || error.message || '登录失败'
            };
        }
    }

    /**
     * 注册成功处理
     * @param {Object} userData - 注册数据
     * @returns {Promise<Object>} 注册结果
     */
    async onRegister(userData) {
        try {
            const response = await authService.register(userData);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                error: error.error?.message || error.message || '注册失败'
            };
        }
    }

    /**
     * 退出登录
     */
    async onLogout() {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // 清除本地数据
            AuthStorage.clearAuthData();
            this.currentUser = null;
            this.isAuthenticated = false;

            // 广播退出事件（跨标签页同步）
            AuthStorage.broadcastAuthEvent(this.EVENTS.LOGOUT);

            // 通知订阅者
            this.notifyListeners(this.EVENTS.LOGOUT);
        }
    }

    /**
     * 更新用户信息
     * @param {Object} updates - 更新数据
     * @returns {Promise<Object>} 更新结果
     */
    async onUpdateUser(updates) {
        try {
            // 修改为调用 user-service.updateUserProfile()
            // user-service 直接返回用户对象，不是响应对象
            const updatedUser = await userService.updateUserProfile(updates);

            this.currentUser = { ...this.currentUser, ...updatedUser };

            const rememberMe = AuthStorage.getCurrentStorage() === localStorage;
            AuthStorage.saveUserData(this.currentUser, rememberMe);

            // 广播更新事件（跨标签页同步）
            AuthStorage.broadcastAuthEvent(this.EVENTS.USER_UPDATE, this.currentUser);

            // 通知订阅者
            this.notifyListeners(this.EVENTS.USER_UPDATE, this.currentUser);

            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Update user error:', error);
            return {
                success: false,
                error: error.error?.message || error.message || '更新失败'
            };
        }
    }

    /**
     * 刷新用户数据
     * @returns {Promise<Object|null>} 用户数据
     */
    async refreshUserData() {
        try {
            const user = await authService.getProfile();
            this.currentUser = user;

            const rememberMe = AuthStorage.getCurrentStorage() === localStorage;
            AuthStorage.saveUserData(user, rememberMe);

            this.notifyListeners(this.EVENTS.USER_UPDATE, user);
            return user;
        } catch (error) {
            console.error('Refresh user data error:', error);
            // 刷新失败，可能 token 过期，执行退出
            await this.onLogout();
            return null;
        }
    }

    /**
     * 更新实名认证状态
     * @param {Object} statusData - 状态数据
     */
    updateRealNameStatus(statusData) {
        if (this.currentUser) {
            this.currentUser.realNameStatus = statusData.status;
            this.currentUser.realNameData = statusData;

            // 广播状态变化（跨标签页同步）
            AuthStorage.broadcastAuthEvent(this.EVENTS.REAL_NAME_STATUS, statusData);

            // 通知订阅者
            this.notifyListeners(this.EVENTS.REAL_NAME_STATUS, statusData);
        }
    }

    /**
     * 检查用户权限
     * @param {string} requiredRole - 需要的角色
     * @param {string} requiredStatus - 需要的实名认证状态
     * @returns {Object} 权限检查结果
     */
    checkPermission(requiredRole = null, requiredStatus = null) {
        if (!this.isAuthenticated) {
            return {
                allowed: false,
                reason: 'NOT_AUTHENTICATED',
                message: '请先登录'
            };
        }

        if (requiredRole && this.currentUser.role !== requiredRole) {
            return {
                allowed: false,
                reason: 'ROLE_MISMATCH',
                message: '您没有权限执行此操作'
            };
        }

        if (requiredStatus) {
            const status = this.currentUser.realNameStatus || 'not_started';
            const statusPriority = ['verified', 'pending', 'rejected', 'not_started'];
            const requiredPriority = statusPriority.indexOf(requiredStatus);
            const currentPriority = statusPriority.indexOf(status);

            if (currentPriority < requiredPriority) {
                return {
                    allowed: false,
                    reason: 'REAL_NAME_REQUIRED',
                    message: '请先完成实名认证'
                };
            }
        }

        return { allowed: true };
    }

    /**
     * 刷新导航栏（用于跨标签页同步后更新UI）
     */
    refreshNavbar() {
        // 触发导航栏重新渲染
        if (typeof window.renderNavbarAuth === 'function') {
            window.renderNavbarAuth();
        }
    }

    // ============================================
    // 未读消息计数管理（新增）
    // ============================================

    /**
     * 设置未读消息计数
     * @param {number} count - 未读消息数
     */
    setUnreadMessageCount(count) {
        this.unreadMessageCount = Math.max(0, count);

        // 广播消息计数变化（跨标签页同步）
        AuthStorage.broadcastAuthEvent(this.EVENTS.MESSAGE_COUNT, { count });

        // 通知订阅者
        this.notifyListeners(this.EVENTS.MESSAGE_COUNT, { count });
    }

    /**
     * 获取未读消息计数
     * @returns {number} 未读消息数
     */
    getUnreadMessageCount() {
        return this.unreadMessageCount;
    }

    /**
     * 增加未读消息计数
     * @param {number} delta - 增加的数量
     */
    incrementUnreadCount(delta = 1) {
        this.setUnreadMessageCount(this.unreadMessageCount + delta);
    }

    /**
     * 减少未读消息计数
     * @param {number} delta - 减少的数量
     */
    decrementUnreadCount(delta = 1) {
        this.setUnreadMessageCount(this.unreadMessageCount - delta);
    }

    /**
     * 清空未读消息计数
     */
    clearUnreadCount() {
        this.setUnreadMessageCount(0);
    }
}

// ============================================
// 单例导出
// ============================================
const authState = new AuthStateManager();
export default authState;

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authState;
}
