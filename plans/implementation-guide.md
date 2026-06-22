# TechCraft 认证功能完善 - 功能模块代码实施细则

**文档类型**: 工程实施文档
**基于方案**: plans/polymorphic-puzzling-boot-v4-revised.md
**创建日期**: 2026-04-13
**适用阶段**: 阶段 A（闭合基础问题）+ 阶段 B（实施 P0 功能）

---

## A. 需求理解与工程假设

### A.1 目标复述

**核心目标**: 为 TechCraft 项目添加用户资料编辑页（独立页面）和消息详情页（只读版本）两个功能模块，同时闭合基础架构问题。

**具体产出**:
1. 用户可通过独立页面编辑个人资料（基本信息、头像、技能标签等）
2. 用户可查看消息详情内容，支持标记已读、删除、导航等操作
3. 闭合 4 个基础架构问题：动态路由、数据契约、状态持久化、页面鉴权

---

### A.2 设计方案中的模糊点与工程假设

#### A.2.1 模糊点

**模糊点 1: 方案未明确 ProfileEditor 组件如何"解耦"**
- 方案提到"复用 profile-editor.js 核心逻辑（需先解耦）"
- 但未说明解耦的具体方式：是抽取为类？还是提取共用函数？
- **工程假设**: 采用类重构方案，将 ProfileEditor 改造为支持两种模式的类（modal 模式和 page 模式），通过构造参数区分

**模糊点 2: 方案未明确 message-detail.html 的初始化链路**
- 方案提到新增 message-detail.html 和 message-detail-main.js
- 但未说明是否需要 message-detail-main.js 作为入口文件来初始化共享布局
- **工程假设**: 遵循现有项目模式，创建 message-detail-main.js 作为入口文件，负责初始化 shared-layout、注入 authState、调用 auth-guard

**模糊点 3: 方案未明确用户角色在消息详情页中的处理**
- 方案提到"返回路径基于角色"，但消息详情页是通用的
- **工程假设**: 消息详情页读取当前登录用户角色，如果未登录则由 auth-guard 处理，如果已登录则使用该角色计算返回路径

---

### A.3 潜在冲突与解决方案

#### A.3.1 冲突 1: user-service 与 auth-service 的资料更新职责

**冲突描述**: 
- 当前 auth-service.js 有 updateProfile() 方法
- 方案要求删除该方法，统一使用 user-service.updateUserProfile()
- 但 auth-state.js 的 onUpdateUser() 当前依赖 auth-service.updateProfile()

**解决方案**:
- 修改 auth-state.js 的 onUpdateUser() 方法，改为调用 user-service.updateUserProfile()
- 验证 auth-state.js 中所有调用 updateProfile 的地方是否只有这一处
- **假设**: auth-state.js 中只有一处调用 updateProfile，不会有其他隐藏依赖

---

#### A.3.2 冲突 2: 消息状态存储位置未定义

**冲突描述**:
- 当前消息存储在 message-service.js 的内部变量中（MOCK_MESSAGES）
- 方案要求持久化到 localStorage
- 但未定义 localStorage 的 key 名称

**解决方案**:
- 使用 `techcraft_messages` 作为 localStorage key
- 定义消息数据的存储结构：包含 id、type、title、content、isRead、deletedAt 等字段
- **假设**: 现有代码中没有其他地方使用 `techcraft_messages` 这个 key，不会产生冲突

---

#### A.3.3 冲突 3: 动态路径参数提取的实现细节

**冲突描述**:
- 方案提到需要支持 `/api/messages/{id}` 这样的动态路径
- 但未明确如何提取路径参数（如 msg-001）

**解决方案**:
- 在 auth-mock.js 中实现 extractPathParams 函数
- 通过字符串分割和位置匹配提取参数
- **假设**: 所有动态路径参数都是单段路径（不包含嵌套的 `/`）

---

### A.4 工程依赖前提

#### A.4.1 现有代码库依赖

**必须存在的文件**（假设）:
- `assets/js/auth-state.js` - 认证状态管理
- `assets/js/auth-guard.js` - 路由守卫
- `assets/js/auth-service.js` - 认证服务
- `assets/js/user-service.js` - 用户数据服务
- `assets/js/message-service.js` - 消息服务
- `assets/js/form-validator.js` - 表单验证
- `assets/js/notification.js` - 通知组件
- `assets/js/shared-layout.js` - 共享布局

**必须存在的功能**（假设）:
- auth-state.js 中有 currentUser 属性
- auth-guard.js 中有 PROTECTED_ROUTES 配置对象
- user-service.js 中有 updateUserProfile 方法
- message-service.js 中有 getMessages 方法

---

## B. 实施边界

### B.1 本次要做的内容

#### B.1.1 阶段 A：闭合基础问题（优先）

| 编号 | 工作项 | 输出 |
|------|--------|------|
| A-1 | 实现动态路径匹配机制 | auth-mock.js 支持动态路由 |
| A-2 | 统一用户资料数据契约 | 删除 auth-service.updateProfile，统一使用 user-service |
| A-3 | 实现消息状态持久化 | 消息已读/删除状态保存到 localStorage |
| A-4 | 补充新页面鉴权配置 | auth-guard.js 新增 3 个页面的鉴权配置 |
| A-5 | 明确单一事实源 | 删除 MOCK_USERS，统一使用 localStorage |
| A-6 | 补充 auth-state.js 缺失方法 | 添加 getCurrentUser() 方法（方案中假设存在但实际不存在） |

---

#### B.1.2 阶段 B：实施 P0 功能

| 编号 | 工作项 | 输出 |
|------|--------|------|
| B-1 | 用户资料编辑页（独立页面） | profile-edit.html + profile-edit-main.js |
| B-2 | 消息详情页（只读版本） | message-detail.html + message-detail-main.js |

---

### B.2 本次不做的内容

#### B.2.1 暂停的功能

| 功能 | 暂停原因 |
|------|---------|
| 忘记密码/重置密码 | 需先明确定码在产品中的定位 |
| 修改密码 | 需先明确定码在产品中的定位 |
| 更换手机号 | 优先级较低，延后到后续版本 |
| 登录设备管理 | 底层无支持，延后到后续版本 |
| 安全日志 | 底层无支持，延后到后续版本 |

---

#### B.2.2 不实现的功能特性

| 特性 | 不实现原因 |
|------|-----------|
| 富文本消息内容 | 降低安全风险，降级为纯文本 |
| pushState + popstate 拦截 | 避免历史栈污染，改用 beforeunload 拦截 |
| 站内导航离开拦截 | 简化实现，只在页面级离开时拦截 |
| 私信功能 | 产品明确"暂不实现 private 私信" |
| 回复功能 | 当前无会话模型，仅支持只读通知 |

---

### B.3 对现有系统的依赖前提

#### B.3.1 必须依赖的现有模块

**状态管理**:
- `auth-state.js` - 必须存在 currentUser 属性
- `auth-state.js` - 必须存在 onUpdateUser() 方法

**路由守卫**:
- `auth-guard.js` - 必须存在 PROTECTED_ROUTES 配置
- `auth-guard.js` - 必须存在 init() 方法

**服务层**:
- `user-service.js` - 必须存在 updateUserProfile() 方法
- `message-service.js` - 必须存在 getMessages() 方法
- `message-service.js` - 必须存在 _mockMarkMessageRead() 方法
- `message-service.js` - 必须存在 _mockDeleteMessage() 方法

