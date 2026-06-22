# `calm-popping-starfish.md` 技术评审

## 评审结论

当前方案**不建议直接进入实施**。主要问题不在 UI 细节，而在于方案和现有实现之间存在明显脱节：数据契约未收口、抽屉复用策略与现有页面冲突、权限控制存在错误假设、详情页初始化链路缺失。按当前方案直接做，后续大概率会在接线、联调和补权限时返工。

---

## 一、理解错误的需求

### 1. “任务详情展示”被扩成了“任务交易动作页”

- 方案依据：`plans/calm-popping-starfish.md:10-14`、`plans/calm-popping-starfish.md:93-99`、`plans/calm-popping-starfish.md:115-119`
- 问题：Context 只说明“新增任务详情展示功能”，但方案已经把详情页扩展到了“接取任务/竞标/联系发布方/收藏/分享”等交易与关系动作。
- 风险：这会把纯展示需求变成流程型需求，立即引入角色权限、实名认证、状态流转、操作幂等等一整套问题。
- 结论：这是需求边界被放大了，不是实现细节。

### 2. “联系方式权限控制”被错误理解成前端显示控制

- 方案依据：`plans/calm-popping-starfish.md:36`、`plans/calm-popping-starfish.md:97`、`plans/calm-popping-starfish.md:118`、`plans/calm-popping-starfish.md:181`
- 问题：方案把联系方式直接放进 `assets/data/tasks.mock.json` 的 `publisher.contact`，同时又说“需权限控制”。如果敏感信息已经下发到前端静态资源里，前端遮罩不构成权限控制。
- 风险：用户即使看不到 UI，也能通过 DevTools、网络面板、源码直接读取联系方式。
- 结论：这是安全模型理解错误，必须修正。

---

## 二、遗漏的边界条件

### 3. 未定义从详情页返回任务大厅时如何保留筛选上下文

- 方案依据：`plans/calm-popping-starfish.md:119`、`plans/calm-popping-starfish.md:163-164`
- 现有实现依据：
  - `assets/js/task-hall.js:85-155` 任务大厅状态完全依赖 URL 参数
  - `assets/js/task-hall.js:627-631` 翻页后只做本页滚动，不保留额外上下文
- 缺失点：
  - 从筛选后的第 N 页进入详情，返回大厅是回到原 query，还是固定回 `task-hall.html`
  - “返回大厅按钮”和浏览器返回的行为是否一致
- 风险：不先定义，开发阶段很容易做成“返回后丢筛选/丢页码”，然后被迫返工。

### 4. 未定义移动端抽屉互斥关系

- 方案依据：`plans/calm-popping-starfish.md:38-76`、`plans/calm-popping-starfish.md:167-169`
- 现有实现依据：
  - `task-hall.html:275-293` 页面已经有移动端筛选抽屉
  - `assets/js/task-hall.js:654-715` 已有完整的抽屉开关、遮罩、滚动锁定逻辑
- 缺失点：
  - 移动端“筛选抽屉”和“任务预览抽屉”谁优先
  - ESC、遮罩点击、`body overflow`、焦点恢复分别由谁管理
  - 平板端预览抽屉全宽时，筛选入口是否还存在
- 风险：两个抽屉共存但无互斥设计，交互冲突概率很高。

### 5. 未定义详情页的加载中、异常态和能力降级策略

- 方案依据：`plans/calm-popping-starfish.md:113-119`、`plans/calm-popping-starfish.md:171-174`
- 缺失点：
  - 详情页加载中的 skeleton/占位
  - 分享失败时的降级方案，尤其 `navigator.clipboard` 不可用时怎么办
  - 发布方头像、评分、统计字段缺失时是隐藏模块还是展示占位
- 风险：现在只写了“错误处理”，不足以支撑完整页面状态设计。

### 6. 未定义角色和状态矩阵

- 方案依据：`plans/calm-popping-starfish.md:93-99`
- 现有实现依据：
  - `assets/js/auth-config.js` 已区分 `client` / `developer`
  - `assets/js/auth-guard.js` 已有登录和实名认证守卫能力
- 缺失点：
  - 客户是否能看到“接取任务/竞标”
  - 开发者在 `closed` / `in-progress` / `recruiting` 三种状态下分别看到什么动作
  - 未登录用户点击“联系发布方”是跳登录、弹提示，还是只读
- 风险：动作矩阵不先定，页面按钮和权限逻辑一定返工。

---

## 三、可能导致返工的设计问题

### 7. 新数据模型会直接冲击现有大厅列表契约

- 方案依据：`plans/calm-popping-starfish.md:24-36`
- 现有实现依据：
  - `assets/js/task-service.js:117-120` 搜索仍依赖 `task.clientName`
  - `assets/js/task-hall.js:307-314` 卡片渲染仍依赖 `task.clientName`
  - `assets/data/tasks.mock.json` 当前模型只有顶层 `clientName`
- 问题：
  - 方案新增了 `publisher` 对象，但没有说明是否保留 `clientName`
  - 方案里 `publisher` 甚至没有定义 `name` 字段，但后文又要求展示“昵称”
