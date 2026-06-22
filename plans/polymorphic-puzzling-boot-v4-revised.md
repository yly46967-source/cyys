# TechCraft 认证功能完善方案 - v4.0 修订版

## 文档信息

**版本**: v4.0（修订版）
**修订日期**: 2026-04-13
**修订人**: AI Assistant
**修订原因**: 根据第二轮技术评审意见进行深度修订
**文档状态**: 🟡 修订版（仍需闭合基础问题，不建议直接进入实施）

---

## ⚠️ 重要说明

本文档是对认证功能完善方案的第三轮修订。虽然已采纳前两轮评审的大部分意见，但**仍存在以下未闭合的基础问题**，不建议直接进入实施：

### 🚨 待闭合的基础问题

1. **Mock 动态路由** - 需要实现支持路径参数的匹配机制
2. **资料更新与认证状态同步** - 需要定义迁移路径和测试
3. **消息状态持久化与新页面鉴权** - 需要实现状态持久化
4. **富文本与安全状态模型** - 需要降级为纯文本或实现消毒方案

### 📋 建议实施策略

**阶段 A：闭合基础问题**（建议优先完成）
- [ ] 实现动态路径匹配机制
- [ ] 定义资料更新链路的唯一入口
- [ ] 实现消息状态持久化
- [ ] 补充新页面鉴权配置
- [ ] 完成关键测试用例

**阶段 B：实施 P0 功能**（基础问题闭合后）
- [ ] 用户资料编辑页（独立页面）
- [ ] 消息详情页（只读版本）

---

## 第一部分：第三轮评审意见回应

### 一、理解错误的需求（1-3条）

#### ✅ 问题1：把"已采纳评审意见"当成"已具备可实施方案"

**回应**：✅ 完全采纳

**修改措施**：
1. 撤销"最终版，可进入实施阶段"结论
2. 在文档开头明确标注"待闭合的基础问题"
3. 提供分阶段实施建议

---

#### ✅ 问题2："暂停密码功能"与文档实现假设不一致

**回应**：✅ 完全采纳

**修改措施**：
1. 删除所有密码相关的代码示例
2. 在"暂停的功能"章节明确标注："以下功能暂停，文档中不提供实现示例"
3. 移除边界条件中依赖不存在 API 的示例

---

#### ✅ 问题3：账户安全页数据模型未闭合

**回应**：✅ 完全采纳

**修改措施**：
1. 重新设计数据来源：从 `localStorage` 读取（不假设新 API）
2. 只使用已存在的存储方式
3. 提供可执行的示例代码

---

### 二、遗漏的边界条件（4-6条）

#### ✅ 问题4：新增页面鉴权未纳入实施清单

**回应**：✅ 完全采纳

**修改措施**：
1. 在文件改动清单中新增：修改 `assets/js/auth-guard.js`
2. 添加 `PROTECTED_ROUTES` 配置
3. 补充鉴权测试用例

---

#### ✅ 问题5：返回路径写死，缺乏上下文

**回应**：✅ 完全采纳

**修改措施**：
1. 实现动态返回路径（基于角色和来源）
2. 在进入编辑页时保存来源上下文
3. 支持返回到原 section

---

#### ✅ 问题6：离开拦截未覆盖站内导航

**回应**：✅ 部分采纳

**修改措施**：
1. 扩展拦截范围：监听站内导航点击事件
2. 提供统一的 `confirmIfUnsaved()` 方法
3. 或者采用更简单的方案：只在页面级离开时拦截

---

### 三、可能导致返工的设计问题（7-13条）

#### ✅ 问题7：Mock 路由无法支持动态路径

**回应**：✅ 完全采纳

**修改措施**：
实现动态路径匹配机制，支持 `/api/messages/{id}` 等路径

---

#### ✅ 问题8：`getAdjacentMessages()` 示例有 bug

**回应**：✅ 完全采纳

**修改措施**：
修正示例代码，正确处理返回的消息数组

---

#### ✅ 问题9：账户安全页 Mock 示例不可执行

**回应**：✅ 完全采纳

**修改措施**：
从 localStorage 读取数据，不假设 `authState.getCurrentUser()`

---

#### ✅ 问题10：删除 `updateProfile()` 的迁移路径未闭合

**回应**：✅ 完全采纳

**修改措施**：
1. 在文件改动清单中新增：修改 `assets/js/auth-state.js`
2. 定义迁移策略
3. 补充测试

---

#### ✅ 问题11：消息状态持久化方案缺失

**回应**：✅ 完全采纳

