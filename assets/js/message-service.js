/**
 * [FILE] message-service.js
 * [POS] 消息数据服务 - 封装消息相关的 API 调用
 * [IN] 查询参数
 * [OUT] API 响应数据
 * [DEP] http-client.js, auth-config.js, profile-config.js
 * [SIDE EFFECT] 发送网络请求（通过 http-client）
 * [TEST] Mock API 响应进行测试；验证成功/失败场景
 *
 * Message Data Service Layer
 * ============================================
 *
 * 设计原则：
 * - 本阶段仅实现单向系统通知，不实现私信会话功能
 * - 对齐现有 auth-service.js 的消息相关接口
 */

import httpClient from './http-client.js';
import { API_ENDPOINTS } from './auth-config.js';
import { MESSAGE_TYPES } from './profile-config.js';

// Mock 开关（开发阶段）
const USE_MOCK = true;

// ============================================
// 消息数据服务类
// ============================================
class MessageService {
    /**
     * 获取消息列表
     * 对齐现有 auth-service.js: getMessages()
     * @param {Object} params - 查询参数
     * @param {string} params.type - 消息类型筛选
     * @param {number} params.page - 页码
     * @param {number} params.limit - 每页数量
     * @returns {Promise<Object>} 消息列表数据
     */
    async getMessages(params = {}) {
        if (USE_MOCK) {
            return this._mockGetMessages(params);
        }
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
     * 对齐现有 auth-service.js: markMessageRead()
     * @param {string} messageId - 消息 ID
     * @returns {Promise<Object>} 响应数据
     */
    async markMessageRead(messageId) {
        if (USE_MOCK) {
            return this._mockMarkMessageRead(messageId);
        }
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
     * 标记所有消息已读
     * 对齐现有 auth-service.js: markAllMessagesRead()
     * @returns {Promise<Object>} 响应数据
     */
    async markAllMessagesRead() {
        if (USE_MOCK) {
            return this._mockMarkAllMessagesRead();
        }
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
     * 对齐现有 auth-service.js: deleteMessage()
     * @param {string} messageId - 消息 ID
     * @returns {Promise<Object>} 响应数据
     */
    async deleteMessage(messageId) {
        if (USE_MOCK) {
            return this._mockDeleteMessage(messageId);
        }
        try {
            const url = API_ENDPOINTS.DELETE_MESSAGE.replace('{id}', messageId);
            const response = await httpClient.delete(url);
            return response;
        } catch (error) {
            console.error('Delete message error:', error);
            throw error;
        }
    }

    /**
     * 获取未读消息计数
     * @returns {Promise<number>} 未读消息数
     */
    async getUnreadCount() {
        const result = await this.getMessages({ isRead: false, limit: 1 });
        return result.unreadCount || 0;
    }

    /**
     * 根据ID获取单条消息
     * @param {string} messageId - 消息ID
     * @returns {Promise<Object|null>} 消息对象，不存在返回null
     */
    async getMessageById(messageId) {
        if (USE_MOCK) {
            return this._mockGetMessageById(messageId);
        }
        try {
            const url = API_ENDPOINTS.GET_MESSAGE_BY_ID.replace('{id}', messageId);
            const response = await httpClient.get(url);
            return response.data.message;
        } catch (error) {
            console.error('Get message by id error:', error);
            throw error;
        }
    }

    /**
     * 获取相邻消息（上一条、下一条）
     * @param {string} currentMessageId - 当前消息ID
     * @returns {Promise<Object>} 相邻消息对象 { previous, next }
     */
    async getAdjacentMessages(currentMessageId) {
        if (USE_MOCK) {
            return this._mockGetAdjacentMessages(currentMessageId);
        }
        try {
            const response = await httpClient.get(`${API_ENDPOINTS.GET_MESSAGES}/${currentMessageId}/adjacent`);
            return response.data;
        } catch (error) {
            console.error('Get adjacent messages error:', error);
            throw error;
        }
    }

    // ============================================
    // Mock 方法（开发阶段使用）
    // ============================================

    /**
     * 获取默认消息数据
     * @returns {Array} 默认消息列表
     */
    _getDefaultMessages() {
        return [
            {
                id: 'msg-001',
                type: MESSAGE_TYPES.TASK,
                title: '任务状态变更通知',
                content: '您发布的任务「企业官网开发」已有新的竞标',
                taskId: 'task-001',
                taskTitle: '企业官网开发',
                actionType: 'task_new_bid',
                actionUrl: 'task-hall.html?task=task-001',
                isRead: false,
                createdAt: '2024-04-07T14:30:00+08:00',
                deletedAt: null,
                lifecycle: {
                    canDelete: true,
                    deleteAction: 'remove',
                    jumpIfTaskDeleted: 'task-hall.html'
                }
            },
            {
                id: 'msg-002',
                type: MESSAGE_TYPES.SYSTEM,
                title: '实名认证提醒',
                content: '请完成实名认证以解锁更多功能',
                actionType: 'real_name_reminder',
                actionUrl: 'real-name-auth.html',
                isRead: false,
                createdAt: '2024-04-07T10:00:00+08:00',
                deletedAt: null,
                lifecycle: {
                    canDelete: true,
                    deleteAction: 'remove',
                    jumpIfTaskDeleted: null
                }
            },
            {
                id: 'msg-003',
                type: MESSAGE_TYPES.TASK,
                title: '竞标已被接受',
                content: '您对任务「移动端 App 开发」的竞标已被客户接受',
                taskId: 'task-002',
                taskTitle: '移动端 App 开发',
                actionType: 'bid_accepted',
                actionUrl: 'profile-developer.html?tab=my-participations',
                isRead: true,
                createdAt: '2024-04-06T16:20:00+08:00',
                deletedAt: null,
                lifecycle: {
                    canDelete: true,
                    deleteAction: 'remove',
                    jumpIfTaskDeleted: 'task-hall.html'
                }
            },
            {
                id: 'msg-004',
                type: MESSAGE_TYPES.SYSTEM,
                title: '欢迎加入 TechCraft',
                content: '感谢您注册 TechCraft，开始您的任务之旅吧！',
                actionType: 'welcome',
                actionUrl: 'task-hall.html',
                isRead: true,
                createdAt: '2024-04-01T09:00:00+08:00',
                deletedAt: null,
                lifecycle: {
                    canDelete: true,
                    deleteAction: 'remove',
                    jumpIfTaskDeleted: null
                }
            }
        ];
    }

    /**
     * Mock: 获取消息列表
     */
    async _mockGetMessages(params = {}) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 200));

        const { type, page = 1, limit = 20, isRead } = params;

        // 从 localStorage 读取消息数据
        const stored = localStorage.getItem('techcraft_messages');
        let messages = stored ? JSON.parse(stored) : this._getDefaultMessages();

        // 如果 localStorage 为空，初始化默认数据
        if (!stored) {
            localStorage.setItem('techcraft_messages', JSON.stringify(messages));
        }

        // 类型筛选
        if (type && type !== 'all') {
            messages = messages.filter(m => m.type === type);
        }

        // 已读筛选
        if (isRead !== undefined) {
            messages = messages.filter(m => m.isRead === isRead);
        }

        // 排除已删除
        messages = messages.filter(m => !m.deletedAt);

        // 计算未读数
        const unreadCount = messages.filter(m => !m.isRead).length;

        // 分页
        const start = (page - 1) * limit;
        const paginatedMessages = messages.slice(start, start + limit);

        return {
            messages: paginatedMessages,
            unreadCount,
            pagination: {
                page,
                limit,
                total: messages.length,
                totalPages: Math.ceil(messages.length / limit)
            }
        };
    }