- 风险：如果数据只做“加字段”没问题；如果顺手把展示字段迁到 `publisher` 下，任务大厅搜索、卡片、筛选会一起坏掉。

### 8. 详情页缺少页面入口与共享布局初始化方案

- 方案依据：`plans/calm-popping-starfish.md:80-119`
- 现有实现依据：
  - `assets/js/task-hall-main.js:27-35` 任务大厅依赖入口文件初始化共享布局
  - 其他页面普遍使用 `*-main.js` 负责 `authState` 注入和 `initSharedLayout`
- 问题：方案只新增 `task-detail.html` 和 `assets/js/task-detail.js`，没有说明是否需要 `task-detail-main.js` 作为统一入口。
- 风险：
  - 仅写 `data-layout="navbar"` / `footer` 并不会自动渲染共享布局
  - 登录态导航、页脚、回到顶部、鉴权相关能力可能缺失或行为不一致

### 9. 直接复用 `.drawer` / `.drawer-overlay` 是高风险方案

- 方案依据：`plans/calm-popping-starfish.md:50-56`、`plans/calm-popping-starfish.md:123-127`
- 现有实现依据：
  - `task-hall.html:275-293` 已存在基于 `.drawer` 的筛选抽屉
  - `assets/css/components.css:508-587` `.drawer` 是现有共享组件
- 问题：
  - 方案要把现有 `max-width: 320px` 调到 `400px`
  - 但当前 `.drawer` 是筛选抽屉的共享样式，不是任务预览专用样式
- 风险：你一改全局 `.drawer`，任务筛选抽屉也会一起变宽，页面其他已存在交互会被连带影响。

### 10. 服务层复用方式写得过于模糊

- 方案依据：`plans/calm-popping-starfish.md:113`
- 现有实现依据：
  - `assets/js/task-service.js:31-70` 只有 `fetchTasks`
  - `assets/js/task-service.js:255-285` 只有 `queryTasks`
- 问题：方案说“详情页调用 `task-service.js`”，但没定义是新增 `getTaskById(taskId)`，还是详情页自己 `fetchTasks().find(...)`。
- 风险：
  - 抽屉和详情页如果各自直接读原始 task 对象，会形成重复的数据访问和重复兜底逻辑
  - 一旦后续接真实 API，两个入口都要改

---

## 四、测试不足

### 11. 缺少“大厅筛选上下文 -> 详情页 -> 返回大厅”的链路测试

- 方案依据：`plans/calm-popping-starfish.md:163-164`
- 现有实现依据：
  - `assets/js/task-hall.js:85-155` URL 是大厅状态的单一事实源
  - `assets/js/task-hall.js:812-826` 浏览器前进/后退依赖 URL 重放
- 缺失测试：
  - 带 `keyword/category/status/page/sort` 的大厅链接进入详情后再返回，筛选条件是否完整恢复
  - “返回大厅按钮”和浏览器返回键是否行为一致
  - 从第 2 页、第 3 页进入详情后是否回到原页码
- 风险：如果这条链路不测，最容易上线后出现“返回丢上下文”的体验问题。

### 12. 缺少抽屉冲突与可访问性测试

- 方案依据：`plans/calm-popping-starfish.md:155-169`
- 现有实现依据：
  - `task-hall.html:275-293` 已有移动端筛选抽屉
  - `assets/js/task-hall.js:804-809` 已绑定筛选抽屉事件
- 缺失测试：
  - 任务预览抽屉和筛选抽屉不能同时打开
  - ESC、遮罩点击、关闭按钮是否只关闭当前抽屉
  - 打开抽屉后焦点是否进入抽屉，关闭后是否回到触发卡片
  - `body` 滚动锁定是否正确恢复
- 风险：这类问题在桌面端不明显，但在平板/移动端非常容易暴露。

### 13. 缺少异常数据和字段缺失测试矩阵

- 方案依据：`plans/calm-popping-starfish.md:171-174`
- 问题：当前只写“数据字段缺失显示默认值/占位符”，但没有拆分具体验证项。
- 缺失测试：
  - 缺少 `publisher.avatar`
  - 缺少 `publisher.rating`
  - 缺少 `description/requirements/deliverables`
  - `stacks` 为空数组或不存在
  - `budgetMin/budgetMax`、`deadline` 为非法值
- 风险：详情页是富展示页，任何一个字段未兜底都可能直接打断渲染。

### 14. 缺少分享与本地存储失败场景测试

- 方案依据：`plans/calm-popping-starfish.md:116-118`
- 缺失测试：
  - `navigator.clipboard` 不可用或权限拒绝
  - `localStorage` 不可写、配额已满、隐私模式异常
  - 重复收藏、跨页面收藏状态同步
- 风险：这些在开发环境很难自然暴露，但真实浏览器环境并不少见。

### 15. 缺少服务层并发与失败恢复测试

- 现有实现依据：`assets/js/task-service.js:37-46`、`assets/js/task-service.js:63-68`
- 缺失测试：
  - 首次请求失败时，后续并发调用是否会一直 pending
  - 抽屉和详情页同时请求同一份任务数据时是否复用缓存
  - 失败后 retry 是否能恢复