**修改措施**：
1. 实现消息状态持久化到 localStorage
2. 定义唯一数据源
3. 补充测试

---

#### ✅ 问题12：`pushState + popstate` 方案是 hack

**回应**：✅ 完全采纳

**修改措施**：
采用更简单的方案：只在 `beforeunload` 时提示，不使用 `pushState` 拦截

---

#### ✅ 问题13：文档编号和排期不一致

**回应**：✅ 完全采纳

**修改措施**：
1. 统一编号：基础工作 0.1-0.6
2. 修正开发排期
3. 边界条件归入基础工作 0.5

---

### 四、测试不足（14-17条）

#### ✅ 问题14-17：缺少关键测试

**回应**：✅ 完全采纳

**修改措施**：
在第6章补充：
- 动态路径匹配测试
- 新增页面鉴权/深链/登录回跳测试
- 资料更新链路迁移测试
- 富文本安全测试

---

### 五、性能/安全/维护性问题（18-20条）

#### ✅ 问题18：富文本 XSS 风险

**回应**：✅ 完全采纳

**修改措施**：
**采用方案A：降级为纯文本**
- 消息内容使用 `textContent` 渲染
- 不支持富文本
- 在需求中明确说明

---

#### ✅ 问题19：单一事实源未建立

**回应**：✅ 完全采纳

**修改措施**：
1. 明确 `auth-state.currentUser` 为唯一事实源
2. 定义数据流向：UI → user-service → auth-state → localStorage
3. 删除冗余数据源

---

#### ✅ 问题20：消息轮询问题未解决

**回应**：✅ 完全采纳

**修改措施**：
1. 只在消息 section 可见时启动轮询
2. 离开消息 section 时停止轮询
3. 页面卸载时清理定时器

---

## 第二部分：修订后的完整方案

### 第0章：前置基础工作（必须先完成）

#### 基础工作 0.1：实现动态路径匹配机制 ⚠️ **核心问题**

**问题**: 现有 Mock 路由只支持精确匹配，无法支持 `/api/messages/{id}` 等动态路径。

**解决方案**:

```javascript
// assets/data/auth-mock.js
function matchRoute(mockKey, requestPath, requestMethod) {
    const [method, pattern] = mockKey.split(' ');
    
    // 将 pattern 转换为正则
    // /api/messages/{id} -> /^\/api\/messages\/[^/]+$/
    const regexPattern = pattern.replace(/\{[^}]+\}/g, '[^/]+');
    const regex = new RegExp('^' + regexPattern + '$');
    
    return regex.test(requestPath) && method === requestMethod;
}

function setupMockFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async function(url, options = {}) {
        const method = options.method || 'GET';
        const pathname = new URL(url, window.location.origin).pathname;
        
        // 查找匹配的 handler
        const handler = Object.entries(mockApiHandlers).find(([key]) => 
            matchRoute(key, pathname, method)
        );
        
        if (handler) {
            const [, handlerFn] = handler;
            // 提取路径参数
            const params = extractPathParams(handler[0], pathname);
            const response = handlerFn(params);
            return mockResponse(response);
        }
        
        return originalFetch(url, options);
    };
}

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
```

**需要修改的文件**:
- `assets/data/auth-mock.js` - 实现动态路径匹配

---

#### 基础工作 0.2：统一用户资料数据契约

**问题**: 用户资料存在两套契约（auth-service vs user-service）。

**解决方案**:

以 **user-service + extension** 模型为唯一数据契约，删除 `auth-service.updateProfile()`。

**迁移策略**:

```javascript
// assets/js/auth-state.js - 修改
onUpdateUser(updates) {
    // 旧版本：authService.updateProfile(updates)
    // 新版本：userService.updateUserProfile(updates)
    return userService.updateUserProfile(updates);
}
```

**需要修改的文件**:
- `assets/js/auth-service.js` - 删除 `updateProfile()` 方法
- `assets/js/auth-state.js` - 修改 `onUpdateUser()` 调用 `userService`
- `assets/data/auth-mock.js` - 统一使用 extension 模型

---

#### 基础工作 0.3：实现消息状态持久化

**问题**: 消息状态（已读、删除）未持久化，刷新后丢失。

**解决方案**:

```javascript
// assets/js/message-service.js - 修改
_mockMarkMessageRead(messageId) {
    const stored = localStorage.getItem('techcraft_messages');
    const messages = stored ? JSON.parse(stored) : [];
    const msg = messages.find(m => m.id === messageId);
    
    if (msg) {
        msg.isRead = true;
        msg.readAt = new Date().toISOString();
        localStorage.setItem('techcraft_messages', JSON.stringify(messages));
    }
    
    return { success: true };
}

_mockDeleteMessage(messageId) {
    const stored = localStorage.getItem('techcraft_messages');
    const messages = stored ? JSON.parse(stored) : [];
    const index = messages.findIndex(m => m.id === messageId);
    
    if (index !== -1) {
        messages[index].deletedAt = new Date().toISOString();
        localStorage.setItem('techcraft_messages', JSON.stringify(messages));
    }
    
    return { success: true };
}
```

**需要修改的文件**:
- `assets/js/message-service.js` - 实现状态持久化

---

#### 基础工作 0.4：补充新页面鉴权配置

**问题**: 新增页面的鉴权范围未纳入 `auth-guard.js`。

**解决方案**:

```javascript
// assets/js/auth-guard.js - 新增
const PROTECTED_ROUTES = {
    // ... 现有配置
    
    // 新增页面鉴权
    'profile-edit.html': {
        authenticated: true,
        role: null,  // 两种角色都可以访问
        realNameStatus: null
    },
    'message-detail.html': {
        authenticated: true,
        role: null,
        realNameStatus: null
    },
    'security-settings.html': {
        authenticated: true,
        role: null,
        realNameStatus: null
    }
};
```

**需要修改的文件**:
- `assets/js/auth-guard.js` - 添加新页面鉴权配置

---

#### 基础工作 0.5：定义边界条件和异常态

**问题**: 多处边界条件和异常场景未定义。

**解决方案**:

在第3章详细定义：
- 消息详情页的异常态行为
- 资料编辑页的离开拦截策略
- 账户安全页的空态和失败态

---

#### 基础工作 0.6：明确单一事实源

**问题**: 数据源分散，存在三套数据来源。

**解决方案**:

**明确数据归属**:
- **唯一事实源**: `auth-state.currentUser`
- **数据访问层**: `user-service`、`message-service`
- **持久化层**: `localStorage`

**数据流向**:
```
UI 组件
   ↓
user-service / message-service (数据访问)
   ↓
auth-state (状态管理 + 缓存)
   ↓
localStorage (持久化)
```

**需要修改的文件**:
- 删除 `auth-mock.js` 的 `MOCK_USERS`
- 统一使用 `localStorage`

---

### 第1章：需求理解（修订版）

#### 1.1 暂停的功能（需先完成基础工作）

##### 1.1.1 忘记密码/重置密码功能 - **暂停** ⏸️

**原因**: 
1. 需先完成基础工作 0.1（动态路由）
2. 需明确定码在产品中的定位
3. 需定义账号存在性暴露策略

**说明**: 本文档不提供实现示例，仅记录需求。

---

##### 1.1.2 修改密码功能 - **暂停** ⏸️

**原因**:
1. 需明确定码在产品中的定位
2. 需实现真正的密码持久化
3. 需定义会话处置策略

**说明**: 本文档不提供实现示例，仅记录需求。

---

#### 1.2 优先实现功能（P0）

##### 1.2.1 用户资料编辑页（独立页面）- **P0**

**功能范围**:
- ✅ 基本信息编辑（姓名、简介、地区、个人网站）
- ✅ 头像上传和预览
- ✅ 技能标签管理（开发者）
- ✅ 公司信息编辑（客户）
- ✅ 表单验证和错误提示
- ✅ 浏览器级离开拦截（刷新、关闭、后退）
- ❌ 不包含密码修改
- ❌ 不包含手机号更换

**与现有功能关联**:
- 基于 `user-service.updateUserProfile()` API
- 复用 `profile-editor.js` 核心逻辑（需先解耦）
- 使用 `form-validator.js` 表单验证

---

##### 1.2.2 消息详情页（只读版本）- **P0**

**功能范围**:
- ✅ 消息完整内容展示（纯文本，不支持富文本）
- ✅ 消息元数据（时间、类型、图标）
- ✅ 快捷操作（标记已读、删除、跳转关联任务）
- ✅ 上一条/下一条导航
- ✅ 自动标记已读并同步未读计数
- ❌ 不包含回复功能
- ❌ 不包含富文本内容

**与现有功能关联**:
- 复用 `message-service.js` API
- 复用 `message-center.js` 消息模型
- 新增 `getMessageById()` 和 `getAdjacentMessages()` 方法

---

#### 1.3 延后实现功能（P1）

##### 1.3.1 账户安全设置页（最小版本）- **P1**

