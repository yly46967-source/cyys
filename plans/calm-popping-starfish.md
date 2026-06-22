# 任务详情页实现计划

**创建日期**: 2026-04-08
**状态**: 待评审

---

## Context

用户需要为任务大厅新增任务详情展示功能。当前任务大厅只能浏览任务列表，无法查看任务的完整需求、发布方详细信息等。

采用 **Indeed 风格的两级导航模式**：
1. 点击任务卡片 → 侧边抽屉预览（快速浏览摘要信息）
2. 抽屉内点击"查看详情" → 跳转到独立详情页（完整信息 + 交互功能）

---

## 实施方案

### 阶段一：数据层准备

**文件**: `assets/data/tasks.mock.json`

为每个任务补充以下字段：
- `description` - 完整需求描述（多段落）
- `requirements` - 具体要求列表
- `deliverables` - 交付物清单
- `publishedAt` - 发布时间
- `publisher` - 发布方完整信息对象
  - `avatar` - 头像URL
  - `verified` - 认证状态
  - `rating` - 信用评分
  - `reviewCount` - 评价数量
  - `publishedCount` - 历史发布数
  - `completionRate` - 完成率
  - `contact` - 联系方式（微信/QQ/邮箱）

### 阶段二：侧边抽屉组件

**新增文件**: `assets/js/task-drawer.js`

实现抽屉组件逻辑：
- `openDrawer(taskId)` - 打开抽屉，加载并渲染任务数据
- `closeDrawer()` - 关闭抽屉
- `renderDrawerContent(task)` - 生成抽屉 HTML 内容
- 事件处理：遮罩点击、ESC 关闭

**修改文件**: `task-hall.html`

添加抽屉容器 DOM：
```html
<div class="drawer-overlay" id="taskDrawerOverlay"></div>
<aside class="drawer" id="taskDrawer">
    <!-- 抽屉内容将动态插入 -->
</aside>
```

**修改文件**: `assets/js/task-hall.js`

添加任务卡片点击事件，调用抽屉组件：
```javascript
taskList.addEventListener('click', (e) => {
    const card = e.target.closest('.task-card');
    if (card) {
        TaskDrawer.open(card.dataset.taskId);
    }
});
```

**抽屉内容结构**：
- 任务标题 + 状态徽章
- 任务摘要描述
- 发布方简要信息（头像、昵称、认证标识）
- 预算、工期信息
- 技术栈标签
- 底部操作：查看详情按钮、收藏、分享

### 阶段三：详情页开发

**新增文件**: `task-detail.html`

页面结构：
- 导航栏（复用 `data-layout="navbar"`）
- 面包屑导航：任务大厅 > 任务详情
- 主内容区：
  - 左侧：任务完整信息
    - 标题、状态、类别
    - 完整需求描述
    - 具体要求列表
    - 交付物清单
    - 预算、交付模式、工期、截止日期
    - 技术栈标签
  - 右侧：发布方完整信息 + 操作区
    - 发布方头像、昵称、认证状态
    - 信用评分（星级显示）
    - 统计数据（发布数、完成率）
    - 联系方式（需权限控制）
    - 操作按钮：接取任务/竞标、收藏、分享、联系发布方
- 页脚（复用 `data-layout="footer"`）

**新增文件**: `assets/css/task-detail.css`

样式要点：
- 复用现有 CSS 变量和组件样式
- 响应式布局：桌面端左右分栏，移动端单列堆叠
- 发布方卡片样式（头像、评分星级、统计数字）
- 联系方式权限遮罩样式

**新增文件**: `assets/js/task-detail.js`

交互逻辑：
- URL 参数解析：`?id={taskId}`
- 任务数据加载（调用 `task-service.js`）
- 错误处理：无效 ID、数据缺失
- 交互功能：
  - 收藏切换（本地存储）
  - 分享（复制链接到剪贴板）
  - 联系发布方（显示联系方式或提示需接取）
  - 返回大厅按钮

### 阶段四：样式调整

**文件**: `assets/css/components.css` (如需要)

调整抽屉组件宽度：
- 当前默认 320px，可能需要调整为 400px（适配更丰富的内容）
- 移动端保持 100%

### 阶段五：文档更新

**更新文件**:
- `assets/js/CLAUDE.md` - 新增 `task-drawer.js` 和 `task-detail.js`
- `assets/css/CLAUDE.md` - 新增 `task-detail.css`
- `设计文档/CLAUDE.md` - 已完成

---

## 关键文件

| 类型 | 文件路径 | 操作 |
|------|----------|------|
| 数据 | `assets/data/tasks.mock.json` | 修改：补充字段 |
| 页面 | `task-hall.html` | 修改：添加抽屉容器 |
| 页面 | `task-detail.html` | 新增 |
| 样式 | `assets/css/task-detail.css` | 新增 |
| 样式 | `assets/css/components.css` | 可能调整抽屉宽度 |
| 逻辑 | `assets/js/task-drawer.js` | 新增 |
| 逻辑 | `assets/js/task-detail.js` | 新增 |
| 逻辑 | `assets/js/task-hall.js` | 修改：集成抽屉调用 |

---

## 验证方式

### 功能测试
1. 点击任务卡片，抽屉从右侧滑出，内容正确显示
2. 点击遮罩/关闭按钮/ESC键，抽屉关闭
3. 点击"查看详情"，跳转到 `task-detail.html?id=xxx`
4. 详情页显示完整任务信息（需求、预算、工期、技术栈）
5. 详情页显示完整发布方信息（头像、认证、评分、统计）
6. 收藏按钮可切换状态，刷新页面保持状态
7. 分享按钮复制链接到剪贴板
8. 返回大厅按钮正确跳转
9. 浏览器返回按钮正常工作

### 响应式测试
1. 桌面端（>1024px）：抽屉宽度 400px，详情页左右分栏
2. 平板端（768-1024px）：抽屉全宽，详情页上下堆叠
3. 移动端（<768px）：抽屉全宽，详情页单列布局

### 边界测试
1. URL 无任务 ID：显示错误状态
2. URL 任务 ID 不存在：显示空状态
3. 数据字段缺失：显示默认值/占位符

---

## 风险点

1. **数据一致性**: 需确保 Mock 数据包含所有必需字段，否则页面可能渲染异常
2. **权限控制**: 联系方式是否需要"接取后可见"的权限设计（需与用户确认）
3. **性能**: 大量任务时，抽屉数据加载速度（建议按需加载）