**工具类**:
- `form-validator.js` - 必须存在 validatePhone() 等验证方法
- `notification.js` - 必须存在 show() success() error() 方法

---

#### B.3.2 现有代码库约束

**文件结构约束**:
- 新增 HTML 文件放在根目录
- 新增 JS 文件放在 assets/js/
- 新增 CSS 放在 assets/css/
- 遵循 L3 文件头规范

**命名约束**:
- 页面文件：kebab-case（如 profile-edit.html）
- JS 文件：kebab-case（如 profile-edit-main.js）
- CSS 文件：kebab-case（如 profile.css）
- 类名：kebab-case 或 PascalCase（遵循现有约定）

**模块化约束**:
- 使用 ES6 模块导入/导出
- 单一职责原则
- 避免循环依赖

---

## C. 架构与模块设计

### C.1 整体架构图（人读版）

```
┌─────────────────────────────────────────────────┐
│                 用户界面层 (HTML)              │
├─────────────────────────────────────────────────┤
│  profile-edit.html      message-detail.html     │
│  (独立编辑页面)          (消息详情页)            │
└─────────────────────────────────────────────────┘
                      ↓ 调用
┌─────────────────────────────────────────────────┐
│              业务逻辑层 (JS)                    │
├─────────────────────────────────────────────────┤
│  profile-edit-main.js    message-detail-main.js   │
│  - 初始化和路由                                   │
│  - 调用服务层                                     │
│  - 处理用户交互                                   │
└─────────────────────────────────────────────────┘
                      ↓ 调用
┌─────────────────────────────────────────────────┐
│               服务层 (Service)                   │
├─────────────────────────────────────────────────┤
│  user-service.js         message-service.js     │
│  - updateUserProfile()    - getMessageById()     │
│  - getUserProfile()      - getAdjacentMessages()│
│  - _mockUploadAvatar()    - markMessageRead()    │
│  - _mockUpdateUserProfile() - deleteMessage()    │
└─────────────────────────────────────────────────┘
                      ↓ 调用
┌─────────────────────────────────────────────────┐
│              状态管理层 (State)                  │
├─────────────────────────────────────────────────┤
│  auth-state.js                                    │
│  - currentUser (唯一事实源)                     │
│  - updateUser()                                  │
│  - getCurrentUser() (新增)                       │
│  - decrementUnreadCount()                        │
└─────────────────────────────────────────────────┘
                      ↓ 读写
┌─────────────────────────────────────────────────┐
│              持久化层 (Storage)                │
├─────────────────────────────────────────────────┤
│  localStorage                                     │
│  - techcraft_user (用户数据)                     │
│  - techcraft_messages (消息数据)                 │
└─────────────────────────────────────────────────┘
                      ↓ 拦截
┌─────────────────────────────────────────────────┐
│            路由守卫层 (Guard)                    │
├─────────────────────────────────────────────────┤
│  auth-guard.js                                    │
│  - PROTECTED_ROUTES (鉴权配置)                   │
│  - init() (鉴权检查)                               │
│  - getReturnPath() (返回路径)                     │
└─────────────────────────────────────────────────┘
                      ↓ Mock
┌─────────────────────────────────────────────────┐
│               Mock 层 (Mock)                     │
├─────────────────────────────────────────────────┤
│  auth-mock.js                                     │
│  - mockApiHandlers (API 处理器)                │
│  - matchRoute() (动态路由匹配)                  │
│  - setupMockFetch() (Fetch 拦截)                 │
└─────────────────────────────────────────────────┘
```

---

### C.2 整体架构图（AI 友好版）

```
架构分层结构:
├─[用户界面层]
│  ├─[profile-edit.html]
│  └─[message-detail.html]
├─[业务逻辑层]
│  ├─[profile-edit-main.js]
│  └─[message-detail-main.js]
├─[服务层]
│  ├─[user-service.js]
│  └─[message-service.js]
├─[状态管理层]
│  └─[auth-state.js]
├─[持久化层]
│  └─[localStorage]
├─[路由守卫层]
│  └─[auth-guard.js]
└─[Mock层]
   └─[auth-mock.js]

数据流向（用户资料编辑）:
[用户输入]→[profile-edit-main.js]→[user-service.js]→[auth-state.js]→[localStorage]

数据流向（消息详情）:
[URL参数]→[message-detail-main.js]→[message-service.js]→[localStorage]→[auth-state.js]

依赖关系:
profile-edit-main.js 依赖→auth-guard.js
profile-edit-main.js 依赖→auth-state.js
profile-edit-main.js 依赖→user-service.js
profile-edit-main.js 依赖→form-validator.js
profile-edit-main.js 依赖→notification.js
profile-edit-main.js 依赖→profile-editor.js

message-detail-main.js 依赖→auth-guard.js
message-detail-main.js 依赖→auth-state.js
message-detail-main.js 依赖→message-service.js
message-detail-main.js 依赖→notification.js
```

---

### C.3 模块职责定义

#### C.3.1 profile-edit-main.js（新增）

**职责**:
- 页面初始化（调用 auth-guard、shared-layout）
- 路由鉴权检查
- 加载用户数据（调用 user-service）
- 初始化 ProfileEditor 组件（page 模式）
- 绑定页面事件（保存、取消、返回）
- 处理表单验证
- 处理保存成功后的跳转
- 处理浏览器级离开拦截

**输入**:
- URL 参数（from 来源页面）
- 用户操作（点击、输入、表单提交）

**输出**:
- DOM 更新（表单渲染、错误提示）
- 页面跳转（保存成功后）
- 离开拦截提示

**依赖**:
- auth-guard.js（鉴权）
- auth-state.js（用户数据）
- user-service.js（资料更新）
- profile-editor.js（编辑组件）
- form-validator.js（表单验证）
- notification.js（提示）

---

#### C.3.2 message-detail-main.js（新增）

**职责**:
- 页面初始化（调用 auth-guard、shared-layout）
- 路由鉴权检查
- 解析 URL 参数获取消息 ID
- 加载消息详情（调用 message-service.getMessageById）
- 自动标记已读（调用 message-service.markMessageRead）
- 更新未读计数（调用 auth-state.decrementUnreadCount）
- 加载相邻消息（调用 message-service.getAdjacentMessages）
- 处理快捷操作（删除、跳转任务）
- 处理导航（上一条、下一条、返回）

**输入**:
- URL 参数（id 消息 ID）
- 用户操作（点击按钮）

**输出**:
- DOM 更新（消息内容渲染、按钮状态）
- 页面跳转（返回列表、跳转任务）
- localStorage 更新（消息已读状态）

**依赖**:
- auth-guard.js（鉴权）
- auth-state.js（用户数据、未读计数）
- message-service.js（消息操作）
- notification.js（提示）

---

#### C.3.3 auth-mock.js（重大修改）

**职责变更**:
- 新增：支持动态路径参数匹配（matchRoute 函数）
- 新增：提取路径参数（extractPathParams 函数）
- 修改：setupMockFetch 函数（使用动态匹配）
- 删除：MOCK_USERS 常量（统一使用 localStorage）
- 修改：所有 API handler 的 key 格式（{METHOD} /path）

**输入**:
- Fetch 请求（URL、method、body）

**输出**:
- Mock 响应对象

**依赖**:
- localStorage（读取用户数据）

---

### C.4 数据流图（用户资料编辑）

