# 登录状态延续功能 - 技术设计文档

## 问题背景

### 原始问题

用户在 `login.html` 登录后，跳转到 `task-hall.html` 等其他页面时，登录状态丢失，需要重新登录。

### 根本原因

登录页面和认证系统使用了不同的存储键：

| 系统 | 存储键 | 位置 |
|------|--------|------|
| **login.html** | `techcraft_user`<br>`techcraft_token`<br>`techcraft_authenticated` | 内联脚本 |
| **auth-storage.js** | `techcraft_access_token`<br>`techcraft_user_data`<br>`techcraft_token_expiry`<br>`techcraft_refresh_token` | ES6 模块 |

这导致：
1. 登录页面写入的数据，其他页面无法读取
2. 认证系统无法识别登录状态
3. 每次跳转都需要重新登录

## 解决方案

### 1. 统一存储键

采用 `auth-storage.js` 的存储键作为标准：

```javascript
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'techcraft_access_token',
    REFRESH_TOKEN: 'techcraft_refresh_token',
    USER_DATA: 'techcraft_user_data',
    TOKEN_EXPIRY: 'techcraft_token_expiry',
    AUTH_EVENT: 'techcraft_auth_event'
};
```

### 2. 兼容层实现

在 `auth-storage.js` 中实现向后兼容：

#### 令牌读取兼容

```javascript
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
```

#### 用户数据兼容

```javascript
static getUserData() {
    // 从当前存储获取
    let data = this.getCurrentStorage().getItem(STORAGE_KEYS.USER_DATA);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse user data:', e);
            return null;
        }
    }

    // 兼容旧的存储键
    const storage = this.getCurrentStorage();
    const oldData = storage.getItem('techcraft_user');
    if (oldData) {
        try {
            const userData = JSON.parse(oldData);
            // 将旧数据迁移到新格式
            this.saveUserData(userData, storage === localStorage);
            return userData;
        } catch (e) {
            console.error('Failed to parse old user data:', e);
            return null;
        }
    }

    return null;
}
```

#### 认证状态兼容

```javascript
static isAuthenticated() {
    const token = this.getAccessToken();
    const expiry = this.getCurrentStorage().getItem(STORAGE_KEYS.TOKEN_EXPIRY);

    if (!token) {
        return false;
    }

    // 如果有 expiry，检查是否过期
    if (expiry) {
        return Date.now() < parseInt(expiry);
    }

    // 兼容旧的认证检查
    const storage = this.getCurrentStorage();
    const oldAuthenticated = storage.getItem('techcraft_authenticated');
    if (oldAuthenticated === 'true') {
        return true;
    }

    return false;
}
```

### 3. 登录页面更新

更新 `login.html` 的存储逻辑：

```javascript
// 保存登录状态 - 使用与认证系统一致的存储键
const storage = rememberMe ? localStorage : sessionStorage;

// 兼容旧的存储键（向后兼容）
storage.setItem('techcraft_user', JSON.stringify(user));
storage.setItem('techcraft_token', generateToken(user.id));
storage.setItem('techcraft_authenticated', 'true');

// 使用新的存储键（与 auth-storage.js 一致）
const accessToken = generateToken(user.id);
const refreshToken = generateToken(user.id + '_refresh');
const tokenExpiry = Date.now() + 3600000; // 1小时后过期

storage.setItem('techcraft_access_token', accessToken);
storage.setItem('techcraft_refresh_token', refreshToken);
storage.setItem('techcraft_user_data', JSON.stringify(user));
storage.setItem('techcraft_token_expiry', tokenExpiry.toString());
```

## 技术架构

### 1. 认证系统组件

```
┌─────────────────────────────────────────────────────────────┐
│                      认证系统架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ login.html   │─────▶│ auth-storage │                    │
│  │  (登录页面)   │      │   (存储层)    │                    │
│  └──────────────┘      └──────┬───────┘                    │
│                                │                             │
│                                │                             │
│                         ┌──────▼───────┐                    │
│                         │ auth-state   │                    │
│                         │ (状态管理)    │                    │
│                         └──────┬───────┘                    │
│                                │                             │
│                                │                             │
│  ┌──────────────┐      ┌──────▼───────┐                    │
│  │ 其他页面      │◀─────│ task-page-   │                    │
│  │ (task-hall   │      │ auth.js      │                    │
│  │  .html等)    │      │ (页面初始化)  │                    │
│  └──────────────┘      └──────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. 数据流

#### 登录流程

```
用户登录
    │
    ▼
login.html: 收集表单数据
    │
    ▼
login.html: 验证数据
    │
    ▼
login.html: 生成 Token
    │
    ▼
login.html: 写入存储 (新格式 + 旧格式)
    │
    ▼
跳转到目标页面
    │
    ▼
