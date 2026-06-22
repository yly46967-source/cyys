# 赏金猎人公会平台 - 前端UI/UX设计文档

**文档版本**：v1.0  
**创建日期**：2026-04-01  
**文档状态**：草稿  
**目标读者**：UI设计师、前端开发工程师、产品经理

---

## 文档说明

本文档定义了"悬赏接单托管交付平台"的前端视觉设计和交互规范。平台采用**"赏金猎人公会"**的独特美术风格，融合中世纪奇幻公会与现代软件交付平台的双重特性，打造沉浸式的任务承接体验。

### 核心设计理念

**"接取悬赏，完成委托，收获赏金"** - 把软件开发项目包装成"公会委托任务"，让客户成为"委托人"，开发者成为"赏金猎人"，平台成为"冒险者公会"。

---

## 目录

1. [设计理念与风格定位](#1-设计理念与风格定位)
2. [色彩系统](#2-色彩系统)
3. [字体系统](#3-字体系统)
4. [组件设计规范](#4-组件设计规范)
5. [页面布局设计](#5-页面布局设计)
6. [交互动效规范](#6-交互动效规范)
7. [响应式设计](#7-响应式设计)
8. [图标与插画系统](#8-图标与插画系统)
9. [页面设计详解](#9-页面设计详解)
10. [前端实现建议](#10-前端实现建议)

---

## 1. 设计理念与风格定位

### 1.1 核心概念映射

| 现实概念 | 公会风格包装 | 设计隐喻 |
|---------|-------------|---------|
| **客户** | 委托人 | 发布悬赏令的贵族、商人 |
| **开发者** | 赏金猎人 / 冒险者 | 接取任务的专业人士 |
| **项目需求** | 悬赏令 / 委托书 | 羊皮纸风格的悬赏告示 |
| **报价** | 接单申请书 | 冒险者提交的任务申请书 |
| **里程碑** | 任务阶段 | 剿匪、护送、探索等阶段 |
| **资金托管** | 赏金托管 | 公会金库的保险箱 |
| **验收** | 任务完成确认 | 委托人验收任务成果 |
| **争议** | 纠纷仲裁 | 公会仲裁委员会介入 |
| **评价** | 冒险者声望 | 公会内的声望系统 |

### 1.2 视觉风格定位

**主风格**：中世纪奇幻公会 + 现代SaaS平台

**核心视觉元素**：
- 🏰 **公会大厅**：温暖的木质纹理、石墙、壁炉
- 📜 **羊皮纸**：悬赏令、任务书采用羊皮纸质感
- 💰 **金币赏金**：金色点缀，象征奖励
- 🗺️ **地图**：世界地图风格的导航
- ⚔️ **武器装饰**：剑、盾牌等装饰元素
- 🕯️ **烛光**：温暖的点光源
- 🏆 **荣誉徽章**：成就、等级的徽章设计

**情感基调**：
- **专业可靠**：公会给人信任感
- **冒险刺激**：接取任务的兴奋感
- **温暖亲切**：公会大厅的归属感
- **神秘传奇**：赏金猎人的传奇色彩

### 1.3 设计原则

1. **沉浸式体验**：让用户感觉真正进入了赏金猎人公会
2. **功能优先**：美术风格服务于功能，不影响可用性
3. **细节精致**：每个元素都符合公会世界观
4. **现代交互**：保留现代Web的流畅交互体验
5. **性能友好**：使用CSS和轻量级资源实现视觉效果

---

## 2. 色彩系统

### 2.1 主色调（公会色）

```
主色：深木色 #2C1810
- 用途：主要背景、导航栏、卡片背景
- 情感：稳重、可靠、温暖

辅助色：古铜色 #8B7355
- 用途：按钮、边框、图标
- 情感：金属感、质感

点缀色：金币金 #D4AF37
- 用途：价格、赏金、高亮元素
- 情感：财富、奖励、荣誉
```

### 2.2 功能色

```
成功色：翡翠绿 #2E8B57
- 任务完成、验收通过

警告色：琥珀色 #FFB300
- 待处理、即将到期

错误色：深红色 #8B0000
- 失败、拒绝、争议

信息色：深海蓝 #4169E1
- 通知、提示
```

### 2.3 中性色系

```
深色层：
- 深褐 #1A0F0A - 背景底色
- 深棕 #3D2317 - 次级背景

中色层：
- 羊皮纸 #F5E6D3 - 内容背景
- 米色 #E8D4B8 - 卡片背景

浅色层：
- 米白 #FFF8E7 - 文字背景
- 象牙白 #FFFFF0 - 高亮背景
```

### 2.4 文字色

```
主要文字：#1A0F0A（深褐）
次要文字：#5D4037（棕褐）
辅助文字：#8B7355（古铜）
禁用文字：#BCAAA4（浅棕）
```

### 2.5 渐变色

```
金币渐变：linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)
用途：赏金金额、重要按钮

火焰渐变：linear-gradient(180deg, #FF6B35 0%, #FF4500 50%, #8B0000 100%)
用途：紧急任务、热点标记

羊皮纸渐变：linear-gradient(180deg, #F5E6D3 0%, #E8D4B8 100%)
用途：悬赏令、任务卡片
```

---

## 3. 字体系统

### 3.1 字体家族

```css
/* 中文字体 */
font-family: 'Noto Serif SC', 'Source Han Serif SC', 'STSong', serif;

/* 英文/数字字体 */
font-family: 'Cinzel', 'Trajan Pro', 'Times New Roman', serif;

/* 代码/技术内容 */
font-family: 'Fira Code', 'Consolas', monospace;
```

### 3.2 字体层级

```
Display（展示型）：
- 公会标题：48px / Bold / Cinzel
- 悬赏标题：36px / Bold / Noto Serif SC

H1（一级标题）：
- 页面标题：32px / Bold / Noto Serif SC

H2（二级标题）：
- 区块标题：24px / Semibold / Noto Serif SC

H3（三级标题）：
- 卡片标题：20px / Semibold / Noto Serif SC

Body（正文）：
- 主要内容：16px / Regular / Noto Serif SC
- 次要内容：14px / Regular / Noto Serif SC

Caption（说明）：
- 辅助文字：12px / Regular / Noto Serif SC

Button（按钮）：
- 按钮文字：14px / Semibold / Noto Serif SC

Number（数字）：
- 价格/金额：18px / Bold / Cinzel
```

### 3.3 特殊效果

**羊皮纸文字效果**：
```css
.parchment-text {
  color: #3D2317;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.5px;
}
```

**金币文字效果**：
```css
.gold-text {
  background: linear-gradient(135deg, #D4AF37, #FFD700, #D4AF37);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);
}
```

**印章文字效果**：
```css
.seal-text {
  color: #8B0000;
  font-family: 'Cinzel', serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
```

---

## 4. 组件设计规范

### 4.1 按钮（Button）

#### 4.1.1 主要按钮（Primary Button）

**设计风格**：金币金属质感

```css
.btn-primary {
  background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%);
  border: 2px solid #8B6914;
  border-radius: 4px;
  padding: 12px 24px;
  color: #1A0F0A;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 6px 12px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(212, 175, 55, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.3);
}
```

#### 4.1.2 次要按钮（Secondary Button）

**设计风格**：羊皮纸质感

```css
.btn-secondary {
  background: linear-gradient(180deg, #F5E6D3 0%, #E8D4B8 100%);
  border: 2px solid #8B7355;
  border-radius: 4px;
  padding: 12px 24px;
  color: #3D2317;
  font-weight: 600;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: linear-gradient(180deg, #FFF8E7 0%, #F5E6D3 100%);
  transform: translateY(-1px);
}
```

#### 4.1.3 危险按钮（Danger Button）

**设计风格**：深红蜡封质感

```css
.btn-danger {
  background: linear-gradient(180deg, #A52A2A 0%, #8B0000 100%);
  border: 2px solid #5C0000;
  border-radius: 4px;
  padding: 12px 24px;
  color: #FFF8E7;
  font-weight: 600;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.3);
}
```

### 4.2 卡片（Card）

#### 4.2.1 悬赏令卡片（Bounty Card）

**设计风格**：羊皮纸悬赏令

```css
.bounty-card {
  background: linear-gradient(180deg, #F5E6D3 0%, #E8D4B8 100%);
  border: 3px solid #8B7355;
  border-radius: 8px;
  padding: 24px;
  position: relative;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 0 50px rgba(139, 115, 85, 0.1);
}

/* 羊皮纸纹理 */
.bounty-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" /></filter><rect width="100%" height="100%" filter="url(%23noise)" opacity="0.05"/></svg>');
  pointer-events: none;
  opacity: 0.5;
}

/* 烫金边框 */
.bounty-card::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 6px;
  right: 6px;
  bottom: 6px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 4px;
  pointer-events: none;
}

/* 蜡封印章（可选） */
.bounty-card .seal {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #A52A2A 0%, #8B0000 100%);
  border-radius: 50%;
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFF8E7;
  font-family: 'Cinzel', serif;
  font-weight: bold;
  font-size: 12px;
  text-align: center;
  text-transform: uppercase;
}
```

#### 4.2.2 任务卡片（Mission Card）

**设计风格**：木质板质感

```css
.mission-card {
  background: linear-gradient(135deg, #3D2317 0%, #2C1810 100%);
  border: 2px solid #8B7355;
  border-radius: 8px;
  padding: 20px;
  color: #F5E6D3;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 金属铆钉装饰 */
.mission-card::before,
.mission-card::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #D4AF37 0%, #8B6914 100%);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.mission-card::before {
  top: 8px;
  left: 8px;
}

.mission-card::after {
  top: 8px;
  right: 8px;
}
```

### 4.3 输入框（Input）

#### 4.3.1 文本输入框

**设计风格**：羊皮纸卷轴

```css
.input-parchment {
  background: linear-gradient(180deg, #FFF8E7 0%, #F5E6D3 100%);
  border: 2px solid #8B7355;
  border-radius: 4px;
  padding: 12px 16px;
  color: #3D2317;
  font-size: 16px;
  font-family: 'Noto Serif SC', serif;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.input-parchment:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 0 0 3px rgba(212, 175, 55, 0.2);
}

.input-parchment::placeholder {
  color: #8B7355;
  font-style: italic;
}
```

### 4.4 标签（Tag）

#### 4.4.1 任务类型标签

```css
.tag-template {
  background: linear-gradient(135deg, #4169E1 0%, #1E3A8A 100%);
  border: 1px solid #1E40AF;
  border-radius: 12px;
  padding: 4px 12px;
  color: #FFF8E7;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-custom {
  background: linear-gradient(135deg, #8B7355 0%, #5D4037 100%);
  border: 1px solid #3D2317;
  border-radius: 12px;
  padding: 4px 12px;
  color: #FFF8E7;
  font-size: 12px;
  font-weight: 600;
}
```

#### 4.4.2 状态标签

```css
/* 进行中 */
.tag-in-progress {
  background: linear-gradient(135deg, #2E8B57 0%, #1B5E20 100%);
  border: 1px solid #1B5E20;
}

/* 待处理 */
.tag-pending {
  background: linear-gradient(135deg, #FFB300 0%, #FF8F00 100%);
  border: 1px solid #FF6F00;
}

/* 已完成 */
.tag-completed {
  background: linear-gradient(135deg, #D4AF37 0%, #8B6914 100%);
  border: 1px solid #8B6914;
}
```

### 4.5 进度条（Progress Bar）

**设计风格**：经验值条

```css
.progress-exp {
  height: 24px;
  background: linear-gradient(180deg, #1A0F0A 0%, #2C1810 100%);
  border: 2px solid #8B7355;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
}

.progress-exp-bar {
  height: 100%;
  background: linear-gradient(90deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%);
  border-radius: 10px;
  box-shadow: 
    0 0 10px rgba(212, 175, 55, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: width 0.5s ease;
}

/* 闪光动画 */
.progress-exp-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

### 4.6 时间轴（Timeline）

**设计风格**：任务路线图

```css
.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, 
    #D4AF37 0%, 
    #8B7355 50%, 
    #3D2317 100%);
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  margin-bottom: 32px;
}

.timeline-marker {
  position: absolute;
  left: -40px;
  top: 0;
  width: 28px;
  height: 28px;
  background: radial-gradient(circle, #D4AF37 0%, #8B6914 100%);
  border: 3px solid #2C1810;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}

.timeline-marker.completed {
  background: radial-gradient(circle, #2E8B57 0%, #1B5E20 100%);
  border-color: #2C1810;
}

.timeline-marker.current {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.8);
  }
}
```

### 4.7 模态框（Modal）

**设计风格**：公会公告板

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 15, 10, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: linear-gradient(180deg, #F5E6D3 0%, #E8D4B8 100%);
  border: 4px solid #8B7355;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 0 50px rgba(139, 115, 85, 0.1);
  position: relative;
}

/* 木框装饰 */
.modal-content::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid #D4AF37;
  border-radius: 12px;
  pointer-events: none;
  opacity: 0.3;
}

.modal-header {
  padding: 24px;
  border-bottom: 2px solid #8B7355;
  background: linear-gradient(90deg, 
    rgba(139, 115, 85, 0.1) 0%, 
    rgba(212, 175, 55, 0.1) 50%, 
    rgba(139, 115, 85, 0.1) 100%);
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 24px;
  border-top: 2px solid #8B7355;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

### 4.8 导航栏（Navigation）

**设计风格**：公会招牌

```css
.navbar {
  background: linear-gradient(180deg, #2C1810 0%, #1A0F0A 100%);
  border-bottom: 3px solid #D4AF37;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Cinzel', serif;
  font-size: 24px;
  font-weight: bold;
  color: #D4AF37;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* 公会徽标 */
.navbar-brand .logo {
  width: 48px;
  height: 48px;
  background: radial-gradient(circle, #D4AF37 0%, #8B6914 100%);
  border: 3px solid #2C1810;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
}

.nav-link {
  color: #F5E6D3;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.nav-link.active {
  background: rgba(212, 175, 55, 0.2);
  color: #D4AF37;
  border-bottom: 2px solid #D4AF37;
}
```

---

## 5. 页面布局设计

### 5.1 整体布局结构

```
┌─────────────────────────────────────────────────────────────┐
│                        导航栏                                │
│  [公会徽标] 赏金猎人公会 | 悬赏市场 | 我的委托 | 冒险者大厅 │
└─────────────────────────────────────────────────────────────┘
┌──────────┬──────────────────────────────────────────────────┐
│          │                                                  │
│  侧边栏   │                  主内容区                        │
│          │                                                  │
│ [用户卡片] │  ┌────────────────────────────────────────┐   │
│          │  │                                        │   │
│ [导航菜单] │  │           页面标题                     │   │
│          │  │                                        │   │
│ [快捷操作] │  ├────────────────────────────────────────┤   │
│          │  │                                        │   │
│ [统计信息] │  │           内容区域                     │   │
│          │  │                                        │   │
│          │  │                                        │   │
│          │  └────────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────────┘
```

### 5.2 首页布局

```
┌─────────────────────────────────────────────────────────────┐
│                        导航栏                                │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        Hero区域                              │
│  "欢迎来到赏金猎人公会"                                       │
│  [发布悬赏] [成为冒险者]                                     │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        热门悬赏                              │
│  [悬赏卡片1] [悬赏卡片2] [悬赏卡片3] [悬赏卡片4]             │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        精英冒险者                            │
│  [冒险者卡片1] [冒险者卡片2] [冒险者卡片3]                    │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        公会数据                              │
│  总悬赏额 | 完成任务 | 冒险者数量                           │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 悬赏市场页面布局

```
┌─────────────────────────────────────────────────────────────┐
│                        导航栏                                │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        筛选栏                                │
│  [场景] [技术栈] [交付模式] [预算范围] [搜索]                │
└─────────────────────────────────────────────────────────────┘
┌──────────┬──────────────────────────────────────────────────┐
│          │                                                  │
│  侧边栏   │                  悬赏列表                        │
│          │  ┌─────────────────────────────────────────┐   │
│ 任务类型  │  │                                         │   │
│          │  │  [悬赏令卡片1]                          │   │
│ ○ 模板化  │  │                                         │   │
│ ○ 自定义  │  ├─────────────────────────────────────────┤   │
│          │  │                                         │   │
│ 预算范围  │  │  [悬赏令卡片2]                          │   │
│ ○ < 5K   │  │                                         │   │
│ ○ 5-10K  │  ├─────────────────────────────────────────┤   │
│ ○ 10-20K │  │                                         │   │
│ ○ > 20K  │  │  [悬赏令卡片3]                          │   │
│          │  │                                         │   │
│ 交付模式  │  └─────────────────────────────────────────┘   │
│ ○ 里程碑  │                                                  │
│ ○ 小时制  │                                                  │
│ ○ 混合   │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### 5.4 悬赏详情页面布局

```
┌─────────────────────────────────────────────────────────────┐
│                        导航栏                                │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        面包屑                                │
│  悬赏市场 > Web开发 > 企业官网开发                            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        悬赏令主卡片                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [印章] 企业官网开发悬赏                             │  │
│  │                                                      │  │
│  │  委托人：张三 | 发布时间：2026-03-15                │  │
│  │                                                      │  │
│  │  需求描述：...                                       │  │
│  │                                                      │  │
│  │  预算：10,000 - 15,000 金币                          │  │
│  │  期限：30天                                          │  │
│  │                                                      │  │
│  │  [提交申请书]                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        详细信息                               │
│  ┌─────────────┬─────────────────────────────────────────┐  │
│  │   技术栈    │  React, Node.js, PostgreSQL            │  │
│  ├─────────────┼─────────────────────────────────────────┤  │
│  │   交付物    │  源代码、文档、部署脚本                 │  │
│  ├─────────────┼─────────────────────────────────────────┤  │
│  │   验收标准  │  功能清单、性能指标、兼容性             │  │
│  └─────────────┴─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        已收到的申请书                         │
│  [冒险者卡片1 - 12,000金币] [冒险者卡片2 - 15,000金币]       │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 冒险者工作台布局

```
┌─────────────────────────────────────────────────────────────┐
│                        导航栏                                │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        冒险者卡片                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [头像] 狂暴战士 - Lv.15 | 声望: 2,450              │  │
│  │                                                      │  │
│  │  [接取任务: 12] [完成任务: 8] [好评率: 95%]         │  │
│  │                                                      │  │
│  │  总收入: 156,000 金币 | 排名: #23                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        进行中的任务                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [任务卡片]                                          │  │
│  │  企业官网开发                                        │  │
│  │  进度: ████████░░ 80%                                │  │
│  │  里程碑3/4 | 剩余5天                                  │  │
│  │  [查看详情] [提交验收]                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        里程碑时间线                           │
│  ● 里程碑1 - 已完成 ✓                                      │
│  ● 里程碑2 - 已完成 ✓                                      │
│  ● 里程碑3 - 进行中 ◉                                      │
│  ○ 里程碑4 - 待开始                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 交互动效规范

### 6.1 页面转场

**淡入淡出**：
```css
.fade-enter {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-exit {
  opacity: 1;
}

.fade-exit-active {
  opacity: 0;
  transition: opacity 0.3s ease;
}
```

**羊皮卷展开**：
```css
.unfold-enter {
  transform: scaleY(0);
  transform-origin: top;
}

.unfold-enter-active {
  transform: scaleY(1);
  transition: transform 0.5s ease;
}
```

### 6.2 微交互

**按钮点击反馈**：
```css
.btn-click {
  animation: buttonPress 0.2s ease;
}

@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
```

**金币掉落**（支付成功）：
```css
.coin-drop {
  animation: coinDrop 1s ease-out;
}

@keyframes coinDrop {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(0) rotate(360deg);
    opacity: 1;
  }
}
```

**印章盖章**（验收通过）：
```css
.seal-stamp {
  animation: stampDown 0.5s ease;
}

@keyframes stampDown {
  0% {
    transform: translateY(-50px) scale(2);
    opacity: 0;
  }
  70% {
    transform: translateY(0) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
```

### 6.3 加载动画

**公会旗帜飘动**：
```css
.loading-flag {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #D4AF37 0%, #8B6914 100%);
  clip-path: polygon(0 0, 100% 20%, 0 40%);
  animation: flagWave 1s ease-in-out infinite;
}

@keyframes flagWave {
  0%, 100% {
    transform: skewY(0deg);
  }
  50% {
    transform: skewY(10deg);
  }
}
```

**烛光闪烁**：
```css
.loading-candle {
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #FFD700 0%, #FF8F00 100%);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  animation: candleFlicker 1.5s ease-in-out infinite;
}

@keyframes candleFlicker {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.95);
  }
}
```

### 6.4 成功/失败反馈

**任务完成**：
```css
.celebration {
  position: relative;
}

.celebration::before {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  color: #2E8B57;
  animation: successPop 0.5s ease;
}

@keyframes successPop {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}
```

**失败提示**：
```css
.failure-shake {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
```

---

## 7. 响应式设计

### 7.1 断点定义

```css
/* 手机 */
@media (max-width: 640px) {
  /* 单列布局 */
  .container {
    padding: 12px;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}

/* 平板 */
@media (min-width: 641px) and (max-width: 1024px) {
  /* 两列布局 */
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面 */
@media (min-width: 1025px) {
  /* 多列布局 */
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 7.2 移动端适配

**导航栏**：
```css
@media (max-width: 768px) {
  .navbar {
    padding: 12px 16px;
  }
  
  .navbar-brand .logo {
    width: 36px;
    height: 36px;
  }
  
  .navbar-brand {
    font-size: 18px;
  }
  
  .nav-menu {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: #2C1810;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .nav-menu.open {
    transform: translateX(0);
  }
}
```

**卡片网格**：
```css
@media (max-width: 640px) {
  .bounty-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .bounty-card {
    padding: 16px;
  }
}
```

---

## 8. 图标与插画系统

### 8.1 图标风格

**风格**：线型图标 + 金色点缀

**技术实现**：
- 使用SVG图标
- 或使用Font Awesome + 自定义样式

```css
.icon {
  color: #D4AF37;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icon-secondary {
  color: #8B7355;
}
```

### 8.2 核心图标映射

| 功能 | 图标 | 说明 |
|------|------|------|
| 悬赏/任务 | 📜 羊皮卷 | 代表悬赏令 |
| 冒险者/开发者 | ⚔️ 剑 | 代表赏金猎人 |
| 委托人/客户 | 👑 皇冠 | 代表贵族/委托人 |
| 金币/赏金 | 💰 钱袋 | 代表奖励 |
| 里程碑 | 🏁 旗帜 | 代表任务节点 |
| 验收 | ✓ 印章 | 代表完成确认 |
| 争议 | ⚖️ 天平 | 代表仲裁 |
| 声望 | ⭐ 星星 | 代表等级 |
| 时间 | ⏳ 沙漏 | 代表截止日期 |
| 文档 | 📜 卷轴 | 代表文档 |

### 8.3 插画风格

**背景插画**：
- 公会大厅内部（木质纹理、壁炉）
- 世界地图（导航背景）
- 冒险者剪影（loading状态）

**风格**：
- 扁平化插画
- 金色/棕色为主色调
- 中世纪奇幻元素

---

## 9. 页面设计详解

### 9.1 首页（Home）

**Hero区域**：
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              [公会徽标]                                      │
│                                                             │
│         赏金猎人公会                                         │
│    接取悬赏，完成委托，收获赏金                              │
│                                                             │
│    [发布悬赏] [成为冒险者]                                   │
│                                                             │
│   [背景：公会大厅插画]                                       │
└─────────────────────────────────────────────────────────────┘
```

**统计数据**：
```
┌──────────┬──────────┬──────────┬──────────┐
│ 总悬赏额  │ 完成任务  │ 冒险者数量 │ 好评率   │
│ 1.2M金币  │   345   │   128   │   95%   │
└──────────┴──────────┴──────────┴──────────┘
```

### 9.2 悬赏市场（Marketplace）

**筛选栏**：
```html
<div class="filter-bar">
  <select class="filter-select">
    <option>场景类型</option>
    <option>Web开发</option>
    <option>移动应用</option>
    <option>AI自动化</option>
  </select>
  
  <select class="filter-select">
    <option>技术栈</option>
    <option>React</option>
    <option>Vue</option>
    <option>Python</option>
  </select>
  
  <select class="filter-select">
    <option>交付模式</option>
    <option>里程碑</option>
    <option>小时制</option>
  </select>
  
  <div class="search-box">
    <input type="text" placeholder="搜索悬赏..." />
    <button>🔍</button>
  </div>
</div>
```

**悬赏卡片**：
```html
<div class="bounty-card">
  <div class="seal">紧急</div>
  
  <h3>企业官网开发</h3>
  
  <div class="meta">
    <span class="tag">Web开发</span>
    <span class="tag">里程碑</span>
  </div>
  
  <p class="description">
    需要开发一个响应式企业官网，包含产品展示、新闻动态、联系我们等模块...
  </p>
  
  <div class="footer">
    <span class="budget">10,000 - 15,000 金币</span>
    <span class="proposals">已收到 3 份申请书</span>
  </div>
  
  <button class="btn-primary">查看详情</button>
</div>
```

### 9.3 悬赏详情（Bounty Detail）

**悬赏令主卡片**：
```html
<div class="bounty-detail-card">
  <div class="header">
    <div class="seal">悬赏</div>
    <h1>企业官网开发悬赏令</h1>
  </div>
  
  <div class="info-bar">
    <div class="info-item">
      <span class="label">委托人</span>
      <span class="value">张三</span>
    </div>
    <div class="info-item">
      <span class="label">发布时间</span>
      <span class="value">2026-03-15</span>
    </div>
    <div class="info-item">
      <span class="label">截止日期</span>
      <span class="value">2026-04-15</span>
    </div>
  </div>
  
  <div class="content">
    <h2>需求描述</h2>
    <p>...</p>
    
    <h2>技术要求</h2>
    <ul>
      <li>前端：React + TypeScript</li>
      <li>后端：Node.js + NestJS</li>
      <li>数据库：PostgreSQL</li>
    </ul>
    
    <h2>验收标准</h2>
    <ul>
      <li>响应式设计，支持移动端</li>
      <li>首屏加载时间 < 2秒</li>
      <li>SEO友好</li>
    </ul>
  </div>
  
  <div class="footer">
    <div class="reward">
      <span class="label">赏金</span>
      <span class="value gold">10,000 - 15,000 金币</span>
    </div>
    <button class="btn-primary">提交申请书</button>
  </div>
</div>
```

### 9.4 冒险者工作台（Hunter Dashboard）

**冒险者卡片**：
```html
<div class="hunter-card">
  <div class="avatar">
    <img src="avatar.jpg" alt="狂暴战士" />
    <div class="level-badge">Lv.15</div>
  </div>
  
  <div class="info">
    <h2>狂暴战士</h2>
    <p class="title">全栈开发者 | React专家</p>
    
    <div class="stats">
      <div class="stat">
        <span class="label">声望</span>
        <span class="value">2,450</span>
      </div>
      <div class="stat">
        <span class="label">完成任务</span>
        <span class="value">8</span>
      </div>
      <div class="stat">
        <span class="label">好评率</span>
        <span class="value">95%</span>
      </div>
    </div>
    
    <div class="achievements">
      <span class="achievement" title="快速完成">⚡</span>
      <span class="achievement" title="高质量">💎</span>
      <span class="achievement" title="好评如潮">⭐</span>
    </div>
  </div>
</div>
```

**进行中的任务**：
```html
<div class="active-missions">
  <h2>进行中的任务</h2>
  
  <div class="mission-card">
    <div class="header">
      <h3>企业官网开发</h3>
      <span class="badge badge-in-progress">进行中</span>
    </div>
    
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" style="width: 75%"></div>
      </div>
      <span class="progress-text">75% 完成</span>
    </div>
    
    <div class="milestones">
      <div class="milestone completed">
        <span class="marker">✓</span>
        <span class="label">里程碑1：需求确认</span>
      </div>
      <div class="milestone completed">
        <span class="marker">✓</span>
        <span class="label">里程碑2：UI设计</span>
      </div>
      <div class="milestone current">
        <span class="marker">◉</span>
        <span class="label">里程碑3：前端开发</span>
      </div>
      <div class="milestone">
        <span class="marker">○</span>
        <span class="label">里程碑4：后端集成</span>
      </div>
    </div>
    
    <div class="footer">
      <span class="deadline">剩余 5 天</span>
      <button class="btn-secondary">查看详情</button>
    </div>
  </div>
</div>
```

---

## 10. 前端实现建议

### 10.1 技术栈

```json
{
  "framework": "React 18",
  "language": "TypeScript",
  "styling": "CSS-in-JS (Emotion / Styled-components)",
  "icons": "Lucide React / Font Awesome",
  "animations": "Framer Motion",
  "forms": "React Hook Form + Zod",
  "state": "Zustand / Jotai",
  "routing": "React Router 6",
  "ui": "自定义组件库 + Ant Design (基础)"
}
```

### 10.2 组件结构

```
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── ...
│   ├── layout/
│   │   ├── Navbar/
│   │   ├── Sidebar/
│   │   └── Footer/
│   └── business/
│       ├── BountyCard/
│       ├── HunterCard/
│       └── MissionTimeline/
├── styles/
│   ├── themes/
│   │   ├── bounty-hunter.ts
│   │   └── variables.ts
│   ├── global.css
│   └── animations.css
├── pages/
│   ├── Home/
│   ├── Marketplace/
│   ├── BountyDetail/
│   └── Dashboard/
└── hooks/
    ├── useTheme.ts
    └── useAnimation.ts
```

### 10.3 主题配置

```typescript
// themes/bounty-hunter.ts
export const bountyHunterTheme = {
  colors: {
    primary: {
      main: '#2C1810',
      light: '#3D2317',
      dark: '#1A0F0A',
    },
    secondary: {
      main: '#8B7355',
      light: '#A08060',
      dark: '#5D4037',
    },
    accent: {
      gold: '#D4AF37',
      goldLight: '#FFD700',
      goldDark: '#8B6914',
    },
    success: '#2E8B57',
    warning: '#FFB300',
    error: '#8B0000',
    info: '#4169E1',
  },
  typography: {
    fontFamily: {
      chinese: "'Noto Serif SC', serif",
      english: "'Cinzel', serif",
      code: "'Fira Code', monospace",
    },
    fontSize: {
      display: '48px',
      h1: '32px',
      h2: '24px',
      h3: '20px',
      body: '16px',
      caption: '12px',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '50%',
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.2)',
    md: '0 4px 8px rgba(0, 0, 0, 0.3)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.4)',
    gold: '0 0 20px rgba(212, 175, 55, 0.3)',
  },
};
```

### 10.4 性能优化

**图片优化**：
- 使用WebP格式
- 懒加载
- 响应式图片

**代码分割**：
```typescript
import { lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
```

**CSS优化**：
- 使用CSS变量
- 避免深层嵌套
- 使用will-change优化动画

### 10.5 可访问性

**色彩对比度**：
- 确保文字与背景对比度 ≥ 4.5:1
- 大文字对比度 ≥ 3:1

**键盘导航**：
- 所有交互元素支持键盘访问
- 焦点可见

**语义化HTML**：
```html
<nav aria-label="主导航">
<button aria-label="关闭对话框">
<main role="main">
```

---

## 附录

### A. 术语对照表

| 现实术语 | 公会术语 | 设计元素 |
|---------|---------|---------|
| 客户 | 委托人 | 皇冠、贵族服饰 |
| 开发者 | 冒险者/赏金猎人 | 剑、盾牌、装备 |
| 项目需求 | 悬赏令 | 羊皮纸、蜡封 |
| 报价 | 申请书 | 卷轴、羽毛笔 |
| 里程碑 | 任务阶段 | 旗帜、路线图 |
| 资金 | 赏金/金币 | 金币、钱袋 |
| 验收 | 任务确认 | 印章、对勾 |
| 争议 | 纠纷 | 天平、法槌 |
| 评价 | 声望 | 星星、勋章 |

### B. 设计资源

**字体**：
- Noto Serif SC: https://fonts.google.com/noto/specimen/Noto+Serif+SC
- Cinzel: https://fonts.google.com/specimen/Cinzel
- Fira Code: https://fonts.google.com/specimen/Fira+Code

**图标库**：
- Lucide React: https://lucide.dev/
- Font Awesome: https://fontawesome.com/

**插画参考**：
- Storyset: https://storyset.com/
- unDraw: https://undraw.co/

**纹理素材**：
- Subtle Patterns: https://www.toptal.com/designers/subtlepatterns/
- CSS Patterns: https://csspatterns.com/

### C. 设计检查清单

**视觉一致性**：
- [ ] 所有页面使用统一的色彩系统
- [ ] 字体使用符合层级规范
- [ ] 间距使用统一的标准
- [ ] 圆角、阴影等细节统一

**公会风格**：
- [ ] 羊皮纸纹理使用恰当
- [ ] 金色点缀不滥用
- [ ] 木质、金属质感明显
- [ ] 蜡封、印章等元素使用合理

**交互体验**：
- [ ] 按钮有清晰的hover/active状态
- [ ] 加载状态有动画反馈
- [ ] 成功/失败有明确提示
- [ ] 页面转场流畅自然

**性能优化**：
- [ ] 图片压缩和懒加载
- [ ] 代码分割和按需加载
- [ ] CSS动画使用GPU加速
- [ ] 避免过度使用阴影和渐变

**可访问性**：
- [ ] 色彩对比度符合WCAG标准
- [ ] 支持键盘导航
- [ ] 有意义的alt文本
- [ ] 语义化HTML结构

---

**文档变更记录**

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| v1.0 | 2026-04-01 | 初始版本 | AI Assistant |

---

**下一步行动**：

1. 设计团队根据本文档创建UI原型
2. 前端团队搭建组件库
3. 产品团队确认交互细节
4. 进行可用性测试和迭代
