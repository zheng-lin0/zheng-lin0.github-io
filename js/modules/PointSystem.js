/**
 * 积分和兑换系统
 * 管理用户积分、积分获取、消费和兑换功能
 */
class PointSystem {
    constructor() {
        this.currentPoints = this.loadPoints();
        this.pointHistory = this.loadPointHistory();
        this.redeemHistory = this.loadRedeemHistory();
        this.redeemItems = this.loadRedeemItems();
        this.isInitialized = false;
        
        // 积分规则配置
        this.pointRules = {
            // 积分获取规则
            earn: {
                dailyLogin: 10,
                register: 100,
                shareResource: 20,
                commentResource: 15,
                rateResource: 10,
                uploadResource: 50,
                resourceDownloaded: 5, // 他人下载自己上传的资源
                inviteFriend: 50
            },
            // 积分消费规则
            spend: {
                downloadPremiumResource: 5,
                removeAds: 100,
                priorityDownload: 20
            },
            // 积分上限
            limits: {
                dailyMax: 200,
                monthlyMax: 5000
            }
        };
    }

    /**
     * 初始化积分系统
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.updatePointsDisplay();
        this.renderRedeemItems();
        this.renderPointHistory();
        
        // 检查每日登录奖励
        this.checkDailyLoginReward();
        
        this.isInitialized = true;
        console.log('PointSystem initialized');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 积分消费事件监听
        document.addEventListener('click', (e) => {
            // 处理下载付费资源
            if (e.target.classList.contains('download-premium-btn')) {
                const resourceId = e.target.dataset.resourceId;
                const resource = this.getResourceById(resourceId);
                
                if (resource) {
                    const cost = this.pointRules.spend.downloadPremiumResource;
                    if (this.hasEnoughPoints(cost)) {
                        if (this.spendPoints(cost, 'download', `下载付费资源: ${resource.title}`)) {
                            // 继续下载流程
                            this.triggerDownload(resourceId);
                        }
                    } else {
                        this.showNotification('积分不足，无法下载该资源', 'error');
                    }
                }
            }
            
            // 处理兑换商品
            if (e.target.classList.contains('redeem-item-btn')) {
                const itemId = e.target.dataset.itemId;
                this.redeemItem(itemId);
            }
        });
        
        // 积分获取事件监听
        document.addEventListener('shareResource', (e) => {
            this.earnPoints(this.pointRules.earn.shareResource, 'share', `分享资源: ${e.detail.resourceTitle}`);
        });
        
        document.addEventListener('commentResource', (e) => {
            this.earnPoints(this.pointRules.earn.commentResource, 'comment', `评论资源: ${e.detail.resourceTitle}`);
        });
        
        document.addEventListener('rateResource', (e) => {
            this.earnPoints(this.pointRules.earn.rateResource, 'rate', `评价资源: ${e.detail.resourceTitle}`);
        });
    }

    /**
     * 获取用户当前积分
     * @returns {number} 当前积分
     */
    getPoints() {
        return this.currentPoints;
    }

    /**
     * 检查是否有足够的积分
     * @param {number} amount - 需要的积分数量
     * @returns {boolean} 是否有足够积分
     */
    hasEnoughPoints(amount) {
        return this.currentPoints >= amount;
    }

