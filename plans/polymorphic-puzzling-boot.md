# TechCraft 认证功能完善方案 - 修订版 v2.0

## 文档修订说明

**修订日期**: 2026-04-13
**修订原因**: 根据技术评审意见进行全面修订
**主要变更**:
- 暂停密码相关功能（需先明确密码在产品中的定位）
- 修正"修改密码接口已可用"的错误前提
- 收紧消息详情页范围（移除回复功能，仅保留通知详情）
- 重新定义账户安全页为最小可实现版本
- 补充所有遗漏的边界条件和测试用例
- 修正 Mock API 路由分发问题
- 统一用户资料数据契约

---

## 0. 前置基础工作（必须先完成）

在实施任何新功能前，必须先完成以下基础工作：

### 0.1 明确密码在产品中的定位 ⚠️ **阻塞问题**

**问题**: 当前主登录链路是短信验证码登录，密码在产品中的真实职责不明确。

**需要回答的问题**:
1. 密码是否作为登录因子？如果是，何时启用密码登录入口？
2. 密码是否只是备用安全凭证？如何引导用户设置？
3. 已注册用户如何补齐密码？是否需要迁移策略？
4. 密码与短信验证码的优先级关系是什么？

**建议方案**:
- **方案A**: 密码仅作为备用凭证，不启用密码登录
  - 用户忘记密码时，通过"重置密码"重新设置
  - 登录仍然只用短信验证码
  - 优点：简化认证流程
  - 缺点：用户无法离线登录

- **方案B**: 密码作为辅助登录因子
  - 用户可选择"密码登录"或"验证码登录"
  - 注册时必须设置密码
  - 优点：用户选择更多
  - 缺点：需要实现密码登录入口

**本方案基于方案A（密码仅作为备用凭证）**

### 0.2 修复 Mock API 路由分发机制

**问题**: 现有 Mock fetch 只按 pathname 分发，不区分 HTTP Method，导致同路径不同方法的接口冲突。

**修复方案**:

```javascript
// 修改前 (assets/data/auth-mock.js:456)
const handler = mockApiHandlers[pathname];

// 修改后
const key = `${options.method || 'GET'} ${pathname}`;
const handler = mockApiHandlers[key];
```

**需要修改的文件**:
- `assets/data/auth-mock.js` - 修改所有接口 key 为 `{METHOD} /path` 格式
- 影响范围：所有 Mock API 调用

### 0.3 统一用户资料数据契约

**问题**: 用户资料存在两套契约：
- `auth-service.updateProfile()` → `auth-mock` (顶层 company/profile)
- `userService.updateUserProfile()` → `extension` 模型

**统一方案**:

以 **user-service + extension** 模型为唯一数据契约：

```javascript
// 统一的用户资料模型
{
    id: string,
    phone: string,
    name: string,
    role: 'client' | 'developer',
    realNameStatus: string,
    extension: {
        avatar: string,
        bio: string,
        location: string,
        website: string,
        company: {
            name: string,
            creditCode: string
        },
        title: string,
        skills: string[]
    },
    stats: {
        // 统计数据
    }
}
```

**需要修改的文件**:
- `assets/js/auth-service.js` - 移除 updateProfile 方法，统一使用 userService
- `assets/data/auth-mock.js` - 统一使用 extension 模型
- 所有调用 updateProfile 的地方改为调用 userService.updateUserProfile()

### 0.4 解耦 ProfileEditor 组件

**问题**: ProfileEditor 硬依赖模态框 DOM，无法直接复用到独立页面。

**解耦方案**:

```javascript
// 抽取核心编辑逻辑为 EditableProfile 类
class EditableProfile {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.mode = options.mode || 'modal'; // modal | page
        this.init();
    }

    init() {
        this.renderForm();
        this.bindEvents();
    }

    renderForm() {
        // 根据模式渲染不同布局
        if (this.mode === 'modal') {
            this.renderModalLayout();
        } else {
            this.renderPageLayout();
        }
    }

    open() {
        if (this.mode === 'modal') {
            this.showModal();
        }
        // page 模式不需要 open
    }

    close() {
        if (this.mode === 'modal') {
            this.hideModal();
        } else {
            // page 模式处理离开确认
            this.handlePageExit();
        }
    }
}
```

**需要修改的文件**:
- `assets/js/profile-editor.js` - 重构为 EditableProfile 类
- `profile-client.html` / `profile-developer.html` - 使用 new EditableProfile(container, { mode: 'modal' })
- `profile-edit.html` (新增) - 使用 new EditableProfile(container, { mode: 'page' })

---

## 1. 需求理解（修订版）

### 1.1 暂停的功能（需先完成前置工作）

#### 1.1.1 忘记密码/重置密码功能 - **暂停** ⏸️

**原因**: 需要先完成0.1（明确密码定位）和0.5（定义账号存在性暴露策略）

**前置条件**:
- [ ] 明确密码在产品中的定位（0.1）
- [ ] 定义账号存在性暴露策略（0.5）
- [ ] 实现真正的密码持久化（auth-mock.js 目前未持久化密码）
- [ ] 定义密码修改后的会话处置策略（0.6）

**暂不实施，等待前置条件完成**

#### 1.1.2 修改密码功能 - **暂停** ⏸️

**原因**: 现有接口仅为占位，需要先完成0.1、0.6

**前置条件**:
- [ ] 明确密码在产品中的定位（0.1）
- [ ] 修正 Mock API 使其真正验证旧密码并持久化新密码
- [ ] 定义密码修改后的会话处置策略（0.6）

**暂不实施，等待前置条件完成**

---

### 1.2 优先实现功能（P0 - 最小可实现版本）

#### 1.2.1 用户资料编辑页（独立页面）- **P0**

**需求背景**:
- 当前以模态框形式存在，功能受限
- 独立页面可提供更完整的编辑体验
- 支持更丰富的表单交互和预览

**目标用户**: 需要完善个人资料的用户

**使用场景**:
1. 从用户中心"编辑资料"入口进入
2. 展示完整的编辑表单（头像、基本信息、角色专属字段）
3. 实时预览头像上传
4. 技能标签交互（开发者）
5. 保存后返回用户中心

**功能范围（收紧）**:
- ✅ 基本信息编辑（姓名、简介、地区、个人网站）
- ✅ 头像上传和预览
- ✅ 技能标签管理（开发者）
- ✅ 公司信息编辑（客户）
- ✅ 表单验证和错误提示
- ✅ 未保存修改警告（浏览器级离开拦截）
- ❌ 不包含密码修改（暂停）
- ❌ 不包含手机号更换（延后）

**功能优先级**: P0（核心功能）

**与现有功能关联**:
- 基于 `user-service.updateUserProfile()` API
- 复用 `profile-editor.js` 核心逻辑（需先解耦）
- 使用 `form-validator.js` 表单验证

---

#### 1.2.2 消息详情页（只读版本）- **P0**

**需求背景**:
- 消息列表只显示摘要，需要查看完整内容
- 支持富文本消息内容
- 提供快捷操作（标记已读、删除、跳转关联任务）

**目标用户**: 接收系统通知和任务消息的用户

**使用场景**:
1. 从消息列表点击消息进入详情
2. 查看完整消息内容
3. 执行快捷操作（标记已读、删除、跳转任务）
4. 返回列表或上一条/下一条

**功能范围（收紧）**:
- ✅ 消息完整内容展示
- ✅ 消息元数据（时间、类型、图标）
- ✅ 快捷操作（标记已读、删除、跳转关联任务）
- ✅ 上一条/下一条导航
- ✅ 自动标记已读并同步未读计数
- ❌ 不包含回复功能（当前无会话模型）
- ❌ 不包含私信功能（产品明确"暂不实现 private 私信"）

**功能优先级**: P0（核心功能）

**与现有功能关联**:
- 复用 `message-service.js` API（markMessageRead、deleteMessage）
- 复用 `message-center.js` 消息模型
- 新增 `getMessageById()` API（支持深链）

---

### 1.3 延后实现功能（P1 - 后续版本）

#### 1.3.1 账户安全设置页（最小版本）- **P1**

