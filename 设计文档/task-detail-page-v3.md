# 任务详情页设计文档 v3.0

**版本**: v3.0
**创建日期**: 2026-04-08
**修订日期**: 2026-04-08
**修订原因**: 根据技术评审意见（20条）全面修订方案
**状态**: 待评审

---

## 附录：评审意见完整回应

### ✅ 完全采纳（19条）

| # | 问题 | 修改方案 |
|---|------|----------|
| **1** | 需求边界扩大：把"详情展示"扩展成"交易动作页" | **收回边界**：移除接取/竞标/联系发布方/收藏/分享等所有交易动作，仅保留纯展示功能 |
| **2** | 联系方式权限控制错误：前端遮罩不构成权限控制 | **移除敏感数据**：从 Mock 数据中删除所有 `contact` 字段，显示占位符"接取任务后可见" |
| **3** | 返回上下文未定义：筛选条件/页码会丢失 | **确定策略**：使用 `history.back()` 返回，自动保留 URL 参数；添加"返回大厅"按钮作为备用 |
| **4** | 移动端抽屉互斥关系未定义 | **互斥设计**：打开预览抽屉时自动关闭筛选抽屉（调用现有 `FilterDrawer.close()`）；统一管理 `body overflow` 和焦点 |
| **5** | 加载/异常/降级策略不完整 | **补充设计**：新增完整的 loading/empty/error 状态组件；分享功能移除（见第1条） |
| **6** | 角色/状态矩阵未定义 | **简化处理**：本版本不区分角色，移除所有交易动作按钮，仅展示信息 |
| **7** | 数据契约冲击现有列表 | **兼容策略**：保留 `clientName` 字段不变，新增 `publisher` 作为补充，`publisher.name` 与 `clientName` 保持一致 |
| **8** | 详情页初始化链路缺失 | **新增入口**：创建 `task-detail-main.js`，调用 `initSharedLayout()` 和详情页逻辑 |
| **9** | 直接复用全局 `.drawer` 会影响筛选抽屉 | **命名隔离**：使用 `.task-preview-drawer` 修饰符类，不修改全局 `.drawer` 样式 |
| **10** | 服务层接口未定义 | **新增接口**：在 `task-service.js` 中新增 `getTaskById(taskId)` 函数 |
| **11** | 缺少上下文恢复链路测试 | **补充测试**：新增测试用例验证返回后筛选条件、排序、页码完整恢复 |
| **12** | 缺少抽屉冲突和可访问性测试 | **补充测试**：新增双抽屉互斥、焦点管理、键盘关闭测试 |
| **13** | 缺少异常数据和字段缺失测试 | **补充测试**：新增字段缺失测试矩阵（avatar/rating/description/stacks 等） |
| **14** | 缺少分享/存储失败测试 | **移除功能**：分享/收藏功能已移除（见第1条），无需测试 |
| **15** | 缺少服务层并发失败测试 | **补充测试**：新增并发请求失败恢复测试 |
| **16** | `publisher` 数据结构不完整 | **补充字段**：新增 `id`、`name`、明确 5 星制评分；移除 `contact`（见第2条） |
| **17** | 抽屉/详情页无共享抽象 | **新增模块**：创建 `task-view-model.js` 共享格式化逻辑 |
| **18** | 服务层并发加载悬挂 Promise | **修复问题**：改进 `task-service.js` 错误处理，添加超时和状态重置 |
| **19** | 联系方式泄露风险 | **已纳入第2条**：移除敏感数据 |
| **20** | 收藏/分享状态双源问题 | **移除功能**：收藏/分享功能已移除（见第1条） |

### ❌ 不采纳（0条）

所有评审意见均被采纳或部分采纳。

---

## 1. 需求理解

### 1.1 核心需求（已明确边界）

**为任务大厅新增任务详情展示功能，采用 Indeed 风格的两级导航模式**：

