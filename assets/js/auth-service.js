/**
 * [FILE] auth-service.js
 * [POS] 认证服务层 - 封装认证相关的 API 调用
 * [IN] 用户凭证 (手机号、验证码、密码等)
 * [OUT] API 响应数据
 * [DEP] http-client.js, auth-config.js
 * [SIDE EFFECT] 发送网络请求（通过 http-client）
 * [TEST] Mock API 响应进行测试；验证成功/失败场景
 *
 * Authentication Service Layer
 * ============================================ */

import httpClient from './http-client.js';
import { API_ENDPOINTS } from './auth-config.js';

// ============================================
// 认证服务类
// ============================================
class AuthService {
    /**
     * 发送验证码
     * @param {string} phone - 手机号
     * @param {string} type - 验证码类型 (login | register | reset_password)
     * @returns {Promise<Object>} 响应数据
     */
    async sendCode(phone, type = 'login') {
        try {
            const response = await httpClient.post(API_ENDPOINTS.SEND_CODE, {
                phone,
                type
            });
            return response;
        } catch (error) {
            console.error('Send code error:', error);
            throw error;
        }
    }

    /**
     * 验证码登录
     * @param {string} phone - 手机号
     * @param {string} code - 验证码
     * @param {boolean} rememberMe - 是否记住我
     * @returns {Promise<Object>} 响应数据
     */
    async login(phone, code, rememberMe = false) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.LOGIN, {
                phone,
                code,
                rememberMe
            });
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * 用户注册
     * @param {Object} userData - 注册数据
     * @param {string} userData.phone - 手机号
     * @param {string} userData.code - 验证码
     * @param {string} userData.password - 密码
     * @param {string} userData.role - 角色
     * @param {string} userData.name - 姓名
     * @returns {Promise<Object>} 响应数据
     */
    async register(userData) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.REGISTER, userData);
            return response;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    /**
     * 退出登录
     * @returns {Promise<Object>} 响应数据
     */
    async logout() {
        try {
            const response = await httpClient.post(API_ENDPOINTS.LOGOUT);
            return response;
        } catch (error) {
            console.error('Logout API error:', error);
            // 退出登录即使 API 失败也不抛出错误
            return { success: true };
        }
    }

    /**
     * 获取用户资料
     * @returns {Promise<Object>} 用户数据
     */
    async getProfile() {
        try {
            const response = await httpClient.get(API_ENDPOINTS.GET_PROFILE);
            return response.data.user;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    /**
     * 修改密码
     * @param {string} oldPassword - 旧密码
     * @param {string} newPassword - 新密码
     * @returns {Promise<Object>} 响应数据
     */
    async changePassword(oldPassword, newPassword) {
        try {
            const response = await httpClient.put(API_ENDPOINTS.CHANGE_PASSWORD, {
                oldPassword,
                newPassword
            });
            return response;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    /**
     * 注销账户
     * @param {string} reason - 注销原因（可选）
     * @returns {Promise<Object>} 响应数据
     */
    async deleteAccount(reason = '') {
        try {
            const response = await httpClient.delete(API_ENDPOINTS.DELETE_ACCOUNT, {
                reason
            });
            return response;
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        }
    }

    /**
     * 获取我的任务
     * @param {Object} params - 查询参数
     * @param {string} params.role - 角色 (client | developer)
     * @param {string} params.status - 状态筛选
     * @param {number} params.page - 页码
     * @param {number} params.limit - 每页数量
     * @returns {Promise<Object>} 任务列表数据
     */
    async getMyTasks(params = {}) {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await httpClient.get(`${API_ENDPOINTS.GET_MY_TASKS}?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('Get my tasks error:', error);
            throw error;
        }
    }

    /**
     * 获取消息列表
     * @param {Object} params - 查询参数
     * @param {string} params.type - 消息类型
     * @param {number} params.page - 页码
     * @param {number} params.limit - 每页数量
     * @returns {Promise<Object>} 消息列表数据
     */
    async getMessages(params = {}) {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await httpClient.get(`${API_ENDPOINTS.GET_MESSAGES}?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('Get messages error:', error);
            throw error;
        }
    }

    /**
     * 标记单条消息已读
     * @param {string} messageId - 消息 ID
     * @returns {Promise<Object>} 响应数据
     */
    async markMessageRead(messageId) {
        try {
            const url = API_ENDPOINTS.MARK_MESSAGE_READ.replace('{id}', messageId);
            const response = await httpClient.put(url);
            return response;
        } catch (error) {
            console.error('Mark message read error:', error);
            throw error;
        }
    }

    /**
     * 全部标记为已读
     * @returns {Promise<Object>} 响应数据
     */
    async markAllMessagesRead() {
        try {
            const response = await httpClient.put(API_ENDPOINTS.MARK_ALL_READ);
            return response;
        } catch (error) {
            console.error('Mark all read error:', error);
            throw error;
        }
    }

    /**
     * 删除消息
     * @param {string} messageId - 消息 ID
     * @returns {Promise<Object>} 响应数据
     */
    async deleteMessage(messageId) {
        try {
            const url = API_ENDPOINTS.DELETE_MESSAGE.replace('{id}', messageId);
            const response = await httpClient.delete(url);
            return response;
        } catch (error) {
            console.error('Delete message error:', error);
            throw error;
        }
    }
}

// ============================================
// 单例导出
// ============================================
const authService = new AuthService();
export default authService;

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authService;
}
