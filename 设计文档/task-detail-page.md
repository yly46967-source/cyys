# 任务详情页设计文档

**版本**: v1.0
**创建日期**: 2026-04-08
**作者**: AI Assistant
**状态**: 待评审

---

## 1. 需求理解

### 1.1 核心需求

为任务大厅新增任务详情展示功能，采用 **Indeed 风格的两级导航模式**：

1. **第一级 - 侧边抽屉预览**：点击任务卡片，右侧滑出抽屉，展示任务摘要信息
2. **第二级 - 完整详情页**：抽屉内点击"查看详情"按钮，跳转到独立页面展示完整信息

### 1.2 功能范围

#### 侧边抽屉预览（第一级）
- 任务基本信息（标题、预算、工期、技术栈）
- 任务摘要描述
- 发布方简要信息（昵称、头像、认证状态）
- 快速操作按钮（查看详情、收藏、分享）

#### 完整详情页（第二级）
- **任务完整信息**
  - 标题、状态、类别
  - 完整需求描述（支持多段落、富文本结构）
  - 预算范围、交付模式
  - 工期天数、截止日期
  - 技术栈标签

- **发布方完整信息**
  - 昵称、头像
  - 认证状态（已认证/未认证）
  - 信用评分（星级显示）
  - 历史发布任务数
  - 任务完成率
  - 联系方式（微信/QQ/邮箱）

- **交互功能**
  - 接取任务 / 竞标投稿
  - 收藏任务
  - 分享任务
  - 联系发布方
  - 返回大厅

### 1.3 非功能需求
- 响应式设计，适配桌面/平板/移动端
- 符合现有 Dribbble 风格（纯白背景 + 科技蓝强调色）
- 保持与任务大厅的视觉一致性
- 加载状态、空状态、错误状态处理

---

## 2. 技术方案

### 2.1 架构设计

```
任务大厅 (task-hall.html)
    │
    ├── 点击任务卡片
    │   └── 侧边抽屉预览
    │       ├── 任务基本信息
    │       ├── 发布方简要信息
    │       ├── [查看详情] → 跳转 task-detail.html
    │       ├── [收藏] → 本地状态更新
    │       └── [分享] → 复制链接
    │
    └── 点击"查看详情"
        └── 详情页 (task-detail.html)
            ├── 完整需求描述
            ├── 发布方完整信息
            ├── [接取任务] / [竞标]
            ├── [收藏]
            ├── [分享]
            ├── [联系发布方]
            └── [返回大厅]
```

### 2.2 页面跳转设计

#### 侧边抽屉（新增复用组件）
- **触发方式**：点击任务卡片任意位置
- **显示位置**：从右侧滑入，宽度 400px（桌面）/ 100%（移动端）
- **关闭方式**：
  - 点击遮罩层
  - 点击关闭按钮
  - 按 ESC 键
- **现有资源**：`components.css` 已有 `.drawer` 组件，可复用

#### 详情页（新增独立页面）
- **URL 设计**：`task-detail.html?id={taskId}`
- **返回方式**：浏览器返回 / 返回大厅按钮

### 2.3 数据模型扩展

#### 现有任务数据结构
```javascript
{
    "id": "task-001",
    "title": "企业官网开发",
    "clientName": "某科技公司",
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

#### 新增字段（需补充到 Mock 数据）
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
        "id": "user-001",
        "name": "某科技公司",
        "avatar": "https://cdn.example.com/avatar.jpg",  // 头像URL
        "verified": true,                                // 是否认证
        "rating": 4.8,                                   // 信用评分 (0-5)
        "reviewCount": 25,                               // 评价数量
        "publishedCount": 12,                            // 历史发布数
        "completionRate": 91.7,                          // 完成率 (%)
        "contact": {                                     // 联系方式
            "wechat": "wxid_xxxxx",
            "qq": "123456789",
            "email": "contact@example.com"
        }
    },

    // === 交互状态（前端本地） ===
    "isFavorited": false,      // 是否已收藏
    "applicationStatus": null  // 申请状态：null/applied/accepted/rejected
}
```

### 2.4 组件复用策略

| 组件 | 现有位置 | 复用方式 |
|------|----------|----------|
| `.drawer` | components.css:507-587 | 直接复用，新增任务专用样式 |
| `.btn-*` | components.css:86-164 | 直接复用 |
| `.status-badge` | components.css:456-479 | 直接复用 |
| `.task-card__tag` | task-hall.css:379-398 | 复用于详情页技术栈标签 |
| 布局容器 | task-hall.html | 新增详情页专用布局类 |

### 2.5 状态管理

#### URL 参数同步
- 抽屉打开：无 URL 变化（纯前端状态）
- 详情页：`task-detail.html?id={taskId}`

#### 本地存储
- 收藏状态：`localStorage.getItem('favoriteTasks')`
- 最近浏览：`localStorage.getItem('recentlyViewed')`

