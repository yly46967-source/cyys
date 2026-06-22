# 任务详情页功能模块代码实施细则 v2.0

**文档类型**: 功能模块代码实施指南
**创建日期**: 2026-04-08
**修订日期**: 2026-04-08
**基于方案**: plans/calm-popping-starfish.md
**目标**: 将设计方案转换为可执行的编码步骤

---

## 文档阅读说明

本文档包含两类图示表达方式：
1. **人读版图示**：使用视觉符号辅助理解，所有符号标注 `[不可忽略]`
2. **AI友好版图示**：纯文本结构化表达，便于程序解析

两类图示内容等价，可互相替换。

---

## A. 需求理解与工程假设

### A.1 目标复述

为任务大厅新增任务详情展示功能，采用两级导航模式：

**第一级**：用户在任务大厅页面点击任务卡片区域，页面右侧滑出抽屉组件，显示任务摘要信息（标题、状态、预算、工期、技术栈标签、发布方简要信息），抽屉内包含"查看详情"按钮。

**第二级**：用户在抽屉内点击"查看详情"按钮，浏览器跳转到独立页面 `task-detail.html?id={任务ID}`，页面展示完整任务信息（描述、要求、交付物、预算、工期、技术栈）和完整发布方信息（头像、昵称、认证、评分、统计）。

### A.2 原方案模糊点与工程假设

| 编号 | 问题点 | 冲突描述 | 工程假设 | 风险等级 |
|------|--------|----------|----------|----------|
| A-01 | 数据契约兼容性 | 原方案新增 `publisher` 对象但未说明 `clientName` 字段去留，而现有大厅搜索功能依赖 `task.clientName` 字段，移除会导致搜索功能失效 | 保留 `clientName` 字段不变，新增 `publisher` 对象作为补充，设置 `publisher.name` 值与 `clientName` 保持一致 | 低 |
| A-02 | 抽屉样式隔离 | 原方案直接复用全局 `.drawer` 样式并调整为 400px 宽度，而现有筛选抽屉使用全局 `.drawer` 样式，修改会影响筛选抽屉显示 | 创建新的专用类名 `.task-preview-drawer`，不修改全局 `.drawer` 样式，在新的 CSS 文件中定义预览抽屉专用样式 | 低 |
| A-03 | 联系方式数据安全 | 原方案将 `contact` 字段存储在静态 JSON 文件中同时说明"需权限控制"，但前端静态数据无法实现真实权限控制，用户可通过开发者工具直接读取 | 从 Mock 数据中移除 `contact` 字段，详情页联系方式区域显示固定文本"接取任务后可见"，不存储真实联系方式 | 中 |
| A-04 | 详情页入口缺失 | 原方案只提到 `task-detail.html` 和 `task-detail.js`，而项目其他页面使用 `*-main.js` 作为统一入口调用 `initSharedLayout()`，缺失会导致导航栏、页脚、回到顶部组件无法初始化 | 创建 `task-detail-main.js` 文件作为详情页统一入口，在 `DOMContentLoaded` 事件中依次调用 `initSharedLayout()` 和详情页初始化函数 | 低 |
| A-05 | 收藏状态同步 | 原方案提到收藏功能使用本地存储但未定义 key 结构和跨页面同步机制，抽屉收藏后详情页状态不同步 | 移除收藏功能，简化为纯展示页面 | 低 |
| A-06 | 抽屉互斥关系 | 原方案未考虑预览抽屉与现有筛选抽屉的互斥关系，移动端两个抽屉可能同时打开导致交互冲突 | 在预览抽屉打开时检查并调用筛选抽屉的 `close()` 方法，使用全局对象 `window.FilterDrawer` 引用筛选抽屉组件 | 中 |
| A-07 | 返回上下文保留 | 原方案未说明从详情页返回任务大厅时如何处理筛选条件和页码，使用硬编码跳转会导致用户筛选状态丢失 | 详情页返回按钮和浏览器返回行为统一使用 `history.back()` 方法，浏览器自动处理 URL 参数恢复 | 低 |
| A-08 | 服务层接口定义 | 原方案只说"调用 task-service.js"未定义具体函数，抽屉和详情页可能各自实现数据获取导致代码重复 | 在 `task-service.js` 文件中新增 `getTaskById(taskId)` 函数，内部调用现有 `fetchTasks()` 函数后使用 `Array.find()` 查找匹配任务 | 低 |
| A-09 | 评分数据语义 | 原方案未定义 `rating` 字段的评分制式（5分制或100分制），UI 组件无法正确显示 | 明确评分采用 5 星制，`rating` 字段值范围 0-5，UI 显示时使用 `Math.round()` 四舍五入转换为整数星级 | 低 |
| A-10 | 交易动作边界 | 原方案包含接取、竞标、联系发布方等动作，引入角色权限、状态流转、实名认证等复杂逻辑，超出纯展示需求边界 | 移除所有交易动作按钮，详情页仅展示信息，不包含接取、竞标、联系、收藏、分享功能 | 中 |

### A.3 对现有系统的依赖前提

| 依赖项 | 依赖内容 | 验证方式 | 失降级方案 |
|--------|----------|----------|-----------|
| D-01 | `shared-layout.js` 文件中的 `initSharedLayout()` 函数 | 打开文件检查函数是否存在 | 如不存在，详情页手动初始化各组件 |
| D-02 | `task-service.js` 文件中的 `fetchTasks()` 函数 | 打开文件检查函数定义 | 如不存在，创建新的数据加载函数 |
| D-03 | `task-config.js` 文件中的 `STATUS_OPTIONS` 枚举数组 | 打开文件检查枚举结构 | 如不存在，在详情页中定义状态映射 |
| D-04 | `base.css` 文件中的 CSS 变量定义（颜色、间距） | 打开文件检查变量声明 | 如不可用，在详情页 CSS 中定义变量 |
| D-05 | `task-hall.js` 文件中的全局对象 `window.FilterDrawer` | 打开文件检查对象是否存在且包含 `isOpen()` 和 `close()` 方法 | 如不存在，预览抽屉跳过互斥检查 |

---

## B. 实施边界

### B.1 本次实施内容清单

| 模块 | 实施内容 | 输出物 | 优先级 |
|------|----------|--------|--------|
| 数据层 | 扩展 `tasks.mock.json` 文件，为每个任务对象补充详情展示字段 | 更新后的 JSON 文件 | P0 |
| 数据层 | 修复 `task-service.js` 文件中的并发加载问题，新增 `getTaskById()` 函数 | 更新后的 JS 文件 | P0 |
| 视图层 | 创建 `task-view-model.js` 文件，提供数据格式化和默认值处理函数 | 新建 JS 文件 | P1 |
| 交互层 | 创建 `task-preview-drawer.js` 文件，实现抽屉开关、渲染、事件处理 | 新建 JS 文件 | P0 |
| 交互层 | 修改 `task-hall.js` 文件，在任务卡片点击事件中集成抽屉调用 | 更新后的 JS 文件 | P0 |
| 页面层 | 修改 `task-hall.html` 文件，添加预览抽屉 DOM 容器结构 | 更新后的 HTML 文件 | P0 |
| 页面层 | 创建 `task-detail.html` 文件，定义详情页骨架结构 | 新建 HTML 文件 | P0 |
| 页面层 | 创建 `task-detail-main.js` 文件，实现详情页统一初始化入口 | 新建 JS 文件 | P0 |
| 页面层 | 创建 `task-detail.js` 文件，实现详情页数据加载和状态处理 | 新建 JS 文件 | P0 |
| 样式层 | 创建 `task-detail.css` 文件，定义详情页和抽屉样式 | 新建 CSS 文件 | P0 |
| 文档层 | 更新 `assets/js/CLAUDE.md` 和 `assets/css/CLAUDE.md` 文件 | 更新后的文档 | P1 |

### B.2 本次不实施内容

| 功能 | 不实施原因 | 后续版本规划 |
|------|------------|--------------|
| 接取任务功能 | 需后端接口支持、角色权限控制、状态流转逻辑 | v2.0 |
| 竞标投稿功能 | 需后端接口支持、文件上传、评审流程 | v2.0 |
| 联系发布方（真实数据） | 需后端权限控制、联系方式加密 | v2.0 |
| 收藏任务功能 | 需跨页面状态同步、登录态绑定、后端存储 | v2.0 |
| 分享任务功能 | 需兼容性降级处理、剪贴板权限处理 | v2.0 |
| 角色区分（客户/开发者） | 当前版本所有用户看到相同内容 | v2.0 |

---

## C. 架构与模块设计

### C.1 模块结构图

#### 人读版图示

