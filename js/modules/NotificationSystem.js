/**
 * 通知系统 - 提供用户操作反馈的通知功能
 * @module NotificationSystem
 */

/**
 * 通知系统类
 * @class NotificationSystem
 */
class NotificationSystem {
    /**
     * 构造函数
     * @constructor
     */
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.isInitialized = false;
        
        // 默认配置
        this.config = {
            defaultDuration: 3000,
            position: 'top-right', // top-left, top-right, bottom-left, bottom-right
            maxNotifications: 5
        };
    }

    /**
     * 初始化通知系统
     * @public
     * @param {Object} [options] - 配置选项
     */
    initialize(options = {}) {
        if (this.isInitialized) {
            console.warn('NotificationSystem已经初始化');
            return;
        }

        try {
            // 合并配置
            this.config = { ...this.config, ...options };
            
            // 创建通知容器
            this.createContainer();
            
            this.isInitialized = true;
            console.log('NotificationSystem初始化成功');
        } catch (error) {
            console.error('NotificationSystem初始化失败:', error);
        }
    }

    /**
     * 创建通知容器
     * @private
     */
    createContainer() {
        // 检查是否已有容器
        let existingContainer = document.getElementById('notificationContainer');
        if (existingContainer) {
            this.container = existingContainer;
            return;
        }

        // 创建新容器
        this.container = document.createElement('div');
        this.container.id = 'notificationContainer';
        this.container.className = `notification-container notification-${this.config.position}`;
        
        // 添加基础样式
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 20px;
                max-width: 350px;
            }
            
            .notification-top-left {
                top: 0;
                left: 0;
            }
            
            .notification-top-right {
                top: 0;
                right: 0;
            }
            
            .notification-bottom-left {
                bottom: 0;
                left: 0;
            }
            
            .notification-bottom-right {
                bottom: 0;
                right: 0;
            }
            
            .notification {
                padding: 15px 20px;
                border-radius: 12px;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                color: white;
                font-size: 14px;
                line-height: 1.4;
                position: relative;
                overflow: hidden;
                animation: notificationSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                transform-origin: right top;
                transition: all 0.2s ease;
            }
            
            .notification:hover {
                transform: translateX(-5px) translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
            }
            
            .notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                animation: notificationProgressBar linear;
            }
            
            .notification-info {
                background-color: #1890ff;
            }
            
            .notification-success {
                background-color: #52c41a;
            }
            
            .notification-warning {
                background-color: #faad14;
            }
            
            .notification-error {
                background-color: #f5222d;
            }
            
            .notification-close {
                position: absolute;
                top: 8px;
                right: 12px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 14px;
                cursor: pointer;
                opacity: 0.7;
                padding: 4px 8px;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            
            .notification-close:hover {
                opacity: 1;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }
            
            @keyframes notificationSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%) translateY(20px) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translateX(0) translateY(0) scale(1);
                }
            }
            
            @keyframes notificationSlideOut {
                from {
                    opacity: 1;
                    transform: translateX(0) translateY(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%) translateY(20px) scale(0.8);
                }
            }
            
            @keyframes notificationProgressBar {
                from {
                    width: 0%;
                }
                to {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(this.container);
    }

    /**
     * 显示通知
     * @public
     * @param {string} message - 通知消息
     * @param {string} [type='info'] - 通知类型 (info, success, warning, error)
     * @param {Object} [options] - 通知选项
     * @param {number} [options.duration] - 显示持续时间（毫秒）
     * @param {Function} [options.onClose] - 关闭后的回调函数
     * @returns {string} 通知ID
     */
    showNotification(message, type = 'info', options = {}) {
        if (!this.isInitialized) {
            console.error('NotificationSystem尚未初始化');
            return null;
        }

        try {
            // 验证通知类型
            const validTypes = ['info', 'success', 'warning', 'error'];
            if (!validTypes.includes(type)) {
                console.warn(`无效的通知类型: ${type}, 使用默认类型: info`);
                type = 'info';
            }

            // 创建通知元素
            const notificationId = utils.generateUUID();
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.setAttribute('data-notification-id', notificationId);
            
            // 添加图标
            const icons = {
                info: 'fa-info-circle',
                success: 'fa-check-circle',
                warning: 'fa-exclamation-triangle',
                error: 'fa-times-circle'
            };
            
            // 设置消息内容
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas ${icons[type]}" style="font-size: 18px; flex-shrink: 0;"></i>
                    <div style="flex: 1;">${message}</div>
                    <button class="notification-close" aria-label="关闭通知">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

            // 设置关闭事件
            const closeButton = notification.querySelector('.notification-close');
            closeButton.addEventListener('click', () => {
                this.hideNotification(notificationId, options.onClose);
            });

            // 添加点击外部关闭功能（如果启用）
            if (options.closeOnClick !== false) {
                notification.addEventListener('click', () => {
                    this.hideNotification(notificationId, options.onClose);
                });
                // 阻止关闭按钮的事件冒泡
                closeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            // 添加到容器
            this.container.appendChild(notification);
            this.notifications.set(notificationId, notification);

            // 限制最大通知数量
            this.limitNotifications();

            // 设置自动关闭
            const duration = options.duration || this.config.defaultDuration;
            if (duration > 0) {
                // 创建进度条
                const progressBar = document.createElement('div');
                progressBar.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: rgba(255, 255, 255, 0.7);
                    width: 100%;
                    animation: notificationProgressBar ${duration}ms linear;
                    border-radius: 0 0 0 12px;
                `;
                notification.appendChild(progressBar);
                
                // 设置定时器关闭通知
                const timer = setTimeout(() => {
                    this.hideNotification(notificationId, options.onClose);
                }, duration);
                
                // 保存定时器引用
                notification.setAttribute('data-timer-id', timer.toString());
            }

            console.log(`通知显示: ${notificationId}`);
            return notificationId;
        } catch (error) {
            console.error('显示通知失败:', error);
            return null;
        }
    }

    /**
     * 隐藏通知
     * @private
     * @param {string} notificationId - 通知ID
     * @param {Function} [onClose] - 关闭后的回调函数
     */
    hideNotification(notificationId, onClose) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;

        try {
            // 添加淡出动画
            notification.style.animation = 'notificationSlideOut 0.3s ease-in forwards';
            
            // 动画结束后移除元素
            setTimeout(() => {
                notification.remove();
                this.notifications.delete(notificationId);
                
                // 执行回调函数
                if (typeof onClose === 'function') {
                    onClose(notificationId);
                }
                
                console.log(`通知隐藏: ${notificationId}`);
            }, 300);
        } catch (error) {
            console.error('隐藏通知失败:', error);
        }
    }

    /**
     * 限制最大通知数量
     * @private
     */
    limitNotifications() {
        while (this.notifications.size > this.config.maxNotifications) {
            // 获取最旧的通知
            const oldestNotification = this.container.firstChild;
            if (oldestNotification) {
                const notificationId = oldestNotification.getAttribute('data-notification-id');
                this.hideNotification(notificationId);
            }
        }
    }

    /**
     * 隐藏所有通知
     * @public
     */
    hideAllNotifications() {
        this.notifications.forEach((notification, notificationId) => {
            this.hideNotification(notificationId);
        });
    }

    /**
     * 获取当前通知数量
     * @public
     * @returns {number} 通知数量
     */
    getNotificationCount() {
        return this.notifications.size;
    }

    /**
     * 更新配置
     * @public
     * @param {Object} options - 配置选项
     */
    updateConfig(options) {
        this.config = { ...this.config, ...options };
        
        // 如果位置改变，更新容器类
        if (options.position) {
            this.container.className = `notification-container notification-${options.position}`;
        }
    }

    /**
     * 销毁通知系统
     * @public
     */
    destroy() {
        if (!this.isInitialized) return;

        try {
            // 隐藏所有通知
            this.hideAllNotifications();
            
            // 移除容器
            if (this.container) {
                this.container.remove();
                this.container = null;
            }
            
            this.isInitialized = false;
            console.log('NotificationSystem已销毁');
        } catch (error) {
            console.error('销毁NotificationSystem失败:', error);
        }
    }
}

// 导出单例
const notificationSystem = new NotificationSystem();

// 添加到全局对象以便其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = notificationSystem;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return notificationSystem; });
} else {
    window.notificationSystem = notificationSystem;
    
    // 全局显示通知函数，确保utils对象存在
    if (window.utils) {
        window.utils.showNotification = (message, type, options) => {
            return notificationSystem.showNotification(message, type, options);
        };
    }
}
