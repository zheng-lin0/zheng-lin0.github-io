// 浏览器系统模块
class BrowserSystem {
    constructor() {
        this.state = {
            tabs: {},
            activeTab: null,
            history: []
        };
        this.initialized = false;
    }

    // 初始化浏览器系统
    init() {
        if (this.initialized) return;
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 创建默认标签页
        this.createNewTab();
        
        this.initialized = true;
        console.log('BrowserSystem initialized');
    }

    // 设置事件监听
    setupEventListeners() {
        // 键盘快捷键支持
        document.addEventListener('keydown', (event) => this.handleKeyboardShortcuts(event));
        
        // iframe加载完成事件
        const iframe = document.getElementById('browserIframe');
        if (iframe) {
            iframe.onload = () => this.iframeLoaded();
            iframe.onerror = (error) => this.handleBrowserError(error);
        }
        
        // URL输入框回车键
        const urlInput = document.getElementById('browserUrl');
        if (urlInput) {
            urlInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.navigate();
                }
            });
        }
    }

    // 创建新标签页
    createNewTab() {
        const tabId = 'tab_' + Date.now();
        const tabsContainer = document.getElementById('browserTabs');
        
        // 添加空值检查
        if (!tabsContainer) {
            console.error('浏览器标签容器未找到，无法创建新标签页');
            return;
        }
        
        // 创建新标签页元素
        const newTab = document.createElement('div');
        newTab.className = 'browser-tab';
        newTab.setAttribute('data-tab-id', tabId);
        newTab.innerHTML = `
            <div class="tab-favicon">
                <i class="fas fa-plus"></i>
            </div>
            <div class="tab-title">新标签页</div>
            <div class="tab-close" onclick="browserSystem.closeTab(this)">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        // 设置初始样式和动画
        newTab.style.opacity = '0';
        newTab.style.transform = 'scale(0.8)';
        newTab.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        tabsContainer.appendChild(newTab);
        
        // 触发动画
        setTimeout(() => {
            newTab.style.opacity = '1';
            newTab.style.transform = 'scale(1)';
        }, 10);
        
        // 初始化标签页状态
        this.state.tabs[tabId] = {
            url: 'about:blank',
            title: '新标签页',
            history: [],
            historyIndex: -1
        };
        
        // 激活新标签页
        this.switchTab(tabId);
        
        notificationSystem.showNotification('新标签页已创建', 'success');
        this.logUserActivity('创建新标签页', { tabId: tabId });
    }

    // 关闭标签页
    closeTab(element) {
        const tab = element.closest('.browser-tab');
        const tabId = tab.getAttribute('data-tab-id');
        const tabsContainer = document.getElementById('browserTabs');
        
        if (tabsContainer.children.length <= 1) {
            notificationSystem.showNotification('不能关闭最后一个标签页', 'warning');
            return;
        }
        
        const isActive = tab.classList.contains('active');
        
        // 添加关闭动画
        tab.style.opacity = '0';
        tab.style.transform = 'scale(0.8)';
        tab.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            tab.remove();
            
            // 删除标签页状态
            delete this.state.tabs[tabId];
            
            // 如果关闭的是当前激活的标签，激活前一个标签
            if (isActive) {
                const remainingTabs = tabsContainer.querySelectorAll('.browser-tab');
                if (remainingTabs.length > 0) {
                    const lastTab = remainingTabs[remainingTabs.length - 1];
                    this.switchTab(lastTab.getAttribute('data-tab-id'));
                }
            }
            
            notificationSystem.showNotification('标签页已关闭', 'info');
        }, 300);
        
        this.logUserActivity('关闭标签页', { tabId: tabId });
    }

    // 记录用户活动
    logUserActivity(action, details = {}) {
        // 简单实现 - 可以根据需要扩展
        console.log(`用户活动: ${action}`, details);
        
        // 可以在这里添加更复杂的日志记录逻辑，如发送到服务器等
        // 注意：在生产环境中可能需要更完善的日志系统
    }

    // 切换标签页
    switchTab(tabId) {
        // 更新标签页状态
        const tabs = document.querySelectorAll('.browser-tab');
        const currentActiveTab = document.querySelector('.browser-tab.active');
        
        // 添加淡出动画到当前激活标签
        if (currentActiveTab) {
            currentActiveTab.style.opacity = '0.5';
            currentActiveTab.style.transition = 'opacity 0.2s ease';
        }
        
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            
            // 添加淡入动画到新激活标签
            activeTab.style.opacity = '1';
            activeTab.style.transform = 'scale(1.05)';
            activeTab.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            
            setTimeout(() => {
                activeTab.style.transform = 'scale(1)';
            }, 200);
        }
        
        // 更新浏览器状态
        this.state.activeTab = tabId;
        const tabState = this.state.tabs[tabId];
        
        // 更新地址栏
        const urlInput = document.getElementById('browserUrl');
        if (urlInput && tabState) {
            urlInput.value = tabState.url;
        }
        
        // 加载标签页内容
        if (tabState) {
            this.loadUrl(tabState.url);
        }
        
        this.logUserActivity('切换标签页', { tabId: tabId });
    }

    // 导航到指定URL
    navigate() {
        const urlInput = document.getElementById('browserUrl');
        let url = urlInput.value.trim();
        
        if (!url) {
            notificationSystem.showNotification('请输入网址', 'warning');
            return;
        }
        
        // 处理URL格式
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (url.includes('.') && !url.includes(' ')) {
                url = 'https://' + url;
            } else {
                // 不支持搜索功能，只接受有效的URL
                notificationSystem.showNotification('请输入有效的网址（需要包含http://或https://，或者包含域名）', 'warning');
                return;
            }
        }
        
        this.loadUrl(url);
    }

    // 更新浏览器状态栏
    updateBrowserStatus(message) {
        const statusElement = document.getElementById('browserStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    // 加载URL
    loadUrl(url) {
        const iframe = document.getElementById('browserIframe');
        const loading = document.getElementById('iframeLoading');
        
        // 检查必要元素是否存在
    if (!iframe || !loading) {
        console.error('无法找到浏览器iframe或加载指示器');
        return;
    }
    
    // 不重新设置sandbox属性，保持在HTML中设置的更严格的权限
    
    // 显示加载状态
    loading.classList.add('show');
    iframe.classList.add('loading');
    this.updateBrowserStatus('正在加载: ' + url);
        
        // 更新当前标签页状态
        const tabId = this.state.activeTab;
        const tabState = this.state.tabs[tabId];
        
        if (tabState) {
            // 添加到历史记录
            if (tabState.url !== url) {
                tabState.history = tabState.history.slice(0, tabState.historyIndex + 1);
                tabState.history.push(url);
                tabState.historyIndex = tabState.history.length - 1;
            }
            
            tabState.url = url;
            
            // 更新标签页标题
            const activeTab = document.querySelector(`[data-tab-id="${tabId}"]`);
            if (activeTab) {
                const titleElement = activeTab.querySelector('.tab-title');
                titleElement.textContent = '加载中...';
            }
            
            // 设置超时机制，确保加载状态最终会被隐藏
            const loadTimeout = setTimeout(() => {
                if (loading && loading.classList.contains('show')) {
                    loading.classList.remove('show');
                    loading.classList.add('hide');
                    if (iframe) {
                        iframe.classList.remove('loading');
                    }
                    setTimeout(() => {
                        if (loading) {
                            loading.style.display = 'none';
                            loading.classList.remove('hide');
                        }
                    }, 300);
                    this.updateBrowserStatus('页面加载超时');
                    if (window.notificationSystem) {
                        notificationSystem.showNotification('页面加载超时，请检查网络连接', 'warning');
                    }
                }
            }, 10000); // 10秒超时
            
            // 保存超时ID以便清理
            tabState.loadTimeout = loadTimeout;
        }
        
        // 加载URL
        iframe.src = url;
        
        // 添加到全局历史记录
        this.addToHistory(url);
    }

    // iframe加载完成
    iframeLoaded() {
        try {
            const iframe = document.getElementById('browserIframe');
            const loading = document.getElementById('iframeLoading');
            const tabId = this.state.activeTab;
            const tabState = this.state.tabs[tabId];
            
            // 清理超时定时器
            if (tabState && tabState.loadTimeout) {
                clearTimeout(tabState.loadTimeout);
                delete tabState.loadTimeout;
            }
            
            // 隐藏加载状态（使用动画效果）
            if (loading) {
                loading.classList.remove('show');
                loading.classList.add('hide');
                if (iframe) {
                    iframe.classList.remove('loading');
                }
                
                setTimeout(() => {
                    loading.style.display = 'none';
                    loading.classList.remove('hide');
                }, 300);
            }
            
            // 尝试获取页面标题和favicon，但要防止跨域错误
            if (tabState) {
                let title = '外部页面';
                let canAccessContent = false;
                
                // 检查iframe是否存在
                if (iframe) {
                    try {
                        // 防止iframe访问父窗口，增强安全性
                        Object.defineProperty(iframe.contentWindow, 'top', {
                            get: () => iframe.contentWindow,
                            set: () => {}
                        });
                        Object.defineProperty(iframe.contentWindow, 'parent', {
                            get: () => iframe.contentWindow,
                            set: () => {}
                        });
                        
                        // 使用更安全的方式检查是否可以访问iframe内容
                        // 不直接访问location.href，而是尝试访问document对象的一个安全属性
                        const contentWindow = iframe.contentWindow;
                        if (contentWindow && contentWindow.document) {
                            // 尝试访问document.domain或其他安全属性来检查可访问性
                            const doc = contentWindow.document;
                            // 尝试访问document.readyState，这通常是跨域安全的
                            const readyState = doc.readyState;
                            if (readyState) {
                                // 如果能访问document属性，那么可以安全地假设可以访问其他内容
                                canAccessContent = true;
                            }
                        }
                    } catch (crossOriginError) {
                        // 捕获跨域错误，不进行任何操作
                        // console.log('跨域限制：无法访问iframe内容', crossOriginError);
                    }
                    
                    // 作为备选方案，使用更安全的方式检查
                    // 直接检查iframe的src属性而不是尝试访问内容
                    const iframeSrc = iframe.src;
                    if (iframeSrc) {
                        // 如果iframe有src属性，尝试从URL中提取标题
                        title = iframeSrc.split('/')[2] || '外部页面';
                    }
                    
                    if (canAccessContent) {
                        try {
                            const doc = iframe.contentDocument || iframe.contentWindow.document;
                            title = doc.title || '未知页面';
                            
                            // 更新标签页标题
                            const activeTab = document.querySelector(`[data-tab-id="${tabId}"]`);
                            if (activeTab) {
                                const titleElement = activeTab.querySelector('.tab-title');
                                titleElement.textContent = title;
                                
                                // 更新favicon
                                const faviconElement = activeTab.querySelector('.tab-favicon');
                                try {
                                    const favicon = doc.querySelector('link[rel*="icon"]');
                                    if (favicon) {
                                        faviconElement.innerHTML = `<img src="${favicon.href}" alt="favicon" style="width:16px;height:16px;border-radius:2px;">`;
                                    } else {
                                        faviconElement.innerHTML = '<i class="fas fa-globe"></i>';
                                    }
                                } catch (faviconError) {
                                    // 跨域限制，无法获取favicon
                                    faviconElement.innerHTML = '<i class="fas fa-globe"></i>';
                                }
                            }
                        } catch (contentError) {
                            // 跨域或其他错误，使用默认标题
                            console.error('获取iframe内容失败:', contentError);
                            title = '外部页面';
                        }
                    } else {
                        // 跨域限制，使用默认标题
                        title = '外部页面';
                    }
                }
                
                // 更新标签页状态
                tabState.title = title;
                
                // 更新浏览器状态栏
                this.updateBrowserStatus('页面加载完成: ' + title);
                
                // 显示通知
                if (canAccessContent) {
                    notificationSystem.showNotification('页面加载完成', 'success');
                } else {
                    notificationSystem.showNotification('页面加载完成（受跨域限制）', 'info');
                }
            }
        } catch (error) {
            console.error('iframe加载完成处理失败:', error);
            // 确保加载状态被隐藏
            const loading = document.getElementById('iframeLoading');
            if (loading) {
                loading.classList.remove('show');
                loading.style.display = 'none';
            }
            const iframe = document.getElementById('browserIframe');
            if (iframe) {
                iframe.classList.remove('loading');
            }
        }
    }

    // 浏览器后退
    browserBack() {
        const tabId = this.state.activeTab;
        const tabState = this.state.tabs[tabId];
        
        if (tabState.historyIndex > 0) {
            tabState.historyIndex--;
            const previousUrl = tabState.history[tabState.historyIndex];
            this.loadUrl(previousUrl);
        } else {
            notificationSystem.showNotification('没有更多历史记录', 'info');
        }
    }

    // 浏览器前进
    browserForward() {
        const tabId = this.state.activeTab;
        const tabState = this.state.tabs[tabId];
        
        if (tabState.historyIndex < tabState.history.length - 1) {
            tabState.historyIndex++;
            const nextUrl = tabState.history[tabState.historyIndex];
            this.loadUrl(nextUrl);
        } else {
            notificationSystem.showNotification('没有更多历史记录', 'info');
        }
    }

    // 刷新页面
    refreshBrowser() {
        const tabId = this.state.activeTab;
        const tabState = this.state.tabs[tabId];
        this.loadUrl(tabState.url);
    }

    // 回到主页
    browserHome() {
        this.loadHomePage();
    }

    // 加载主页
    loadHomePage() {
        const homeUrl = 'about:blank';
        document.getElementById('browserUrl').value = homeUrl;
        this.loadUrl(homeUrl);
    }

    // 错误处理增强
    handleBrowserError(error) {
        console.error('浏览器错误:', error);
        
        const errorMessages = {
            'net::ERR_NAME_NOT_RESOLVED': '无法解析域名，请检查网络连接',
            'net::ERR_CONNECTION_REFUSED': '连接被拒绝，服务器可能已关闭',
            'net::ERR_CONNECTION_TIMED_OUT': '连接超时，请检查网络连接',
            'net::ERR_CERT_COMMON_NAME_INVALID': '证书错误，网站可能不安全'
        };
        
        const message = errorMessages[error.message] || '页面加载失败，请重试';
        notificationSystem.showNotification(message, 'error');
        this.updateBrowserStatus('加载失败: ' + message);
    }

    // 键盘快捷键支持
    handleKeyboardShortcuts(event) {
        // Ctrl+T: 新建标签页
        if (event.ctrlKey && event.key === 't') {
            event.preventDefault();
            this.createNewTab();
        }
        
        // Ctrl+W: 关闭当前标签页
        if (event.ctrlKey && event.key === 'w') {
            event.preventDefault();
            const activeTab = document.querySelector('.browser-tab.active');
            if (activeTab) {
                this.closeTab(activeTab.querySelector('.tab-close'));
            }
        }
        
        // F5: 刷新页面
        if (event.key === 'F5') {
            event.preventDefault();
            this.refreshBrowser();
        }
        
        // Alt+Home: 回到主页
        if (event.altKey && event.key === 'Home') {
            event.preventDefault();
            this.browserHome();
        }
    }

    // 浏览器性能优化
    optimizePerformance() {
        // 清理内存泄漏
        const iframe = document.getElementById('browserIframe');
        if (iframe) {
            // 重置iframe以释放内存
            iframe.src = 'about:blank';
        }
        
        // 清理过期的定时器
        for (const tabId in this.state.tabs) {
            const tabState = this.state.tabs[tabId];
            if (tabState.loadTimeout) {
                clearTimeout(tabState.loadTimeout);
                delete tabState.loadTimeout;
            }
        }
        
        // 强制垃圾回收（如果浏览器支持）
        if (window.gc) {
            window.gc();
        }
        
        notificationSystem.showNotification('浏览器性能已优化', 'success');
    }

    // 切换书签侧边栏
    toggleBookmarks() {
        const sidebar = document.getElementById('browserSidebar');
        if (sidebar.style.display === 'none') {
            sidebar.style.display = 'flex';
            this.updateBrowserStatus('书签侧边栏已打开');
        } else {
            sidebar.style.display = 'none';
            this.updateBrowserStatus('书签侧边栏已关闭');
        }
    }

    // 下载当前页面
    downloadPage() {
        const tabId = this.state.activeTab;
        const tabState = this.state.tabs[tabId];
        
        const link = document.createElement('a');
        link.href = tabState.url;
        link.download = tabState.title + '.html';
        link.click();
        
        notificationSystem.showNotification('页面下载链接已创建', 'success');
    }

    // 添加到历史记录
    addToHistory(url) {
        const historyItem = {
            url: url,
            title: '正在加载...',
            timestamp: new Date().toLocaleString(),
            visitCount: 1
        };
        
        // 检查是否已存在
        const existingIndex = this.state.history.findIndex(item => item.url === url);
        if (existingIndex !== -1) {
            this.state.history[existingIndex].visitCount++;
            this.state.history[existingIndex].timestamp = historyItem.timestamp;
        } else {
            this.state.history.unshift(historyItem);
            // 限制历史记录数量
            if (this.state.history.length > 100) {
                this.state.history.pop();
            }
        }
        
        this.updateHistoryDisplay();
    }

    // 更新历史记录显示
    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        historyList.innerHTML = this.state.history.map(item => `
            <div class="history-item" onclick="browserSystem.loadUrl('${item.url}')">
                <i class="fas fa-clock"></i>
                <div class="history-details">
                    <div class="history-title">${item.title}</div>
                    <div class="history-url">${item.url}</div>
                    <div class="history-time">${item.timestamp} (访问 ${item.visitCount} 次)</div>
                </div>
            </div>
        `).join('');
    }
}

// 添加到全局变量
window.BrowserSystem = BrowserSystem;
// 创建全局实例
window.browserSystem = new BrowserSystem();