```
[不可忽略] 以下图示使用方框表示模块，箭头表示依赖关系

                    ┌──────────────────────────────────┐
                    │         任务大厅模块               │
                    │  ┌────────────┐      ┌─────────┐ │
                    │  │task-hall   │───▶ │ task-   │ │
                    │  │.html       │      │ hall.js │ │
                    │  └────────────┘      └────┬────┘ │
                    │                            │      │
                    │                            ▼      │
                    │                  ┌───────────────┐│
                    │                  │ task-preview- ││
                    │                  │ drawer.js     ││
                    │                  │   [新增]      ││
                    │                  └───────┬───────┘│
                    └──────────────────────────┼────────┘
                                               │
                     ┌─────────────────────────┼──────────────────────────┐
                     │                         │                          │
                     ▼                         ▼                          ▼
           ┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
           │ task-service.js │     │ task-view-model  │     │ shared-      │
           │   [修改]        │     │   .js [新增]     │     │ layout.js    │
           │                 │     │                  │     │              │
           │ 新增函数:        │     │ 函数列表:        │     │ initShared-  │
           │ getTaskById()   │     │ getPublisher-    │     │ Layout()     │
           └─────────────────┘     │ Name()           │     └──────────────┘
                                   │ formatRating()   │
                                   │ getStacks()      │
                                   │ [等 8 个函数]    │
                                   └──────────────────┘
                                               │
                                               │
                     ┌─────────────────────────┼──────────────────────────┐
                     │                         │                          │
                     ▼                         ▼                          ▼
           ┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
           │   详情页模块      │     │   数据层          │     │   共享组件   │
           │  [新增]          │     │                  │     │              │
           │ ┌──────────────┐│     │ tasks.mock.json  │     │ base.css     │
           │ │task-detail-  ││     │   [修改]         │     │ components.  │
           │ │main.js       ││     │                  │     │ css          │
           │ └──────┬───────┘│     └──────────────────┘     └──────────────┘
           │         │        │
           │ ┌───────┴───────┐│
           │ │task-detail.js ││
           │ └───────────────┘│
           │                  │
           │ task-detail.html │
           └──────────────────┘
```

#### AI友好版图示

```
MODULE_STRUCTURE_BEGIN

MODULE: task_hall
  FILES:
    - task-hall.html
    - task-hall.js
  DEPENDS_ON:
    - task-preview-drawer.js (新增)

MODULE: task_preview_drawer
  FILES:
    - task-preview-drawer.js (新增)
  DEPENDS_ON:
    - task-service.js
    - task-view-model.js
  PROVIDES:
    - open(taskId, triggerElement)
    - close()
    - isOpen()

MODULE: task_detail
  FILES:
    - task-detail.html (新增)
    - task-detail-main.js (新增)
    - task-detail.js (新增)
  DEPENDS_ON:
    - shared-layout.js
    - task-service.js
    - task-view-model.js

MODULE: task_view_model
  FILES:
    - task-view-model.js (新增)
  PROVIDES:
    - getPublisherName(task)
    - getPublisherAvatar(task)
    - formatRating(task)
    - getStatusClass(status)
    - formatCompletionRate(task)
    - formatPublishedDate(task)
    - getStacks(task)
    - getRequirements(task)
    - getDeliverables(task)

MODULE: task_service
  FILES:
    - task-service.js (修改)
  PROVIDES:
    - fetchTasks() (现有)
    - getTaskById(taskId) (新增)

MODULE: data_layer
  FILES:
    - tasks.mock.json (修改)

MODULE: shared_components
  FILES:
    - shared-layout.js
    - base.css
    - components.css

MODULE_STRUCTURE_END
```

### C.2 调用链路图

#### 人读版图示

```
[不可忽略] 以下图示使用箭头表示调用方向，菱形表示数据判断

用户操作流程：

┌─────────────┐
│ 用户点击     │
│ 任务卡片     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ task-hall.js        │
│ 事件监听器触发       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐      ┌──────────────────┐
│ TaskPreviewDrawer   │─────▶│ task-service.js  │
│ .open() 调用        │      │ .getTaskById()   │
└──────┬──────────────┘      └─────┬────────────┘
       │                            │
       │                            ▼
       │                   ┌──────────────────┐
       │                   │ tasks.mock.json  │
       │                   │ 数据读取          │
       │                   └─────┬────────────┘
       │                         │
       │                         ▼
       │                   ┌──────────────────┐
       │                   │ 返回 task 对象   │
       │                   └─────┬────────────┘
       │                         │
       ▼                         ▼
┌─────────────────────┐      ┌──────────────────┐
│ task-view-model.js  │◀─────│ 数据格式化        │
│ 格式化数据           │      └──────────────────┘
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ 抽屉内容渲染         │
│ HTML 生成并注入      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ 抽屉显示             │
│ .active 类添加       │
└─────────────────────┘


详情页加载流程：

┌─────────────┐
│ 浏览器访问   │
│ task-detail │
│ .html?id=xxx│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ task-detail-main.js │
│ DOMContentLoaded   │
└──────┬──────────────┘
       │
       ├──▶ initSharedLayout()
       │         │
       │         ▼
       │    ┌──────────────────┐
       │    │ 导航栏初始化       │
       │    │ 页脚初始化         │
       │    │ 回到顶部初始化     │
       │    └──────────────────┘
       │
       └──▶ initTaskDetail()
                 │
                 ▼
          ┌──────────────┐
          │ URL 参数解析  │
          │ 获取 task ID  │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐      ┌──────────────────┐
          │ ID 有效?      │◀─────│ task-service.js  │
          │               │      │ .getTaskById()   │
          └──┬────────┬───┘      └──────────────────┘
             │        │
      无效   │        │ 有效
             │        │
             ▼        ▼
      ┌──────────┐ ┌──────────────┐
      │空状态显示 │ │数据格式化     │
      └──────────┘ │ task-view-   │
                   │ model.js     │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │详情页内容渲染 │
                   └──────────────┘
```

#### AI友好版图示

```
CALL_CHAIN_BEGIN

CHAIN: drawer_open_flow
  START: user_click_task_card
  STEP_1: task_hall_js_event_listener
    ACTION: 检测点击事件，获取 task-card 元素
    OUTPUT: taskId, triggerElement
  STEP_2: call_preview_drawer_open
    TARGET_MODULE: task-preview-drawer.js
    TARGET_FUNCTION: open(taskId, triggerElement)
  STEP_3: check_filter_drawer_open
    CONDITION: window.FilterDrawer?.isOpen()
    ACTION: 如果返回 true，调用 window.FilterDrawer.close()
  STEP_4: lock_body_scroll
    ACTION: 设置 document.body.style.overflow = 'hidden'
  STEP_5: call_service_get_task_by_id
    TARGET_MODULE: task-service.js
    TARGET_FUNCTION: getTaskById(taskId)
  STEP_6: service_fetch_tasks_internal
    ACTION: 调用内部 fetchTasks() 确保数据已加载
  STEP_7: read_mock_data
    SOURCE: tasks.mock.json
  STEP_8: array_find_task
    ACTION: tasks.find(t => t.id === taskId)
  STEP_9: return_task_object
    OUTPUT: task 对象或 null
  STEP_10: call_view_model_format
    TARGET_MODULE: task-view-model.js
    FUNCTIONS:
      - getPublisherName(task)
      - formatRating(task)
      - getStacks(task)
      - [其他格式化函数]
  STEP_11: generate_html_string
    ACTION: 使用格式化后的数据生成抽屉 HTML 字符串
  STEP_12: inject_dom
    ACTION: 将 HTML 字符串注入到抽屉容器元素
  STEP_13: add_active_class
    ACTION: drawerElement.classList.add('active')
  STEP_14: focus_first_element
    ACTION: 抽屉内第一个可交互元素调用 focus()
  END

CHAIN: detail_page_load_flow
  START: browser_navigate_to_detail_page
    INPUT: URL 带参数 id={taskId}
  STEP_1: dom_content_loaded
    TARGET_MODULE: task-detail-main.js
    EVENT: DOMContentLoaded
  STEP_2: call_init_shared_layout
    TARGET_MODULE: shared-layout.js
    TARGET_FUNCTION: initSharedLayout()
    OUTPUT: 导航栏、页脚、回到顶部组件已渲染
  STEP_3: call_init_task_detail
    TARGET_MODULE: task-detail.js
    TARGET_FUNCTION: initTaskDetail()
  STEP_4: parse_url_params
    ACTION: new URLSearchParams(window.location.search).get('id')
    OUTPUT: taskId 字符串或 null
  STEP_5: validate_task_id
    CONDITION: taskId === null 或 taskId === ''
    IF_TRUE: show_empty_state(), END
    IF_FALSE: CONTINUE
  STEP_6: show_loading_state
    ACTION: 显示 loading 容器，隐藏其他状态容器
  STEP_7: call_service_get_task_by_id
    TARGET_MODULE: task-service.js
    TARGET_FUNCTION: getTaskById(taskId)
  STEP_8: check_task_exists
    CONDITION: task === null
    IF_TRUE: show_empty_state(), END
    IF_FALSE: CONTINUE
  STEP_9: call_view_model_format
    TARGET_MODULE: task-view-model.js
    FUNCTIONS: [同 drawer_open_flow STEP_10]
  STEP_10: render_detail_page
    ACTION: 使用格式化数据填充详情页各区域 DOM
  STEP_11: hide_loading_state
    ACTION: 隐藏 loading 容器
  STEP_12: bind_back_button
    ACTION: 返回大厅按钮绑定 click 事件，调用 history.back()
  END

CALL_CHAIN_END
```

### C.3 数据流图

#### 人读版图示

```
[不可忽略] 以下图示使用方框表示数据存储，箭头表示数据流向

数据获取流程：

┌──────────────────┐
│ tasks.mock.json  │
│   [数据源]       │
│                  │
│ • task 对象数组  │
│ • 每个对象包含:  │
│   - id          │
│   - title       │
│   - clientName  │
│   - publisher   │ [新增]
│   - description │ [新增]
│   - requirements│ [新增]
│   - deliverables│ [新增]
└────────┬─────────┘
         │
         │ fetchTasks() 读取
         ▼
┌──────────────────┐
│ task-service.js  │
│   [服务层]       │
│                  │
│ • cachedTasks    │
│ • getTaskById()  │ [新增]
└────────┬─────────┘
         │
         │ getTaskById(taskId) 调用
         ▼
┌──────────────────┐
│ 返回单个 task    │
│   对象或 null    │
└────────┬─────────┘
         │
         │ 传入格式化函数
         ▼
┌──────────────────┐
│ task-view-model  │
│   .js [视图模型] │
│                  │
│ • getPublisher-  │
│   Name()         │
│ • formatRating() │
│ • getStacks()    │
│ • [其他函数]     │
└────────┬─────────┘
         │
         │ 返回格式化数据
         ▼
┌──────────────────┐
│ UI 渲染层        │
│                  │
│ • 抽屉组件       │
│ • 详情页组件     │
└──────────────────┘
```

