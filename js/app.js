// 应用入口文件

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('智能导航中心 v2.0 已加载');
    
    // 初始化所有功能模块
    initializeAllModules();
    
    // 设置事件监听
    setupEventListeners();
    
    // 启动性能监控
    startPerformanceMonitoring();
});

// 初始化所有功能模块
function initializeAllModules() {
    try {
        console.log('基础功能模块已初始化');
    } catch (error) {
        console.error('模块初始化失败:', error);
    }
}

// 设置事件监听
function setupEventListeners() {
    // 添加通用事件监听
    setupModalListeners();
    setupNavigationListeners();
    setupThemeToggle();
}

// 设置模态框事件监听
function setupModalListeners() {
    // 模态框关闭按钮事件
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // 点击模态框外部关闭
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = 'auto';
        }
    });
}

// 设置导航事件监听
function setupNavigationListeners() {
    // 导航链接点击事件
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            // 处理导航链接点击
            console.log('导航到:', this.textContent);
        });
    });
}

// 设置主题切换
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // 更新主题图标
            this.querySelector('i').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        });
    }
    
    // 加载保存的主题
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// 启动性能监控
function startPerformanceMonitoring() {
    if (typeof monitorPerformance !== 'undefined') {
        try {
            monitorPerformance();
        } catch (error) {
            console.error('性能监控启动失败:', error);
        }
    }
}

// 工具函数
window.utils = {
    // 格式化日期
    formatDate: function(date) {
        return new Date(date).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // 显示通知
    showNotification: function(message, type = 'info') {
        // 简单的通知实现
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },
    
    // 深拷贝对象
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // 防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};
