/**
 * ThemeSystem模块单元测试
 * @fileoverview 测试ThemeSystem模块的功能
 */

describe('ThemeSystem', function() {
    let themeSystem;
    let originalLocalStorage;
    
    beforeEach(function() {
        // 重置ThemeSystem实例
        if (window.ThemeSystem && window.ThemeSystem.getInstance) {
            themeSystem = window.ThemeSystem.getInstance();
            // 重置主题设置
            themeSystem.currentTheme = null;
        }
        
        // 保存原始localStorage
        originalLocalStorage = window.localStorage;
        // 创建模拟localStorage
        window.localStorage = {
            getItem: jasmine.createSpy('getItem').and.returnValue(null),
            setItem: jasmine.createSpy('setItem')
        };
        
        // 创建测试样式
        const styleElement = document.createElement('style');
        styleElement.id = 'theme-variables';
        document.head.appendChild(styleElement);
    });
    
    afterEach(function() {
        // 恢复原始localStorage
        window.localStorage = originalLocalStorage;
        
        // 移除测试样式
        const styleElement = document.getElementById('theme-variables');
        if (styleElement) {
            document.head.removeChild(styleElement);
        }
    });
    
    describe('初始化', function() {
        it('应该能够获取单例实例', function() {
            expect(themeSystem).toBeDefined();
            const instance2 = window.ThemeSystem.getInstance();
            expect(themeSystem).toBe(instance2);
        });
        
        it('应该能够初始化主题系统', function() {
            spyOn(themeSystem, 'detectSystemTheme');
            spyOn(themeSystem, 'applyTheme');
            themeSystem.initialize();
            expect(themeSystem.detectSystemTheme).toHaveBeenCalled();
            expect(themeSystem.applyTheme).toHaveBeenCalled();
        });
    });
    
    describe('主题管理', function() {
        it('应该能够注册主题', function() {
            const testTheme = {
                name: 'testTheme',
                variables: {
                    '--primary-color': '#ff0000',
                    '--secondary-color': '#00ff00'
                }
            };
            themeSystem.registerTheme(testTheme);
            expect(themeSystem.themes['testTheme']).toEqual(testTheme);
        });
        
        it('应该能够应用主题', function() {
            const testTheme = {
                name: 'testTheme',
                variables: {
                    '--primary-color': '#ff0000',
                    '--secondary-color': '#00ff00'
                }
            };
            themeSystem.registerTheme(testTheme);
            themeSystem.applyTheme('testTheme');
            expect(themeSystem.currentTheme).toBe('testTheme');
            expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'testTheme');
        });
        
        it('应该能够切换主题', function() {
            const lightTheme = {
                name: 'light',
                variables: {
                    '--primary-color': '#ffffff',
                    '--secondary-color': '#000000'
                }
            };
            const darkTheme = {
                name: 'dark',
                variables: {
                    '--primary-color': '#000000',
                    '--secondary-color': '#ffffff'
                }
            };
            themeSystem.registerTheme(lightTheme);
            themeSystem.registerTheme(darkTheme);
            
            themeSystem.applyTheme('light');
            expect(themeSystem.currentTheme).toBe('light');
            
            themeSystem.toggleTheme();
            expect(themeSystem.currentTheme).toBe('dark');
            
            themeSystem.toggleTheme();
            expect(themeSystem.currentTheme).toBe('light');
        });
    });
    
    describe('系统主题检测', function() {
        it('应该能够检测系统主题偏好', function() {
            // 模拟系统深色主题偏好
            const mediaQueryList = {
                matches: true
            };
            spyOn(window, 'matchMedia').and.returnValue(mediaQueryList);
            
            const systemTheme = themeSystem.detectSystemTheme();
            expect(systemTheme).toBe('dark');
        });
    });
});