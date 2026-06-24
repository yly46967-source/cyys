# CSS 样式系统文档

## 模块职责

定义 TechCraft 网站的 Dribbble 风格视觉系统，包括：
- CSS 变量系统 (颜色、间距、圆角、阴影、动画)
- 组件样式 (按钮、卡片、表单、导航等)
- 响应式布局 (桌面/平板/移动端)
- Masonry 瀑布流网格布局

---

## 文件成员清单

| 文件 | 职责 | 依赖 |
|------|------|------|
| `base.css` | 基础样式：CSS 变量（含渐变/辉光/缓动/按钮高度令牌）、重置、容器、排版 | 无 (原生 CSS) |
| `components.css` | 共享组件：导航（玻璃拟态）、按钮、表单、标签、卡片、分页、抽屉 | base.css |
| `home.css` | 首页专用：Hero/作品瀑布流/服务标签/统计/CTA/联系表单 | base.css, components.css |
| `task-hall.css` | 任务大厅专用样式 | base.css, components.css |
| `effects.css` | **高级动效层**：光标光晕/粒子/着色器挂载/磁吸/滚动揭示/视差/页面过渡遮罩/进度条 | base.css |

### 动效层 (effects.css) 关键钩子

仅新增规则，不覆盖既有组件样式；与 `assets/js/fx.js` 配合：

- `html.fx-ready` — JS 成功启动后启用滚动揭示初态（未启用时内容完全可见，避免白屏）
- `#fxCursor` / `#fxParticles` — 光标光晕与粒子 canvas（由 fx.js 注入）
- `.fx-progress` — 顶部滚动进度条
- `.fx-magnetic` — 磁吸容器（自动赋予 `.btn-primary/.btn-white/.btn-view`）
- `[data-fx-shader]` — 着色器挂载点（`.fx-shader-layer` 为注入的 canvas）
- `[data-fx-reveal]` (+ `.fx-in-view`) — 滚动揭示，支持 `="left|right|scale"` 变体与 `--fx-delay` 错峰
- `[data-fx-parallax]` / `[data-fx-count]`(+`data-fx-suffix`) — 视差 / 数字滚动
- `.fx-transition`(+ `--cover`/`--no-transition`) — 跨页遮罩过渡

---

## 对外接口 (CSS 变量)

### 颜色系统
```css
--color-bg: #FFFFFF              /* 纯白背景 */
--color-bg-secondary: #F9F9F9    /* 次级背景 */
--color-bg-tertiary: #F3F3F4     /* 三级背景 */
--color-text-primary: #0D0C22    /* 深色文字 */
--color-text-secondary: #6E6D7A  /* 灰色文字 */
--color-text-tertiary: #9D9CAA   /* 浅灰文字 */
--color-border: #E7E7E9          /* 边框颜色 */
--color-primary: #3B82F6         /* 科技蓝 */
--color-primary-hover: #2563EB   /* 悬停蓝 */
```

### 间距系统
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-2xl: 32px
--spacing-3xl: 48px
```

### 圆角系统
```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-full: 9999px
```

### 阴影系统
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08)
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12)
```

---

## 依赖项

- **Google Fonts**: Inter 字体 (通过 HTML `<link>` 引入)
- **无其他依赖**: 纯原生 CSS

---

## 禁止职责

- ❌ 不要包含业务逻辑 (应由 JS 处理)
- ❌ 不要使用 CSS-in-JS 或预处理器 (保持原生 CSS)
- ❌ 不要硬编码颜色值 (统一使用 CSS 变量)
- ❌ 不要使用 `!important` (除非处理第三方库冲突)

---

## 常见修改入口

### 修改主题色
编辑 `:root` 中的 `--color-primary` 变量

### 调整 Masonry 列数
编辑 `.works-grid.masonry` 的 `grid-template-columns`

### 修改断点
编辑 `@media` 查询的断点值 (1200px, 768px, 480px)

### 添加新组件
在对应的 `/* ============================================ */` 分节下添加样式

---

## 更新条件

当以下情况发生时，需要更新本文档：

1. 新增/删除/重命名 CSS 类
2. 修改 CSS 变量定义
3. 修改响应式断点
4. 新增/删除组件样式

---

## 样式组织结构

```
style.css
├── :root (CSS 变量)
├── Reset & Base
├── Utility (.container)
├── Navigation
├── Buttons (.btn-*)
├── Hero Section
├── Tabs
├── Works Section (Masonry)
├── Services Tags
├── Stats Section
├── CTA Section
├── Contact Section
├── Footer
├── Back to Top Button
├── Responsive Design (@media)
└── Accessibility
```

---

*所属模块: assets/*
*依赖模块: 无*
*相关模块: assets/js/main.js (交互依赖样式类名)*
