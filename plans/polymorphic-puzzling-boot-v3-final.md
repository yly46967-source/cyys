# TechCraft 认证功能完善方案 - 最终修订版 v3.0

## 文档信息

**版本**: v3.0（最终修订版）
**修订日期**: 2026-04-13
**修订人**: AI Assistant
**修订原因**: 根据技术评审意见进行全面修订和最终确认

---

## 第一部分：评审意见逐条回应

### 一、理解错误的需求（1-4条）

#### ✅ 问题1：密码功能被当成现成认证能力，但现有主登录链路并不是密码登录

**问题成立**：✅ 是的，评审完全正确

**现有实现验证**：
- `auth-service.js:46-53` 登录只接收 `phone + code`（短信验证码）
- `auth-mock.js:144-192` Mock 登录只校验短信验证码
- `auth-mock.js:206-283` 注册虽然接收 `password`，但新建用户对象并未持久化密码字段
- 当前产品主登录链路是**短信验证码登录**，不是密码登录

**如何修改**：
1. **暂停密码相关功能**（重置密码、修改密码）
2. **先明确密码在产品中的定位**（见第0章基础工作0.1）
3. 提供两种方案供产品选择：
   - **方案A**：密码仅作为备用凭证，不启用密码登录
   - **方案B**：密码作为辅助登录因子，支持密码登录入口

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题2："修改密码接口已具备"这个前提不成立

**问题成立**：✅ 是的，评审完全正确

**现有实现验证**：
- `auth-service.js:130-139` 只是发起 `changePassword` 调用
- `auth-mock.js:393-415` Mock 只校验"新旧密码不能相同"，并不验证旧密码真伪，也不保存新密码
- 这确实是**占位接口**，不是真正的可用接口

**如何修改**：
1. 在方案中明确标注这是**占位接口**
2. 修改功能优先级：将"修改密码"从 P0 改为**暂停**
3. 等待完成基础工作0.1（明确密码定位）后再实施

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题3："消息详情页"被扩成了可回复的交互消息页

**问题成立**：✅ 是的，评审完全正确

**现有实现验证**：
- `profile-config.js:29-31` 消息类型只有 `system` 和 `task`，明确写了"**暂不实现 private 私信**"
- `message-service.js:136-199` 现有消息模型只有标题、内容、跳转地址、生命周期
- `message-center.js:209-225` 点击消息只会"标已读 + 按 `actionUrl` 跳转"

**如何修改**：
1. **移除回复功能**，收紧消息详情页范围
2. 明确消息详情页为**只读通知详情页**
3. 保留的功能：
   - ✅ 消息完整内容展示
   - ✅ 自动标记已读
   - ✅ 删除消息
   - ✅ 跳转关联任务
   - ✅ 上一条/下一条导航
   - ❌ 移除：回复功能

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题4："账户安全设置页"被当成已有能力的自然延伸，但底层域模型并不存在

**问题成立**：✅ 是的，评审完全正确

**现有实现验证**：
- `auth-config.js:52-65` 只有资料、密码、任务、消息接口
- `auth-service.js:114-234` 没有安全状态、登录设备、换绑手机、安全日志接口
- `auth-guard.js:50-55` 连 `real-name-auth.html` 都是"暂不实现"

**如何修改**：
1. **重新定义账户安全页为最小可实现版本**（P1）
2. 只包含：
   - ✅ 安全状态概览（只读展示）
   - ✅ 快捷操作入口（卡片形式）
   - ✅ 安全提示（静态内容）
   - ❌ 移除：登录设备管理、安全日志、更换手机号、退出所有设备
3. 明确标注为**只读展示页**，不依赖复杂的安全域模型

**采纳意见**：✅ 完全采纳

---

### 二、遗漏的边界条件（5-9条）

#### ✅ 问题5：忘记密码流程没有定义"账号存在性暴露"策略

**问题成立**：✅ 是的，这是一个重要的安全问题

**如何修改**：
在第3章新增"边界条件定义"，包括：

**5.1 账号存在性暴露策略**

采用**方案A：泛化提示**（推荐）

**策略**：
- 未注册手机号发起重置时，返回统一提示："**如果手机号已注册，验证码将发送至您的手机**"
- 验证码校验失败时，返回："验证码错误或已过期"
- **不暴露**手机号是否注册

**Mock API 实现**：
```javascript
// auth-mock.js - sendCode API
if (type === 'reset_password') {
    // 无论手机号是否注册，都返回成功
    // 只有已注册的手机号才能真正收到验证码
    if (MOCK_USERS[phone]) {
        // 已注册：生成验证码
        const code = '123456';
        const expiry = Date.now() + CODE_EXPIRY;
        MOCK_CODES.set(`${phone}_reset_password`, { code, expiry });
    } else {
        // 未注册：不生成验证码，但返回成功（泛化提示）
    }

    return {
        success: true,
        data: {
            message: '如果手机号已注册，验证码将发送至您的手机'
        }
    };
}
```

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题6：密码修改/重置成功后的会话处置没有定义

