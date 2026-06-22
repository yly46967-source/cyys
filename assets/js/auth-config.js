/**
 * [FILE] auth-config.js
 * [POS] 认证配置文件 - 定义认证相关的常量、枚举、API端点、错误码
 * [IN] 无
 * [OUT] 配置对象 (常量、枚举)
 * [DEP] 无
 * [SIDE EFFECT] 无
 * [TEST] 验证配置值正确性；验证枚举覆盖所有场景
 *
 * Authentication Configuration
 * ============================================ */

// ============================================
// 用户角色枚举
// ============================================
const USER_ROLES = {
    CLIENT: 'client',
    DEVELOPER: 'developer'
};

// 角色显示名称
const ROLE_LABELS = {
    [USER_ROLES.CLIENT]: '客户',
    [USER_ROLES.DEVELOPER]: '开发者'
};

// ============================================
// 认证状态
// ============================================
const AUTH_STATUS = {
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated',
    LOADING: 'loading',
    ERROR: 'error'
};

// ============================================
// 实名认证状态
// ============================================
const REAL_NAME_STATUS = {
    NOT_STARTED: 'not_started',    // 未开始
    PENDING: 'pending',            // 待审核
    VERIFIED: 'verified',          // 已认证
    REJECTED: 'rejected'           // 已驳回
};

// ============================================
// API 端点配置
// ============================================
const API_ENDPOINTS = {
    // 认证
    SEND_CODE: '/api/auth/send-code',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    LOGOUT: '/api/auth/logout',

    // 实名认证（暂不实现）
    // SUBMIT_REAL_NAME: '/api/auth/real-name',
    // GET_REAL_NAME_STATUS: '/api/auth/real-name/status',

    // 用户
    GET_PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/password',
    DELETE_ACCOUNT: '/api/users/account',

    // 任务
    GET_MY_TASKS: '/api/tasks/my',

    // 消息
    GET_MESSAGES: '/api/messages',
    MARK_MESSAGE_READ: '/api/messages/{id}/read',
    MARK_ALL_READ: '/api/messages/read-all',
    DELETE_MESSAGE: '/api/messages/{id}'
};

// ============================================
// Token 配置
// ============================================
const TOKEN_CONFIG = {
    ACCESS_TOKEN_EXPIRY: 3600,      // 1小时（秒）
    REFRESH_TOKEN_EXPIRY: 604800,   // 7天（秒）
    REFRESH_THRESHOLD: 300,         // 提前5分钟刷新
    REFRESH_RETRY_LIMIT: 3          // 刷新重试次数
};

// ============================================
// 验证码配置
// ============================================
const CODE_CONFIG = {
    EXPIRY: 300,                    // 5分钟（秒）
    SEND_INTERVAL: 60,              // 发送间隔（秒）
    MAX_ATTEMPTS: 3,                // 最大尝试次数
    MOCK_CODE: '123456'             // Mock 测试验证码
};

// ============================================
// 开发者技能标签
// ============================================
const DEVELOPER_SKILLS = [
    'React', 'Vue', 'Angular', 'Node.js', 'Python',
    'Java', 'Go', 'TypeScript', 'UI/UX设计', '产品设计',
    '项目管理', '测试', '运维', '数据库', '小程序'
];

// ============================================
// 工作经验选项
// ============================================
const EXPERIENCE_OPTIONS = [
    { value: '0-1年', label: '1年以下' },
    { value: '1-3年', label: '1-3年' },
    { value: '3-5年', label: '3-5年' },
    { value: '5-10年', label: '5-10年' },
    { value: '10年以上', label: '10年以上' }
];