- 风险：方案新增两个消费端后，这类隐性 bug 更容易被触发。

---

## 五、性能、安全、维护性重点问题

### 16. `publisher` 数据结构定义不完整且前后不一致

- 方案依据：`plans/calm-popping-starfish.md:29-36`、`plans/calm-popping-starfish.md:73`、`plans/calm-popping-starfish.md:94`
- 问题：
  - 缺少 `publisher.name` / `displayName`
  - 缺少 `publisher.id`，后续无法做跳转、分享、埋点
  - 缺少联系方式可见性元数据，例如 `contactVisible`、`unlockRule`
  - 缺少评分语义定义，例如 `rating` 是 5 分制还是 100 分制
- 风险：现在这个对象还不足以支撑后文要展示的 UI，也不利于后续维护。

### 17. 抽屉预览和详情页之间没有共享抽象

- 方案依据：整体
- 问题：抽屉要展示摘要信息，详情页要展示完整信息，但方案没有定义共享的字段映射、格式化方法、状态徽章生成、默认值策略。
- 风险：两个界面各写一套拼装逻辑，后续字段变更要双改，维护成本会持续上升。

### 18. 当前服务层并发加载失败会产生悬挂 Promise，方案没有规避

- 现有实现依据：`assets/js/task-service.js:37-46`、`assets/js/task-service.js:63-68`
- 问题：`isLoading` 为 `true` 时，后续调用会进入轮询等待；但如果首个请求失败，`cachedTasks` 始终是 `null`，等待中的 Promise 不会 reject，也不会 resolve。
- 风险：现在只有大厅列表一个入口时概率较低；一旦新增“抽屉预览 + 详情页”两个调用点，触发这个问题的概率会明显增加，表现为页面卡住。
- 结论：这是可靠性问题，不能忽略。

### 19. 联系方式放进静态 Mock 数据会造成真实信息泄露

- 方案依据：`plans/calm-popping-starfish.md:36`
- 问题：任何需要“接取后可见”的数据，都不应该在静态 JSON 中明文下发。
- 风险：即使 UI 完全不渲染，也已经泄露。
- 结论：这是必须修改项，不是优化项。

### 20. 收藏/分享状态如果分散在抽屉和详情页，会形成双状态源

- 方案依据：`plans/calm-popping-starfish.md:76`、`plans/calm-popping-starfish.md:116-118`
- 问题：方案只写“本地存储”，没有定义 key 结构、跨页面同步、未登录与已登录用户的数据边界。
- 风险：
  - 抽屉收藏了，详情页不刷新
  - 一个页面取消收藏，另一个页面仍显示已收藏
  - 后续若改成账号级收藏，还要重构本地 schema

---

## 六、分级结论

### 必须修改项

1. 收紧需求边界，先确认本次是否只做“详情展示”，还是真的要做“竞标/接取/联系发布方”等动作。
2. 移除“前端遮罩即可控权限”的错误假设；任何受控联系方式都不能放进静态 `tasks.mock.json` 明文数据。
3. 先统一任务数据契约，明确 `clientName` 是否保留，并补齐 `publisher.name` 等必需字段，避免破坏现有大厅列表与搜索。
4. 为详情页补完整初始化链路，至少明确入口文件、共享布局初始化、登录态导航和回到顶部的接线方式。
5. 任务预览抽屉必须做命名隔离或修饰符类，不能直接改全局 `.drawer` 影响现有筛选抽屉。
6. 为 `task-service.js` 明确详情查询接口，并修复当前并发加载失败导致悬挂 Promise 的问题。
7. 明确角色/登录/实名认证/任务状态的动作矩阵，否则按钮设计没有实施基础。
8. 明确从详情页返回大厅时的上下文保留策略，至少覆盖筛选条件、排序、页码。
9. 补上关键链路测试，至少覆盖“大厅上下文恢复、双抽屉互斥、异常字段兜底、分享/收藏失败恢复、服务层并发失败恢复”。

### 建议修改项

1. 为详情页补充 loading、empty、error、clipboard 不可用等完整状态设计。
2. 把抽屉预览和详情页的格式化、默认值、状态徽章逻辑抽成共享模块，避免重复拼装。
3. 为新增抽屉补充 a11y 设计与验证项，包括焦点管理、键盘关闭和焦点恢复。
4. 定义收藏本地存储的 key 规则、跨页面同步策略和未来迁移方式。

### 可选优化项

1. 给任务详情建立一层 view-model/normalizer，隔离原始 Mock 字段与 UI 展示字段。
2. 如果详情页首屏目标较高，可以利用大厅已缓存的任务摘要先渲染骨架或基础信息，再补充完整字段。
3. 如果后续确实需要联系权限控制，建议把“可见联系方式”和“公开资料”拆成两份数据源。

---

## 总体判断

这份方案最需要先修的不是页面结构，而是**契约和边界**。先把“做不做交易动作、联系方式怎么控权、任务数据怎么兼容现有列表、抽屉怎么与现有筛选抽屉共存”这四件事定死，再进入实施，才能避免明显返工。