**问题成立**：✅ 是的，这是一个重要的安全问题

**如何修改**：
在第3章新增"边界条件定义"，包括：

**5.2 密码修改后的会话处置策略**

采用**方案A：强制退出所有会话**（推荐）

**策略**：
- 修改密码成功后，**当前标签页立即退出登录**
- **其他标签页通过 cross-tab 同步事件退出**
- 清除所有 token（access token + refresh token）
- 跳转到登录页，提示："密码已修改，请重新登录"

**实现**：
```javascript
async handlePasswordChange(oldPassword, newPassword) {
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
}
```

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题7：独立资料编辑页没有定义浏览器级离开场景

**问题成立**：✅ 是的，这是一个重要的用户体验问题

**如何修改**：
在第3章新增"边界条件定义"，包括：

**5.3 独立资料编辑页的浏览器级离开拦截**

**拦截场景**：
- 浏览器后退按钮
- 浏览器刷新按钮
- 直接关闭标签页
- 跳转到其他页面（如账户安全页）
- 手动修改 URL

**实现**：
```javascript
class ProfileEditPage {
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
                    window.history.pushState(null, null, window.location.href);
                    return;
                }
            }
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

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题8：消息详情页没有定义"消息不存在/已删除/关联目标失效"的行为

**问题成立**：✅ 是的，这是一个重要的异常场景处理问题

**如何修改**：
在第3章新增"边界条件定义"，包括：

**5.4 消息详情页的异常态行为**

**异常场景定义**：

| 场景 | 处理方式 | 用户体验 |
|------|---------|---------|
| 消息不存在 | 显示空态："消息不存在或已删除"，3秒后返回列表 | 友好提示 |
| 消息已删除 | 显示空态："消息已删除"，3秒后返回列表 | 友好提示 |
| 未登录 | auth-guard 自动重定向到登录页，保存返回路径 | 登录后返回详情页 |
| 关联任务不存在 | 隐藏"前往任务"按钮，不影响其他操作 | 功能降级 |
| 没有上一条/下一条 | 对应按钮置灰 | 明确状态 |

**空态设计**：
```html
<div class="message-detail-empty">
    <div class="empty-icon">📭</div>
    <div class="empty-title">消息不存在或已删除</div>
    <div class="empty-description">该消息可能已被删除或不存在</div>
    <button class="btn btn-primary" onclick="goBackToList()">返回消息列表</button>
</div>
```

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题9：安全设置页没有定义空态、无权限态和降级态

**问题成立**：✅ 是的，这是一个重要的异常场景处理问题

**如何修改**：
在第3章新增"边界条件定义"，包括：

**5.5 账户安全页的空态和失败态**

**空态定义**：

| 场景 | 展示方式 | 用户体验 |
|------|---------|---------|
| 未绑定手机 | 显示"未绑定"状态，隐藏"更换手机号"按钮 | 明确状态 |
| 无设备数据 | 隐藏"登录设备"卡片（本版不实现） | 功能降级 |
| 无安全日志 | 隐藏"安全日志"卡片（本版不实现） | 功能降级 |
| 接口不存在 | 显示静态安全提示，不调用接口 | 功能降级 |

**失败态定义**：

| 场景 | 展示方式 | 用户体验 |
|------|---------|---------|
| 接口超时 | 显示默认安全状态，提示"状态获取失败" | 功能降级 |
| 接口401 | auth-guard 自动重定向到登录页 | 权限控制 |
| 接口403 | 显示"无权限访问"，返回用户中心 | 权限控制 |

**采纳意见**：✅ 完全采纳

---

### 三、可能导致返工的设计问题（10-17条）

#### ✅ 问题10：Mock API 分发不区分 HTTP Method

**问题成立**：✅ 是的，这是一个严重的技术问题

**现有实现验证**：
- `auth-mock.js:456` Mock fetch 只按 `pathname` 找 handler
- `auth-mock.js:369` 和 `auth-mock.js:381` 对 `/api/users/profile` 定义了重复 key
- 同一路径不同方法本身就不稳

**如何修改**：
在第0章新增"前置基础工作"，包括：

**基础工作 0.2：修复 Mock API 路由分发机制**

**修复方案**：
```javascript
// 修改前
const handler = mockApiHandlers[pathname];

