/**
 * 工具管理模块 - 处理工具的展示、分类和使用逻辑
 * @module ToolManager
 */

class ToolManager {
    constructor() {
        this.tools = this.initTools();
        this.currentUser = null;
        this.userManagement = null;
        this.currentSortOption = 'popular'; // 默认按受欢迎程度排序
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.setupToolEventDelegation();
                this.loadTools();
                this.initializeUserSystem();
            });
        } else {
            this.setupEventListeners();
            this.setupToolEventDelegation();
            this.loadTools();
            this.initializeUserSystem();
        }
    }

    /**
     * 初始化默认工具列表
     */
    initTools() {
        return [
            {
                id: 'text-to-speech',
                name: '文字转语音',
                description: '将文字转换为自然流畅的语音',
                category: 'converter',
                icon: 'fa-comment-dots',
                usageCount: 1250,
                rating: 4.8,
                requiredLevel: 1,
                features: ['多语言支持', '语速调节', '音量控制']
            },
            {
                id: 'calculator',
                name: '智能计算器',
                description: '支持基本计算和科学计算的多功能计算器',
                category: 'calculator',
                icon: 'fa-calculator',
                usageCount: 2890,
                rating: 4.9,
                requiredLevel: 1,
                features: ['基本运算', '科学计算', '历史记录']
            },
            {
                id: 'unit-converter',
                name: '单位转换',
                description: '快速转换各种度量单位',
                category: 'converter',
                icon: 'fa-exchange-alt',
                usageCount: 1870,
                rating: 4.7,
                requiredLevel: 1,
                features: ['长度转换', '重量转换', '温度转换', '面积转换']
            },
            {
                id: 'password-generator',
                name: '密码生成器',
                description: '生成安全复杂的随机密码',
                category: 'generator',
                icon: 'fa-key',
                usageCount: 2130,
                rating: 4.6,
                requiredLevel: 1,
                features: ['自定义长度', '包含特殊字符', '复制到剪贴板']
            },
            {
                id: 'qr-code-generator',
                name: '二维码生成器',
                description: '将文本或链接转换为二维码',
                category: 'generator',
                icon: 'fa-qrcode',
                usageCount: 1560,
                rating: 4.5,
                requiredLevel: 2,
                features: ['自定义颜色', 'Logo添加', '多种格式导出']
            },
            {
                id: 'age-calculator',
                name: '年龄计算器',
                description: '计算年龄、月份和天数',
                category: 'calculator',
                icon: 'fa-birthday-cake',
                usageCount: 980,
                rating: 4.4,
                requiredLevel: 1,
                features: ['精确计算', '生日提醒', '时区支持']
            },
            {
                id: 'file-converter',
                name: '文件格式转换',
                description: '在线转换各种文件格式',
                category: 'converter',
                icon: 'fa-file-export',
                usageCount: 1780,
                rating: 4.3,
                requiredLevel: 3,
                features: ['文档转换', '图片转换', '视频转换']
            },
            {
                id: 'image-resizer',
                name: '图片尺寸调整',
                description: '调整图片大小和裁剪图片',
                category: 'utilities',
                icon: 'fa-images',
                usageCount: 1450,
                rating: 4.6,
                requiredLevel: 2,
                features: ['批量调整', '自定义尺寸', '保持比例']
            },
            {
                id: 'document-editor',
                name: '在线文档编辑器',
                description: '创建、编辑和共享文档',
                category: 'productivity',
                icon: 'fa-file-alt',
                usageCount: 1980,
                rating: 4.7,
                requiredLevel: 4,
                features: ['富文本编辑', '多人协作', '云存储']
            },
            {
                id: 'ai-assistant',
                name: '智能AI助手',
                description: '提供智能问答和辅助创作服务',
                category: 'ai',
                icon: 'fa-robot',
                usageCount: 3450,
                rating: 4.9,
                requiredLevel: 6,
                features: ['自然语言处理', '创意写作', '问题解答']
            }
        ];
    }

    /**
     * 初始化用户系统
     */
    initializeUserSystem() {
        if (window.userManagement) {
            this.userManagement = window.userManagement;
            this.currentUser = this.userManagement.getCurrentUser();
            
            // 加载用户会员信息
            this.userMembership = window.membershipSystem ? window.membershipSystem.getUserMembership(this.currentUser?.username || '') : null;
        } else {
            setTimeout(() => {
                this.initializeUserSystem();
            }, 100);
        }
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 工具搜索事件
        const searchInput = document.getElementById('toolSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTools(e.target.value);
            });
        }

        // 工具筛选事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterTools(e.target.dataset.filter);
            });
        });

        // 工具排序事件
        document.querySelectorAll('.sort-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const sortOption = e.currentTarget.dataset.sort;
                this.setToolSort(sortOption);
            });
        });

        // 用户登录状态变化监听
        document.addEventListener('userLoggedIn', (e) => {
            this.currentUser = e.detail;
        });

        document.addEventListener('userLoggedOut', () => {
            this.currentUser = null;
        });
    }

    /**
     * 初始化模块
     */
    initialize() {
        console.log('ToolManager模块初始化完成');
        // 执行完整的初始化逻辑
        this.setupEventListeners();
        this.setupToolEventDelegation();
        this.loadTools();
        this.initializeUserSystem();
    }

    /**
     * 设置工具卡片事件委托
     */
    setupToolEventDelegation() {
        const toolsGrid = document.getElementById('toolsGrid');
        if (toolsGrid) {
            toolsGrid.addEventListener('click', (e) => {
                const toolCard = e.target.closest('.tool-card');
                if (toolCard) {
                    const toolId = toolCard.dataset.toolId;
                    this.openTool(toolId);
                }
            });
        }
    }

    /**
     * 加载并显示工具
     */
    loadTools() {
        const toolsGrid = document.getElementById('toolsGrid');
        if (!toolsGrid) return;

        let filteredTools = this.tools;

        // 应用筛选
        if (this.currentFilter !== 'all') {
            filteredTools = filteredTools.filter(tool => tool.category === this.currentFilter);
        }

        // 应用排序
        filteredTools = this.sortTools(filteredTools, this.currentSortOption);

        // 渲染工具卡片
        toolsGrid.innerHTML = filteredTools.map(tool => this.createToolCard(tool)).join('');
    }

    /**
     * 创建工具卡片HTML
     */
    createToolCard(tool) {
        const canUse = this.checkToolAccess(tool);
        return `
            <div class="tool-card ${!canUse ? 'tool-locked' : ''}" data-tool-id="${tool.id}">
                <div class="tool-card-header">
                    <div class="tool-icon">
                        <i class="fas ${tool.icon}"></i>
                    </div>
                    <div class="tool-meta">
                        <span class="tool-rating">
                            <i class="fas fa-star"></i> ${tool.rating}
                        </span>
                        <span class="tool-usage">
                            <i class="fas fa-eye"></i> ${tool.usageCount}
                        </span>
                    </div>
                </div>
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-description">${tool.description}</p>
                <div class="tool-category">
                    <span class="category-badge">${this.getCategoryName(tool.category)}</span>
                    ${!canUse ? `<span class="member-level">需要会员等级 ${tool.requiredLevel || 1}</span>` : ''}
                </div>
                <div class="tool-features">
                    ${tool.features.slice(0, 2).map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    ${tool.features.length > 2 ? `<span class="feature-more">+${tool.features.length - 2}</span>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * 搜索工具
     */
    searchTools(query) {
        const toolsGrid = document.getElementById('toolsGrid');
        if (!toolsGrid) return;

        const filteredTools = this.tools.filter(tool => 
            tool.name.toLowerCase().includes(query.toLowerCase()) ||
            tool.description.toLowerCase().includes(query.toLowerCase())
        );

        toolsGrid.innerHTML = filteredTools.map(tool => this.createToolCard(tool)).join('');
    }

    /**
     * 筛选工具
     */
    filterTools(filter) {
        this.currentFilter = filter;
        
        // 更新筛选按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.loadTools();
    }

    /**
     * 排序工具
     */
    sortTools(tools, sortOption) {
        this.currentSortOption = sortOption;

        // 更新排序按钮状态
        document.querySelectorAll('.sort-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-sort="${sortOption}"]`).classList.add('active');

        const sortedTools = [...tools];

        switch (sortOption) {
            case 'popular':
                return sortedTools.sort((a, b) => b.usageCount - a.usageCount);
            case 'newest':
                return sortedTools.sort((a, b) => b.id.localeCompare(a.id));
            case 'name':
                return sortedTools.sort((a, b) => a.name.localeCompare(b.name));
            case 'rating':
                return sortedTools.sort((a, b) => b.rating - a.rating);
            default:
                return sortedTools;
        }
    }

    /**
     * 设置工具排序
     */
    setToolSort(sortOption) {
        this.loadTools();
    }

    /**
     * 打开工具
     */
    openTool(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool) return;

        if (!this.checkToolAccess(tool)) {
            // 显示升级提示
            if (window.modalSystem) {
                window.modalSystem.openModal('upgradeModal');
            } else {
                alert('您的会员等级不足以使用此工具，请升级会员以获得更多特权！');
            }
            return;
        }

        // 记录工具使用
        this.recordToolUsage(toolId);
        
        // 如果已登录，增加用户积分
        if (this.currentUser && window.membershipSystem) {
            window.membershipSystem.updatePoints(this.currentUser.username, 1); // 使用工具获得1积分
        }

        // 这里可以打开工具模态框或跳转到工具页面
        console.log('打开工具:', tool);
        this.showToolModal(tool);
    }

    /**
     * 显示工具模态框
     */
    showToolModal(tool) {
        // 创建临时模态框显示工具信息
        const modalContent = `
            <div class="tool-modal-content">
                <div class="tool-modal-header">
                    <div class="tool-modal-icon">
                        <i class="fas ${tool.icon}"></i>
                    </div>
                    <h2>${tool.name}</h2>
                    <button class="modal-close" onclick="closeToolModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="tool-modal-body">
                    <p>${tool.description}</p>
                    <div class="tool-modal-features">
                        <h3>功能特点</h3>
                        <ul>
                            ${tool.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="tool-modal-actions">
                        <button class="btn btn-primary" onclick="useTool('${tool.id}')">
                            <i class="fas fa-play"></i> 开始使用
                        </button>
                        <button class="btn btn-secondary" onclick="closeToolModal()">
                            <i class="fas fa-times"></i> 关闭
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 创建模态框元素
        const modal = document.createElement('div');
        modal.className = 'tool-modal';
        modal.innerHTML = modalContent;
        modal.id = 'toolModal';

        // 添加到页面
        document.body.appendChild(modal);

        // 添加关闭事件
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeToolModal();
            }
        });
    }

    /**
     * 获取工具列表
     */
    getTools() {
        return this.tools;
    }

    /**
     * 根据ID获取工具
     */
    getToolById(toolId) {
        return this.tools.find(tool => tool.id === toolId);
    }

    /**
     * 检查用户是否有权限使用工具
     */
    checkToolAccess(tool) {
        if (!this.currentUser) {
            return (tool.requiredLevel || 1) <= 1;
        }

        // 使用MembershipSystem的权限检查API
        if (window.membershipSystem) {
            return window.membershipSystem.hasToolPermission(this.currentUser.username, tool.id);
        }

        // 降级方案：直接比较会员等级
        const userPoints = this.userMembership?.points || 0;
        const memberLevel = window.membershipSystem ? window.membershipSystem.getMemberLevel(userPoints) : { level: 1 };
        return memberLevel.level >= (tool.requiredLevel || 1);
    }

    /**
     * 记录工具使用
     */
    recordToolUsage(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (tool) {
            tool.usageCount++;
            // 这里可以将使用记录保存到localStorage或服务器
            localStorage.setItem('toolUsage', JSON.stringify(this.tools));
        }
    }

    /**
     * 获取分类名称
     */
    getCategoryName(category) {
        const categoryNames = {
            'converter': '格式转换',
            'calculator': '计算器',
            'generator': '生成器',
            'analyzer': '分析工具',
            'utilities': '实用工具'
        };
        return categoryNames[category] || category;
    }
}

// 创建单例实例
const toolManager = new ToolManager();

// 确保模块加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 由app.js统一管理模块初始化
});

// 导出单例实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = toolManager;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return toolManager; });
} else {
    window.toolManager = toolManager;
    
    // 添加全局函数
    window.openTool = function(toolId) {
        if (window.toolManager) {
            window.toolManager.openTool(toolId);
        }
    };
    
    window.closeToolModal = function() {
        const modal = document.getElementById('toolModal');
        if (modal) {
            modal.remove();
        }
    };
    
    window.useTool = function(toolId) {
        console.log('使用工具:', toolId);
        
        // 获取工具信息
        const tool = window.toolManager.getToolById(toolId);
        if (!tool) {
            console.error('工具不存在:', toolId);
            alert('工具不存在，请稍后重试');
            return;
        }
        
        // 关闭工具信息模态框
        window.closeToolModal();
        
        // 根据工具ID加载对应的工具组件
        loadToolComponent(toolId, tool);
    };
    
    // 加载工具组件
    function loadToolComponent(toolId, tool) {
        // 创建工具组件容器
        const toolContainer = document.createElement('div');
        toolContainer.className = 'tool-component-container';
        toolContainer.id = 'toolComponentContainer';
        
        // 根据工具ID加载不同的工具组件
        switch(toolId) {
            case 'text-to-speech':
                if (typeof window.textToSpeech === 'undefined') {
                    window.textToSpeech = new window.TextToSpeech();
                }
                window.textToSpeech.init();
                
                // 创建工具模态框
                const ttsModal = document.createElement('div');
                ttsModal.className = 'tool-modal';
                ttsModal.innerHTML = `
                    <div class="tool-modal-content">
                        <div class="tool-modal-header">
                            <div class="tool-modal-icon">
                                <i class="fas ${tool.icon}"></i>
                            </div>
                            <h2>${tool.name}</h2>
                            <button class="modal-close" onclick="closeToolComponent()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="tool-modal-body">
                            ${window.textToSpeech.renderControls()}
                        </div>
                    </div>
                `;
                
                ttsModal.id = 'toolComponentModal';
                document.body.appendChild(ttsModal);
                
                // 显示模态框
                ttsModal.classList.add('show');
                
                // 添加关闭事件
                ttsModal.addEventListener('click', (e) => {
                    if (e.target === ttsModal) {
                        closeToolComponent();
                    }
                });
                
                // 设置事件监听
                window.textToSpeech.setupEventListeners();
                break;
                
            case 'calculator':
                if (typeof window.calculator === 'undefined') {
                    window.calculator = new window.Calculator();
                }
                
                // 创建工具模态框
                const calcModal = document.createElement('div');
                calcModal.className = 'tool-modal';
                calcModal.innerHTML = `
                    <div class="tool-modal-content">
                        <div class="tool-modal-header">
                            <div class="tool-modal-icon">
                                <i class="fas ${tool.icon}"></i>
                            </div>
                            <h2>${tool.name}</h2>
                            <button class="modal-close" onclick="closeToolComponent()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="tool-modal-body">
                            ${window.calculator.renderControls()}
                        </div>
                    </div>
                `;
                
                calcModal.id = 'toolComponentModal';
                document.body.appendChild(calcModal);
                
                // 显示模态框
                calcModal.classList.add('show');
                
                // 添加关闭事件
                calcModal.addEventListener('click', (e) => {
                    if (e.target === calcModal) {
                        closeToolComponent();
                    }
                });
                
                // 设置事件监听
                window.calculator.setupEventListeners();
                break;
                
            case 'unit-converter':
                if (typeof window.unitConverter === 'undefined') {
                    window.unitConverter = new window.UnitConverter();
                }
                
                // 创建工具模态框
                const unitModal = document.createElement('div');
                unitModal.className = 'tool-modal';
                unitModal.innerHTML = `
                    <div class="tool-modal-content">
                        <div class="tool-modal-header">
                            <div class="tool-modal-icon">
                                <i class="fas ${tool.icon}"></i>
                            </div>
                            <h2>${tool.name}</h2>
                            <button class="modal-close" onclick="closeToolComponent()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="tool-modal-body">
                            ${window.unitConverter.renderControls()}
                        </div>
                    </div>
                `;
                
                unitModal.id = 'toolComponentModal';
                document.body.appendChild(unitModal);
                
                // 显示模态框
                unitModal.classList.add('show');
                
                // 添加关闭事件
                unitModal.addEventListener('click', (e) => {
                    if (e.target === unitModal) {
                        closeToolComponent();
                    }
                });
                
                // 设置事件监听
                window.unitConverter.setupEventListeners();
                break;

            case 'password-generator':
                if (typeof window.passwordGenerator === 'undefined') {
                    window.passwordGenerator = new window.PasswordGenerator();
                }

                // 创建工具模态框
                const passwordModal = document.createElement('div');
                passwordModal.className = 'tool-modal';
                passwordModal.innerHTML = `
                    <div class="tool-modal-content">
                        <div class="tool-modal-header">
                            <div class="tool-modal-icon">
                                <i class="fas ${tool.icon}"></i>
                            </div>
                            <h2>${tool.name}</h2>
                            <button class="modal-close" onclick="closeToolComponent()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="tool-modal-body">
                            ${window.passwordGenerator.renderControls()}
                        </div>
                    </div>
                `;

                passwordModal.id = 'toolComponentModal';
                document.body.appendChild(passwordModal);
                
                // 显示模态框
                passwordModal.classList.add('show');

                // 添加关闭事件
                passwordModal.addEventListener('click', (e) => {
                    if (e.target === passwordModal) {
                        closeToolComponent();
                    }
                });

                // 设置事件监听
                window.passwordGenerator.setupEventListeners();
                break;

            case 'age-calculator':
                if (typeof window.ageCalculator === 'undefined') {
                    window.ageCalculator = new window.AgeCalculator();
                }

                // 创建工具模态框
                const ageModal = document.createElement('div');
                ageModal.className = 'tool-modal';
                ageModal.innerHTML = `
                    <div class="tool-modal-content">
                        <div class="tool-modal-header">
                            <div class="tool-modal-icon">
                                <i class="fas ${tool.icon}"></i>
                            </div>
                            <h2>${tool.name}</h2>
                            <button class="modal-close" onclick="closeToolComponent()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="tool-modal-body">
                            ${window.ageCalculator.renderControls()}
                        </div>
                    </div>
                `;

                ageModal.id = 'toolComponentModal';
                document.body.appendChild(ageModal);
                
                // 显示模态框
                ageModal.classList.add('show');

                // 添加关闭事件
                ageModal.addEventListener('click', (e) => {
                    if (e.target === ageModal) {
                        closeToolComponent();
                    }
                });

                // 设置事件监听
                window.ageCalculator.setupEventListeners();
                break;

            default:
                alert(`工具 ${tool.name} 正在开发中，敬请期待！`);
        }
    }
    
    // 关闭工具组件模态框
    window.closeToolComponent = function() {
        const modal = document.getElementById('toolComponentModal');
        if (modal) {
            modal.remove();
        }
    };
}