1. **第一级 - 侧边抽屉预览**：点击任务卡片，右侧滑出抽屉，展示任务摘要信息
2. **第二级 - 完整详情页**：抽屉内点击"查看详情"按钮，跳转到独立页面展示完整信息

**明确排除的功能**（留待后续版本）：
- ❌ 接取任务 / 竞标投稿
- ❌ 联系发布方
- ❌ 收藏任务
- ❌ 分享任务
- ❌ 角色区分（客户/开发者）

### 1.2 功能范围

#### 侧边抽屉预览（第一级）
- 任务基本信息（标题、预算、工期、技术栈）
- 任务摘要描述
- 发布方简要信息（昵称、头像、认证状态）
- "查看详情"按钮（跳转到完整详情页）
- 关闭交互：遮罩点击、关闭按钮、ESC 键

#### 完整详情页（第二级）
- **任务完整信息**
  - 标题、状态、类别
  - 完整需求描述（多段落）
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
  - 联系方式占位符："接取任务后可见"（不存储真实数据）

- **页面导航**
  - 面包屑：任务大厅 > 任务详情
  - 返回大厅按钮：调用 `history.back()`（保留筛选上下文）

### 1.3 非功能需求
- 响应式设计，适配桌面/平板/移动端
- 符合现有 Dribbble 风格（纯白背景 + 科技蓝强调色）
- 完整的状态处理：loading、empty、error
- 基础可访问性支持（`aria` 属性、焦点管理）
- 移动端双抽屉互斥（预览抽屉与筛选抽屉）

---

## 2. 技术方案

### 2.1 架构设计

```
任务大厅 (task-hall.html)
    │
    ├── 点击任务卡片
    │   └── 任务预览抽屉（.task-preview-drawer，命名隔离）
    │       ├── 如果筛选抽屉打开 → 先关闭筛选抽屉（互斥）
    │       ├── 锁定 body 滚动
    │       ├── 聚焦到抽屉容器
    │       ├── 任务基本信息
    │       ├── 发布方简要信息
    │       └── [查看详情] → 跳转 task-detail.html?id=xxx
    │
    └── 点击"查看详情"
        └── 详情页 (task-detail.html)
            ├── task-detail-main.js 入口
            │   ├── 初始化共享布局（导航栏、页脚、回到顶部）
            │   └── 初始化详情页逻辑
            ├── 完整需求描述
            ├── 发布方完整信息
            ├── [返回大厅] → history.back()（保留筛选上下文）
            └── 状态处理：loading / empty / error
```

### 2.2 数据模型（兼容现有契约）

#### 扩展策略：保留 + 补充