```
用户资料编辑数据流:
┌─────────────────────────────────────────────────┐
│ 1. 用户进入页面                                 │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 2. auth-guard.init() 鉴权检查                    │
│    ├─ 未登录 → 重定向到 login.html             │
│    └─ 已登录 → 继续                              │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 3. profile-edit-main.js 初始化                   │
│    ├─ 初始化共享布局 (shared-layout)            │
│    ├─ 读取来源参数 (from=overview)             │
│    ├─ 加载用户数据 (userService.getUserProfile())  │
│    └─ 初始化编辑器 (ProfileEditor page模式)     │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 4. 用户编辑表单                                   │
│    ├─ 表单验证 (form-validator)                │
│    ├─ 设置脏检查标志 (hasUnsavedChanges=true)   │
│    └─ 更新编辑器状态 (ProfileEditor)             │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 5. 用户点击保存                                   │
│    ├─ 显示加载状态                               │
│    ├─ 调用 userService.updateUserProfile()        │
│    ├─ 调用 auth-state.updateUser()               │
│    └─ 更新 localStorage (techcraft_user)          │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 6. 保存成功                                       │
│    ├─ 清除脏检查标志                             │
│    ├─ 移除离开拦截监听器                           │
│    ├─ 显示成功提示 (notification)                │
│    └─ 计算返回路径 (role=client, from=overview)  │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 7. 跳转回用户中心                                 │
│    └─ window.location.href = profile-client.html#overview │
└─────────────────────────────────────────────────┘
```

---

### C.5 数据流图（消息详情）

```
消息详情数据流:
┌─────────────────────────────────────────────────┐
│ 1. 用户点击消息列表中的消息                     │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 2. message-center.js 处理点击                   │
│    └─ 构造 URL: message-detail.html?id=msg-001   │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 3. 浏览器跳转到 message-detail.html?id=msg-001   │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 4. auth-guard.init() 鉴权检查                    │
│    ├─ 未登录 → 重定向到 login.html?redirect=...   │
│    └─ 已登录 → 继续                              │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 5. message-detail-main.js 初始化                  │
│    ├─ 初始化共享布局 (shared-layout)            │
│    ├─ 解析 URL 参数 (id=msg-001)                │
│    ├─ 调用 message-service.getMessageById(msg-001) │
│    └─ 渲染消息详情                               │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 6. 自动标记已读                                   │
│    ├─ 调用 message-service.markMessageRead(msg-001)│
│    ├─ 调用 auth-state.decrementUnreadCount()      │
│    └─ 更新 localStorage (techcraft_messages)       │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 7. 跨标签页同步                                   │
│    └─ localStorage.setItem('auth_update', ...)    │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 8. 用户点击删除消息                               │
│    ├─ 二次确认弹窗                               │
│    ├─ 调用 message-service.deleteMessage(msg-001) │
│    ├─ 调用 auth-state.decrementUnreadCount()      │
│    └─ 更新 localStorage (techcraft_messages)       │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ 9. 删除成功                                       │
│    ├─ 显示成功提示 (notification)                │
│    └─ 3秒后返回消息列表                           │
└─────────────────────────────────────────────────┘
```

---

## D. 文件级实施清单

### D.1 基础工作文件修改

#### D.1.1 assets/data/auth-mock.js

**动作**: 重大修改

**改动目的**:
1. 实现动态路径匹配机制
2. 删除 MOCK_USERS 常量
3. 修改所有 API handler 的 key 格式

**改动要点**:

**改动 1: 新增动态路径匹配函数**
- 文件位置：文件顶部，在现有常量定义之后
- 新增函数：matchRoute(mockKey, requestPath, requestMethod)
- 函数职责：将 pattern（如 `GET /api/messages/{id}`）转换为正则，匹配 requestPath
- 匹配逻辑：将 `{id}` 替换为 `[^/]+`，构造正则表达式

**改动 2: 新增路径参数提取函数**
- 文件位置：matchRoute 函数之后
- 新增函数：extractPathParams(pattern, pathname)
- 函数职责：从 pattern 和 pathname 中提取路径参数
- 提取逻辑：分割路径，逐段比对，提取 `{}` 包裹的参数名和值

**改动 3: 修改 setupMockFetch 函数**
- 文件位置：文件后半部分，setupMockFetch 函数定义
- 修改逻辑：不使用精确匹配，而是遍历 mockApiHandlers 查找匹配项
- 调用 matchRoute：对每个 handler 的 key 和请求路径进行匹配
- 调用 extractPathParams：提取路径参数并传递给 handler 函数

**改动 4: 修改所有 API handler 的 key 格式**
- 原格式：`pathname`（如 `/api/auth/login`）
- 新格式：`{METHOD} pathname`（如 `POST /api/auth/login`）
- 影响范围：所有 mockApiHandlers 对象的 key

**改动 5: 删除 MOCK_USERS 常量**
- 文件位置：文件开头的常量定义区域
- 删除内容：整个 MOCK_USERS 对象（包含用户数据的硬编码）
- 删除原因：统一使用 localStorage 作为数据源

**影响范围**: 
- 所有依赖 MOCK_USERS 的代码必须改为从 localStorage 读取
- auth-mock.js 内部的所有 handler 函数需要适配

**回归检查点**:
- 所有现有的 Mock API 调用仍然正常工作
- GET /api/auth/login 仍然能正确处理
- POST /api/auth/register 仍然能正确处理
- 动态路径 /api/messages/{id} 能正确匹配

---

#### D.1.2 assets/js/auth-service.js

**动作**: 修改（删除方法）

**改动目的**:
- 统一用户资料数据契约
- 删除与 user-service 重复的 updateProfile 方法

**改动要点**:

**改动 1: 删除 updateProfile() 方法**
- 文件位置：auth-service.js 文件中，找到 updateProfile 方法定义
- 删除内容：整个方法体（包括 JSDoc 注释和函数实现）
- 删除原因：避免与 user-service.updateUserProfile() 职责冲突

**影响范围**:
- 任何调用 auth-service.updateProfile() 的代码会报错
- 必须同步修改调用方，改为调用 user-service.updateUserProfile()

**回归检查点**:
- 检查整个代码库中是否有调用 auth-service.updateProfile() 的地方
- 重点检查 auth-state.js 的 onUpdateUser() 方法
- 确保所有调用都已改为调用 user-service

---

#### D.1.3 assets/js/auth-state.js

**动作**: 修改（新增方法 + 修改现有方法）

**改动目的**:
- 修改 onUpdateUser() 调用 user-service
- 新增 getCurrentUser() 方法
- 删除对 auth-service.updateProfile() 的依赖

**改动要点**:

**改动 1: 修改 onUpdateUser() 方法**
- 文件位置：auth-state.js 文件中，找到 onUpdateUser 方法定义
- 修改逻辑：将调用 `authService.updateProfile(updates)` 改为 `userService.updateUserProfile(updates)`
- 需要新增 import：在文件顶部导入 user-service

**改动 2: 新增 getCurrentUser() 方法**
- 文件位置：onUpdateUser() 方法之后，或与其他方法放在一起
- 方法签名：getCurrentUser()
- 方法逻辑：返回 this.currentUser
- 新增原因：账户安全页需要读取当前用户数据

**影响范围**:
- auth-state.js 现在依赖 user-service.js
- 需要在文件顶部添加 import 语句

**回归检查点**:
- 用户资料更新流程仍然正常工作
- 跨标签页资料更新同步仍然正常
- auth-state 初始化不会报错

---

#### D.1.4 assets/js/message-service.js

**动作**: 修改（实现状态持久化）

