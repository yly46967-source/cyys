# 任务详情页功能模块代码实施细则

**文档类型**: 功能模块代码实施指南
**创建日期**: 2026-04-08
**基于方案**: plans/calm-popping-starfish.md
**目标**: 将设计方案转换为可执行的编码步骤

---

## A. 需求理解与工程假设

### A.1 目标复述

为任务大厅新增任务详情展示功能，采用 **Indeed 风格两级导航**：
1. **第一级**：点击任务卡片 → 侧边抽屉预览摘要信息
2. **第二级**：抽屉内点击"查看详情" → 跳转独立详情页展示完整信息

### A.2 原方案模糊点 / 缺失点 / 潜在冲突

| # | 问题点 | 原方案描述 | 潜在冲突 |
|---|--------|-----------|----------|
| 1 | 数据契约兼容性 | 新增 `publisher` 对象，未说明 `clientName` 去留 | 大厅列表和搜索依赖 `task.clientName`，移除会导致搜索和卡片渲染异常 |
| 2 | 抽屉样式复用 | 直接复用 `.drawer`，调整为 400px | 任务大厅已有筛选抽屉使用全局 `.drawer`，改宽度会影响筛选抽屉 |
| 3 | 联系方式权限 | `contact` 字段放在静态 JSON，又说"需权限控制" | 前端静态数据无法实现真实权限控制，敏感信息已泄露 |
| 4 | 详情页入口缺失 | 只提到 `task-detail.html` 和 `task-detail.js` | 其他页面使用 `*-main.js` 初始化共享布局，缺失可能导致导航栏/页脚/回到顶部不工作 |
| 5 | 收藏状态同步 | "本地存储"但未定义 key 结构和跨页面同步 | 抽屉和详情页收藏状态可能不一致 |
| 6 | 抽屉互斥关系 | 未考虑与现有筛选抽屉的关系 | 移动端两个抽屉可能同时打开，交互冲突 |
| 7 | 返回上下文保留 | 未说明如何处理筛选条件和页码 | 用户从筛选后的第 N 页进入详情，返回后丢失上下文 |
| 8 | 服务层接口 | 只说"调用 task-service.js"，未定义具体函数 | 抽屉和详情页可能各自实现数据获取，代码重复 |
| 9 | 分享功能降级 | 未说明 `navigator.clipboard` 不可用时如何处理 | 旧浏览器或隐私模式下分享功能失效 |
| 10 | 交易动作边界 | 包含"接取/竞标/联系发布方"等动作 | 引入角色权限、状态流转等复杂逻辑，超出纯展示需求 |

### A.3 工程假设（用于推进实施）

| # | 假设内容 | 理由 | 风险等级 |
|---|----------|------|----------|
| H1 | **保留 `clientName` 字段**，新增 `publisher` 作为补充，`publisher.name` 与 `clientName` 保持一致 | 向后兼容，确保大厅列表和搜索不受影响 | 低 |
| H2 | **抽屉使用命名隔离**：`.task-preview-drawer`，不修改全局 `.drawer` 样式 | 避免影响现有筛选抽屉 | 低 |
| H3 | **移除 `contact` 字段**，详情页显示占位符"接取任务后可见" | 静态数据无法实现真实权限控制，避免信息泄露 | 中 |
| H4 | **新增 `task-detail-main.js` 作为统一入口**，调用 `initSharedLayout()` 和详情页逻辑 | 确保共享布局（导航栏/页脚/回到顶部）正常工作 | 低 |
| H5 | **移除收藏/分享功能**，简化为纯展示页面 | 避免状态同步复杂度和兼容性问题 | 低 |
| H6 | **实现抽屉互斥**：打开预览抽屉时关闭筛选抽屉，统一管理 `body overflow` | 避免移动端双抽屉冲突 | 中 |
| H7 | **使用 `history.back()` 返回**，自动保留筛选上下文 | 浏览器自动处理 URL 参数恢复 | 低 |
| H8 | **在 `task-service.js` 新增 `getTaskById(taskId)` 函数** | 统一数据获取接口，避免代码重复 | 低 |
| H9 | **移除接取/竞标/联系发布方等交易动作** | 收紧需求边界，避免引入角色权限复杂度 | 中 |
| H10 | **评分采用 5 星制**，`rating` 字段范围 0-5 | 需明确评分语义，避免 UI 显示错误 | 低 |

---

## B. 实施边界

### B.1 本次要做内容

| 模块 | 功能点 | 优先级 |
|------|--------|--------|
| **数据层** | 扩展任务数据模型，补充详情展示字段 | P0 |
| **预览抽屉** | 点击任务卡片滑出抽屉，展示摘要信息 | P0 |
| **详情页** | 独立页面展示完整任务和发布方信息 | P0 |
| **状态处理** | loading / empty / error 状态 | P0 |
| **响应式** | 桌面/平板/移动端布局适配 | P1 |
| **共享抽象** | 抽屉和详情页共用格式化逻辑 | P1 |

### B.2 本次不做内容

