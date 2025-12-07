/**
 * 核心框架模块 - 应用的核心框架，负责页面初始化、模块加载和事件管理
 * @module CoreFramework
 */

/**
 * 核心框架类
 * @class CoreFramework
 */
class CoreFramework {
    /**
     * 构造函数
     * @constructor
     */
    constructor() {
        this.modules = {};
        this.events = {};
        this.isInitialized = false;
    }

    /**
     * 初始化应用
     * @public
     */
    initialize() {
        if (this.isInitialized) {
            console.warn('CoreFramework已经初始化');
            return;
        }

        try {
            // 直接初始化，不再等待DOMContentLoaded（由app.js统一控制）
            this.setupEventListeners();
            this.initializeAllModules();
            this.startPerformanceMonitoring();
            this.isInitialized = true;
            this.emit('app:initialized');
        } catch (error) {
            console.error('CoreFramework初始化失败:', error);
            this.emit('app:error', { message: '应用初始化失败', error });
        }
    }

    /**
     * 注册模块
     * @public
     * @param {string} moduleName - 模块名称
     * @param {Object} module - 模块对象
     * @param {Function} [module.initialize] - 模块初始化方法
     * @param {Function} [module.destroy] - 模块销毁方法
     */
    registerModule(moduleName, module) {
        if (this.modules[moduleName]) {
            console.warn(`模块 ${moduleName} 已存在，将被覆盖`);
        }
        
        this.modules[moduleName] = module;
        this.emit('module:registered', { moduleName });
    }

    /**
     * 获取模块
     * @public
     * @param {string} moduleName - 模块名称
     * @returns {Object|null} 模块对象或null
     */
    getModule(moduleName) {
        return this.modules[moduleName] || null;
    }

    /**
     * 初始化所有注册的模块
     * @private
     */
    initializeAllModules() {
        try {
            Object.keys(this.modules).forEach(moduleName => {
                const module = this.modules[moduleName];
                if (typeof module.initialize === 'function') {
                    try {
                        module.initialize();
                        this.emit('module:initialized', { moduleName });
                    } catch (error) {
                        console.error(`模块 ${moduleName} 初始化失败:`, error);
                        this.emit('module:error', { moduleName, error });
                    }
                }
            });
            
            console.log('所有已注册模块已初始化');
        } catch (error) {
            console.error('模块初始化过程中发生错误:', error);
            this.emit('app:error', { message: '模块初始化失败', error });
        }
    }

    /**
     * 设置全局事件监听
     * @private
     */
    setupEventListeners() {
        // 窗口大小变化事件
        window.addEventListener('resize', utils.throttle(() => {
            this.emit('window:resize', { width: window.innerWidth, height: window.innerHeight });
        }, 250));

        // 页面滚动事件
        window.addEventListener('scroll', utils.throttle(() => {
            this.emit('window:scroll', { scrollTop: window.pageYOffset });
        }, 100));

        // 页面卸载事件
        window.addEventListener('beforeunload', () => {
            this.emit('app:beforeunload');
        });
    }

    /**
     * 启动性能监控
     * @private
     */
    startPerformanceMonitoring() {
        if (window.appConfig && window.appConfig.performance && window.appConfig.performance.enable) {
            try {
                // 基本性能监控
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    console.log('页面加载性能:', {
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        loadEvent: navigation.loadEventEnd - navigation.loadEventStart,
                        totalLoadTime: navigation.loadEventEnd - navigation.startTime
                    });
                }
                
                // 资源加载监控
                const resources = performance.getEntriesByType('resource');
                const slowResources = resources.filter(r => r.duration > 1000);
                if (slowResources.length > 0) {
                    console.warn('慢速加载资源:', slowResources.map(r => ({ name: r.name, duration: r.duration })));
                }
            } catch (error) {
                console.error('性能监控启动失败:', error);
            }
        }
    }

    /**
     * 事件监听
     * @public
     * @param {string} eventName - 事件名称
     * @param {Function} handler - 事件处理函数
     */
    on(eventName, handler) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(handler);
    }

    /**
     * 事件触发
     * @public
     * @param {string} eventName - 事件名称
     * @param {Object} [data] - 事件数据
     */
    emit(eventName, data = {}) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`事件 ${eventName} 处理失败:`, error);
                }
            });
        }
    }

    /**
     * 移除事件监听
     * @public
     * @param {string} eventName - 事件名称
     * @param {Function} handler - 事件处理函数
     */
    off(eventName, handler) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(h => h !== handler);
        }
    }

    /**
     * 销毁应用
     * @public
     */
    destroy() {
        // 销毁所有模块
        Object.keys(this.modules).forEach(moduleName => {
            const module = this.modules[moduleName];
            if (typeof module.destroy === 'function') {
                try {
                    module.destroy();
                    this.emit('module:destroyed', { moduleName });
                } catch (error) {
                    console.error(`模块 ${moduleName} 销毁失败:`, error);
                }
            }
        });

        // 清理事件监听
        this.events = {};
        this.modules = {};
        this.isInitialized = false;
        
        console.log('智能导航中心已销毁');
        this.emit('app:destroyed');
    }
}

// 导出单例
const coreFramework = new CoreFramework();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = coreFramework;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return coreFramework; });
} else {
    window.coreFramework = coreFramework;
}
