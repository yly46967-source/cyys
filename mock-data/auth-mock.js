/**
 * [FILE] auth-mock.js
 * [POS] Mock 数据层 - 模拟所有认证相关的 API 响应
 * [IN] API 请求
 * [OUT] Mock 响应数据
 * [DEP] 无
 * [SIDE EFFECT] 拦截 fetch 请求
 * [TEST] 验证各种 API 场景的 Mock 响应
 *
 * Mock Data Layer for Authentication
 * ============================================ */

// ============================================
// Mock 验证码存储
// ============================================
const MOCK_CODES = new Map();
const CODE_EXPIRY = 5 * 60 * 1000; // 5分钟

// ============================================
// 辅助函数：从 localStorage 获取用户数据
// ============================================

/**
 * 根据手机号获取用户数据
 * @param {string} phone - 手机号
 * @returns {Object|null} 用户数据，不存在返回 null
 */
function getUserByPhone(phone) {
    try {
        const stored = localStorage.getItem('techcraft_users');
        if (!stored) return null;

        const users = JSON.parse(stored);
        return users[phone] || null;
    } catch (error) {
        console.error('[Mock] 获取用户数据失败:', error);
        return null;
    }
}

/**
 * 保存用户数据到 localStorage
 * @param {string} phone - 手机号
 * @param {Object} userData - 用户数据
 */
function saveUser(phone, userData) {
    try {
        const stored = localStorage.getItem('techcraft_users');
        const users = stored ? JSON.parse(stored) : {};

        users[phone] = userData;
        localStorage.setItem('techcraft_users', JSON.stringify(users));
    } catch (error) {
        console.error('[Mock] 保存用户数据失败:', error);
    }
}

/**
 * 初始化默认用户数据（仅用于测试）
 */
function initializeDefaultUsers() {
    const stored = localStorage.getItem('techcraft_users');
    if (stored) return; // 已有数据，不初始化

    const defaultUsers = {
        // 测试账号 - 客户
        '12345678901': {
            id: 'usr_12345678901',
            phone: '12345678901',
            name: '测试客户',
            role: 'client',
            realNameStatus: 'not_started',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
            extension: {
                company: {
                    name: '测试客户公司',
                    creditCode: '91110000MA1234567X'
                }
            },
            stats: {
                postedTasks: 5,
                totalBudget: 45000,
                inProgressTasks: 2
            },
            createdAt: '2024-01-15T08:00:00Z'
        },
        // 测试账号 - 开发者
        '10987654321': {
            id: 'usr_10987654321',
            phone: '10987654321',
            name: '测试开发者',
            role: 'developer',
            realNameStatus: 'not_started',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
            extension: {
                skills: ['React', 'Node.js', 'Vue', 'Python'],
                experience: '3-5年',
                portfolioUrl: 'https://portfolio.example.com',
                bio: '全栈开发工程师，擅长前后端开发'
            },
            stats: {
                completedTasks: 15,
                totalEarnings: 45000,
                rating: 4.8
            },
            createdAt: '2024-02-20T10:00:00Z'
        },
        // 保留原有的示例用户
        '13800138000': {
            id: 'usr_13800138000',
            phone: '13800138000',
            name: '张三',
            role: 'client',
            realNameStatus: 'not_started',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
            extension: {
                company: {
                    name: '某某科技有限公司',
                    creditCode: '91110000MA1234567X'
                }
            },
            stats: {
                postedTasks: 5,
                totalBudget: 45000,
                inProgressTasks: 2
            },
            createdAt: '2024-01-15T08:00:00Z'
        },
        '13900139000': {
            id: 'usr_13900139000',
            phone: '13900139000',
            name: '李四',
            role: 'developer',
            realNameStatus: 'not_started',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
            extension: {
                skills: ['React', 'Node.js'],
                experience: '3-5年',
                portfolioUrl: 'https://portfolio.example.com',
                bio: '全栈开发工程师'
            },
            stats: {
                completedTasks: 15,
                totalEarnings: 45000,
                rating: 4.8
            },
            createdAt: '2024-02-20T10:00:00Z'
        }
    };

    localStorage.setItem('techcraft_users', JSON.stringify(defaultUsers));
    console.log('[Mock] 默认用户数据已初始化');
    console.log('[Mock] 测试账号: 12345678901 (客户), 10987654321 (开发者), 验证码: 123456');
}

// ============================================
// 动态路径匹配函数
// ============================================