**功能范围**:
- ✅ 安全状态概览（只读展示，从 localStorage 读取）
- ✅ 快捷操作入口（卡片形式）
- ✅ 安全提示（静态内容）
- ❌ 不包含登录设备管理
- ❌ 不包含安全日志
- ❌ 不包含更换手机号

---

### 第2章：技术方案（核心修订）

#### 2.1 核心技术决策

**决策1：富文本内容处理**

**采用方案A：降级为纯文本**
- 消息内容使用 `textContent` 渲染
- 不支持富文本
- 避免 XSS 风险

**原因**: 本版不实现富文本消毒方案，为降低安全风险，降级为纯文本。

---

**决策2：返回路径策略**

**采用动态返回路径**:
```javascript
const user = authState.currentUser;
const role = user?.role || 'client';
const from = urlParams.get('from') || 'overview';
window.location.href = `profile-${role}.html#${from}`;
```

---

**决策3：离开拦截策略**

**采用简化方案**:
- 只在 `beforeunload` 时拦截（刷新、关闭标签页）
- 不拦截站内导航
- 不使用 `pushState` 拦截后退

---

#### 2.2 用户资料编辑页（修订版）

**返回路径**:
```javascript
// 保存成功后返回
const user = authState.currentUser;
const role = user?.role || 'client';
const from = sessionStorage.getItem('profile_edit_from') || 'overview';
sessionStorage.removeItem('profile_edit_from');
window.location.href = `profile-${role}.html#${from}`;
```

**进入时保存来源**:
```javascript
// profile-edit.html 页面初始化时
const urlParams = new URLSearchParams(window.location.search);
const from = urlParams.get('from') || 'overview';
sessionStorage.setItem('profile_edit_from', from);
```

---

#### 2.3 消息详情页（修订版）

**数据模型（纯文本）**:
```javascript
{
    id: string,
    type: 'system' | 'task',
    title: string,
    content: string,  // 纯文本，不支持富文本
    icon: string,
    actionLabel: string,
    actionUrl: string,
    isRead: boolean,
    createdAt: string,
    deletedAt: string | null
}
```

**安全渲染**:
```javascript
// 使用 textContent 避免 XSS
const contentElement = document.querySelector('.message-content');
contentElement.textContent = this.message.content;
```

---

### 第3章：边界条件定义

#### 3.1 消息详情页异常态

| 场景 | 处理方式 |
|------|---------|
| 消息不存在 | 显示空态，3秒后返回列表 |
| 消息已删除 | 显示空态，3秒后返回列表 |
| 未登录 | auth-guard 自动重定向 |
| 关联任务不存在 | 隐藏"前往任务"按钮 |
| 没有上一条/下一条 | 对应按钮置灰 |

---

#### 3.2 资料编辑页离开拦截

**拦截场景**:
- 浏览器刷新按钮
- 关闭标签页
- 不拦截：站内导航、后退按钮

**实现**:
```javascript
window.addEventListener('beforeunload', (e) => {
    if (this.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未保存的修改，确定要离开吗？';
    }
});
```

---

#### 3.3 账户安全页空态和失败态

**空态定义**:
- 未绑定手机：显示"未绑定"状态
- 无设备数据：隐藏相关卡片（本版不实现）
- 接口不存在：显示静态安全提示

**失败态定义**:
- 接口超时：显示默认安全状态
- 接口 401：重定向到登录页
- 接口 403：显示"无权限访问"

---

### 第4章：文件改动清单（修订版）

#### 4.1 基础工作文件修改

| 文件路径 | 修改内容 | 优先级 |
|---------|---------|-------|
| `assets/data/auth-mock.js` | 实现动态路径匹配机制 | P0 |
| `assets/data/auth-mock.js` | 删除 MOCK_USERS，统一使用 localStorage | P0 |
| `assets/js/auth-service.js` | 删除 updateProfile() 方法 | P0 |
| `assets/js/auth-state.js` | 修改 onUpdateUser() 调用 userService | P0 |
| `assets/js/message-service.js` | 实现消息状态持久化 | P0 |
| `assets/js/auth-guard.js` | 添加新页面鉴权配置 | P0 |

---

#### 4.2 P0 功能文件改动

**新增文件（4个）**:
- `profile-edit.html`
- `assets/js/profile-edit-main.js`
- `message-detail.html`
- `assets/js/message-detail-main.js`

**修改文件（6个）**:
- `profile-client.html` - "编辑资料"改为跳转到独立页面
- `profile-developer.html` - "编辑资料"改为跳转到独立页面
- `assets/js/message-center.js` - 消息点击改为跳转到详情页
- `assets/js/message-service.js` - 新增 getMessageById() 和 getAdjacentMessages()
- `assets/css/profile.css` - 扩展样式
- `assets/data/auth-mock.js` - 新增动态路由 Mock

---

#### 4.3 P1 功能文件改动（延后）

**新增文件（2个）**:
- `security-settings.html`
- `assets/js/security-settings-main.js`

---

### 第5章：测试策略（修订版）

#### 5.1 基础工作测试

**动态路径匹配测试**:
- [ ] `GET /api/messages/msg-001` 命中正确 handler
- [ ] `PUT /api/messages/msg-001/read` 命中正确 handler
- [ ] `DELETE /api/messages/msg-001` 命中正确 handler
- [ ] 同一路径不同 method 的 handler 命中正确

**资料更新链路测试**:
- [ ] 删除 `auth-service.updateProfile()` 后 auth-state 正常工作
- [ ] 用户资料更新后跨标签页同步
- [ ] localStorage 数据正确持久化

---

#### 5.2 P0 功能测试

**用户资料编辑页测试**:
- [ ] 正常保存流程
- [ ] 浏览器刷新时拦截提示
- [ ] 关闭标签页时拦截提示
- [ ] 返回路径正确（基于角色和来源）
- [ ] 深链进入编辑页

**消息详情页测试**:
- [ ] 消息展示（纯文本，无 XSS）
- [ ] 自动标记已读
- [ ] 未读计数同步（跨标签页）
- [ ] 删除消息
- [ ] 上一条/下一条导航
- [ ] 异常场景处理
- [ ] 深链鉴权

---

#### 5.3 安全测试

**XSS 防护测试**:
- [ ] 消息内容包含 HTML 标签 → 被转义为纯文本
- [ ] 消息内容包含脚本片段 → 不被执行
- [ ] 用户输入包含危险字符 → 被正确处理

---

### 第6章：开发顺序（修订版）

**阶段 A：闭合基础问题**（约 5-7 天）

```
Day 1-2: 基础工作 0.1 + 0.2
  - 实现动态路径匹配机制
  - 统一用户资料数据契约
  - 测试所有现有 API

