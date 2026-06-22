# 任务详情页设计文档 v2.0

**版本**: v2.0
**创建日期**: 2026-04-08
**修订日期**: 2026-04-08
**修订原因**: 根据技术评审意见，收紧需求边界，修复数据契约和安全问题
**状态**: 待评审

---

## 1. 需求理解

### 1.1 核心需求（已收紧）

**为任务大厅新增任务详情展示功能，采用 Indeed 风格的两级导航模式**：

1. **第一级 - 侧边抽屉预览**：点击任务卡片，右侧滑出抽屉，展示任务摘要信息
2. **第二级 - 完整详情页**：抽屉内点击"查看详情"按钮，跳转到独立页面展示完整信息

**重要变更**：
- ❌ **移除**：接取任务、竞标投稿、联系发布方等交易动作（留待后续版本）
- ❌ **移除**：收藏、分享功能（简化范围，专注展示）
- ✅ **保留**：纯展示功能（查看任务信息、查看发布方信息）

### 1.2 功能范围

#### 侧边抽屉预览（第一级）
- 任务基本信息（标题、预算、工期、技术栈）
- 任务摘要描述
- 发布方简要信息（昵称、头像、认证状态）
- "查看详情"按钮（跳转到完整详情页）
- 关闭按钮 / ESC 键 / 遮罩点击关闭

#### 完整详情页（第二级）
- **任务完整信息**
  - 标题、状态、类别
  - 完整需求描述（支持多段落结构）
  - 具体要求列表
  - 交付物清单
  - 预算范围、交付模式
  - 工期天数、截止日期、发布时间
  - 技术栈标签

- **发布方完整信息**
  - 昵称、头像、认证状态
  - 信用评分（5星制）
  - 评价数量
  - 历史发布任务数
  - 任务完成率
  - ~~联系方式~~（已移除，显示占位符"接取任务后可见"）

- **页面导航**
  - 返回大厅按钮（使用 `history.back()` 保留筛选上下文）
  - 面包屑导航：任务大厅 > 任务详情

### 1.3 非功能需求
- 响应式设计，适配桌面/平板/移动端
- 符合现有 Dribbble 风格（纯白背景 + 科技蓝强调色）
- 保持与任务大厅的视觉一致性
- 完整的状态处理：loading、empty、error
- 基础可访问性支持（`aria` 属性、键盘关闭）

---

## 2. 技术方案

### 2.1 架构设计

```
任务大厅 (task-hall.html)
    │
    ├── 点击任务卡片
    │   └── 任务预览抽屉（命名隔离：.task-preview-drawer）
    │       ├── 任务基本信息
    │       ├── 发布方简要信息
    │       └── [查看详情] → history.pushState 跳转
    │
    └── 点击"查看详情"
        └── 详情页 (task-detail.html)
            ├── 完整需求描述
            ├── 发布方完整信息
            ├── [返回大厅] → history.back()（保留筛选上下文）
            └── 面包屑导航
```

### 2.2 数据模型（兼容现有契约）

#### 扩展策略：保留 + 补充

**现有字段（保留不变）**：
```javascript
{
    "id": "task-001",
    "title": "企业官网开发",
    "clientName": "某科技公司",  // ← 保留！大厅列表和搜索依赖此字段
    "summary": "需要搭建响应式企业官网...",
    "category": "web",
    "stacks": ["react", "typescript", "nextjs"],
    "deliveryMode": "milestone",
    "budgetMin": 5000,
    "budgetMax": 10000,
    "durationDays": 14,
    "deadline": "2026-04-30",
    "status": "recruiting",
    "updatedAt": "2026-04-03T10:00:00+08:00"
}
```

