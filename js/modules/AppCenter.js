class AppCenter {
    constructor() {
        this.apps = [];
        this.categories = [];
        this.installedApps = new Set();
        this.currentCategory = 'all';
        this.selectedApp = null;
        
        // 使用共享的Supabase客户端实例
        this.supabase = window.supabaseClient;
        
        if (!this.supabase) {
            console.warn('共享Supabase客户端未初始化，将使用localStorage模式');
        }
        
        // 应用数据
        this.appData = {
            apps: [
                {
                    id: 'app-calculator',
                    name: '计算器',
                    description: '强大的科学计算器，支持各种数学运算',
                    category: '工具',
                    icon: 'fas fa-calculator',
                    version: '1.0.0',
                    author: 'SmartNav Team',
                    downloads: 15420,
                    rating: 4.8,
                    screenshots: [],
                    isFree: true,
                    price: 0
                },
                {
                    id: 'app-notes',
                    name: '便签',
                    description: '简单易用的便签应用，记录你的想法和待办事项',
                    category: '工具',
                    icon: 'fas fa-sticky-note',
                    version: '1.2.0',
                    author: 'SmartNav Team',
                    downloads: 8950,
                    rating: 4.6,
                    screenshots: [],
                    isFree: true,
                    price: 0
                },
                {
                    id: 'app-calendar',
                    name: '日历',
                    description: '智能日历，管理你的日程和事件',
                    category: '工具',
                    icon: 'fas fa-calendar-alt',
                    version: '2.0.0',
                    author: 'SmartNav Team',
                    downloads: 12340,
                    rating: 4.7,
                    screenshots: [],
                    isFree: true,
                    price: 0
                },
                {
                    id: 'app-weather',
                    name: '天气',
                    description: '实时天气信息，提供未来7天预报',
                    category: '工具',
                    icon: 'fas fa-cloud-sun',
                    version: '1.5.0',
                    author: 'SmartNav Team',
                    downloads: 23450,
                    rating: 4.9,
                    screenshots: [],
                    isFree: true,
                    price: 0
                },
                {
                    id: 'app-music',
                    name: '音乐播放器',
                    description: '本地音乐播放器，支持多种音频格式',
                    category: '娱乐',
                    icon: 'fas fa-music',
                    version: '1.1.0',
                    author: 'SmartNav Team',
                    downloads: 9870,
                    rating: 4.5,
                    screenshots: [],
                    isFree: true,
                    price: 0
                },
                {
                    id: 'app-image-editor',
                    name: '图片编辑器',
                    description: '简单的图片编辑工具，裁剪、调整和滤镜',
                    category: '工具',
                    icon: 'fas fa-edit',
                    version: '1.3.0',
                    author: 'SmartNav Team',
                    downloads: 11230,
                    rating: 4.4,
                    screenshots: [],
                    isFree: false,
                    price: 9.99
                }
            ],
            categories: ['全部', '工具', '娱乐', '办公', '学习', '其他']
        };
    }

    async initialize() {
        console.log('AppCenter initialized');
        await this.loadAppData();
        this.setupEventListeners();
        
        // 监听模态框打开事件
        document.addEventListener('modalOpened', async (e) => {
            if (e.detail.modalId === 'appCenterModal') {
                await this.showAppCenter();
            }
        });
    }

    async loadAppData() {
        // 设置应用和分类数据
        this.apps = this.appData.apps;
        this.categories = this.appData.categories;
        
        // 尝试从Supabase加载已安装的应用
        if (this.supabase && window.userManagement) {
            await this.loadInstalledAppsFromSupabase();
        } else {
            // 从本地存储加载安装的应用
            const storedInstalledApps = localStorage.getItem('installedApps');
            if (storedInstalledApps) {
                this.installedApps = new Set(JSON.parse(storedInstalledApps));
            }
        }
    }

    setupEventListeners() {
        // 应用中心相关事件监听
        document.addEventListener('click', (e) => {
            // 应用卡片点击
            const appCard = e.target.closest('.app-card');
            if (appCard) {
                const appId = appCard.dataset.appId;
                this.showAppDetail(appId);
                return;
            }
            
            // 分类筛选点击
            const categoryFilter = e.target.closest('.category-filter');
            if (categoryFilter) {
                const category = categoryFilter.dataset.category;
                this.filterAppsByCategory(category);
                return;
            }
            
            // 安装/卸载按钮点击
            const installBtn = e.target.closest('.install-btn');
            if (installBtn) {
                const appId = installBtn.dataset.appId;
                if (this.installedApps.has(appId)) {
                    this.uninstallApp(appId);
                } else {
                    this.installApp(appId);
                }
                return;
            }
            
            // 返回应用列表按钮点击
            const backBtn = e.target.closest('.back-to-list');
            if (backBtn) {
                this.showAppList();
                return;
            }
        });
    }

    async showAppCenter() {
        const appCenterContent = document.getElementById('appCenterContent');
        if (!appCenterContent) return;
        
        // 确保已安装应用数据是最新的
        if (this.supabase && window.userManagement) {
            await this.loadInstalledAppsFromSupabase();
        }
        
        // 渲染应用中心界面
        appCenterContent.innerHTML = `
            <div class="app-center-container">
                <div class="app-center-header">
                    <h3>欢迎来到应用中心</h3>
                    <p>发现和安装实用的应用程序</p>
                </div>
                
                <div class="app-center-content">
                    <div class="app-sidebar">
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
                                    <div class="stat-value">${this.apps.length}</div>
                                    <div class="stat-label">可用应用</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${this.installedApps.size}</div>
                                    <div class="stat-label">已安装</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${this.categories.length - 1}</div>
                                    <div class="stat-label">分类</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="app-main">
                        <div id="appList" class="app-list">
                            ${this.renderAppList()}
                        </div>
                        
                        <div id="appDetail" class="app-detail" style="display: none;">
                            <!-- 应用详情将在这里渲染 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAppList() {
        let filteredApps = this.apps;
        if (this.currentCategory !== '全部') {
            filteredApps = this.apps.filter(app => app.category === this.currentCategory);
        }
        
        return filteredApps.map(app => `
            <div class="app-card" data-app-id="${app.id}">
                <div class="app-icon">
                    <i class="${app.icon}"></i>
                </div>
                <div class="app-info">
                    <h4 class="app-name">${app.name}</h4>
                    <p class="app-description">${app.description}</p>
                    <div class="app-meta">
                        <span class="app-category">${app.category}</span>
                        <span class="app-rating">
                            <i class="fas fa-star"></i> ${app.rating}
                        </span>
                        <span class="app-downloads">${app.downloads.toLocaleString()} 下载</span>
                    </div>
                </div>
                <div class="app-actions">
                    <button class="btn ${this.installedApps.has(app.id) ? 'btn-danger' : 'btn-success'} install-btn" 
                            data-app-id="${app.id}">
                        ${this.installedApps.has(app.id) ? '卸载' : '安装'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterAppsByCategory(category) {
        this.currentCategory = category;
        
        // 更新分类筛选器的激活状态
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        // 更新应用列表
        const appList = document.getElementById('appList');
        if (appList) {
            appList.innerHTML = this.renderAppList();
        }
    }

    showAppDetail(appId) {
        const app = this.apps.find(app => app.id === appId);
        if (!app) return;
        
        this.selectedApp = app;
        
        const appDetail = document.getElementById('appDetail');
        const appList = document.getElementById('appList');
        
        if (appDetail && appList) {
            appDetail.innerHTML = `
                <div class="app-detail-header">
                    <button class="back-to-list btn btn-secondary">
                        <i class="fas fa-arrow-left"></i> 返回列表
                    </button>
                    <div class="app-detail-info">
                        <div class="app-detail-icon">
                            <i class="${app.icon}"></i>
                        </div>
                        <div class="app-detail-meta">
                            <h3 class="app-detail-name">${app.name}</h3>
                            <div class="app-detail-rating">
                                <i class="fas fa-star"></i> ${app.rating} (${app.downloads.toLocaleString()} 下载)
                            </div>
                            <div class="app-detail-category">
                                <span class="badge badge-info">${app.category}</span>
                                <span class="badge ${app.isFree ? 'badge-success' : 'badge-warning'}">
                                    ${app.isFree ? '免费' : `¥${app.price}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="app-detail-content">
                    <div class="app-detail-description">
                        <h4>应用描述</h4>
                        <p>${app.description}</p>
                    </div>
                    
                    <div class="app-detail-stats">
                        <h4>应用信息</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-label">版本</div>
                                <div class="stat-value">${app.version}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">开发者</div>
                                <div class="stat-value">${app.author}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">已下载</div>
                                <div class="stat-value">${app.downloads.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="app-detail-actions">
                    <button class="btn ${this.installedApps.has(app.id) ? 'btn-danger' : 'btn-success'} btn-lg install-btn" 
                            data-app-id="${app.id}">
                        ${this.installedApps.has(app.id) ? '卸载应用' : '安装应用'}
                    </button>
                </div>
            `;
            
            appList.style.display = 'none';
            appDetail.style.display = 'block';
        }
    }

    showAppList() {
        const appDetail = document.getElementById('appDetail');
        const appList = document.getElementById('appList');
        
        if (appDetail && appList) {
            appDetail.style.display = 'none';
            appList.style.display = 'grid';
            this.selectedApp = null;
        }
    }

    async installApp(appId) {
        const app = this.apps.find(app => app.id === appId);
        if (!app) return;
        
        // 检查是否需要付费
        if (!app.isFree) {
            // 这里可以添加支付流程
            const confirmed = confirm(`确定要购买 "${app.name}" 吗？价格：¥${app.price}`);
            if (!confirmed) return;
        }
        
        // 安装应用
        this.installedApps.add(appId);
        await this.saveInstalledApps();
        
        // 更新界面
        this.updateAppUI(appId);
        
        // 显示通知
        if (typeof notificationSystem !== 'undefined') {
            notificationSystem.showNotification(`${app.name} 已安装成功！`, 'success');
        }
        
        // 触发应用安装事件
        const event = new CustomEvent('appInstalled', { detail: { appId, app } });
        document.dispatchEvent(event);
    }

    async uninstallApp(appId) {
        const app = this.apps.find(app => app.id === appId);
        if (!app) return;
        
        const confirmed = confirm(`确定要卸载 "${app.name}" 吗？`);
        if (!confirmed) return;
        
        // 卸载应用
        this.installedApps.delete(appId);
        await this.saveInstalledApps();
        
        // 更新界面
        this.updateAppUI(appId);
        
        // 显示通知
        if (typeof notificationSystem !== 'undefined') {
            notificationSystem.showNotification(`${app.name} 已卸载成功！`, 'info');
        }
        
        // 触发应用卸载事件
        const event = new CustomEvent('appUninstalled', { detail: { appId, app } });
        document.dispatchEvent(event);
    }

    updateAppUI(appId) {
        // 更新应用卡片
        const appCard = document.querySelector(`.app-card[data-app-id="${appId}"]`);
        if (appCard) {
            const installBtn = appCard.querySelector('.install-btn');
            if (installBtn) {
                installBtn.className = `btn ${this.installedApps.has(appId) ? 'btn-danger' : 'btn-success'} install-btn`;
                installBtn.textContent = this.installedApps.has(appId) ? '卸载' : '安装';
            }
        }
        
        // 更新应用详情
        if (this.selectedApp && this.selectedApp.id === appId) {
            const appDetailInstallBtn = document.querySelector('#appDetail .install-btn');
            if (appDetailInstallBtn) {
                appDetailInstallBtn.className = `btn ${this.installedApps.has(appId) ? 'btn-danger' : 'btn-success'} btn-lg install-btn`;
                appDetailInstallBtn.textContent = this.installedApps.has(appId) ? '卸载应用' : '安装应用';
            }
        }
        
        // 更新统计信息
        const installedStat = document.querySelector('.stats-section .stat-item:nth-child(2) .stat-value');
        if (installedStat) {
            installedStat.textContent = this.installedApps.size;
        }
    }

    /**
     * 从Supabase加载已安装的应用
     * @private
     */
    async loadInstalledAppsFromSupabase() {
        if (!this.supabase || !window.userManagement) return;
        
        try {
            const currentUser = window.userManagement.getCurrentUser();
            if (!currentUser) return;
            
            const { data, error } = await this.supabase
                .from('user_installed_apps')
                .select('app_id')
                .eq('user_id', currentUser.id);
            
            if (data && data.length > 0) {
                this.installedApps = new Set(data.map(item => item.app_id));
                // 同时更新localStorage
                localStorage.setItem('installedApps', JSON.stringify(Array.from(this.installedApps)));
            }
        } catch (error) {
            console.error('从Supabase加载已安装应用失败:', error);
            // 回退到localStorage
            const storedInstalledApps = localStorage.getItem('installedApps');
            if (storedInstalledApps) {
                this.installedApps = new Set(JSON.parse(storedInstalledApps));
            }
        }
    }
    
    /**
     * 保存已安装的应用到存储
     * @private
     */
    async saveInstalledApps() {
        // 先保存到localStorage
        localStorage.setItem('installedApps', JSON.stringify(Array.from(this.installedApps)));
        
        // 如果Supabase可用且用户已登录，同步到数据库
        if (this.supabase && window.userManagement) {
            const currentUser = window.userManagement.getCurrentUser();
            if (currentUser) {
                try {
                    // 先删除所有已存在的记录
                    await this.supabase
                        .from('user_installed_apps')
                        .delete()
                        .eq('user_id', currentUser.id);
                    
                    // 插入新的安装记录
                    if (this.installedApps.size > 0) {
                        const installedAppsData = Array.from(this.installedApps).map(appId => ({
                            user_id: currentUser.id,
                            app_id: appId,
                            installed_at: new Date().toISOString()
                        }));
                        
                        const { error } = await this.supabase
                            .from('user_installed_apps')
                            .insert(installedAppsData);
                        
                        if (error) {
                            console.error('保存已安装应用到Supabase失败:', error);
                        }
                    }
                } catch (error) {
                    console.error('保存已安装应用到Supabase时发生错误:', error);
                }
            }
        }
    }

    getInstalledApps() {
        return Array.from(this.installedApps).map(appId => {
            return this.apps.find(app => app.id === appId);
        }).filter(Boolean);
    }
}

// 创建单例实例
const appCenter = new AppCenter();

// 确保模块加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 直接初始化，由app.js统一管理模块初始化
});

// 导出单例实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = appCenter;
}