**改动目的**:
- 实现消息状态持久化到 localStorage
- 确保刷新后消息状态不丢失

**改动要点**:

**改动 1: 修改 _mockMarkMessageRead() 方法**
- 文件位置：message-service.js 文件中，找到 _mockMarkMessageRead 方法定义
- 新增逻辑：
  1. 从 localStorage 读取 `techcraft_messages`
  2. 解析 JSON，如果为空则初始化为空数组
  3. 查找对应 ID 的消息对象
  4. 如果找到，设置 isRead = true 和 readAt = 当前时间
  5. 将更新后的数组写回 localStorage
- 返回：{ success: true }

**改动 2: 修改 _mockDeleteMessage() 方法**
- 文件位置：message-service.js 文件中，找到 _mockDeleteMessage 方法定义
- 新增逻辑：
  1. 从 localStorage 读取 `techcraft_messages`
  2. 解析 JSON，如果为空则初始化为空数组
  3. 查找对应 ID 的消息对象
  4. 如果找到，设置 deletedAt = 当前时间（软删除）
  5. 将更新后的数组写回 localStorage
- 返回：{ success: true }

**改动 3: 新增 getMessageById() 方法**
- 文件位置：_mockDeleteMessage() 方法之后
- 方法签名：getMessageById(messageId)
- 方法逻辑：
  1. 从 localStorage 读取 `techcraft_messages`
  2. 解析 JSON
  3. 查找对应 ID 的消息对象
  4. 如果找到且未删除，返回消息对象
  5. 如果未找到或已删除，返回 null
- 返回：消息对象或 null

**改动 4: 新增 getAdjacentMessages() 方法**
- 文件位置：getMessageById() 方法之后
- 方法签名：getAdjacentMessages(currentMessageId)
- 方法逻辑：
  1. 调用 getMessages() 获取消息列表
  2. 从响应对象中提取 messages 数组（不是直接返回值）
  3. 按 createdAt 降序排序
  4. 找到当前消息的索引
  5. 返回 previous 和 next（可能为 null）

**影响范围**:
- 消息状态现在持久化到 localStorage
- 刷新页面后消息状态不会丢失
- 删除的消息在刷新后仍然显示为已删除

**回归检查点**:
- 消息列表页正常显示
- 消息详情页正常加载
- 标记已读后刷新页面，状态保持
- 删除消息后刷新页面，状态保持

---

#### D.1.5 assets/js/auth-guard.js

**动作**: 修改（新增配置）

**改动目的**:
- 为新增页面添加鉴权配置
- 支持未登录重定向和登录后返回

**改动要点**:

**改动 1: 在 PROTECTED_ROUTES 中新增 3 个页面配置**
- 文件位置：auth-guard.js 文件顶部，PROTECTED_ROUTES 常量定义
- 新增内容：
  - 'profile-edit.html': { authenticated: true, role: null, realNameStatus: null }
  - 'message-detail.html': { authenticated: true, role: null, realNameStatus: null }
  - 'security-settings.html': { authenticated: true, role: null, realNameStatus: null }
- 说明：role 为 null 表示两种角色都可以访问

**影响范围**:
- 未登录用户访问这 3 个页面会被重定向到登录页
- 重定向时会携带 redirect 参数，登录后自动返回

**回归检查点**:
- 现有的 protected-routes（profile-client.html、profile-developer.html）仍然正常工作
- 未登录重定向逻辑仍然正常工作
- 登录后返回逻辑仍然正常工作

---

### D.2 P0 功能新增文件

#### D.2.1 profile-edit.html（新增）

**动作**: 新增

**文件位置**: 项目根目录

**文件职责**:
- 用户资料编辑页面的 HTML 结构
- 包含表单元素（基本信息、角色专属字段）
- 包含导航（返回、保存、取消按钮）
- 包含头像上传区域

**DOM 结构**:
- 导航栏（通过 data-layout="navbar" 渲染）
- 主内容区（.profile-edit-container）
  - 页面头部（返回、标题、保存、取消按钮）
  - 表单区域（#profileEditForm）
    - 头像上传区域
    - 基本信息区域
    - 角色专属区域（客户/开发者）
- 页脚（通过 data-layout="footer" 渲染）

**依赖**:
- assets/css/profile.css（样式）
- assets/js/profile-edit-main.js（业务逻辑）
- assets/js/shared-layout.js（共享布局）

---

#### D.2.2 assets/js/profile-edit-main.js（新增）

**动作**: 新增

**文件位置**: assets/js/

**文件职责**:
- profile-edit.html 的主入口文件
- 页面初始化和鉴权
- 业务逻辑协调

**主要功能**:
- 初始化共享布局
- 注入 authState 到 window
- 调用 auth-guard.init() 检查权限
- 调用 userService.getUserProfile() 加载用户数据
- 初始化 ProfileEditor 组件（page 模式）
- 绑定页面事件（保存、取消、返回）
- 处理表单验证
- 处理保存成功后的跳转
- 处理浏览器级离开拦截

**依赖**:
- auth-guard.js（鉴权）
- auth-state.js（用户数据）
- user-service.js（资料更新）
- profile-editor.js（编辑组件）
- form-validator.js（表单验证）
- notification.js（提示）

---

#### D.2.3 message-detail.html（新增）

**动作**: 新增

**文件位置**: 项目根目录

**文件职责**:
- 消息详情页面的 HTML 结构
- 包含消息内容展示区域
- 包含快捷操作按钮
- 包含导航（返回、上一条、下一条）

**DOM 结构**:
- 导航栏（通过 data-layout="navbar" 渲染）
- 主内容区（.message-detail-container）
  - 页面头部（返回、标题、上一条、下一条、删除）
  - 消息元数据（图标、类型、时间）
  - 消息内容区域（.message-content，纯文本渲染）
  - 快捷操作区域
- 页脚（通过 data-layout="footer" 渲染）

**依赖**:
- assets/css/profile.css（样式）
- assets/js/message-detail-main.js（业务逻辑）
- assets/js/shared-layout.js（共享布局）

---

#### D.2.4 assets/js/message-detail-main.js（新增）

**动作**: 新增

**文件位置**: assets/js/

**文件职责**:
- message-detail.html 的主入口文件
- 页面初始化和鉴权
- 业务逻辑协调

**主要功能**:
- 初始化共享布局
- 注入 authState 到 window
- 调用 auth-guard.init() 检查权限
- 解析 URL 参数获取消息 ID
- 调用 message-service.getMessageById() 加载消息
- 调用 message-service.markMessageRead() 标记已读
- 调用 auth-state.decrementUnreadCount() 更新未读数
- 调用 message-service.getAdjacentMessages() 加载相邻消息
- 渲染消息详情（使用 textContent 避免 XSS）
- 绑定页面事件（删除、跳转任务、上一条、下一条、返回）
- 处理异常场景（消息不存在、已删除）

**依赖**:
- auth-guard.js（鉴权）
- auth-state.js（用户数据、未读计数）
- message-service.js（消息操作）
- notification.js（提示）

---

### D.3 P0 功能修改文件

#### D.3.1 profile-client.html

**动作**: 修改

**改动目的**:
- 将"编辑资料"按钮从打开模态框改为跳转到独立页面

**改动要点**:
- 文件位置：profile-client.html 中，"编辑资料"按钮的点击事件
- 原逻辑：打开模态框（调用 profile-editor.js 的 open() 方法）
- 新逻辑：跳转到 profile-edit.html（携带 from 参数）
- 修改方式：修改按钮的 data-action 或 onclick 属性

