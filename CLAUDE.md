# TechCraft 项目总文档

## 项目定位

**Dribbble 风格作品展示 + 任务大厅网站** - 为 TechCraft 软件定制服务打造的多页面平台。

**核心特性**：
- 纯白背景 + 科技蓝强调色的专业配色
- 首页 Masonry 瀑布流布局展示作品
- 任务大厅支持多维度筛选、搜索、排序、分页
- 响应式设计，支持桌面/平板/移动端

**技术栈**：HTML5 + CSS3 + 原生 JavaScript (ES6+)

---

## 代码规范（面向模型）

### L3 文件头规范

所有核心源码文件（`.css`, `.js`, `.html`）必须包含完整的 L3 文件头：

```javascript
/**
 * [FILE] 文件名 - 简要说明
 * [POS] 职责定位（在系统中的位置和作用）
 * [IN] 输入（依赖什么）
 * [OUT] 输出（产出什么）
 * [DEP] 依赖项（外部依赖）
 * [SIDE EFFECT] 副作用（对系统的影响）
 * [TEST] 测试方式（如何测试）
 */
```

### 模块文档同步规范

当修改模块代码时，应评估是否需要同步更新模块的 `CLAUDE.md`：

- **CSS 文件修改**：新增/删除 CSS 类、修改 CSS 变量、新增/删除组件样式
- **JS 文件修改**：新增/删除函数、新增/删除事件监听器、修改函数签名或行为
- **HTML 文件修改**：新增/删除页面、修改页面结构

受影响的模块文档：
- `assets/css/CLAUDE.md` - CSS 样式系统文档
- `assets/js/CLAUDE.md` - JavaScript 交互逻辑文档
- `design/CLAUDE.md` - 英文设计文档索引
- `设计文档/CLAUDE.md` - 中文设计文档索引

---

## 受保护目录

以下目录禁止通过 Edit/Write 工具直接修改：

- `.git/` - Git 版本控制目录
- `.claude/` - Claude 配置目录（hooks 除外）
- `dist/` - 构建输出目录
- `build/` - 构建输出目录
- `migrations/` - 数据库迁移目录
- `node_modules/` - 依赖包目录

---

## Hook 机制说明

项目配置了 Claude Code hooks，用于自动检查代码规范：

- **PreToolUse (事前)**：阻断对受保护目录的写入，检查 L3 文件头
- **PostToolUse (事后)**：检查是否需要同步模块文档，生成分形文档回环检查报告

详细规则定义见：[`.claude/hooks/patterns/project-rules.md`](.claude/hooks/patterns/project-rules.md)

---

## 快速导航

- [CSS 样式系统文档](assets/css/CLAUDE.md)
- [JS 交互逻辑文档](assets/js/CLAUDE.md)
- [设计文档索引](design/CLAUDE.md)
- [中文设计文档索引](设计文档/CLAUDE.md)
- [项目规则定义](.claude/hooks/patterns/project-rules.md)

---

## 目录地图

```
公会/
├── index.html              # 首页入口
├── task-hall.html          # 任务大厅页面
├── assets/                 # 静态资源
│   ├── css/                # 样式系统
│   │   ├── base.css       # 基础样式 (变量、重置、工具类)
│   │   ├── components.css # 共享组件 (导航、按钮、表单等)
│   │   ├── home.css       # 首页专用样式
│   │   └── task-hall.css  # 任务大厅专用样式
│   ├── js/                 # 交互逻辑
│   │   ├── shared-layout.js  # 共享布局 (导航、页脚)
│   │   ├── main.js           # 首页交互
│   │   ├── task-config.js    # 任务配置 (枚举、常量)
│   │   ├── task-service.js   # 数据服务层
│   │   └── task-hall.js      # 任务大厅交互
│   └── data/               # Mock 数据
│       └── tasks.mock.json # 任务模拟数据
├── .claude/               # Claude Code 配置
│   ├── hooks/             # Hook 脚本
│   └── patterns/          # 规则定义
├── design/                # 英文设计文档
├── 设计文档/              # 中文设计文档
├── CLAUDE.md             # 本文档
└── README.md             # 项目说明
```

---

*文档版本: v2.1*
*创建日期: 2026-04-03*
*更新日期: 2026-04-03*
*维护者: AI Assistant (文档架构守卫)*
*更新内容: 新增 Claude Code hooks 机制*
