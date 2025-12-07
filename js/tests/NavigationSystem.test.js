/**
 * NavigationSystem模块单元测试
 * @fileoverview 测试NavigationSystem模块的功能
 */

describe('NavigationSystem', function() {
    let navigationSystem;
    let navLinks;
    let userMenu;
    
    beforeEach(function() {
        // 重置NavigationSystem实例
        if (window.NavigationSystem && window.NavigationSystem.getInstance) {
            navigationSystem = window.NavigationSystem.getInstance();
            // 重置路由列表
            navigationSystem.routes = {};
        }
        
        // 创建导航结构
        navLinks = document.createElement('div');
        navLinks.id = 'navLinks';
        navLinks.innerHTML = `
            <a href="#" class="nav-link primary" data-nav-link="tools">
                <i class="fas fa-tools"></i>
                <span>实用工具</span>
            </a>
            <a href="#" class="nav-link" data-nav-link="apps">
                <i class="fas fa-store"></i>
                <span>应用中心</span>
            </a>
        `;
        document.body.appendChild(navLinks);
        
        // 创建用户菜单
        userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        document.body.appendChild(userMenu);
    });
    
    afterEach(function() {
        // 移除导航结构
        document.body.removeChild(navLinks);
        document.body.removeChild(userMenu);
    });
    
    describe('初始化', function() {
        it('应该能够获取单例实例', function() {
            expect(navigationSystem).toBeDefined();
            const instance2 = window.NavigationSystem.getInstance();
            expect(navigationSystem).toBe(instance2);
        });
        
        it('应该能够初始化导航系统', function() {
            spyOn(navigationSystem, 'setupEventListeners');
            navigationSystem.initialize();
            expect(navigationSystem.setupEventListeners).toHaveBeenCalled();
        });
    });
    
    describe('路由管理', function() {
        it('应该能够注册路由', function() {
            const testRoute = {
                path: '/test',
                handler: function() {}
            };
            navigationSystem.registerRoute(testRoute.path, testRoute.handler);
            expect(navigationSystem.routes[testRoute.path]).toBe(testRoute.handler);
        });
        
        it('应该能够导航到路由', function() {
            const handler = jasmine.createSpy('handler');
            navigationSystem.registerRoute('/test', handler);
            navigationSystem.navigate('/test');
            expect(handler).toHaveBeenCalled();
        });
    });
    
    describe('导航链接管理', function() {
        it('应该能够高亮当前导航链接', function() {
            navigationSystem.initialize();
            navigationSystem.highlightNavLink('tools');
            const toolsLink = navLinks.querySelector('[data-nav-link="tools"]');
            expect(toolsLink.classList.contains('active')).toBe(true);
        });
        
        it('应该能够切换导航链接的激活状态', function() {
            navigationSystem.initialize();
            navigationSystem.highlightNavLink('tools');
            navigationSystem.highlightNavLink('apps');
            
            const toolsLink = navLinks.querySelector('[data-nav-link="tools"]');
            const appsLink = navLinks.querySelector('[data-nav-link="apps"]');
            
            expect(toolsLink.classList.contains('active')).toBe(false);
            expect(appsLink.classList.contains('active')).toBe(true);
        });
    });
    
    describe('响应式导航', function() {
        it('应该能够切换移动端菜单', function() {
            navigationSystem.initialize();
            spyOn(navLinks, 'classList');
            navigationSystem.toggleMobileMenu();
            expect(navLinks.classList.toggle).toHaveBeenCalledWith('show');
        });
        
        it('应该能够处理滚动效果', function() {
            const navbar = document.createElement('nav');
            navbar.id = 'navbar';
            document.body.appendChild(navbar);
            
            navigationSystem.initialize();
            spyOn(navbar.classList, 'add');
            spyOn(navbar.classList, 'remove');
            
            // 模拟滚动事件
            window.scrollY = 100;
            window.dispatchEvent(new Event('scroll'));
            
            expect(navbar.classList.add).toHaveBeenCalledWith('scrolled');
            
            // 模拟回到顶部
            window.scrollY = 0;
            window.dispatchEvent(new Event('scroll'));
            
            expect(navbar.classList.remove).toHaveBeenCalledWith('scrolled');
            
            document.body.removeChild(navbar);
        });
    });
});