**现有字段（保持不变，确保向后兼容）**：
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
    "description": "完整需求描述，支持多段落...",
    "requirements": [
        "响应式设计，适配桌面和移动端",
        "集成第三方支付接口",
        "SEO 优化"
    ],
    "deliverables": [
        "源代码（Git 仓库）",
        "部署文档",
        "技术文档"
    ],
    "publishedAt": "2026-04-01T09:00:00+08:00",

    // === 发布方完整信息 ===
    "publisher": {
        "id": "user-001",                    // 新增：发布方唯一标识
        "name": "某科技公司",                 // 新增：与 clientName 保持一致
        "avatar": "https://cdn.example.com/avatar.jpg",
        "verified": true,
        "rating": 4.8,                       // 5星制评分（0-5）
        "reviewCount": 25,
        "publishedCount": 12,
        "completionRate": 91.7
        // 已移除：contact 字段（安全原因）
    }
}
```

**兼容性保证**：
- ✅ `clientName` 保持不变，大厅列表和搜索无需修改
- ✅ `publisher.name` 与 `clientName` 保持一致
- ✅ 详情页优先使用 `publisher`，回退到 `clientName`

### 2.3 移动端抽屉互斥设计

**现状**：任务大厅已有筛选抽屉（`task-hall.html:275-293`）

**互斥规则**：
```javascript
// task-preview-drawer.js
const TaskPreviewDrawer = {
    async open(taskId) {
        // 1. 如果筛选抽屉打开，先关闭它
        if (window.FilterDrawer && window.FilterDrawer.isOpen()) {
            await window.FilterDrawer.close();
        }

        // 2. 锁定滚动（统一管理）
        document.body.style.overflow = 'hidden';

        // 3. 加载并渲染内容
        // ...
    },

    close() {
        // 关闭抽屉，恢复滚动
        document.body.style.overflow = '';
        // ...
    }
};
```

**焦点管理**：
- 打开抽屉：聚焦到抽屉容器的第一个可交互元素
- 关闭抽屉：焦点恢复到触发的任务卡片
- ESC 键：关闭当前打开的抽屉（筛选或预览）

### 2.4 页面跳转与上下文保留

**URL 设计**：
- 抽屉打开：无 URL 变化（纯前端状态）
- 详情页：`task-detail.html?id={taskId}`

**返回策略**：
```javascript
// task-detail.js
function handleBackToHall() {
    // 使用 history.back() 自动保留 URL 参数
    // 浏览器会自动恢复之前的筛选条件、排序、页码
    window.history.back();
}
```

**返回按钮**：作为备用方案（用户可能通过直接输入 URL 进入详情页）

### 2.5 服务层接口设计

**新增函数**：`assets/js/task-service.js`

```javascript
/**
 * 根据任务 ID 获取任务详情
 * @param {string} taskId - 任务 ID
 * @returns {Promise<Object|null>} 任务对象或 null
 */
async function getTaskById(taskId) {
    // 确保任务列表已加载
    const tasks = await fetchTasks();

    // 查找匹配的任务
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        console.warn(`任务不存在: ${taskId}`);
        return null;
    }

    return task;
}
```

**修复并发问题**：
```javascript
// 修复原有的悬挂 Promise 问题
let fetchPromise = null;
let isLoading = false;

async function fetchTasks(forceRefresh = false) {
    // 如果已有缓存且不强制刷新，直接返回
    if (cachedTasks && !forceRefresh) {
        return cachedTasks;
    }

    // 如果正在加载，等待现有请求
    if (isLoading && fetchPromise) {
        return fetchPromise;
    }

    isLoading = true;
    fetchPromise = (async () => {
        try {
            const response = await fetch('./assets/data/tasks.mock.json');
            if (!response.ok) throw new Error('加载失败');
            cachedTasks = await response.json();
            return cachedTasks;
        } catch (error) {
            console.error('加载任务数据失败:', error);
            cachedTasks = [];  // 失败时清空缓存，避免无限等待
            throw error;
        } finally {
            isLoading = false;
            fetchPromise = null;
        }
    })();

    return fetchPromise;
}
```

### 2.6 共享视图模型

**新增文件**：`assets/js/task-view-model.js`

```javascript
/**
 * 任务视图模型 - 共享格式化逻辑
 * 抽屉和详情页共用，避免重复代码
 */
