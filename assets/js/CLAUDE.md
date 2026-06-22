# JavaScript 交互逻辑文档

## 模块职责

实现 TechCraft 网站的前端交互功能，包括：
- 导航栏交互 (移动端菜单、平滑滚动)
- Tab 切换筛选
- 表单验证与提交
- 滚动效果 (导航阴影、回到顶部)
- 数据模拟 (加载更多、表单提交)

---

## 文件成员清单

| 文件 | 职责 | 依赖 |
|------|------|------|
| `main.js` | 主交互逻辑文件 | DOM (HTML)、CSS 样式类 |

---

## 对外接口 (事件与函数)

### DOM 元素引用
```javascript
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
const workTabs = document.getElementById('workTabs');
const worksGrid = document.getElementById('worksGrid');
const contactForm = document.getElementById('contactForm');
const loadMoreBtn = document.getElementById('loadMore');
const backToTopBtn = document.getElementById('backToTop');
```

### 公开函数
```javascript
filterWorks(category)  // 根据 category 筛选作品卡片
isValidEmail(email)    // 验证邮箱格式
showMessage(text, type) // 显示表单消息
```

### 事件监听器
| 元素 | 事件 | 处理逻辑 |
|------|------|----------|
| `navToggle` | click | 切换移动端菜单 |
| `document` | click | 点击外部关闭菜单 |
| `a[href^="#"]` | click | 平滑滚动到锚点 |
| `.tab` | click | 切换 Tab 筛选 |
| `#loadMore` | click | 模拟加载更多 |
| `#contactForm` | submit | 表单验证与提交 |
| `window` | scroll | 导航阴影 + 回到顶部显示 |
| `#backToTop` | click | 滚动到顶部 |

---

## 输入 (IN)

- **用户点击**: Tab 按钮、导航链接、表单提交、回到顶部
- **用户输入**: 表单字段 (姓名、邮箱、消息)
- **滚动事件**: 页面滚动位置

---

## 输出 (OUT)

- **DOM 更新**: 样式类切换 (.active, .visible)
- **UI 反馈**: 消息提示 (成功/错误)
- **显示/隐藏**: 作品卡片筛选显示
- **滚动行为**: 平滑滚动到指定位置

---

## 依赖项

### DOM 依赖
- `#navToggle` - 导航切换按钮
- `.nav-links` - 导航链接容器
- `#workTabs` - Tab 容器
- `#worksGrid` - 作品网格
- `#contactForm` - 联系表单
- `#loadMore` - 加载更多按钮
- `#backToTop` - 回到顶部按钮

### CSS 类依赖
- `.active` - 激活状态 (菜单、Tab)
- `.visible` - 可见状态 (回到顶部按钮)
- `.work-card` - 作品卡片
- `.form-message` - 表单消息

---

## 禁止职责

- ❌ 不要直接修改 CSS 变量 (应由 CSS 处理)
- ❌ 不要进行数据持久化 (localStorage/服务器)
- ❌ 不要包含复杂状态管理 (当前只需简单的 DOM 操作)
- ❌ 不要使用外部框架 (jQuery、React 等)

---

## 常见修改入口

### 添加新 Tab 筛选类别
1. 在 HTML 中添加新的 `<button class="tab">`
2. 设置 `data-filter` 属性
3. 在对应作品卡片上设置相同的 `data-category`

### 修改表单验证规则
编辑 `contactForm` 的 submit 事件监听器中的验证逻辑

### 修改动画时长
编辑 `fadeIn` 动画的 `0.3s` 时长

### 添加新的滚动效果
在 window scroll 事件监听器中添加逻辑

---

## 更新条件

当以下情况发生时，需要更新本文档：

1. 新增/删除/重命名 DOM 元素引用
2. 新增/删除事件监听器
3. 修改函数签名或行为
4. 新增/删除功能模块

---

## 代码组织结构

```
main.js
├── Elements (DOM 引用)
├── Navigation (移动端菜单、平滑滚动)
├── Tab Filtering (作品筛选)
├── Load More (模拟加载)
├── Form (验证与提交)
├── Navbar scroll effect (滚动阴影)
├── Back to Top (回到顶部)
└── Init (初始化)
```

---

## 副作用 (SIDE EFFECT)

- ✅ DOM 操作 (添加/移除 class、修改样式)
- ✅ 动态插入样式标签 (`<style>` for fadeIn keyframes)
- ✅ 控制台输出 (`console.log` 调试信息)
- ❌ 无网络请求
- ❌ 无本地存储操作

---

## 测试 (TEST)

手动测试清单：

- [ ] 移动端菜单切换
- [ ] Tab 筛选功能
- [ ] 平滑滚动到锚点
- [ ] 表单验证 (空字段、无效邮箱)
- [ ] 表单提交反馈
- [ ] 加载更多按钮
- [ ] 回到顶部按钮显示/隐藏
- [ ] 导航栏滚动阴影

---

*所属模块: assets/*
*依赖模块: index.html (DOM 结构)、assets/css/style.css (样式类)*
*相关模块: 无*