**需求背景**:
- 集中管理账户安全相关功能
- 提供安全状态可视化
- 统一的安全操作入口

**目标用户**: 关注账户安全的用户

**使用场景**:
1. 从用户中心"账户安全"入口进入
2. 查看当前安全状态概览
3. 快捷操作入口（修改密码等）

**功能范围（最小化）**:
- ✅ 安全状态概览（只读展示）
  - 密码状态（已设置/未设置）
  - 手机号绑定状态（已绑定/未绑定）
  - 实名认证状态
- ✅ 快捷操作入口（卡片形式）
  - 修改密码（功能暂停中，按钮置灰）
  - 实名认证（跳转到认证页面，未实现）
- ✅ 安全提示（静态内容）
- ❌ 不包含登录设备管理（底层无支持）
- ❌ 不包含安全日志（底层无支持）
- ❌ 不包含更换手机号（延后）
- ❌ 不包含退出所有设备（延后）

**功能优先级**: P1（重要功能，延后实施）

**与现有功能关联**:
- 读取 `auth-state` 用户数据
- 新增安全状态 Mock API（简化版）
- 不依赖复杂的安全域模型

---

## 2. 技术方案（修订版）

### 2.1 整体架构设计

**架构原则**:
- 遵循现有分层架构：视图层 → 业务逻辑层 → 服务层 → 数据层
- 先完成基础工作（0.1-0.4），再实施新功能
- 收紧功能范围，确保可实施性
- 明确数据契约和服务边界

**架构融入方式**:

```
基础工作（必须先完成）:
┌─────────────────────────────────────────┐
│  0.1 明确密码定位                        │
│  0.2 修复 Mock API 路由分发             │
│  0.3 统一用户资料数据契约                │
│  0.4 解耦 ProfileEditor 组件             │
└─────────────────────────────────────────┘
                    ↓
现有架构:
┌─────────────────────────────────────────┐
│           视图层 (HTML)                  │
│  profile-client.html, profile-developer │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       业务逻辑层 (JS)                     │
│  profile-*-main.js, profile-editor.js   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        服务层 (Service)                   │
│  user-service.js (统一契约)              │
│  message-service.js                     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         数据层 (Data)                     │
│  http-client.js, auth-mock.js           │
└─────────────────────────────────────────┘

新增功能融入:
┌─────────────────────────────────────────┐
│           视图层 (新增)                   │
│  profile-edit.html (P0)                 │
│  message-detail.html (P0)               │
│  security-settings.html (P1, 延后)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       业务逻辑层 (新增)                   │
│  profile-edit-main.js (P0)              │
│  message-detail-main.js (P0)            │
│  security-settings-main.js (P1, 延后)   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        服务层 (扩展)                      │
│  user-service.js (已有接口)             │
│  message-service.js (扩展 getMessageById)│
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         数据层 (扩展)                     │
│  auth-mock.js (修复路由分发)            │
│  auth-mock.js (新增安全状态 API)        │
└─────────────────────────────────────────┘
```

---

### 2.2 详细功能设计

#### 2.2.1 用户资料编辑页（独立页面）

**UI/UX 设计：**

**布局：**
```
┌─────────────────────────────────────────┐
│  ← 返回        编辑资料        保存  取消│
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │  [头像上传区域]                  │   │
│  │  点击上传头像                     │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  基本信息                                │
│  ┌─────────────────────────────────┐   │
│  │ 姓名: [________________]  *     │   │
│  │ 简介: [________________]        │   │
│  │ 地区: [________________]        │   │
│  │ 个人网站: [______________]      │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  角色专属信息                            │
│  ┌─────────────────────────────────┐   │
│  │ [客户]                          │   │
│  │ 公司名称: [____________]  *     │   │
│  │ 统一社会信用代码: [______]  *   │   │
│  │                                 │   │
│  │ [开发者]                        │   │
│  │ 职位: [________________]        │   │
│  │ 技能标签: [+ 添加技能]          │   │
│  │   [React] [Node.js] [×]         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**交互流程：**
```
用户操作流程：
1. 从用户中心点击"编辑资料" → 跳转到 profile-edit.html
   ↓
2. 加载当前用户数据（从 userService）→ 填充表单
   ↓
3. 用户编辑表单 → 实时验证
   ↓
4. 点击"保存" → 显示加载状态 → 调用 userService.updateUserProfile()
   ↓
5a. 成功：
   - 显示成功提示
   - 更新 auth-state 用户数据
   - 2秒后返回用户中心
5b. 失败：
   - 显示错误消息（字段级或全局）
   - 保持在编辑页
   ↓
6. 点击"取消" → 有未保存修改时确认 → 返回用户中心
   ↓
7. 浏览器级离开场景：
   - 后退/刷新/跳转其他页面 → 有未保存修改时拦截并确认
   - 确认后允许离开，取消后保持在编辑页
```

**状态管理：**
- 表单状态：脏检查（hasUnsavedChanges）
- 保存状态：loading
- 错误状态：按字段显示
- 离开拦截：beforeunload + popstate 事件

**浏览器级离开拦截：**
```javascript
// 离开确认策略
const beforeUnloadHandler = (e) => {
    if (this.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未保存的修改，确定要离开吗？';
        return e.returnValue;
    }
};

// 绑定事件
window.addEventListener('beforeunload', beforeUnloadHandler);
window.addEventListener('popstate', this.handlePopState);

// 保存成功后移除监听器
window.removeEventListener('beforeunload', beforeUnloadHandler);
window.removeEventListener('popstate', this.handlePopState);
```

**API 接口设计：**

**已有接口（使用 user-service）：**
```javascript
// user-service.js - 已实现
async updateUserProfile(updates) {
    // updates.extension: { avatar, bio, location, website, company, title, skills }
    return await this._mockUpdateUserProfile(updates);
}
```

**数据模型（统一使用 extension）：**
```javascript
// 统一的用户资料模型
{
    extension: {
        avatar: string,
        bio: string,
        location: string,
        website: string,
        company: {
            name: string,
            creditCode: string
        },
        title: string,
        skills: string[]
    }
}
```

**错误处理：**
- 字段验证错误：显示在对应字段下方
- 网络错误：显示全局提示（使用 notification.js）
- 未保存修改警告：离开页面前二次确认

**组件复用策略：**
```javascript
// 重构后的 profile-editor.js
class EditableProfile {
    constructor(container, options = {}) {
        this.container = container;
        this.mode = options.mode || 'modal'; // modal | page
        this.onSave = options.onSave || (() => {});
        this.onCancel = options.onCancel || (() => {});
        this.init();
    }
}

// 模态框模式（现有页面）
const modalEditor = new EditableProfile(document.getElementById('profileEditorModal'), {
    mode: 'modal',
    onSave: (data) => { /* 更新用户中心 */ }
});

// 独立页面模式（新增页面）
const pageEditor = new EditableProfile(document.querySelector('.profile-edit-container'), {
    mode: 'page',
    onSave: (data) => {
        /* 保存后返回用户中心 */
        window.location.href = 'profile-client.html';
    }
});
```

---

#### 2.2.2 消息详情页（只读版本）

**UI/UX 设计：**

**布局：**
```
┌─────────────────────────────────────────┐
│  ← 返回    消息详情    [上一条] [下一条]│
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ [系统通知图标]  实名认证提醒      │   │
│  │ 2024-04-07 10:00                │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  消息内容                                │
│  ┌─────────────────────────────────┐   │
│  │ 请完成实名认证以解锁更多功能...  │   │
│  │                                 │   │
│  │ 完成实名认证后，您将能够：       │   │
│  │ • 发布任务（客户）               │   │
│  │ • 竞标任务（开发者）             │   │
│  │ • 提升账户信任度                 │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  快捷操作                                │
│  ┌─────────────────────────────────┐   │
│  │ [前往认证]  [标记已读]  [删除]    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**交互流程：**
```
用户操作流程：
1. 从消息列表点击消息 → 跳转到 message-detail.html?id=msg-001
   ↓
2. 加载消息详情（从 message-service.getMessageById()）
   ↓
3. 自动标记已读 → 调用 message-service.markMessageRead()
   → 更新 auth-state 未读计数
   → 跨标签页同步未读数
   ↓
4. 查看消息内容
   ↓
5. 点击快捷操作：
   - 前往认证：跳转到 real-name-auth.html（如已实现）或显示提示
   - 标记已读：已自动标记，按钮置灰
   - 删除：二次确认 → 调用 deleteMessage() → 返回列表
   - 跳转任务：跳转到 task-detail.html?id=xxx
   ↓
6. 上一条/下一条：
   - 加载相邻消息（基于创建时间排序）
   - 如果没有上一条/下一条，按钮置灰
   ↓
7. 点击返回 → 返回消息列表（profile-*-html#messages）
   ↓
8. 异常场景：
   - 消息不存在：显示"消息已删除"提示，返回列表
   - 消息已删除：显示"消息已删除"提示，返回列表
   - 关联任务不存在：隐藏"前往任务"按钮
   - 未登录：重定向到登录页（auth-guard）
```