#### AI友好版图示

```
DATA_FLOW_BEGIN

SOURCE: tasks_mock_json
  TYPE: JSON 文件
  LOCATION: assets/data/tasks.mock.json
  DATA_STRUCTURE:
    - Array<Task>
    - Task 包含字段:
      - id: string
      - title: string
      - clientName: string [保留，兼容现有功能]
      - publisher: object [新增]
        - id: string
        - name: string
        - avatar: string | null
        - verified: boolean
        - rating: number (0-5)
        - reviewCount: number
        - publishedCount: number
        - completionRate: number
      - description: string [新增]
      - requirements: string[] [新增]
      - deliverables: string[] [新增]
      - publishedAt: string (ISO 8601) [新增]

LAYER: service_layer
  MODULE: task-service.js
  FUNCTION: fetchTasks()
    INPUT: 无
    OUTPUT: Promise<Array<Task>>
    SIDE_EFFECT: 将结果缓存到 cachedTasks 变量
  FUNCTION: getTaskById(taskId)
    INPUT: taskId: string
    OUTPUT: Promise<Task | null>
    IMPLEMENTATION:
      1. 调用 fetchTasks() 确保数据已加载
      2. 使用 Array.find() 查找匹配 id 的任务
      3. 找不到返回 null

LAYER: view_model_layer
  MODULE: task-view-model.js
  FUNCTION: getPublisherName(task)
    INPUT: task: Task
    OUTPUT: string
    LOGIC:
      1. 优先返回 task.publisher?.name
      2. 回退到 task.clientName
      3. 默认返回 "未知发布方"
  FUNCTION: getPublisherAvatar(task)
    INPUT: task: Task
    OUTPUT: string
    LOGIC:
      1. 返回 task.publisher?.avatar
      2. 不存在返回 "/assets/images/default-avatar.png"
  FUNCTION: formatRating(task)
    INPUT: task: Task
    OUTPUT: { value: number, stars: number, maxStars: 5, display: string } | null
    LOGIC:
      1. 检查 task.publisher?.rating 是否为 number
      2. 不是 number 返回 null
      3. 返回格式化对象
  [其他函数省略，详见文档 E 部分]

LAYER: ui_render_layer
  MODULE: task-preview-drawer.js
    FUNCTION: renderContent(task)
      INPUT: task: Task
      OUTPUT: HTML 字符串
      ACTION: 注入到 #taskPreviewDrawer 元素
  MODULE: task-detail.js
    FUNCTION: renderTaskDetail(task)
      INPUT: task: Task
      OUTPUT: 无
      ACTION: 填充到详情页各 DOM 元素

DATA_FLOW_END
```

### C.4 状态流转图

#### 人读版图示

```
[不可忽略] 以下图示使用圆角矩形表示状态，箭头表示流转条件

详情页状态机：

     ┌────────────┐
     │页面初始状态 │
     └─────┬──────┘
           │
           │ DOMContentLoaded
           ▼
     ┌────────────┐
     │解析 URL    │
     │获取 task ID │
     └─────┬──────┘
           │
           ├──────────┐
           │          │
      ID 为空        ID 不为空
           │          │
           ▼          ▼
    ┌──────────┐ ┌──────────┐
    │空状态     │ │显示加载中 │
    └──────────┘ └─────┬────┘
                       │
                       │调用 getTaskById()
                       │
                       ├──────────┬──────────┐
                       │          │          │
                   返回 null    返回对象   请求失败
                       │          │          │
                       ▼          ▼          ▼
                ┌──────────┐ ┌──────────┐ ┌──────────┐
                │空状态     │ │显示内容   │ │错误状态   │
                └──────────┘ └──────────┘ └──────────┘
```

#### AI友好版图示

```
STATE_MACHINE_BEGIN

STATE: initial
  TRANSITION_TO: parse_url_params
  TRIGGER: DOMContentLoaded 事件

STATE: parse_url_params
  ACTION: new URLSearchParams(window.location.search).get('id')
  TRANSITION_TO: validate_task_id

STATE: validate_task_id
  CONDITION_CHECK: taskId === null || taskId === ''
  IF_TRUE:
    TRANSITION_TO: empty_state
  IF_FALSE:
    TRANSITION_TO: loading_state

STATE: loading_state
  ACTION: 显示 loading 容器，隐藏其他容器
  TRANSITION_TO: fetch_task_data

STATE: fetch_task_data
  ACTION: 调用 TaskService.getTaskById(taskId)
  TRANSITION_TO: check_task_result

STATE: check_task_result
  CONDITION_CHECK: task === null
  IF_TRUE:
    TRANSITION_TO: empty_state
  CONDITION_CHECK: 请求抛出异常
  IF_TRUE:
    TRANSITION_TO: error_state
  IF_FALSE:
    TRANSITION_TO: render_content

STATE: empty_state
  ACTION: 显示空状态容器，提示任务不存在，提供返回大厅按钮
  FINAL: true

STATE: error_state
  ACTION: 显示错误状态容器，显示错误信息，提供重新加载按钮
  FINAL: true

STATE: render_content
  ACTION: 调用 renderTaskDetail(task) 渲染详情页内容
  FINAL: true

STATE_MACHINE_END
```

---

## D. 文件级实施清单

### D.1 新增文件清单

| 文件路径 | 文件类型 | 创建目的 | 核心职责 | 依赖模块 |
|----------|----------|----------|----------|----------|
| `task-detail.html` | HTML 页面 | 详情页主文件 | 定义页面骨架、引用样式和脚本、定义状态容器 DOM | shared-layout.js, task-detail-main.js |
| `assets/js/task-detail-main.js` | JavaScript 模块 | 详情页统一入口 | 初始化共享布局、调用详情页初始化、捕获全局错误 | shared-layout.js, task-detail.js |
| `assets/js/task-detail.js` | JavaScript 模块 | 详情页交互逻辑 | URL 参数解析、数据加载、状态管理、内容渲染、事件绑定 | task-service.js, task-view-model.js |
| `assets/js/task-preview-drawer.js` | JavaScript 模块 | 预览抽屉组件 | 抽屉开关、内容渲染、事件处理、与筛选抽屉互斥、焦点管理 | task-service.js, task-view-model.js |
| `assets/js/task-view-model.js` | JavaScript 模块 | 共享视图模型 | 数据格式化、默认值处理、状态映射、字段缺失兜底 | 无（纯函数模块） |
| `assets/css/task-detail.css` | CSS 样式表 | 详情页和抽屉样式 | 定义布局、组件样式、响应式断点、与全局样式隔离 | base.css（CSS 变量） |

### D.2 修改文件清单

| 文件路径 | 修改类型 | 修改目的 | 改动位置 | 改动内容 | 影响范围 | 回归验证点 |
|----------|----------|----------|----------|----------|----------|-----------|
| `assets/data/tasks.mock.json` | 数据扩展 | 补充详情展示字段 | 每个任务对象内部 | 新增 5 个顶层字段和 1 个嵌套对象 | 数据层 | 打开任务大厅验证列表和搜索功能 |
| `task-hall.html` | DOM 结构 | 添加抽屉容器 | `</body>` 闭合标签前 | 插入遮罩层和抽屉容器 HTML 结构，使用专用类名 | 任务大厅页面 | 打开任务大厅验证页面布局无变化 |
| `assets/js/task-hall.js` | 事件绑定 | 集成抽屉调用 | taskList 事件监听器内部 | 添加卡片点击检测和抽屉调用逻辑 | 任务大厅交互 | 点击任务卡片验证抽屉打开，验证其他点击不受影响 |
| `assets/js/task-service.js` | 接口新增 | 新增详情查询函数 | 文件末尾 | 新增 `getTaskById()` 函数，修改 `fetchTasks()` 错误处理 | 服务层 | 调用新函数验证返回正确数据 |

### D.3 文档更新清单

| 文件路径 | 更新目的 | 更新位置 | 更新内容 |
|----------|----------|----------|----------|
| `assets/js/CLAUDE.md` | 同步模块文档 | 文件成员清单表格 | 新增 4 个 JS 文件的条目：task-preview-drawer.js, task-view-model.js, task-detail.js, task-detail-main.js |
| `assets/css/CLAUDE.md` | 同步模块文档 | 文件成员清单表格 | 新增 1 个 CSS 文件的条目：task-detail.css |
| `设计文档/CLAUDE.md` | 更新索引 | 文件列表 | 新增 task-detail-page-v3.md 的索引条目 |

---

## E. 分阶段实施步骤

### 阶段一：数据层与服务层

#### Step 1.1：扩展任务 Mock 数据

**目标**：为每个任务对象补充详情展示所需的 5 个顶层字段和 1 个嵌套对象，保持向后兼容。

**改动文件**：`assets/data/tasks.mock.json`

**改动位置**：文件根数组中的每个任务对象

