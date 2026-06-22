/**
 * [FILE] http-client.js
 * [POS] HTTP 请求客户端 - 封装 fetch API，添加认证拦截器和自动刷新 Token
 * [IN] URL、选项
 * [OUT] 响应数据
 * [DEP] auth-storage.js, auth-config.js
 * [SIDE EFFECT] 发送网络请求
 * [TEST] 验证请求拦截、响应处理、Token 自动刷新、401 风暴处理
 *
 * HTTP Client with Auth Interceptors
 * ============================================ */

import AuthStorage from './auth-storage.js';
import { API_ENDPOINTS, TOKEN_CONFIG, ERROR_CODES } from './auth-config.js';

// ============================================
// HTTP 客户端类
// ============================================
class HttpClient {
    constructor() {
        this.baseURL = ''; // 后端 API 基础 URL
        this.isRefreshing = false;
        this.refreshQueue = [];
        this.refreshRetryCount = 0;

        // auth-state 引用（延迟注入，避免循环依赖）
        this.authState = null;
    }

    /**
     * 设置认证状态管理器引用
     * @param {Object} authState - 认证状态管理器实例
     */
    setAuthState(authState) {
        this.authState = authState;
    }

    /**
     * 发送 HTTP 请求
     * @param {string} url - 请求 URL
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} 响应数据
     */
    async fetch(url, options = {}) {
        // 构建请求配置
        const config = this.buildRequestConfig(options);

        try {
            let response = await fetch(this.baseURL + url, config);

            // 处理 401 未授权响应
            if (response.status === 401 && !options.skipAuthRefresh) {
                return await this.handle401Response(url, config);
            }

            // 处理其他错误响应
            if (!response.ok) {
                return await this.handleErrorResponse(response);
            }

            // 解析成功响应
            return await response.json();

        } catch (error) {
            // 网络错误处理
            console.error('HTTP Request Error:', error);

            // 如果是已知的错误对象，直接抛出
            if (error.error) {
                throw error;
            }

            // 否则包装为网络错误
            throw {
                success: false,
                error: {
                    code: ERROR_CODES.NETWORK_ERROR,
                    message: '网络连接失败，请检查网络设置'
                }
            };
        }
    }

    /**
     * 构建请求配置
     * @param {Object} options - 原始选项
     * @returns {Object} 请求配置
     */
    buildRequestConfig(options) {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        // 自动添加 Authorization 头
        const token = AuthStorage.getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    }

    /**
     * 处理 401 未授权响应
     * @param {string} url - 原始请求 URL
     * @param {Object} originalConfig - 原始请求配置
     * @returns {Promise<Object>} 响应数据
     */
    async handle401Response(url, originalConfig) {
        // 如果正在刷新 Token，将请求加入队列
        if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
                this.refreshQueue.push({ resolve, reject, url, config: originalConfig });
            });
        }

        // 开始刷新 Token
        this.isRefreshing = true;

        try {
            const newToken = await this.refreshAccessToken();

            // 刷新成功，重试队列中的请求
            this.refreshQueue.forEach(({ resolve, url, config }) => {
                // 更新请求头中的 Token
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${newToken}`
                };
                resolve(this.fetch(url, { ...config, skipAuthRefresh: true }));
            });

            this.refreshQueue = [];
            this.refreshRetryCount = 0;

            // 重试原始请求
            return this.fetch(url, { ...originalConfig, skipAuthRefresh: true });

        } catch (error) {
            // 刷新失败，拒绝队列中的请求
            this.refreshQueue.forEach(({ reject }) => reject(error));
            this.refreshQueue = [];

            // 刷新失败，执行退出登录
            if (this.authState) {
                await this.authState.onLogout();
            }

            throw {
                success: false,
                error: {
                    code: ERROR_CODES.INVALID_REFRESH_TOKEN,
                    message: '登录已过期，请重新登录'
                }
            };

        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * 刷新访问令牌
     * @returns {Promise<string>} 新的访问令牌
     */
    async refreshAccessToken() {
        const refreshToken = AuthStorage.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        // 检查重试次数
        if (this.refreshRetryCount >= TOKEN_CONFIG.REFRESH_RETRY_LIMIT) {
            throw new Error('Refresh token retry limit exceeded');
        }

        this.refreshRetryCount++;

        const response = await fetch(this.baseURL + API_ENDPOINTS.REFRESH_TOKEN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.code || 'REFRESH_FAILED');
        }

        const data = await response.json();
        const { accessToken } = data.data;

        // 保存新 Token
        const currentStorage = AuthStorage.getCurrentStorage();
        const isLocalStorage = currentStorage === localStorage;
        const oldRefreshToken = AuthStorage.getRefreshToken();

        AuthStorage.saveTokens(accessToken, oldRefreshToken, isLocalStorage);

        return accessToken;
    }

    /**
     * 处理错误响应
     * @param {Response} response - 响应对象
     * @returns {Promise<never>}
     */
    async handleErrorResponse(response) {
        let errorData;

        try {
            errorData = await response.json();
        } catch {
            errorData = {
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: '请求失败，请稍后重试'
                }
            };
        }

        throw errorData;
    }

    /**
     * GET 请求
     * @param {string} url - 请求 URL
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} 响应数据
     */
    get(url, options = {}) {
        return this.fetch(url, { ...options, method: 'GET' });
    }

    /**
     * POST 请求
     * @param {string} url - 请求 URL
     * @param {Object} data - 请求数据
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} 响应数据
     */
    post(url, data, options = {}) {
        return this.fetch(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT 请求
     * @param {string} url - 请求 URL
     * @param {Object} data - 请求数据
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} 响应数据
     */
    put(url, data, options = {}) {
        return this.fetch(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE 请求
     * @param {string} url - 请求 URL
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} 响应数据
     */
    delete(url, options = {}) {
        return this.fetch(url, { ...options, method: 'DELETE' });
    }
}

// ============================================
// 单例导出
// ============================================
const httpClient = new HttpClient();
export default httpClient;

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
    module.exports = httpClient;
}