**API 接口设计：**

**新增 Mock API：**
```javascript
// message-service.js - 新增方法
async getMessageById(messageId) {
    try {
        const response = await httpClient.get(`/api/messages/${messageId}`);
        return response.data.message;
    } catch (error) {
        console.error('Get message by id error:', error);
        throw error;
    }
}

// auth-mock.js - 新增 Mock 处理
'GET /api/messages/{id}': (params) => {
    const { id } = params;

    // 从 mock 数据中查找
    const message = MOCK_MESSAGES.find(m => m.id === id);

    if (!message) {
        return {
            success: false,
            error: {
                code: 'MESSAGE_NOT_FOUND',
                message: '消息不存在'
            }
        };
    }

    // 检查是否已删除
    if (message.deletedAt) {
        return {
            success: false,
            error: {
                code: 'MESSAGE_DELETED',
                message: '消息已删除'
            }
        };
    }

    return {
        success: true,
        data: { message }
    };
}
```

**上一条/下一条逻辑：**
```javascript
// 基于创建时间排序的相邻消息
async getAdjacentMessages(currentMessageId) {
    const messages = await this.getMessages();

    // 按创建时间降序排序
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
```

**数据模型（复用现有）：**
```javascript
// 消息模型（message-service.js 已定义）
{
    id: string,
    type: 'system' | 'task',
    title: string,
    content: string,
    icon: string,
    actionLabel: string,
    actionUrl: string,
    jumpIfTaskDeleted: boolean,
    isRead: boolean,
    createdAt: string,
    deletedAt: string | null
}
```

**错误处理：**
- 消息不存在：显示"消息已删除"空态，3秒后返回列表
- 消息已删除：显示"消息已删除"空态，3秒后返回列表
- 网络错误：显示全局提示
- 未登录：auth-guard 自动重定向到登录页

**深链支持：**
```javascript
// 支持直接访问 message-detail.html?id=msg-001
const urlParams = new URLSearchParams(window.location.search);
const messageId = urlParams.get('id');

if (messageId) {
    loadMessageDetail(messageId);
} else {
    // 没有 id 参数，显示错误或返回列表
    notification.show('无效的消息链接', 'error');
    setTimeout(() => {
        window.location.href = 'profile-client.html#messages';
    }, 2000);
}
```

---

#### 2.2.3 账户安全设置页（最小版本）- **P1 延后**

**UI/UX 设计（最小化）：**

**布局：**
```
┌─────────────────────────────────────────┐
│  ← 返回        账户安全                  │
├─────────────────────────────────────────┤
│  安全状态概览                            │
│  ┌─────────────────────────────────┐   │
│  │ 🔑 密码状态: 未设置              │   │
│  │ 📱 手机号: 138****8000 (已绑定)  │   │
│  │ ✅ 实名认证: 已认证              │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  快捷操作                                │
│  ┌─────────────────────────────────┐   │
│  │ [修改密码] (功能开发中)          │   │
│  │ [实名认证] (已完成)              │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  安全提示                                │
│  ┌─────────────────────────────────┐   │
│  │ • 定期修改密码可提升账户安全     │   │
│  │ • 完成实名认证可解锁更多功能     │   │
│  │ • 不要在公共设备上记住密码       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**功能范围（最小化）：**
- ✅ 安全状态概览（只读展示，从 auth-state 读取）
- ✅ 快捷操作入口（按钮形式，部分功能开发中）
- ✅ 安全提示（静态内容）
- ❌ 不包含登录设备管理（底层无支持）
- ❌ 不包含安全日志（底层无支持）
- ❌ 不包含更换手机号（延后）
- ❌ 不包含退出所有设备（延后）

**API 接口设计（简化版）：**

```javascript
// auth-config.js - 新增端点
GET_SECURITY_STATUS: '/api/users/security/status',

