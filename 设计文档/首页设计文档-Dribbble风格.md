# 软件定制服务首页设计文档 v3.0
## 基于 Dribbble 设计风格

---

## 一、设计分析

### 1.1 Dribbble 核心设计特点

| 维度 | 特点 | 具体表现 |
|------|------|----------|
| **色彩** | 纯净白底 | 白色背景 + 深色文字 + 粉紫强调 |
| **布局** | Masonry 网格 | 瀑布流卡片布局，自适应高度 |
| **内容** | 视觉优先 | 大量作品图片，少文字多展示 |
| **交互** | 微妙动效 | 悬停阴影、平滑过渡 |
| **留白** | 充足呼吸 | 卡片间距大，不拥挤 |

### 1.2 Dribbble 风格提取

**色彩系统：**
```
背景: #FFFFFF (纯白)
主文字: #0D0C22 (深蓝黑)
次要文字: #6E6D7A (中灰)
边框: #E7E7E9 (浅灰)
强调色: #EA4C89 (Dribbble 粉)
次要强调: #BD0FE1 (紫色)
```

**字体：**
```
主字体: Mona Sans / Inter (几何无衬线)
字重: 400/500/600/700
```

**布局特征：**
- Masonry 瀑布流布局
- 卡片圆角: 8-12px
- 卡片阴影: `0 1px 3px rgba(0,0,0,0.1)`
- 悬停阴影: `0 4px 12px rgba(0,0,0,0.15)`
- 卡片间距: 24px

---

## 二、设计方案

### 2.1 整体架构

```
┌─────────────────────────────────────────┐
│  顶部导航 (固定，白色背景)               │
├─────────────────────────────────────────┤
│  Hero 区域 (居中，简洁)                  │
│  - 标题 + 副标题                         │
│  - Tab 切换 (全部/网站/系统/App)         │
├─────────────────────────────────────────┤
│  作品展示 (Masonry 瀑布流)               │
│  - 项目卡片 (图片 + 标题 + 作者)         │
│  - 悬停显示详情按钮                      │
├─────────────────────────────────────────┤
│  服务能力 (横向标签)                     │
├─────────────────────────────────────────┤
│  为什么选择 (数据网格)                   │
├─────────────────────────────────────────┤
│  CTA 区域 (粉色背景)                     │
├─────────────────────────────────────────┤
│  页脚                                   │
└─────────────────────────────────────────┘
```

### 2.2 Hero 区域

**设计：**
```
           [Logo]          [探索] [服务] [关于] [登录]
┌──────────────────────────────────────────┐
│                                          │
│      为您的业务打造                      │
│      专业的数字产品                      │
│                                          │
│   [全部作品] [网站] [系统] [应用]        │
│                                          │
└──────────────────────────────────────────┘
```

**规格：**
- 背景：纯白
- 标题：48px，700 weight，深色
- 副标题：18px，400 weight，灰色
- Tab：胶囊形状，选中粉色，未选中灰色边框

### 2.3 作品展示（核心）