**改动内容**：
- 定位到数组中的每个任务对象
- 在每个对象中新增以下字段（添加到对象末尾，不改变现有字段顺序）：
  - 字段 1：`description`，类型 string，值为完整需求描述文本
  - 字段 2：`requirements`，类型 string[]，值为要求条目数组
  - 字段 3：`deliverables`，类型 string[]，值为交付物条目数组
  - 字段 4：`publishedAt`，类型 string，值为 ISO 8601 格式日期时间字符串
  - 字段 5：`publisher`，类型 object，值为嵌套对象
    - 嵌套对象字段 1：`id`，类型 string，值为发布方唯一标识
    - 嵌套对象字段 2：`name`，类型 string，值与该任务的 `clientName` 字段值相同
    - 嵌套对象字段 3：`avatar`，类型 string 或 null，值为头像 URL 或 null
    - 嵌套对象字段 4：`verified`，类型 boolean，值为认证状态
    - 嵌套对象字段 5：`rating`，类型 number，值范围 0-5，保留一位小数
    - 嵌套对象字段 6：`reviewCount`，类型 number，值为评价数量
    - 嵌套对象字段 7：`publishedCount`，类型 number，值为历史发布任务数
    - 嵌套对象字段 8：`completionRate`，类型 number，值为完成率百分比
- **重要约束**：保留所有现有字段不变，不删除或修改 `clientName` 字段

**数据验证**：
- 保存文件后使用 JSON 验证工具检查格式正确性
- 打开任务大厅页面验证列表和搜索功能正常

**完成标志**：
- 所有任务对象包含新增的 5 个字段
- `publisher.name` 与 `clientName` 值一致
- JSON 格式验证通过
- 任务大厅页面功能正常

---

#### Step 1.2：创建共享视图模型

**目标**：创建纯函数模块，提供任务数据的格式化、默认值处理和状态映射。

**改动文件**：新建 `assets/js/task-view-model.js`

**改动内容**：
- 创建文件头部注释，说明模块职责
- 定义 `TaskViewModel` 常量对象
- 在对象中定义以下方法：

  **方法 1**：`getPublisherName(task)`
  - 输入：task 对象
  - 输出：string 类型，发布方名称
  - 处理逻辑：
    1. 检查 `task.publisher?.name` 是否存在且为非空字符串
    2. 存在则返回该值
    3. 不存在则检查 `task.clientName` 是否存在且为非空字符串
    4. 存在则返回该值
    5. 都不存在则返回 "未知发布方"

  **方法 2**：`getPublisherAvatar(task)`
  - 输入：task 对象
  - 输出：string 类型，头像 URL
  - 处理逻辑：
    1. 检查 `task.publisher?.avatar` 是否存在且为非空字符串
    2. 存在则返回该值
    3. 不存在则返回 "/assets/images/default-avatar.png"

  **方法 3**：`formatRating(task)`
  - 输入：task 对象
  - 输出：对象类型 `{ value: number, stars: number, maxStars: 5, display: string }` 或 null
  - 处理逻辑：
    1. 检查 `task.publisher?.rating` 是否为 number 类型
    2. 不是 number 则返回 null
    3. 是 number 则构造返回对象：
       - value: 原始评分值
       - stars: Math.round(value) 四舍五入后的整数
       - maxStars: 固定为 5
       - display: value.toFixed(1) 格式化字符串

  **方法 4**：`getStatusClass(status)`
  - 输入：status 字符串
  - 输出：string 类型，CSS 类名
  - 处理逻辑：
    1. 定义映射对象：`{ 'recruiting': 'success', 'in-progress': 'primary', 'closed': 'gray' }`
    2. 使用映射对象查找，找不到则返回 'gray'

  **方法 5**：`formatCompletionRate(task)`
  - 输入：task 对象
  - 输出：string 类型或 null
  - 处理逻辑：
    1. 检查 `task.publisher?.completionRate` 是否为 number 类型
    2. 不是 number 则返回 null
    3. 是 number 则返回 `${value.toFixed(1)}%` 格式化字符串

  **方法 6**：`formatPublishedDate(task)`
  - 输入：task 对象
  - 输出：string 类型或 null
  - 处理逻辑：
    1. 检查 `task.publishedAt` 是否存在
    2. 不存在则返回 null
    3. 存在则使用 `new Date(task.publishedAt)` 创建日期对象
    4. 检查日期对象是否有效（使用 `isNaN()` 检查）
    5. 无效则返回 null
    6. 有效则使用 `toLocaleDateString('zh-CN')` 返回格式化字符串

  **方法 7**：`getStacks(task)`
  - 输入：task 对象
  - 输出：string 类型数组
  - 处理逻辑：
    1. 检查 `task.stacks` 是否存在且为数组
    2. 存在则返回该数组
    3. 不存在则返回空数组 []

  **方法 8**：`getRequirements(task)`
  - 输入：task 对象
  - 输出：string 类型数组
  - 处理逻辑：
    1. 检查 `task.requirements` 是否存在且为数组
    2. 存在则返回该数组
    3. 不存在则返回空数组 []

  **方法 9**：`getDeliverables(task)`
  - 输入：task 对象
  - 输出：string 类型数组
  - 处理逻辑：
    1. 检查 `task.deliverables` 是否存在且为数组
    2. 存在则返回该数组
    3. 不存在则返回空数组 []

- 使用 ES6 导出语法：`export const TaskViewModel = { ... }`

**完成标志**：
- 文件创建成功
- 所有 9 个方法定义完成
- 每个方法都包含默认值或兜底逻辑

---

#### Step 1.3：扩展任务服务层接口

**目标**：新增按 ID 查询任务的函数，修复并发加载时的悬挂 Promise 问题。

**改动文件**：`assets/js/task-service.js`

**改动位置 1**：文件中 `fetchTasks()` 函数的 `catch` 和 `finally` 块

**改动内容 1**（修复并发问题）：
- 定位到 `fetchTasks()` 函数
- 在 `catch` 块中添加：`cachedTasks = []`，确保失败后清空缓存
- 在 `finally` 块中添加：
  - `isLoading = false`，重置加载状态
  - `fetchPromise = null`，重置 Promise 引用

**改动位置 2**：文件末尾，导出语句之前

**改动内容 2**（新增函数）：
- 定义新函数 `async function getTaskById(taskId)`
- 添加 JSDoc 注释说明参数和返回值
- 函数体逻辑：
  1. 调用 `await fetchTasks()` 确保数据已加载
  2. 使用 `cachedTasks.find(task => task.id === taskId)` 查找匹配任务
  3. 判断查找结果：
     - 找到则返回该任务对象
     - 未找到则在控制台输出警告 `console.warn(\`任务不存在: \${taskId}\`)`
     - 返回 null
- 在文件导出语句中添加：`export { getTaskById }`

**前置依赖**：Step 1.1（数据已扩展）

**完成标志**：
- `getTaskById()` 函数定义完成
- 并发问题修复代码已添加到 `fetchTasks()`
- 函数正确导出
- 调用测试能正确返回任务对象或 null

---

### 阶段二：预览抽屉组件

#### Step 2.1：创建抽屉 DOM 结构

**目标**：在任务大厅页面添加预览抽屉的 DOM 容器，使用专用类名实现样式隔离。

**改动文件**：`task-hall.html`

**改动位置**：`</body>` 闭合标签之前，现有筛选抽屉 DOM 结构之后

**改动内容**：
- 添加注释：`<!-- 任务预览抽屉 -->`
- 添加遮罩层元素：
  - 标签：`<div>`
  - ID：`taskPreviewDrawerOverlay`
  - 类名：`task-preview-drawer-overlay`
  - ARIA 属性：`aria-hidden="true"`
- 添加抽屉容器元素：
  - 标签：`<aside>`
  - ID：`taskPreviewDrawer`
  - 类名：`task-preview-drawer`
  - ARIA 属性：`aria-hidden="true"`, `role="dialog"`, `aria-modal="true"`, `aria-label="任务预览"`
  - 内容：空元素，后续由 JS 动态填充

**约束条件**：
- DOM 顺序必须在现有筛选抽屉之后，确保 z-index 层级正确
- 不修改现有筛选抽屉的任何代码

**完成标志**：
- DOM 结构添加成功
- 元素 ID 和类名拼写正确
- ARIA 属性完整

---

#### Step 2.2：实现抽屉组件逻辑

**目标**：创建抽屉组件模块，实现开关、渲染、事件处理、互斥、焦点管理功能。

**改动文件**：新建 `assets/js/task-preview-drawer.js`

**改动内容**：

**定义模块对象**：
- 创建 `TaskPreviewDrawer` 常量对象
- 对象包含以下属性：
  - `drawer`：null，后续在 `init()` 中赋值为抽屉 DOM 元素引用
  - `overlay`：null，后续在 `init()` 中赋值为遮罩层 DOM 元素引用
  - `triggerElement`：null，用于保存触发抽屉打开的元素，关闭后恢复焦点

**方法 1**：`init()`
- 职责：初始化模块，绑定关闭事件
- 处理逻辑：
  1. 使用 `document.getElementById()` 获取 `taskPreviewDrawer` 元素，赋值给 `this.drawer`
  2. 使用 `document.getElementById()` 获取 `taskPreviewDrawerOverlay` 元素，赋值给 `this.overlay`
  3. 在遮罩层上绑定 `click` 事件监听器，调用 `this.close()`
  4. 在抽屉容器内查找关闭按钮（如果存在），绑定 `click` 事件监听器，调用 `this.close()`
  5. 在 `document` 上绑定 `keydown` 事件监听器：
     - 检查 `e.key === 'Escape'`
     - 检查 `this.isOpen()` 返回 true
     - 条件满足则调用 `this.close()`

**方法 2**：`isOpen()`
- 职责：检查抽屉是否处于打开状态
- 处理逻辑：
  1. 检查 `this.drawer` 是否存在
  2. 检查 `this.drawer.classList` 是否包含 `active` 类
  3. 返回 boolean 结果