/**
 * 匹配路由模式与实际路径
 * @param {string} mockKey - Mock API handler 的 key（格式：METHOD /path 或 METHOD /path/{param}）
 * @param {string} requestPath - 实际请求路径
 * @param {string} requestMethod - 实际请求方法
 * @returns {boolean} 是否匹配
 */
function matchRoute(mockKey, requestPath, requestMethod) {
    const [method, pattern] = mockKey.split(' ');

    // 将 pattern 转换为正则
    // /api/messages/{id} -> /^\/api\/messages\/[^/]+$/
    const regexPattern = pattern.replace(/\{[^}]+\}/g, '[^/]+');
    const regex = new RegExp('^' + regexPattern + '$');

    return regex.test(requestPath) && method === requestMethod;
}

/**
 * 从路径中提取参数
 * @param {string} pattern - 路径模式（如 /api/messages/{id}）
 * @param {string} pathname - 实际路径（如 /api/messages/msg-001）
 * @returns {Object} 提取的参数对象（如 { id: 'msg-001' }）
 */
function extractPathParams(pattern, pathname) {
    // 从 /api/messages/{id} 和 /api/messages/msg-001
    // 提取出 { id: 'msg-001' }
    const patternParts = pattern.split('/').filter(p => p);
    const pathParts = pathname.split('/').filter(p => p);
    const params = {};

    patternParts.forEach((part, i) => {
        if (part.startsWith('{') && part.endsWith('}')) {
            const paramName = part.slice(1, -1);
            params[paramName] = pathParts[i];
        }
    });

    return params;
}

// ============================================
// Mock Token 生成
// ============================================
function generateAccessToken(userId) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        userId,
        exp: Date.now() + 3600000 // 1小时后过期
    }));
    const signature = btoa('mock_signature');
    return `${header}.${payload}.${signature}`;
}

function generateRefreshToken(userId) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        userId,
        exp: Date.now() + 7 * 24 * 3600000 // 7天后过期
    }));
    const signature = btoa('mock_signature');
    return `${header}.${payload}.${signature}`;
}

