/**
 * 工具函数库 - 提供通用的工具函数支持
 * @module UtilsLibrary
 */

// 兼容性修复
(function() {
    // Element.prototype.closest
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }

    // Array.prototype.find
    if (!Array.prototype.find) {
        Array.prototype.find = function(predicate) {
            if (this === null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        };
    }
    
    // Array.prototype.includes
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement, fromIndex) {
            var O = Object(this);
            var len = O.length >>> 0;
            if (len === 0) {
                return false;
            }
            var n = fromIndex | 0;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            while (k < len) {
                if (sameValueZero(O[k], searchElement)) {
                    return true;
                }
                k++;
            }
            return false;
        };
    }
    
    // Array.prototype.forEach
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            var T, k;
            if (this == null) {
                throw new TypeError(' this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== "function") {
                throw new TypeError(callback + ' is not a function');
            }
            if (arguments.length > 1) {
                T = thisArg;
            }
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }
})();

/**
 * 工具函数库
 * @namespace utils
 */
const utils = {
    /**
     * 格式化日期
     * @param {Date|string|number} date - 日期对象、字符串或时间戳
     * @returns {string} 格式化后的日期字符串
     */
    formatDate: function(date) {
        return new Date(date).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * 深拷贝对象
     * @param {Object} obj - 要拷贝的对象
     * @returns {Object} 拷贝后的对象
     */
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 防抖处理后的函数
     */
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
    
    /**
     * 节流函数
     * @param {Function} func - 要执行的函数
     * @param {number} limit - 时间限制（毫秒）
     * @returns {Function} 节流处理后的函数
     */
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
    },

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateUUID: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * 切换认证选项卡
     * @param {string} tabName - 选项卡名称（login, register, reset）
     */
    switchAuthTab: function(tabName) {
        // 隐藏所有选项卡内容
        const tabContents = document.querySelectorAll('.modal-body');
        tabContents.forEach(content => {
            content.style.display = 'none';
        });
        
        // 移除所有选项卡的激活状态
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 显示选中的选项卡内容
        const selectedContent = document.getElementById(tabName + 'Form');
        if (selectedContent) {
            selectedContent.style.display = 'block';
        }
        
        // 激活选中的选项卡
        const selectedTab = document.getElementById(tabName + 'Tab');
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
    },

    /**
     * 清除浏览器历史记录
     */
    clearBrowserHistory: function() {
        // 这里可以实现清除浏览器历史记录的逻辑
        console.log('清除浏览器历史记录');
        // 例如：history.clear();
    },

    /**
     * 切换书签面板
     */
    toggleBookmarksPanel: function() {
        // 这里可以实现切换书签面板的逻辑
        console.log('切换书签面板');
    },

    /**
     * 切换历史记录面板
     */
    toggleHistoryPanel: function() {
        // 这里可以实现切换历史记录面板的逻辑
        console.log('切换历史记录面板');
    },

    /**
     * 获取URL参数
     * @param {string} name - 参数名称
     * @returns {string|null} 参数值
     */
    getURLParam: function(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    /**
     * 验证邮箱格式
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * 验证手机号格式
     * @param {string} phone - 手机号
     * @returns {boolean} 是否有效
     */
    validatePhone: function(phone) {
        const re = /^1[3-9]\d{9}$/;
        return re.test(phone);
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 切换密码显示/隐藏
     * @param {string} inputId - 密码输入框的ID
     */
    togglePassword: function(inputId) {
        const input = document.getElementById(inputId);
        const toggleBtn = input.nextElementSibling;
        const icon = toggleBtn.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
};

// 导出工具函数库
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return utils; });
} else {
    window.utils = utils;
    // 将常用函数绑定到全局作用域，方便HTML中直接调用
    window.switchAuthTab = utils.switchAuthTab;
    window.clearBrowserHistory = utils.clearBrowserHistory;
    window.toggleBookmarksPanel = utils.toggleBookmarksPanel;
    window.toggleHistoryPanel = utils.toggleHistoryPanel;
    window.togglePassword = utils.togglePassword;
    window.openLoginModal = utils.openLoginModal;
    window.openRegisterModal = utils.openRegisterModal;
    window.uploadResource = utils.uploadResource;
}

// 打开登录模态框
utils.openLoginModal = function() {
    if (window.modalSystem) {
        window.modalSystem.openModal('loginModal');
    } else {
        console.error('ModalSystem未加载');
    }
};

// 打开注册模态框
utils.openRegisterModal = function() {
    if (window.modalSystem) {
        window.modalSystem.openModal('registerModal');
    } else {
        console.error('ModalSystem未加载');
    }
};

// 上传资源
utils.uploadResource = function() {
    if (window.resourceManager) {
        window.resourceManager.uploadResource();
    } else {
        console.error('ResourceManager未加载');
    }
};