**方法 3**：`async open(taskId, triggerElement)`
- 职责：打开抽屉，加载并显示任务数据
- 输入参数：
  - `taskId`：string 类型，任务 ID
  - `triggerElement`：Element 类型，触发抽屉打开的 DOM 元素
- 处理逻辑：
  1. 将 `triggerElement` 赋值给 `this.triggerElement`，用于后续焦点恢复
  2. 检查 `window.FilterDrawer` 是否存在
  3. 存在则检查 `window.FilterDrawer.isOpen()` 是否返回 true
  4. 返回 true 则调用 `await window.FilterDrawer.close()`，关闭筛选抽屉
  5. 设置 `document.body.style.overflow = 'hidden'`，锁定背景滚动
  6. 调用 `await TaskService.getTaskById(taskId)` 获取任务数据
  7. 判断任务是否为 null
  8. 为 null 则在控制台输出错误并返回
  9. 不为 null 则调用 `this.renderContent(task)` 渲染内容
  10. 调用 `this.drawer.classList.add('active')` 显示抽屉
  11. 调用 `this.overlay.classList.add('active')` 显示遮罩层
  12. 在抽屉容器内查找第一个可交互元素（按钮、链接、输入框等）
  13. 找到则调用该元素的 `focus()` 方法

**方法 4**：`close()`
- 职责：关闭抽屉，恢复页面状态
- 处理逻辑：
  1. 检查 `this.drawer` 是否存在
  2. 存在则调用 `this.drawer.classList.remove('active')`
  3. 检查 `this.overlay` 是否存在
  4. 存在则调用 `this.overlay.classList.remove('active')`
  5. 设置 `document.body.style.overflow = ''`，恢复背景滚动
  6. 检查 `this.triggerElement` 是否存在
  7. 存在则调用 `this.triggerElement.focus()`，恢复焦点
  8. 将 `this.triggerElement` 重置为 null

**方法 5**：`renderContent(task)`
- 职责：渲染抽屉内容
- 输入参数：`task` 对象
- 处理逻辑：
  1. 调用 `TaskViewModel` 的各方法格式化数据：
     - `getPublisherName(task)` 获取发布方名称
     - `getPublisherAvatar(task)` 获取头像 URL
     - `formatRating(task)` 获取评分对象
     - `getStatusClass(task.status)` 获取状态类名
     - `getStacks(task)` 获取技术栈数组
  2. 使用模板字符串生成 HTML，包含以下部分：
     - 头部区域：关闭按钮
     - 任务标题：`<h3>` 标签
     - 状态徽章：`<span>` 标签，使用状态类名
     - 任务摘要：`<p>` 标签，内容来自 `task.summary`
     - 发布方简要信息：头像、名称、认证标识
     - 预算和工期：`<div>` 容器显示 `task.budgetMin`、`task.budgetMax`、`task.durationDays`
     - 技术栈标签：遍历技术栈数组，每个生成一个标签元素
     - 底部操作区：
       - "查看详情"按钮：点击后跳转到 `task-detail.html?id=${task.id}`
       - 关闭按钮：调用 `TaskPreviewDrawer.close()`
  3. 将生成的 HTML 字符串赋值给 `this.drawer.innerHTML`

**导出模块**：
- 使用 ES6 导出语法：`export const TaskPreviewDrawer = { ... }`

**前置依赖**：Step 1.2（视图模型）、Step 1.3（服务层）、Step 2.1（DOM 结构）

**完成标志**：
- 文件创建成功
- 所有 5 个方法定义完成
- 与筛选抽屉互斥逻辑已实现
- 焦点管理和滚动锁定已实现

---

#### Step 2.3：集成抽屉到任务大厅

**目标**：在任务大厅页面加载抽屉模块，在任务卡片点击事件中调用抽屉。

**改动文件 1**：`task-hall.html`

**改动位置**：现有 `<script>` 标签之后

**改动内容**：
- 添加新的 `<script type="module">` 标签
- 在标签内添加导入语句：
  - `import { TaskPreviewDrawer } from './assets/js/task-preview-drawer.js';`
- 添加全局赋值：`window.TaskPreviewDrawer = TaskPreviewDrawer;`
- 添加初始化调用：`TaskPreviewDrawer.init();`

**改动文件 2**：`assets/js/task-hall.js`

**改动位置**：`taskList` 元素的点击事件监听器内部

**改动内容**：
- 定位到处理卡片点击的代码块
- 在事件处理函数开头添加判断逻辑：
  1. 使用 `e.target.closest('.task-card')` 获取点击的任务卡片元素
  2. 判断结果是否为 null
  3. 为 null 则直接返回（不处理）
- 获取卡片的 `data-task-id` 属性值
- 调用 `TaskPreviewDrawer.open(taskId, card)` 打开抽屉
- 调用 `e.preventDefault()` 阻止默认行为
- 调用 `e.stopPropagation()` 阻止事件冒泡

**前置依赖**：Step 2.1（DOM 结构）、Step 2.2（抽屉组件）

**完成标志**：
- HTML 导入语句添加成功
- task-hall.js 点击事件处理已添加
- 点击任务卡片能正确打开抽屉
- 点击卡片内其他元素（如筛选按钮）不受影响

---

#### Step 2.4：创建抽屉样式

**目标**：定义预览抽屉的样式，实现与全局抽屉样式的隔离。

**改动文件**：新建 `assets/css/task-detail.css`

**改动内容**：

**样式规则 1**：`.task-preview-drawer-overlay`
- 定位：`position: fixed`
- 位置：`top: 0; left: 0; width: 100%; height: 100%`
- 背景色：使用 `rgba(0, 0, 0, 0.5)`
- 层级：`z-index: 1000`
- 初始状态：`opacity: 0; visibility: hidden;`
- 激活状态：`.task-preview-drawer-overlay.active` 设置 `opacity: 1; visibility: visible;`
- 过渡：使用 `transition: opacity 0.3s ease;`

**样式规则 2**：`.task-preview-drawer`
- 定位：`position: fixed`
- 位置：`top: 0; right: 0; height: 100%;`
- 宽度：`width: 420px`
- 背景色：`background: white`
- 层级：`z-index: 1001`
- 初始状态：`transform: translateX(100%);`
- 激活状态：`.task-preview-drawer.active` 设置 `transform: translateX(0);`
- 过渡：使用 `transition: transform 0.3s ease;`

**样式规则 3**：响应式断点
- 媒体查询：`@media (max-width: 768px)`
- 修改 `.task-preview-drawer` 宽度为 `width: 100%`

**样式规则 4**：内部组件样式
- `.task-preview-drawer__header`：头部区域，包含关闭按钮
- `.task-preview-drawer__body`：内容区域，设置 `overflow-y: auto` 支持滚动
- `.task-preview-drawer__footer`：底部操作区
- `.task-preview-drawer__title`：标题样式
- `.task-preview-drawer__close-btn`：关闭按钮样式

**约束条件**：
- 不修改全局 `.drawer` 样式
- 使用 CSS 变量保持风格一致（如 `--spacing-md`, `--color-primary`）
- 不在 `components.css` 中添加或修改任何规则

**前置依赖**：Step 2.1（DOM 结构）

**完成标志**：
- 样式文件创建成功
- 抽屉能从右侧滑出
- 移动端全屏显示
- 不影响现有筛选抽屉样式

---

### 阶段三：详情页开发

#### Step 3.1：创建详情页 HTML 结构

**目标**：定义详情页的骨架结构，引用样式和脚本。

**改动文件**：新建 `task-detail.html`

**改动内容**：

**文档结构**：
- 使用 `<!DOCTYPE html>` 声明
- `<html>` 元素设置 `lang="zh-CN"`

**HEAD 部分**：
- `<meta charset="UTF-8">`
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- `<title>` 设置为 "任务详情 - TechCraft"
- 样式引用（按顺序）：
  - `<link rel="stylesheet" href="./assets/css/base.css">`
  - `<link rel="stylesheet" href="./assets/css/components.css">`
  - `<link rel="stylesheet" href="./assets/css/task-detail.css">`
- 脚本引用：
  - `<script type="module" src="./assets/js/task-detail-main.js"></script>`

**BODY 部分**：
- 导航栏容器：`<div data-layout="navbar"></div>`
- 面包屑导航：`<nav class="breadcrumb">...</nav>`，包含链接到任务大厅
- 主内容区：`<main class="detail-page">`
  - 左侧内容区：`<div class="detail-content">`
    - 任务标题区域
    - 任务状态区域
    - 任务描述区域
    - 要求列表区域
    - 交付物列表区域
    - 预算和工期信息区域
    - 技术栈标签区域
  - 右侧侧边栏：`<aside class="detail-sidebar">`
    - 发布方卡片
    - 发布方头像区域
    - 发布方名称区域
    - 认证标识区域
    - 评分星级显示区域
    - 统计数据区域（发布数、完成率）
    - 联系方式占位区域
- 状态容器（初始隐藏，使用 `hidden` 属性）：
  - `<div id="loadingState" class="detail-loading" hidden>`
  - `<div id="emptyState" class="detail-empty" hidden>`
  - `<div id="errorState" class="detail-error" hidden>`
- 页脚容器：`<div data-layout="footer"></div>`
- 回到顶部容器：`<div data-layout="back-to-top"></div>`

**完成标志**：
- HTML 文件创建成功
- 页面结构完整
- 样式和脚本引用正确
- 所有容器元素都有对应的类名或 ID

---

#### Step 3.2：创建详情页入口文件