**Masonry 布局：**
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│  [图]    │ │  [图]    │ │  [图]    │
│          │ │          │ │          │
│  电商    │ │  官网    │ │  App     │
│  系统    │ │  设计    │ │  UI      │
│  [作者]  │ │  [作者]  │ │  [作者]  │
└──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐
│  [图]    │ │  [图]    │ │  [图]    │
│          │ │          │ │          │
│  (更高)  │ │  品牌设计│ │  数据    │
│  的卡片  │ │          │ │  平台    │
└──────────┘ └──────────┘ └──────────┘
```

**卡片样式：**
- 背景：白色
- 圆角：12px
- 阴影：`0 1px 3px rgba(0,0,0,0.08)`
- 悬停：`0 6px 16px rgba(0,0,0,0.12)`
- 图片比例：自由（Masonry 自适应）
- 内容：图片 + 标题 + 标签 + 作者头像

**悬停效果：**
- 卡片上浮 4px
- 阴影加深
- 显示"查看详情"按钮

### 2.4 标签系统

**样式：**
```
[网站开发] [App设计] [品牌] [数据可视化]
```
- 背景：白色
- 边框：1px solid #E7E7E9
- 文字：深色
- 圆角：完全圆角（pill）
- 悬停：粉色背景 + 白色文字

### 2.5 作者信息

**样式：**
```
┌─────────────────────────────────┐
│  [头像圆图 24px]  作者名        │
│                  Pro 徽章        │
└─────────────────────────────────┘
```

### 2.6 数据展示

**网格布局：**
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   150+   │ │   8年    │ │   100%   │ │  2年质保  │
│  完成项目 │ │  行业经验│ │  按时交付│ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### 2.7 CTA 区域

**设计：**
```
┌──────────────────────────────────────────┐
│                                          │
│      准备开始您的项目？                   │
│      免费咨询，快速响应                   │
│                                          │
│         [立即咨询] [查看案例]             │
│                                          │
└──────────────────────────────────────────┘
```

- 背景：粉色 #EA4C89（或渐变）
- 文字：白色
- 按钮：白色背景 + 粉色文字 / 透明背景 + 白色边框

---

## 三、CSS 变量定义

```css
:root {
    /* Colors - Dribbble 风格 */
    --color-bg: #FFFFFF;
    --color-bg-secondary: #F9F9F9;
    --color-text-primary: #0D0C22;
    --color-text-secondary: #6E6D7A;
    --color-text-tertiary: #9D9CAA;
    --color-border: #E7E7E9;
    --color-primary: #EA4C89;      /* Dribbble 粉 */
    --color-primary-hover: #D63D76;
    --color-secondary: #BD0FE1;    /* 紫色 */
    --color-success: #20C997;
    --color-warning: #F59E0B;

    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;

    /* Border Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-base: 0.25s ease;
}
```

---

## 四、关键组件

### 4.1 导航栏

```html
<nav class="navbar">
    <div class="container">
        <a href="/" class="brand">TechCraft</a>
        <div class="nav-links">
            <a href="#work">作品</a>
            <a href="#services">服务</a>
            <a href="#about">关于</a>
        </div>
        <div class="nav-actions">
            <a href="#login">登录</a>
            <a href="#signup" class="btn-primary">注册</a>
        </div>
    </div>
</nav>
```

**样式：**
- 固定顶部
- 白色背景
- 底部边框：1px solid #E7E7E9
- 高度：64px

### 4.2 作品卡片

```html
<a href="/project/1" class="work-card">
    <div class="work-image">
        <img src="..." alt="项目封面">
        <div class="work-overlay">
            <span class="btn-view">查看详情</span>
        </div>
    </div>
    <div class="work-info">
        <h3>项目标题</h3>
        <div class="work-meta">
            <span class="work-tag">网站开发</span>
        </div>
        <div class="work-author">
            <img src="..." alt="作者">
            <span>作者名</span>
        </div>
    </div>
</a>
```

**样式：**
- Masonry 布局（使用 CSS Columns 或 Grid）
- 卡片圆角：12px
- 图片高度：自适应
- 悬停时显示 overlay

### 4.3 Tab 切换

```html
<div class="tabs">
    <button class="tab active">全部作品</button>
    <button class="tab">网站</button>
    <button class="tab">系统</button>
    <button class="tab">应用</button>
</div>
```

**样式：**
- 胶囊形状
- 选中：粉色背景 + 白色文字
- 未选中：白色背景 + 灰色边框 + 深色文字

---

## 五、Masonry 布局实现

### 方案 A：CSS Columns（推荐）

```css
.works-grid {
    column-count: 4;
    column-gap: 24px;
}

@media (max-width: 1200px) { .works-grid { column-count: 3; } }
@media (max-width: 768px) { .works-grid { column-count: 2; } }
@media (max-width: 480px) { .works-grid { column-count: 1; } }

.work-card {
    break-inside: avoid;
    margin-bottom: 24px;
}
```

### 方案 B：CSS Grid + JavaScript

```css
.works-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 10px;
    gap: 24px;
}

.work-card {
    grid-row-end: span 30; /* 动态计算 */
}
```

---

## 六、图片资源

### 6.1 作品封面

**规格：**
- 格式：JPG/PNG
- 尺寸：自由比例
- 优化：< 200KB

**内容：**
- 真实项目截图
- 高质量 UI 设计
- 避免通用图库图

### 6.2 作者头像

**规格：**
- 尺寸：48x48px
- 圆形裁剪
- 格式：PNG（支持透明）

---

## 七、响应式设计

| 断点 | 容器宽度 | Masonry 列数 |
|------|----------|--------------|
| > 1400px | 1200px | 4 列 |
| 1024-1400px | 960px | 3 列 |
| 768-1024px | 100% | 2 列 |
| < 768px | 100% | 1 列 |

---

## 八、动画与交互

### 8.1 原则

- 微妙、快速
- 过渡时间：150-250ms
- 缓动：ease-out

### 8.2 效果

```css
/* 卡片悬停 */
.work-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.work-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
}

/* 按钮悬停 */
.btn-primary {
    transition: background-color 0.15s ease;
}

.btn-primary:hover {
    background-color: var(--color-primary-hover);
}

/* Tab 切换 */
.tab {
    transition: all 0.2s ease;
}
```

---

## 九、页面结构

```html
<body>
    <!-- 导航 -->
    <nav class="navbar">...</nav>

    <!-- Hero -->
    <section class="hero">
        <h1>为您的业务打造专业的数字产品</h1>
        <div class="tabs">...</div>
    </section>

    <!-- 作品展示 -->
    <section class="works">
        <div class="works-grid masonry">
            <a class="work-card">...</a>
            <a class="work-card">...</a>
            <!-- 更多卡片 -->
        </div>
    </section>

    <!-- 服务标签 -->
    <section class="services-tags">...</section>

    <!-- 数据 -->
    <section class="stats">...</section>

    <!-- CTA -->
    <section class="cta">...</section>

    <!-- 页脚 -->
    <footer class="footer">...</footer>
</body>
```

---

## 十、与原方案的对比

| 维度 | 原方案 | Dribbble 风格 |
|------|--------|---------------|
| 背景 | 米白/浅灰 | 纯白 |
| 内容 | 文字为主 | 图片为主 |
| 布局 | 常规网格 | Masonry 瀑布流 |
| 交互 | 简洁 | 更丰富的悬停效果 |
| 留白 | 适中 | 更充足 |
| 强调色 | 蓝色 | 粉紫色 |

---

*文档版本：v3.0*
*创建日期：2024-04-02*
*设计参考：Dribbble.com*