| 功能 | 原因 | 后续版本 |
|------|------|----------|
| 接取任务 / 竞标投稿 | 引入角色权限和状态流转，超出纯展示需求 | v2.0 |
| 联系发布方（真实数据） | 需后端权限控制支持 | v2.0 |
| 收藏任务 | 需跨页面状态同步，当前版本简化 | v2.0 |
| 分享任务 | 需兼容性降级处理，当前版本简化 | v2.0 |
| 角色区分（客户/开发者） | 当前版本所有用户看到相同内容 | v2.0 |

### B.3 对现有系统的依赖前提

| 依赖项 | 依赖内容 | 验证方式 |
|--------|----------|----------|
| 共享布局系统 | `shared-layout.js` 的 `initSharedLayout()` 函数 | 检查函数是否存在可调用 |
| 任务服务层 | `task-service.js` 的 `fetchTasks()` 函数 | 检查函数是否正常返回数据 |
| 任务配置枚举 | `task-config.js` 的状态、类别等枚举定义 | 检查枚举是否包含所需映射 |
| CSS 变量系统 | `base.css` 的颜色、间距等变量 | 检查变量是否在详情页可用 |
| 筛选抽屉组件 | `task-hall.js` 的 `FilterDrawer` 全局对象 | 检查是否存在 `isOpen()` 和 `close()` 方法 |

---

## C. 架构与模块设计

### C.1 涉及模块

```
┌─────────────────────────────────────────────────────────────┐
│                        任务大厅模块                           │
│  ┌────────────────┐      ┌────────────────┐                 │
│  │ task-hall.html │ ───▶ │ task-hall.js   │                 │
│  └────────────────┘      └────────────────┘                 │
│                                  │                           │
│                                  ▼                           │
│                        ┌────────────────┐                   │
│                        │ task-preview-  │ (新增)            │
│                        │ drawer.js      │                   │
│                        └────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                        详情页模块 (新增)                      │
│  ┌────────────────┐      ┌────────────────┐                 │
│  │ task-detail-   │ ───▶ │ task-detail-   │                 │
│  │ main.js        │      │ js             │                 │
│  └────────────────┘      └────────────────┘                 │
│                                  │                           │
│                        ┌─────────┴─────────┐                │
│                        ▼                   ▼                │
│              ┌──────────────┐    ┌──────────────┐          │
│              │ task-view-   │    │ task-service │          │
│              │ model.js     │    │ .js (修改)   │          │
│              └──────────────┘    └──────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### C.2 模块职责

| 模块 | 文件 | 职责 | 接口 |
|------|------|------|------|
| **预览抽屉** | `task-preview-drawer.js` | 管理任务预览抽屉的开关、渲染、事件处理 | `open(taskId, triggerElement)`, `close()`, `isOpen()` |
| **视图模型** | `task-view-model.js` | 提供任务数据的格式化、默认值处理、状态映射 | `getPublisherName()`, `formatRating()`, 等 getter 函数 |
| **详情页入口** | `task-detail-main.js` | 详情页统一入口，初始化共享布局和详情页逻辑 | 无（模块初始化） |
| **详情页逻辑** | `task-detail.js` | 详情页的数据加载、状态处理、事件绑定 | `initTaskDetail()` |
| **任务服务** | `task-service.js` | 提供任务数据获取接口 | `getTaskById(taskId)` (新增) |

### C.3 模块依赖关系

```
task-hall.js
    │
    ├── 调用 ───▶ task-preview-drawer.js
    │                   │
    │                   ├── 调用 ───▶ task-service.js (getTaskById)
    │                   └── 调用 ───▶ task-view-model.js
    │
task-detail-main.js
    │
    ├── 调用 ───▶ shared-layout.js (initSharedLayout)
    │
    └── 调用 ───▶ task-detail.js
                        │
                        ├── 调用 ───▶ task-service.js (getTaskById)
                        └── 调用 ───▶ task-view-model.js
```

### C.4 数据流

```
用户操作 → 事件监听器 → 服务层 → 数据获取 → 视图模型 → UI 渲染
   │                                                           │
   │                    ┌─────────────────────────────────────┘
   │                    │
   ▼                    ▼
点击任务卡片      task-service.js
                 getTaskById(taskId)
                        │
                        ▼
                 tasks.mock.json
                        │
                        ▼
                 返回 task 对象
                        │
                        ▼
            task-view-model.js 格式化
                        │
                        ▼
                 生成渲染数据
                        │
                        ▼
                 抽屉/详情页渲染
```

### C.5 状态流

```
┌─────────────┐
│ 页面初始状态 │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  ID 解析    │ ──▶ │  ID 有效?    │ ──▶ │  加载中     │
└─────────────┘     └─────────────┘     └──────┬──────┘
       │                                      │
       │            ┌─────────────┐           │
       │            │  ID 无效    │           │
       │            └──────┬──────┘           │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  空状态     │     │  错误状态   │     │  加载成功   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                              │
                                              ▼
                                     ┌─────────────┐
                                     │  数据渲染   │
                                     └─────────────┘