**目标**：实现详情页的统一初始化入口，确保共享布局正确加载。

**改动文件**：新建 `assets/js/task-detail-main.js`

**改动内容**：

**导入依赖**：
- `import { initSharedLayout } from './shared-layout.js';`
- `import { initTaskDetail } from './task-detail.js';`

**初始化流程**：
- 监听 `DOMContentLoaded` 事件
- 使用 `async` 函数包裹初始化逻辑
- 使用 `try-catch-finally` 结构：
  - `try` 块：
    - 调用 `await initSharedLayout()` 初始化共享布局
    - 调用 `await initTaskDetail()` 初始化详情页
  - `catch` 块：
    - 捕获错误对象
    - 在控制台输出错误信息
    - 显示全局错误状态（如果有错误状态容器）
  - `finally` 块：
    - 可选的清理逻辑

**完成标志**：
- 文件创建成功
- 导入语句正确
- 初始化流程完整
- 错误处理逻辑存在

---

#### Step 3.3：实现详情页交互逻辑

**目标**：实现详情页的数据加载、状态处理、内容渲染和事件绑定。

**改动文件**：新建 `assets/js/task-detail.js`

**改动内容**：

**导出函数 1**：`async function initTaskDetail()`
- 职责：详情页初始化入口
- 处理逻辑：
  1. 创建 `URLSearchParams` 对象：`new URLSearchParams(window.location.search)`
  2. 获取任务 ID：`const taskId = params.get('id');`
  3. 检查 `taskId` 是否为 null 或空字符串
  4. 是则调用 `showEmptyState()` 并返回
  5. 否则调用 `showLoadingState()` 显示加载状态
  6. 调用 `await TaskService.getTaskById(taskId)` 获取任务数据
  7. 检查返回的 `task` 是否为 null
  8. 为 null 则调用 `showEmptyState()` 并返回
  9. 不为 null 则调用 `renderTaskDetail(task)` 渲染详情页
  10. 发生异常则调用 `showErrorState(error.message)`

**函数 2**：`showLoadingState()`
- 职责：显示加载状态
- 处理逻辑：
  1. 调用 `hideAllStates()` 隐藏所有状态
  2. 获取 loading 容器元素：`document.getElementById('loadingState')`
  3. 移除容器的 `hidden` 属性

**函数 3**：`showEmptyState()`
- 职责：显示空状态
- 处理逻辑：
  1. 调用 `hideAllStates()` 隐藏所有状态
  2. 获取 empty 容器元素
  3. 移除容器的 `hidden` 属性

**函数 4**：`showErrorState(message)`
- 职责：显示错误状态
- 输入参数：`message` 字符串，错误信息
- 处理逻辑：
  1. 调用 `hideAllStates()` 隐藏所有状态
  2. 获取 error 容器元素
  3. 移除容器的 `hidden` 属性
  4. 在容器内显示错误信息

**函数 5**：`hideAllStates()`
- 职责：隐藏所有状态容器
- 处理逻辑：
  1. 获取所有状态容器元素数组
  2. 遍历数组，为每个元素添加 `hidden` 属性

**函数 6**：`renderTaskDetail(task)`
- 职责：渲染详情页内容
- 输入参数：`task` 对象
- 处理逻辑：
  1. 调用 `hideAllStates()` 隐藏所有状态
  2. 调用 `TaskViewModel` 各方法格式化数据：
     - `getPublisherName(task)`
     - `getPublisherAvatar(task)`
     - `formatRating(task)`
     - `getStatusClass(task.status)`
     - `formatCompletionRate(task)`
     - `formatPublishedDate(task)`
     - `getStacks(task)`
     - `getRequirements(task)`
     - `getDeliverables(task)`
  3. 获取各 DOM 容器元素
  4. 填充任务信息：
     - 标题：设置 `textContent`
     - 状态：设置类名和文本
     - 描述：检查 `task.description` 是否存在，存在则显示，不存在则隐藏容器
     - 要求列表：遍历数组生成列表项
     - 交付物列表：遍历数组生成列表项
     - 预算：格式化显示 `task.budgetMin` 和 `task.budgetMax`
     - 工期：显示 `task.durationDays`
     - 技术栈：遍历数组生成标签元素
  5. 填充发布方信息：
     - 头像：设置 `src` 属性
     - 名称：设置 `textContent`
     - 认证标识：根据 `task.publisher.verified` 显示或隐藏
     - 评分：使用 `formatRating()` 返回的星级数据生成显示元素
     - 统计数据：显示 `task.publisher.publishedCount` 和 `task.publisher.completionRate`
     - 联系方式：显示固定文本"接取任务后可见"
  6. 绑定"返回大厅"按钮点击事件：
     - 获取按钮元素
     - 添加 `click` 事件监听器
     - 调用 `window.history.back()`

**导出语句**：
- `export { initTaskDetail };`

**前置依赖**：Step 1.2（视图模型）、Step 1.3（服务层）、Step 3.2（入口文件）

**完成标志**：
- 文件创建成功
- 所有函数定义完成
- 状态处理逻辑完整
- 渲染逻辑使用 TaskViewModel
- 返回按钮事件已绑定

---

#### Step 3.4：创建详情页样式

**目标**：定义详情页的布局和组件样式。

**改动文件**：`assets/css/task-detail.css`

**改动位置**：在 Step 2.4 的抽屉样式之后追加

**改动内容**：

**布局样式**：
- `.detail-page`：主容器，`max-width: 1200px`，`margin: 0 auto`，`padding: var(--spacing-lg)`
- `.breadcrumb`：面包屑导航，使用 Flexbox 布局
- `.detail-content`：左侧内容区，使用 Grid 或 Flexbox
- `.detail-sidebar`：右侧侧边栏，固定宽度 `320px`
- 响应式断点：`@media (max-width: 1024px)` 将左右布局改为单列堆叠

**组件样式**：
- `.detail-section`：通用区块，包含标题和内容区域
- `.detail-requirements`：要求列表，使用 `<ul>` 和 `<li>` 样式
- `.detail-deliverables`：交付物列表，使用 `<ul>` 和 `<li>` 样式
- `.detail-tags`：技术栈标签容器，使用 Flexbox 布局
- `.publisher-card`：发布方卡片，使用卡片样式（边框、圆角、阴影）
- `.publisher-avatar`：头像样式，`border-radius: 50%`，固定尺寸
- `.publisher-rating`：评分星级显示，使用颜色区分星级
- `.publisher-stats`：统计数据网格，使用 Grid 布局
- `.contact-placeholder`：联系方式占位符，灰色文本

**状态组件样式**：
- `.detail-loading`：加载状态，包含骨架屏或加载动画
- `.detail-empty`：空状态，居中显示图标和文本
- `.detail-error`：错误状态，居中显示图标和文本

**约束条件**：
- 复用 CSS 变量（`--spacing-*`, `--color-*`）
- 复用按钮组件样式（`.btn`, `.btn-primary`）
- 复用状态徽章样式（`.status-badge`）
- 不修改全局样式

**前置依赖**：Step 3.1（HTML 结构）

**完成标志**：
- 样式定义完成
- 响应式断点设置正确
- 与现有风格保持一致

---

### 阶段四：联调测试

#### Step 4.1：功能冒烟测试

**目标**：验证核心功能链路正常工作。

**测试场景 1**：打开任务大厅，点击任务卡片
- 操作：在浏览器中打开 `task-hall.html`
- 操作：点击页面中的任意任务卡片
- 预期结果：页面右侧滑出预览抽屉
- 预期结果：抽屉显示任务标题、状态徽章、摘要、发布方信息、预算工期、技术栈
- 预期结果：抽屉底部显示"查看详情"按钮

**测试场景 2**：在预览抽屉中点击"查看详情"
- 操作：在抽屉底部的"查看详情"按钮上点击
- 预期结果：浏览器跳转到 `task-detail.html?id={taskId}`
- 预期结果：详情页加载完成

**测试场景 3**：检查详情页内容
- 预期结果：任务标题正确显示
- 预期结果：任务状态徽章显示
- 预期结果：任务描述区域显示内容（如果数据存在）
- 预期结果：要求列表显示所有条目
- 预期结果：交付物列表显示所有条目
- 预期结果：预算范围显示
- 预期结果：工期天数显示
- 预期结果：技术栈标签显示
- 预期结果：发布方头像显示
- 预期结果：发布方名称显示
- 预期结果：认证标识显示（如果 verified 为 true）
- 预期结果：评分星级显示
- 预期结果：统计数据显示（发布数、完成率）
- 预期结果：联系方式显示"接取任务后可见"

**测试场景 4**：点击"返回大厅"按钮
- 操作：在详情页中点击"返回大厅"按钮
- 预期结果：返回任务大厅页面
- 预期结果：之前设置的筛选条件保留
- 预期结果：之前浏览的页码保留

**测试场景 5**：使用浏览器返回按钮
- 操作：在详情页中使用浏览器的返回功能
- 预期结果：行为与"返回大厅"按钮一致
- 预期结果：筛选条件和页码保留

**完成标志**：
- 所有 5 个场景测试通过
- 浏览器控制台无错误
- UI 显示正常无错乱

---

#### Step 4.2：字段缺失测试

**目标**：验证数据字段的默认值处理逻辑正常工作。

**测试场景 1**：移除 `publisher.avatar`
- 操作：在 `tasks.mock.json` 中临时删除某个任务的 `publisher.avatar` 字段
- 操作：刷新页面，打开该任务的详情页
- 预期结果：显示默认头像（不显示破碎图片）