    /**
     * 赚取积分
     * @param {number} amount - 赚取的积分数量
     * @param {string} type - 积分类型：login, register, share, comment, rate, upload, downloaded, invite
     * @param {string} description - 积分变动描述
     * @returns {boolean} 是否成功赚取积分
     */
    earnPoints(amount, type, description) {
        // 检查每日积分上限
        const todayEarned = this.getTodayEarnedPoints();
        if (todayEarned + amount > this.pointRules.limits.dailyMax) {
            this.showNotification(`今日积分已达上限 (${this.pointRules.limits.dailyMax}分)`, 'warning');
            return false;
        }
        
        // 检查月度积分上限
        const monthlyEarned = this.getMonthlyEarnedPoints();
        if (monthlyEarned + amount > this.pointRules.limits.monthlyMax) {
            this.showNotification(`本月积分已达上限 (${this.pointRules.limits.monthlyMax}分)`, 'warning');
            return false;
        }
        
        // 增加积分
        this.currentPoints += amount;
        
        // 记录积分历史
        const historyItem = {
            id: `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'earn',
            subType: type,
            amount: amount,
            description: description,
            timestamp: Date.now(),
            balance: this.currentPoints
        };
        
        this.pointHistory.unshift(historyItem);
        
        // 限制历史记录数量
        if (this.pointHistory.length > 100) {
            this.pointHistory = this.pointHistory.slice(0, 100);
        }
        
        // 保存数据
        this.savePoints();
        this.savePointHistory();
        
        // 更新显示
        this.updatePointsDisplay();
        this.renderPointHistory();
        
        // 显示通知
        this.showNotification(`获得 ${amount} 积分: ${description}`, 'success');
        
        return true;
    }

    /**
     * 消费积分
     * @param {number} amount - 消费的积分数量
     * @param {string} type - 消费类型：download, removeAds, priority
     * @param {string} description - 积分变动描述
     * @returns {boolean} 是否成功消费积分
     */
    spendPoints(amount, type, description) {
        if (!this.hasEnoughPoints(amount)) {
            this.showNotification('积分不足', 'error');
            return false;
        }
        
        // 扣除积分
        this.currentPoints -= amount;
        
        // 记录积分历史
        const historyItem = {
            id: `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'spend',
            subType: type,
            amount: amount,
            description: description,
            timestamp: Date.now(),
            balance: this.currentPoints
        };
        
        this.pointHistory.unshift(historyItem);
        
        // 限制历史记录数量
        if (this.pointHistory.length > 100) {
            this.pointHistory = this.pointHistory.slice(0, 100);
        }
        
        // 保存数据
        this.savePoints();
        this.savePointHistory();
        
        // 更新显示
        this.updatePointsDisplay();
        this.renderPointHistory();
        
        // 显示通知
        this.showNotification(`消费 ${amount} 积分: ${description}`, 'info');
        
        return true;
    }

