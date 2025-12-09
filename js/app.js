// 应用入口文件 - 模块化版本

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('智能导航中心 v3.0 (模块化) 已加载');
    
    // 初始化核心框架
    if (window.coreFramework) {
        window.coreFramework.initialize();
    }
    
    // 初始化所有功能模块
    initializeModules();
    
    // 启动性能监控
    if (window.coreFramework) {
        window.coreFramework.startPerformanceMonitoring();
    }
    
    // 初始化完成后显示欢迎信息
    if (window.notificationSystem) {
        window.notificationSystem.showNotification('智能导航中心已启动', 'success', { duration: 2000 });
    }
});

// 初始化所有功能模块
function initializeModules() {
    try {
        // 初始化模态框系统
        if (typeof modalSystem !== 'undefined') {
            modalSystem.initialize();
        } else {
            console.warn('modalSystem模块未加载');
        }
        
        // 初始化通知系统
        if (typeof notificationSystem !== 'undefined') {
            notificationSystem.initialize();
        } else {
            console.warn('notificationSystem模块未加载');
        }
        
        // 初始化主题系统
        if (typeof themeSystem !== 'undefined') {
            themeSystem.initialize();
        } else {
            console.warn('themeSystem模块未加载');
        }
        
        // 初始化导航系统
        if (typeof navigationSystem !== 'undefined') {
            navigationSystem.initialize();
        } else {
            console.warn('navigationSystem模块未加载');
        }
        
        // 初始化用户管理系统
        if (typeof userManagement !== 'undefined') {
            userManagement.initialize();
        } else {
            console.warn('userManagement模块未加载');
        }
        
        // 初始化会员系统
        if (typeof membershipSystem !== 'undefined') {
            membershipSystem.initialize();
        } else {
            console.warn('membershipSystem模块未加载');
        }
        
        // 初始化应用中心
        if (typeof appCenter !== 'undefined') {
            appCenter.initialize();
        } else {
            console.warn('appCenter模块未加载');
        }
        
        // 初始化资源中心（已替换为工具中心）
        if (typeof resourceCenter !== 'undefined') {
            resourceCenter.initialize();
        } else {
            console.warn('resourceCenter模块未加载');
        }
        
        // 初始化工具管理系统
        if (typeof toolManager !== 'undefined') {
            toolManager.initialize();
        } else {
            console.warn('toolManager模块未加载');
        }
        
        // 初始化搜索系统
        if (typeof searchSystem !== 'undefined') {
            searchSystem.initialize();
        } else {
            console.warn('searchSystem模块未加载');
        }
        
        // 初始化浏览器系统
        if (typeof browserSystem !== 'undefined') {
            browserSystem.init();
        } else {
            console.warn('browserSystem模块未加载');
        }
        
        // 初始化评论系统
        if (typeof commentSystem !== 'undefined') {
            // CommentSystem会在内部自动初始化
            console.log('commentSystem模块已加载');
        } else {
            console.warn('commentSystem模块未加载');
        }
        
        // 初始化反馈表单
        if (typeof utils !== 'undefined' && utils.initFeedbackForm) {
            utils.initFeedbackForm();
        } else {
            console.warn('utils模块未加载或initFeedbackForm方法不存在');
        }
        
        console.log('所有功能模块已初始化');
    } catch (error) {
        console.error('模块初始化失败:', error);
        // 显示初始化失败通知
        if (typeof notificationSystem !== 'undefined' && notificationSystem.isInitialized) {
            notificationSystem.showNotification('部分模块初始化失败，请刷新页面重试', 'error');
        }
    }
}

// 全局函数：显示收藏夹
window.showFavorites = function() {
    if (typeof resourceCenter !== 'undefined') {
        resourceCenter.showFavorites();
    } else {
        console.error('resourceCenter模块未加载');
    }
};

// 全局函数：显示资源库
window.showResources = function() {
    if (typeof resourceCenter !== 'undefined') {
        resourceCenter.showResources();
    } else {
        console.error('resourceCenter模块未加载');
    }
};

// 工具函数已移至 utils.js 模块
// window.utils 由 utils.js 提供

// 添加安全的onbeforeunload事件监听器
document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('beforeunload', function(event) {
        try {
            // 检查是否存在spyCache对象，如果存在则保存
            if (typeof window.spyCache !== 'undefined' && window.spyCache !== null) {
                console.log('检测到spyCache，尝试保存...');
                // 尝试保存，但不抛出错误
                try {
                    localStorage.setItem('spyCacheBackup', JSON.stringify(window.spyCache));
                    console.log('spyCache已备份到localStorage');
                } catch (e) {
                    console.log('保存spyCache失败，但已捕获错误:', e);
                }
            }
        } catch (e) {
            console.log('onbeforeunload事件处理程序中发生错误，但已捕获:', e);
        }
        // 不返回任何值，这样浏览器不会显示确认对话框
    });
});

