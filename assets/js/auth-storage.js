/**
 * [FILE] auth-storage.js
 * [POS] 认证存储工具 - 管理认证数据的本地存储，支持跨标签页同步
 * [IN] 用户数据、Token、rememberMe 标志
 * [OUT] 存储的数据 (get 方法)
 * [DEP] auth-config.js (TOKEN_CONFIG)
 * [SIDE EFFECT] 读写 localStorage/sessionStorage
 * [TEST] 验证存储和读取功能；验证 rememberMe 逻辑；验证跨标签页同步
 *
 * Authentication Storage Utility
 * ============================================ */

import { TOKEN_CONFIG } from './auth-config.js';

// ============================================
// 存储键
// ============================================
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'techcraft_access_token',
    REFRESH_TOKEN: 'techcraft_refresh_token',
    USER_DATA: 'techcraft_user_data',
    TOKEN_EXPIRY: 'techcraft_token_expiry',
    AUTH_EVENT: 'techcraft_auth_event'  // 跨标签页同步事件
};

// ============================================
// 存储工具类
// ============================================
class AuthStorage {
    /**
     * 获取存储对象（根据 rememberMe 选择存储方式）
     * @param {boolean} rememberMe - 是否记住我
     * @returns {Storage} localStorage 或 sessionStorage
     */
    static getStorage(rememberMe = false) {
        return rememberMe ? localStorage : sessionStorage;
    }

    /**
     * 获取当前使用的存储（自动检测）
     * @returns {Storage} localStorage 或 sessionStorage
     */
    static getCurrentStorage() {
        // 优先检查 sessionStorage
        if (sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
            return sessionStorage;
        }
        // 其次检查 localStorage
        if (localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
            return localStorage;
        }
        // 默认返回 sessionStorage
        return sessionStorage;
    }

    /**
     * 保存 Token
     * @param {string} accessToken - 访问令牌
     * @param {string} refreshToken - 刷新令牌
     * @param {boolean} rememberMe - 是否记住我
     */
    static saveTokens(accessToken, refreshToken, rememberMe = false) {
        const storage = this.getStorage(rememberMe);

        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

        const expiry = Date.now() + (TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY * 1000);
        storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());

        // 清除另一个存储中的 Token（避免冲突）
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        otherStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        otherStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        otherStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    }

    /**
     * 获取访问令牌
     * @returns {string|null}
     */
    static getAccessToken() {
        // 优先使用新的存储键
        const token = this.getCurrentStorage().getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) return token;

        // 兼容旧的存储键（向后兼容 login.html）
        const storage = this.getCurrentStorage();
        const oldToken = storage.getItem('techcraft_token');
        if (oldToken) {
            // 将旧 token 迁移到新格式
            this.saveTokens(oldToken, '', storage === localStorage);
            return oldToken;
        }

        return null;
    }

    /**
     * 获取刷新令牌
     * @returns {string|null}
     */
    static getRefreshToken() {
        return this.getCurrentStorage().getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    /**
     * 检查 Token 是否即将过期
     * @returns {boolean}
     */
    static isTokenExpiringSoon() {
        const expiry = this.getCurrentStorage().getItem(STORAGE_KEYS.TOKEN_EXPIRY);
        if (!expiry) return true;

        const expiryTime = parseInt(expiry);
        const now = Date.now();
        const threshold = TOKEN_CONFIG.REFRESH_THRESHOLD * 1000;

        return expiryTime - now < threshold;
    }

    /**
     * 保存用户数据（跟随 rememberMe）
     * @param {Object} userData - 用户数据
     * @param {boolean} rememberMe - 是否记住我
     */
    static saveUserData(userData, rememberMe = false) {
        const storage = this.getStorage(rememberMe);
        storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

        // 清除另一个存储中的用户数据
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        otherStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }

    /**
     * 获取用户数据
     * @returns {Object|null}
     */
    static getUserData() {
        // 首先检查新的存储格式
        let data = this.getCurrentStorage().getItem(STORAGE_KEYS.USER_DATA);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

        // 如果当前存储没有，尝试从 localStorage 获取新格式
        data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Failed to parse user data from localStorage:', e);
            }
        }

        // 兼容旧的存储格式（向后兼容 login.html）
        // 检查 sessionStorage
        let oldData = sessionStorage.getItem('techcraft_user');
        if (oldData) {
            try {
                const userData = JSON.parse(oldData);
                console.log('Found user data in sessionStorage (old format)');
                return userData;
            } catch (e) {
                console.error('Failed to parse old user data from sessionStorage:', e);
            }
        }

        // 检查 localStorage
        oldData = localStorage.getItem('techcraft_user');
        if (oldData) {
            try {
                const userData = JSON.parse(oldData);
                console.log('Found user data in localStorage (old format)');
                return userData;
            } catch (e) {
                console.error('Failed to parse old user data from localStorage:', e);
            }
        }

        console.warn('No user data found in any storage');
        return null;
    }

    /**
     * 检查是否已认证
     * @returns {boolean}
     */
    static isAuthenticated() {
        // 首先检查新的存储格式
        const newToken = this.getAccessToken();
        if (newToken) {
            const expiry = this.getCurrentStorage().getItem(STORAGE_KEYS.TOKEN_EXPIRY);
            if (expiry) {
                return Date.now() < parseInt(expiry);
            }
            return true; // 有 token 但没有 expiry，认为已认证
        }

        // 兼容旧的存储格式（向后兼容 login.html）
        // 检查 sessionStorage
        const oldTokenSession = sessionStorage.getItem('techcraft_token');
        const oldAuthSession = sessionStorage.getItem('techcraft_authenticated');
        if (oldTokenSession || oldAuthSession === 'true') {
            return true;
        }

        // 检查 localStorage
        const oldTokenLocal = localStorage.getItem('techcraft_token');
        const oldAuthLocal = localStorage.getItem('techcraft_authenticated');
        if (oldTokenLocal || oldAuthLocal === 'true') {
            return true;
        }

        return false;
    }

    /**
     * 清除认证数据（所有存储）
     */
    static clearAuthData() {
        // 清除 localStorage
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        localStorage.removeItem(STORAGE_KEYS.AUTH_EVENT);

        // 清除 sessionStorage
        sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_EVENT);
    }

    /**
     * 广播认证事件（跨标签页同步）
     * @param {string} type - 事件类型
     * @param {Object} data - 事件数据
     */
    static broadcastAuthEvent(type, data) {
        const event = {
            type,
            data,
            timestamp: Date.now()
        };

        // 同时写入 localStorage 和 sessionStorage
        try {
            localStorage.setItem(STORAGE_KEYS.AUTH_EVENT, JSON.stringify(event));
            sessionStorage.setItem(STORAGE_KEYS.AUTH_EVENT, JSON.stringify(event));
        } catch (e) {
            console.error('Failed to broadcast auth event:', e);
        }
    }

    /**
     * 清除认证事件
     */
    static clearAuthEvent() {
        localStorage.removeItem(STORAGE_KEYS.AUTH_EVENT);
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_EVENT);
    }

    /**
     * 检查存储是否可用
     * @returns {boolean}
     */
    static isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// ============================================
// 导出
// ============================================
export default AuthStorage;

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthStorage;
}