**影响范围**:
- 用户不再通过模态框编辑资料
- 所有资料编辑操作都在独立页面进行

---

#### D.3.2 profile-developer.html

**动作**: 修改

**改动目的**:
- 将"编辑资料"按钮从打开模态框改为跳转到独立页面

**改动要点**:
- 文件位置：profile-developer.html 中，"编辑资料"按钮的点击事件
- 原逻辑：打开模态框（调用 profile-editor.js 的 open() 方法）
- 新逻辑：跳转到 profile-edit.html（携带 from 参数）
- 修改方式：修改按钮的 data-action 或 onclick 属性

**影响范围**:
- 用户不再通过模态框编辑资料
- 所有资料编辑操作都在独立页面进行

---

#### D.3.3 assets/js/message-center.js

**动作**: 修改

**改动目的**:
- 将消息点击从直接跳转改为跳转到消息详情页

**改动要点**:
- 文件位置：message-center.js 中，消息列表项的点击事件处理
- 原逻辑：直接使用 actionUrl 跳转
- 新逻辑：跳转到 message-detail.html?id={messageId}
- 保留：如果消息已删除或不存在，显示提示

---

#### D.3.4 assets/css/profile.css

**动作**: 扩展

**改动目的**:
- 为 profile-edit.html 和 message-detail.html 提供样式支持

**改动要点**:
- 文件位置：profile.css 文件末尾
- 新增内容：
  - .profile-edit-container 样式
  - .message-detail-container 样式
  - 编辑表单样式
  - 消息详情内容样式
  - 空态样式
  - 加载状态样式

---

## E. 分阶段实施步骤

### E.1 阶段 A：闭合基础问题（Step A-1 至 A-6）

#### Step A-1: 实现动态路径匹配机制

**目标**: auth-mock.js 支持动态路径参数（如 `/api/messages/{id}`）

**具体改动点**:
- 文件：assets/data/auth-mock.js
- 改动 1：在文件顶部、现有常量定义之后，新增 matchRoute() 函数
- 改动 2：在 matchRoute() 之后，新增 extractPathParams() 函数
- 改动 3：修改 setupMockFetch() 函数，使用 matchRoute() 查找匹配的 handler
- 改动 4：修改所有 mockApiHandlers 的 key，从 pathname 格式改为 `{METHOD} pathname}` 格式

**前置依赖**:
- 无

**完成标志**:
- 动态路径匹配函数实现完成
- 所有现有 API 调用仍然正常工作
- 测试用例通过：GET /api/messages/msg-001 能正确匹配 handler

---

#### Step A-2: 统一用户资料数据契约

**目标**: 删除 auth-service.updateProfile()，统一使用 user-service.updateUserProfile()

**具体改动点**:
- 文件：assets/js/auth-service.js
- 改动 1：找到 updateProfile() 方法定义，删除整个方法
- 改动 2：检查文件中是否有其他地方引用 updateProfile

- 文件：assets/js/auth-state.js
- 改动 1：在文件顶部添加 import user-service 语句
- 改动 2：找到 onUpdateUser() 方法，修改调用逻辑
- 改动 3：测试 auth-state.js 中是否有其他地方调用 auth-service.updateProfile()

**前置依赖**:
- Step A-1（无）

**完成标志**:
- auth-service.updateProfile() 方法已删除
- auth-state.js 已改为调用 user-service
- 测试用例通过：用户资料更新流程正常工作

---

#### Step A-3: 实现消息状态持久化

**目标**: 消息已读和删除状态保存到 localStorage，刷新后不丢失

**具体改动点**:
- 文件：assets/js/message-service.js
- 改动 1：修改 _mockMarkMessageRead() 方法，实现状态持久化
- 改动 2：修改 _mockDeleteMessage() 方法，实现状态持久化
- 改动 3：新增 getMessageById() 方法
- 改动 4：新增 getAdjacentMessages() 方法，正确处理返回的消息数组

**前置依赖**:
- Step A-1（无）

**完成标志**:
- 消息状态能正确保存到 localStorage
- 刷新页面后消息状态保持
- 测试用例通过：标记已读、删除消息、刷新验证

---

#### Step A-4: 补充新页面鉴权配置

**目标**: 为 3 个新增页面添加鉴权配置

**具体改动点**:
- 文件：assets/js/auth-guard.js
- 改动 1：在 PROTECTED_ROUTES 常量中新增 3 个页面配置
- 改动 2：确认 auth-guard.js 的 init() 方法会检查这些新增路由

**前置依赖**:
- Step A-1（无）

**完成标志**:
- PROTECTED_ROUTES 包含新增的 3 个页面配置
- 测试用例通过：未登录访问新增页面被正确拦截

---

#### Step A-5: 明确单一事实源

**目标**: 删除 MOCK_USERS，统一使用 localStorage

**具体改动点**:
- 文件：assets/data/auth-mock.js
- 改动 1：删除 MOCK_USERS 常量定义
- 改动 2：检查 auth-mock.js 内部是否有代码依赖 MOCK_USERS
- 改动 3：如果有依赖，改为从 localStorage 读取

**前置依赖**:
- Step A-1（无）

**完成标志**:
- MOCK_USERS 已删除
- auth-mock.js 不再有硬编码的用户数据
- 测试用例通过：登录注册流程仍然正常工作

---

#### Step A-6: 补充 auth-state.js 缺失方法

**目标**: 新增 getCurrentUser() 方法

**具体改动点**:
- 文件：assets/js/auth-state.js
- 改动 1：在文件顶部添加 import user-service 语句
- 改动 2：在合适位置新增 getCurrentUser() 方法
- 改动 3：方法逻辑：返回 this.currentUser

**前置依赖**:
- Step A-2（已导入 user-service）

**完成标志**:
- getCurrentUser() 方法已添加
- 测试用例通过：账户安全页能读取当前用户数据

---

### E.2 阶段 B：实施 P0 功能（Step B-1 至 B-2）

#### Step B-1: 用户资料编辑页（独立页面）

**目标**: 创建 profile-edit.html 和 profile-edit-main.js，实现资料编辑功能

**具体改动点**:

**改动 1: 创建 profile-edit.html**
- 文件位置：项目根目录
- 文件内容：
  - HTML 基础结构（DOCTYPE、html、head、body）
  - 导入 CSS 文件（base.css、components.css、profile.css）
  - 导入 JS 文件（auth-mock.js、auth-config.js 等）
  - 导入 shared-layout.js（data-layout 属性）
  - 主内容区 DOM 结构
  - 表单元素（基本信息、角色专属字段）

**改动 2: 创建 profile-edit-main.js**
- 文件位置：assets/js/
- 文件内容：
  - 导入所有依赖模块
  - 实现 ProfileEditPage 类或初始化函数
  - 初始化共享布局
  - 调用 auth-guard.init() 检查权限
  - 加载用户数据（userService.getUserProfile）
  - 初始化 ProfileEditor 组件（page 模式）
  - 绑定事件（保存、取消、返回）
  - 实现浏览器级离开拦截（beforeunload）

**改动 3: 扩展 assets/css/profile.css**
- 文件位置：assets/css/
- 新增内容：
  - .profile-edit-container 样式
  - 编辑表单样式
  - 按钮样式
  - 空态和加载状态样式

**改动 4: 修改 profile-client.html 和 profile-developer.html**
- 改动 1：找到"编辑资料"按钮
- 改动 2：修改点击事件，从打开模态框改为跳转页面

