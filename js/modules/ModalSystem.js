/**
 * 模态框系统 - 统一的模态框管理系统，用于显示各种弹出窗口
 * @module ModalSystem
 */

/**
 * 模态框系统类
 * @class ModalSystem
 */
class ModalSystem {
    /**
     * 构造函数
     * @constructor
     */
    constructor() {
        this.modals = new Map();
        this.currentModal = null;
        this.isInitialized = false;
    }

    /**
     * 初始化模态框系统
     * @public
     */
    initialize() {
        if (this.isInitialized) {
            console.warn('ModalSystem已经初始化');
            return;
        }

        try {
            // 查找并注册所有模态框
            const modalElements = document.querySelectorAll('.modal');
            modalElements.forEach(modalElement => {
                const modalId = modalElement.id;
                this.registerModal(modalId, modalElement);
            });

            // 设置全局事件监听
            this.setupEventListeners();
            this.isInitialized = true;
            
            console.log('ModalSystem初始化成功');
        } catch (error) {
            console.error('ModalSystem初始化失败:', error);
        }
    }

    /**
     * 注册模态框
     * @public
     * @param {string} modalId - 模态框ID
     * @param {HTMLElement} modalElement - 模态框DOM元素
     */
    registerModal(modalId, modalElement) {
        if (this.modals.has(modalId)) {
            console.warn(`模态框 ${modalId} 已存在，将被覆盖`);
        }

        // 确保模态框有基本结构
        this.ensureModalStructure(modalElement);
        
        this.modals.set(modalId, modalElement);
        console.log(`模态框 ${modalId} 已注册`);
    }

    /**
     * 确保模态框具有正确的结构
     * @private
     * @param {HTMLElement} modalElement - 模态框DOM元素
     */
    ensureModalStructure(modalElement) {
        // 确保模态框有modal-content和modal-close
        let modalContent = modalElement.querySelector('.modal-content');
        if (!modalContent) {
            modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            // 将现有的子元素移动到modal-content中
            while (modalElement.firstChild) {
                modalContent.appendChild(modalElement.firstChild);
            }
            
            modalElement.appendChild(modalContent);
        }

        // 确保模态框有关闭按钮
        let closeButton = modalElement.querySelector('.modal-close');
        if (!closeButton) {
            closeButton = document.createElement('button');
            closeButton.className = 'modal-close';
            closeButton.innerHTML = '<i class="fas fa-times"></i>';
            closeButton.setAttribute('aria-label', '关闭模态框');
            
            // 添加关闭事件
            closeButton.addEventListener('click', () => {
                this.closeModal(modalElement.id);
            });
            
            // 将关闭按钮添加到modal-content的顶部
            modalContent.insertBefore(closeButton, modalContent.firstChild);
        }
    }

    /**
     * 设置事件监听
     * @private
     */
    setupEventListeners() {
        // 点击模态框外部关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal(this.currentModal);
            }
        });
    }

    /**
     * 打开模态框
     * @public
     * @param {string} modalId - 模态框ID
     * @param {Object} [options] - 打开选项
     * @param {Function} [options.onOpen] - 打开后的回调函数
     */
    openModal(modalId, options = {}) {
        const modalElement = this.modals.get(modalId);
        if (!modalElement) {
            console.warn(`模态框 ${modalId} 不存在或未注册`);
            return false;
        }

        try {
            // 关闭当前打开的模态框
            if (this.currentModal) {
                this.closeModal(this.currentModal);
            }

            // 显示模态框
            modalElement.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.currentModal = modalId;

            // 触发打开事件
            const event = new CustomEvent('modal:open', { 
                detail: { modalId, modalElement } 
            });
            document.dispatchEvent(event);

            // 执行回调函数
            if (typeof options.onOpen === 'function') {
                options.onOpen(modalElement);
            }

            console.log(`模态框 ${modalId} 已打开`);
            return true;
        } catch (error) {
            console.error(`打开模态框 ${modalId} 失败:`, error);
            return false;
        }
    }

    /**
     * 关闭模态框
     * @public
     * @param {string} modalId - 模态框ID
     * @param {Object} [options] - 关闭选项
     * @param {Function} [options.onClose] - 关闭后的回调函数
     */
    closeModal(modalId, options = {}) {
        const modalElement = this.modals.get(modalId);
        if (!modalElement) {
            console.warn(`模态框 ${modalId} 不存在或未注册`);
            return false;
        }

        try {
            // 隐藏模态框
            modalElement.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.currentModal = null;

            // 触发关闭事件
            const event = new CustomEvent('modal:close', { 
                detail: { modalId, modalElement } 
            });
            document.dispatchEvent(event);

            // 执行回调函数
            if (typeof options.onClose === 'function') {
                options.onClose(modalElement);
            }

            console.log(`模态框 ${modalId} 已关闭`);
            return true;
        } catch (error) {
            console.error(`关闭模态框 ${modalId} 失败:`, error);
            return false;
        }
    }

    /**
     * 获取当前打开的模态框
     * @public
     * @returns {string|null} 当前模态框ID或null
     */
    getCurrentModal() {
        return this.currentModal;
    }

    /**
     * 销毁模态框系统
     * @public
     */
    destroy() {
        // 关闭所有模态框
        this.modals.forEach((modalElement, modalId) => {
            this.closeModal(modalId);
        });

        // 清理资源
        this.modals.clear();
        this.currentModal = null;
        this.isInitialized = false;
        
        console.log('ModalSystem已销毁');
    }
}

// 导出单例
const modalSystem = new ModalSystem();

// 添加到全局对象以便其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = modalSystem;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return modalSystem; });
} else {
    window.modalSystem = modalSystem;
    
    // 全局打开模态框函数
    window.openModal = (modalId, options) => {
        return modalSystem.openModal(modalId, options);
    };
    
    // 全局关闭模态框函数
    window.closeModal = (modalId, options) => {
        return modalSystem.closeModal(modalId, options);
    };
}
