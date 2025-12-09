/**
 * 下载任务管理器
 * 管理资源下载队列、进度和历史记录
 */
class DownloadManager {
    constructor() {
        this.downloadQueue = [];
        this.activeDownloads = new Map();
        this.downloadHistory = this.loadDownloadHistory();
        this.maxConcurrentDownloads = 3;
        this.isInitialized = false;
    }

    /**
     * 初始化下载管理器
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.renderDownloadQueue();
        this.renderDownloadHistory();
        
        // 恢复未完成的下载
        this.resumePendingDownloads();
        
        this.isInitialized = true;
        console.log('DownloadManager initialized');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听资源卡片的下载按钮点击
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('download-btn')) {
                const resourceId = e.target.dataset.resourceId;
                if (resourceId) {
                    this.startDownload(resourceId);
                }
            }
        });

        // 监听下载队列中的操作按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('download-action-btn')) {
                const downloadId = e.target.dataset.downloadId;
                const action = e.target.dataset.action;
                
                if (downloadId && action) {
                    this.handleDownloadAction(downloadId, action);
                }
            }
        });
    }

    /**
     * 开始下载资源
     * @param {string} resourceId - 资源ID
     */
    startDownload(resourceId) {
        // 获取资源信息
        const resource = this.getResourceById(resourceId);
        if (!resource) {
            console.error('Resource not found:', resourceId);
            return;
        }

        // 检查是否已经在下载队列中
        const existingDownload = this.downloadQueue.find(d => d.resourceId === resourceId);
        if (existingDownload) {
            console.log('Resource already in download queue:', resourceId);
            return;
        }

        // 创建下载任务
        const downloadTask = {
            id: `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            resourceId,
            resource,
            fileName: resource.fileName || `${resource.title}.${resource.fileType || 'zip'}`,
            url: resource.downloadUrl || '#',
            status: 'pending', // pending, downloading, paused, completed, failed, canceled
            progress: 0,
            speed: 0,
            size: resource.fileSize || 0,
            downloaded: 0,
            startTime: null,
            endTime: null
        };

        // 添加到下载队列
        this.downloadQueue.push(downloadTask);
        
        // 尝试开始下载
        this.processDownloadQueue();
        
        // 更新UI
        this.renderDownloadQueue();
        
        return downloadTask;
    }

    /**
     * 处理下载队列
     */
    processDownloadQueue() {
        const pendingDownloads = this.downloadQueue.filter(d => d.status === 'pending');
        const activeCount = this.activeDownloads.size;
        const availableSlots = this.maxConcurrentDownloads - activeCount;

        if (availableSlots <= 0) return;

        // 开始新的下载
        for (let i = 0; i < Math.min(availableSlots, pendingDownloads.length); i++) {
            const download = pendingDownloads[i];
            this.executeDownload(download);
        }
    }

    /**
     * 执行下载
     * @param {Object} downloadTask - 下载任务对象
     */
    executeDownload(downloadTask) {
        // 更新任务状态
        downloadTask.status = 'downloading';
        downloadTask.startTime = Date.now();
        downloadTask.progress = 0;
        downloadTask.downloaded = 0;
        
        // 添加到活动下载
        this.activeDownloads.set(downloadTask.id, downloadTask);
        
        // 更新UI
        this.renderDownloadQueue();
        
        // 模拟下载进度（实际项目中应使用真实的文件下载）
        this.simulateDownloadProgress(downloadTask);
    }

    /**
     * 模拟下载进度（用于演示）
     * @param {Object} downloadTask - 下载任务对象
     */
    simulateDownloadProgress(downloadTask) {
        const totalSize = downloadTask.size || 100 * 1024 * 1024; // 默认100MB
        const downloadSpeed = Math.random() * 5 + 2; // 2-7 MB/s
        const downloadInterval = Math.min(Math.max(50, Math.floor(1000 / (downloadSpeed * 1024))), 500);
        
        const intervalId = setInterval(() => {
            // 更新下载进度
            const bytesDownloaded = Math.floor((downloadSpeed * 1024 * 1024) * (downloadInterval / 1000));
            downloadTask.downloaded += bytesDownloaded;
            downloadTask.progress = Math.min(100, Math.floor((downloadTask.downloaded / totalSize) * 100));
            downloadTask.speed = downloadSpeed;
            
            // 更新UI
            this.updateDownloadProgress(downloadTask.id);
            
            // 检查是否完成
            if (downloadTask.progress >= 100) {
                clearInterval(intervalId);
                this.completeDownload(downloadTask);
            } else if (downloadTask.status === 'paused' || downloadTask.status === 'canceled') {
                clearInterval(intervalId);
                if (downloadTask.status === 'canceled') {
                    this.cancelDownload(downloadTask.id);
                }
            }
        }, downloadInterval);
        
        // 保存interval ID
        downloadTask.intervalId = intervalId;
    }

    /**
     * 完成下载
     * @param {Object} downloadTask - 下载任务对象
     */
    completeDownload(downloadTask) {
        downloadTask.status = 'completed';
        downloadTask.endTime = Date.now();
        downloadTask.progress = 100;
        
        // 从活动下载中移除
        this.activeDownloads.delete(downloadTask.id);
        
        // 添加到下载历史
        this.addToDownloadHistory(downloadTask);
        
        // 从下载队列中移除
        this.downloadQueue = this.downloadQueue.filter(d => d.id !== downloadTask.id);
        
        // 更新UI
        this.renderDownloadQueue();
        this.renderDownloadHistory();
        
        // 继续处理队列
        this.processDownloadQueue();
        
        // 显示完成通知
        this.showNotification(`下载完成: ${downloadTask.resource.title}`, 'success');
    }

    /**
     * 处理下载操作
     * @param {string} downloadId - 下载ID
     * @param {string} action - 操作类型：pause, resume, cancel
     */
    handleDownloadAction(downloadId, action) {
        const download = this.downloadQueue.find(d => d.id === downloadId);
        if (!download) return;
        
        switch (action) {
            case 'pause':
                this.pauseDownload(downloadId);
                break;
            case 'resume':
                this.resumeDownload(downloadId);
                break;
            case 'cancel':
                this.cancelDownload(downloadId);
                break;
        }
    }

    /**
     * 暂停下载
     * @param {string} downloadId - 下载ID
     */
    pauseDownload(downloadId) {
        const download = this.downloadQueue.find(d => d.id === downloadId);
        if (!download || download.status !== 'downloading') return;
        
        download.status = 'paused';
        
        // 清除interval
        if (download.intervalId) {
            clearInterval(download.intervalId);
            download.intervalId = null;
        }
        
        this.activeDownloads.delete(downloadId);
        this.updateDownloadProgress(downloadId);
        
        // 继续处理队列
        this.processDownloadQueue();
    }

    /**
     * 恢复下载
     * @param {string} downloadId - 下载ID
     */
    resumeDownload(downloadId) {
        const download = this.downloadQueue.find(d => d.id === downloadId);
        if (!download || download.status !== 'paused') return;
        
        // 重新添加到活动下载
        this.executeDownload(download);
    }

    /**
     * 取消下载
     * @param {string} downloadId - 下载ID
     */
    cancelDownload(downloadId) {
        const downloadIndex = this.downloadQueue.findIndex(d => d.id === downloadId);
        if (downloadIndex === -1) return;
        
        const download = this.downloadQueue[downloadIndex];
        
        // 清除interval
        if (download.intervalId) {
            clearInterval(download.intervalId);
            download.intervalId = null;
        }
        
        // 从活动下载中移除
        this.activeDownloads.delete(downloadId);
        
        // 从队列中移除
        this.downloadQueue.splice(downloadIndex, 1);
        
        // 更新UI
        this.renderDownloadQueue();
        
        // 继续处理队列
        this.processDownloadQueue();
        
        this.showNotification(`下载已取消: ${download.resource.title}`, 'info');
    }

    /**
     * 更新下载进度显示
     * @param {string} downloadId - 下载ID
     */
    updateDownloadProgress(downloadId) {
        const progressElement = document.querySelector(`[data-download-id="${downloadId}"] .download-progress`);
        if (progressElement) {
            const download = this.downloadQueue.find(d => d.id === downloadId);
            if (download) {
                progressElement.style.width = `${download.progress}%`;
                progressElement.textContent = `${download.progress}%`;
                
                // 更新速度和剩余时间
                const speedElement = document.querySelector(`[data-download-id="${downloadId}"] .download-speed`);
                const timeElement = document.querySelector(`[data-download-id="${downloadId}"] .download-time`);
                
                if (speedElement && download.status === 'downloading') {
                    speedElement.textContent = this.formatBytes(download.speed * 1024 * 1024, 2) + '/s';
                }
                
                if (timeElement && download.status === 'downloading') {
                    const remainingTime = this.calculateRemainingTime(download);
                    timeElement.textContent = remainingTime;
                }
            }
        }
    }

    /**
     * 计算剩余下载时间
     * @param {Object} download - 下载任务
     * @returns {string} 格式化的剩余时间
     */
    calculateRemainingTime(download) {
        if (download.status !== 'downloading' || download.speed <= 0) return '--';
        
        const remainingBytes = (download.size || 100 * 1024 * 1024) - download.downloaded;
        const remainingSeconds = Math.ceil(remainingBytes / (download.speed * 1024 * 1024));
        
        if (remainingSeconds < 60) return `${remainingSeconds}s`;
        if (remainingSeconds < 3600) return `${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s`;
        return `${Math.floor(remainingSeconds / 3600)}h ${Math.floor((remainingSeconds % 3600) / 60)}m`;
    }

    /**
     * 恢复未完成的下载
     */
    resumePendingDownloads() {
        // 这个方法在实际项目中会从本地存储恢复未完成的下载
        // 这里只是模拟
    }

    /**
     * 添加到下载历史
     * @param {Object} downloadTask - 下载任务
     */
    addToDownloadHistory(downloadTask) {
        const historyItem = {
            id: downloadTask.id,
            resourceId: downloadTask.resourceId,
            resourceTitle: downloadTask.resource.title,
            resourceCategory: downloadTask.resource.category,
            fileName: downloadTask.fileName,
            downloadTime: downloadTask.endTime,
            fileSize: downloadTask.size,
            resource: downloadTask.resource // 保存完整资源信息以便查看
        };
        
        this.downloadHistory.unshift(historyItem);
        
        // 限制历史记录数量
        if (this.downloadHistory.length > 100) {
            this.downloadHistory = this.downloadHistory.slice(0, 100);
        }
        
        this.saveDownloadHistory();
    }

    /**
     * 加载下载历史
     * @returns {Array} 下载历史数组
     */
    loadDownloadHistory() {
        try {
            const saved = localStorage.getItem('downloadHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load download history:', error);
            return [];
        }
    }

    /**
     * 保存下载历史
     */
    saveDownloadHistory() {
        try {
            localStorage.setItem('downloadHistory', JSON.stringify(this.downloadHistory));
        } catch (error) {
            console.error('Failed to save download history:', error);
        }
    }

    /**
     * 清空下载历史
     */
    clearDownloadHistory() {
        this.downloadHistory = [];
        this.saveDownloadHistory();
        this.renderDownloadHistory();
    }

    /**
     * 获取资源信息
     * @param {string} resourceId - 资源ID
     * @returns {Object|null} 资源信息
     */
    getResourceById(resourceId) {
        // 这里应该从ResourceManager或其他数据源获取资源信息
        // 暂时返回一个模拟资源
        const resource = {
            id: resourceId,
            title: `示例资源 ${resourceId}`,
            category: '示例分类',
            tags: ['示例', '资源'],
            fileName: `resource_${resourceId}.zip`,
            fileSize: Math.floor(Math.random() * 50 + 10) * 1024 * 1024, // 10-60 MB
            fileType: 'zip',
            downloadUrl: '#',
            description: '这是一个示例资源',
            rating: 4.5,
            downloads: 1234,
            createdAt: Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        };
        
        return resource;
    }

    /**
     * 渲染下载队列
     */
    renderDownloadQueue() {
        const queueContainer = document.getElementById('download-queue');
        if (!queueContainer) {
            this.createDownloadQueueUI();
            return;
        }
        
        if (this.downloadQueue.length === 0) {
            queueContainer.innerHTML = '<div class="queue-empty">下载队列为空</div>';
            return;
        }
        
        queueContainer.innerHTML = this.downloadQueue.map(download => this.createDownloadQueueItem(download)).join('');
    }

    /**
     * 创建下载队列项
     * @param {Object} download - 下载任务
     * @returns {string} HTML字符串
     */
    createDownloadQueueItem(download) {
        const actionButtons = this.getActionButtons(download);
        
        return `
            <div class="download-item" data-download-id="${download.id}">
                <div class="download-info">
                    <div class="download-title">${download.resource.title}</div>
                    <div class="download-meta">
                        <span class="download-status">${this.getStatusText(download.status)}</span>
                        <span class="download-speed">${download.status === 'downloading' ? this.formatBytes(download.speed * 1024 * 1024, 2) + '/s' : ''}</span>
                        <span class="download-time">${download.status === 'downloading' ? this.calculateRemainingTime(download) : ''}</span>
                    </div>
                </div>
                <div class="download-progress-container">
                    <div class="download-progress" style="width: ${download.progress}%;">${download.progress}%</div>
                </div>
                <div class="download-actions">
                    ${actionButtons}
                </div>
            </div>
        `;
    }

    /**
     * 获取操作按钮
     * @param {Object} download - 下载任务
     * @returns {string} HTML字符串
     */
    getActionButtons(download) {
        switch (download.status) {
            case 'downloading':
                return `
                    <button class="download-action-btn" data-download-id="${download.id}" data-action="pause" title="暂停">
                        <i class="fas fa-pause"></i>
                    </button>
                    <button class="download-action-btn" data-download-id="${download.id}" data-action="cancel" title="取消">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            case 'paused':
                return `
                    <button class="download-action-btn" data-download-id="${download.id}" data-action="resume" title="继续">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="download-action-btn" data-download-id="${download.id}" data-action="cancel" title="取消">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            case 'pending':
                return `
                    <button class="download-action-btn" data-download-id="${download.id}" data-action="cancel" title="取消">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            default:
                return '';
        }
    }

    /**
     * 获取状态文本
     * @param {string} status - 状态
     * @returns {string} 状态文本
     */
    getStatusText(status) {
        const statusMap = {
            pending: '等待中',
            downloading: '下载中',
            paused: '已暂停',
            completed: '已完成',
            failed: '下载失败',
            canceled: '已取消'
        };
        
        return statusMap[status] || status;
    }

    /**
     * 渲染下载历史
     */
    renderDownloadHistory() {
        const historyContainer = document.getElementById('download-history');
        if (!historyContainer) {
            this.createDownloadHistoryUI();
            return;
        }
        
        if (this.downloadHistory.length === 0) {
            historyContainer.innerHTML = '<div class="history-empty">下载历史为空</div>';
            return;
        }
        
        historyContainer.innerHTML = this.downloadHistory.map(history => this.createHistoryItem(history)).join('');
    }

    /**
     * 创建历史记录项
     * @param {Object} history - 历史记录
     * @returns {string} HTML字符串
     */
    createHistoryItem(history) {
        return `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-title">${history.resourceTitle}</div>
                    <div class="history-meta">
                        <span class="history-category">${history.resourceCategory}</span>
                        <span class="history-date">${this.formatDate(history.downloadTime)}</span>
                        <span class="history-size">${this.formatBytes(history.fileSize)}</span>
                    </div>
                </div>
                <div class="history-actions">
                    <button class="history-action-btn" data-history-id="${history.id}" title="重新下载">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="history-action-btn" data-history-id="${history.id}" title="查看详情">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 创建下载队列UI
     */
    createDownloadQueueUI() {
        const container = document.createElement('div');
        container.id = 'download-queue';
        container.className = 'download-queue';
        container.innerHTML = '<div class="queue-empty">下载队列为空</div>';
        
        // 找到合适的位置插入
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(container);
        }
    }

    /**
     * 创建下载历史UI
     */
    createDownloadHistoryUI() {
        const container = document.createElement('div');
        container.id = 'download-history';
        container.className = 'download-history';
        container.innerHTML = '<div class="history-empty">下载历史为空</div>';
        
        // 找到合适的位置插入
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(container);
        }
    }

    /**
     * 显示通知
     * @param {string} message - 消息内容
     * @param {string} type - 类型：success, error, warning, info
     */
    showNotification(message, type = 'info') {
        // 这里可以集成现有的通知系统
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // 简单实现
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : type === 'warning' ? '#FF9800' : '#2196F3'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.opacity = '1', 100);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    /**
     * 格式化字节大小
     * @param {number} bytes - 字节数
     * @param {number} decimals - 小数位数
     * @returns {string} 格式化的字符串
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * 格式化日期
     * @param {number} timestamp - 时间戳
     * @returns {string} 格式化的日期字符串
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 获取下载统计信息
     * @returns {Object} 统计信息
     */
    getDownloadStats() {
        return {
            totalDownloads: this.downloadHistory.length,
            activeDownloads: this.activeDownloads.size,
            queueLength: this.downloadQueue.length,
            totalSize: this.downloadHistory.reduce((total, history) => total + (history.fileSize || 0), 0),
            todayDownloads: this.downloadHistory.filter(h => this.isToday(h.downloadTime)).length
        };
    }

    /**
     * 检查是否是今天
     * @param {number} timestamp - 时间戳
     * @returns {boolean} 是否是今天
     */
    isToday(timestamp) {
        const today = new Date();
        const date = new Date(timestamp);
        
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    /**
     * 批量下载资源
     * @param {Array<string>} resourceIds - 资源ID数组
     */
    batchDownload(resourceIds) {
        resourceIds.forEach(resourceId => {
            this.startDownload(resourceId);
        });
        
        this.showNotification(`已添加 ${resourceIds.length} 个资源到下载队列`, 'success');
    }
}

// 创建全局实例
const downloadManager = new DownloadManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    downloadManager.initialize();
});

// 导出模块（如果支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DownloadManager;
}