**前置依赖**:
- 阶段 A 的所有 6 个步骤

**完成标志**:
- profile-edit.html 创建完成
- profile-edit-main.js 创建完成
- profile.css 扩展完成
- 用户中心页面链接修改完成
- 测试用例通过：资料编辑、保存、跳转、离开拦截

---

#### Step B-2: 消息详情页（只读版本）

**目标**: 创建 message-detail.html 和 message-detail-main.js，实现消息详情展示

**具体改动点**:

**改动 1: 创建 message-detail.html**
- 文件位置：项目根目录
- 文件内容：
  - HTML 基础结构
  - 导入 CSS 文件
  - 导入 JS 文件
  - 导入 shared-layout.js
  - 主内容区 DOM 结构
  - 消息内容区域（使用 textContent 渲染，避免 XSS）

**改动 2: 创建 message-detail-main.js**
- 文件位置：assets/js/
- 文件内容：
  - 导入所有依赖模块
  - 实现 MessageDetailPage 类或初始化函数
  - 初始化共享布局
  - 调用 auth-guard.init() 检查权限
  - 解析 URL 参数获取消息 ID
  - 调用 message-service.getMessageById() 加载消息
  - 调用 message-service.markMessageRead() 标记已读
  - 调用 auth-state.decrementUnreadCount() 更新未读数
  - 调用 message-service.getAdjacentMessages() 加载相邻消息
  - 渲染消息详情（textContent）
  - 绑定事件（删除、跳转任务、上一条、下一条、返回）
  - 处理异常场景

**改动 3: 扩展 assets/css/profile.css**
- 新增内容：
  - .message-detail-container 样式
  - 消息详情内容样式
  - 快捷操作按钮样式
  - 空态和加载状态样式

**改动 4: 修改 assets/js/message-service.js**
- 新增 getMessageById() 方法
- 新增 getAdjacentMessages() 方法

**改动 5: 修改 assets/js/message-center.js**
- 修改消息点击事件，从直接跳转改为跳转到详情页

**前置依赖**:
- 阶段 A 的所有 6 个步骤

**完成标志**:
- message-detail.html 创建完成
- message-detail-main.js 创建完成
- profile.css 扩展完成
- message-service.js 扩展完成
- message-center.js 修改完成
- 测试用例通过：消息详情展示、标记已读、删除、导航、异常处理

---

## F. 关键实现约束

### F.1 状态管理约束

#### F.1.1 单一事实源约束

**约束规则**:
- `auth-state.currentUser` 是用户数据的唯一事实源
- 所有 UI 组件只能读取 `auth-state.currentUser`，不能直接从 localStorage 读取
- 所有用户数据更新必须通过 `auth-state.updateUser()` 方法
- `user-service` 和 `message-service` 只是数据访问层，不持有状态

**实现要求**:
- profile-edit-main.js 读取用户数据时，调用 auth-state.currentUser
- message-detail-main.js 读取用户数据时，调用 auth-state.currentUser
- 不允许直接从 localStorage.techcraft_user 读取并渲染

---

#### F.1.2 状态同步约束

**约束规则**:
- 跨标签页同步通过 localStorage 实现
- 同步事件：auth_update（用户数据更新）、auth_logout（退出登录）
- 监听事件：storage 事件，检测 localStorage 变化

**实现要求**:
- auth-state.js 在 updateUser() 时，写入 localStorage.setItem('auth_update', ...)
- 其他标签页监听 storage 事件，同步更新 auth-state.currentUser
- 不允许使用轮询同步

---

### F.2 接口设计约束

#### F.2.1 Mock API 路由格式约束

**约束规则**:
- 所有 Mock API handler 的 key 必须使用 `{METHOD} pathname` 格式
- 示例：`POST /api/auth/login`、`GET /api/messages/{id}`

**实现要求**:
- 修改 auth-mock.js 中所有 mockApiHandlers 的 key
- 确保 setupMockFetch() 使用 matchRoute() 进行匹配

---

#### F.2.2 动态路径参数约束

**约束规则**:
- 动态路径使用 `{参数名}` 格式
- 示例：`/api/messages/{id}`、`/api/tasks/{taskId}/apply`

**实现要求**:
- matchRoute() 函数将 `{id}` 替换为正则 `[^/]+`
- extractPathParams() 函数提取参数值
- handler 函数接收 params 对象，包含所有路径参数

---

### F.3 组件拆分约束

#### F.3.1 ProfileEditor 组件拆分

**约束规则**:
- ProfileEditor 必须支持两种模式：modal（模态框）和 page（独立页面）
- 通过构造参数区分模式：`new EditableProfile(container, { mode: 'page' })`

**实现要求**:
- profile-editor.js 重构为 EditableProfile 类
- 构造函数接收 container 和 options 参数
- options.mode 决定渲染模式（modal 或 page）
- options.onSave 和 options.onCancel 为回调函数

**依赖关系**:
- profile-client.html 使用 modal 模式
- profile-developer.html 使用 modal 模式
- profile-edit.html 使用 page 模式

---

### F.4 命名与目录规范

#### F.4.1 文件命名规范

**约束规则**:
- HTML 文件：kebab-case（如 profile-edit.html）
- JS 文件：kebab-case（如 profile-edit-main.js）
- CSS 文件：kebab-case（如 profile.css）

**实现要求**:
- 新增文件必须遵循命名规范
- 修改文件时保持原有文件名

---

#### F.4.2 类命名规范

**约束规则**:
- 类名使用 PascalCase（如 EditableProfile、MessageDetailPage）
- 函数名使用 camelCase（如 getUserProfile、markMessageRead）

---

#### F.4.3 常量命名规范

**约束规则**:
- 常量使用 UPPER_SNAKE_CASE（如 USE_MOCK、API_ENDPOINTS）
- 对象属性使用 camelCase（如 currentUser、isRead）

---

### F.5 错误处理与边界处理要求

#### F.5.1 API 错误处理

**约束规则**:
- 所有 API 调用必须使用 try-catch 包裹
- 错误必须通过 notification.js 显示给用户
- 网络错误显示通用错误提示

**实现要求**:
```javascript
try {
    const response = await userService.updateUserProfile(updates);
    if (response.success) {
        notification.show('保存成功', 'success');
    }
} catch (error) {
    notification.show('保存失败，请稍后重试', 'error');
}
```

---

#### F.5.2 异常场景处理

**消息详情页异常场景**:
- 消息不存在：显示空态，3秒后返回列表
- 消息已删除：显示空态，3秒后返回列表
- 未登录：由 auth-guard 自动重定向
- 关联任务不存在：隐藏"前往任务"按钮

**资料编辑页异常场景**:
- 网络错误：显示错误提示，保持在编辑页
- 验证失败：显示字段级错误
- 保存失败：显示错误提示，保持在编辑页

---

## G. 风险、回归与测试建议

### G.1 风险点

#### G.1.1 高风险修改

**风险 1: auth-mock.js 重大修改**
- **风险描述**: 修改 Mock 路由机制影响所有 API 调用
- **影响面**: 所有依赖 Mock API 的功能
- **回归检查点**:
  - 登录流程
  - 注册流程
  - 用户资料更新流程
  - 消息列表加载
  - 现有的 profile-client.html 和 profile-developer.html 功能

