# 任务详情页 - 基于角色的任务接取功能

## 功能概述

任务详情页实现了基于用户角色的任务接取功能：
- **开发者**：可以查看并接取任务
- **客户**：无法接取任务（按钮完全隐藏）
- **未登录用户**：无法接取任务（按钮完全隐藏）

## 实现逻辑

### 1. 角色检查（task-detail.js）

```javascript
function renderAcceptTaskAction(task, currentUserApplication) {
    const currentUser = getCurrentUser();

    // 非开发者用户：完全隐藏接取任务按钮
    if (!currentUser || currentUser.role !== 'developer') {
        setAcceptTaskButtonState({ visible: false });
        return;
    }

    // 开发者用户：根据任务状态和申请状态显示按钮
    // ...
}
```

### 2. HTML 属性标记（task-detail.html）

```html
<a
    href=""
    class="btn btn-primary btn-full action-card__btn"
    id="acceptTaskBtn"
    data-show-role="developer"
    style="display: none; margin-bottom: 12px;"
>
    接受任务
</a>
```

`data-show-role="developer"` 属性与 `task-page-auth.js` 配合，提供额外的角色检查层。

### 3. 认证状态同步

任务详情页订阅认证状态变化，当用户登录/退出时自动更新按钮状态：

```javascript
authStateUnsubscribe = window.authState.subscribe((event) => {
    if (event === window.authState.EVENTS.LOGIN ||
        event === window.authState.EVENTS.LOGOUT ||
        event === window.authState.EVENTS.USER_UPDATE) {
        // 重新渲染按钮状态
        if (currentTaskData) {
            getCurrentUserApplication(currentTaskData.id).then(application => {
                renderAcceptTaskAction(currentTaskData, application);
            });
        }
    }
});
```

## 按钮状态说明

### 开发者用户

| 任务状态 | 申请状态 | 按钮显示 | 按钮状态 |
|---------|---------|---------|---------|
| 招募中 | 无申请 | "接受任务" | 可点击 |
| 招募中 | 已提交 | "已提交申请" | 禁用 |
| 招募中 | 已接受 | "已被接受" | 禁用 |
| 招募中 | 已拒绝 | "申请未通过" | 禁用 |
| 非招募中 | - | "当前不可申请" | 禁用 |

### 客户用户 / 未登录用户

| 任何状态 | 任何状态 | 按钮隐藏 | - |

## 技术实现

### 文件清单

1. **task-detail.html** - 任务详情页 HTML 结构
   - 包含 `data-show-role="developer"` 属性的按钮

2. **task-detail.js** - 任务详情页交互逻辑
   - `renderAcceptTaskAction()` - 核心角色检查和按钮状态控制
   - `getCurrentUser()` - 获取当前登录用户
   - `getCurrentUserApplication()` - 获取用户申请状态

3. **task-page-auth.js** - 页面认证初始化
   - `updateRoleElements()` - 基于 `data-show-role` 属性更新元素显示
   - `initTaskPage()` - 初始化认证状态和订阅

4. **auth-state.js** - 认证状态管理
   - `AuthStateManager` - 提供用户状态和事件订阅

### 数据流

```
用户登录 → authState.currentUser 更新
    ↓
authState 触发 LOGIN 事件
    ↓
task-page-auth.js: updateRoleElements() 处理 data-show-role
    ↓
task-detail.js: 订阅者收到事件，调用 renderAcceptTaskAction()
    ↓
检查用户角色 → 显示/隐藏按钮 → 设置按钮状态
```

## 安全考虑

1. **前端控制**：当前实现仅控制 UI 显示
2. **后端验证**：实际接取任务时，后端必须验证用户角色和权限
3. **防御性编程**：多层检查（data-show-role + renderAcceptTaskAction）

## 测试场景

### 场景 1：未登录用户访问任务详情页

1. 打开任务详情页（未登录状态）
2. 预期：接取任务按钮完全隐藏
3. 预期：只能看到"返回任务大厅"按钮

### 场景 2：客户登录后访问任务详情页

1. 以客户身份登录
2. 打开任务详情页
3. 预期：接取任务按钮完全隐藏
4. 预期：只能看到"返回任务大厅"按钮

### 场景 3：开发者登录后访问招募中的任务

1. 以开发者身份登录
2. 打开招募中的任务详情页（未申请过）
3. 预期：显示"接受任务"按钮，可点击

### 场景 4：开发者已申请任务

1. 以开发者身份登录
2. 打开已申请的任务详情页
3. 预期：显示"已提交申请"按钮，禁用状态

### 场景 5：开发者访问非招募中的任务

1. 以开发者身份登录
2. 打开已关闭的任务详情页
3. 预期：显示"当前不可申请"按钮，禁用状态

### 场景 6：登录状态变化

1. 未登录状态下打开任务详情页
2. 登录为开发者
3. 预期：按钮状态自动更新，显示"接受任务"
4. 退出登录
5. 预期：按钮自动隐藏

## 未来改进

1. **权限提示**：对于非开发者用户，可显示提示信息"只有开发者可以接取任务"
2. **角色切换**：支持用户在客户/开发者角色间切换（如果业务需要）
3. **后端集成**：与实际后端 API 集成，实现真实的任务申请流程

---

*文档版本: v1.0*
*创建日期: 2026-04-15*
*作者: AI Assistant*
