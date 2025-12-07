class ResourceManager {
    constructor() {
        this.resources = JSON.parse(localStorage.getItem('resources')) || [];
        this.currentUser = null;
        this.userManagement = null;
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.loadResources();
                this.initializeUserSystem();
            });
        } else {
            this.setupEventListeners();
            this.loadResources();
            this.initializeUserSystem();
        }
    }

    /**
     * 初始化用户系统
     */
    initializeUserSystem() {
        // 等待用户管理模块加载
        if (window.userManagement) {
            this.userManagement = window.userManagement;
            this.currentUser = this.userManagement.getCurrentUser();
            this.updateUploadSection();
            
            // 监听用户登录状态变化事件
            // 假设userManagement会触发'user:login'和'user:logout'事件
            document.addEventListener('user:login', () => {
                this.currentUser = this.userManagement.getCurrentUser();
                this.updateUploadSection();
            });
            
            document.addEventListener('user:logout', () => {
                this.currentUser = null;
                this.updateUploadSection();
            });
        } else {
            // 如果用户管理模块尚未加载，尝试在稍后加载
            setTimeout(() => {
                this.initializeUserSystem();
            }, 100);
        }
    }

    setupEventListeners() {
        // 资源上传表单事件监听
        document.getElementById('uploadForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadResource();
        });

        // 资源搜索事件监听
        document.getElementById('resourceSearch')?.addEventListener('input', (e) => {
            this.searchResources(e.target.value);
        });

        // 资源筛选事件监听
        document.querySelectorAll('.filter-btn')?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterResources(e.target.dataset.filter);
            });
        });

        // 用户登录状态变化监听
        document.addEventListener('userLoggedIn', (e) => {
            this.currentUser = e.detail;
            this.updateUploadSection();
        });

        document.addEventListener('userLoggedOut', () => {
            this.currentUser = null;
            this.updateUploadSection();
        });

        // 监听UserManagement的初始化完成事件
        document.addEventListener('userManagementInitialized', () => {
            this.initializeUserSystem();
        });
    }

    // 加载资源列表
    loadResources() {
        const resourcesGrid = document.getElementById('resourcesGrid');
        if (!resourcesGrid) return;

        if (this.resources.length === 0) {
            resourcesGrid.innerHTML = '<div class="no-resources">暂无资源，请先上传资源</div>';
            return;
        }

        resourcesGrid.innerHTML = this.resources.map(resource => this.createResourceCard(resource)).join('');
        this.attachResourceCardListeners();
    }

    // 创建资源卡片
    createResourceCard(resource) {
        // 获取资源类型对应的图标
        const getResourceIcon = (type) => {
            const icons = {
                document: 'fa-file-alt',
                video: 'fa-file-video',
                audio: 'fa-file-audio',
                software: 'fa-file-code',
                other: 'fa-file' 
            };
            return icons[type] || icons.other;
        };

        return `
            <div class="resource-card" data-id="${resource.id}">
                <div class="resource-icon ${resource.type}">
                    <i class="fas ${getResourceIcon(resource.type)}"></i>
                </div>
                <div class="resource-content">
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-meta">
                        <span class="resource-type">${this.getResourceTypeName(resource.type)}</span>
                        <span class="resource-uploader">上传者: ${resource.uploader}</span>
                        <span class="resource-date">上传于: ${new Date(resource.uploadDate).toLocaleDateString()}</span>
                        <span class="resource-downloads">下载: ${resource.downloads || 0}次</span>
                    </div>
                    <div class="resource-actions">
                        <button class="btn btn-sm btn-primary download-btn" onclick="resourceManager.downloadResource('${resource.id}')">
                            <i class="fas fa-download"></i> 下载
                        </button>
                        <button class="btn btn-sm btn-outline detail-btn" onclick="resourceManager.showResourceDetails('${resource.id}')">
                            <i class="fas fa-info"></i> 详情
                        </button>
                        ${this.currentUser && this.currentUser.username === resource.uploader ? `
                            <button class="btn btn-sm btn-danger delete-btn" onclick="resourceManager.deleteResource('${resource.id}')">
                                <i class="fas fa-trash"></i> 删除
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // 获取资源类型名称
    getResourceTypeName(type) {
        const typeNames = {
            document: '文档',
            video: '视频',
            audio: '音频',
            software: '软件',
            other: '其他'
        };
        return typeNames[type] || typeNames.other;
    }

    // 附加资源卡片事件监听器
    attachResourceCardListeners() {
        // 下载按钮事件
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const resourceId = e.currentTarget.closest('.resource-card').dataset.id;
                this.downloadResource(resourceId);
            });
        });

        // 详情按钮事件
        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const resourceId = e.currentTarget.closest('.resource-card').dataset.id;
                this.showResourceDetails(resourceId);
            });
        });

        // 删除按钮事件
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const resourceId = e.currentTarget.closest('.resource-card').dataset.id;
                this.deleteResource(resourceId);
            });
        });
    }

    // 上传资源
    uploadResource() {
        // 检查用户是否登录 - 直接从userManagement获取最新状态
        const currentUser = this.userManagement?.getCurrentUser();
        if (!currentUser) {
            openLoginModal();
            return;
        }

        // 获取表单数据
        const title = document.getElementById('resourceTitle')?.value;
        const description = document.getElementById('resourceDescription')?.value;
        const type = document.getElementById('resourceType')?.value;
        const link = document.getElementById('resourceLink')?.value;
        const tags = document.getElementById('resourceTags')?.value.split(',').map(tag => tag.trim()).filter(tag => tag);

        // 验证表单数据
        if (!title || !description || !type || !link) {
            alert('请填写所有必填字段');
            return;
        }

        // 验证链接格式
        if (!this.isValidUrl(link)) {
            alert('请输入有效的资源链接');
            return;
        }

        // 创建新资源
        const newResource = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            type: type,
            link: link.trim(),
            tags: tags || [],
            uploader: this.currentUser.username,
            uploadDate: Date.now(),
            downloads: 0
        };

        // 添加到资源列表
        this.resources.unshift(newResource);

        // 保存到本地存储
        this.saveResources();

        // 更新资源列表
        this.loadResources();

        // 显示成功消息
        if (window.notificationSystem) {
            window.notificationSystem.showNotification('资源上传成功！', 'success');
        } else {
            alert('资源上传成功！');
        }

        // 重置表单
        this.resetUploadForm();
    }

    // 重置上传表单
    resetUploadForm() {
        const form = document.getElementById('uploadForm');
        if (form) {
            form.reset();
        }
    }

    // 下载资源
    downloadResource(resourceId) {
        // 检查用户是否登录 - 直接从userManagement获取最新状态
        const currentUser = this.userManagement?.getCurrentUser();
        if (!currentUser) {
            openLoginModal();
            return;
        }

        const resource = this.resources.find(r => r.id === resourceId);
        if (!resource) {
            alert('资源不存在');
            return;
        }

        // 获取用户下载速度限制
        const downloadSpeed = this.getCurrentUserDownloadSpeed();

        // 显示下载信息
        if (window.notificationSystem) {
            window.notificationSystem.showNotification(
                `正在下载资源: ${resource.title}\n您的当前下载速度: ${downloadSpeed}`, 
                'success'
            );
        } else {
            alert(`正在下载资源: ${resource.title}\n您的当前下载速度: ${downloadSpeed}`);
        }

        // 增加下载次数
        resource.downloads = (resource.downloads || 0) + 1;
        this.saveResources();
        this.loadResources();

        // 打开下载链接
        window.open(resource.link, '_blank');
    }

    // 显示资源详情
    showResourceDetails(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (!resource) {
            alert('资源不存在');
            return;
        }

        const modal = document.getElementById('resourceModal');
        const details = document.getElementById('resourceDetails');

        if (!modal || !details) return;

        details.innerHTML = `
            <div class="resource-detail-header">
                <div class="resource-detail-icon ${resource.type}">
                    <i class="fas ${this.getResourceIcon(resource.type)}"></i>
                </div>
                <div>
                    <h2>${resource.title}</h2>
                    <div class="resource-detail-meta">
                        <span class="resource-type">${this.getResourceTypeName(resource.type)}</span>
                        <span class="resource-uploader">上传者: ${resource.uploader}</span>
                        <span class="resource-date">上传于: ${new Date(resource.uploadDate).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="resource-detail-content">
                <h3>资源描述</h3>
                <p>${resource.description}</p>
                
                ${resource.tags.length > 0 ? `
                    <h3>资源标签</h3>
                    <div class="resource-tags">
                        ${resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="resource-detail-stats">
                    <div class="stat-item">
                        <div class="stat-value">${resource.downloads || 0}</div>
                        <div class="stat-label">下载次数</div>
                    </div>
                </div>
            </div>
            <div class="resource-detail-actions">
                <button class="btn btn-primary" onclick="resourceManager.downloadResource('${resource.id}')">
                    <i class="fas fa-download"></i> 立即下载
                </button>
            </div>
        `;

        modal.style.display = 'flex';
    }

    // 删除资源
    deleteResource(resourceId) {
        if (confirm('确定要删除此资源吗？')) {
            this.resources = this.resources.filter(r => r.id !== resourceId);
            this.saveResources();
            this.loadResources();
            alert('资源删除成功');
        }
    }

    // 搜索资源
    searchResources(query) {
        if (!query.trim()) {
            this.loadResources();
            return;
        }

        const filteredResources = this.resources.filter(resource => 
            resource.title.toLowerCase().includes(query.toLowerCase()) ||
            resource.description.toLowerCase().includes(query.toLowerCase()) ||
            resource.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        const resourcesGrid = document.getElementById('resourcesGrid');
        if (!resourcesGrid) return;

        if (filteredResources.length === 0) {
            resourcesGrid.innerHTML = '<div class="no-resources">未找到匹配的资源</div>';
            return;
        }

        resourcesGrid.innerHTML = filteredResources.map(resource => this.createResourceCard(resource)).join('');
        this.attachResourceCardListeners();
    }

    // 筛选资源
    filterResources(type) {
        // 更新筛选按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${type}"]`).classList.add('active');

        const filteredResources = type === 'all' 
            ? this.resources 
            : this.resources.filter(resource => resource.type === type);

        const resourcesGrid = document.getElementById('resourcesGrid');
        if (!resourcesGrid) return;

        if (filteredResources.length === 0) {
            resourcesGrid.innerHTML = '<div class="no-resources">未找到该类型的资源</div>';
            return;
        }

        resourcesGrid.innerHTML = filteredResources.map(resource => this.createResourceCard(resource)).join('');
        this.attachResourceCardListeners();
    }

    // 更新上传区域
    updateUploadSection() {
        const uploadForm = document.getElementById('uploadForm');
        if (!uploadForm) return;

        // 获取最新用户状态
        const currentUser = this.userManagement?.getCurrentUser();
        if (!currentUser) {
            uploadForm.innerHTML = `
                <div class="login-prompt">
                    <i class="fas fa-user-lock"></i>
                    <h3>请先登录</h3>
                    <p>只有登录用户才能上传资源</p>
                    <div class="prompt-actions">
                        <button class="btn btn-primary" onclick="openLoginModal()">登录</button>
                        <button class="btn btn-outline" onclick="openRegisterModal()">注册</button>
                    </div>
                </div>
            `;
        } else {
            // 恢复上传表单
            uploadForm.innerHTML = `
                <div class="form-group">
                    <label for="resourceTitle">资源标题</label>
                    <input type="text" id="resourceTitle" placeholder="请输入资源标题" required>
                </div>
                <div class="form-group">
                    <label for="resourceDescription">资源描述</label>
                    <textarea id="resourceDescription" placeholder="请输入资源描述" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="resourceType">资源类型</label>
                    <select id="resourceType" required>
                        <option value="">请选择资源类型</option>
                        <option value="document">文档</option>
                        <option value="video">视频</option>
                        <option value="audio">音频</option>
                        <option value="software">软件</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="resourceLink">资源链接</label>
                    <input type="url" id="resourceLink" placeholder="请输入资源下载链接" required>
                </div>
                <div class="form-group">
                    <label for="resourceTags">资源标签（用逗号分隔）</label>
                    <input type="text" id="resourceTags" placeholder="如：教程,工具,免费">
                </div>
                <div class="upload-actions">
                    <button class="btn btn-primary" onclick="resourceManager.uploadResource()">
                        <i class="fas fa-upload"></i> 上传资源
                    </button>
                </div>
            `;
        }
    }

    // 获取用户下载速度
    getCurrentUserDownloadSpeed() {
        if (!this.currentUser) return '普通会员速度 (1x)';

        // 直接使用用户的level属性确定会员等级
        const userLevel = this.currentUser.level || '普通会员';
        const speedMap = {
            '普通会员': '普通会员速度 (1x)',
            '高级会员': '高级会员速度 (2x)',
            'VIP会员': 'VIP会员速度 (5x)',
            '钻石会员': '钻石会员速度 (10x)',
            '超级VIP': '超级VIP会员速度 (10x)'
        };

        return speedMap[userLevel] || speedMap['普通会员'];
    }

    /**
     * 获取用户下载速度限制（用于实际限速逻辑）
     * @public
     * @returns {number} 下载速度限制倍数
     */
    getCurrentUserDownloadSpeedMultiplier() {
        if (!this.currentUser) return 1;

        // 直接使用用户的level属性确定会员等级
        const userLevel = this.currentUser.level || '普通会员';
        const speedMultiplierMap = {
            '普通会员': 1,
            '高级会员': 2,
            'VIP会员': 5,
            '钻石会员': 10,
            '超级VIP': 10
        };

        return speedMultiplierMap[userLevel] || 1;
    }

    // 保存资源到本地存储
    saveResources() {
        localStorage.setItem('resources', JSON.stringify(this.resources));
    }

    // 验证URL格式
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    // 获取资源类型对应的图标
    getResourceIcon(type) {
        const icons = {
            document: 'fa-file-alt',
            video: 'fa-file-video',
            audio: 'fa-file-audio',
            software: 'fa-file-code',
            other: 'fa-file' 
        };
        return icons[type] || icons.other;
    }
}

// 导出资源管理器实例
const resourceManager = new ResourceManager();

// 导出ResourceManager类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourceManager;
}