**风险 2: auth-state.js 修改依赖**
- **风险描述**: 修改 onUpdateUser() 调用从 auth-service 改为 user-service
- **影响面**: 用户资料更新流程
- **回归检查点**:
  - 用户资料更新
  - 跨标签页资料同步
  - 保存成功后的跳转

**风险 3: message-service.js 新增方法
- **风险描述**: 新增 getMessageById() 和 getAdjacentMessages() 方法
- **影响面**: 消息详情页功能
- **回归检查点**:
  - 消息列表页正常显示
  - 消息列表页的标记已读功能

---

#### G.1.2 中风险修改

**风险 4: profile-editor.js 重构**
- **风险描述**: 将模态框组件重构为支持两种模式的类
- **影响面**: 用户中心的编辑资料功能
- **回归检查点**:
  - profile-client.html 中模态框打开/关闭
  - profile-developer.html 中模态框打开/关闭
  - 资料编辑保存功能

**风险 5: 新增 2 个 HTML 页面**
- **风险描述**: 新增 profile-edit.html 和 message-detail.html
- **影响面**: 导航和路由
- **回归检查点**:
  - 从用户中心跳转到编辑页
  - 从消息列表跳转到详情页
  - 返回路径正确

---

### G.2 易出错点

#### G.2.1 动态路径匹配实现

**易错点 1: 路径参数提取逻辑错误**
- **问题**: extractPathParams 函数提取参数时，路径分割逻辑可能有误
- **预防措施**:
  - 仔细测试多层路径（如 `/api/tasks/{taskId}/bids`）
  - 确保参数名正确提取

**易错点 2: 正则表达式转义错误**
- **问题**: 将 `{id}` 替换为正则时，可能忘记转义特殊字符
- **预防措施**:
  - 使用 `[^/]+` 而不是 `[^/]*`（避免贪婪匹配）
  - 测试包含特殊字符的路径

---

#### G.2.2 用户资料数据契约统一

**易错点 1: 遗漏调用方修改**
- **问题**: 删除 auth-service.updateProfile() 后，可能有其他地方仍在调用
- **预防措施**:
  - 全局搜索代码库，查找所有 updateProfile 调用
  - 确保所有调用都已修改

**易错点 2: auth-state.js 导入失败**
- **问题**: 添加 import user-service 后，可能存在循环依赖
- **预防措施**:
  - 确认 user-service.js 不依赖 auth-state.js
  - 测试页面加载时不报错

---

#### G.2.3 消息状态持久化实现

**易错点 1: localStorage 数据格式错误**
- **问题**: 保存到 localStorage 的数据格式不正确
- **预防措施**:
  - 使用 JSON.stringify() 序列化
  - 使用 JSON.parse() 反序列化
  - 添加 try-catch 处理 JSON 解析错误

**易错点 2: 消息删除是软删除**
- **问题**: 删除消息时只是设置 deletedAt，查询时需要过滤
- **预防措施**:
  - 所有查询消息的地方都要过滤 deletedAt
  - getMessages() 方法需要过滤已删除消息

---

### G.3 回归检查点

#### G.3.1 阶段 A 完成后的回归检查

**检查项 1: 动态路由功能**
- [ ] GET /api/messages/msg-001 能正确匹配 handler
- [ ] PUT /api/messages/msg-001/read 能正确匹配 handler
- [ ] DELETE /api/messages/msg-001 能正确匹配 handler
- [ ] 同一路径不同 method 的 handler 能正确区分

**检查项 2: 用户资料更新流程**
- [ ] 用户资料更新成功
- [ ] 更新后 auth-state.currentUser 同步
- [ ] 更新后 localStorage 数据同步
- [ ] 跨标签页资料更新同步

**检查项 3: 消息状态持久化**
- [ ] 标记已读后刷新页面，状态保持
- [ ] 删除消息后刷新页面，状态保持
- [ ] 消息列表页未读计数正确

**检查项 4: 页面鉴权**
- [ ] 未登录访问新增页面被拦截
- [ ] 登录后返回原页面

---

#### G.3.2 阶段 B 完成后的回归检查

**检查项 1: 用户资料编辑页**
- [ ] 页面能正常加载
- [ ] 用户数据正确显示
- [ ] 表单验证正常工作
- [ ] 保存功能正常
- [ ] 浏览器刷新时拦截提示
- [ ] 保存成功后返回用户中心

**检查项 2: 消息详情页**
- [ ] 页面能正常加载
- [ ] 消息内容正确显示（纯文本）
- [ ] 自动标记已读
- [ ] 未读计数正确更新
- [ ] 删除消息功能正常
- [ ] 上一条/下一条导航正常
- [ ] 异常场景正确处理

**检查项 3: 现有功能回归**
- [ ] 登录流程正常
- [ ] 注册流程正常
- [ ] 用户中心页面正常
- [ ] 消息列表页正常

---

### G.4 建议补充的测试

#### G.4.1 动态路径匹配测试

**测试用例**:
- [ ] GET /api/messages/msg-001 命中正确 handler
- [ ] PUT /api/messages/msg-001/read 命中正确 handler
- [ ] DELETE /api/messages/msg-001 命中正确 handler
- [ ] GET /api/auth/login 仍然正常工作（不受动态路由影响）
- [ ] POST /api/auth/register 仍然正常工作（不受动态路由影响）

---

#### G.4.2 跨标签页同步测试

**测试用例**:
- [ ] 标签页 A 更新资料后，标签页 B 的用户数据自动更新
- [ ] 标签页 A 标记消息已读后，标签页 B 的未读计数自动减少
- [ ] 标签页 A 退出登录后，标签页 B 也退出登录

---

#### G.4.3 安全测试

**测试用例**:
- [ ] 消息内容包含 `<script>alert(1)</script>` → 被转义为纯文本，不执行
- [ ] 消息内容包含 `<img src=x onerror=alert(1)>` → 被转义为纯文本，不执行
- [ ] 用户输入包含 `<` 或 `>` → 被正确转义或拒绝

---

## H. 最终交付清单

### H.1 可见成果

#### H.1.1 新增文件（10个）

**HTML 页面**:
- [ ] profile-edit.html
- [ ] message-detail.html

**JavaScript 文件**:
- [ ] assets/js/profile-edit-main.js
- [ ] assets/js/message-detail-main.js

**修改文件**:
- [ ] assets/data/auth-mock.js（重大修改）
- [ ] assets/js/auth-service.js（删除方法）
- [ ] assets/js/auth-state.js（新增方法 + 修改依赖）
- [ ] assets/js/message-service.js（新增方法）
- [ ] assets/js/auth-guard.js（新增配置）
- [ ] profile-client.html（修改链接）
- [ ] profile-developer.html（修改链接）
- [ ] assets/js/message-center.js（修改点击事件）
- [ ] assets/css/profile.css（扩展样式）

---

#### H.1.2 功能模块

**功能模块 1: 用户资料编辑页（独立页面）**
- [ ] 页面能正常加载和渲染
- [ ] 用户数据正确加载和显示
- [ ] 表单验证和错误提示正常
- [ ] 保存功能正常
- [ ] 浏览器级离开拦截生效
- [ ] 保存成功后返回用户中心

**功能模块 2: 消息详情页（只读版本）**
- [ ] 页面能正常加载和渲染
- [ ] 消息详情正确显示（纯文本，无 XSS 风险）
- [ ] 自动标记已读
- [ ] 未读计数正确更新
- [ ] 跨标签页同步正常
- [ ] 删除功能正常
- [ ] 上一条/下一条导航正常
- [ ] 异常场景正确处理

