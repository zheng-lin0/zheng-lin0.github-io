/**
 * 导航系统 - 处理网站的导航功能，包括菜单切换、页面导航等
 * @module NavigationSystem
 */

/**
 * 导航系统类
 * @class NavigationSystem
 */
class NavigationSystem {
    /**
     * 构造函数
     * @constructor
     */
    constructor() {
        this.currentRoute = null;
        this.routes = new Map();
        this.isInitialized = false;
        this.isMobileMenuOpen = false;
        
        // 默认配置
        this.config = {
            activeClass: 'active',
            mobileMenuBreakpoint: 992,
            animationDuration: 300
        };
    }

    /**
     * 初始化导航系统
     * @public
     * @param {Object} [options] - 配置选项
     */
    initialize(options = {}) {
        if (this.isInitialized) {
            console.warn('NavigationSystem已经初始化');
            return;
        }

        try {
            // 合并配置
            this.config = { ...this.config, ...options };
            
            // 注册默认路由
            this.registerDefaultRoutes();
            
            // 设置导航事件监听
            this.setupNavigationListeners();
            
            // 处理响应式导航
            this.setupResponsiveNavigation();
            
            // 设置滚动事件监听
            this.setupScrollListeners();
            
            // 设置初始化完成标志
            this.isInitialized = true;
            
            // 初始化当前路由
            this.initializeCurrentRoute();
            
            console.log('NavigationSystem初始化成功');
        } catch (error) {
            console.error('NavigationSystem初始化失败:', error);
        }
    }