**新增字段（补充详情展示）**：
```javascript
{
    // === 任务扩展字段 ===
    "description": "完整需求描述，支持多段落...",  // 详细需求
    "requirements": [                             // 具体要求列表
        "响应式设计，适配桌面和移动端",
        "集成第三方支付接口",
        "SEO 优化"
    ],
    "deliverables": [                             // 交付物清单
        "源代码（Git 仓库）",
        "部署文档",
        "技术文档"
    ],
    "publishedAt": "2026-04-01T09:00:00+08:00",  // 发布时间

    // === 发布方完整信息 ===
    "publisher": {
        "id": "user-001",                        // 新增：发布方 ID
        "name": "某科技公司",                     // 新增：发布方名称（与 clientName 一致）
        "avatar": "https://cdn.example.com/avatar.jpg",  // 头像URL
        "verified": true,                                // 认证状态
        "rating": 4.8,                                   // 信用评分（5星制，0-5）
        "reviewCount": 25,                               // 评价数量
        "publishedCount": 12,                            // 历史发布数
        "completionRate": 91.7                           // 完成率（%）
        // 已移除：contact 字段（安全原因）
    }
}
```

**兼容性保证**：
- ✅ 保留 `clientName` 字段，确保大厅列表和搜索功能不受影响
- ✅ 新增 `publisher` 字段作为补充，详情页使用 `publisher.name`
- ✅ 数据契约向后兼容，现有代码无需修改

### 2.3 页面跳转设计

#### 侧边抽屉（命名隔离）
- **组件类名**：`.task-preview-drawer`（不使用全局 `.drawer`，避免影响筛选抽屉）
- **触发方式**：点击任务卡片任意位置
- **显示宽度**：
  - 桌面端：420px（比筛选抽屉稍宽，适配更丰富内容）
  - 移动端：100%（全屏）
- **关闭方式**：遮罩点击、关闭按钮、ESC 键
- **焦点管理**：打开时聚焦到抽屉容器，关闭时恢复到触发卡片

#### 详情页（新增独立页面）
- **URL 设计**：`task-detail.html?id={taskId}`
- **返回方式**：`history.back()`（自动保留筛选上下文）
- **初始化**：通过 `task-detail-main.js` 统一入口

### 2.4 组件复用与隔离策略

| 组件 | 现有位置 | 复用方式 | 注意事项 |
|------|----------|----------|----------|
| 全局 `.drawer` | components.css:508-587 | ❌ 不复用 | 使用新的 `.task-preview-drawer` 避免样式冲突 |
| 筛选抽屉 | task-hall.html:275-293 | ❌ 不复用 | 移动端全屏时自然互斥 |
| `.btn-*` | components.css:86-164 | ✅ 直接复用 | - |
| `.status-badge` | components.css:456-479 | ✅ 直接复用 | - |
| `.task-card__tag` | task-hall.css:379-398 | ✅ 复用于详情页 | - |

### 2.5 共享抽象层（新增）

**新增文件**：`assets/js/task-view-model.js`

职责：抽屉和详情页共享的数据格式化、状态映射、默认值处理

```javascript
/**
 * 任务视图模型 - 共享格式化逻辑
 */
const TaskViewModel = {
    // 格式化发布方名称（兼容处理）
    getPublisherName(task) {
        return task.publisher?.name || task.clientName || '未知发布方';
    },

    // 格式化评分（5星制）
    formatRating(rating) {
        if (typeof rating !== 'number') return null;
        return {
            value: rating,
            stars: Math.round(rating),
            maxStars: 5
        };
    },

    // 格式化状态徽章类名
    getStatusClass(status) {
        const statusMap = {
            'recruiting': 'success',
            'in-progress': 'primary',
            'closed': 'gray'
        };
        return statusMap[status] || 'gray';
    },

    // 获取发布方头像（默认值处理）
    getPublisherAvatar(publisher) {
        return publisher?.avatar || '/assets/images/default-avatar.png';
    },

    // 格式化完成率
    formatCompletionRate(rate) {
        if (typeof rate !== 'number') return null;
        return `${rate.toFixed(1)}%`;
    }
};
```

### 2.6 服务层接口（新增）

**修改文件**：`assets/js/task-service.js`

新增 `getTaskById` 函数，并修复并发加载问题：