目标页面: 加载 task-page-auth.js
    │
    ▼
task-page-auth.js: 初始化 auth-state
    │
    ▼
auth-state.js: 从存储读取数据 (兼容层)
    │
    ▼
auth-state.js: 恢复登录状态
    │
    ▼
shared-layout.js: 渲染导航栏 (显示用户信息)
```

#### 页面跳转流程

```
页面 A (已登录)
    │
    ▼
用户点击链接跳转到页面 B
    │
    ▼
页面 B: 加载 task-page-auth.js
    │
    ▼
task-page-auth.js: 初始化 auth-state
    │
    ▼
auth-state.js: init() - 从存储恢复状态
    │
    ▼
AuthStorage: isAuthenticated() - 检查是否已登录
    │
    ▼
AuthStorage: getUserData() - 获取用户数据
    │
    ▼
auth-state.js: 设置 currentUser 和 isAuthenticated
    │
    ▼
shared-layout.js: 渲染导航栏
```

### 3. 存储策略

#### sessionStorage vs localStorage

| 存储类型 | 生命周期 | 适用场景 |
|---------|---------|---------|
| **sessionStorage** | 浏览器关闭后清除 | 未勾选"记住我" |
| **localStorage** | 持久保存（除非手动清除） | 勾选"记住我" |

#### 存储选择逻辑

```javascript
static getStorage(rememberMe = false) {
    return rememberMe ? localStorage : sessionStorage;
}

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
```

### 4. 跨页面状态同步

#### 事件订阅机制

```javascript
authState.subscribe((event, data) => {
    if (event === 'login' || event === 'logout') {
        // 重新渲染导航栏
        renderNavbar(getCurrentPage());
    }
});
```

#### 跨标签页同步

```javascript
// 广播认证事件
static broadcastAuthEvent(type, data) {
    const event = {
        type,
        data,
        timestamp: Date.now()
    };

    localStorage.setItem(STORAGE_KEYS.AUTH_EVENT, JSON.stringify(event));
    sessionStorage.setItem(STORAGE_KEYS.AUTH_EVENT, JSON.stringify(event));
}

// 监听 storage 事件
window.addEventListener('storage', (e) => {
    if (e.key === 'techcraft_auth_event' && e.newValue) {
        const { type, data } = JSON.parse(e.newValue);
        handleCrossTabEvent(type, data);
    }
});
```

## 迁移策略

### 阶段 1：兼容阶段（当前）

- 新旧存储键同时写入
- 读取时优先新格式，兼容旧格式
- 自动迁移旧数据到新格式

### 阶段 2：过渡阶段

- 停止写入旧格式
- 继续支持读取旧格式
- 提示用户更新登录信息

### 阶段 3：完全迁移

- 移除旧格式支持
- 仅使用新格式
- 清理兼容代码

## 后端迁移建议

### 当前前端实现

```javascript
// 前端存储 Token
storage.setItem('techcraft_access_token', accessToken);
storage.setItem('techcraft_user_data', JSON.stringify(user));
```

### 后端迁移后

```javascript
// 后端 API
POST /api/auth/login
{
  "phone": "12345678901",
  "code": "123456"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 3600
    }
  }
}

// 后端管理会话
// - Token 生成和验证
// - 会话状态维护
// - Token 刷新机制
```

### 安全增强

1. **HttpOnly Cookie**：防止 XSS 攻击
2. **CSRF Token**：防止跨站请求伪造
3. **Token 刷新**：自动刷新过期 token
4. **单点登录**：统一的认证中心

## 测试要点

### 功能测试

- [ ] 登录后跳转，状态保持
- [ ] 刷新页面，状态保持
- [ ] 关闭浏览器重新打开（记住我）
- [ ] 退出登录，状态清除
- [ ] 多标签页状态同步

### 兼容性测试

- [ ] 旧格式数据自动迁移
- [ ] 新旧格式数据共存
- [ ] 不同浏览器兼容性

### 性能测试

- [ ] 存储读取性能
- [ ] 页面初始化速度
- [ ] 跨标签页同步延迟

## 维护说明

### 代码位置

- **登录页面**: `login.html` (行 339-356)
- **存储兼容层**: `assets/js/auth-storage.js`
- **状态管理**: `assets/js/auth-state.js`
- **页面初始化**: `assets/js/task-page-auth.js`
- **共享布局**: `assets/js/shared-layout.js`

### 修改注意事项

1. **存储键变更**：需要同步更新所有相关文件
2. **兼容性**：保持向后兼容，避免破坏现有功能
3. **测试**：每次修改后进行完整测试

---

*文档版本: v1.0*
*创建日期: 2026-04-15*
*作者: AI Assistant*
*维护者: TechCraft 开发团队*
