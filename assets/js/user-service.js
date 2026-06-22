/**
 * [FILE] user-service.js
 * [POS] 用户数据服务 - 封装用户资料相关的 API 调用，适配现有 auth-service
 * [IN] 用户数据
 * [OUT] API 响应数据
 * [DEP] http-client.js, auth-service.js, auth-config.js
 * [SIDE EFFECT] 发送网络请求（通过 http-client）
 * [TEST] Mock API 响应进行测试；验证成功/失败场景
 *
 * User Data Service Layer
 * ============================================
 *
 * 设计原则：完全对齐现有 auth-service.js 契约，不定义冲突接口
 */

import httpClient from './http-client.js';
import { API_ENDPOINTS } from './auth-config.js';
import AuthStorage from './auth-storage.js';

// Mock 开关（开发阶段）
const USE_MOCK = true;

// ============================================
// 用户数据服务类
// ============================================
class UserService {
    /**
     * 获取用户资料
     * 对齐现有 auth-service.js: getProfile()
     * @returns {Promise<Object>} 用户数据
     */
    async getUserProfile() {
        if (USE_MOCK) {
            return this._mockGetUserProfile();
        }
        try {
            const response = await httpClient.get(API_ENDPOINTS.GET_PROFILE);
            return response.data.user;
        } catch (error) {
            console.error('Get user profile error:', error);
            throw error;
        }
    }

    /**
     * 更新用户资料
     * 对齐现有 auth-service.js: updateProfile()
     * @param {Object} updates - 更新数据
     * @returns {Promise<Object>} 更新后的用户数据
     */
    async updateUserProfile(updates) {
        if (USE_MOCK) {
            return this._mockUpdateUserProfile(updates);
        }
        try {
            const response = await httpClient.put(API_ENDPOINTS.UPDATE_PROFILE, updates);
            return response.data.user;
        } catch (error) {
            console.error('Update user profile error:', error);
            throw error;
        }
    }

    /**
     * 上传头像
     * @param {File} file - 头像文件
     * @returns {Promise<Object>} 上传结果
     */
    async uploadAvatar(file) {
        if (USE_MOCK) {
            return this._mockUploadAvatar(file);
        }
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await httpClient.post('/api/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Upload avatar error:', error);
            throw error;
        }
    }

    /**
     * 获取用户统计数据
     * 从用户资料中提取统计数据
     * @returns {Promise<Object>} 统计数据
     */
    async getUserStats() {
        const user = await this.getUserProfile();
        return user.stats || {};
    }

    // ============================================
    // Mock 方法（开发阶段使用）
    // ============================================

    /**
     * Mock: 获取用户资料
     */
    async _mockGetUserProfile() {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));

        // 从存储获取当前用户（使用统一接口）
        const storedUser = AuthStorage.getUserData();
        if (storedUser) {
            return storedUser;
        }

        // 默认 Mock 用户
        return {
            id: 'user-001',
            phone: '13800138000',
            name: '张三',
            role: 'client',
            realNameStatus: 'not_started',
            extension: {
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
                bio: '专注于企业级应用开发，10年+经验',
                location: '北京',
                website: 'https://example.com',
                company: {
                    name: '某科技公司',
                    creditCode: '91110000MA1234567X'
                },
                title: '技术总监'
            },
            stats: {
                postedTasks: 5,
                totalBudget: 45000,
                inProgressTasks: 2,
                completedTasks: 3,
                totalEarnings: 0,
                rating: 4.8,
                responseRate: 95
            },
            createdAt: '2024-01-15T08:00:00Z',
            updatedAt: '2024-04-07T10:30:00Z'
        };
    }

    /**
     * Mock: 更新用户资料
     */
    async _mockUpdateUserProfile(updates) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log('[Mock] 更新用户资料:', updates);

        // 获取当前用户
        const currentUser = await this._mockGetUserProfile();

        // 合并更新
        const updatedUser = {
            ...currentUser,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // 保存到存储（使用统一接口，保持当前存储选择）
        const rememberMe = AuthStorage.getCurrentStorage() === localStorage;
        AuthStorage.saveUserData(updatedUser, rememberMe);

        // 如果有 authState，通知订阅者
        if (window.authState) {
            window.authState.currentUser = updatedUser;
            window.authState.isAuthenticated = true;

            if (typeof window.authState.notifyListeners === 'function') {
                window.authState.notifyListeners(window.authState.EVENTS?.USER_UPDATE || 'update', updatedUser);
            }

            if (typeof window.renderNavbarAuth === 'function') {
                window.renderNavbarAuth();
            }
        }

        return updatedUser;
    }

    /**
     * Mock: 上传头像
     */
    async _mockUploadAvatar(file) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('[Mock] 上传头像:', file.name, file.size, file.type);

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('不支持的文件格式，请使用 JPG、PNG 或 WebP');
        }

        // 验证文件大小
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            throw new Error('文件大小不能超过 2MB');
        }

        // 创建本地预览 URL
        const previewUrl = URL.createObjectURL(file);

        return {
            success: true,
            data: {
                url: previewUrl,
                message: '头像上传成功'
            }
        };
    }
}

// ============================================
// 单例导出
// ============================================
const userService = new UserService();
export default userService;

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
    module.exports = userService;
}