    /**
     * Mock: 标记消息已读（带持久化）
     */
    async _mockMarkMessageRead(messageId) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('[Mock] 标记消息已读:', messageId);

        // 从 localStorage 读取消息数据
        const stored = localStorage.getItem('techcraft_messages');
        let messages = stored ? JSON.parse(stored) : this._getDefaultMessages();

        // 查找并更新消息
        const msg = messages.find(m => m.id === messageId);

        if (msg) {
            msg.isRead = true;
            msg.readAt = new Date().toISOString();

            // 保存回 localStorage
            localStorage.setItem('techcraft_messages', JSON.stringify(messages));
        }

        return {
            success: true,
            data: {
                message: '消息已标记为已读'
            }
        };
    }

    /**
     * Mock: 标记所有消息已读
     */
    async _mockMarkAllMessagesRead() {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 200));

        console.log('[Mock] 标记所有消息已读');

        return {
            success: true,
            data: {
                message: '所有消息已标记为已读'
            }
        };
    }

    /**
     * Mock: 删除消息（带持久化）
     */
    async _mockDeleteMessage(messageId) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('[Mock] 删除消息:', messageId);

        // 从 localStorage 读取消息数据
        const stored = localStorage.getItem('techcraft_messages');
        let messages = stored ? JSON.parse(stored) : this._getDefaultMessages();

        // 查找并软删除消息
        const index = messages.findIndex(m => m.id === messageId);

        if (index !== -1) {
            messages[index].deletedAt = new Date().toISOString();

            // 保存回 localStorage
            localStorage.setItem('techcraft_messages', JSON.stringify(messages));
        }

        return {
            success: true,
            data: {
                message: '消息已删除'
            }
        };
    }

    /**
     * Mock: 根据ID获取单条消息
     */
    async _mockGetMessageById(messageId) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 100));

        // 从 localStorage 读取消息数据
        const stored = localStorage.getItem('techcraft_messages');
        let messages = stored ? JSON.parse(stored) : this._getDefaultMessages();

        // 查找消息
        const message = messages.find(m => m.id === messageId);

        // 检查是否已删除
        if (message && message.deletedAt) {
            return null;
        }

        return message || null;
    }

    /**
     * Mock: 获取相邻消息
     */
    async _mockGetAdjacentMessages(currentMessageId) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 100));

        // 获取所有消息
        const result = await this._mockGetMessages();

        // 从响应对象中提取 messages 数组
        const messages = result.messages || [];

        // 按创建时间降序排序（最新的在前）
        const sortedMessages = messages.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        // 找到当前消息的索引
        const currentIndex = sortedMessages.findIndex(m => m.id === currentMessageId);

        return {
            previous: sortedMessages[currentIndex + 1] || null,
            next: sortedMessages[currentIndex - 1] || null
        };
    }
}

// ============================================
// 单例导出
// ============================================
const messageService = new MessageService();
export default messageService;

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
    module.exports = messageService;
}