// ============================================
// 错误码表
// ============================================
const ERROR_CODES = {
    // 认证相关
    INVALID_PHONE: 'INVALID_PHONE',
    PHONE_EXISTS: 'PHONE_EXISTS',
    PHONE_NOT_FOUND: 'PHONE_NOT_FOUND',
    INVALID_CODE: 'INVALID_CODE',
    CODE_EXPIRED: 'CODE_EXPIRED',
    SEND_LIMIT_EXCEEDED: 'SEND_LIMIT_EXCEEDED',
    INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
    SESSION_EXPIRED: 'SESSION_EXPIRED',

    // 实名认证相关（暂不实现）
    // REAL_NAME_VERIFIED: 'REAL_NAME_VERIFIED',
    // REAL_NAME_PENDING: 'REAL_NAME_PENDING',
    // ID_CARD_INVALID: 'ID_CARD_INVALID',
    // ID_CARD_VERIFIED_FAILED: 'ID_CARD_VERIFIED_FAILED',
    // FACE_VERIFY_FAILED: 'FACE_VERIFY_FAILED',
    // REAL_NAME_REJECTED: 'REAL_NAME_REJECTED',

    // 用户相关
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_OLD_PASSWORD: 'INVALID_OLD_PASSWORD',
    PASSWORD_WEAK: 'PASSWORD_WEAK',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    REAL_NAME_REQUIRED: 'REAL_NAME_REQUIRED',

    // 权限相关
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    ROLE_LOCKED: 'ROLE_LOCKED',
    REQUIRE_REAL_NAME: 'REQUIRE_REAL_NAME',

    // 网络相关
    NETWORK_ERROR: 'NETWORK_ERROR'
};

// ============================================
// 错误消息映射
// ============================================
const ERROR_MESSAGES = {
    [ERROR_CODES.INVALID_PHONE]: '请输入有效的手机号',
    [ERROR_CODES.PHONE_EXISTS]: '该手机号已注册',
    [ERROR_CODES.PHONE_NOT_FOUND]: '该手机号未注册',
    [ERROR_CODES.INVALID_CODE]: '验证码错误或已过期',
    [ERROR_CODES.CODE_EXPIRED]: '验证码已过期',
    [ERROR_CODES.SEND_LIMIT_EXCEEDED]: '发送过于频繁，请60秒后再试',
    [ERROR_CODES.INVALID_REFRESH_TOKEN]: '登录已过期，请重新登录',
    [ERROR_CODES.SESSION_EXPIRED]: '会话已过期，请重新登录',
    [ERROR_CODES.USER_NOT_FOUND]: '用户不存在',
    [ERROR_CODES.INVALID_OLD_PASSWORD]: '当前密码错误',
    [ERROR_CODES.PASSWORD_WEAK]: '密码需包含大小写字母、数字，至少8位',
    [ERROR_CODES.ACCOUNT_LOCKED]: '账户已被锁定，请联系客服',
    [ERROR_CODES.REAL_NAME_REQUIRED]: '请先完成实名认证',
    [ERROR_CODES.PERMISSION_DENIED]: '您没有权限执行此操作',
    [ERROR_CODES.ROLE_LOCKED]: '注册后角色不可更改',
    [ERROR_CODES.REQUIRE_REAL_NAME]: '请先完成实名认证后再操作',
    [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查网络设置'
};

// ============================================
// 获取错误消息
// ============================================
function getErrorMessage(errorCode) {
    return ERROR_MESSAGES[errorCode] || '操作失败，请稍后重试';
}

// ============================================
// 导出
// ============================================
export {
    USER_ROLES,
    ROLE_LABELS,
    AUTH_STATUS,
    REAL_NAME_STATUS,
    API_ENDPOINTS,
    TOKEN_CONFIG,
    CODE_CONFIG,
    DEVELOPER_SKILLS,
    EXPERIENCE_OPTIONS,
    ERROR_CODES,
    ERROR_MESSAGES,
    getErrorMessage
};

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        USER_ROLES,
        ROLE_LABELS,
        AUTH_STATUS,
        REAL_NAME_STATUS,
        API_ENDPOINTS,
        TOKEN_CONFIG,
        CODE_CONFIG,
        DEVELOPER_SKILLS,
        EXPERIENCE_OPTIONS,
        ERROR_CODES,
        ERROR_MESSAGES,
        getErrorMessage
    };
}