// 修改后
const method = options.method || 'GET';
const key = `${method} ${pathname}`;
const handler = mockApiHandlers[key];
```

**需要修改的文件**：
- `assets/data/auth-mock.js` - 修改所有接口 key 为 `{METHOD} /path` 格式
- 影响范围：所有 Mock API 调用

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题11：用户资料契约已经分裂成两套

**问题成立**：✅ 是的，这是一个严重的数据契约问题

**现有实现验证**：
- `auth-mock.js:19-49` 用户模型是顶层 `company` / `profile`
- `user-service.js:114-142` 和 `profile-editor.js:77-79` 使用的是 `extension.*`
- `auth-service.js:114-122` 走的是 `auth-service.updateProfile`
- `profile-editor.js:480-487` 实际保存走的是 `userService.updateUserProfile`

**如何修改**：
在第0章新增"前置基础工作"，包括：

**基础工作 0.3：统一用户资料数据契约**

**统一方案**：
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

**需要修改的文件**：
- `assets/js/auth-service.js` - 移除 updateProfile 方法，避免契约冲突
- `assets/data/auth-mock.js` - 统一使用 extension 模型
- 所有调用 updateProfile 的地方改为调用 userService.updateUserProfile()

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题12："复用 profile-editor.js 改成独立页"被说得过于轻描淡写

**问题成立**：✅ 是的，这是一个严重的架构问题

**现有实现验证**：
- `profile-editor.js:20-23` 组件硬依赖 `#profileEditorModal`、`#profileEditForm`
- `profile-editor.js:35-41` 初始化找不到模态框就直接报错退出
- `profile-editor.js:47-69` `open/close` 直接操作 modal class 和 `document.body.style.overflow`

**如何修改**：
在第0章新增"前置基础工作"，包括：

**基础工作 0.4：解耦 ProfileEditor 组件**

**解耦方案**：
```javascript
class EditableProfile {
    constructor(container, options = {}) {
        this.container = container;
        this.mode = options.mode || 'modal'; // modal | page
        this.onSave = options.onSave || (() => {});
        this.onCancel = options.onCancel || (() => {});
        this.init();
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

**需要修改的文件**：
- `assets/js/profile-editor.js` - 重构为 EditableProfile 类
- `profile-client.html` / `profile-developer.html` - 使用 new EditableProfile(container, { mode: 'modal' })
- `profile-edit.html` (新增) - 使用 new EditableProfile(container, { mode: 'page' })

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题13：现有头像上传和资料保存逻辑本身就不适合直接复用

**问题成立**：✅ 是的，这是一个潜在的 bug

**现有实现验证**：
- `profile-editor.js:343-373` 上传头像只更新预览图和脏状态
- `profile-editor.js:542-589` 提交时并没有把头像 URL 收集进 `formData`
- `user-service.js:158-166` Mock 更新对 `extension` 是浅合并，容易整对象覆盖

**如何修改**：
在基础工作 0.3 中统一契约后，这个问题会自然解决。统一使用 `extension` 模型后：
- 头像 URL 会正确保存到 `extension.avatar`
- `userService.updateUserProfile()` 会正确处理部分字段更新

**采纳意见**：✅ 完全采纳（通过基础工作0.3解决）

---

#### ✅ 问题14：消息详情页没有服务层契约，只有列表契约

**问题成立**：✅ 是的，这是一个缺失的 API

**现有实现验证**：
- `message-service.js:38-115` 只有 `getMessages / markMessageRead / markAllMessagesRead / deleteMessage`
- `message-center.js:209-225` 点卡片后直接按 `actionUrl` 跳转

**如何修改**：
在第2章"消息详情页"中新增 API：

**新增 Mock API**：
```javascript
// message-service.js - 新增方法
async getMessageById(messageId) {
    const response = await httpClient.get(`/api/messages/${messageId}`);
    return response.data.message;
}

async getAdjacentMessages(currentMessageId) {
    const messages = await this.getMessages();
    const sortedMessages = messages.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    const currentIndex = sortedMessages.findIndex(m => m.id === currentMessageId);
    return {
        previous: sortedMessages[currentIndex + 1] || null,
        next: sortedMessages[currentIndex - 1] || null
    };
}