**测试场景 2**：移除 `publisher.rating`
- 操作：在 `tasks.mock.json` 中临时删除某个任务的 `publisher.rating` 字段
- 操作：刷新页面，打开该任务的详情页
- 预期结果：评分区域隐藏或显示"暂无评分"文本

**测试场景 3**：移除 `description`
- 操作：在 `tasks.mock.json` 中临时删除某个任务的 `description` 字段
- 操作：刷新页面，打开该任务的详情页
- 预期结果：描述区域隐藏（不显示空容器）

**测试场景 4**：移除 `requirements`
- 操作：在 `tasks.mock.json` 中临时删除某个任务的 `requirements` 字段
- 操作：刷新页面，打开该任务的详情页
- 预期结果：要求列表区域隐藏

**测试场景 5**：将 `stacks` 设为空数组
- 操作：在 `tasks.mock.json` 中将某个任务的 `stacks` 设为 `[]`
- 操作：刷新页面，打开该任务的详情页
- 预期结果：显示"暂无技术栈"文本或该区域隐藏

**完成标志**：
- 所有 5 个场景测试通过
- 无页面崩溃或 JavaScript 错误
- 默认值或占位内容正确显示

---

#### Step 4.3：抽屉冲突测试

**目标**：验证预览抽屉与筛选抽屉的互斥关系。

**测试场景 1**：筛选抽屉打开时点击任务卡片
- 操作：在移动端或窄屏模式下打开筛选抽屉
- 操作：点击任意任务卡片
- 预期结果：筛选抽屉自动关闭
- 预期结果：预览抽屉打开

**测试场景 2**：预览抽屉打开时点击筛选按钮
- 操作：在移动端或窄屏模式下打开预览抽屉
- 操作：点击筛选按钮
- 预期结果：预览抽屉自动关闭
- 预期结果：筛选抽屉打开

**测试场景 3**：按下 ESC 键
- 操作：打开预览抽屉
- 操作：按下键盘 ESC 键
- 预期结果：预览抽屉关闭
- 操作：打开筛选抽屉
- 操作：按下键盘 ESC 键
- 预期结果：筛选抽屉关闭

**测试场景 4**：快速切换两个抽屉
- 操作：在移动端快速交替打开筛选抽屉和预览抽屉多次
- 预期结果：两个抽屉不会同时打开
- 预期结果：背景滚动锁定正常（打开抽屉时背景不可滚动，关闭后恢复）

**完成标志**：
- 所有 4 个场景测试通过
- 双抽屉不会同时打开
- 滚动锁定功能正常

---

#### Step 4.4：响应式测试

**目标**：验证不同设备尺寸的布局适配。

**测试场景 1**：桌面端（宽度 > 1024px）
- 操作：将浏览器宽度调整为 1200px 或更大
- 操作：打开任务大厅，点击任务卡片
- 预期结果：预览抽屉宽度为 420px，从右侧滑出
- 操作：在抽屉中点击"查看详情"
- 预期结果：详情页左右分栏布局（左侧内容，右侧侧边栏）

**测试场景 2**：平板端（宽度 768px - 1024px）
- 操作：将浏览器宽度调整为 800px
- 操作：打开任务大厅，点击任务卡片
- 预期结果：预览抽屉宽度为 100%（全屏）
- 操作：在抽屉中点击"查看详情"
- 预期结果：详情页单列堆叠布局

**测试场景 3**：移动端（宽度 < 768px）
- 操作：将浏览器宽度调整为 375px
- 操作：打开任务大厅，点击任务卡片
- 预期结果：预览抽屉宽度为 100%（全屏）
- 操作：在抽屉中点击"查看详情"
- 预期结果：详情页单列布局
- 预期结果：所有内容可读，无横向滚动条

**完成标志**：
- 所有 3 个断点测试通过
- 布局切换无突兀
- 无样式错乱

---

### 阶段五：文档更新

#### Step 5.1：更新模块文档

**目标**：同步更新 JS 和 CSS 模块文档。

**改动文件 1**：`assets/js/CLAUDE.md`

**改动位置**："文件成员清单"表格

**改动内容**：
- 在表格中新增以下行：
  - 文件名：`task-preview-drawer.js`，职责：任务预览抽屉组件，状态：完整
  - 文件名：`task-view-model.js`，职责：共享任务数据视图模型，状态：完整
  - 文件名：`task-detail.js`，职责：任务详情页交互逻辑，状态：完整
  - 文件名：`task-detail-main.js`，职责：任务详情页统一入口，状态：完整

**改动文件 2**：`assets/css/CLAUDE.md`

**改动位置**："文件成员清单"表格

**改动内容**：
- 在表格中新增以下行：
  - 文件名：`task-detail.css`，职责：任务详情页和预览抽屉样式，状态：完整

**完成标志**：
- 模块文档更新完成
- 新增文件都有对应的文档说明
- 文档格式与现有条目一致

---

## F. 关键实现约束

### F.1 状态管理约束

| 约束项 | 具体要求 | 违反后果 | 验证方式 |
|--------|----------|----------|----------|
| 抽屉显示状态 | 通过 DOM 元素的 `classList.contains('active')` 判断，不使用 JavaScript 变量 | 状态与 UI 不同步 | 打开抽屉后检查 DOM 类名 |
| 详情页加载状态 | 使用容器的 `hidden` 属性控制显示隐藏，一次只显示一个状态容器 | 多个状态同时显示 | 在浏览器开发者工具中检查容器属性 |
| URL 参数状态 | 详情页任务 ID 从 `URLSearchParams` 读取，不存储在变量或本地存储中 | 刷新页面后 ID 丢失 | 刷新详情页验证内容正常显示 |
| 滚动锁定状态 | 抽屉打开时设置 `document.body.style.overflow = 'hidden'`，关闭时恢复为空字符串 | 背景可滚动或关闭后仍锁定 | 打开抽屉后尝试滚动背景 |
| 焦点恢复状态 | 打开抽屉前保存触发元素引用到 `triggerElement` 属性，关闭后调用该元素的 `focus()` 方法 | 焦点丢失或位置错误 | 使用键盘 Tab 键导航验证 |

### F.2 接口设计约束

| 接口 | 约束要求 | 违反后果 | 验证方式 |
|------|----------|----------|----------|
| `getTaskById(taskId)` | 必须返回 `Task` 对象或 `null`，不得抛出异常 | 调用方需要 try-catch | 调用时传入无效 ID 验证不抛异常 |
| `TaskViewModel` 方法 | 所有方法必须处理 `undefined` 和 `null` 输入，返回安全默认值 | 字段缺失导致页面崩溃 | 传入 null 验证返回默认值 |
| `TaskPreviewDrawer.open()` | 必须接受 `triggerElement` 参数，类型为 Element | 关闭后无法恢复焦点 | 传入 DOM 元素验证关闭后焦点恢复 |
| `initTaskDetail()` | 必须为 `async` 函数，支持 `await` 调用 | 初始化流程无法正确等待 | 在调用处使用 await 验证 |

### F.3 组件拆分约束

| 组件 | 拆分要求 | 违反后果 | 验证方式 |
|------|----------|----------|----------|
| 预览抽屉组件 | 独立文件 `task-preview-drawer.js`，不依赖 `task-hall.js` 的任何变量或函数 | 无法复用和单元测试 | 删除 `task-hall.js` 中调用抽屉的代码验证抽屉仍可独立使用 |
| 视图模型组件 | 纯函数模块，不包含副作用（不修改 DOM、不发送网络请求） | 难以测试和维护 | 多次调用同一函数验证返回相同结果 |
| 详情页入口 | 独立文件 `task-detail-main.js`，与 `task-detail.js` 分离 | 初始化流程混乱 | 检查文件职责单一 |

### F.4 命名与目录规范

| 类别 | 命名要求 | 违反后果 | 验证方式 |
|------|----------|----------|----------|
| 抽屉 CSS 类名 | 使用 `.task-preview-drawer` 前缀，不使用全局 `.drawer` | 影响筛选抽屉样式 | 检查 CSS 文件不包含 `.drawer` 选择器 |
| 详情页文件名 | 统一使用 `task-detail-*` 前缀 | 模块归属不清晰 | 检查所有新增文件名符合规范 |
| 视图模型方法名 | 使用 `get*` 或 `format*` 前缀，动词开头 | 语义不明确 | 检查所有方法名符合规范 |
| 状态容器类名 | 使用 `.detail-loading`, `.detail-empty`, `.detail-error` | 状态管理混乱 | 检查 CSS 文件类名定义 |

### F.5 错误处理与边界处理要求

| 场景 | 处理要求 | 未处理的后果 | 验证方式 |
|------|----------|--------------|----------|
| URL 参数缺失 | 显示空状态，不抛出异常，提供返回大厅按钮 | 用户看到空白页面或错误 | 直接访问 `task-detail.html`（不带参数） |
| 任务不存在 | 显示空状态，提示任务不存在，提供返回按钮 | 用户看到空白页面 | 直接访问 `task-detail.html?id=invalid-id` |
| 数据加载失败 | 显示错误状态，显示错误信息，提供重新加载按钮 | 用户无法知道发生了什么 | 在开发者工具中模拟网络失败 |
| 字段缺失 | 使用 `TaskViewModel` 提供默认值或隐藏对应区域 | 页面显示 `undefined` 或崩溃 | 临时删除 Mock 数据字段验证 |
| 并发加载失败 | 在 `finally` 块中重置 `isLoading` 和 `fetchPromise` | 后续请求永久挂起 | 模拟首次请求失败后再次调用 |

---

## G. 风险、回归与测试建议