```javascript
/**
 * 根据任务 ID 获取任务详情
 * @param {string} taskId - 任务 ID
 * @returns {Promise<Object|null>} 任务对象或 null
 */
async function getTaskById(taskId) {
    try {
        const tasks = await fetchTasks();
        return tasks.find(task => task.id === taskId) || null;
    } catch (error) {
        console.error(`获取任务详情失败 [${taskId}]:`, error);
        return null;
    }
}
```

**修复并发加载问题**：
- 原有逻辑：`isLoading` 等待期间，请求失败会导致悬挂 Promise
- 修复方案：添加超时机制和错误清理，确保失败后状态正确重置

### 2.7 详情页初始化链路

**新增文件**：`task-detail-main.js`

```javascript
/**
 * 任务详情页统一入口
 * 职责：初始化共享布局、注入登录态、初始化详情页逻辑
 */
import { initSharedLayout } from './shared-layout.js';
import { initTaskDetail } from './task-detail.js';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 1. 初始化共享布局（导航栏、页脚、回到顶部）
    await initSharedLayout();

    // 2. 初始化详情页逻辑
    await initTaskDetail();
});
```

**HTML 引用**：
```html
<script type="module" src="./assets/js/task-detail-main.js"></script>
```

### 2.8 状态管理

#### URL 参数同步
- 抽屉打开：无 URL 变化（纯前端状态）
- 详情页：`task-detail.html?id={taskId}`

#### 返回上下文保留
- 使用 `history.back()` 而非硬编码跳转
- 自动保留筛选条件、排序、页码等上下文

#### 联系方式显示策略
- 不在 Mock 数据中存储真实联系方式
- 详情页显示占位符："接取任务后可见联系方式"
- 避免敏感信息泄露

---

## 3. 文件改动清单

### 3.1 新增文件

| 文件路径 | 说明 | L3文档 |
|----------|------|--------|
| `task-detail.html` | 任务详情页主文件 | ✅ 需要 |
| `task-detail-main.js` | 详情页统一入口（初始化共享布局） | ✅ 需要 |
| `assets/css/task-detail.css` | 详情页专用样式 | ✅ 需要 |
| `assets/js/task-detail.js` | 详情页交互逻辑 | ✅ 需要 |
| `assets/js/task-preview-drawer.js` | 任务预览抽屉组件（命名隔离） | ✅ 需要 |
| `assets/js/task-view-model.js` | 共享视图模型（格式化逻辑） | ✅ 需要 |

### 3.2 修改文件

| 文件路径 | 改动内容 | 影响范围 |
|----------|----------|----------|
| `assets/data/tasks.mock.json` | 补充详情展示字段，保留 `clientName` | 数据层 |
| `task-hall.html` | 添加预览抽屉容器 DOM（使用新类名） | 页面结构 |
| `assets/js/task-hall.js` | 添加卡片点击事件，调用预览抽屉组件 | 交互逻辑 |
| `assets/js/task-service.js` | 新增 `getTaskById()`，修复并发问题 | 服务层 |
| `assets/js/CLAUDE.md` | 更新 JS 模块文档 | 文档 |
| `assets/css/CLAUDE.md` | 更新 CSS 模块文档 | 文档 |
| `设计文档/CLAUDE.md` | 新增本文档索引 | 文档 |

### 3.3 目录结构变化

```
公会/
├── task-detail.html              # 新增：详情页
├── task-hall.html                # 修改：添加预览抽屉容器
├── assets/
│   ├── css/
│   │   ├── task-detail.css       # 新增：详情页样式
│   │   └── ...
│   ├── js/
│   │   ├── task-detail-main.js   # 新增：详情页入口
│   │   ├── task-detail.js        # 新增：详情页逻辑
│   │   ├── task-preview-drawer.js # 新增：预览抽屉组件
│   │   ├── task-view-model.js    # 新增：共享视图模型
│   │   ├── task-service.js       # 修改：新增 getTaskById
│   │   └── task-hall.js          # 修改：集成抽屉调用
│   └── data/
│       └── tasks.mock.json       # 修改：补充字段，保留 clientName
└── 设计文档/
    └── task-detail-page-v2.md    # 新增：本文档
```

---

