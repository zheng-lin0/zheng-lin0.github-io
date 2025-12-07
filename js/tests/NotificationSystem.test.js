/**
 * NotificationSystem模块单元测试
 * @fileoverview 测试NotificationSystem模块的功能
 */

describe('NotificationSystem', function() {
    let notificationSystem;
    let container;
    
    beforeEach(function() {
        // 重置NotificationSystem实例
        if (window.NotificationSystem && window.NotificationSystem.getInstance) {
            notificationSystem = window.NotificationSystem.getInstance();
            // 重置通知列表
            notificationSystem.notifications = [];
        }
        
        // 创建通知容器
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    });
    
    afterEach(function() {
        // 移除通知容器
        document.body.removeChild(container);
    });
    
    describe('初始化', function() {
        it('应该能够获取单例实例', function() {
            expect(notificationSystem).toBeDefined();
            const instance2 = window.NotificationSystem.getInstance();
            expect(notificationSystem).toBe(instance2);
        });
        
        it('应该能够初始化通知系统', function() {
            notificationSystem.initialize();
            expect(notificationSystem.container).toBe(container);
        });
    });
    
    describe('通知管理', function() {
        it('应该能够显示通知', function() {
            notificationSystem.initialize();
            notificationSystem.show('Test notification', 'success', 2000);
            expect(container.children.length).toBe(1);
            expect(container.children[0].classList.contains('toast')).toBe(true);
            expect(container.children[0].classList.contains('toast-success')).toBe(true);
        });
        
        it('应该能够隐藏通知', function() {
            notificationSystem.initialize();
            const notification = notificationSystem.show('Test notification', 'success', 2000);
            notificationSystem.hide(notification.id);
            expect(notification.element.style.display).toBe('none');
        });
        
        it('应该能够自动隐藏通知', function(done) {
            notificationSystem.initialize();
            notificationSystem.show('Test notification', 'success', 500);
            
            setTimeout(function() {
                expect(container.children.length).toBe(0);
                done();
            }, 600);
        });
        
        it('应该能够限制通知数量', function() {
            notificationSystem.initialize();
            notificationSystem.maxNotifications = 2;
            
            for (let i = 0; i < 3; i++) {
                notificationSystem.show(`Test notification ${i}`, 'success', 2000);
            }
            
            expect(container.children.length).toBe(2);
            expect(notificationSystem.notifications.length).toBe(2);
        });
    });
    
    describe('通知类型', function() {
        it('应该支持不同类型的通知', function() {
            notificationSystem.initialize();
            
            const types = ['success', 'error', 'warning', 'info'];
            types.forEach(type => {
                notificationSystem.show(`Test ${type} notification`, type, 2000);
            });
            
            expect(container.children.length).toBe(types.length);
            
            types.forEach((type, index) => {
                expect(container.children[index].classList.contains(`toast-${type}`)).toBe(true);
            });
        });
    });
});