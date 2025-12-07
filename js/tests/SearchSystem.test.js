/**
 * SearchSystem模块单元测试
 * @fileoverview 测试SearchSystem模块的功能
 */

describe('SearchSystem', function() {
    let searchSystem;
    let searchInput;
    let searchResults;
    
    beforeEach(function() {
        // 重置SearchSystem实例
        if (window.SearchSystem && window.SearchSystem.getInstance) {
            searchSystem = window.SearchSystem.getInstance();
            // 重置搜索结果
            searchSystem.searchResults = [];
        }
        
        // 创建搜索输入框
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'navSearchInput';
        searchInput.className = 'nav-search-input';
        document.body.appendChild(searchInput);
        
        // 创建搜索结果容器
        searchResults = document.createElement('div');
        searchResults.id = 'searchResults';
        searchResults.className = 'search-results';
        document.body.appendChild(searchResults);
    });
    
    afterEach(function() {
        // 移除搜索输入框
        document.body.removeChild(searchInput);
        // 移除搜索结果容器
        document.body.removeChild(searchResults);
    });
    
    describe('初始化', function() {
        it('应该能够获取单例实例', function() {
            expect(searchSystem).toBeDefined();
            const instance2 = window.SearchSystem.getInstance();
            expect(searchSystem).toBe(instance2);
        });
        
        it('应该能够初始化搜索系统', function() {
            spyOn(searchSystem, 'setupEventListeners');
            searchSystem.initialize();
            expect(searchSystem.setupEventListeners).toHaveBeenCalled();
        });
    });
    
    describe('搜索功能', function() {
        it('应该能够处理搜索输入', function() {
            searchSystem.initialize();
            spyOn(searchSystem, 'performSearch');
            searchInput.value = 'test search';
            searchInput.dispatchEvent(new Event('input'));
            expect(searchSystem.performSearch).toHaveBeenCalledWith('test search');
        });
        
        it('应该能够执行搜索并显示结果', function() {
            searchSystem.initialize();
            searchSystem.searchData = [
                { title: 'Test Item 1', description: 'First test item', category: 'tools' },
                { title: 'Test Item 2', description: 'Second test item', category: 'apps' }
            ];
            searchSystem.performSearch('test');
            expect(searchSystem.searchResults.length).toBe(2);
            expect(searchResults.children.length).toBe(2);
        });
        
        it('应该能够过滤搜索结果', function() {
            searchSystem.initialize();
            searchSystem.searchData = [
                { title: 'Test Item 1', description: 'First test item', category: 'tools' },
                { title: 'Test Item 2', description: 'Second test item', category: 'apps' }
            ];
            searchSystem.performSearch('tools');
            expect(searchSystem.searchResults.length).toBe(1);
            expect(searchResults.children.length).toBe(1);
            expect(searchResults.children[0].textContent).toContain('Test Item 1');
        });
    });
    
    describe('键盘导航', function() {
        it('应该能够处理键盘导航', function() {
            searchSystem.initialize();
            searchSystem.searchData = [
                { title: 'Test Item 1', description: 'First test item', category: 'tools' },
                { title: 'Test Item 2', description: 'Second test item', category: 'apps' }
            ];
            searchSystem.performSearch('test');
            
            spyOn(searchInput, 'focus');
            
            // 测试向下箭头
            const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            searchInput.dispatchEvent(downEvent);
            expect(searchResults.children[0].classList.contains('active')).toBe(true);
            
            // 测试向上箭头
            const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            searchInput.dispatchEvent(upEvent);
            expect(searchResults.children[0].classList.contains('active')).toBe(false);
        });
        
        it('应该能够处理Enter键选择搜索结果', function() {
            searchSystem.initialize();
            searchSystem.searchData = [
                { title: 'Test Item 1', description: 'First test item', category: 'tools' }
            ];
            searchSystem.performSearch('test');
            
            // 先向下箭头选择结果
            const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            searchInput.dispatchEvent(downEvent);
            
            // 测试Enter键
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            spyOn(searchResults.children[0], 'click');
            searchInput.dispatchEvent(enterEvent);
            expect(searchResults.children[0].click).toHaveBeenCalled();
        });
    });
    
    describe('搜索结果显示', function() {
        it('应该能够显示空搜索结果', function() {
            searchSystem.initialize();
            searchSystem.searchData = [];
            searchSystem.performSearch('test');
            expect(searchResults.children.length).toBe(1);
            expect(searchResults.children[0].textContent).toContain('No results found');
        });
        
        it('应该能够隐藏搜索结果', function() {
            searchSystem.initialize();
            searchSystem.hideSearchResults();
            expect(searchResults.style.display).toBe('none');
        });
    });
});