## 4. 风险点与缓解措施

### 4.1 数据一致性风险（已缓解）

| 风险 | 缓解措施 |
|------|----------|
| 数据字段缺失导致页面渲染异常 | 新增 `TaskViewModel` 提供默认值处理 |
| 联系方式泄露风险 | ❌ 移除敏感字段，显示占位符 |

### 4.2 兼容性风险（已缓解）

| 风险 | 缓解措施 |
|------|----------|
| 修改数据模型破坏大厅列表 | ✅ 保留 `clientName`，使用兼容策略 |
| 抽屉样式影响现有筛选抽屉 | ✅ 使用 `.task-preview-drawer` 命名隔离 |

### 4.3 交互体验风险（已缓解）

| 风险 | 缓解措施 |
|------|----------|
| 移动端抽屉与筛选抽屉冲突 | 全屏设计自然互斥，桌面端互不冲突 |
| 返回后丢失筛选上下文 | ✅ 使用 `history.back()` 保留上下文 |
| 并发加载导致页面卡住 | ✅ 修复 `task-service.js` 悬挂 Promise 问题 |

### 4.4 初始化风险（已缓解）

| 风险 | 缓解措施 |
|------|----------|
| 详情页缺少共享布局初始化 | ✅ 新增 `task-detail-main.js` 统一入口 |

---

## 5. 实施细则

### 5.1 实施顺序

#### 阶段一：数据层与服务层（1-2 小时）
1. ✅ 更新 `tasks.mock.json`，补充详情字段（保留 `clientName`）
2. ✅ 新增 `task-view-model.js`，实现共享格式化逻辑
3. ✅ 修改 `task-service.js`：
   - 新增 `getTaskById()` 函数
   - 修复并发加载悬挂 Promise 问题

#### 阶段二：预览抽屉组件（2-3 小时）
1. ✅ 创建 `task-preview-drawer.js`（使用 `.task-preview-drawer` 命名隔离）
   - `openDrawer(taskId)` - 打开抽屉
   - `closeDrawer()` - 关闭抽屉
   - `renderDrawerContent(task)` - 渲染抽屉内容（调用 `TaskViewModel`）
2. ✅ 在 `task-hall.html` 添加抽屉容器 DOM
3. ✅ 在 `task-hall.js` 中集成抽屉调用
4. ✅ 新增抽屉专用样式（不修改全局 `.drawer`）

#### 阶段三：详情页开发（4-5 小时）
1. ✅ 创建 `task-detail.html` 页面结构
2. ✅ 创建 `task-detail-main.js` 统一入口
3. ✅ 创建 `task-detail.js` 交互逻辑
   - URL 参数解析
   - 任务数据加载（调用 `getTaskById()`）
   - 状态处理（loading/empty/error）
4. ✅ 创建 `task-detail.css` 样式
5. ✅ 实现响应式布局

#### 阶段四：联调测试（1-2 小时）
1. ✅ 测试抽屉打开/关闭交互
2. ✅ 测试详情页跳转和返回（验证上下文保留）
3. ✅ 测试所有状态场景（loading/empty/error）
4. ✅ 测试响应式适配
5. ✅ 测试边界情况（无效 ID、缺失数据）

#### 阶段五：文档更新（0.5 小时）
1. ✅ 更新 `assets/js/CLAUDE.md`
2. ✅ 更新 `assets/css/CLAUDE.md`
3. ✅ 更新 `设计文档/CLAUDE.md` 索引

### 5.2 关键代码示例

#### 抽屉组件（命名隔离）
```javascript
// task-preview-drawer.js
const TaskPreviewDrawer = {
    drawer: null,
    overlay: null,

    init() {
        this.drawer = document.getElementById('taskPreviewDrawer');
        this.overlay = document.getElementById('taskPreviewDrawerOverlay');

        // 关闭事件
        this.overlay.addEventListener('click', () => this.close());
        this.drawer.querySelector('.close-btn')?.addEventListener('click', () => this.close());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    },

    async open(taskId) {
        const task = await TaskService.getTaskById(taskId);
        if (!task) return;

        this.drawer.innerHTML = this.renderContent(task);
        this.drawer.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // 锁定滚动
    },

    close() {
        this.drawer.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
};
```

