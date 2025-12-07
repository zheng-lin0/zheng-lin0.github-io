/**
 * ModalSystem模块单元测试
 * @fileoverview 测试ModalSystem模块的功能
 */

describe('ModalSystem', function() {
    let modalSystem;
    let modalElement;
    
    beforeEach(function() {
        // 重置ModalSystem实例
        if (window.ModalSystem && window.ModalSystem.getInstance) {
            modalSystem = window.ModalSystem.getInstance();
            // 清空模态框列表
            modalSystem.modals = {};
        }
        
        // 创建测试模态框元素
        modalElement = document.createElement('div');
        modalElement.id = 'testModal';
        modalElement.className = 'modal';
        modalElement.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Test Modal</h3>
                    <button class="modal-close" data-modal-close="testModal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Test modal content</p>
                </div>
            </div>
        `;
        document.body.appendChild(modalElement);
    });
    
    afterEach(function() {
        // 移除测试模态框元素
        document.body.removeChild(modalElement);
    });
    
    describe('初始化', function() {
        it('应该能够获取单例实例', function() {
            expect(modalSystem).toBeDefined();
            const instance2 = window.ModalSystem.getInstance();
            expect(modalSystem).toBe(instance2);
        });
        
        it('应该能够初始化模态框系统', function() {
            spyOn(modalSystem, 'initializeModals');
            modalSystem.initialize();
            expect(modalSystem.initializeModals).toHaveBeenCalled();
        });
    });
    
    describe('模态框管理', function() {
        it('应该能够注册模态框', function() {
            modalSystem.registerModal('testModal');
            expect(modalSystem.modals['testModal']).toBeDefined();
            expect(modalSystem.modals['testModal'].element).toBe(modalElement);
        });
        
        it('应该能够打开模态框', function() {
            modalSystem.registerModal('testModal');
            modalSystem.open('testModal');
            expect(modalElement.style.display).toBe('block');
            expect(document.body.style.overflow).toBe('hidden');
        });
        
        it('应该能够关闭模态框', function() {
            modalSystem.registerModal('testModal');
            modalSystem.open('testModal');
            modalSystem.close('testModal');
            expect(modalElement.style.display).toBe('none');
            expect(document.body.style.overflow).not.toBe('hidden');
        });
        
        it('应该能够切换模态框状态', function() {
            modalSystem.registerModal('testModal');
            modalSystem.toggle('testModal');
            expect(modalElement.style.display).toBe('block');
            
            modalSystem.toggle('testModal');
            expect(modalElement.style.display).toBe('none');
        });
    });
    
    describe('事件处理', function() {
        it('应该能够触发模态框打开事件', function() {
            const callback = jasmine.createSpy('callback');
            document.addEventListener('modal:open', callback);
            
            modalSystem.registerModal('testModal');
            modalSystem.open('testModal');
            
            expect(callback).toHaveBeenCalled();
            document.removeEventListener('modal:open', callback);
        });
        
        it('应该能够触发模态框关闭事件', function() {
            const callback = jasmine.createSpy('callback');
            document.addEventListener('modal:close', callback);
            
            modalSystem.registerModal('testModal');
            modalSystem.open('testModal');
            modalSystem.close('testModal');
            
            expect(callback).toHaveBeenCalled();
            document.removeEventListener('modal:close', callback);
        });
    });
});