const TaskViewModel = {
    // 获取发布方名称（兼容处理）
    getPublisherName(task) {
        return task.publisher?.name || task.clientName || '未知发布方';
    },

    // 获取发布方头像（默认值处理）
    getPublisherAvatar(task) {
        const avatar = task.publisher?.avatar;
        if (avatar) return avatar;
        return '/assets/images/default-avatar.png';
    },

    // 格式化评分（5星制）
    formatRating(task) {
        const rating = task.publisher?.rating;
        if (typeof rating !== 'number') return null;
        return {
            value: rating,
            stars: Math.round(rating),
            maxStars: 5,
            display: `${rating.toFixed(1)}`
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

    // 格式化完成率
    formatCompletionRate(task) {
        const rate = task.publisher?.completionRate;
        if (typeof rate !== 'number') return null;
        return `${rate.toFixed(1)}%`;
    },

    // 格式化发布时间
    formatPublishedDate(task) {
        const date = task.publishedAt ? new Date(task.publishedAt) : null;
        if (!date || isNaN(date)) return null;
        return date.toLocaleDateString('zh-CN');
    },

    // 获取技术栈列表（默认值处理）
    getStacks(task) {
        return task.stacks && Array.isArray(task.stacks) ? task.stacks : [];
    },

    // 获取要求列表（默认值处理）
    getRequirements(task) {
        return task.requirements && Array.isArray(task.requirements)
            ? task.requirements
            : [];
    },

    // 获取交付物列表（默认值处理）
    getDeliverables(task) {
        return task.deliverables && Array.isArray(task.deliverables)
            ? task.deliverables
            : [];
    },

    // 是否有联系方式（本版本始终返回 false）
    hasContactInfo() {
        return false;  // 后续版本可根据权限动态返回
    }
};
```

### 2.7 详情页初始化链路

**新增文件**：`assets/js/task-detail-main.js`

```javascript
/**
 * 任务详情页统一入口
 * 职责：
 * 1. 初始化共享布局（导航栏、页脚、回到顶部）
 * 2. 初始化详情页逻辑
 */
import { initSharedLayout } from './shared-layout.js';
import { initTaskDetail } from './task-detail.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. 初始化共享布局
        await initSharedLayout();

        // 2. 初始化详情页
        await initTaskDetail();
    } catch (error) {
        console.error('详情页初始化失败:', error);
        showErrorState('页面初始化失败，请刷新重试');
    }
});
```

**HTML 引用**：
```html
<script type="module" src="./assets/js/task-detail-main.js"></script>
```

### 2.8 状态处理设计

#### Loading 状态
```html
<div id="loadingState" class="detail-loading" hidden>
    <div class="skeleton-card">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
    </div>
</div>
```

#### Empty 状态
```html
<div id="emptyState" class="detail-empty" hidden>
    <svg><!-- 图标 --></svg>
    <h3>任务不存在</h3>
    <p>请检查链接是否正确</p>
    <a href="task-hall.html" class="btn btn-primary">返回任务大厅</a>
</div>
```

#### Error 状态
```html
<div id="errorState" class="detail-error" hidden>
    <svg><!-- 图标 --></svg>
    <h3>加载失败</h3>
    <p id="errorMessage"></p>
    <button onclick="location.reload()" class="btn btn-primary">重新加载</button>
</div>
```

### 2.9 样式隔离策略

**预览抽屉（命名隔离）**：
```css
/* task-detail.css */
.task-preview-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 420px;
    height: 100%;
    background: white;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
}

.task-preview-drawer.active {
    transform: translateX(0);
}

/* 不影响全局 .drawer 样式 */
```

**详情页样式**：
```css
/* task-detail.css */
.detail-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-lg);
}

.detail-content {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: var(--spacing-xl);
}