---

## 3. 文件改动清单

### 3.1 新增文件

| 文件路径 | 说明 | L3文档 |
|----------|------|--------|
| `task-detail.html` | 任务详情页主文件 | ✅ 需要 |
| `assets/css/task-detail.css` | 详情页专用样式 | ✅ 需要 |
| `assets/js/task-detail.js` | 详情页交互逻辑 | ✅ 需要 |
| `assets/js/task-drawer.js` | 侧边抽屉逻辑（从 task-hall.js 拆分） | ✅ 需要 |

### 3.2 修改文件

| 文件路径 | 改动内容 | 影响范围 |
|----------|----------|----------|
| `assets/data/tasks.mock.json` | 补充发布方完整信息字段 | 数据层 |
| `task-hall.html` | 添加抽屉容器 DOM 结构 | 页面结构 |
| `assets/js/task-hall.js` | 添加卡片点击事件，调用抽屉组件 | 交互逻辑 |
| `assets/css/task-hall.css` | 新增抽屉专用样式类（可选） | 样式 |
| `assets/css/components.css` | 可能需要调整抽屉宽度样式 | 样式 |
| `assets/js/CLAUDE.md` | 更新 JS 模块文档 | 文档 |
| `assets/css/CLAUDE.md` | 更新 CSS 模块文档 | 文档 |
| `设计文档/CLAUDE.md` | 新增本文档索引 | 文档 |

### 3.3 目录结构变化

```
公会/
├── task-detail.html          # 新增：详情页
├── task-hall.html            # 修改：添加抽屉容器
├── assets/
│   ├── css/
│   │   ├── task-detail.css   # 新增：详情页样式
│   │   └── ...
│   ├── js/
│   │   ├── task-detail.js    # 新增：详情页逻辑
│   │   ├── task-drawer.js    # 新增：抽屉组件逻辑
│   │   └── task-hall.js      # 修改：集成抽屉调用
│   └── data/
│       └── tasks.mock.json   # 修改：补充数据字段
└── 设计文档/
    └── task-detail-page.md   # 新增：本文档
```

---

## 4. 风险点

### 4.1 数据一致性风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Mock 数据字段缺失导致页面渲染异常 | 高 | 新增数据验证逻辑，提供默认值 |
| 发布方联系方式在接取前是否可见 | 中 | 设计权限控制（仅接取后显示） |
| 任务ID 参数解析错误导致页面崩溃 | 高 | URL 参数校验 + 错误状态处理 |

### 4.2 交互体验风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 抽屉与详情页信息重复，用户困惑 | 中 | 抽屉仅显示摘要，详情页显示完整信息 |
| 移动端抽屉宽度适配问题 | 中 | 使用媒体查询调整宽度为 100% |
| 快速连续点击任务导致抽屉闪烁 | 低 | 添加防抖/节流逻辑 |

### 4.3 性能风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 大量任务数据导致页面加载慢 | 低 | 按需加载详情数据（仅打开抽屉时） |
| 图片资源过多影响加载速度 | 低 | 使用 CDN + 懒加载 |

### 4.4 兼容性风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 旧浏览器不支持 CSS Grid/Flexbox | 低 | 项目已明确现代浏览器支持 |
| 移动端返回手势与抽屉关闭冲突 | 中 | 测试主流移动端浏览器行为 |

---

## 5. 实施细则

### 5.1 实施顺序

#### 阶段一：数据层准备（1-2 小时）
1. ✅ 更新 `tasks.mock.json`，补充所有新增字段
2. ✅ 在 `task-config.js` 中添加新的枚举定义（如需要）
3. ✅ 更新 `task-service.js` 中的数据获取函数

#### 阶段二：侧边抽屉组件（2-3 小时）
1. ✅ 创建 `task-drawer.js`，实现抽屉组件逻辑
   - `openDrawer(taskId)` - 打开抽屉并加载任务数据
   - `closeDrawer()` - 关闭抽屉
   - `renderDrawerContent(task)` - 渲染抽屉内容
2. ✅ 在 `task-hall.html` 添加抽屉容器 DOM
3. ✅ 在 `task-hall.js` 中集成抽屉调用
4. ✅ 添加抽屉专用样式（如需调整）

#### 阶段三：详情页开发（4-5 小时）
1. ✅ 创建 `task-detail.html` 页面结构
2. ✅ 创建 `task-detail.css` 样式文件
3. ✅ 创建 `task-detail.js` 交互逻辑
   - URL 参数解析
   - 任务数据加载
   - 交互功能实现（收藏、分享、联系等）
4. ✅ 实现响应式布局

#### 阶段四：联调测试（1-2 小时）
1. ✅ 测试抽屉打开/关闭交互
2. ✅ 测试详情页跳转和返回
3. ✅ 测试所有按钮功能
4. ✅ 测试响应式适配
5. ✅ 测试边界情况（无效 ID、缺失数据等）

