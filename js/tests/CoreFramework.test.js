/**
 * CoreFramework模块单元测试
 * @fileoverview 测试CoreFramework模块的功能
 */

// 测试环境准备
if (typeof window === 'undefined') {
    // 在Node.js环境中模拟浏览器API
    global.window = {};
    global.document = {
        addEventListener: function() {},
        removeEventListener: function() {}
    };
    global.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
}

// 加载CoreFramework模块
// 注意：在浏览器环境中需要确保CoreFramework已经加载

describe('CoreFramework', function() {
    let coreFramework;
    
    beforeEach(function() {
        // 重置CoreFramework实例
        if (window.CoreFramework && window.CoreFramework.getInstance) {
            coreFramework = window.CoreFramework.getInstance();
            // 重置所有模块
            coreFramework.modules = {};
            coreFramework.events = {};
        }
    });
    
    describe('初始化', function() {
        it('应该能够获取单例实例', function() {
            expect(coreFramework).toBeDefined();
            const instance2 = window.CoreFramework.getInstance();
            expect(coreFramework).toBe(instance2);
        });
        
        it('应该能够初始化核心框架', function() {
            spyOn(coreFramework, 'startPerformanceMonitoring');
            coreFramework.initialize();
            expect(coreFramework.startPerformanceMonitoring).toHaveBeenCalled();
            expect(coreFramework.isInitialized).toBe(true);
        });
    });
    
    describe('模块管理', function() {
        it('应该能够注册模块', function() {
            const testModule = {
                name: 'testModule',
                initialize: function() {},
                destroy: function() {}
            };
            coreFramework.registerModule('testModule', testModule);
            expect(coreFramework.modules['testModule']).toBe(testModule);
        });
        
        it('应该能够获取注册的模块', function() {
            const testModule = {
                name: 'testModule',
                initialize: function() {},
                destroy: function() {}
            };
            coreFramework.registerModule('testModule', testModule);
            const retrievedModule = coreFramework.getModule('testModule');
            expect(retrievedModule).toBe(testModule);
        });
        
        it('应该能够初始化模块', function() {
            const testModule = {
                name: 'testModule',
                initialize: jasmine.createSpy('initialize'),
                destroy: function() {}
            };
            coreFramework.registerModule('testModule', testModule);
            coreFramework.initializeModule('testModule');
            expect(testModule.initialize).toHaveBeenCalled();
        });
    });
    
    describe('事件系统', function() {
        it('应该能够添加事件监听器', function() {
            const callback = jasmine.createSpy('callback');
            coreFramework.on('testEvent', callback);
            expect(coreFramework.events['testEvent']).toContain(callback);
        });
        
        it('应该能够触发事件', function() {
            const callback = jasmine.createSpy('callback');
            coreFramework.on('testEvent', callback);
            coreFramework.emit('testEvent', 'testData');
            expect(callback).toHaveBeenCalledWith('testData');
        });
        
        it('应该能够移除事件监听器', function() {
            const callback = jasmine.createSpy('callback');
            coreFramework.on('testEvent', callback);
            coreFramework.off('testEvent', callback);
            coreFramework.emit('testEvent', 'testData');
            expect(callback).not.toHaveBeenCalled();
        });
    });
    
    describe('性能监控', function() {
        it('应该能够启动性能监控', function() {
            // 模拟performance API
            const originalPerformance = window.performance;
            window.performance = {
                mark: jasmine.createSpy('mark'),
                measure: jasmine.createSpy('measure'),
                getEntriesByType: function() { return []; }
            };
            
            coreFramework.startPerformanceMonitoring();
            expect(window.performance.mark).toHaveBeenCalledWith('coreFrameworkInitStart');
            
            // 恢复原始performance
            window.performance = originalPerformance;
        });
    });
});