### G.1 风险点与缓解措施

| 风险编号 | 风险描述 | 影响范围 | 缓解措施 | 验证方式 |
|----------|----------|----------|----------|----------|
| R-01 | 修改或删除 `clientName` 导致大厅搜索失效 | 高 | 明确要求保留 `clientName` 字段不变，新增 `publisher` 作为补充 | 打开任务大厅，使用搜索功能验证 |
| R-02 | 修改全局 `.drawer` 样式影响筛选抽屉 | 中 | 使用专用类名 `.task-preview-drawer`，不在 `components.css` 中修改 | 打开筛选抽屉验证宽度仍为 320px |
| R-03 | 缺少 `task-detail-main.js` 导致共享布局不工作 | 中 | 创建独立的入口文件，在 `DOMContentLoaded` 中调用 `initSharedLayout()` | 打开详情页验证导航栏和页脚显示 |
| R-04 | 并发加载失败导致悬挂 Promise | 中 | 修复 `task-service.js` 的 `finally` 块，确保状态重置 | 使用两个浏览器标签页同时加载详情 |
| R-05 | 抽屉互斥失效导致双抽屉同时打开 | 低 | 在预览抽屉打开时检查并关闭筛选抽屉 | 在移动端快速切换两个抽屉 |
| R-06 | 使用硬编码跳转导致筛选上下文丢失 | 低 | 使用 `history.back()` 返回 | 从筛选结果进入详情后返回 |

### G.2 易出错点与避免方法

| 出错点编号 | 出错点描述 | 错误表现 | 避免方法 | 验证方式 |
|------------|------------|----------|----------|----------|
| E-01 | 字段缺失处理 | 页面显示 `undefined` 或 `null` | 使用 `TaskViewModel` 统一处理默认值 | 临时删除 Mock 数据字段验证 |
| E-02 | 焦点管理 | 打开抽屉后焦点丢失或位置错误 | 保存 `triggerElement`，关闭后调用 `focus()` | 使用键盘 Tab 键导航验证焦点顺序 |
| E-03 | 滚动锁定 | 关闭抽屉后背景仍不可滚动 | 在 `finally` 或关闭方法中确保恢复 `body.style.overflow` | 打开抽屉后关闭，尝试滚动背景 |
| E-04 | URL 参数解析 | 直接访问详情页时 ID 为空字符串 | 检查 `params.get('id')` 是否为 `null` 或空字符串 | 直接访问 `task-detail.html` 验证空状态 |
| E-05 | 事件冒泡 | 点击卡片内的按钮时触发抽屉 | 使用 `e.target.closest('.task-card')` 精确判断 | 点击卡片内的各种元素验证 |
| E-06 | 响应式断点 | 移动端布局错乱 | 测试所有断点（>1024, 768-1024, <768） | 调整浏览器宽度验证 |

### G.3 回归检查点

| 检查点编号 | 检查项 | 检查内容 | 回归方式 |
|------------|--------|----------|----------|
| RC-01 | 大厅列表渲染 | 确保任务卡片正常显示 | 打开任务大厅，检查所有卡片 |
| RC-02 | 大厅搜索功能 | 确保按 `clientName` 搜索正常工作 | 在搜索框输入发布方名称，验证结果 |
| RC-03 | 筛选抽屉 | 确保筛选抽屉样式和功能不受影响 | 打开筛选抽屉，检查宽度和交互 |
| RC-04 | 翻页功能 | 确保页码跳转正常工作 | 点击不同页码，验证内容更新 |
| RC-05 | 共享布局 | 确保导航栏、页脚、回到顶部正常显示 | 打开详情页，检查各组件存在 |

### G.4 建议补充的测试

| 测试类型 | 测试场景 | 测试方法 | 预期结果 |
|----------|----------|----------|----------|
| 字段缺失测试 | 逐个移除任务数据字段 | 手动修改 Mock 数据，刷新页面验证 | 显示默认值或隐藏对应区域 |
| 并发测试 | 同时打开抽屉和详情页 | 使用两个浏览器标签页同时操作 | 两个请求独立完成，不互相阻塞 |
| 焦点测试 | 使用键盘 Tab 键导航 | 仅使用键盘操作页面 | 焦点顺序合理，抽屉关闭后焦点恢复 |
| 性能测试 | 大量任务时抽屉打开速度 | 在 Mock 数据中添加 100+ 任务 | 抽屉打开时间不超过 500ms |
| 兼容性测试 | 不同浏览器 | 在 Chrome、Firefox、Safari 中测试 | 所有功能正常工作 |

---

## H. 最终交付清单

### H.1 可见成果验证

| 成果类型 | 验证项 | 验证步骤 | 成功标准 |
|----------|--------|----------|----------|
| 用户可见功能 | 任务预览 | 打开任务大厅，点击任务卡片 | 抽屉滑出，内容正确显示 |
| 用户可见功能 | 详情页跳转 | 在预览抽屉中点击"查看详情" | 跳转到详情页，URL 包含任务 ID |
| 用户可见功能 | 详情页内容 | 打开详情页，检查各区域 | 所有信息正确显示 |
| 用户可见功能 | 返回上下文保留 | 从筛选结果进入详情后返回 | 筛选条件和页码保留 |
| 开发可见文件 | 新增文件存在 | 检查文件系统 | 6 个新增文件存在 |
| 开发可见文件 | 修改文件更新 | 检查文件差异 | 4 个修改文件已更新 |
| 开发可见文件 | 文档更新 | 检查文档内容 | 3 个文档文件已更新 |

### H.2 应该存在的文件

**新增文件清单（6 个）**：

```
文件路径：task-detail.html
文件类型：HTML 页面
文件用途：详情页主文件

文件路径：assets/js/task-detail-main.js
文件类型：JavaScript 模块
文件用途：详情页统一入口

文件路径：assets/js/task-detail.js
文件类型：JavaScript 模块
文件用途：详情页交互逻辑

文件路径：assets/js/task-preview-drawer.js
文件类型：JavaScript 模块
文件用途：任务预览抽屉组件

文件路径：assets/js/task-view-model.js
文件类型：JavaScript 模块
文件用途：共享任务数据视图模型

文件路径：assets/css/task-detail.css
文件类型：CSS 样式表
文件用途：详情页和预览抽屉样式
```

**修改文件清单（4 个）**：

```
文件路径：task-hall.html
修改内容：添加预览抽屉 DOM 容器结构
验证方式：检查 `</body>` 前存在抽屉元素

文件路径：assets/data/tasks.mock.json
修改内容：为每个任务补充详情展示字段
验证方式：打开文件检查任务对象包含新增字段

文件路径：assets/js/task-hall.js
修改内容：在任务卡片点击事件中集成抽屉调用
验证方式：检查事件监听器包含抽屉调用逻辑

文件路径：assets/js/task-service.js
修改内容：新增 getTaskById() 函数，修复并发问题
验证方式：检查文件包含新函数和 finally 块
```

**文档更新清单（3 个）**：

```
文件路径：assets/js/CLAUDE.md
更新内容：新增 4 个 JS 文件的模块说明
验证方式：检查文档包含新增文件条目

文件路径：assets/css/CLAUDE.md
更新内容：新增 1 个 CSS 文件的样式说明
验证方式：检查文档包含新增文件条目

文件路径：设计文档/CLAUDE.md
更新内容：新增 task-detail-page-v3.md 的索引
验证方式：检查文档包含索引条目
```

### H.3 应该可以跑通的流程

**流程 1**：预览流程
- 起点：任务大厅页面
- 终点：预览抽屉打开
- 验证步骤：
  1. 打开 `task-hall.html`
  2. 点击任意任务卡片
  3. 确认抽屉从右侧滑出
  4. 确认抽屉内容正确显示（标题、摘要、发布方、技术栈）
  5. 确认底部"查看详情"按钮存在

**流程 2**：详情页加载流程
- 起点：预览抽屉
- 终点：详情页加载完成
- 验证步骤：
  1. 在预览抽屉中点击"查看详情"
  2. 确认浏览器 URL 变为 `task-detail.html?id={taskId}`
  3. 确认页面加载完成
  4. 确认导航栏和页脚显示
  5. 确认所有任务信息正确显示
  6. 确认所有发布方信息正确显示

**流程 3**：返回上下文保留流程
- 起点：详情页
- 终点：任务大厅（筛选状态保留）
- 验证步骤：
  1. 在任务大厅设置筛选条件
  2. 点击任务卡片，打开详情页
  3. 点击"返回大厅"按钮
  4. 确认返回任务大厅
  5. 确认筛选条件保留
  6. 确认页码保留

**流程 4**：状态处理流程
- 起点：详情页（无效 ID）
- 终点：空状态显示
- 验证步骤：
  1. 直接访问 `task-detail.html?id=invalid-id`
  2. 确认显示空状态提示
  3. 确认提示文本为"任务不存在"或类似
  4. 确认返回大厅按钮存在
  5. 点击返回按钮验证功能正常

**流程 5**：响应式适配流程
- 起点：详情页（不同设备）
- 终点：布局正确适配
- 验证步骤：
  1. 将浏览器宽度调整为 1200px
  2. 打开详情页，确认左右分栏布局
  3. 将浏览器宽度调整为 800px
  4. 刷新页面，确认单列堆叠布局
  5. 将浏览器宽度调整为 375px
  6. 刷新页面，确认单列布局
  7. 确认无横向滚动条

---

**文档结束**

本文档严格按照工程实施标准编写，所有内容已下沉到实现层，移除了所有代码示例，提供了双版本图示（人读版和 AI 友好版），可直接用于指导编码实施。