#### 阶段五：文档更新（0.5 小时）
1. ✅ 更新 `assets/js/CLAUDE.md`
2. ✅ 更新 `assets/css/CLAUDE.md`
3. ✅ 更新 `设计文档/CLAUDE.md` 索引

### 5.2 关键代码示例

#### 抽屉组件调用（task-hall.js）
```javascript
// 任务卡片点击事件
taskList.addEventListener('click', (e) => {
    const card = e.target.closest('.task-card');
    if (card) {
        const taskId = card.dataset.taskId;
        TaskDrawer.open(taskId);  // 调用抽屉组件
    }
});
```

#### 详情页 URL 解析（task-detail.js）
```javascript
// 从 URL 获取任务 ID
const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get('id');

if (!taskId) {
    // 显示错误状态
    showErrorState('任务 ID 缺失');
} else {
    // 加载任务数据
    loadTaskDetail(taskId);
}
```

#### 抽屉内容渲染（task-drawer.js）
```javascript
function renderDrawerContent(task) {
    return `
        <div class="task-drawer__header">
            <h3 class="task-drawer__title">${escapeHtml(task.title)}</h3>
            <span class="status-badge status-badge--${task.status}">
                ${getStatusLabel(task.status)}
            </span>
        </div>
        <div class="task-drawer__body">
            <!-- 任务摘要 -->
            <p class="task-drawer__summary">${escapeHtml(task.summary)}</p>

            <!-- 发布方简要信息 -->
            <div class="task-drawer__publisher">
                <img src="${task.publisher.avatar}" alt="${task.publisher.name}">
                <div>
                    <span class="publisher-name">${escapeHtml(task.publisher.name)}</span>
                    ${task.publisher.verified ? '<span class="verified-badge">✓</span>' : ''}
                </div>
            </div>

            <!-- 技术栈标签 -->
            <div class="task-drawer__tags">
                ${task.stacks.map(stack => `<span class="tag">${stack}</span>`).join('')}
            </div>
        </div>
        <div class="task-drawer__footer">
            <button class="btn btn-primary btn-full" onclick="navigateToDetail('${task.id}')">
                查看完整详情
            </button>
            <div class="task-drawer__actions">
                <button class="btn btn-ghost" onclick="toggleFavorite('${task.id}')">
                    收藏
                </button>
                <button class="btn btn-ghost" onclick="shareTask('${task.id}')">
                    分享
                </button>
            </div>
        </div>
    `;
}
```

### 5.3 样式规范

#### 颜色使用
- 主要操作：`--color-primary` (#3B82F6)
- 次要操作：`--color-text-secondary` (#6E6D7A)
- 成功状态：`--color-success` (#10B981)
- 边框分隔：`--color-border` (#E5E4EB)

#### 间距规范
- 卡片内边距：`var(--spacing-md)` (16px)
- 元素间距：`var(--spacing-sm)` (8px) - `var(--spacing-lg)` (24px)
- 抽屉宽度：桌面 400px，移动端 100%

#### 字号规范
- 标题：20px / 18px（移动端）
- 正文：14px / 13px（移动端）
- 辅助文字：12px

### 5.4 测试检查清单

- [ ] 点击任务卡片，抽屉正确滑出
- [ ] 抽屉内容正确渲染（标题、摘要、发布方、技术栈）
- [ ] 点击遮罩/关闭按钮，抽屉正确关闭
- [ ] 点击"查看详情"，正确跳转到详情页
- [ ] 详情页 URL 包含正确的任务 ID
- [ ] 详情页所有信息正确显示
- [ ] 收藏按钮状态正确切换
- [ ] 分享功能正确复制链接
- [ ] 联系发布方按钮显示联系方式（或提示需接取后可见）
- [ ] 返回大厅按钮正确跳转
- [ ] 移动端布局正确适配
- [ ] 无效任务 ID 显示错误状态
- [ ] 数据缺失字段显示默认值/占位符

---

## 6. 附录

### 6.1 参考文件
- 现有抽屉组件：`assets/css/components.css:507-587`
- 任务配置：`assets/js/task-config.js`
- 数据服务：`assets/js/task-service.js`
- 任务大厅交互：`assets/js/task-hall.js`

### 6.2 设计参考
- Indeed 职位详情页交互模式
- Dribbble 作品详情页视觉风格

### 6.3 待确认事项
- [ ] 发布方联系方式是否需要权限控制（仅接取后可见）
- [ ] 是否需要"竞标/投稿"功能的详细交互设计
- [ ] 收藏任务是否需要同步到后端（目前设计为本地存储）
- [ ] 任务发布时间是否需要显示（设计中已新增 `publishedAt` 字段）

---

**文档结束**