#### 详情页入口（统一初始化）
```javascript
// task-detail-main.js
import { initSharedLayout } from './shared-layout.js';
import { initTaskDetail } from './task-detail.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initSharedLayout();
    await initTaskDetail();
});
```

#### 详情页逻辑
```javascript
// task-detail.js
export async function initTaskDetail() {
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('id');

    if (!taskId) {
        showErrorState('任务 ID 缺失');
        return;
    }

    showLoadingState();

    const task = await TaskService.getTaskById(taskId);

    if (!task) {
        showErrorState('任务不存在');
        return;
    }

    renderTaskDetail(task);
}

function renderTaskDetail(task) {
    // 使用 TaskViewModel 格式化数据
    const publisherName = TaskViewModel.getPublisherName(task);
    const rating = TaskViewModel.formatRating(task.publisher?.rating);
    // ... 渲染逻辑
}
```

### 5.3 样式规范（命名隔离）

#### 预览抽屉样式（不影响全局）
```css
/* task-detail.css */
.task-preview-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 420px;  /* 桌面端宽度，不影响全局 .drawer */
    height: 100%;
    background: white;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
}

.task-preview-drawer.active {
    transform: translateX(0);
}

@media (max-width: 768px) {
    .task-preview-drawer {
        width: 100%;  /* 移动端全屏 */
    }
}
```

### 5.4 测试检查清单

- [ ] 点击任务卡片，预览抽屉滑出（不影响筛选抽屉样式）
- [ ] 抽屉内容正确显示（调用 `TaskViewModel` 格式化）
- [ ] 点击"查看详情"，跳转到 `task-detail.html?id=xxx`
- [ ] 详情页显示完整信息
- [ ] 点击"返回大厅"，保留筛选上下文
- [ ] 无效 ID 显示错误状态
- [ ] 数据缺失显示默认值
- [ ] 移动端预览抽屉全屏显示
- [ ] 详情页共享布局正确初始化（导航栏、页脚、回到顶部）

---

## 6. 附录

### 6.1 评审意见响应

| 评审编号 | 评审意见 | 响应 |
|----------|----------|------|
| 1 | 需求边界扩大 | ✅ 已收紧：移除交易动作，仅保留展示功能 |
| 2 | 联系方式权限控制错误 | ✅ 已修复：移除敏感字段，显示占位符 |
| 3 | 数据契约冲击现有列表 | ✅ 已兼容：保留 `clientName` |
| 4 | 详情页初始化链路缺失 | ✅ 已补充：新增 `task-detail-main.js` |
| 5 | 抽屉样式影响全局 | ✅ 已隔离：使用 `.task-preview-drawer` |
| 6 | 服务层接口未定义 | ✅ 已补充：新增 `getTaskById()` |
| 7 | 角色/状态矩阵缺失 | ✅ 已简化：本版本不区分角色 |
| 8 | 返回上下文未定义 | ✅ 已确定：使用 `history.back()` |
| 9 | 加载状态不完整 | ✅ 已补充：loading/empty/error 状态 |
| 10 | 抽屉/详情页无共享抽象 | ✅ 已补充：新增 `TaskViewModel` |
| 14 | 并发加载悬挂 Promise | ✅ 已修复：改进错误处理 |
| 15 | 联系方式泄露风险 | ✅ 已修复：见第2条 |

### 6.2 参考文件
- 现有任务大厅：`task-hall.html`、`assets/js/task-hall.js`
- 任务配置：`assets/js/task-config.js`
- 数据服务：`assets/js/task-service.js`
- 共享布局：`assets/js/shared-layout.js`

### 6.3 待后续版本处理
- 接取任务 / 竞标投稿功能
- 联系方式权限控制（需后端支持）
- 收藏 / 分享功能
- 角色区分（客户 / 开发者）
- 完整的焦点陷阱和键盘导航

---

**文档结束**
