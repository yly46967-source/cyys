# TechCraft 软件定制服务网站

## 项目概述

采用 **Dribbble 风格** 设计的软件定制服务官方网站，以作品展示为核心，视觉优先的设计。

## 设计风格

**Dribbble 布局 + 专业科技配色**

| 特点 | 说明 |
|------|------|
| 纯白背景 | #FFFFFF，干净清爽 |
| Masonry 布局 | 瀑布流卡片，自适应高度 |
| 视觉优先 | 大量作品图片，少文字 |
| 科技蓝强调色 | #3B82F6（专业蓝）|
| 微妙阴影 | 悬停时上浮 + 阴影加深 |
| 充足留白 | 卡片间距 24px |

## 技术栈

- HTML5
- CSS3（原生，CSS Grid Masonry）
- JavaScript（ES6+）
- Google Fonts（Inter）

## 文件结构

```
公会/
├── index.html              # 主页面
├── assets/
│   ├── css/style.css      # Dribbble 风格样式
│   └── js/main.js         # Tab 切换 + 交互
├── 设计文档/
│   └── 首页设计文档-Dribbble风格.md
└── README.md
```

## 功能特性

✅ **固定导航栏** - 白色背景，底部边框
✅ **Tab 切换** - 全部/网站/系统/应用筛选
✅ **Masonry 作品展示** - 瀑布流布局
✅ **卡片悬停效果** - 上浮 + 阴影 + overlay
✅ **服务标签云** - 横向标签展示
✅ **数据统计** - 4 列网格
✅ **联系表单** - 验证 + 提交
✅ **响应式设计** - 桌面/平板/移动

## 页面结构

```
导航栏 (固定顶部)
    ↓
Hero (标题 + Tab 切换)
    ↓
作品展示 (Masonry 瀑布流，8个项目)
    ↓
服务标签 (横向标签云)
    ↓
数据展示 (4 列网格)
    ↓
CTA (粉色背景)
    ↓
联系表单
    ↓
页脚
```

## 配色方案

```css
/* 主色调 */
--color-bg: #FFFFFF              /* 纯白背景 */
--color-text-primary: #0D0C22    /* 深色文字 */
--color-text-secondary: #6E6D7A  /* 灰色文字 */
--color-primary: #3B82F6         /* 科技蓝 */
--color-border: #E7E7E9          /* 边框颜色 */
```

## 预览

直接在浏览器打开 `index.html`

## 自定义

### 修改品牌信息

搜索并替换 `TechCraft` 为您的品牌名。

### 修改主色调

在 `assets/css/style.css` 的 `:root` 中修改：

```css
:root {
    --color-primary: #EA4C89;      /* 主色 */
    /* ... */
}
```

### 添加/修改作品卡片

在 `index.html` 的 `.works-grid` 中添加/修改 `.work-card`：

```html
<a href="#" class="work-card" data-category="website">
    <div class="work-image">
        <img src="..." alt="项目封面">
        <div class="work-overlay">
            <span class="btn-view">查看详情</span>
        </div>
    </div>
    <div class="work-info">
        <h3 class="work-title">项目标题</h3>
        <div class="work-meta">
            <span class="work-tag">标签</span>
        </div>
        <div class="work-author">
            <img src="..." alt="作者">
            <span class="author-name">作者名</span>
        </div>
    </div>
</a>
```

### 修改 Tab 分类

在 `index.html` 的 `.tabs` 中修改：

```html
<div class="tabs">
    <button class="tab active" data-filter="all">全部作品</button>
    <button class="tab" data-filter="website">网站</button>
    <!-- 添加更多 Tab -->
</div>
```

## 浏览器支持

- Chrome/Edge（最新版）
- Firefox（最新版）
- Safari（最新版）
- 移动浏览器

## 响应式断点

| 断点 | Masonry 列数 |
|------|--------------|
| > 1200px | 4 列 |
| 768-1200px | 3 列 |
| 480-768px | 2 列 |
| < 480px | 1 列 |

---

*更新日期：2024-04-02*
*设计参考：Dribbble.com*
