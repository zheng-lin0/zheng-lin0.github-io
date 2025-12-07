# 网站模块化重构文档

## 1. 项目概述

本项目对原有网站进行了全面的模块化重构，采用了现代前端架构设计原则，将网站功能拆分为多个独立、可复用的模块。重构后的代码具有更好的可维护性、可扩展性和可测试性。

## 2. 模块化架构

### 2.1 核心框架

- **CoreFramework**: 核心框架模块，提供模块管理、事件系统和性能监控功能
- **Utils**: 工具函数库，提供常用的工具函数和兼容性支持

### 2.2 功能模块

- **ModalSystem**: 模态框系统，管理网站所有模态框
- **NotificationSystem**: 通知系统，提供消息通知功能
- **ThemeSystem**: 主题系统，支持主题切换和自定义
- **NavigationSystem**: 导航系统，管理网站导航和路由
- **SearchSystem**: 搜索系统，提供网站搜索功能

## 3. 模块说明

### 3.1 CoreFramework

**功能**: 核心框架模块，负责初始化和管理所有其他模块

**主要特性**:
- 单例模式设计
- 模块注册和管理
- 事件系统（发布/订阅模式）
- 性能监控

**使用示例**:
```javascript
const coreFramework = window.CoreFramework.getInstance();
coreFramework.initialize();
coreFramework.registerModule('moduleName', moduleInstance);
```

### 3.2 ModalSystem

**功能**: 模态框系统，管理网站所有模态框的显示、隐藏和交互

**主要特性**:
- 单例模式设计
- 模态框注册和管理
- 自动处理背景遮罩和滚动
- 事件支持（modal:open, modal:close）

**使用示例**:
```javascript
const modalSystem = window.ModalSystem.getInstance();
modalSystem.initialize();
modalSystem.open('modalId');
modalSystem.close('modalId');
```

### 3.3 NotificationSystem

**功能**: 通知系统，提供消息通知功能

**主要特性**:
- 单例模式设计
- 多种通知类型（success, error, warning, info）
- 自动隐藏
- 数量限制

**使用示例**:
```javascript
const notificationSystem = window.NotificationSystem.getInstance();
notificationSystem.initialize();
notificationSystem.show('消息内容', 'success', 3000);
```

### 3.4 ThemeSystem

**功能**: 主题系统，支持主题切换和自定义

**主要特性**:
- 单例模式设计
- 主题注册和管理
- 系统主题检测
- 本地存储支持

**使用示例**:
```javascript
const themeSystem = window.ThemeSystem.getInstance();
themeSystem.initialize();
themeSystem.toggleTheme();
themeSystem.applyTheme('themeName');
```

### 3.5 NavigationSystem

**功能**: 导航系统，管理网站导航和路由

**主要特性**:
- 单例模式设计
- 路由注册和管理
- 导航链接高亮
- 响应式导航支持

**使用示例**:
```javascript
const navigationSystem = window.NavigationSystem.getInstance();
navigationSystem.initialize();
navigationSystem.navigate('/path');
navigationSystem.highlightNavLink('linkId');
```

### 3.6 SearchSystem

**功能**: 搜索系统，提供网站搜索功能

**主要特性**:
- 单例模式设计
- 实时搜索支持
- 搜索结果高亮
- 键盘导航支持

**使用示例**:
```javascript
const searchSystem = window.SearchSystem.getInstance();
searchSystem.initialize();
searchSystem.performSearch('搜索关键词');
```

## 4. 初始化流程

重构后的网站初始化流程如下:

1. 加载所有配置文件和工具函数
2. 初始化核心框架
3. 初始化各个功能模块
4. 注册事件监听器
5. 启动性能监控

```javascript
// app.js 初始化流程
document.addEventListener('DOMContentLoaded', function() {
    // 初始化核心框架
    const coreFramework = window.CoreFramework.getInstance();
    coreFramework.initialize();
    
    // 初始化模块
    initializeModules();
});

function initializeModules() {
    // 初始化模态框系统
    const modalSystem = window.ModalSystem.getInstance();
    modalSystem.initialize();
    
    // 初始化通知系统
    const notificationSystem = window.NotificationSystem.getInstance();
    notificationSystem.initialize();
    
    // 初始化主题系统
    const themeSystem = window.ThemeSystem.getInstance();
    themeSystem.initialize();
    
    // 初始化导航系统
    const navigationSystem = window.NavigationSystem.getInstance();
    navigationSystem.initialize();
    
    // 初始化搜索系统
    const searchSystem = window.SearchSystem.getInstance();
    searchSystem.initialize();
}
```

## 5. 文件结构

```
├── js/
│   ├── config.js              # 网站配置文件
│   ├── utils.js               # 工具函数库
│   ├── app.js                 # 应用入口文件
│   └── modules/               # 模块目录
│       ├── CoreFramework.js   # 核心框架模块
│       ├── ModalSystem.js     # 模态框系统模块
│       ├── NotificationSystem.js  # 通知系统模块
│       ├── ThemeSystem.js     # 主题系统模块
│       ├── NavigationSystem.js    # 导航系统模块
│       └── SearchSystem.js    # 搜索系统模块
├── css/
│   └── main.css               # 主样式文件
├── index.html                 # 网站入口文件
└── test-modules.html          # 模块测试页面
```

## 6. 测试

### 6.1 手动测试

可以通过访问 `test-modules.html` 页面进行模块手动测试，该页面提供了每个模块的测试功能和演示。

### 6.2 单元测试

在 `js/tests/` 目录下提供了各个模块的单元测试文件，使用 Jasmine 测试框架编写。

```
└── js/tests/
    ├── CoreFramework.test.js
    ├── ModalSystem.test.js
    ├── NotificationSystem.test.js
    ├── ThemeSystem.test.js
    ├── NavigationSystem.test.js
    └── SearchSystem.test.js
```

## 7. 开发规范

### 7.1 模块设计原则

- **单一职责原则**: 每个模块只负责一个特定功能
- **接口隔离原则**: 模块接口设计简洁明了
- **依赖倒置原则**: 模块之间通过接口通信，不依赖具体实现
- **开闭原则**: 模块对扩展开放，对修改关闭

### 7.2 代码规范

- 使用语义化的变量和函数名
- 添加详细的代码注释
- 使用一致的代码风格
- 遵循 DRY (Don't Repeat Yourself) 原则

## 8. 浏览器兼容性

重构后的代码兼容现代浏览器和 IE11+，通过 Utils 模块提供必要的兼容性支持。

## 9. 性能优化

- 模块懒加载
- 事件委托
- 防抖和节流
- 性能监控

## 10. 未来计划

- 添加更多功能模块
- 支持 ES6+ 模块化
- 集成构建工具 (Webpack, Rollup)
- 添加自动化测试
- 支持 TypeScript