// ============================================
// Mock API 处理函数
// ============================================
const mockApiHandlers = {
    // 发送验证码
    'POST /api/auth/send-code': (data) => {
        const { phone, type } = data;

        // 初始化默认用户（仅第一次）
        initializeDefaultUsers();

        // 简化手机号验证：只检查是否为空和长度
        if (!phone || phone.length < 5) {
            return {
                success: false,
                error: {
                    code: 'INVALID_PHONE',
                    message: '请输入有效的手机号'
                }
            };
        }

        // 检查手机号是否已注册（注册场景）
        if (type === 'register' && getUserByPhone(phone)) {
            return {
                success: false,
                error: {
                    code: 'PHONE_EXISTS',
                    message: '该手机号已注册'
                }
            };
        }

        // 检查手机号是否存在（登录场景）
        if (type === 'login' && !getUserByPhone(phone)) {
            return {
                success: false,
                error: {
                    code: 'PHONE_NOT_FOUND',
                    message: '该手机号未注册'
                }
            };
        }

        // 生成验证码
        const code = '123456'; // 固定测试验证码
        const expiry = Date.now() + CODE_EXPIRY;
        MOCK_CODES.set(`${phone}_${type}`, { code, expiry });

        console.log(`[Mock] 验证码已发送: ${phone} -> ${code}`);

        return {
            success: true,
            data: {
                expiresIn: 300,
                message: '验证码已发送'
            }
        };
    },

    // 验证码登录
    'POST /api/auth/login': (data) => {
        const { phone, code, rememberMe } = data;

        // 初始化默认用户（确保测试账号存在）
        initializeDefaultUsers();

        // 调试日志
        console.log(`[Mock] 登录请求: phone=${phone}, code=${code}`);
        console.log(`[Mock] 当前存储的验证码:`, Array.from(MOCK_CODES.keys()));

        // 简化验证：测试验证码 123456 直接通过
        if (code !== '123456') {
            // 非测试验证码，检查存储的验证码
            const storedCode = MOCK_CODES.get(`${phone}_login`);
            if (!storedCode || storedCode.code !== code) {
                console.log(`[Mock] 验证码验证失败: expected=${storedCode?.code}, got=${code}`);
                return {
                    success: false,
                    error: {
                        code: 'INVALID_CODE',
                        message: '验证码错误或已过期'
                    }
                };
            }

            // 检查验证码是否过期
            if (Date.now() > storedCode.expiry) {
                MOCK_CODES.delete(`${phone}_login`);
                return {
                    success: false,
                    error: {
                        code: 'CODE_EXPIRED',
                        message: '验证码已过期'
                    }
                };
            }

            // 清除验证码
            MOCK_CODES.delete(`${phone}_login`);
        } else {
            console.log(`[Mock] 使用测试验证码: ${code}`);
        }

        // 获取用户信息
        const user = getUserByPhone(phone);
        if (!user) {
            console.log(`[Mock] 用户不存在: ${phone}`);
            return {
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: '该手机号未注册'
                }
            };
        }

        // 生成 Token
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        console.log(`[Mock] 用户登录成功: ${user.name} (${user.role}, ${phone})`);

        return {
            success: true,
            data: {
                user,
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: 3600
                }
            }
        };
    },

    // 用户注册
    'POST /api/auth/register': (data) => {
        const { phone, code, password, role, name } = data;

        // 验证验证码
        const storedCode = MOCK_CODES.get(`${phone}_register`);
        if (!storedCode || storedCode.code !== code) {
            return {
                success: false,
                error: {
                    code: 'INVALID_CODE',
                    message: '验证码错误或已过期'
                }
            };
        }

        // 检查验证码是否过期
        if (Date.now() > storedCode.expiry) {
            MOCK_CODES.delete(`${phone}_register`);
            return {
                success: false,
                error: {
                    code: 'CODE_EXPIRED',
                    message: '验证码已过期'
                }
            };
        }

        // 检查手机号是否已注册
        if (getUserByPhone(phone)) {
            return {
                success: false,
                error: {
                    code: 'PHONE_EXISTS',
                    message: '该手机号已注册'
                }
            };
        }

        // 创建新用户
        const newUser = {
            id: `usr_${phone}`,
            phone,
            name,
            role,
            realNameStatus: 'not_started',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
            createdAt: new Date().toISOString()
        };

        if (role === 'client') {
            newUser.extension = {
                company: {
                    name: '',
                    creditCode: ''
                }
            };
            newUser.stats = {
                postedTasks: 0,
                totalBudget: 0,
                inProgressTasks: 0
            };
        } else {
            newUser.extension = {
                skills: [],
                experience: null,
                portfolioUrl: null,
                bio: ''
            };
            newUser.stats = {
                completedTasks: 0,
                totalEarnings: 0,
                rating: 0
            };
        }

        // 保存用户到 localStorage
        saveUser(phone, newUser);

        // 清除验证码
        MOCK_CODES.delete(`${phone}_register`);

        console.log(`[Mock] 用户注册: ${name} (${role})`);

        return {
            success: true,
            data: {
                user: newUser,
                message: '注册成功'
            }
        };
    },

    // 刷新 Token
    'POST /api/auth/refresh-token': (data) => {
        const { refreshToken } = data;

        if (!refreshToken) {
            return {
                success: false,
                error: {
                    code: 'INVALID_REFRESH_TOKEN',
                    message: '刷新令牌无效'
                }
            };
        }

        // 简单验证：检查 Token 格式
        if (typeof refreshToken !== 'string' || !refreshToken.includes('.')) {
            return {
                success: false,
                error: {
                    code: 'INVALID_REFRESH_TOKEN',
                    message: '刷新令牌无效'
                }
            };
        }

        // 解析 Token 获取 userId
        try {
            const payload = refreshToken.split('.')[1];
            const { userId, exp } = JSON.parse(atob(payload));

            // 检查是否过期
            if (Date.now() > exp) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_REFRESH_TOKEN',
                        message: '刷新令牌已过期'
                    }
                };
            }

            // 生成新的访问令牌
            const accessToken = generateAccessToken(userId);

            console.log(`[Mock] Token 刷新: ${userId}`);

            return {
                success: true,
                data: {
                    accessToken,
                    expiresIn: 3600
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'INVALID_REFRESH_TOKEN',
                    message: '刷新令牌无效'
                }
            };
        }
    },

    // 退出登录
    'POST /api/auth/logout': () => {
        console.log('[Mock] 用户退出登录');
        return {
            success: true,
            data: {
                message: '退出成功'
            }
        };
    },

    // 获取用户资料
    'GET /api/users/profile': () => {
        // 从 localStorage 获取当前登录用户
        // 实际应从 Token 解析用户 ID，这里简化为返回第一个用户
        try {
            const stored = localStorage.getItem('techcraft_users');
            if (!stored) {
                // 初始化默认用户
                initializeDefaultUsers();
                const defaultUsers = JSON.parse(localStorage.getItem('techcraft_users') || '{}');
                const firstUser = Object.values(defaultUsers)[0];
                return {
                    success: true,
                    data: {
                        user: firstUser
                    }
                };
            }

            const users = JSON.parse(stored);
            const firstUser = Object.values(users)[0];

            return {
                success: true,
                data: {
                    user: firstUser
                }
            };
        } catch (error) {
            console.error('[Mock] 获取用户资料失败:', error);
            return {
                success: false,
                error: {
                    code: 'GET_PROFILE_FAILED',
                    message: '获取用户资料失败'
                }
            };
        }
    },

    // 更新用户资料
    'PUT /api/users/profile': (data) => {
        console.log('[Mock] 更新用户资料:', data);
        const mockUser = MOCK_USERS['13800138000'];
        const updatedUser = { ...mockUser, ...data };
        return {
            success: true,
            data: {
                user: updatedUser
            }
        };
    },

    // 修改密码
    'PUT /api/users/password': (data) => {
        const { oldPassword, newPassword } = data;

        // Mock 验证：旧密码不能与新密码相同
        if (oldPassword === newPassword) {
            return {
                success: false,
                error: {
                    code: 'INVALID_OLD_PASSWORD',
                    message: '新密码不能与旧密码相同'
                }
            };
        }

        console.log('[Mock] 密码修改成功');
        return {
            success: true,
            data: {
                message: '密码修改成功'
            }
        };
    },

    // 获取我的任务
    'GET /api/tasks/my': (params) => {
        console.log('[Mock] 获取我的任务:', params);
        return {
            success: true,
            data: {
                tasks: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0
                }
            }
        };
    },

    // 获取消息列表
    'GET /api/messages': (params) => {
        console.log('[Mock] 获取消息列表:', params);
        return {
            success: true,
            data: {
                messages: [],
                unreadCount: 0,
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 0
                }
            }
        };
    }
};

