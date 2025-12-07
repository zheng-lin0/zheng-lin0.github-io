class ResourceCenter {
    constructor() {
        this.resources = [];
        this.categories = [];
        this.downloadHistory = [];
        this.currentCategory = 'all';
        this.selectedResource = null;
        
        // 使用共享的Supabase客户端实例
        this.supabase = window.supabaseClient;
        
        if (!this.supabase) {
            console.warn('共享Supabase客户端未初始化，将使用localStorage模式');
        }
        
        // 资源数据
        this.resourceData = {
            resources: [
                {
                    id: 'resource-tutorial-js',
                    title: 'JavaScript基础教程',
                    description: '全面的JavaScript基础教程，适合初学者学习',
                    category: '教程',
                    type: '文档',
                    fileType: 'PDF',
                    size: '2.5 MB',
                    downloads: 15420,
                    rating: 4.8,
                    author: '技术学院',
                    date: '2023-09-15',
                    thumbnail: 'https://via.placeholder.com/150',
                    tags: ['JavaScript', '编程', '基础'],
                    url: '#',
                    isFree: true,
                    price: 0
                },
                {
                    id: 'resource-template-react',
                    title: 'React模板集合',
                    description: '20+ React项目模板，快速搭建前端应用',
                    category: '模板',
                    type: '代码',
                    fileType: 'ZIP',
                    size: '15.8 MB',
                    downloads: 8950,
                    rating: 4.6,
                    author: '开发团队',
                    date: '2023-11-20',
                    thumbnail: 'https://via.placeholder.com/150',
                    tags: ['React', '模板', '前端'],
                    url: '#',
                    isFree: true,
                    price: 0
                },
                {
                    id: 'resource-icons-ultimate',
                    title: '终极图标包',
                    description: '5000+ 高质量图标，支持多种格式和尺寸',
                    category: '素材',
                    type: '图片',
                    fileType: 'PNG/SVG',
                    size: '10.2 MB',
                    downloads: 12340,
                    rating: 4.7,
                    author: '设计工作室',
                    date: '2023-10-05',
                    thumbnail: 'https://via.placeholder.com/150',
                    tags: ['图标', '设计', '素材'],
                    url: '#',
                    isFree: false,
                    price: 19.99
                },
                {
                    id: 'resource-api-docs',
                    title: 'API开发文档',
                    description: 'RESTful API开发最佳实践和文档模板',
                    category: '文档',
                    type: '文档',
                    fileType: 'PDF',
                    size: '1.8 MB',
                    downloads: 6780,
                    rating: 4.9,
                    author: 'API专家',
                    date: '2023-08-12',
                    thumbnail: 'https://via.placeholder.com/150',
                    tags: ['API', 'REST', '开发'],
                    url: '#',
                    isFree: true,
                    price: 0
                },
                {
                    id: 'resource-theme-bootstrap',
                    title: 'Bootstrap主题',
                    description: '10+ 精美的Bootstrap主题和组件',
                    category: '模板',
                    type: '代码',
                    fileType: 'ZIP',
                    size: '8.5 MB',
                    downloads: 9230,
                    rating: 4.5,
                    author: '主题设计师',
                    date: '2023-12-01',
                    thumbnail: 'https://via.placeholder.com/150',
                    tags: ['Bootstrap', '主题', 'CSS'],
                    url: '#',
                    isFree: false,
                    price: 14.99
                },
                {
                    id: 'resource-ai-tools',
                    title: 'AI工具集',
                    description: '实用的人工智能工具和示例代码',
                    category: '工具',
                    type: '代码',
                    fileType: 'ZIP',
                    size: '22.3 MB',
                    downloads: 5670,
                    rating: 4.3,
                    author: 'AI研究组',
                    date: '2023-10-25',
                    thumbnail: 'https://via.placeholder.com/150',
                    tags: ['AI', '机器学习', '工具'],
                    url: '#',
                    isFree: false,
                    price: 29.99
                }
            ],
            categories: ['全部', '教程', '文档', '模板', '素材', '工具', '代码']
        };
    }

    async initialize() {
        console.log('ResourceCenter initialized');
        await this.loadResourceData();
        this.setupEventListeners();
        
        // 监听模态框打开事件
        document.addEventListener('modalOpened', async (e) => {
            if (e.detail.modalId === 'resourceCenterModal') {
                await this.showResourceCenter();
            }
        });
    }

    async loadResourceData() {
        // 设置资源和分类数据
        this.resources = this.resourceData.resources;
        this.categories = this.resourceData.categories;
        
        // 尝试从Supabase加载下载历史
        if (this.supabase && window.userManagement) {
            await this.loadDownloadHistoryFromSupabase();
        } else {
            // 从本地存储加载下载历史
            const storedDownloadHistory = localStorage.getItem('downloadHistory');
            if (storedDownloadHistory) {
                this.downloadHistory = JSON.parse(storedDownloadHistory);
            }
        }
    }

    setupEventListeners() {
        // 资源中心相关事件监听
        document.addEventListener('click', (e) => {
            // 资源卡片点击
            const resourceCard = e.target.closest('.resource-card');
            if (resourceCard) {
                const resourceId = resourceCard.dataset.resourceId;
                this.showResourceDetail(resourceId);
                return;
            }
            
            // 分类筛选点击
            const categoryFilter = e.target.closest('.category-filter');
            if (categoryFilter) {
                const category = categoryFilter.dataset.category;
                this.filterResourcesByCategory(category);
                return;
            }
            
            // 下载按钮点击
            const downloadBtn = e.target.closest('.download-btn');
            if (downloadBtn) {
                const resourceId = downloadBtn.dataset.resourceId;
                this.downloadResource(resourceId);
                return;
            }
            
            // 返回资源列表按钮点击
            const backBtn = e.target.closest('.back-to-list');
            if (backBtn) {
                this.showResourceList();
                return;
            }
            
            // 搜索按钮点击
            const searchBtn = e.target.closest('.resource-search-btn');
            if (searchBtn) {
                this.searchResources();
                return;
            }
        });
        
        // 搜索框回车事件
        document.addEventListener('keypress', (e) => {
            if (e.target.closest('.resource-search-input') && e.key === 'Enter') {
                this.searchResources();
                return;
            }
        });
    }

    async showResourceCenter() {
        const resourceCenterContent = document.getElementById('resourceCenterContent');
        if (!resourceCenterContent) return;
        
        // 确保下载历史是最新的
        if (this.supabase && window.userManagement) {
            await this.loadDownloadHistoryFromSupabase();
        }
        
        // 渲染资源中心界面
        resourceCenterContent.innerHTML = `
            <div class="resource-center-container">
                <div class="resource-center-header">
                    <h3>欢迎来到资源中心</h3>
                    <p>发现和下载实用的资源文件</p>
                </div>
                
                <div class="resource-center-content">
                    <div class="resource-sidebar">
                        <div class="category-filter-section">
                            <h4>分类</h4>
                            <div class="category-filters">
                                ${this.categories.map(category => `
                                    <button class="category-filter ${this.currentCategory === category ? 'active' : ''}" 
                                            data-category="${category}">
                                        ${category}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="stats-section">
                            <h4>统计信息</h4>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-value">${this.resources.length}</div>
                                    <div class="stat-label">可用资源</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${this.downloadHistory.length}</div>
                                    <div class="stat-label">下载历史</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${this.categories.length - 1}</div>
                                    <div class="stat-label">分类</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="resource-main">
                        <div class="resource-toolbar">
                            <div class="resource-search">
                                <input type="text" class="resource-search-input" placeholder="搜索资源...">
                                <button class="btn btn-primary resource-search-btn">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div id="resourceList" class="resource-list">
                            ${this.renderResourceList()}
                        </div>
                        
                        <div id="resourceDetail" class="resource-detail" style="display: none;">
                            <!-- 资源详情将在这里渲染 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderResourceList(filteredResources = null) {
        let resourcesToRender = filteredResources || this.resources;
        
        if (this.currentCategory !== '全部') {
            resourcesToRender = resourcesToRender.filter(resource => 
                resource.category === this.currentCategory
            );
        }
        
        return resourcesToRender.map(resource => `
            <div class="resource-card" data-resource-id="${resource.id}">
                <div class="resource-thumbnail">
                    <img src="${resource.thumbnail}" alt="${resource.title}">
                    <span class="resource-type-badge">${resource.type}</span>
                    ${!resource.isFree ? `<span class="resource-price-badge">¥${resource.price}</span>` : ''}
                </div>
                <div class="resource-info">
                    <h4 class="resource-title">${resource.title}</h4>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-meta">
                        <span class="resource-category"><i class="fas fa-tag"></i> ${resource.category}</span>
                        <span class="resource-file-type"><i class="fas fa-file"></i> ${resource.fileType}</span>
                        <span class="resource-size"><i class="fas fa-hdd"></i> ${resource.size}</span>
                        <span class="resource-date"><i class="fas fa-calendar"></i> ${resource.date}</span>
                    </div>
                    <div class="resource-rating-downloads">
                        <span class="resource-rating">
                            <i class="fas fa-star"></i> ${resource.rating}
                        </span>
                        <span class="resource-downloads">
                            <i class="fas fa-download"></i> ${resource.downloads.toLocaleString()}
                        </span>
                    </div>
                </div>
                <div class="resource-actions">
                    <button class="btn ${resource.isFree ? 'btn-primary' : 'btn-success'} download-btn" 
                            data-resource-id="${resource.id}">
                        ${resource.isFree ? '下载' : '购买并下载'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterResourcesByCategory(category) {
        this.currentCategory = category;
        
        // 更新分类筛选器的激活状态
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        // 更新资源列表
        const resourceList = document.getElementById('resourceList');
        if (resourceList) {
            resourceList.innerHTML = this.renderResourceList();
        }
    }

    showResourceDetail(resourceId) {
        const resource = this.resources.find(resource => resource.id === resourceId);
        if (!resource) return;
        
        this.selectedResource = resource;
        
        const resourceDetail = document.getElementById('resourceDetail');
        const resourceList = document.getElementById('resourceList');
        
        if (resourceDetail && resourceList) {
            resourceDetail.innerHTML = `
                <div class="resource-detail-header">
                    <button class="back-to-list btn btn-secondary">
                        <i class="fas fa-arrow-left"></i> 返回列表
                    </button>
                    <div class="resource-detail-info">
                        <div class="resource-detail-thumbnail">
                            <img src="${resource.thumbnail}" alt="${resource.title}">
                        </div>
                        <div class="resource-detail-meta">
                            <h3 class="resource-detail-title">${resource.title}</h3>
                            <div class="resource-detail-rating">
                                <i class="fas fa-star"></i> ${resource.rating} (${resource.downloads.toLocaleString()} 下载)
                            </div>
                            <div class="resource-detail-categories">
                                <span class="badge badge-info">${resource.category}</span>
                                <span class="badge badge-secondary">${resource.type}</span>
                                <span class="badge badge-light">${resource.fileType}</span>
                                <span class="badge ${resource.isFree ? 'badge-success' : 'badge-warning'}">
                                    ${resource.isFree ? '免费' : `¥${resource.price}`}
                                </span>
                            </div>
                            <div class="resource-detail-author-date">
                                <span><i class="fas fa-user"></i> ${resource.author}</span>
                                <span><i class="fas fa-calendar"></i> ${resource.date}</span>
                                <span><i class="fas fa-hdd"></i> ${resource.size}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="resource-detail-content">
                    <div class="resource-detail-description">
                        <h4>资源描述</h4>
                        <p>${resource.description}</p>
                    </div>
                    
                    <div class="resource-detail-tags">
                        <h4>标签</h4>
                        <div class="tags-container">
                            ${resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="resource-detail-actions">
                    <button class="btn ${resource.isFree ? 'btn-primary' : 'btn-success'} btn-lg download-btn" 
                            data-resource-id="${resource.id}">
                        <i class="fas fa-download"></i> ${resource.isFree ? '下载资源' : '购买并下载'}
                    </button>
                </div>
            `;
            
            resourceList.style.display = 'none';
            resourceDetail.style.display = 'block';
        }
    }

    showResourceList() {
        const resourceDetail = document.getElementById('resourceDetail');
        const resourceList = document.getElementById('resourceList');
        
        if (resourceDetail && resourceList) {
            resourceDetail.style.display = 'none';
            resourceList.style.display = 'grid';
            this.selectedResource = null;
        }
    }

    searchResources() {
        const searchInput = document.querySelector('.resource-search-input');
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (!searchTerm) {
            // 搜索框为空，显示所有资源
            const resourceList = document.getElementById('resourceList');
            if (resourceList) {
                resourceList.innerHTML = this.renderResourceList();
            }
            return;
        }
        
        // 搜索资源（标题、描述、标签）
        const filteredResources = this.resources.filter(resource => {
            return (
                resource.title.toLowerCase().includes(searchTerm) ||
                resource.description.toLowerCase().includes(searchTerm) ||
                resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        });
        
        // 更新资源列表
        const resourceList = document.getElementById('resourceList');
        if (resourceList) {
            resourceList.innerHTML = this.renderResourceList(filteredResources);
        }
    }

    async downloadResource(resourceId) {
        const resource = this.resources.find(resource => resource.id === resourceId);
        if (!resource) return;
        
        // 检查是否需要付费
        if (!resource.isFree) {
            // 这里可以添加支付流程
            const confirmed = confirm(`确定要购买 "${resource.title}" 吗？价格：¥${resource.price}`);
            if (!confirmed) return;
        }
        
        // 记录下载历史
        const downloadRecord = {
            resourceId: resource.id,
            resourceTitle: resource.title,
            downloadDate: new Date().toISOString()
        };
        this.downloadHistory.unshift(downloadRecord);
        await this.saveDownloadHistory();
        
        // 增加下载次数
        resource.downloads += 1;
        
        // 模拟下载
        this.simulateDownload(resource);
        
        // 显示通知
        if (typeof notificationSystem !== 'undefined') {
            notificationSystem.showNotification(`${resource.title} 下载开始！`, 'success');
        }
        
        // 触发资源下载事件
        const event = new CustomEvent('resourceDownloaded', { detail: { resourceId, resource, downloadRecord } });
        document.dispatchEvent(event);
    }

    simulateDownload(resource) {
        // 模拟下载进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                
                // 下载完成
                if (typeof notificationSystem !== 'undefined') {
                    notificationSystem.showNotification(`${resource.title} 下载完成！`, 'success');
                }
            }
        }, 500);
    }

    /**
     * 从Supabase加载下载历史
     * @private
     */
    async loadDownloadHistoryFromSupabase() {
        if (!this.supabase || !window.userManagement) return;
        
        try {
            const currentUser = window.userManagement.getCurrentUser();
            if (!currentUser) return;
            
            const { data, error } = await this.supabase
                .from('user_download_history')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('download_date', { ascending: false });
            
            if (data && data.length > 0) {
                // 将Supabase数据转换为应用程序所需的格式
                this.downloadHistory = data.map(item => ({
                    resourceId: item.resource_id,
                    resourceTitle: item.resource_title,
                    downloadDate: item.download_date
                }));
                // 同时更新localStorage
                localStorage.setItem('downloadHistory', JSON.stringify(this.downloadHistory));
            }
        } catch (error) {
            console.error('从Supabase加载下载历史失败:', error);
            // 回退到localStorage
            const storedDownloadHistory = localStorage.getItem('downloadHistory');
            if (storedDownloadHistory) {
                this.downloadHistory = JSON.parse(storedDownloadHistory);
            }
        }
    }
    
    /**
     * 保存下载历史到存储
     * @private
     */
    async saveDownloadHistory() {
        // 只保留最近50条下载记录
        if (this.downloadHistory.length > 50) {
            this.downloadHistory = this.downloadHistory.slice(0, 50);
        }
        
        // 先保存到localStorage
        localStorage.setItem('downloadHistory', JSON.stringify(this.downloadHistory));
        
        // 如果Supabase可用且用户已登录，同步到数据库
        if (this.supabase && window.userManagement) {
            const currentUser = window.userManagement.getCurrentUser();
            if (currentUser) {
                try {
                    // 先删除所有已存在的记录
                    await this.supabase
                        .from('user_download_history')
                        .delete()
                        .eq('user_id', currentUser.id);
                    
                    // 插入新的下载记录
                    if (this.downloadHistory.length > 0) {
                        const downloadHistoryData = this.downloadHistory.map(record => ({
                            user_id: currentUser.id,
                            resource_id: record.resourceId,
                            resource_title: record.resourceTitle,
                            download_date: record.downloadDate
                        }));
                        
                        const { error } = await this.supabase
                            .from('user_download_history')
                            .insert(downloadHistoryData);
                        
                        if (error) {
                            console.error('保存下载历史到Supabase失败:', error);
                        }
                    }
                } catch (error) {
                    console.error('保存下载历史到Supabase时发生错误:', error);
                }
            }
        }
    }

    getDownloadHistory() {
        return this.downloadHistory;
    }

    getPopularResources(limit = 5) {
        return [...this.resources]
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, limit);
    }
}

// 创建单例实例
const resourceCenter = new ResourceCenter();

// 确保模块加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 直接初始化，由app.js统一管理模块初始化
});

// 导出单例实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = resourceCenter;
}