// auth-mock.js - 新增 Mock 处理（简化版）
'GET /api/users/security/status': () => {
    // 从 auth-state 读取当前用户信息
    const user = authState.getCurrentUser();

    return {
        success: true,
        data: {
            passwordStatus: 'not_set', // not_set | set
            phoneBound: !!user.phone,
            phoneLast4: user.phone ? user.phone.slice(-4) : null,
            realNameStatus: user.realNameStatus // not_started | pending | verified | rejected
        }
    };
}
```

**数据模型（简化版）：**
```javascript
// 安全状态（简化版）
{
    passwordStatus: 'not_set' | 'set',
    phoneBound: boolean,
    phoneLast4: string | null,
    realNameStatus: 'not_started' | 'pending' | 'verified' | 'rejected'
}
```

---

## 3. 边界条件定义（新增）

### 3.1 账号存在性暴露策略（针对重置密码）⚠️

**问题**: 忘记密码流程涉及账号枚举风险。

**策略定义**:

**方案A: 泛化提示（推荐）**
- 未注册手机号发起重置时，返回统一提示："如果手机号已注册，验证码将发送至您的手机"
- 验证码校验失败时，返回："验证码错误或已过期"
- 不暴露手机号是否注册

**方案B: 明确提示（用户体验优先，安全性降低）**
- 未注册手机号发起重置时，返回明确错误："该手机号未注册"
- 用户体验更好，但存在账号枚举风险

**本方案采用方案A（泛化提示）**

**Mock API 实现**:
```javascript
// auth-mock.js - sendCode API
'/api/auth/send-code': (data) => {
    const { phone, type } = data;

    // 手机号格式验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        return {
            success: false,
            error: {
                code: 'INVALID_PHONE',
                message: '请输入有效的手机号'
            }
        };
    }

    // 重置密码场景：泛化提示，不暴露账号是否存在
    if (type === 'reset_password') {
        // 无论手机号是否注册，都返回成功
        // 只有已注册的手机号才能真正收到验证码
        const code = '123456';
        if (MOCK_USERS[phone]) {
            // 已注册：生成验证码
            const expiry = Date.now() + CODE_EXPIRY;
            MOCK_CODES.set(`${phone}_reset_password`, { code, expiry });
            console.log(`[Mock] 验证码已发送: ${phone} -> ${code}`);
        } else {
            // 未注册：不生成验证码，但返回成功（泛化提示）
            console.log(`[Mock] 手机号未注册，但返回泛化成功: ${phone}`);
        }

        return {
            success: true,
            data: {
                expiresIn: 300,
                message: '如果手机号已注册，验证码将发送至您的手机'
            }
        };
    }

    // ... 其他场景（login/register）保持原有逻辑
}
```

---

### 3.2 密码修改后的会话处置策略（针对修改密码）⚠️

**问题**: 密码修改后，当前会话和其他标签页如何处置？

**策略定义**:

**方案A: 强制退出所有会话（推荐）**
- 修改密码成功后，当前标签页立即退出登录
- 其他标签页通过 cross-tab 同步事件退出
- 清除所有 token（access token + refresh token）
- 跳转到登录页，提示："密码已修改，请重新登录"

**方案B: 保持当前会话**
- 修改密码成功后，当前标签页保持登录
- 其他标签页不受影响
- 用户体验更好，但安全性降低

**本方案采用方案A（强制退出所有会话）**

**实现**:
```javascript
// profile-edit-main.js 或 security-settings-main.js
async handlePasswordChange(oldPassword, newPassword) {
    try {
        const response = await authService.changePassword(oldPassword, newPassword);

        if (response.success) {
            // 1. 清除本地认证数据
            authState.clearAuth();

            // 2. 通知其他标签页退出（cross-tab 同步）
            localStorage.setItem('techcraft_logout', Date.now().toString());

            // 3. 显示成功提示
            notification.show('密码已修改，请重新登录', 'success');

            // 4. 2秒后跳转到登录页
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    } catch (error) {
        notification.show('密码修改失败', 'error');
    }
}

// auth-state.js - 监听 cross-tab 退出事件
window.addEventListener('storage', (e) => {
    if (e.key === 'techcraft_logout' && e.newValue) {
        // 其他标签页收到退出事件
        this.clearAuth();
        window.location.href = 'login.html';
    }
});
```

---

### 3.3 独立资料编辑页的浏览器级离开拦截

**策略定义**:

**拦截场景**:
- 浏览器后退按钮
- 浏览器刷新按钮
- 直接关闭标签页
- 跳转到其他页面（如账户安全页）
- 手动修改 URL

**拦截策略**:
```javascript
class ProfileEditPage {
    constructor() {
        this.hasUnsavedChanges = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupLeaveInterception();
    }

    setupLeaveInterception() {
        // 1. beforeunload 事件（刷新、关闭标签页）
        this.beforeUnloadHandler = (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '您有未保存的修改，确定要离开吗？';
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', this.beforeUnloadHandler);

        // 2. popstate 事件（浏览器后退）
        this.popStateHandler = (e) => {
            if (this.hasUnsavedChanges) {
                const confirmed = confirm('您有未保存的修改，确定要离开吗？');
                if (!confirmed) {
                    // 阻止后退
                    window.history.pushState(null, null, window.location.href);
                    return;
                }
            }
            // 允许后退
            window.removeEventListener('popstate', this.popStateHandler);
        };
        window.addEventListener('popstate', this.popStateHandler);

        // 3. 修改历史记录，确保 popstate 能触发
        window.history.pushState(null, null, window.location.href);
    }

    removeLeaveInterception() {
        window.removeEventListener('beforeunload', this.beforeUnloadHandler);
        window.removeEventListener('popstate', this.popStateHandler);
    }
}
```

**保存成功后的处理**:
```javascript
async handleSave() {
    try {
        const response = await userService.updateUserProfile(this.formData);

        if (response.success) {
            // 1. 移除离开拦截
            this.removeLeaveInterception();

            // 2. 显示成功提示
            notification.show('保存成功', 'success');

            // 3. 更新 auth-state
            authState.updateUser(response.data.user);

            // 4. 2秒后返回用户中心
            setTimeout(() => {
                window.location.href = 'profile-client.html';
            }, 2000);
        }
    } catch (error) {
        notification.show('保存失败', 'error');
    }
}
```

---

### 3.4 消息详情页的异常态行为

**异常场景定义**:

| 场景 | 处理方式 | 用户体验 |
|------|---------|---------|
| 消息不存在 | 显示空态："消息不存在或已删除"，3秒后返回列表 | 友好提示 |
| 消息已删除 | 显示空态："消息已删除"，3秒后返回列表 | 友好提示 |
| 未登录 | auth-guard 自动重定向到登录页，保存返回路径 | 登录后返回详情页 |
| 关联任务不存在 | 隐藏"前往任务"按钮，不影响其他操作 | 功能降级 |
| 没有上一条/下一条 | 对应按钮置灰 | 明确状态 |

**空态设计**:
```html
<!-- 消息详情空态 -->
<div class="message-detail-empty">
    <div class="empty-icon">📭</div>
    <div class="empty-title">消息不存在或已删除</div>
    <div class="empty-description">
        该消息可能已被删除或不存在
    </div>
    <button class="btn btn-primary" onclick="goBackToList()">
        返回消息列表
    </button>
</div>
```

**深链支持**:
```javascript
// 支持直接访问 message-detail.html?id=msg-001
const urlParams = new URLSearchParams(window.location.search);
const messageId = urlParams.get('id');

if (!messageId) {
    // 没有 id 参数，显示错误
    showEmptyState('无效的消息链接');
    return;
}

// 加载消息详情
loadMessageDetail(messageId);

async function loadMessageDetail(messageId) {
    try {
        const message = await messageService.getMessageById(messageId);

        if (!message) {
            showEmptyState('消息不存在或已删除');
            return;
        }

        renderMessageDetail(message);

        // 自动标记已读
        if (!message.isRead) {
            await messageService.markMessageRead(messageId);
            authState.decrementUnreadCount();
        }

        // 加载上一条/下一条
        const { previous, next } = await messageService.getAdjacentMessages(messageId);
        renderNavigationButtons(previous, next);

    } catch (error) {
        console.error('Load message detail error:', error);
        showEmptyState('加载失败，请稍后重试');
    }
}
```

---

### 3.5 账户安全页的空态和失败态

**空态定义**:

| 场景 | 展示方式 | 用户体验 |
|------|---------|---------|
| 未绑定手机 | 显示"未绑定"状态，隐藏"更换手机号"按钮 | 明确状态 |
| 无设备数据 | 隐藏"登录设备"卡片（本版不实现） | 功能降级 |
| 无安全日志 | 隐藏"安全日志"卡片（本版不实现） | 功能降级 |
| 接口不存在 | 显示静态安全提示，不调用接口 | 功能降级 |

**失败态定义**:

| 场景 | 展示方式 | 用户体验 |
|------|---------|---------|
| 接口超时 | 显示默认安全状态，提示"状态获取失败" | 功能降级 |
| 接口401 | auth-guard 自动重定向到登录页 | 权限控制 |
| 接口403 | 显示"无权限访问"，返回用户中心 | 权限控制 |

**实现**:
```javascript
class SecuritySettingsPage {
    async loadSecurityStatus() {
        try {
            const response = await httpClient.get('/api/users/security/status');

            if (response.success) {
                this.renderSecurityStatus(response.data);
            } else {
                // 接口返回失败，显示默认状态
                this.renderDefaultStatus();
            }

        } catch (error) {
            console.error('Load security status error:', error);

            // 接口不存在或超时，显示默认状态
            this.renderDefaultStatus();
        }
    }

    renderDefaultStatus() {
        // 从 auth-state 读取基本信息，显示默认状态
        const user = authState.getCurrentUser();

        this.statusContainer.innerHTML = `
            <div class="security-status-fallback">
                <div class="status-item">
                    <span class="status-icon">🔑</span>
                    <span class="status-label">密码状态</span>
                    <span class="status-value">未设置</span>
                </div>
                <div class="status-item">
                    <span class="status-icon">📱</span>
                    <span class="status-label">手机号</span>
                    <span class="status-value">
                        ${user.phone ? '已绑定' : '未绑定'}
                    </span>
                </div>
                <div class="status-item">
                    <span class="status-icon">✅</span>
                    <span class="status-label">实名认证</span>
                    <span class="status-value">
                        ${this.getRealNameStatusLabel(user.realNameStatus)}
                    </span>
                </div>
            </div>
            <div class="security-tips">
                <p>• 定期修改密码可提升账户安全</p>
                <p>• 完成实名认证可解锁更多功能</p>
                <p>• 不要在公共设备上记住密码</p>
            </div>
        `;
    }
}
```

---

## 4. 文件改动清单（修订版）

### 4.1 基础工作文件修改（必须先完成）

| 文件路径 | 修改内容 | 优先级 |
|---------|---------|-------|
| `assets/data/auth-mock.js` | 修复 Mock API 路由分发，按 `{METHOD} /path` 格式 | P0 |
| `assets/data/auth-mock.js` | 统一用户资料模型，使用 extension 结构 | P0 |
| `assets/js/auth-service.js` | 移除 updateProfile 方法，避免契约冲突 | P0 |
| `assets/js/profile-editor.js` | 重构为 EditableProfile 类，支持 modal/page 模式 | P0 |
| `assets/js/user-service.js` | 确认为唯一用户资料数据契约 | P0 |

---

### 4.2 P0 功能文件改动

#### 4.2.1 新增文件（P0）

**HTML 页面：**

| 文件路径 | 职责定位 | 依赖 |
|---------|---------|------|
| `profile-edit.html` | 用户资料编辑页（独立页面） | `profile.css`, `profile-edit-main.js`, `user-service.js` |
| `message-detail.html` | 消息详情页（只读版本） | `profile.css`, `message-detail-main.js`, `message-service.js` |

**JavaScript 业务逻辑：**

| 文件路径 | 职责定位 | 依赖 |
|---------|---------|------|
| `assets/js/profile-edit-main.js` | 资料编辑页面主逻辑 | `auth-state.js`, `user-service.js`, `profile-editor.js`, `notification.js`, `form-validator.js` |
| `assets/js/message-detail-main.js` | 消息详情页面主逻辑 | `auth-state.js`, `message-service.js`, `notification.js` |

**CSS 样式（扩展现有文件）：**

| 文件路径 | 新增内容 |
|---------|---------|
| `assets/css/profile.css` | 资料编辑页样式、消息详情页样式 |

---

#### 4.2.2 修改文件（P0）

**用户中心页面（添加入口）：**

| 文件路径 | 修改内容 |
|---------|---------|
| `profile-client.html` | "编辑资料"改为跳转到独立页面，而非打开模态框 |
| `profile-developer.html` | "编辑资料"改为跳转到独立页面，而非打开模态框 |
| `assets/js/message-center.js` | 消息点击改为跳转到 message-detail.html，而非直接按 actionUrl 跳转 |

**服务层扩展：**

| 文件路径 | 修改内容 |
|---------|---------|
| `assets/js/message-service.js` | 新增 `getMessageById()` 和 `getAdjacentMessages()` 方法 |
| `assets/data/auth-mock.js` | 新增 `GET /api/messages/{id}` Mock 处理 |

---

### 4.3 P1 功能文件改动（延后实施）

#### 4.3.1 新增文件（P1）

| 文件路径 | 职责定位 | 依赖 |
|---------|---------|------|
| `security-settings.html` | 账户安全设置页（最小版本） | `profile.css`, `security-settings-main.js` |
| `assets/js/security-settings-main.js` | 安全设置页面主逻辑 | `auth-state.js`, `notification.js` |

---

### 4.4 暂停的功能（不实施）

| 功能 | 状态 | 原因 |
|------|------|------|
| 忘记密码/重置密码 | ⏸️ 暂停 | 需先完成0.1、0.5前置条件 |
| 修改密码 | ⏸️ 暂停 | 需先完成0.1、0.6前置条件 |
| 更换手机号 | ⏸️ 暂停 | 优先级较低，延后到后续版本 |
| 登录设备管理 | ⏸️ 暂停 | 底层无支持，延后到后续版本 |
| 安全日志 | ⏸️ 暂停 | 底层无支持，延后到后续版本 |

---

## 5. 风险点（修订版）

### 5.1 技术风险

| 风险项 | 风险等级 | 影响范围 | 缓解措施 |
|-------|---------|---------|---------|
| **ProfileEditor 重构风险** | 高 | 资料编辑页 | 1. 保留原有模态框功能<br>2. 充分测试两种模式<br>3. 提供回滚方案 |
| **用户资料契约统一** | 中 | 所有资料相关功能 | 1. 先完成基础工作0.3<br>2. 全面回归测试<br>3. 文档化统一契约 |
| **Mock API 路由分发** | 中 | 所有 Mock API | 1. 先完成基础工作0.2<br>2. 测试所有现有 API<br>3. 确保无破坏性变更 |
| **消息详情页深链** | 低 | 消息详情页 | 1. 充分测试异常场景<br>2. 提供友好的空态<br>3. 自动返回列表 |
| **浏览器兼容性** | 低 | 所有功能 | 1. 使用原生 ES6+ 语法<br>2. 测试主流浏览器<br>3. 无需 Babel 转译 |

---

### 5.2 用户体验风险

| 风险项 | 风险等级 | 影响范围 | 缓解措施 |
|-------|---------|---------|---------|
| **资料编辑页离开拦截过于频繁** | 中 | 资料编辑页 | 1. 只在有未保存修改时拦截<br>2. 提供清晰的确认文案<br>3. 保存后立即移除拦截 |
| **消息详情页加载慢** | 低 | 消息详情页 | 1. 显示加载状态<br>2. 使用骨架屏（可选）<br>3. 快速失败机制 |
| **账户安全页功能不完整** | 低 | 账户安全页 | 1. 明确标注"开发中"<br>2. 提供静态安全提示<br>3. 设置合理的用户预期 |

---

### 5.3 开发风险

| 风险项 | 风险等级 | 影响范围 | 缓解措施 |
|-------|---------|---------|---------|
| **基础工作量被低估** | 高 | 所有功能 | 1. 优先完成基础工作0.1-0.4<br>2. 分阶段实施（基础→P0→P1）<br>3. 预留缓冲时间 |
| **密码功能需求不明确** | 高 | 密码相关功能 | 1. 先完成0.1明确需求<br>2. 暂停密码功能实施<br>3. 等待产品明确后再实施 |
| **测试覆盖不足** | 中 | 所有功能 | 1. 制定详细测试清单<br>2. 手动测试所有场景<br>3. 边界和异常场景测试 |

---

## 6. 实施细则（修订版）

### 6.1 开发顺序建议

**阶段 0：基础工作（必须先完成，约3-5天）**
```
Day 1-2: 基础工作 0.1 + 0.2
  - 明确密码在产品中的定位（需产品确认）
  - 修复 Mock API 路由分发机制
  - 测试所有现有 Mock API

Day 3-4: 基础工作 0.3 + 0.4
  - 统一用户资料数据契约
  - 重构 ProfileEditor 组件
  - 回归测试模态框功能

Day 5: 基础工作 0.5-0.7
  - 定义账号存在性暴露策略
  - 定义密码修改后的会话处置策略
  - 定义各边界条件和异常态
```

**阶段 1：P0 核心功能（约5-7天）**
```
Day 1-3: 用户资料编辑页（独立页面）
  - Day 1: profile-edit.html + CSS 布局
  - Day 2: profile-edit-main.js 业务逻辑
  - Day 3: 集成测试 + 浏览器级离开拦截

Day 4-5: 消息详情页
  - Day 1: message-detail.html + CSS 布局
  - Day 2: message-detail-main.js + message-service 扩展
  - Day 3: 深链支持 + 异常场景测试

Day 6-7: 集成测试 + 修复
  - Day 1: 全流程测试
  - Day 2: Bug 修复 + 优化
```

**阶段 2：P1 重要功能（延后实施，约3-4天）**
```
Day 1-2: 账户安全设置页（最小版本）
  - Day 1: security-settings.html + CSS 布局
  - Day 2: security-settings-main.js + 空态处理

Day 3-4: 集成测试 + 修复
  - Day 1: 全流程测试
  - Day 2: Bug 修复 + 文档更新
```

**阶段 3：密码功能（等待前置条件，暂不排期）**
```
等待基础工作 0.1 完成后再排期
```

---

### 6.2 测试策略（修订版）

#### 6.2.1 基础工作测试

**Mock API 路由分发测试：**
- [ ] 同一路径的 GET / PUT / DELETE 是否命中正确 handler
- [ ] 新增接口后不会和现有 path-only 分发冲突
- [ ] 所有现有 API 调用仍然正常工作

**用户资料契约统一测试：**
- [ ] user-service.updateUserProfile() 正常工作
- [ ] extension 模型字段完整
- [ ] 模态框资料编辑功能回归测试
- [ ] 独立页资料编辑功能正常

**ProfileEditor 重构测试：**
- [ ] modal 模式：打开/关闭/保存/取消
- [ ] page 模式：保存/取消/离开拦截
- [ ] 两种模式行为一致性
- [ ] 头像上传功能正常

---

#### 6.2.2 P0 功能测试

**用户资料编辑页测试：**
- [ ] 正常保存流程
- [ ] 表单验证（所有字段）
- [ ] 头像上传和预览
- [ ] 技能标签添加/删除（开发者）
- [ ] 公司信息编辑（客户）
- [ ] 未保存修改警告（浏览器后退）
- [ ] 未保存修改警告（浏览器刷新）
- [ ] 未保存修改警告（跳转其他页面）
- [ ] 网络错误处理
- [ ] 保存成功后返回用户中心
- [ ] 取消后返回用户中心
- [ ] 深链进入编辑页（直接访问 URL）

**消息详情页测试：**
- [ ] 消息展示（system 类型）
- [ ] 消息展示（task 类型）
- [ ] 自动标记已读
- [ ] 未读计数同步（当前标签页）
- [ ] 未读计数同步（其他标签页）
- [ ] 删除消息
- [ ] 删除后返回列表
- [ ] 跳转关联任务
- [ ] 上一条/下一条导航
- [ ] 上一条/下一条按钮置灰（边界情况）
- [ ] 消息不存在
- [ ] 消息已删除
- [ ] 关联任务不存在
- [ ] 未登录重定向
- [ ] 深链进入详情页（直接访问 URL）
- [ ] 浏览器返回与"返回列表"一致

---

#### 6.2.3 边界和异常场景测试

**账号存在性暴露测试：**
- [ ] 未注册手机号发起重置密码（泛化提示）
- [ ] 已注册手机号发起重置密码（正常流程）
- [ ] 验证码错误提示不暴露账号状态

**密码修改后的会话测试：**
- [ ] 修改密码后当前页退出
- [ ] 修改密码后其他标签页退出
- [ ] 未读消息数清理
- [ ] 用户资料缓存清理
- [ ] Token 清除

**资料编辑页离开拦截测试：**
- [ ] 后退按钮拦截
- [ ] 刷新按钮拦截
- [ ] 关闭标签页拦截
- [ ] 跳转其他页面拦截
- [ ] 保存后不再拦截
- [ ] 取消后不再拦截

**消息详情页异常态测试：**
- [ ] 无效的 message ID
- [ ] 不存在的消息
- [ ] 已删除的消息
- [ ] 关联任务不存在
- [ ] 接口超时
- [ ] 接口 401/403

---

#### 6.2.4 兼容性测试

- [ ] Chrome（最新版）
- [ ] Firefox（最新版）
- [ ] Safari（最新版）
- [ ] Edge（最新版）
- [ ] 移动端 Chrome（iOS）
- [ ] 移动端 Chrome（Android）

---

### 6.3 上线检查清单（修订版）

**基础工作检查：**
- [ ] Mock API 路由分发已修复
- [ ] 用户资料契约已统一
- [ ] ProfileEditor 已重构
- [ ] 账号存在性暴露策略已定义
- [ ] 密码修改后的会话处置策略已定义
- [ ] 所有边界条件已定义

**代码质量：**
- [ ] 所有文件包含 L3 文件头
- [ ] 代码复用率 ≥ 60%
- [ ] 关键函数包含 JSDoc 注释
- [ ] 无 console.log 调试代码

**功能完整性：**
- [ ] 所有 P0 功能完成
- [ ] 所有测试用例通过
- [ ] 无已知 Bug

**用户体验：**
- [ ] 所有错误提示友好
- [ ] 所有加载状态清晰
- [ ] 移动端适配良好
- [ ] 异常场景有友好提示

**文档完善：**
- [ ] API 接口文档更新
- [ ] 用户使用手册更新
- [ ] 测试报告完整
- [ ] 本设计文档已更新

---

## 7. 附录

### 7.1 关键代码示例

#### 7.1.1 Mock API 路由分发修复

```javascript
// assets/data/auth-mock.js
function setupMockFetch() {
    const originalFetch = window.fetch;

    window.fetch = async function(url, options = {}) {
        console.log(`[Mock Fetch] ${options.method || 'GET'} ${url}`);

        const [pathname, search] = url.split('?');
        const queryParams = new URLSearchParams(search);
        const params = Object.fromEntries(queryParams);

        let body = null;
        if (options.body) {
            try {
                body = JSON.parse(options.body);
            } catch (e) {
                body = options.body;
            }
        }

        // 修复：按 method + pathname 分发
        const method = options.method || 'GET';
        const key = `${method} ${pathname}`;
        const handler = mockApiHandlers[key];

        if (handler) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const response = handler(params || body);

            return {
                ok: response.success !== false,
                json: async () => response,
                status: response.success === false ? 400 : 200
            };
        }

        console.warn(`[Mock Fetch] No handler for ${key}, using original fetch`);
        return originalFetch(url, options);
    };
}

// 修改所有 API handler 的 key
const mockApiHandlers = {
    // 认证相关
    'POST /api/auth/send-code': (data) => { /* ... */ },
    'POST /api/auth/login': (data) => { /* ... */ },
    'POST /api/auth/register': (data) => { /* ... */ },
    'POST /api/auth/logout': () => { /* ... */ },

    // 用户资料相关
    'GET /api/users/profile': () => { /* ... */ },
    'PUT /api/users/profile': (data) => { /* ... */ },

    // 消息相关
    'GET /api/messages': (params) => { /* ... */ },
    'GET /api/messages/{id}': (params) => { /* ... */ },
    'PUT /api/messages/{id}/read': (params) => { /* ... */ },
    'DELETE /api/messages/{id}': (params) => { /* ... */ },

    // ... 其他接口
};
```

---

#### 7.1.2 ProfileEditor 重构

```javascript
// assets/js/profile-editor.js
/**
 * [FILE] profile-editor.js
 * [POS] 可编辑的用户资料组件 - 支持模态框和独立页面两种模式
 * [IN] 用户数据、配置选项
 * [OUT] 编辑后的用户数据
 * [DEP] user-service.js, form-validator.js, notification.js
 * [SIDE EFFECT] DOM 操作、API 调用、页面跳转
 * [TEST] 测试 modal 模式和 page 模式的完整功能
 */

class EditableProfile {
    constructor(container, options = {}) {
        this.container = container;
        this.mode = options.mode || 'modal'; // modal | page
        this.onSave = options.onSave || (() => {});
        this.onCancel = options.onCancel || (() => {});
        this.hasUnsavedChanges = false;

        this.formData = {
            extension: {
                avatar: '',
                bio: '',
                location: '',
                website: '',
                company: { name: '', creditCode: '' },
                title: '',
                skills: []
            }
        };

        this.init();
    }

    init() {
        this.renderForm();
        this.bindEvents();

        if (this.mode === 'page') {
            this.setupLeaveInterception();
        }
    }

    renderForm() {
        if (this.mode === 'modal') {
            this.renderModalLayout();
        } else {
            this.renderPageLayout();
        }

        this.loadUserData();
    }

    renderModalLayout() {
        // 渲染模态框布局（保持现有逻辑）
        this.container.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>编辑资料</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.getFormHTML()}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-btn">取消</button>
                    <button class="btn btn-primary save-btn">保存</button>
                </div>
            </div>
        `;
    }

    renderPageLayout() {
        // 渲染独立页面布局
        this.container.innerHTML = `
            <div class="profile-edit-header">
                <button class="btn btn-back">← 返回</button>
                <h1>编辑资料</h1>
                <div class="header-actions">
                    <button class="btn btn-primary save-btn">保存</button>
                    <button class="btn btn-secondary cancel-btn">取消</button>
                </div>
            </div>
            <div class="profile-edit-body">
                ${this.getFormHTML()}
            </div>
        `;
    }

    getFormHTML() {
        // 返回表单 HTML（两种模式共享）
        const user = authState.getCurrentUser();
        const isClient = user.role === 'client';

        return `
            <form id="profileEditForm">
                <!-- 头像上传 -->
                <div class="form-group">
                    <label>头像</label>
                    <div class="avatar-upload">
                        <img src="${this.formData.extension.avatar || DEFAULT_AVATAR}" class="avatar-preview">
                        <input type="file" id="avatarInput" accept="image/*" class="avatar-input">
                        <button type="button" class="btn btn-secondary upload-btn">上传头像</button>
                    </div>
                </div>

                <!-- 基本信息 -->
                <div class="form-group">
                    <label for="name">姓名 *</label>
                    <input type="text" id="name" name="name" value="${this.formData.name || ''}" required>
                </div>

                <div class="form-group">
                    <label for="bio">简介</label>
                    <textarea id="bio" name="bio" maxlength="200">${this.formData.extension.bio || ''}</textarea>
                </div>

                <div class="form-group">
                    <label for="location">地区</label>
                    <input type="text" id="location" name="location" value="${this.formData.extension.location || ''}">
                </div>

                <div class="form-group">
                    <label for="website">个人网站</label>
                    <input type="url" id="website" name="website" value="${this.formData.extension.website || ''}">
                </div>

                <!-- 角色专属信息 -->
                ${isClient ? this.getClientFieldsHTML() : this.getDeveloperFieldsHTML()}
            </form>
        `;
    }

    getClientFieldsHTML() {
        return `
            <div class="form-section">
                <h3>公司信息</h3>
                <div class="form-group">
                    <label for="companyName">公司名称 *</label>
                    <input type="text" id="companyName" name="companyName"
                           value="${this.formData.extension.company?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="creditCode">统一社会信用代码 *</label>
                    <input type="text" id="creditCode" name="creditCode"
                           value="${this.formData.extension.company?.creditCode || ''}" required>
                </div>
            </div>
        `;
    }

    getDeveloperFieldsHTML() {
        const skills = this.formData.extension.skills || [];
        return `
            <div class="form-section">
                <h3>专业技能</h3>
                <div class="form-group">
                    <label>职位</label>
                    <input type="text" id="title" name="title"
                           value="${this.formData.extension.title || ''}">
                </div>
                <div class="form-group">
                    <label>技能标签</label>
                    <div class="skills-input">
                        <input type="text" id="skillInput" placeholder="输入技能后按回车添加">
                        <div class="skills-list">
                            ${skills.map(skill => `
                                <span class="skill-tag">
                                    ${skill}
                                    <button type="button" class="skill-remove" data-skill="${skill}">×</button>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 保存按钮
        const saveBtn = this.container.querySelector('.save-btn');
        saveBtn.addEventListener('click', () => this.handleSave());

        // 取消按钮
        const cancelBtn = this.container.querySelector('.cancel-btn');
        cancelBtn.addEventListener('click', () => this.handleCancel());

        // 返回按钮（仅 page 模式）
        const backBtn = this.container.querySelector('.btn-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.handleCancel());
        }

        // 表单输入变化
        const form = this.container.querySelector('#profileEditForm');
        form.addEventListener('input', () => {
            this.hasUnsavedChanges = true;
        });

        // 头像上传
        const uploadBtn = this.container.querySelector('.upload-btn');
        uploadBtn.addEventListener('click', () => this.handleAvatarUpload());

        // 技能标签
        const skillInput = this.container.querySelector('#skillInput');
        if (skillInput) {
            skillInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addSkill(skillInput.value);
                    skillInput.value = '';
                }
            });
        }

        const skillRemoveBtns = this.container.querySelectorAll('.skill-remove');
        skillRemoveBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeSkill(btn.dataset.skill);
            });
        });
    }

    setupLeaveInterception() {
        // beforeunload 事件（刷新、关闭标签页）
        this.beforeUnloadHandler = (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '您有未保存的修改，确定要离开吗？';
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', this.beforeUnloadHandler);

        // popstate 事件（浏览器后退）
        this.popStateHandler = (e) => {
            if (this.hasUnsavedChanges) {
                const confirmed = confirm('您有未保存的修改，确定要离开吗？');
                if (!confirmed) {
                    window.history.pushState(null, null, window.location.href);
                    return;
                }
            }
            window.removeEventListener('popstate', this.popStateHandler);
        };
        window.addEventListener('popstate', this.popStateHandler);

        // 修改历史记录
        window.history.pushState(null, null, window.location.href);
    }

    removeLeaveInterception() {
        window.removeEventListener('beforeunload', this.beforeUnloadHandler);
        window.removeEventListener('popstate', this.popStateHandler);
    }

    async loadUserData() {
        try {
            const user = await userService.getUserProfile();
            this.formData = {
                ...user,
                extension: {
                    avatar: user.extension?.avatar || '',
                    bio: user.extension?.bio || '',
                    location: user.extension?.location || '',
                    website: user.extension?.website || '',
                    company: user.extension?.company || { name: '', creditCode: '' },
                    title: user.extension?.title || '',
                    skills: user.extension?.skills || []
                }
            };

            // 重新渲染表单
            this.renderForm();
        } catch (error) {
            console.error('Load user data error:', error);
            notification.show('加载用户数据失败', 'error');
        }
    }

    async handleSave() {
        // 表单验证
        if (!this.validateForm()) {
            return;
        }

        try {
            const response = await userService.updateUserProfile({
                extension: this.formData.extension
            });

            if (response.success) {
                this.hasUnsavedChanges = false;

                if (this.mode === 'page') {
                    this.removeLeaveInterception();
                }

                notification.show('保存成功', 'success');

                // 更新 auth-state
                authState.updateUser(response.data.user);

                // 延迟回调
                setTimeout(() => {
                    this.onSave(response.data.user);
                }, 2000);
            } else {
                notification.show(response.error.message || '保存失败', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            notification.show('保存失败，请稍后重试', 'error');
        }
    }

    handleCancel() {
        if (this.hasUnsavedChanges) {
            const confirmed = confirm('您有未保存的修改，确定要离开吗？');
            if (!confirmed) {
                return;
            }
        }

        if (this.mode === 'page') {
            this.removeLeaveInterception();
        }

        this.onCancel();
    }

    validateForm() {
        // 表单验证逻辑
        return true;
    }

    handleAvatarUpload() {
        // 头像上传逻辑
    }

    addSkill(skill) {
        if (!this.formData.extension.skills.includes(skill)) {
            this.formData.extension.skills.push(skill);
            this.hasUnsavedChanges = true;
            this.renderSkills();
        }
    }

    removeSkill(skill) {
        this.formData.extension.skills = this.formData.extension.skills.filter(s => s !== skill);
        this.hasUnsavedChanges = true;
        this.renderSkills();
    }

    renderSkills() {
        // 重新渲染技能标签
    }

    open() {
        if (this.mode === 'modal') {
            this.container.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    }

    close() {
        if (this.mode === 'modal') {
            this.container.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }
}

// 导出
export default EditableProfile;
```

---

#### 7.1.3 消息详情页核心逻辑

```javascript
// assets/js/message-detail-main.js
/**
 * [FILE] message-detail-main.js
 * [POS] 消息详情页主逻辑 - 展示消息详情、快捷操作、导航
 * [IN] 消息 ID（URL 参数）
 * [OUT] 消息详情渲染、未读计数更新
 * [DEP] message-service.js, auth-state.js, notification.js, auth-guard.js
 * [SIDE EFFECT] DOM 操作、API 调用、页面跳转
 * [TEST] 测试各种消息类型、异常场景、导航功能
 */

import authGuard from './auth-guard.js';
import authState from './auth-state.js';
import messageService from './message-service.js';
import notification from './notification.js';

class MessageDetailPage {
    constructor() {
        this.messageId = null;
        this.message = null;
        this.adjacentMessages = { previous: null, next: null };

        this.init();
    }

    async init() {
        // 路由守卫
        authGuard.check();

        // 获取消息 ID
        const urlParams = new URLSearchParams(window.location.search);
        this.messageId = urlParams.get('id');

        if (!this.messageId) {
            this.showEmptyState('无效的消息链接');
            return;
        }

        // 加载消息详情
        await this.loadMessageDetail();

        // 绑定事件
        this.bindEvents();
    }

    async loadMessageDetail() {
        try {
            this.showLoading();

            // 获取消息详情
            this.message = await messageService.getMessageById(this.messageId);

            if (!this.message) {
                this.showEmptyState('消息不存在或已删除');
                return;
            }

            // 渲染消息详情
            this.renderMessageDetail();

            // 自动标记已读
            if (!this.message.isRead) {
                await messageService.markMessageRead(this.messageId);
                authState.decrementUnreadCount();
            }

            // 加载上一条/下一条
            this.adjacentMessages = await messageService.getAdjacentMessages(this.messageId);
            this.renderNavigationButtons();

        } catch (error) {
            console.error('Load message detail error:', error);
            this.showEmptyState('加载失败，请稍后重试');
        }
    }

    renderMessageDetail() {
        const container = document.querySelector('.message-detail-container');

        const typeConfig = getMessageTypeConfig(this.message.type);

        container.innerHTML = `
            <div class="message-detail-header">
                <button class="btn btn-back" onclick="goBackToList()">← 返回</button>
                <div class="message-meta">
                    <span class="message-icon">${typeConfig.icon}</span>
                    <span class="message-type">${typeConfig.label}</span>
                    <span class="message-time">${formatTime(this.message.createdAt)}</span>
                </div>
                <div class="message-actions">
                    <button class="btn btn-secondary mark-read-btn" ${this.message.isRead ? 'disabled' : ''}>
                        ${this.message.isRead ? '已标记已读' : '标记已读'}
                    </button>
                    <button class="btn btn-danger delete-btn">删除</button>
                </div>
            </div>

            <div class="message-detail-content">
                <h1 class="message-title">${this.message.title}</h1>
                <div class="message-body">${this.message.content}</div>
            </div>

            <div class="message-detail-footer">
                ${this.renderQuickActions()}
            </div>

            <div class="message-detail-navigation">
                <button class="btn btn-secondary previous-btn"
                        data-id="${this.adjacentMessages.previous?.id || ''}"
                        ${!this.adjacentMessages.previous ? 'disabled' : ''}>
                    ← 上一条
                </button>
                <button class="btn btn-secondary next-btn"
                        data-id="${this.adjacentMessages.next?.id || ''}"
                        ${!this.adjacentMessages.next ? 'disabled' : ''}>
                    下一条 →
                </button>
            </div>
        `;
    }

    renderQuickActions() {
        let actions = '';

        // 如果有关联任务，显示"前往任务"按钮
        if (this.message.actionUrl && !this.isTaskDeleted()) {
            actions += `
                <button class="btn btn-primary action-btn" data-url="${this.message.actionUrl}">
                    ${this.message.actionLabel || '前往任务'}
                </button>
            `;
        }

        // 如果是实名认证提醒，显示"前往认证"按钮
        if (this.message.type === 'system' && this.message.title.includes('实名认证')) {
            actions += `
                <button class="btn btn-primary action-btn" data-url="real-name-auth.html">
                    前往认证
                </button>
            `;
        }

        return actions ? `<div class="quick-actions">${actions}</div>` : '';
    }

    renderNavigationButtons() {
        const previousBtn = document.querySelector('.previous-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (previousBtn) {
            previousBtn.disabled = !this.adjacentMessages.previous;
        }

        if (nextBtn) {
            nextBtn.disabled = !this.adjacentMessages.next;
        }
    }

    isTaskDeleted() {
        // 检查关联任务是否已删除（如果实现了任务删除功能）
        return false;
    }

    bindEvents() {
        // 返回按钮
        const backBtn = document.querySelector('.btn-back');
        backBtn.addEventListener('click', () => this.goBackToList());

        // 标记已读按钮
        const markReadBtn = document.querySelector('.mark-read-btn');
        if (markReadBtn && !markReadBtn.disabled) {
            markReadBtn.addEventListener('click', () => this.handleMarkRead());
        }

        // 删除按钮
        const deleteBtn = document.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => this.handleDelete());

        // 快捷操作按钮
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.dataset.url;
                if (url) {
                    window.location.href = url;
                }
            });
        });

        // 上一条/下一条按钮
        const previousBtn = document.querySelector('.previous-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (previousBtn && !previousBtn.disabled) {
            previousBtn.addEventListener('click', () => {
                this.navigateToMessage(this.adjacentMessages.previous.id);
            });
        }

        if (nextBtn && !nextBtn.disabled) {
            nextBtn.addEventListener('click', () => {
                this.navigateToMessage(this.adjacentMessages.next.id);
            });
        }
    }

    async handleMarkRead() {
        try {
            await messageService.markMessageRead(this.messageId);
            authState.decrementUnreadCount();
            notification.show('已标记为已读', 'success');

            // 更新按钮状态
            const markReadBtn = document.querySelector('.mark-read-btn');
            markReadBtn.disabled = true;
            markReadBtn.textContent = '已标记已读';
        } catch (error) {
            console.error('Mark read error:', error);
            notification.show('操作失败', 'error');
        }
    }

    async handleDelete() {
        const confirmed = confirm('确定要删除这条消息吗？');
        if (!confirmed) {
            return;
        }

        try {
            await messageService.deleteMessage(this.messageId);
            notification.show('消息已删除', 'success');

            // 2秒后返回列表
            setTimeout(() => {
                this.goBackToList();
            }, 2000);
        } catch (error) {
            console.error('Delete error:', error);
            notification.show('删除失败', 'error');
        }
    }

    navigateToMessage(messageId) {
        if (messageId) {
            window.location.href = `message-detail.html?id=${messageId}`;
        }
    }

    goBackToList() {
        const user = authState.getCurrentUser();
        const role = user?.role || 'client';
        window.location.href = `profile-${role}.html#messages`;
    }

    showLoading() {
        const container = document.querySelector('.message-detail-container');
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>加载中...</p>
            </div>
        `;
    }

    showEmptyState(message) {
        const container = document.querySelector('.message-detail-container');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-title">${message}</div>
                <div class="empty-description">
                    该消息可能已被删除或不存在
                </div>
                <button class="btn btn-primary" onclick="goBackToList()">
                    返回消息列表
                </button>
            </div>
        `;

        // 3秒后自动返回
        setTimeout(() => {
            this.goBackToList();
        }, 3000);
    }
}

// 辅助函数
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) { // 1分钟内
        return '刚刚';
    } else if (diff < 3600000) { // 1小时内
        return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
        return `${Math.floor(diff / 3600000)}小时前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

function getMessageTypeConfig(type) {
    // 从 profile-config.js 导入
    const { MESSAGE_TYPE_CONFIG } = await import('./profile-config.js');
    return MESSAGE_TYPE_CONFIG[type] || MESSAGE_TYPE_CONFIG['system'];
}

function goBackToList() {
    const user = authState.getCurrentUser();
    const role = user?.role || 'client';
    window.location.href = `profile-${role}.html#messages`;
}

// 初始化
const messageDetailPage = new MessageDetailPage();
```

---

## 8. 总结

### 8.1 修订要点

本次修订基于技术评审意见，主要变更包括：

1. **暂停密码相关功能** - 等待明确密码在产品中的定位
2. **修正错误前提** - 修改密码接口仅为占位，并非真正可用
3. **收紧功能范围** - 消息详情页移除回复功能，账户安全页最小化
4. **补充边界条件** - 定义所有遗漏的边界条件和异常态
5. **修复基础问题** - Mock API 路由分发、用户资料契约统一、ProfileEditor 解耦
6. **补充测试用例** - 添加所有关键测试场景

### 8.2 核心优势

- **先完成基础工作** - 确保架构稳定后再实施新功能
- **收紧功能范围** - 确保可实施性，避免返工
- **明确边界条件** - 覆盖所有异常场景
- **最大化代码复用** - 复用现有模块和服务
- **风险可控** - 详细的风险分析和缓解措施

### 8.3 实施建议

- 优先完成基础工作（0.1-0.4）
- 严格按阶段实施（基础→P0→P1）
- 充分测试所有场景
- 密码功能等待产品明确后再实施
- 预留缓冲时间应对意外问题

---

*文档版本: v2.0 (修订版)*
*修订日期: 2026-04-13*
*修订原因: 根据技术评审意见进行全面修订*