@media (max-width: 768px) {
    .detail-content {
        grid-template-columns: 1fr;
    }
}
```

---

## 3. 文件改动清单

### 3.1 新增文件

| 文件路径 | 说明 | L3文档 |
|----------|------|--------|
| `task-detail.html` | 任务详情页主文件 | ✅ 需要 |
| `task-detail-main.js` | 详情页统一入口 | ✅ 需要 |
| `assets/css/task-detail.css` | 详情页专用样式（含预览抽屉） | ✅ 需要 |
| `assets/js/task-detail.js` | 详情页交互逻辑 | ✅ 需要 |
| `assets/js/task-preview-drawer.js` | 任务预览抽屉组件（命名隔离） | ✅ 需要 |
| `assets/js/task-view-model.js` | 共享视图模型 | ✅ 需要 |

### 3.2 修改文件

| 文件路径 | 改动内容 | 影响范围 |
|----------|----------|----------|
| `assets/data/tasks.mock.json` | 补充详情字段，保留 `clientName` | 数据层 |
| `task-hall.html` | 添加预览抽屉容器 DOM | 页面结构 |
| `assets/js/task-hall.js` | 添加卡片点击事件，调用预览抽屉 | 交互逻辑 |
| `assets/js/task-service.js` | 新增 `getTaskById()`，修复并发问题 | 服务层 |
| `assets/js/CLAUDE.md` | 更新 JS 模块文档 | 文档 |
| `assets/css/CLAUDE.md` | 更新 CSS 模块文档 | 文档 |
| `设计文档/CLAUDE.md` | 新增本文档索引 | 文档 |

---

## 4. 测试方案

### 4.1 功能测试

| # | 测试场景 | 预期结果 |
|---|----------|----------|
| 1 | 点击任务卡片 | 预览抽屉从右侧滑出，显示任务摘要 |
| 2 | 预览抽屉打开时点击筛选按钮 | 预览抽屉自动关闭，筛选抽屉打开（互斥） |
| 3 | 筛选抽屉打开时点击任务卡片 | 筛选抽屉自动关闭，预览抽屉打开（互斥） |
| 4 | 点击"查看详情" | 跳转到 `task-detail.html?id=xxx` |
| 5 | 详情页显示所有信息 | 标题、描述、要求、交付物、发布方信息正确显示 |
| 6 | 点击"返回大厅" | 返回任务大厅，筛选条件、页码保留 |
| 7 | 浏览器返回按钮 | 行为与"返回大厅"按钮一致 |
| 8 | 无效任务 ID | 显示空状态 |
| 9 | 数据字段缺失 | 显示默认值或占位符 |

### 4.2 字段缺失测试矩阵

| 字段 | 缺失行为 | 测试数据 |
|------|----------|----------|
| `publisher.avatar` | 显示默认头像 | 移除字段验证 |
| `publisher.rating` | 隐藏评分区域 | 移除字段验证 |
| `publisher.name` | 回退到 `clientName` | 移除字段验证 |
| `description` | 隐藏描述区域 | 移除字段验证 |
| `requirements` | 隐藏要求列表 | 移除字段验证 |
| `deliverables` | 隐藏交付物列表 | 移除字段验证 |
| `stacks` | 显示"暂无技术栈" | 空数组验证 |
| `budgetMin/budgetMax` | 显示"预算面议" | null 值验证 |

### 4.3 抽屉冲突测试

| # | 测试场景 | 预期结果 |
|---|------|----------|
| 1 | 打开预览抽屉后按 ESC | 预览抽屉关闭 |
| 2 | 打开筛选抽屉后按 ESC | 筛选抽屉关闭 |
| 3 | 点击遮罩层 | 当前抽屉关闭 |
| 4 | 快速切换两个抽屉 | 不出现滚动锁定异常 |
| 5 | 打开抽屉后焦点 | 聚焦到抽屉内第一个元素 |
| 6 | 关闭抽屉后焦点 | 恢复到触发元素 |

### 4.4 服务层并发测试

| # | 测试场景 | 预期结果 |
|---|------|----------|
| 1 | 首次请求失败后再次请求 | 成功返回数据 |
| 2 | 抽屉和详情页同时请求同一任务 | 复用缓存，不重复请求 |
| 3 | 网络超时 | 显示错误状态，可重新加载 |

---

## 5. 实施细则

### 5.1 实施顺序

#### 阶段一：数据层与服务层（1-2 小时）
1. ✅ 更新 `tasks.mock.json`，补充详情字段
2. ✅ 创建 `task-view-model.js`，实现共享格式化逻辑
3. ✅ 修改 `task-service.js`：
   - 新增 `getTaskById()` 函数
   - 修复并发加载悬挂 Promise 问题

#### 阶段二：预览抽屉组件（2-3 小时）
1. ✅ 创建 `task-preview-drawer.js`
2. ✅ 实现抽屉与筛选抽屉互斥逻辑
3. ✅ 在 `task-hall.html` 添加抽屉容器
4. ✅ 在 `task-hall.js` 中集成调用
5. ✅ 创建 `task-detail.css`，添加抽屉样式

#### 阶段三：详情页开发（4-5 小时）
1. ✅ 创建 `task-detail.html` 页面结构
2. ✅ 创建 `task-detail-main.js` 统一入口
3. ✅ 创建 `task-detail.js` 交互逻辑
4. ✅ 实现状态处理（loading/empty/error）
5. ✅ 实现响应式布局

#### 阶段四：联调测试（2-3 小时）
1. ✅ 执行功能测试（9项）
2. ✅ 执行字段缺失测试（8项）
3. ✅ 执行抽屉冲突测试（6项）
4. ✅ 执行服务层并发测试（3项）

#### 阶段五：文档更新（0.5 小时）
1. ✅ 更新模块文档

### 5.2 关键代码示例

#### 预览抽屉（含互斥逻辑）
```javascript
// task-preview-drawer.js
const TaskPreviewDrawer = {
    drawer: null,
    overlay: null,
    triggerElement: null,  // 保存触发元素，用于焦点恢复

    init() {
        this.drawer = document.getElementById('taskPreviewDrawer');
        this.overlay = document.getElementById('taskPreviewDrawerOverlay');

        // 关闭事件
        this.overlay.addEventListener('click', () => this.close());
        this.drawer.querySelector('.close-btn')?.addEventListener('click', () => this.close());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    },

    isOpen() {
        return this.drawer.classList.contains('active');
    },

    async open(taskId, triggerElement) {
        this.triggerElement = triggerElement;

        // 互斥：关闭筛选抽屉
        if (window.FilterDrawer && window.FilterDrawer.isOpen()) {
            await window.FilterDrawer.close();
        }

        // 加载任务数据
        const task = await TaskService.getTaskById(taskId);
        if (!task) return;

        // 渲染内容
        this.renderContent(task);

        // 显示抽屉
        this.drawer.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // 焦点管理
        const firstFocusable = this.drawer.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        firstFocusable?.focus();
    },

    close() {
        this.drawer.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';

        // 焦点恢复
        this.triggerElement?.focus();
    },

    renderContent(task) {
        // 使用 TaskViewModel 格式化数据
        const publisherName = TaskViewModel.getPublisherName(task);
        const avatar = TaskViewModel.getPublisherAvatar(task);
        // ... 渲染逻辑
    }
};
```

#### 详情页入口
```javascript
// task-detail-main.js
import { initSharedLayout } from './shared-layout.js';
import { initTaskDetail } from './task-detail.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initSharedLayout();
        await initTaskDetail();
    } catch (error) {
        console.error('详情页初始化失败:', error);
        document.getElementById('errorState').hidden = false;
    }
});
```

---

## 6. 风险点与缓解措施

| 风险 | 缓解措施 |
|------|----------|
| 数据字段缺失导致渲染异常 | TaskViewModel 提供默认值处理 |
| 修改数据模型破坏大厅列表 | 保留 `clientName`，使用兼容策略 |
| 抽屉样式影响现有筛选抽屉 | 使用 `.task-preview-drawer` 命名隔离 |
| 返回后丢失筛选上下文 | 使用 `history.back()` 保留 URL 参数 |
| 移动端双抽屉冲突 | 实现互斥逻辑，统一管理滚动锁定 |
| 并发加载导致页面卡住 | 修复悬挂 Promise 问题 |
| 详情页缺少共享布局 | 新增 `task-detail-main.js` 统一入口 |

---

## 7. 附录

### 7.1 评审意见响应汇总

| 类别 | 采纳数量 |
|------|----------|
| 完全采纳 | 19 条 |
| 部分采纳 | 0 条 |
| 不采纳 | 0 条 |

### 7.2 后续版本规划

- v2.0：增加接取任务 / 竞标功能
- v2.0：增加联系发布方功能（需后端权限控制）
- v2.0：增加收藏 / 分享功能
- v2.0：角色区分（客户 / 开发者）
- v2.0：完整焦点陷阱和键盘导航

---

**文档结束**