// ============================================
// Mock Fetch 拦截器
// ============================================
function setupMockFetch() {
    // 保存原始 fetch
    const originalFetch = window.fetch;

    // 重写 fetch
    window.fetch = async function(url, options = {}) {
        const method = options.method || 'GET';

        // 解析 URL 获取 pathname
        let pathname;
        try {
            // 支持完整 URL 和相对路径
            pathname = new URL(url, window.location.origin).pathname;
        } catch (e) {
            // 如果 URL 解析失败，直接使用传入的 url
            pathname = url;
        }

        console.log(`[Mock Fetch] ${method} ${pathname}`);

        // 解析查询参数
        const [_, search] = url.split('?');
        const queryParams = new URLSearchParams(search || '');
        const queryParamsObj = Object.fromEntries(queryParams);

        // 获取请求体
        let body = null;
        if (options.body) {
            try {
                body = JSON.parse(options.body);
            } catch (e) {
                body = options.body;
            }
        }

        // 查找匹配的 Mock 处理函数（使用动态路径匹配）
        const matchedEntry = Object.entries(mockApiHandlers).find(([key]) =>
            matchRoute(key, pathname, method)
        );

        if (matchedEntry) {
            const [mockKey, handler] = matchedEntry;

            // 提取路径参数
            const pathParams = extractPathParams(mockKey.split(' ')[1], pathname);

            // 合并参数：路径参数 + 查询参数 + 请求体
            const allParams = { ...pathParams, ...queryParamsObj, ...body };

            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 300));

            // 调用 Mock 处理函数
            const response = handler(allParams);

            // 返回模拟的 Response 对象
            return {
                ok: response.success !== false,
                json: async () => response,
                status: response.success === false ? 400 : 200
            };
        }

        // 如果没有 Mock 处理函数，使用原始 fetch
        console.warn(`[Mock Fetch] No handler for ${method} ${pathname}, using original fetch`);
        return originalFetch(url, options);
    };

    console.log('[Mock] Mock fetch 拦截器已启用（支持动态路径参数）');
}

// ============================================
// 初始化 Mock（立即执行，不等待 DOMContentLoaded）
// ============================================
if (typeof window !== 'undefined') {
    // 立即设置 Mock 拦截器，确保在任何 fetch 调用前生效
    setupMockFetch();
    console.log('[Mock] Mock fetch 拦截器已启用（立即执行）');
}

// ============================================
// 导出（仅用于 CommonJS 环境）
// ============================================
// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { setupMockFetch, MOCK_USERS, MOCK_CODES };
}