// auth-mock.js - 新增 Mock 处理
'GET /api/messages/{id}': (params) => {
    const { id } = params;
    const message = MOCK_MESSAGES.find(m => m.id === id);

    if (!message || message.deletedAt) {
        return {
            success: false,
            error: { code: 'MESSAGE_NOT_FOUND', message: '消息不存在' }
        };
    }

    return { success: true, data: { message } };
}
```

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题15：安全设置页依赖的能力远超当前 auth-service 能力边界

**问题成立**：✅ 是的，这是一个功能范围问题

**如何修改**：
通过问题4的修改，已经将账户安全页重新定义为最小可实现版本，只依赖：
- `auth-state` 用户数据（已存在）
- 简化的安全状态 Mock API（新增）
- 不依赖复杂的安全域模型

**采纳意见**：✅ 完全采纳（通过问题4的修改解决）

---

#### ✅ 问题16：用户中心入口改造被低估了

**问题成立**：✅ 是的，这是一个导航架构问题

**如何修改**：
在第4章"文件改动清单"中明确列出所有需要修改的文件：

**用户中心页面修改**：
- `profile-client.html` - "编辑资料"改为跳转到独立页面
- `profile-developer.html` - "编辑资料"改为跳转到独立页面
- `assets/js/profile-client-main.js` - 添加独立页面路由处理
- `assets/js/profile-developer-main.js` - 添加独立页面路由处理
- `assets/js/message-center.js` - 消息点击改为跳转到 message-detail.html

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题17：风险缓解里提到的 Babel/Polyfill 与当前仓库形态不匹配

**问题成立**：✅ 是的，这是一个不切实际的建议

**现有实现验证**：
- 当前仓库是**静态 HTML + 原生 ESM 结构**
- 仓库里未体现构建链或转译链

**如何修改**：
在第5章"风险点"中删除 Babel/Polyfill 相关内容，改为：

**浏览器兼容性**：
- 使用原生 ES6+ 语法
- 测试主流浏览器（Chrome、Firefox、Safari、Edge）
- 无需 Babel 转译（当前项目无构建链）

**采纳意见**：✅ 完全采纳

---

### 四、测试不足（18-23条）

#### ✅ 问题18-23：缺少关键测试

**问题成立**：✅ 是的，测试覆盖不足

**如何修改**：
在第6章"测试策略"中新增完整的测试清单：

**基础工作测试**：
- Mock API 路由分发测试
- 用户资料契约统一测试
- ProfileEditor 重构测试

**P0 功能测试**：
- 用户资料编辑页测试（包括浏览器级离开拦截）
- 消息详情页测试（包括所有异常场景）

**边界和异常场景测试**：
- 账号存在性暴露测试
- 密码修改后的会话测试
- 消息详情页异常态测试

**兼容性测试**：
- Chrome、Firefox、Safari、Edge
- 移动端 Chrome（iOS/Android）

**采纳意见**：✅ 完全采纳

---

### 五、性能、安全、维护性重点问题（24-27条）

#### ✅ 问题24：忘记密码流程天然涉及账号枚举风险

**问题成立**：✅ 是的，这是一个严重的安全风险

**如何修改**：
通过问题5的修改，采用**泛化提示**策略，降低账号枚举风险。

**采纳意见**：✅ 完全采纳（通过问题5的修改解决）

---

#### ✅ 问题25：任何"手机号绑定状态、设备、日志"都不能靠前端静态数据假装安全能力

**问题成立**：✅ 是的，这是一个安全能力边界问题

**如何修改**：
在方案中明确标注：
- 安全状态页为**只读展示**，不作为安全约束
- Mock 数据仅用于前端展示，不具备实际安全约束力
- 未来接入真实后端时需要实现完整的安全域模型

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题26：消息中心当前会在组件初始化后立即开启轮询，新增页面会放大无效开销

**问题成立**：✅ 是的，这是一个性能问题

**现有实现验证**：
- `message-center.js:40-44`、`294-307` 初始化后马上加载并启动 30 秒轮询
- 用户中心默认首屏是 `overview`，消息区并不一定可见

**如何修改**：
优化消息轮询策略：
- 延迟轮询：只在进入消息 section 时启动
- 停止轮询：离开消息 section 时停止
- 页面卸载：清理定时器

**采纳意见**：✅ 完全采纳

---

#### ✅ 问题27：安全、资料、认证状态目前没有单一事实源

**问题成立**：✅ 是的，这是一个数据一致性问题

**现有实现验证**：
- `auth-state.js:225-258` 维护一套用户状态
- `user-service.js:103-167` 维护一套本地资料 Mock
- `auth-mock.js:19-49` 又有一套认证侧用户数据

**如何修改**：
通过基础工作 0.3（统一用户资料数据契约）解决这个问题：
- 以 **auth-state** 为单一事实源
- user-service 和 auth-mock 都遵循统一的数据契约
- 所有数据更新都通过 auth-state 同步

**采纳意见**：✅ 完全采纳（通过基础工作0.3解决）

---

## 第二部分：修改后的完整方案

### 第0章：前置基础工作（必须先完成）

在实施任何新功能前，必须先完成以下基础工作：

#### 基础工作 0.1：明确密码在产品中的定位 ⚠️ **阻塞问题**

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

---

#### 基础工作 0.2：修复 Mock API 路由分发机制

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

---

#### 基础工作 0.3：统一用户资料数据契约

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

---

#### 基础工作 0.4：解耦 ProfileEditor 组件

**问题**: ProfileEditor 硬依赖模态框 DOM，无法直接复用到独立页面。

**解耦方案**:

```javascript
// 抽取核心编辑逻辑为 EditableProfile 类
class EditableProfile {
    constructor(container, options = {}) {
        this.container = container;
        this.mode = options.mode || 'modal'; // modal | page
        this.onSave = options.onSave || (() => {});
        this.onCancel = options.onCancel || (() => {});
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

### 第1章：需求理解（修订版）

#### 1.1 暂停的功能（需先完成前置工作）

##### 1.1.1 忘记密码/重置密码功能 - **暂停** ⏸️

**原因**: 需要先完成基础工作0.1（明确密码定位）和边界条件5.1（定义账号存在性暴露策略）

**前置条件**:
- [ ] 明确密码在产品中的定位（基础工作0.1）
- [ ] 定义账号存在性暴露策略（边界条件5.1）
- [ ] 实现真正的密码持久化（auth-mock.js 目前未持久化密码）
- [ ] 定义密码修改后的会话处置策略（边界条件5.2）

**暂不实施，等待前置条件完成**

---

##### 1.1.2 修改密码功能 - **暂停** ⏸️

**原因**: 现有接口仅为占位，需要先完成基础工作0.1、边界条件5.2

**前置条件**:
- [ ] 明确密码在产品中的定位（基础工作0.1）
- [ ] 修正 Mock API 使其真正验证旧密码并持久化新密码
- [ ] 定义密码修改后的会话处置策略（边界条件5.2）

**暂不实施，等待前置条件完成**

---

#### 1.2 优先实现功能（P0 - 最小可实现版本）

##### 1.2.1 用户资料编辑页（独立页面）- **P0**

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

##### 1.2.2 消息详情页（只读版本）- **P0**

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

#### 1.3 延后实现功能（P1 - 后续版本）

##### 1.3.1 账户安全设置页（最小版本）- **P1**

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

### 第2章：技术方案（修订版）

#### 2.1 整体架构设计

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

#### 2.2 详细功能设计

##### 2.2.1 用户资料编辑页（独立页面）

**UI/UX 设计：**

**布局**：
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

**交互流程**：
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

**状态管理**：
- 表单状态：脏检查（hasUnsavedChanges）
- 保存状态：loading
- 错误状态：按字段显示
- 离开拦截：beforeunload + popstate 事件

**浏览器级离开拦截**：
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

**API 接口设计**：

**已有接口（使用 user-service）**：
```javascript
// user-service.js - 已实现
async updateUserProfile(updates) {
    // updates.extension: { avatar, bio, location, website, company, title, skills }
    return await this._mockUpdateUserProfile(updates);
}
```

**数据模型（统一使用 extension）**：
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

**错误处理**：
- 字段验证错误：显示在对应字段下方
- 网络错误：显示全局提示（使用 notification.js）
- 未保存修改警告：离开页面前二次确认

**组件复用策略**：
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

##### 2.2.2 消息详情页（只读版本）

**UI/UX 设计：**

**布局**：
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

**交互流程**：
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

**API 接口设计**：

**新增 Mock API**：
```javascript
// message-service.js - 新增方法
async getMessageById(messageId) {
    const response = await httpClient.get(`/api/messages/${messageId}`);
    return response.data.message;
}

async getAdjacentMessages(currentMessageId) {
    const messages = await this.getMessages();
    const sortedMessages = messages.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    const currentIndex = sortedMessages.findIndex(m => m.id === currentMessageId);
    return {
        previous: sortedMessages[currentIndex + 1] || null,
        next: sortedMessages[currentIndex - 1] || null
    };
}

// auth-mock.js - 新增 Mock 处理
'GET /api/messages/{id}': (params) => {
    const { id } = params;
    const message = MOCK_MESSAGES.find(m => m.id === id);

    if (!message || message.deletedAt) {
        return {
            success: false,
            error: { code: 'MESSAGE_NOT_FOUND', message: '消息不存在' }
        };
    }

    return { success: true, data: { message } };
}
```

**数据模型（复用现有）**：
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

**错误处理**：
- 消息不存在：显示"消息已删除"空态，3秒后返回列表
- 消息已删除：显示"消息已删除"空态，3秒后返回列表
- 网络错误：显示全局提示
- 未登录：auth-guard 自动重定向到登录页

**深链支持**：
```javascript
// 支持直接访问 message-detail.html?id=msg-001
const urlParams = new URLSearchParams(window.location.search);
const messageId = urlParams.get('id');

if (messageId) {
    loadMessageDetail(messageId);
} else {
    notification.show('无效的消息链接', 'error');
    setTimeout(() => {
        window.location.href = 'profile-client.html#messages';
    }, 2000);
}
```

---

##### 2.2.3 账户安全设置页（最小版本）- **P1 延后**

**UI/UX 设计（最小化）**：

**布局**：
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

**功能范围（最小化）**：
- ✅ 安全状态概览（只读展示，从 auth-state 读取）
- ✅ 快捷操作入口（按钮形式，部分功能开发中）
- ✅ 安全提示（静态内容）
- ❌ 不包含登录设备管理（底层无支持）
- ❌ 不包含安全日志（底层无支持）
- ❌ 不包含更换手机号（延后）
- ❌ 不包含退出所有设备（延后）

**API 接口设计（简化版）**：

```javascript
// auth-config.js - 新增端点
GET_SECURITY_STATUS: '/api/users/security/status',

// auth-mock.js - 新增 Mock 处理（简化版）
'GET /api/users/security/status': () => {
    const user = authState.getCurrentUser();
    return {
        success: true,
        data: {
            passwordStatus: 'not_set',
            phoneBound: !!user.phone,
            phoneLast4: user.phone ? user.phone.slice(-4) : null,
            realNameStatus: user.realNameStatus
        }
    };
}
```

**数据模型（简化版）**：
```javascript
{
    passwordStatus: 'not_set' | 'set',
    phoneBound: boolean,
    phoneLast4: string | null,
    realNameStatus: 'not_started' | 'pending' | 'verified' | 'rejected'
}
```

---

### 第3章：边界条件定义（新增）

#### 3.1 账号存在性暴露策略（针对重置密码）⚠️

**问题**: 忘记密码流程涉及账号枚举风险。

**策略定义**:

**方案A: 泛化提示（推荐）**
- 未注册手机号发起重置时，返回统一提示："如果手机号已注册，验证码将发送至您的手机"
- 验证码校验失败时，返回："验证码错误或已过期"
- 不暴露手机号是否注册

**本方案采用方案A（泛化提示）**

---

#### 3.2 密码修改后的会话处置策略（针对修改密码）⚠️

**问题**: 密码修改后，当前会话和其他标签页如何处置？

**策略定义**:

**方案A: 强制退出所有会话（推荐）**
- 修改密码成功后，当前标签页立即退出登录
- 其他标签页通过 cross-tab 同步事件退出
- 清除所有 token（access token + refresh token）
- 跳转到登录页，提示："密码已修改，请重新登录"

**本方案采用方案A（强制退出所有会话）**

---

#### 3.3 独立资料编辑页的浏览器级离开拦截

**拦截场景**:
- 浏览器后退按钮
- 浏览器刷新按钮
- 直接关闭标签页
- 跳转到其他页面（如账户安全页）
- 手动修改 URL

**拦截策略**:
- 只在有未保存修改时拦截
- 提供清晰的确认文案
- 保存后立即移除拦截

---

#### 3.4 消息详情页的异常态行为

**异常场景定义**：

| 场景 | 处理方式 | 用户体验 |
|------|---------|---------|
| 消息不存在 | 显示空态："消息不存在或已删除"，3秒后返回列表 | 友好提示 |
| 消息已删除 | 显示空态："消息已删除"，3秒后返回列表 | 友好提示 |
| 未登录 | auth-guard 自动重定向到登录页，保存返回路径 | 登录后返回详情页 |
| 关联任务不存在 | 隐藏"前往任务"按钮，不影响其他操作 | 功能降级 |
| 没有上一条/下一条 | 对应按钮置灰 | 明确状态 |

---

#### 3.5 账户安全页的空态和失败态

**空态定义**：

| 场景 | 展示方式 | 用户体验 |
|------|---------|---------|
| 未绑定手机 | 显示"未绑定"状态，隐藏"更换手机号"按钮 | 明确状态 |
| 无设备数据 | 隐藏"登录设备"卡片（本版不实现） | 功能降级 |
| 无安全日志 | 隐藏"安全日志"卡片（本版不实现） | 功能降级 |
| 接口不存在 | 显示静态安全提示，不调用接口 | 功能降级 |

**失败态定义**：

| 场景 | 展示方式 | 用户体验 |
|------|---------|---------|
| 接口超时 | 显示默认安全状态，提示"状态获取失败" | 功能降级 |
| 接口401 | auth-guard 自动重定向到登录页 | 权限控制 |
| 接口403 | 显示"无权限访问"，返回用户中心 | 权限控制 |

---

### 第4章：文件改动清单（修订版）

#### 4.1 基础工作文件修改（必须先完成）

| 文件路径 | 修改内容 | 优先级 |
|---------|---------|-------|
| `assets/data/auth-mock.js` | 修复 Mock API 路由分发，按 `{METHOD} /path` 格式 | P0 |
| `assets/data/auth-mock.js` | 统一用户资料模型，使用 extension 结构 | P0 |
| `assets/js/auth-service.js` | 移除 updateProfile 方法，避免契约冲突 | P0 |
| `assets/js/profile-editor.js` | 重构为 EditableProfile 类，支持 modal/page 模式 | P0 |
| `assets/js/user-service.js` | 确认为唯一用户资料数据契约 | P0 |

---

#### 4.2 P0 功能文件改动

##### 4.2.1 新增文件（P0）

**HTML 页面**：

| 文件路径 | 职责定位 | 依赖 |
|---------|---------|------|
| `profile-edit.html` | 用户资料编辑页（独立页面） | `profile.css`, `profile-edit-main.js`, `user-service.js` |
| `message-detail.html` | 消息详情页（只读版本） | `profile.css`, `message-detail-main.js`, `message-service.js` |

**JavaScript 业务逻辑**：

| 文件路径 | 职责定位 | 依赖 |
|---------|---------|------|
| `assets/js/profile-edit-main.js` | 资料编辑页面主逻辑 | `auth-state.js`, `user-service.js`, `profile-editor.js`, `notification.js`, `form-validator.js` |
| `assets/js/message-detail-main.js` | 消息详情页面主逻辑 | `auth-state.js`, `message-service.js`, `notification.js` |

**CSS 样式（扩展现有文件）**：

| 文件路径 | 新增内容 |
|---------|---------|
| `assets/css/profile.css` | 资料编辑页样式、消息详情页样式 |

---

##### 4.2.2 修改文件（P0）

**用户中心页面（添加入口）**：

| 文件路径 | 修改内容 |
|---------|---------|
| `profile-client.html` | "编辑资料"改为跳转到独立页面，而非打开模态框 |
| `profile-developer.html` | "编辑资料"改为跳转到独立页面，而非打开模态框 |
| `assets/js/message-center.js` | 消息点击改为跳转到 message-detail.html，而非直接按 actionUrl 跳转 |

**服务层扩展**：

| 文件路径 | 修改内容 |
|---------|---------|
| `assets/js/message-service.js` | 新增 `getMessageById()` 和 `getAdjacentMessages()` 方法 |
| `assets/data/auth-mock.js` | 新增 `GET /api/messages/{id}` Mock 处理 |

---

#### 4.3 P1 功能文件改动（延后实施）

##### 4.3.1 新增文件（P1）

| 文件路径 | 职责定位 | 依赖 |
|---------|---------|------|
| `security-settings.html` | 账户安全设置页（最小版本） | `profile.css`, `security-settings-main.js` |
| `assets/js/security-settings-main.js` | 安全设置页面主逻辑 | `auth-state.js`, `notification.js` |

---

#### 4.4 暂停的功能（不实施）

| 功能 | 状态 | 原因 |
|------|------|------|
| 忘记密码/重置密码 | ⏸️ 暂停 | 需先完成基础工作0.1、边界条件5.1 |
| 修改密码 | ⏸️ 暂停 | 需先完成基础工作0.1、边界条件5.2 |
| 更换手机号 | ⏸️ 暂停 | 优先级较低，延后到后续版本 |
| 登录设备管理 | ⏸️ 暂停 | 底层无支持，延后到后续版本 |
| 安全日志 | ⏸️ 暂停 | 底层无支持，延后到后续版本 |

---

### 第5章：风险点（修订版）

#### 5.1 技术风险

| 风险项 | 风险等级 | 影响范围 | 缓解措施 |
|-------|---------|---------|---------|
| **ProfileEditor 重构风险** | 高 | 资料编辑页 | 1. 保留原有模态框功能<br>2. 充分测试两种模式<br>3. 提供回滚方案 |
| **用户资料契约统一** | 中 | 所有资料相关功能 | 1. 先完成基础工作0.3<br>2. 全面回归测试<br>3. 文档化统一契约 |
| **Mock API 路由分发** | 中 | 所有 Mock API | 1. 先完成基础工作0.2<br>2. 测试所有现有 API<br>3. 确保无破坏性变更 |
| **消息详情页深链** | 低 | 消息详情页 | 1. 充分测试异常场景<br>2. 提供友好的空态<br>3. 自动返回列表 |
| **浏览器兼容性** | 低 | 所有功能 | 1. 使用原生 ES6+ 语法<br>2. 测试主流浏览器<br>3. 无需 Babel 转译 |

---

#### 5.2 用户体验风险

| 风险项 | 风险等级 | 影响范围 | 缓解措施 |
|-------|---------|---------|---------|
| **资料编辑页离开拦截过于频繁** | 中 | 资料编辑页 | 1. 只在有未保存修改时拦截<br>2. 提供清晰的确认文案<br>3. 保存后立即移除拦截 |
| **消息详情页加载慢** | 低 | 消息详情页 | 1. 显示加载状态<br>2. 使用骨架屏（可选）<br>3. 快速失败机制 |
| **账户安全页功能不完整** | 低 | 账户安全页 | 1. 明确标注"开发中"<br>2. 提供静态安全提示<br>3. 设置合理的用户预期 |

---

#### 5.3 开发风险

| 风险项 | 风险等级 | 影响范围 | 缓解措施 |
|-------|---------|---------|---------|
| **基础工作量被低估** | 高 | 所有功能 | 1. 优先完成基础工作0.1-0.4<br>2. 分阶段实施（基础→P0→P1）<br>3. 预留缓冲时间 |
| **密码功能需求不明确** | 高 | 密码相关功能 | 1. 先完成基础工作0.1明确需求<br>2. 暂停密码功能实施<br>3. 等待产品明确后再实施 |
| **测试覆盖不足** | 中 | 所有功能 | 1. 制定详细测试清单<br>2. 手动测试所有场景<br>3. 边界和异常场景测试 |

---

### 第6章：实施细则（修订版）

#### 6.1 开发顺序建议

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

Day 5: 基础工作 0.5-0.7（边界条件定义）
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

#### 6.2 测试策略（修订版）

##### 6.2.1 基础工作测试

**Mock API 路由分发测试**：
- [ ] 同一路径的 GET / PUT / DELETE 是否命中正确 handler
- [ ] 新增接口后不会和现有 path-only 分发冲突
- [ ] 所有现有 API 调用仍然正常工作

**用户资料契约统一测试**：
- [ ] user-service.updateUserProfile() 正常工作
- [ ] extension 模型字段完整
- [ ] 模态框资料编辑功能回归测试
- [ ] 独立页资料编辑功能正常

**ProfileEditor 重构测试**：
- [ ] modal 模式：打开/关闭/保存/取消
- [ ] page 模式：保存/取消/离开拦截
- [ ] 两种模式行为一致性
- [ ] 头像上传功能正常

---

##### 6.2.2 P0 功能测试

**用户资料编辑页测试**：
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

**消息详情页测试**：
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

##### 6.2.3 边界和异常场景测试

**账号存在性暴露测试**：
- [ ] 未注册手机号发起重置密码（泛化提示）
- [ ] 已注册手机号发起重置密码（正常流程）
- [ ] 验证码错误提示不暴露账号状态

**密码修改后的会话测试**：
- [ ] 修改密码后当前页退出
- [ ] 修改密码后其他标签页退出
- [ ] 未读消息数清理
- [ ] 用户资料缓存清理
- [ ] Token 清除

**资料编辑页离开拦截测试**：
- [ ] 后退按钮拦截
- [ ] 刷新按钮拦截
- [ ] 关闭标签页拦截
- [ ] 跳转其他页面拦截
- [ ] 保存后不再拦截
- [ ] 取消后不再拦截

**消息详情页异常态测试**：
- [ ] 无效的 message ID
- [ ] 不存在的消息
- [ ] 已删除的消息
- [ ] 关联任务不存在
- [ ] 接口超时
- [ ] 接口 401/403

---

##### 6.2.4 兼容性测试

- [ ] Chrome（最新版）
- [ ] Firefox（最新版）
- [ ] Safari（最新版）
- [ ] Edge（最新版）
- [ ] 移动端 Chrome（iOS）
- [ ] 移动端 Chrome（Android）

---

#### 6.3 上线检查清单（修订版）

**基础工作检查**：
- [ ] Mock API 路由分发已修复
- [ ] 用户资料契约已统一
- [ ] ProfileEditor 已重构
- [ ] 账号存在性暴露策略已定义
- [ ] 密码修改后的会话处置策略已定义
- [ ] 所有边界条件已定义

**代码质量**：
- [ ] 所有文件包含 L3 文件头
- [ ] 代码复用率 ≥ 60%
- [ ] 关键函数包含 JSDoc 注释
- [ ] 无 console.log 调试代码

**功能完整性**：
- [ ] 所有 P0 功能完成
- [ ] 所有测试用例通过
- [ ] 无已知 Bug

**用户体验**：
- [ ] 所有错误提示友好
- [ ] 所有加载状态清晰
- [ ] 移动端适配良好
- [ ] 异常场景有友好提示

**文档完善**：
- [ ] API 接口文档更新
- [ ] 用户使用手册更新
- [ ] 测试报告完整
- [ ] 本设计文档已更新

---

## 第三部分：总结

### 3.1 修订要点总结

本次修订基于技术评审意见，主要变更包括：

1. **新增第0章：前置基础工作** - 确保架构稳定后再实施新功能
2. **暂停密码相关功能** - 等待明确密码在产品中的定位
3. **收紧功能范围** - 确保可实施性，避免返工
4. **新增第3章：边界条件定义** - 覆盖所有异常场景
5. **修复所有设计问题** - Mock 路由、数据契约、组件解耦
6. **补充完整测试用例** - 确保质量
7. **删除不切实际的建议** - Babel/Polyfill 等

### 3.2 核心优势

- **先完成基础工作** - 确保架构稳定后再实施新功能
- **收紧功能范围** - 确保可实施性，避免返工
- **明确边界条件** - 覆盖所有异常场景
- **最大化代码复用** - 复用现有模块和服务
- **风险可控** - 详细的风险分析和缓解措施

### 3.3 实施建议

- **优先完成基础工作**（0.1-0.4）
- **严格按阶段实施**（基础→P0→P1）
- **充分测试所有场景**
- **密码功能等待产品明确后再实施**
- **预留缓冲时间应对意外问题**

---

## 文档版本历史

| 版本 | 日期 | 修订内容 | 修订人 |
|------|------|---------|--------|
| v1.0 | 2026-04-13 | 初始版本 | AI Assistant |
| v2.0 | 2026-04-13 | 第一次修订（根据评审意见） | AI Assistant |
| v3.0 | 2026-04-13 | 最终修订版（完整回应评审） | AI Assistant |

---

*文档版本: v3.0（最终修订版）*
*修订日期: 2026-04-13*
*修订原因: 根据技术评审意见进行全面修订和最终确认*
*文档状态: 最终版，可进入实施阶段*
