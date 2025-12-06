# "@"符号用法详解

本文档详细解释了在当前HTML项目中"@"符号的各种使用场景、语法规则和最佳实践。通过对项目代码的分析，我们可以看到"@"符号在前端开发中有多种重要用途。

## 1. NPM作用域包 (Scoped Packages)

### 用途
用于在NPM包管理器中创建命名空间，组织相关的包集合。

### 语法
`@scope/package-name`

### 使用场景
在CDN引入第三方JavaScript库时使用。

### 示例
```html
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/npm/@interactjs/interactjs@1.10.17/dist/interact.min.js"></script>
```

### 说明
- `@supabase/supabase-js` - Supabase数据库的JavaScript客户端库
- `@interactjs/interactjs` - 一个用于处理拖放、调整大小等交互的库
- 作用域包有助于避免包名冲突，提高包的可发现性和组织性

## 2. CSS At-Rules

CSS At-Rules是CSS中以"@"符号开头的特殊规则，用于控制CSS的行为或提供元数据。

### 2.1 @keyframes - 定义动画

#### 用途
定义CSS动画的关键帧序列，控制动画在不同时间点的状态。

#### 语法
```css
@keyframes animation-name {
  from { /* 起始状态 */ }
  to { /* 结束状态 */ }
  /* 或使用百分比定义中间状态 */
  0% { /* 起始状态 */ }
  50% { /* 中间状态 */ }
  100% { /* 结束状态 */ }
}
```

#### 示例
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}
```

#### 应用方式
```css
/* 将动画应用到元素 */
.element {
  animation: pulse 2s infinite;
}

/* 或者使用完整语法 */
.element {
  animation-name: pulse;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  animation-delay: 0s;
  animation-direction: normal;
  animation-fill-mode: forwards;
}
```

#### 说明
- `@keyframes`定义了动画的关键帧，但不会直接应用到元素上
- 需要使用`animation`属性将动画应用到HTML元素
- 可以定义多个关键帧（0%-100%）来创建复杂的动画效果
- 支持所有可动画的CSS属性

### 2.2 @media - 媒体查询

#### 用途
根据设备特性（如屏幕宽度、高度、分辨率、方向等）应用不同的CSS样式，实现响应式设计。

#### 语法
```css
/* 基本语法 */
@media media-type and (media-feature) {
  /* CSS规则 */
}

/* 逻辑操作符 */
@media (min-width: 768px) and (max-width: 1024px) {
  /* 在平板设备上应用的样式 */
}

@media (min-width: 1024px) or (orientation: landscape) {
  /* 在大屏或横屏设备上应用的样式 */
}
```

#### 示例
```css
/* 根据屏幕宽度应用不同样式 */
@media (max-width: 1200px) {
  .sidebar {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  .main-content {
    margin-left: 0;
  }
}

/* 根据设备偏好应用样式 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 根据交互方式应用样式 */
@media (hover: none) and (pointer: coarse) {
  .button {
    padding: 12px 24px;
  }
}

/* 打印样式 */
@media print {
  body {
    font-size: 12pt;
    color: black;
    background: white;
  }
  .nav, .footer {
    display: none;
  }
}
```

#### 说明
- 媒体查询是响应式设计的核心，允许网页在各种设备上提供最佳体验
- 可以针对不同屏幕尺寸（手机、平板、桌面）定制布局
- 支持检测用户偏好（如减少动画、深色模式等）
- 可以定义打印样式，优化打印输出
- 现代CSS框架（如Bootstrap、Tailwind）大量使用媒体查询构建响应式布局

## 3. 电子邮件地址

### 用途
表示电子邮件地址，用于用户注册、联系信息等场景。

### 语法
`local-part@domain`

### 示例
```html
<!-- 表单输入框 -->
<input type="email" placeholder="example@domain.com">

<!-- JavaScript对象中的电子邮件属性 -->
<script>
const users = [
  { username: 'zhenglin', email: 'zhenglin@example.com', role: '超级管理员' },
  { username: 'admin', email: 'admin@example.com', role: '管理员' },
  { username: 'test', email: 'test@example.com', role: '普通用户' }
];
</script>
```

### 说明
- 电子邮件地址的标准格式，由本地部分和域名部分组成
- 在HTML的`input[type="email"]`元素中使用时，浏览器会自动进行基本的格式验证

## 4. 特殊字符集合

### 用途
作为特殊字符集合的一部分，用于密码生成、字符验证等场景。

### 示例
```javascript
// 密码生成中的特殊字符
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

// 表单验证提示
<span>特殊符号 (!@#$%^&*)</span>
```

### 说明
- 仅作为普通字符使用，表示符号本身
- 常用于增强密码强度或进行字符类型验证

## 总结

| 使用场景 | 语法形式 | 示例 |
|---------|---------|------|
| NPM作用域包 | @scope/package-name | @supabase/supabase-js |
| CSS动画 | @keyframes name { ... } | @keyframes pulse { ... } |
| CSS媒体查询 | @media (condition) { ... } | @media (max-width: 768px) { ... } |
| 电子邮件地址 | local@domain | user@example.com |
| 特殊字符 | !@#$%^&* | const symbols = '!@#$%^&*' |

在HTML、CSS和JavaScript中，"@"符号具有多种不同的含义，具体取决于上下文。理解这些用法有助于更好地阅读和编写Web代码。