```

---

## D. 文件级实施清单

### D.1 新增文件

| 文件路径 | 类型 | 改动目的 | 改动要点 | 影响模块 |
|----------|------|----------|----------|----------|
| `task-detail.html` | 页面 | 详情页主文件 | 引用 `task-detail-main.js` 作为入口，定义页面骨架容器 | 详情页模块 |
| `assets/js/task-detail-main.js` | JS | 详情页统一入口 | 导入并调用 `initSharedLayout()` 和 `initTaskDetail()`，包裹在 try-catch 中 | 详情页模块 |
| `assets/js/task-detail.js` | JS | 详情页交互逻辑 | 解析 URL 参数，调用 `getTaskById()`，管理 loading/empty/error 状态，渲染详情页内容 | 详情页模块 |
| `assets/js/task-preview-drawer.js` | JS | 任务预览抽屉组件 | 实现抽屉开关、渲染、事件处理，与筛选抽屉互斥，管理焦点和滚动锁定 | 任务大厅模块 |
| `assets/js/task-view-model.js` | JS | 共享视图模型 | 提供任务数据的格式化函数，处理默认值和字段缺失 | 跨模块共享 |
| `assets/css/task-detail.css` | CSS | 详情页样式 | 定义详情页布局、发布方卡片、状态组件样式，响应式断点 | 详情页模块 |

### D.2 修改文件

| 文件路径 | 改动类型 | 改动目的 | 改动要点 | 影响面 | 回归检查点 |
|----------|----------|----------|----------|--------|-----------|
| `assets/data/tasks.mock.json` | 数据扩展 | 补充详情展示字段 | 为每个任务新增 `description`, `requirements`, `deliverables`, `publishedAt`, `publisher` 对象；**保留 `clientName` 字段** | 数据层 | 大厅列表搜索、卡片渲染、筛选功能 |
| `task-hall.html` | DOM 结构 | 添加预览抽屉容器 | 在 `</body>` 前添加抽屉 DOM 结构，使用 `.task-preview-drawer` 类名（命名隔离） | 任务大厅页面 | 确保不影响现有筛选抽屉和其他页面元素 |
| `assets/js/task-hall.js` | 事件绑定 | 集成预览抽屉调用 | 在 `taskList` 点击事件中调用 `TaskPreviewDrawer.open()`，传递卡片元素作为焦点恢复参考 | 任务大厅交互 | 确保卡片其他点击事件（如筛选）不受影响 |
| `assets/js/task-service.js` | 接口新增 | 新增详情查询接口 | 新增 `getTaskById(taskId)` 函数，内部调用 `fetchTasks()` 后查找匹配任务；修复并发加载悬挂 Promise 问题 | 服务层 | 确保现有 `fetchTasks()` 和 `queryTasks()` 不受影响 |

### D.3 文档更新文件

| 文件路径 | 改动目的 | 改动要点 |
|----------|----------|----------|
| `assets/js/CLAUDE.md` | 更新 JS 模块文档 | 新增 `task-preview-drawer.js`, `task-view-model.js`, `task-detail.js`, `task-detail-main.js` 的模块说明 |
| `assets/css/CLAUDE.md` | 更新 CSS 模块文档 | 新增 `task-detail.css` 的样式说明 |
| `设计文档/CLAUDE.md` | 更新设计文档索引 | 新增 `task-detail-page-v3.md` 的索引条目 |

---

## E. 分阶段实施步骤

### 阶段一：数据层与服务层（预计 1-2 小时）

#### Step 1.1：扩展任务 Mock 数据
**目标**：为任务数据补充详情展示所需字段，保持向后兼容

**具体改动**：
- 打开 `assets/data/tasks.mock.json`
- 遍历所有任务对象，为每个任务添加以下字段：
  - `description`: string（完整需求描述）
  - `requirements`: string[]（具体要求列表）
  - `deliverables`: string[]（交付物清单）
  - `publishedAt`: ISO 8601 日期字符串（发布时间）
  - `publisher`: object（发布方信息）
    - `id`: string（发布方唯一标识）
    - `name`: string（与 `clientName` 保持一致）
    - `avatar`: string 或 null（头像 URL）
    - `verified`: boolean（认证状态）
    - `rating`: number（0-5 信用评分）
    - `reviewCount`: number（评价数量）
    - `publishedCount`: number（历史发布数）
    - `completionRate`: number（完成率百分比）
- **重要**：保留原有的 `clientName` 字段，不要删除或修改

**完成标志**：
- 所有任务对象包含新增字段
- `clientName` 字段保持不变
- 文件保存后 JSON 格式正确

---

#### Step 1.2：创建共享视图模型
**目标**：提供统一的数据格式化和默认值处理逻辑

**具体改动**：
- 创建新文件 `assets/js/task-view-model.js`
- 定义 `TaskViewModel` 对象，包含以下方法：
  - `getPublisherName(task)`: 返回发布方名称，优先 `publisher.name`，回退到 `clientName`，默认"未知发布方"
  - `getPublisherAvatar(task)`: 返回头像 URL，不存在则返回默认头像路径
  - `formatRating(task)`: 返回评分对象 `{ value, stars, maxStars, display }`，处理 null/undefined
  - `getStatusClass(status)`: 返回状态对应的 CSS 类名（success/primary/gray）
  - `formatCompletionRate(task)`: 返回格式化的完成率字符串（如 "91.7%"）
  - `formatPublishedDate(task)`: 返回格式化的发布日期字符串
  - `getStacks(task)`: 返回技术栈数组，不存在则返回空数组
  - `getRequirements(task)`: 返回要求数组，不存在则返回空数组
  - `getDeliverables(task)`: 返回交付物数组，不存在则返回空数组
- 使用 ES6 导出语法：`export const TaskViewModel = { ... }`

**完成标志**：
- 文件创建成功
- 所有方法定义完成
- 每个方法都有默认值处理逻辑

---

#### Step 1.3：扩展任务服务层接口
**目标**：新增按 ID 查询任务的接口，修复并发问题

**具体改动**：
- 打开 `assets/js/task-service.js`
- 新增函数 `async function getTaskById(taskId)`：
  - 内部调用 `fetchTasks()` 确保数据已加载
  - 使用 `Array.find()` 查找匹配 `id` 的任务
  - 找不到时返回 `null`，并在控制台输出警告
  - 添加 JSDoc 注释说明参数和返回值
- 修复并发加载悬挂 Promise 问题：
  - 在 `fetchTasks()` 的 `catch` 块中添加 `cachedTasks = []`，确保失败后状态重置
  - 在 `finally` 块中重置 `isLoading` 和 `fetchPromise`
- 使用 ES6 导出语法：`export { getTaskById }`

**前置依赖**：Step 1.1（数据已扩展）

**完成标志**：
- `getTaskById()` 函数定义完成
- 并发问题修复代码已添加
- 函数正确导出

---

### 阶段二：预览抽屉组件（预计 2-3 小时）

#### Step 2.1：创建抽屉 DOM 结构
**目标**：在任务大厅页面添加预览抽屉容器

**具体改动**：
- 打开 `task-hall.html`
- 在 `</body>` 闭合标签前添加以下 DOM 结构：
  ```html
  <!-- 任务预览抽屉 -->
  <div class="task-preview-drawer-overlay" id="taskPreviewDrawerOverlay" aria-hidden="true"></div>
  <aside class="task-preview-drawer" id="taskPreviewDrawer" aria-hidden="true" role="dialog" aria-modal="true" aria-label="任务预览">
      <!-- 动态内容容器 -->
  </aside>
  ```
- 确保 DOM 顺序在现有筛选抽屉之后，避免 z-index 冲突

**前置依赖**：无

**完成标志**：
- DOM 结构添加成功
- 元素 ID 和类名正确
- ARIA 属性已添加

---

#### Step 2.2：实现抽屉组件逻辑
**目标**：创建抽屉开关、渲染、事件处理逻辑

**具体改动**：
- 创建新文件 `assets/js/task-preview-drawer.js`
- 定义 `TaskPreviewDrawer` 对象，包含以下属性和方法：
  - 属性：`drawer`, `overlay`, `triggerElement`（用于焦点恢复）
  - `init()` 方法：绑定关闭事件（遮罩点击、ESC 键）
  - `isOpen()` 方法：检查抽屉是否打开
  - `async open(taskId, triggerElement)` 方法：
    1. 保存 `triggerElement` 用于焦点恢复
    2. 检查并关闭筛选抽屉（调用 `window.FilterDrawer?.close()`）
    3. 锁定 `body` 滚动（`overflow: hidden`）
    4. 调用 `getTaskById()` 获取任务数据
    5. 调用 `renderContent(task)` 渲染内容
    6. 添加 `active` 类显示抽屉
    7. 聚焦到抽屉内第一个可交互元素
  - `close()` 方法：
    1. 移除 `active` 类隐藏抽屉
    2. 恢复 `body` 滚动
    3. 焦点恢复到 `triggerElement`
  - `renderContent(task)` 方法：
    1. 使用 `TaskViewModel` 格式化数据
    2. 生成 HTML 字符串，包含：标题、状态徽章、摘要、发布方信息、预算工期、技术栈、"查看详情"按钮
    3. 注入到抽屉容器
- 使用 ES6 导出语法：`export const TaskPreviewDrawer = { ... }`

**前置依赖**：Step 1.2（视图模型）、Step 1.3（服务层）

**完成标志**：
- 文件创建成功
- 所有方法定义完成
- 与筛选抽屉互斥逻辑已实现
- 焦点管理和滚动锁定已实现

---

#### Step 2.3：集成抽屉到任务大厅
**目标**：在任务大厅页面集成抽屉调用

**具体改动**：
- 打开 `task-hall.html`
- 在现有 `<script>` 标签后添加新的导入语句：
  ```html
  <script type="module">
      import { TaskPreviewDrawer } from './assets/js/task-preview-drawer.js';
      window.TaskPreviewDrawer = TaskPreviewDrawer;
      TaskPreviewDrawer.init();
  </script>
  ```
- 打开 `assets/js/task-hall.js`
- 找到 `taskList` 的事件监听部分
- 在卡片点击处理中添加抽屉调用逻辑：
  - 判断点击的元素是否为任务卡片
  - 获取 `data-task-id` 属性
  - 调用 `TaskPreviewDrawer.open(taskId, card)`
  - 阻止默认行为和事件冒泡（避免与其他点击事件冲突）

**前置依赖**：Step 2.1（DOM 结构）、Step 2.2（抽屉组件）

**完成标志**：
- 导入语句添加成功
- 点击事件处理逻辑已添加
- 点击任务卡片能正确打开抽屉

---

#### Step 2.4：创建抽屉样式
**目标**：定义预览抽屉的样式，与现有抽屉隔离

**具体改动**：
- 创建新文件 `assets/css/task-detail.css`
- 定义 `.task-preview-drawer` 相关样式：
  - `.task-preview-drawer-overlay`：遮罩层样式（fixed 全屏，半透明黑色）
  - `.task-preview-drawer`：抽屉容器（fixed 右侧，宽度 420px，白色背景）
  - `.task-preview-drawer.active`：激活状态（transform 移除）
  - `.task-preview-drawer__header`：头部区域（标题 + 关闭按钮）
  - `.task-preview-drawer__body`：内容区域（可滚动）
  - `.task-preview-drawer__footer`：底部操作区
  - 响应式：移动端（<768px）宽度 100%
- 确保**不修改**全局 `.drawer` 样式
- 使用 CSS 变量（如 `--spacing-md`, `--color-primary`）保持风格一致
- 添加过渡动画（transform 0.3s ease）

**前置依赖**：Step 2.1（DOM 结构）

**完成标志**：
- 样式文件创建成功
- 抽屉能从右侧滑出
- 移动端全屏显示
- 不影响现有筛选抽屉样式

---

### 阶段三：详情页开发（预计 4-5 小时）

#### Step 3.1：创建详情页 HTML 结构
**目标**：定义详情页的骨架结构

**具体改动**：
- 创建新文件 `task-detail.html`
- 定义 HTML5 文档结构
- 在 `<head>` 中：
  - 设置页面标题
  - 引入 `base.css`, `components.css`, `task-detail.css`
  - 引入 `task-detail-main.js` 作为模块入口
- 在 `<body>` 中：
  - 添加 `<div data-layout="navbar"></div>`（导航栏容器）
  - 添加面包屑导航：`<nav class="breadcrumb">...</nav>`
  - 添加主内容区：`<main class="detail-page">...</main>`
    - 左侧内容区：`<div class="detail-content">...</div>`
    - 右侧侧边栏：`<aside class="detail-sidebar">...</aside>`
  - 添加状态容器：loading、empty、error（默认隐藏）
  - 添加 `<div data-layout="footer"></div>`（页脚容器）
  - 添加 `<div data-layout="back-to-top"></div>`（回到顶部容器）

**前置依赖**：无

**完成标志**：
- HTML 文件创建成功
- 页面结构完整
- 样式和脚本引用正确

---

#### Step 3.2：创建详情页入口文件
**目标**：实现详情页的统一初始化入口

**具体改动**：
- 创建新文件 `assets/js/task-detail-main.js`
- 导入依赖：
  ```javascript
  import { initSharedLayout } from './shared-layout.js';
  import { initTaskDetail } from './task-detail.js';
  ```
- 在 `DOMContentLoaded` 事件中：
  - 使用 try-catch 包裹整个初始化流程
  - 先调用 `await initSharedLayout()` 初始化共享布局
  - 再调用 `await initTaskDetail()` 初始化详情页逻辑
  - 捕获错误并显示全局错误状态

**前置依赖**：Step 3.1（HTML 结构）

**完成标志**：
- 文件创建成功
- 导入语句正确
- 初始化流程完整

---

#### Step 3.3：实现详情页交互逻辑
**目标**：实现详情页的数据加载和状态处理

**具体改动**：
- 创建新文件 `assets/js/task-detail.js`
- 定义 `async function initTaskDetail()`：
  - 从 URL 解析 `id` 参数
  - 如果 ID 不存在，显示空状态并返回
  - 调用 `showLoadingState()` 显示加载状态
  - 调用 `TaskService.getTaskById(taskId)` 获取任务数据
  - 如果任务不存在，显示空状态
  - 调用 `renderTaskDetail(task)` 渲染详情页
- 定义状态处理函数：
  - `showLoadingState()`：显示加载容器，隐藏其他
  - `showEmptyState()`：显示空状态容器
  - `showErrorState(message)`：显示错误状态并传递错误信息
  - `hideAllStates()`：隐藏所有状态容器
- 定义 `renderTaskDetail(task)`：
  - 调用 `hideAllStates()`
  - 使用 `TaskViewModel` 格式化所有数据
  - 渲染任务信息（标题、状态、描述、要求、交付物、预算、工期、技术栈）
  - 渲染发布方信息（头像、昵称、认证、评分、统计数据）
  - 渲染联系方式占位符："接取任务后可见"
  - 绑定"返回大厅"按钮点击事件（调用 `history.back()`）
- 使用 ES6 导出语法：`export { initTaskDetail }`

**前置依赖**：Step 1.2（视图模型）、Step 1.3（服务层）、Step 3.2（入口文件）

**完成标志**：
- 文件创建成功
- 所有函数定义完成
- 状态处理逻辑完整
- 渲染逻辑使用 `TaskViewModel`

---

#### Step 3.4：创建详情页样式
**目标**：定义详情页的布局和组件样式

**具体改动**：
- 打开 `assets/css/task-detail.css`
- 在 Step 2.4 的抽屉样式后添加详情页样式：
  - `.detail-page`：主容器（max-width 1200px，居中）
  - `.breadcrumb`：面包屑导航样式
  - `.detail-content`：左侧内容区（任务信息）
  - `.detail-sidebar`：右侧侧边栏（发布方信息）
  - `.detail-section`：通用区块样式（标题 + 内容）
  - `.detail-requirements`：要求列表样式
  - `.detail-deliverables`：交付物列表样式
  - `.detail-tags`：技术栈标签容器
  - `.publisher-card`：发布方卡片样式
  - `.publisher-avatar`：头像样式（圆形）
  - `.publisher-rating`：评分星级显示
  - `.publisher-stats`：统计数据网格
  - `.contact-placeholder`：联系方式占位符样式
  - `.detail-loading`, `.detail-empty`, `.detail-error`：状态组件样式
  - 响应式断点：
    - 桌面端（>1024px）：左右分栏
    - 平板/移动端（≤1024px）：单列堆叠
- 复用 CSS 变量和按钮组件样式

**前置依赖**：Step 3.1（HTML 结构）

**完成标志**：
- 样式定义完成
- 响应式断点设置正确
- 与现有风格保持一致

---

### 阶段四：联调测试（预计 2-3 小时）

#### Step 4.1：功能冒烟测试
**目标**：验证核心功能链路

**测试场景**：
1. 打开任务大厅，点击任意任务卡片
   - 预期：预览抽屉从右侧滑出
   - 预期：抽屉内容正确显示（标题、摘要、发布方、技术栈）
2. 在预览抽屉中点击"查看详情"按钮
   - 预期：跳转到 `task-detail.html?id=xxx`
3. 在详情页中检查所有信息是否正确显示
   - 预期：任务完整信息（描述、要求、交付物、预算、工期、技术栈）
   - 预期：发布方完整信息（头像、昵称、评分、统计数据）
4. 在详情页中点击"返回大厅"按钮
   - 预期：返回任务大厅，筛选条件和页码保留
5. 使用浏览器返回按钮
   - 预期：行为与"返回大厅"按钮一致

**完成标志**：
- 所有场景测试通过
- 无控制台错误
- UI 显示正常

---

#### Step 4.2：字段缺失测试
**目标**：验证数据字段的默认值处理

**测试场景**：
1. 在 `tasks.mock.json` 中临时移除 `publisher.avatar`
   - 预期：显示默认头像
2. 临时移除 `publisher.rating`
   - 预期：评分区域隐藏或显示"暂无评分"
3. 临时移除 `description`
   - 预期：描述区域隐藏
4. 临时移除 `requirements`
   - 预期：要求列表隐藏
5. 将 `stacks` 设为空数组
   - 预期：显示"暂无技术栈"

**完成标志**：
- 所有场景测试通过
- 无页面崩溃或渲染异常
- 默认值显示正确

---

#### Step 4.3：抽屉冲突测试
**目标**：验证预览抽屉与筛选抽屉的互斥关系

**测试场景**：
1. 在移动端打开筛选抽屉，然后点击任务卡片
   - 预期：筛选抽屉自动关闭，预览抽屉打开
2. 在移动端打开预览抽屉，然后点击筛选按钮
   - 预期：预览抽屉自动关闭，筛选抽屉打开
3. 按下 ESC 键
   - 预期：关闭当前打开的抽屉
4. 快速切换两个抽屉多次
   - 预期：不出现滚动锁定异常
   - 预期：焦点正确切换

**完成标志**：
- 所有场景测试通过
- 双抽屉不会同时打开
- 滚动锁定恢复正常

---

#### Step 4.4：响应式测试
**目标**：验证不同设备尺寸的布局适配

**测试场景**：
1. 桌面端（>1024px）
   - 预期：预览抽屉宽度 420px
   - 预期：详情页左右分栏
2. 平板端（768-1024px）
   - 预期：预览抽屉全宽
   - 预期：详情页单列堆叠
3. 移动端（<768px）
   - 预期：预览抽屉全宽
   - 预期：详情页单列布局
   - 预期：所有内容可读，无横向滚动

**完成标志**：
- 所有断点测试通过
- 布局切换正常
- 无样式错乱

---

### 阶段五：文档更新（预计 0.5 小时）

#### Step 5.1：更新模块文档
**目标**：同步更新 JS 和 CSS 模块文档

**具体改动**：
- 打开 `assets/js/CLAUDE.md`
- 在"文件成员清单"中添加：
  - `task-preview-drawer.js`：任务预览抽屉组件
  - `task-view-model.js`：共享任务数据视图模型
  - `task-detail.js`：任务详情页交互逻辑
  - `task-detail-main.js`：任务详情页统一入口
- 打开 `assets/css/CLAUDE.md`
- 在"文件成员清单"中添加：
  - `task-detail.css`：任务详情页和预览抽屉样式

**完成标志**：
- 模块文档更新完成
- 新增文件都有文档说明

---

## F. 关键实现约束

### F.1 状态管理约束

| 约束项 | 具体要求 | 原因 |
|--------|----------|------|
| 抽屉状态 | 通过 `.active` 类控制显示隐藏，不使用 JavaScript 状态变量 | 与现有筛选抽屉保持一致 |
| 详情页状态 | loading/empty/error 容器互斥显示，一次只显示一个状态 | 避免状态重叠 |
| URL 状态 | 详情页 ID 从 URL 参数读取，不存储在其他地方 | 支持浏览器前进后退 |
| 滚动锁定 | 抽屉打开时设置 `body { overflow: hidden }`，关闭时恢复 | 防止背景滚动 |
| 焦点状态 | 打开抽屉前保存触发元素，关闭后恢复焦点 | 可访问性要求 |

### F.2 接口设计约束

| 约束项 | 具体要求 | 原因 |
|--------|----------|------|
| `getTaskById(taskId)` | 必须返回 `null` 表示未找到，不抛出异常 | 调用方统一错误处理 |
| `TaskViewModel` 方法 | 所有方法必须处理 `undefined` / `null` 输入，返回安全默认值 | 防止字段缺失导致崩溃 |
| 抽屉 `open()` 方法 | 必须接受 `triggerElement` 参数用于焦点恢复 | 可访问性要求 |
| 详情页 `initTaskDetail()` | 必须为 `async` 函数，支持 `await` 调用 | 统一异步处理模式 |

### F.3 组件拆分约束

| 约束项 | 具体要求 | 原因 |
|--------|----------|------|
| 抽屉组件 | 独立文件 `task-preview-drawer.js`，不与 `task-hall.js` 耦合 | 可复用性和测试性 |
| 视图模型 | 独立文件 `task-view-model.js`，纯函数无副作用 | 可测试性和可维护性 |
| 详情页入口 | 独立文件 `task-detail-main.js`，与 `task-detail.js` 分离 | 职责单一，便于调试 |

### F.4 命名与目录规范

| 约束项 | 具体要求 | 原因 |
|--------|----------|------|
| 抽屉类名 | 使用 `.task-preview-drawer` 前缀，不使用全局 `.drawer` | 避免样式冲突 |
| 详情页文件 | 统一使用 `task-detail-*` 前缀 | 清晰的模块归属 |
| 视图模型方法 | 使用 `get*` 或 `format*` 前缀 | 明确的语义 |
| 状态容器类名 | 使用 `.detail-loading`, `.detail-empty`, `.detail-error` | 统一的状态命名 |

### F.5 错误处理与边界处理要求

| 约束项 | 具体要求 | 原因 |
|--------|----------|------|
| URL 参数缺失 | 显示空状态，不抛出错误 | 友好的用户体验 |
| 任务不存在 | 显示空状态，提供返回大厅按钮 | 友好的用户体验 |
| 数据加载失败 | 显示错误状态，提供重新加载按钮 | 允许用户重试 |
| 字段缺失 | 使用 `TaskViewModel` 提供默认值 | 防止页面崩溃 |
| 并发加载失败 | 在 `finally` 中重置状态，避免悬挂 Promise | 可靠性保证 |

---

## G. 风险、回归与测试建议

### G.1 风险点

| 风险点 | 描述 | 影响 | 缓解措施 |
|--------|------|------|----------|
| 数据契约不兼容 | 修改或删除 `clientName` 导致大厅搜索和卡片渲染异常 | 高 | 明确要求保留 `clientName`，新增 `publisher` 作为补充 |
| 抽屉样式冲突 | 修改全局 `.drawer` 样式影响筛选抽屉 | 中 | 使用 `.task-preview-drawer` 命名隔离 |
| 详情页初始化缺失 | 缺少 `task-detail-main.js` 导致共享布局不工作 | 中 | 明确要求创建入口文件 |
| 悬挂 Promise | 并发加载失败导致页面卡住 | 中 | 修复 `task-service.js` 的错误处理 |
| 抽屉互斥失效 | 移动端双抽屉同时打开 | 低 | 实现互斥逻辑，统一管理滚动锁定 |
| 返回上下文丢失 | 使用硬编码跳转导致筛选条件丢失 | 低 | 使用 `history.back()` 返回 |

### G.2 易出错点

| 出错点 | 错误表现 | 避免方法 |
|--------|----------|----------|
| 字段缺失处理 | 页面崩溃或显示 `undefined` | 使用 `TaskViewModel` 统一处理默认值 |
| 焦点管理 | 打开抽屉后焦点丢失 | 保存并恢复 `triggerElement` |
| 滚动锁定 | 关闭抽屉后背景仍不可滚动 | 在 `finally` 中确保恢复 `body.style.overflow` |
| URL 参数解析 | 直接访问详情页时 ID 为空 | 检查 `params.get('id')` 是否为 `null` |
| 事件冒泡 | 点击卡片内的按钮时触发抽屉 | 使用 `e.target.closest('.task-card')` 精确判断 |
| 响应式断点 | 移动端布局错乱 | 测试所有断点（>1024, 768-1024, <768） |

### G.3 回归检查点

| 检查点 | 检查内容 | 回归方式 |
|--------|----------|----------|
| 大厅列表渲染 | 确保任务卡片正常显示 | 打开任务大厅，检查所有卡片 |
| 大厅搜索功能 | 确保按 `clientName` 搜索正常工作 | 在搜索框输入发布方名称 |
| 筛选抽屉 | 确保筛选抽屉样式和功能不受影响 | 打开筛选抽屉，检查宽度和交互 |
| 翻页功能 | 确保页码跳转正常工作 | 点击不同页码 |
| 共享布局 | 确保导航栏、页脚、回到顶部正常显示 | 打开详情页，检查各组件 |

### G.4 建议补充的测试

| 测试类型 | 测试场景 | 测试方法 |
|----------|----------|----------|
| 字段缺失测试 | 逐个移除任务数据字段，验证默认值显示 | 手动修改 Mock 数据测试 |
| 并发测试 | 同时打开抽屉和详情页，验证数据加载 | 使用两个浏览器标签页 |
| 焦点测试 | 使用键盘 Tab 键导航，验证焦点顺序 | 仅使用键盘操作页面 |
| 性能测试 | 大量任务（100+）时抽屉打开速度 | 在 Mock 数据中添加更多任务 |
| 兼容性测试 | 不同浏览器（Chrome/Firefox/Safari） | 在各浏览器中测试 |

---

## H. 最终交付清单

### H.1 可见成果

| 成果类型 | 具体内容 | 验证方式 |
|----------|----------|----------|
| 用户可见功能 | 点击任务卡片可预览摘要 | 打开任务大厅，点击卡片 |
| 用户可见功能 | 点击"查看详情"可跳转详情页 | 在预览抽屉中点击按钮 |
| 用户可见功能 | 详情页显示完整任务和发布方信息 | 打开详情页，检查内容 |
| 用户可见功能 | 返回大厅保留筛选上下文 | 从筛选结果进入详情后返回 |
| 开发可见文件 | 6 个新增文件存在 | 检查文件系统 |
| 开发可见文件 | 4 个修改文件已更新 | 检查文件差异 |
| 开发可见文件 | 3 个文档文件已更新 | 检查文档内容 |

### H.2 应该存在的文件

**新增文件**（6个）：
```
公会/
├── task-detail.html
├── assets/
│   ├── js/
│   │   ├── task-preview-drawer.js
│   │   ├── task-view-model.js
│   │   ├── task-detail.js
│   │   └── task-detail-main.js
│   └── css/
│       └── task-detail.css
```

**修改文件**（4个）：
```
公会/
├── task-hall.html                  # 已添加抽屉 DOM
├── assets/
│   ├── data/
│   │   └── tasks.mock.json         # 已补充详情字段
│   └── js/
│       ├── task-hall.js            # 已集成抽屉调用
│       └── task-service.js         # 已新增 getTaskById()
```

**文档更新**（3个）：
```
公会/
└── assets/
    ├── js/
    │   └── CLAUDE.md               # 已更新模块清单
    └── css/
        └── CLAUDE.md               # 已更新模块清单
