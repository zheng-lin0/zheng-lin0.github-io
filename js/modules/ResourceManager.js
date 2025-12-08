class ResourceManager {
    constructor() {
        this.resources = JSON.parse(localStorage.getItem('resources')) || [];
        this.currentUser = null;
        this.userManagement = null;
        this.currentSortOption = 'newest'; // 默认按最新上传排序
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.setupResourceEventDelegation(); // 设置资源卡片事件委托
                this.loadResources();
                this.initializeUserSystem();
            });
        } else {
            this.setupEventListeners();
            this.setupResourceEventDelegation(); // 设置资源卡片事件委托
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

        // 资源排序事件监听
        document.querySelectorAll('.sort-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const sortOption = e.currentTarget.dataset.sort;
                this.setResourceSort(sortOption);
                
                // 更新排序选项状态
                document.querySelectorAll('.sort-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
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

        // 使用文档片段来减少DOM操作次数
        const fragment = document.createDocumentFragment();
        this.resources.forEach(resource => {
            const cardElement = this.createResourceCardElement(resource);
            fragment.appendChild(cardElement);
        });
        
        resourcesGrid.innerHTML = '';
        resourcesGrid.appendChild(fragment);
        this.attachResourceCardListeners();
    }

    // 创建资源卡片元素
    createResourceCardElement(resource) {
        const cardHTML = this.createResourceCard(resource);
        const div = document.createElement('div');
        div.innerHTML = cardHTML.trim();
        return div.firstChild;
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

        // 创建资源预览HTML
        const createResourcePreview = (resource) => {
            switch(resource.type) {
                case 'document':
                    return `<div class="resource-preview document-preview">
                                <i class="fas ${getResourceIcon(resource.type)}"></i>
                                <button class="preview-btn" onclick="resourceManager.previewResource('${resource.id}')">
                                    <i class="fas fa-eye"></i> 预览
                                </button>
                            </div>`;
                case 'video':
                    return `<div class="resource-preview video-preview">
                                <i class="fas ${getResourceIcon(resource.type)}"></i>
                                <button class="preview-btn" onclick="resourceManager.previewResource('${resource.id}')">
                                    <i class="fas fa-play-circle"></i> 播放预览
                                </button>
                            </div>`;
                case 'audio':
                    return `<div class="resource-preview audio-preview">
                                <i class="fas ${getResourceIcon(resource.type)}"></i>
                                <button class="preview-btn" onclick="resourceManager.previewResource('${resource.id}')">
                                    <i class="fas fa-play"></i> 试听
                                </button>
                            </div>`;
                default:
                    return `<div class="resource-preview">
                                <i class="fas ${getResourceIcon(resource.type)}"></i>
                                <button class="preview-btn" onclick="resourceManager.previewResource('${resource.id}')" disabled>
                                    <i class="fas fa-eye-slash"></i> 不可预览
                                </button>
                            </div>`;
            }
        };

        return `
            <div class="resource-card" data-id="${resource.id}">
                <div class="resource-thumbnail">
                    ${createResourcePreview(resource)}
                </div>
                <div class="resource-content">
                    <div class="resource-category">${this.getResourceTypeName(resource.type)}</div>
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-meta">
                        <span class="resource-uploader">上传者: ${resource.uploader}</span>
                        <span class="resource-date">${new Date(resource.uploadDate).toLocaleDateString()}</span>
                        <span class="resource-downloads">
                            <i class="fas fa-download"></i> ${resource.downloads || 0}
                        </span>
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

    // 设置资源卡片事件委托
    setupResourceEventDelegation() {
        const resourcesGrid = document.getElementById('resourcesGrid');
        if (!resourcesGrid) return;

        // 使用事件委托处理所有资源卡片按钮的点击事件
        resourcesGrid.addEventListener('click', (e) => {
            // 阻止事件冒泡到卡片元素
            e.stopPropagation();
            
            const target = e.target;
            const resourceCard = target.closest('.resource-card');
            
            if (!resourceCard) return;
            
            const resourceId = resourceCard.dataset.id;
            
            if (target.closest('.download-btn')) {
                this.downloadResource(resourceId);
            } else if (target.closest('.detail-btn')) {
                this.showResourceDetails(resourceId);
            } else if (target.closest('.delete-btn')) {
                this.deleteResource(resourceId);
            } else if (target.closest('.preview-btn')) {
                this.previewResource(resourceId);
            }
        });
    }

    // 附加资源卡片事件监听器（兼容旧代码，实际不再需要）
    attachResourceCardListeners() {
        // 由于使用了事件委托，此方法现在是空的
        // 保留以确保向后兼容
    }

    // 资源预览功能
    previewResource(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (!resource) return;

        // 显示预览模态框
        this.showPreviewModal(resource);
    }

    // 显示预览模态框
    showPreviewModal(resource) {
        const modalContent = `
            <div class="preview-modal-content">
                <div class="preview-header">
                    <h3>${resource.title}</h3>
                    <button class="close-btn" onclick="resourceManager.closePreviewModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="preview-body">
                    <div class="resource-preview-content">
                        ${this.generatePreviewContent(resource)}
                    </div>
                    <div class="preview-info">
                        <h4>资源信息</h4>
                        <ul>
                            <li><strong>类型:</strong> ${this.getResourceTypeName(resource.type)}</li>
                            <li><strong>上传者:</strong> ${resource.uploader}</li>
                            <li><strong>上传时间:</strong> ${new Date(resource.uploadDate).toLocaleDateString()}</li>
                            <li><strong>下载次数:</strong> ${resource.downloads || 0}</li>
                            <li><strong>描述:</strong> ${resource.description}</li>
                        </ul>
                    </div>
                </div>
                <div class="preview-footer">
                    <button class="btn btn-primary" onclick="resourceManager.downloadResource('${resource.id}')">
                        <i class="fas fa-download"></i> 下载
                    </button>
                    <button class="btn btn-secondary" onclick="resourceManager.closePreviewModal()">
                        <i class="fas fa-times"></i> 关闭
                    </button>
                </div>
            </div>
        `;

        // 创建模态框元素
        const modal = document.createElement('div');
        modal.id = 'previewModal';
        modal.className = 'modal preview-modal';
        modal.innerHTML = modalContent;

        // 添加到文档中
        document.body.appendChild(modal);

        // 显示模态框
        setTimeout(() => modal.classList.add('show'), 10);
    }

    // 生成预览内容
    generatePreviewContent(resource) {
        switch(resource.type) {
            case 'document':
                return `<div class="document-preview-content">
                            <i class="fas fa-file-alt fa-5x"></i>
                            <p>文档预览功能开发中...</p>
                            <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                                <i class="fas fa-download"></i> 直接下载
                            </button>
                        </div>`;
            case 'video':
                return `<div class="video-preview-content">
                            <i class="fas fa-file-video fa-5x"></i>
                            <p>视频预览功能开发中...</p>
                            <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                                <i class="fas fa-download"></i> 直接下载
                            </button>
                        </div>`;
            case 'audio':
                return `<div class="audio-preview-content">
                            <i class="fas fa-file-audio fa-5x"></i>
                            <p>音频预览功能开发中...</p>
                            <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                                <i class="fas fa-download"></i> 直接下载
                            </button>
                        </div>`;
            default:
                return `<div class="generic-preview-content">
                            <i class="fas fa-file fa-5x"></i>
                            <p>该类型资源不支持预览</p>
                            <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                                <i class="fas fa-download"></i> 直接下载
                            </button>
                        </div>`;
        }
    }

    // 关闭预览模态框
    closePreviewModal() {
        const modal = document.getElementById('previewModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
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

        // 更新特定资源卡片的下载次数，避免重新渲染整个列表
        this.updateResourceDownloadCount(resourceId, resource.downloads);

        // 打开下载链接
        window.open(resource.link, '_blank');
    }

    // 更新资源下载次数显示
    updateResourceDownloadCount(resourceId, count) {
        const card = document.querySelector(`[data-id="${resourceId}"]`);
        if (card) {
            const downloadCountElement = card.querySelector('.resource-downloads');
            if (downloadCountElement) {
                downloadCountElement.innerHTML = `<i class="fas fa-download"></i> ${count}`;
            }
        }
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
            
            // 从DOM中移除资源卡片，避免重新渲染整个列表
            const card = document.querySelector(`[data-id="${resourceId}"]`);
            if (card) {
                card.remove();
                
                // 检查是否还有资源，如果没有，显示空状态
                if (this.resources.length === 0) {
                    const resourcesGrid = document.getElementById('resourcesGrid');
                    if (resourcesGrid) {
                        resourcesGrid.innerHTML = '<div class="no-resources">暂无资源，请先上传资源</div>';
                    }
                }
            }
            
            alert('资源删除成功');
        }
    }

    // 搜索资源
    searchResources(query) {
        let filteredResources = this.resources;
        const activeFilter = document.querySelector('.filter-btn.active');
        const filterType = activeFilter ? activeFilter.dataset.filter : 'all';

        // 应用搜索过滤
        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            filteredResources = filteredResources.filter(resource => 
                resource.title.toLowerCase().includes(searchTerm) ||
                resource.description.toLowerCase().includes(searchTerm) ||
                resource.uploader.toLowerCase().includes(searchTerm) ||
                resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // 应用类型过滤
        if (filterType !== 'all') {
            filteredResources = filteredResources.filter(resource => resource.type === filterType);
        }

        // 应用排序
        filteredResources = this.sortResources(filteredResources, this.currentSortOption);

        const resourcesGrid = document.getElementById('resourcesGrid');
        if (!resourcesGrid) return;

        if (filteredResources.length === 0) {
            resourcesGrid.innerHTML = `
                <div class="no-resources">
                    <i class="fas fa-search fa-4x"></i>
                    <h3>未找到匹配的资源</h3>
                    <p>请尝试调整搜索条件或过滤选项</p>
                </div>
            `;
            return;
        }

        // 使用文档片段来减少DOM操作次数
        const fragment = document.createDocumentFragment();
        filteredResources.forEach(resource => {
            const cardElement = this.createResourceCardElement(resource);
            fragment.appendChild(cardElement);
        });
        
        resourcesGrid.innerHTML = '';
        resourcesGrid.appendChild(fragment);
        this.attachResourceCardListeners();
    }

    // 筛选资源
    filterResources(type) {
        // 更新筛选按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-filter="${type}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        const searchQuery = document.getElementById('resourceSearch')?.value || '';
        this.searchResources(searchQuery);
    }

    // 排序资源
    sortResources(resources, sortOption) {
        const sorted = [...resources];
        switch (sortOption) {
            case 'newest':
                return sorted.sort((a, b) => b.uploadDate - a.uploadDate);
            case 'oldest':
                return sorted.sort((a, b) => a.uploadDate - b.uploadDate);
            case 'popular':
                return sorted.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            default:
                return sorted.sort((a, b) => b.uploadDate - a.uploadDate);
        }
    }

    // 设置资源排序
    setResourceSort(sortOption) {
        this.currentSortOption = sortOption;
        
        // 更新排序按钮状态
        document.querySelectorAll('.sort-option').forEach(option => {
            option.classList.remove('active');
        });
        const activeOption = document.querySelector(`[data-sort="${sortOption}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
        
        // 直接重新排序当前显示的资源，避免不必要的搜索和过滤
        const resourcesGrid = document.getElementById('resourcesGrid');
        if (!resourcesGrid) return;
        
        // 获取当前搜索查询和筛选条件
        const searchQuery = document.getElementById('resourceSearch')?.value || '';
        const activeFilter = document.querySelector('.filter-btn.active');
        const filterType = activeFilter ? activeFilter.dataset.filter : 'all';
        
        // 重新应用所有条件
        let filteredResources = this.resources;
        
        // 应用搜索过滤
        if (searchQuery.trim()) {
            const searchTerm = searchQuery.toLowerCase();
            filteredResources = filteredResources.filter(resource => 
                resource.title.toLowerCase().includes(searchTerm) ||
                resource.description.toLowerCase().includes(searchTerm) ||
                resource.uploader.toLowerCase().includes(searchTerm) ||
                resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        // 应用类型过滤
        if (filterType !== 'all') {
            filteredResources = filteredResources.filter(resource => resource.type === filterType);
        }
        
        // 应用排序
        filteredResources = this.sortResources(filteredResources, sortOption);
        
        if (filteredResources.length === 0) {
            resourcesGrid.innerHTML = '<div class="no-resources">未找到匹配的资源</div>';
            return;
        }
        
        // 使用文档片段来减少DOM操作次数
        const fragment = document.createDocumentFragment();
        filteredResources.forEach(resource => {
            const cardElement = this.createResourceCardElement(resource);
            fragment.appendChild(cardElement);
        });
        
        resourcesGrid.innerHTML = '';
        resourcesGrid.appendChild(fragment);
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
        if (!this.currentUser) return '会员level1速度 (1x)';

        // 直接使用用户的level属性确定会员等级
        const userLevel = this.currentUser.level || '会员level1';
        const speedMap = {
            '会员level1': '会员level1速度 (1x)',
            '会员level2': '会员level2速度 (2x)',
            '会员level3': '会员level3速度 (2x)',
            '会员level4': '会员level4速度 (5x)',
            '会员level5': '会员level5速度 (5x)',
            '会员level6': '会员level6速度 (10x)',
            '会员level7': '会员level7速度 (10x)',
            '会员level8': '会员level8速度 (10x)',
            '会员level9': '会员level9速度 (10x)',
            '会员level10': '会员level10速度 (10x)'
        };

        return speedMap[userLevel] || speedMap['会员level1'];
    }

    /**
     * 获取用户下载速度限制（用于实际限速逻辑）
     * @public
     * @returns {number} 下载速度限制倍数
     */
    getCurrentUserDownloadSpeedMultiplier() {
        if (!this.currentUser) return 1;

        // 直接使用用户的level属性确定会员等级
        const userLevel = this.currentUser.level || '会员level1';
        const speedMultiplierMap = {
            '会员level1': 1,
            '会员level2': 2,
            '会员level3': 2,
            '会员level4': 5,
            '会员level5': 5,
            '会员level6': 10,
            '会员level7': 10,
            '会员level8': 10,
            '会员level9': 10,
            '会员level10': 10
        };

        return speedMultiplierMap[userLevel] || 1;
    }

    // 保存资源到本地存储（带防抖处理）
    saveResources() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            localStorage.setItem('resources', JSON.stringify(this.resources));
            this.saveTimeout = null;
        }, 100); // 100ms防抖
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