    /**
     * 注册默认路由
     * @private
     */
    registerDefaultRoutes() {
        // 从页面中提取导航项作为默认路由
        const navItems = document.querySelectorAll('.nav-container a[href^="#"]');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            const route = href.substring(1); // 移除#号
            
            if (route) {
                this.registerRoute(route, {
                    path: href,
                    element: item
                });
            }
        });
        
        // 注册常见功能路由（即使没有对应的导航项）
        const commonRoutes = ['upload', 'browser', 'resources'];
        commonRoutes.forEach(route => {
            if (!this.routes.has(route)) {
                this.registerRoute(route, {
                    path: `#${route}`,
                    element: null
                });
            }
        });
    }

    /**
     * 设置导航事件监听
     * @private
     */
    setupNavigationListeners() {
        // 监听所有锚点点击事件
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a');
            
            if (target && target.getAttribute('href') && target.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const route = target.getAttribute('href').substring(1);
                this.navigate(route);
            }
        });

        // 监听导航栏中菜单按钮点击
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
    }

    /**
     * 设置响应式导航
     * @private
     */
    setupResponsiveNavigation() {
        // 监听窗口大小变化
        window.addEventListener('resize', utils.debounce(() => {
            this.handleWindowResize();
        }, 200));
        
        // 初始检查
        this.handleWindowResize();
    }
    
    /**
     * 设置滚动事件监听
     * @private
     */
    setupScrollListeners() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        // 初始检查
        this.updateNavbarScrollState(navbar);
        
        // 监听滚动事件
        window.addEventListener('scroll', utils.throttle(() => {
            this.updateNavbarScrollState(navbar);
        }, 100));
    }
    
    /**
     * 更新导航栏滚动状态
     * @private
     * @param {HTMLElement} navbar - 导航栏元素
     */
    updateNavbarScrollState(navbar) {
        const scrollTop = window.pageYOffset;
        
        // 确保导航栏始终保持固定位置
        navbar.style.transform = 'translateY(0)';
        navbar.style.position = 'fixed';
        navbar.style.top = '0';
        navbar.style.left = '0';
        navbar.style.right = '0';
        navbar.style.zIndex = '9999';
        
        // 更新scrolled类
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    /**
     * 处理窗口大小变化
     * @private
     */
    handleWindowResize() {
        const windowWidth = window.innerWidth;
        
        // 如果窗口宽度大于移动端断点，关闭移动端菜单
        if (windowWidth > this.config.mobileMenuBreakpoint && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    /**
     * 注册路由
     * @public
     * @param {string} route - 路由名称
     * @param {Object} config - 路由配置
     * @param {string} config.path - 路由路径
     * @param {HTMLElement} config.element - 导航元素
     * @param {Function} [config.onEnter] - 进入路由时的回调
     * @param {Function} [config.onLeave] - 离开路由时的回调
     */
    registerRoute(route, config) {
        if (!route || !config || !config.path) {
            console.error('无效的路由配置: 缺少必要参数');
            return;
        }
        
        this.routes.set(route, config);
        console.log(`路由已注册: ${route}`);
    }

    /**
     * 导航到指定路由
     * @public
     * @param {string} route - 路由名称
     * @param {Object} [options] - 导航选项
     * @param {boolean} [options.smoothScroll=true] - 是否使用平滑滚动
     * @param {number} [options.offset=0] - 滚动偏移量
     */
    navigate(route, options = {}) {
        if (!this.isInitialized) {
            console.error('NavigationSystem尚未初始化');
            return;
        }
        
        const routeConfig = this.routes.get(route);
        if (!routeConfig) {
            console.warn(`路由不存在: ${route}`);
            
            // 处理特殊路由
            switch(route) {
                case 'upload':
                    // 检查是否有资源上传模块
                    if (window.resourceManager) {
                        console.log('尝试打开资源上传功能');
                        // 可以在这里添加打开上传面板的逻辑
                    }
                    break;
                case 'browser':
                    // 检查是否有浏览器模块
                    if (window.browserSystem) {
                        console.log('尝试打开内置浏览器');
                        // 可以在这里添加打开浏览器的逻辑
                    }
                    break;
                case 'resources':
                    // 检查是否有资源中心模块
                    if (window.resourceCenter) {
                        console.log('尝试打开资源中心');
                        // 可以在这里添加打开资源中心的逻辑
                    }
                    break;
                default:
                    // 默认导航到首页
                    const firstRoute = this.routes.keys().next().value;
                    if (firstRoute) {
                        console.log(`导航到默认路由: ${firstRoute}`);
                        this.navigate(firstRoute, options);
                    }
            }
            return;
        }

        try {
            const defaultOptions = { smoothScroll: true, offset: 0 };
            const mergedOptions = { ...defaultOptions, ...options };
            
            // 更新当前路由
            this.updateCurrentRoute(route);
            
            // 执行路由进入回调
            if (typeof routeConfig.onEnter === 'function') {
                routeConfig.onEnter(route, mergedOptions);
            }
            
            // 滚动到目标位置
            const targetElement = document.querySelector(routeConfig.path);
            if (targetElement) {
                this.scrollToElement(targetElement, mergedOptions);
            }
            
            // 触发路由变化事件
            this.triggerRouteChangeEvent(route, routeConfig, mergedOptions);
            
            console.log(`导航到路由: ${route}`);
        } catch (error) {
            console.error(`导航到路由 ${route} 失败:`, error);
        }
    }

    /**
     * 更新当前路由
     * @private
     * @param {string} route - 新路由名称
     */
    updateCurrentRoute(route) {
        // 移除旧路由的激活状态
        if (this.currentRoute) {
            const oldRouteConfig = this.routes.get(this.currentRoute);
            if (oldRouteConfig && oldRouteConfig.element) {
                oldRouteConfig.element.classList.remove(this.config.activeClass);
            }
            
            // 执行旧路由的离开回调
            if (typeof oldRouteConfig.onLeave === 'function') {
                oldRouteConfig.onLeave(this.currentRoute);
            }
        }
        
        // 更新当前路由
        this.currentRoute = route;
        
        // 添加新路由的激活状态
        const newRouteConfig = this.routes.get(route);
        if (newRouteConfig && newRouteConfig.element) {
            newRouteConfig.element.classList.add(this.config.activeClass);
        }
    }

    /**
     * 滚动到指定元素
     * @private
     * @param {HTMLElement} element - 目标元素
     * @param {Object} options - 滚动选项
     */
    scrollToElement(element, options) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - options.offset;
        
        if (options.smoothScroll) {
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
                duration: this.config.animationDuration
            });
        } else {
            window.scrollTo(0, offsetPosition);
        }
    }

    /**
     * 触发路由变化事件
     * @private
     * @param {string} route - 路由名称
     * @param {Object} routeConfig - 路由配置
     * @param {Object} options - 导航选项
     */
    triggerRouteChangeEvent(route, routeConfig, options) {
        const event = new CustomEvent('routeChanged', {
            detail: {
                route,
                path: routeConfig.path,
                options
            },
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * 获取当前路由
     * @public
     * @returns {string|null} 当前路由名称
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * 获取路由配置
     * @public
     * @param {string} [route] - 路由名称（可选，默认为当前路由）
     * @returns {Object|null} 路由配置
     */
    getRouteConfig(route = null) {
        const routeName = route || this.currentRoute;
        return this.routes.get(routeName) || null;
    }

    /**
     * 获取所有路由
     * @public
     * @returns {Array} 路由配置数组
     */
    getAllRoutes() {
        return Array.from(this.routes.entries());
    }

    /**
     * 切换移动端菜单
     * @public
     */
    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        const menu = document.getElementById('navbarMenu');
        if (menu) {
            menu.classList.toggle('open', this.isMobileMenuOpen);
        }
    }

    /**
     * 打开移动端菜单
     * @public
     */
    openMobileMenu() {
        const mobileMenu = document.querySelector('.nav-container .menu');
        if (!mobileMenu) return;
        
        // 添加动画效果
        mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
        mobileMenu.style.opacity = '1';
        mobileMenu.style.visibility = 'visible';
        
        this.isMobileMenuOpen = true;
        
        // 添加关闭菜单的背景遮罩
        this.addMobileMenuOverlay();
        
        console.log('移动端菜单已打开');
    }

    /**
     * 关闭移动端菜单
     * @public
     */
    closeMobileMenu() {
        const mobileMenu = document.querySelector('.nav-container .menu');
        if (!mobileMenu) return;
        
        // 添加动画效果
        mobileMenu.style.maxHeight = '0';
        mobileMenu.style.opacity = '0';
        mobileMenu.style.visibility = 'hidden';
        
        this.isMobileMenuOpen = false;
        
        // 移除关闭菜单的背景遮罩
        this.removeMobileMenuOverlay();
        
        console.log('移动端菜单已关闭');
    }

    /**
     * 添加移动端菜单遮罩
     * @private
     */
    addMobileMenuOverlay() {
        // 检查是否已有遮罩
        let overlay = document.getElementById('mobile-menu-overlay');
        if (overlay) return;
        
        // 创建遮罩元素
        overlay = document.createElement('div');
        overlay.id = 'mobile-menu-overlay';
        overlay.className = 'mobile-menu-overlay';
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .mobile-menu-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 998;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .mobile-menu-overlay.active {
                opacity: 1;
                visibility: visible;
            }
        `;
        document.head.appendChild(style);
        
        // 添加点击事件关闭菜单
        overlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });
        
        document.body.appendChild(overlay);
        
        // 添加激活类
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }

    /**
     * 移除移动端菜单遮罩
     * @private
     */
    removeMobileMenuOverlay() {
        const overlay = document.getElementById('mobile-menu-overlay');
        if (!overlay) return;
        
        // 移除激活类
        overlay.classList.remove('active');
        
        // 等待动画完成后移除元素
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, this.config.animationDuration);
    }

    /**
     * 初始化当前路由
     * @private
     */
    initializeCurrentRoute() {
        // 检查URL中的hash
        const hash = window.location.hash;
        
        if (hash && hash.length > 1) {
            const route = hash.substring(1);
            if (this.routes.has(route)) {
                this.navigate(route);
            }
        } else {
            // 默认导航到第一个路由
            const firstRoute = this.routes.keys().next().value;
            if (firstRoute) {
                this.navigate(firstRoute);
            }
        }
    }

    /**
     * 刷新当前路由
     * @public
     */
    refreshCurrentRoute() {
        if (this.currentRoute) {
            this.navigate(this.currentRoute);
        }
    }

    /**
     * 添加路由变化监听器
     * @public
     * @param {Function} callback - 回调函数
     */
    addRouteChangeListener(callback) {
        if (typeof callback !== 'function') {
            console.error('回调必须是函数');
            return;
        }
        
        document.addEventListener('routeChanged', callback);
    }

    /**
     * 移除路由变化监听器
     * @public
     * @param {Function} callback - 回调函数
     */
    removeRouteChangeListener(callback) {
        document.removeEventListener('routeChanged', callback);
    }

    /**
     * 更新导航配置
     * @public
     * @param {Object} options - 配置选项
     */
    updateConfig(options) {
        this.config = { ...this.config, ...options };
    }

    /**
     * 销毁导航系统
     * @public
     */
    destroy() {
        if (!this.isInitialized) return;
        
        try {
            // 关闭移动端菜单
            if (this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
            
            // 移除事件监听
            window.removeEventListener('resize', this.handleWindowResize);
            
            this.isInitialized = false;
            console.log('NavigationSystem已销毁');
        } catch (error) {
            console.error('销毁NavigationSystem失败:', error);
        }
    }
}

// 导出单例
const navigationSystem = new NavigationSystem();

// 添加到全局对象以便其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = navigationSystem;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return navigationSystem; });
} else {
    window.navigationSystem = navigationSystem;
}

// 创建全局函数，用于页面上的事件调用
window.toggleNavMenu = function() {
    if (window.navigationSystem) {
        window.navigationSystem.toggleMobileMenu();
    }
}