```

### H.3 应该可以跑通的流程

| 流程 | 入口 | 出口 | 验证步骤 |
|------|------|------|----------|
| **预览流程** | 任务大厅页面 | 预览抽屉打开 | 1. 打开 `task-hall.html`<br>2. 点击任意任务卡片<br>3. 确认抽屉滑出<br>4. 确认内容正确显示 |
| **详情页流程** | 预览抽屉 | 详情页加载完成 | 1. 在预览抽屉中点击"查看详情"<br>2. 确认 URL 变为 `task-detail.html?id=xxx`<br>3. 确认页面加载完成<br>4. 确认所有信息正确显示 |
| **返回流程** | 详情页 | 返回任务大厅 | 1. 在详情页点击"返回大厅"<br>2. 确认返回任务大厅<br>3. 确认筛选条件保留 |
| **状态处理流程** | 详情页（无效ID） | 显示空状态 | 1. 直接访问 `task-detail.html?id=invalid`<br>2. 确认显示空状态提示<br>3. 确认返回按钮可用 |
| **响应式流程** | 详情页（不同设备） | 布局正确适配 | 1. 调整浏览器宽度<br>2. 确认布局切换正确<br>3. 确认无横向滚动 |

---

**文档结束**

本实施细则基于设计方案 `plans/calm-popping-starfish.md` 生成，已在工程假设中对原方案的模糊点和潜在冲突给出了明确的处理方式，可直接用于指导编码实施。