Day 3-4: 基础工作 0.3 + 0.4
  - 实现消息状态持久化
  - 补充新页面鉴权配置
  - 测试鉴权流程

Day 5-6: 基础工作 0.5 + 0.6
  - 定义边界条件和异常态
  - 明确单一事实源
  - 完成关键测试用例

Day 7: 验证和调整
  - 全流程测试
  - Bug 修复
```

**阶段 B：实施 P0 功能**（约 5-7 天）

```
Day 1-3: 用户资料编辑页
  - profile-edit.html + CSS
  - profile-edit-main.js 业务逻辑
  - 集成测试

Day 4-5: 消息详情页
  - message-detail.html + CSS
  - message-detail-main.js + message-service 扩展
  - 集成测试

Day 6-7: 集成测试和修复
  - 全流程测试
  - 安全测试
  - Bug 修复
```

---

## 第三部分：总结

### 核心修订点

1. **撤销"最终版"结论** - 明确标注为"修订版（仍需闭合基础问题）"

2. **实现动态路径匹配** - 支持 `/api/messages/{id}` 等动态路由

3. **删除不可执行的示例** - 移除所有调用不存在 API 的代码

4. **实现消息状态持久化** - 消息已读状态保存到 localStorage

5. **补充新页面鉴权** - 在 auth-guard.js 中添加新页面配置

6. **降级为纯文本** - 消息内容不支持富文本，避免 XSS 风险

7. **明确单一事实源** - auth-state.currentUser 为唯一事实源

8. **简化返回路径** - 基于角色和来源动态计算

9. **简化离开拦截** - 只在 beforeunload 时拦截，不使用 pushState

10. **完善测试清单** - 补充动态路径、鉴权、安全等测试

---

## 文档版本历史

| 版本 | 日期 | 修订内容 | 状态 |
|------|------|---------|------|
| v1.0 | 2026-04-13 | 初始版本 | 已废弃 |
| v2.0 | 2026-04-13 | 第一次修订 | 已废弃 |
| v3.0 | 2026-04-13 | 第二次修订 | 已废弃 |
| v4.0 | 2026-04-13 | 第三次修订（本轮） | 🟡 仍需闭合基础问题 |

---

*文档版本: v4.0*
*修订日期: 2026-04-13*
*文档状态: 🟡 修订版（仍需闭合基础问题，不建议直接进入实施）*
*下一步: 完成"阶段 A：闭合基础问题"后再进入实施阶段*
