/**
 * [FILE] verification-code.js
 * [POS] 验证码倒计时工具 - 管理验证码发送倒计时和防重复提交
 * [IN] 手机号、验证类型
 * [OUT] 倒计时状态、发送结果
 * [DEP] auth-service.js, auth-config.js
 * [SIDE EFFECT] 启动定时器、调用 API
 * [TEST] 验证倒计时逻辑、防重复提交、发送间隔检查
 *
 * Verification Code Manager
 * ============================================ */

import authService from './auth-service.js';
import { CODE_CONFIG } from './auth-config.js';

// ============================================
// 验证码管理器
// ============================================
class VerificationCodeManager {
    constructor() {
        this.countdown = 0;
        this.timer = null;
        this.lastSendTime = 0;
        this.currentPhone = '';
        this.currentType = '';
    }

    /**
     * 发送验证码
     * @param {string} phone - 手机号
     * @param {string} type - 验证码类型
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onError - 失败回调
     */
    async sendCode(phone, type, onSuccess, onError) {
        // 检查是否在倒计时中
        if (this.countdown > 0) {
            if (onError) {
                onError({
                    message: `请等待 ${this.countdown} 秒后再试`,
                    isCountdown: true
                });
            }
            return;
        }

        // 检查发送间隔
        const now = Date.now();
        if (now - this.lastSendTime < CODE_CONFIG.SEND_INTERVAL * 1000) {
            const waitTime = Math.ceil((CODE_CONFIG.SEND_INTERVAL * 1000 - (now - this.lastSendTime)) / 1000);
            if (onError) {
                onError({
                    message: `发送过于频繁，请 ${waitTime} 秒后再试`,
                    waitTime,
                    isCountdown: true
                });
            }
            return;
        }

        // 立即启动倒计时，提供即时反馈
        this.currentPhone = phone;
        this.currentType = type;
        this.lastSendTime = now;
        this.startCountdown();

        try {
            const response = await authService.sendCode(phone, type);

            if (response.success) {
                if (onSuccess) {
                    onSuccess(response.data);
                }
            } else {
                // API 返回失败，停止倒计时
                this.stopCountdown();
                this.lastSendTime = 0;
                if (onError) {
                    onError({
                        message: response.error?.message || '发送失败',
                        code: response.error?.code
                    });
                }
            }
        } catch (error) {
            // API 调用失败，停止倒计时
            this.stopCountdown();
            this.lastSendTime = 0;
            if (onError) {
                onError({
                    message: error.error?.message || '发送失败',
                    code: error.error?.code
                });
            }
        }
    }

    /**
     * 启动倒计时
     */
    startCountdown() {
        this.countdown = CODE_CONFIG.SEND_INTERVAL;

        this.timer = setInterval(() => {
            this.countdown--;

            // 触发倒计时更新事件
            this.onCountdownUpdate(this.countdown);

            if (this.countdown <= 0) {
                this.stopCountdown();
            }
        }, 1000);
    }

    /**
     * 停止倒计时
     */
    stopCountdown() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.countdown = 0;
    }

    /**
     * 倒计时更新回调（可被覆盖）
     * @param {number} remaining - 剩余秒数
     */
    onCountdownUpdate(remaining) {
        // 默认空实现，可被外部覆盖
        // 可以通过覆盖此方法来自定义更新逻辑
        if (typeof this.onCountdownUpdateCallback === 'function') {
            this.onCountdownUpdateCallback(remaining);
        }
    }

    /**
     * 设置倒计时更新回调
     * @param {Function} callback - 回调函数
     */
    setCountdownCallback(callback) {
        this.onCountdownUpdateCallback = callback;
    }

    /**
     * 重置状态
     */
    reset() {
        this.stopCountdown();
        this.lastSendTime = 0;
        this.currentPhone = '';
        this.currentType = '';
    }

    /**
     * 获取当前状态
     * @returns {Object} 状态对象
     */
    getState() {
        return {
            countdown: this.countdown,
            isSending: this.countdown > 0,
            currentPhone: this.currentPhone,
            currentType: this.currentType
        };
    }

    /**
     * 格式化倒计时显示文本
     * @param {number} seconds - 剩余秒数
     * @returns {string} 格式化文本
     */
    static formatCountdown(seconds) {
        if (seconds <= 0) {
            return '发送验证码';
        }
        return `${seconds}秒后重试`;
    }

    /**
     * 验证手机号格式
     * @param {string} phone - 手机号
     * @returns {boolean} 是否有效
     */
    static isValidPhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }
}

// ============================================
// 单例导出
// ============================================
const verificationCode = new VerificationCodeManager();
export default verificationCode;

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
    module.exports = verificationCode;
}