**基础架构改进**:
- [ ] Mock API 支持动态路径参数
- [ ] 用户资料数据契约统一
- [ ] 消息状态持久化到 localStorage
- [ ] 新增页面鉴权配置
- [ ] 单一事实源建立（auth-state.currentUser）

---

### H.2 应该存在的文件

**根目录**:
- [ ] index.html（已存在）
- [ ] login.html（已存在）
- [ ] register.html（已存在）
- [ ] profile-client.html（已存在）
- [ ] profile-developer.html（已存在）
- [ ] profile-edit.html（新增）
- [ ] message-detail.html（新增）

**assets/css/**:
- [ ] base.css（已存在）
- [ ] components.css（已存在）
- [ ] profile.css（已存在，已扩展）

**assets/js/**:
- [ ] auth-config.js（已存在）
- [ ] auth-state.js（已存在，已修改）
- [ ] auth-storage.js（已存在）
- [ ] auth-service.js（已存在，已删除方法）
- [ ] auth-guard.js（已存在，已扩展）
- [ ] http-client.js（已存在）
- [ ] user-service.js（已存在）
- [ ] message-service.js（已存在，已扩展）
- [ ] form-validator.js（已存在）
- [ ] notification.js（已存在）
- [ ] shared-layout.js（已存在）
- [ ] verification-code.js（已存在）
- [ ] profile-editor.js（已存在）
- [ ] profile-client-main.js（已存在）
- [ ] profile-developer-main.js（已存在）
- [ ] profile-edit-main.js（新增）
- [ ] message-detail-main.js（新增）

**assets/data/**:
- [ ] auth-mock.js（已存在，重大修改）
- [ ] tasks.mock.json（已存在）
- [ ] auth-mock.js（已存在）

---

### H.3 应该可以跑通的流程

#### H.3.1 用户资料编辑流程

**流程 1: 从用户中心进入编辑页**
1. 用户在 profile-client.html 点击"编辑资料"按钮
2. 页面跳转到 profile-edit.html?from=overview
3. auth-guard.js 检查登录状态，未登录则重定向到登录页
4. profile-edit-main.js 初始化，加载用户数据
5. 页面渲染，表单填充当前用户数据
6. 用户编辑表单
7. 用户点击"保存"按钮
8. 表单验证，数据更新
9. 保存成功后返回 profile-client.html#overview

**流程 2: 浏览器刷新拦截**
1. 用户编辑表单，有未保存修改
2. 用户尝试刷新页面
3. 浏览器弹出确认提示："您有未保存的修改，确定要离开吗？"
4. 用户确认后离开，数据丢失；用户取消后保持在页面

**流程 3: 开发者编辑资料**
1. 开发者在 profile-developer.html 点击"编辑资料"按钮
2. 页面跳转到 profile-edit.html?from=overview
3. 加载开发者用户数据
4. 显示开发者专属字段（技能标签）
5. 保存后返回 profile-developer.html#overview

---

#### H.3.2 消息详情查看流程

**流程 1: 从消息列表进入详情页**
1. 用户在 profile-client.html#messages 查看消息列表
2. 用户点击某条消息
3. 页面跳转到 message-detail.html?id=msg-001
4. auth-guard.js 检查登录状态，未登录则重定向到登录页
5. message-detail-main.js 初始化，加载消息详情
6. 自动标记消息为已读
7. 更新 auth-state 的未读计数
8. 跨标签页同步：其他标签页的未读计数自动减少
9. 页面渲染消息详情（纯文本）

**流程 2: 查看相邻消息**
1. 用户在消息详情页点击"下一条"按钮
2. 调用 message-service.getAdjacentMessages() 获取相邻消息
3. 如果有下一条，按钮高亮，点击后加载下一条消息
4. 如果没有下一条，按钮置灰

**流程 3: 删除消息**
1. 用户在消息详情页点击"删除"按钮
2. 浏览器弹出确认提示："确定要删除这条消息吗？"
3. 用户确认后，调用 message-service.deleteMessage()
4. 更新 auth-state 的未读计数
5. 跨标签页同步：其他标签页的未读计数自动减少
6. 显示删除成功提示
7. 3秒后返回消息列表

**流程 4: 消息不存在**
1. 用户通过深链访问 message-detail.html?id=msg-999
2. message-service.getMessageById() 返回 null
3. 页面显示空态："消息不存在或已删除"
4. 3秒后自动返回消息列表

---

#### H.3.3 基础架构改进流程

**流程 1: 动态路由测试**
1. 开发者在代码中调用 fetch('/api/messages/msg-001')
2. auth-mock.js 的 setupMockFetch 拦截请求
3. matchRoute() 匹配到 `GET /api/messages/{id}` handler
4. extractPathParams() 提取参数 { id: 'msg-001' }
5. 调用对应的 handler 函数，传入 params
6. 返回 Mock 响应

**流程 2: 用户资料更新流程**
1. 用户在 profile-edit.html 点击"保存"
2. profile-edit-main.js 调用 userService.updateUserProfile()
3. user-service 调用 auth-state.updateUser()
4. auth-state 更新 currentUser 和 localStorage
5. 跨标签页同步：通过 localStorage 通知其他标签页
6. 显示成功提示

---

## 附录：图示索引

### 图 1: 整体架构分层图

**人读版**: 参见 C.1 节

**AI 友好版**:
```
架构分层结构:
├─[用户界面层]
├─[业务逻辑层]
├─[服务层]
├─[状态管理层]
├─[持久化层]
├─[路由守卫层]
└─[Mock层]
```

---

### 图 2: 数据流向图（用户资料编辑）

**人读版**: 参见 C.4 节

**AI 友好版**:
```
数据流向（用户资料编辑）:
起点:用户输入
环节1:profile-edit-main.js
环节2:user-service.js
环节3:auth-state.js
环节4:localStorage
终点:数据持久化
```

---

### 图 3: 数据流向图（消息详情）

**人读版**: 参见 C.5 节

**AI 友好版**:
```
数据流向（消息详情）:
起点:URL参数
环节1:message-detail-main.js
环节2:message-service.js
环节3:localStorage
环节4:auth-state.js
终点:跨标签页同步
```

---

### 图 4: 模块依赖关系图

**人读版**: 参见 C.3 节

**AI 友好版**:
```
依赖关系（profile-edit-main.js）:
依赖→auth-guard.js
依赖→auth-state.js
依赖→user-service.js
依赖→profile-editor.js
依赖→form-validator.js
依赖→notification.js
```

---

### 图 5: 实施步骤流程图

**人读版**:
```
阶段 A（基础问题）:
Step A-1 → Step A-2 → Step A-3 → Step A-4 → Step A-5 → Step A-6

阶段 B（P0 功能）:
Step B-1（用户资料编辑页）
Step B-2（消息详情页）
```

**AI 友好版**:
```
实施步骤流程:
阶段A基础问题:
└─StepA-1:实现动态路径匹配机制
└─StepA-2:统一用户资料数据契约
└─StepA-3:实现消息状态持久化
└─StepA-4:补充新页面鉴权配置
└─StepA-5:明确单一事实源
└─StepA-6:补充auth-state.js缺失方法

阶段B P0功能:
└─StepB-1:用户资料编辑页独立页面
└─StepB-2:消息详情页只读版本
```

---

*文档结束*

**文档版本**: v1.0
**创建日期**: 2026-04-13
**最后更新**: 2026-04-13
**状态**: 准备就绪，可进入编码阶段
