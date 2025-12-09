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
     * 初始化模块
     */
    initialize() {
        console.log('ResourceManager模块初始化完成');
        // 执行实际的初始化逻辑
        this.setupEventListeners();
        this.loadResources();
        this.initializeUserSystem();
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

    // 工具相关方法已移除，这些功能属于ToolManager.js


    // 关闭预览模态框
    closePreviewModal() {
        const modal = document.getElementById('previewModal');
        if (modal) {
            // 添加淡出动画
            modal.classList.remove('show');
            
            // 移除模态框
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
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
        // 检查是否有预览URL
        const previewUrl = resource.previewUrl || resource.link;
        
        switch(resource.type) {
            case 'document':
                return this.generateDocumentPreview(resource, previewUrl);
            case 'video':
                return this.generateVideoPreview(resource, previewUrl);
            case 'audio':
                return this.generateAudioPreview(resource, previewUrl);
            case 'image':
                return this.generateImagePreview(resource, previewUrl);
            case 'code':
                return this.generateCodePreview(resource);
            case 'software':
                return this.generateSoftwarePreview(resource);
            default:
                return this.generateGenericPreview(resource);
        }
    }
    
    // 生成文档预览
    generateDocumentPreview(resource, previewUrl) {
        if (resource.fileType === 'PDF' && previewUrl) {
            return `<div class="document-preview-content">
                        <div class="pdf-preview-container">
                            <iframe src="${previewUrl}" class="pdf-preview-iframe" frameborder="0" allowfullscreen></iframe>
                        </div>
                        <div class="preview-actions">
                            <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                                <i class="fas fa-download"></i> 下载PDF
                            </button>
                        </div>
                    </div>`;
        } else {
            return `<div class="document-preview-content">
                        <i class="fas fa-file-alt fa-5x"></i>
                        <h4>文档预览</h4>
                        <p>文件名: ${resource.title}</p>
                        <p>格式: ${resource.fileType}</p>
                        <p>大小: ${resource.size || '未知'}</p>
                        <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                            <i class="fas fa-download"></i> 直接下载
                        </button>
                    </div>`;
        }
    }
    
    // 生成视频预览
    generateVideoPreview(resource, previewUrl) {
        if (previewUrl) {
            return `<div class="video-preview-content">
                        <div class="video-preview-container">
                            <video class="video-preview-player" controls preload="metadata">
                                <source src="${previewUrl}" type="video/mp4">
                                您的浏览器不支持HTML5视频播放。
                            </video>
                        </div>
                        <div class="preview-actions">
                            <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                                <i class="fas fa-download"></i> 下载视频
                            </button>
                        </div>
                    </div>`;
        } else {
            return `<div class="video-preview-content">
                        <i class="fas fa-file-video fa-5x"></i>
                        <h4>视频预览</h4>
                        <p>文件名: ${resource.title}</p>
                        <p>格式: ${resource.fileType}</p>
                        <p>大小: ${resource.size || '未知'}</p>
                        <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                            <i class="fas fa-download"></i> 直接下载
                        </button>
                    </div>`;
        }
    }
    
    // 生成音频预览
    generateAudioPreview(resource, previewUrl) {
        if (previewUrl) {
            return `<div class="audio-preview-content">
                        <div class="audio-preview-container">
                            <audio class="audio-preview-player" controls preload="metadata">
                                <source src="${previewUrl}" type="audio/mpeg">
                                您的浏览器不支持HTML5音频播放。
                            </audio>
                        </div>
                        <div class="preview-actions">
                            <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                                <i class="fas fa-download"></i> 下载音频
                            </button>
                        </div>
                    </div>`;
        } else {
            return `<div class="audio-preview-content">
                        <i class="fas fa-file-audio fa-5x"></i>
                        <h4>音频预览</h4>
                        <p>文件名: ${resource.title}</p>
                        <p>格式: ${resource.fileType}</p>
                        <p>大小: ${resource.size || '未知'}</p>
                        <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                            <i class="fas fa-download"></i> 直接下载
                        </button>
                    </div>`;
        }
    }
    
    // 生成图片预览
    generateImagePreview(resource, previewUrl) {
        if (previewUrl) {
            return `<div class="image-preview-content">
                        <div class="image-preview-container">
                            <img src="${previewUrl}" class="image-preview-img" alt="${resource.title}">
                        </div>
                        <div class="preview-actions">
                            <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                                <i class="fas fa-download"></i> 下载图片
                            </button>
                        </div>
                    </div>`;
        } else {
            return this.generateGenericPreview(resource);
        }
    }
    
    // 生成代码预览
    generateCodePreview(resource) {
        // 简单的代码预览，显示代码片段
        const codeSnippet = resource.codeSnippet || '// 代码预览不可用';
        return `<div class="code-preview-content">
                    <div class="code-preview-container">
                        <pre><code>${codeSnippet}</code></pre>
                    </div>
                    <div class="preview-actions">
                        <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                            <i class="fas fa-download"></i> 下载代码文件
                        </button>
                    </div>
                </div>`;
    }
    
    // 生成软件预览
    generateSoftwarePreview(resource) {
        return `<div class="software-preview-content">
                    <i class="fas fa-code fa-5x"></i>
                    <h4>软件包预览</h4>
                    <p>软件名称: ${resource.title}</p>
                    <p>版本: ${resource.version || '未知'}</p>
                    <p>类型: ${resource.fileType}</p>
                    <p>大小: ${resource.size || '未知'}</p>
                    <div class="software-info">
                        <h5>系统要求</h5>
                        <p>${resource.systemRequirements || '暂无信息'}</p>
                    </div>
                    <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                        <i class="fas fa-download"></i> 下载软件
                    </button>
                </div>`;
    }
    
    // 生成通用预览
    generateGenericPreview(resource) {
        return `<div class="generic-preview-content">
                    <i class="fas fa-file fa-5x"></i>
                    <h4>资源预览</h4>
                    <p>文件名: ${resource.title}</p>
                    <p>类型: ${this.getResourceTypeName(resource.type)}</p>
                    <p>格式: ${resource.fileType}</p>
                    <p>大小: ${resource.size || '未知'}</p>
                    <button class="btn btn-outline" onclick="resourceManager.downloadResource('${resource.id}')">
                        <i class="fas fa-download"></i> 直接下载
                    </button>
                </div>`;
    }

    // 关闭预览模态框
    closePreviewModal() {
        const modal = document.getElementById('previewModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }
    
    // 显示资源评论
    showComments(resourceId) {
        // 查找资源
        const resource = this.resources.find(r => r.id === resourceId);
        if (!resource) return;
        
        // 创建评论模态框内容
        const modalContent = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-comments"></i> ${resource.title} - 评论</h3>
                    <button class="btn-close" onclick="resourceManager.closeCommentsModal()"></button>
                </div>
                <div class="modal-body">
                    <div id="comments-container-${resourceId}"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="resourceManager.closeCommentsModal()">
                        <i class="fas fa-times"></i> 关闭
                    </button>
                </div>
            </div>
        `;
        
        // 创建模态框元素
        const modal = document.createElement('div');
        modal.id = 'commentsModal';
        modal.className = 'modal comments-modal';
        modal.innerHTML = modalContent;
        
        // 添加到文档中
        document.body.appendChild(modal);
        
        // 显示模态框
        setTimeout(() => modal.classList.add('show'), 10);
        
        // 使用评论系统加载评论
        if (typeof commentSystem !== 'undefined') {
            commentSystem.renderComments(resourceId, `comments-container-${resourceId}`);
        }
    }
    
    // 关闭评论模态框
    closeCommentsModal() {
        const modal = document.getElementById('commentsModal');
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

    // 加载资源
    loadResources() {
        // 从localStorage加载资源
        const savedResources = localStorage.getItem('resources');
        if (savedResources) {
            try {
                this.resources = JSON.parse(savedResources);
            } catch (error) {
                console.error('加载资源失败:', error);
                this.resources = [];
            }
        } else {
            // 如果没有保存的资源，使用默认资源数据
            this.resources = [
                {
                    id: '1',
                    title: '编程入门教程',
                    description: '适合初学者的编程入门视频教程',
                    type: 'video',
                    uploader: 'admin',
                    uploadDate: Date.now() - 86400000,
                    downloads: 156,
                    tags: ['编程', '入门', '视频'],
                    link: 'https://example.com/programming-tutorial'
                },
                {
                    id: '2',
                    title: '设计规范文档',
                    description: 'UI/UX设计规范和最佳实践',
                    type: 'document',
                    uploader: 'admin',
                    uploadDate: Date.now() - 172800000,
                    downloads: 234,
                    tags: ['设计', '规范', '文档'],
                    link: 'https://example.com/design-guidelines'
                },
                {
                    id: '3',
                    title: '音频编辑软件',
                    description: '功能强大的音频编辑和处理工具',
                    type: 'software',
                    uploader: 'admin',
                    uploadDate: Date.now() - 259200000,
                    downloads: 89,
                    tags: ['音频', '编辑', '软件'],
                    link: 'https://example.com/audio-editor'
                }
            ];
            // 保存默认资源到localStorage
            this.saveResources();
        }

        // 渲染资源到DOM
        this.renderResources();
    }

    // 渲染资源列表
    renderResources() {
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

    // 显示收藏夹页面
    showFavorites() {
        // 简单实现，显示提示信息
        console.log('显示收藏夹页面');
        alert('收藏夹功能正在开发中');
    }

    // 显示资源库页面
    showResources() {
        // 简单实现，重新加载并渲染资源
        console.log('显示资源库页面');
        this.loadResources();
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

// 创建并导出资源管理器实例
const resourceManager = new ResourceManager();

// 导出ResourceManager类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourceManager;
}

// 设置全局变量
window.resourceManager = resourceManager;