    /**
     * 兑换商品
     * @param {string} itemId - 商品ID
     * @returns {boolean} 是否兑换成功
     */
    redeemItem(itemId) {
        const item = this.redeemItems.find(i => i.id === itemId);
        if (!item) {
            this.showNotification('商品不存在', 'error');
            return false;
        }
        
        if (!this.hasEnoughPoints(item.points)) {
            this.showNotification('积分不足，无法兑换该商品', 'error');
            return false;
        }
        
        if (item.stock <= 0) {
            this.showNotification('商品已售罄', 'error');
            return false;
        }
        
        // 扣除积分
        if (this.spendPoints(item.points, 'redeem', `兑换商品: ${item.name}`)) {
            // 减少商品库存
            item.stock--;
            
            // 记录兑换历史
            const redeemHistoryItem = {
                id: `redeem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                itemId: item.id,
                itemName: item.name,
                points: item.points,
                timestamp: Date.now(),
                status: 'pending', // pending, processing, completed, canceled
                orderId: `ORD${Date.now()}`
            };
            
            this.redeemHistory.unshift(redeemHistoryItem);
            
            // 保存数据
            this.saveRedeemItems();
            this.saveRedeemHistory();
            
            // 更新显示
            this.renderRedeemItems();
            
            // 显示通知
            this.showNotification(`成功兑换商品: ${item.name}`, 'success');
            
            // 模拟处理订单
            setTimeout(() => {
                this.processRedeemOrder(redeemHistoryItem.id);
            }, 2000);
            
            return true;
        }
        
        return false;
    }

    /**
     * 处理兑换订单
     * @param {string} historyId - 兑换历史ID
     */
    processRedeemOrder(historyId) {
        const historyItem = this.redeemHistory.find(h => h.id === historyId);
        if (historyItem) {
            historyItem.status = 'completed';
            this.saveRedeemHistory();
            this.renderPointHistory();
            
            this.showNotification(`兑换订单 ${historyItem.orderId} 已完成`, 'success');
        }
    }

    /**
     * 检查每日登录奖励
     */
    checkDailyLoginReward() {
        const lastLoginDate = localStorage.getItem('lastLoginDate');
        const today = new Date().toDateString();
        
        if (lastLoginDate !== today) {
            // 发放每日登录奖励
            this.earnPoints(this.pointRules.earn.dailyLogin, 'login', '每日登录奖励');
            localStorage.setItem('lastLoginDate', today);
        }
    }

    /**
     * 获取今日已赚取积分
     * @returns {number} 今日赚取积分
     */
    getTodayEarnedPoints() {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const todayEnd = new Date().setHours(23, 59, 59, 999);
        
        return this.pointHistory
            .filter(h => h.type === 'earn' && h.timestamp >= todayStart && h.timestamp <= todayEnd)
            .reduce((total, h) => total + h.amount, 0);
    }

    /**
     * 获取本月已赚取积分
     * @returns {number} 本月赚取积分
     */
    getMonthlyEarnedPoints() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).setHours(0, 0, 0, 0);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).setHours(23, 59, 59, 999);
        
        return this.pointHistory
            .filter(h => h.type === 'earn' && h.timestamp >= monthStart && h.timestamp <= monthEnd)
            .reduce((total, h) => total + h.amount, 0);
    }

    /**
     * 更新积分显示
     */
    updatePointsDisplay() {
        const pointsDisplay = document.getElementById('current-points');
        if (pointsDisplay) {
            pointsDisplay.textContent = this.currentPoints;
        }
        
        // 更新导航栏积分显示
        const navPointsDisplay = document.querySelector('.nav-points');
        if (navPointsDisplay) {
            navPointsDisplay.textContent = this.currentPoints;
        }
    }

    /**
     * 渲染兑换商品
     */
    renderRedeemItems() {
        const redeemContainer = document.getElementById('redeem-items');
        if (!redeemContainer) {
            this.createRedeemUI();
            return;
        }
        
        if (this.redeemItems.length === 0) {
            redeemContainer.innerHTML = '<div class="redeem-empty">暂无兑换商品</div>';
            return;
        }
        
        redeemContainer.innerHTML = this.redeemItems.map(item => this.createRedeemItemHTML(item)).join('');
    }

    /**
     * 创建兑换商品HTML
     * @param {Object} item - 商品信息
     * @returns {string} HTML字符串
     */
    createRedeemItemHTML(item) {
        const canRedeem = this.hasEnoughPoints(item.points) && item.stock > 0;
        
        return `
            <div class="redeem-item">
                <div class="redeem-item-image">
                    <i class="fas fa-gift"></i>
                </div>
                <div class="redeem-item-info">
                    <div class="redeem-item-name">${item.name}</div>
                    <div class="redeem-item-description">${item.description}</div>
                    <div class="redeem-item-meta">
                        <span class="redeem-item-points"><i class="fas fa-coins"></i> ${item.points} 积分</span>
                        <span class="redeem-item-stock">库存: ${item.stock}</span>
                    </div>
                </div>
                <div class="redeem-item-actions">
                    <button class="redeem-item-btn ${!canRedeem ? 'disabled' : ''}" 
                            data-item-id="${item.id}" 
                            ${!canRedeem ? 'disabled' : ''}>
                        ${canRedeem ? '立即兑换' : (item.stock <= 0 ? '已售罄' : '积分不足')}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 渲染积分历史
     */
    renderPointHistory() {
        const historyContainer = document.getElementById('point-history');
        if (!historyContainer) {
            this.createPointHistoryUI();
            return;
        }
        
        if (this.pointHistory.length === 0) {
            historyContainer.innerHTML = '<div class="history-empty">暂无积分记录</div>';
            return;
        }
        
        historyContainer.innerHTML = this.pointHistory.slice(0, 20).map(history => this.createPointHistoryHTML(history)).join('');
    }

    /**
     * 创建积分历史HTML
     * @param {Object} history - 积分历史
     * @returns {string} HTML字符串
     */
    createPointHistoryHTML(history) {
        const isEarn = history.type === 'earn';
        const amountClass = isEarn ? 'earn-amount' : 'spend-amount';
        const amountText = isEarn ? `+${history.amount}` : `-${history.amount}`;
        const typeIcon = isEarn ? 'fas fa-plus-circle' : 'fas fa-minus-circle';
        const typeText = isEarn ? '收入' : '支出';
        
        return `
            <div class="point-history-item">
                <div class="history-icon ${amountClass}">
                    <i class="${typeIcon}"></i>
                </div>
                <div class="history-details">
                    <div class="history-description">${history.description}</div>
                    <div class="history-time">${this.formatDate(history.timestamp)}</div>
                    <div class="history-type">${typeText} · ${this.getSubTypeText(history.subType)}</div>
                </div>
                <div class="history-amount ${amountClass}">
                    ${amountText}
                </div>
                <div class="history-balance">
                    余额: ${history.balance}
                </div>
            </div>
        `;
    }

    /**
     * 获取积分子类型文本
     * @param {string} subType - 子类型
     * @returns {string} 子类型文本
     */
    getSubTypeText(subType) {
        const typeMap = {
            login: '登录',
            register: '注册',
            share: '分享',
            comment: '评论',
            rate: '评价',
            upload: '上传',
            downloaded: '被下载',
            invite: '邀请',
            download: '下载',
            removeAds: '移除广告',
            priority: '优先下载',
            redeem: '兑换'
        };
        
        return typeMap[subType] || subType;
    }

    /**
     * 创建兑换UI
     */
    createRedeemUI() {
        const container = document.createElement('div');
        container.id = 'redeem-items';
        container.className = 'redeem-items';
        container.innerHTML = '<div class="redeem-empty">暂无兑换商品</div>';
        
        // 找到合适的位置插入
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(container);
        }
    }

    /**
     * 创建积分历史UI
     */
    createPointHistoryUI() {
        const container = document.createElement('div');
        container.id = 'point-history';
        container.className = 'point-history';
        container.innerHTML = '<div class="history-empty">暂无积分记录</div>';
        
        // 找到合适的位置插入
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(container);
        }
    }

    /**
     * 获取资源信息
     * @param {string} resourceId - 资源ID
     * @returns {Object|null} 资源信息
     */
    getResourceById(resourceId) {
        // 模拟资源数据
        return {
            id: resourceId,
            title: `资源 ${resourceId}`,
            description: '示例资源',
            category: '示例',
            isPremium: true
        };
    }

    /**
     * 触发下载
     * @param {string} resourceId - 资源ID
     */
    triggerDownload(resourceId) {
        // 这里应该调用DownloadManager的下载功能
        console.log('下载资源:', resourceId);
        this.showNotification('开始下载资源', 'info');
    }

    /**
     * 显示通知
     * @param {string} message - 消息内容
     * @param {string} type - 类型：success, error, warning, info
     */
    showNotification(message, type = 'info') {
        // 复用DownloadManager的通知系统或使用自己的实现
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} show`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
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
     * 加载积分
     * @returns {number} 当前积分
     */
    loadPoints() {
        try {
            const points = localStorage.getItem('currentPoints');
            return points ? parseInt(points) : 0;
        } catch (error) {
            console.error('Failed to load points:', error);
            return 0;
        }
    }

    /**
     * 保存积分
     */
    savePoints() {
        try {
            localStorage.setItem('currentPoints', this.currentPoints.toString());
        } catch (error) {
            console.error('Failed to save points:', error);
        }
    }

    /**
     * 加载积分历史
     * @returns {Array} 积分历史数组
     */
    loadPointHistory() {
        try {
            const history = localStorage.getItem('pointHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load point history:', error);
            return [];
        }
    }

    /**
     * 保存积分历史
     */
    savePointHistory() {
        try {
            localStorage.setItem('pointHistory', JSON.stringify(this.pointHistory));
        } catch (error) {
            console.error('Failed to save point history:', error);
        }
    }

    /**
     * 加载兑换历史
     * @returns {Array} 兑换历史数组
     */
    loadRedeemHistory() {
        try {
            const history = localStorage.getItem('redeemHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load redeem history:', error);
            return [];
        }
    }

    /**
     * 保存兑换历史
     */
    saveRedeemHistory() {
        try {
            localStorage.setItem('redeemHistory', JSON.stringify(this.redeemHistory));
        } catch (error) {
            console.error('Failed to save redeem history:', error);
        }
    }

    /**
     * 加载兑换商品
     * @returns {Array} 兑换商品数组
     */
    loadRedeemItems() {
        try {
            const items = localStorage.getItem('redeemItems');
            if (items) {
                return JSON.parse(items);
            }
            
            // 初始化默认商品
            const defaultItems = [
                {
                    id: 'item_1',
                    name: '无广告体验 (1天)',
                    description: '享受一天无广告的纯净浏览体验',
                    points: 100,
                    stock: 999,
                    type: 'service'
                },
                {
                    id: 'item_2',
                    name: '优先下载权限 (1次)',
                    description: '使用优先下载通道，提高下载速度',
                    points: 20,
                    stock: 999,
                    type: 'service'
                },
                {
                    id: 'item_3',
                    name: '高级资源下载券 (5张)',
                    description: '可下载5个高级付费资源',
                    points: 25,
                    stock: 100,
                    type: 'coupon'
                },
                {
                    id: 'item_4',
                    name: '积分翻倍卡 (1天)',
                    description: '24小时内获得积分翻倍',
                    points: 150,
                    stock: 50,
                    type: 'boost'
                }
            ];
            
            localStorage.setItem('redeemItems', JSON.stringify(defaultItems));
            return defaultItems;
        } catch (error) {
            console.error('Failed to load redeem items:', error);
            return [];
        }
    }

    /**
     * 保存兑换商品
     */
    saveRedeemItems() {
        try {
            localStorage.setItem('redeemItems', JSON.stringify(this.redeemItems));
        } catch (error) {
            console.error('Failed to save redeem items:', error);
        }
    }

    /**
     * 获取积分规则
     * @returns {Object} 积分规则
     */
    getPointRules() {
        return this.pointRules;
    }

    /**
     * 更新积分规则
     * @param {Object} rules - 新的积分规则
     */
    updatePointRules(rules) {
        this.pointRules = {...this.pointRules, ...rules};
    }
}

// 创建全局实例
const pointSystem = new PointSystem();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    pointSystem.initialize();
});

// 导出模块（如果支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PointSystem;
}