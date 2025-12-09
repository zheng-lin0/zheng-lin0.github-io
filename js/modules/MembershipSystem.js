/**
 * 会员系统模块 - 处理会员等级、特权和升级逻辑
 * @module MembershipSystem
 */

/**
 * 会员系统类
 * @class MembershipSystem
 */
class MembershipSystem {
    /**
     * 构造函数
     * @constructor
     */
    constructor() {
        this.memberLevels = this.initMemberLevels();
        this.userMembership = this.initUserMembership();
        this.isInitialized = false;
        
        // 使用共享的Supabase客户端实例
        this.supabase = window.supabaseClient;
        
        if (!this.supabase) {
            console.warn('共享Supabase客户端未初始化，将使用localStorage模式');
        }
    }

    /**
     * 初始化会员等级
     * @private
     * @returns {Array} 会员等级数组
     */
    initMemberLevels() {
        return [
            { level: 1, name: '普通用户', minPoints: 0, maxPoints: 999, color: '#808080', icon: 'fa-user', privileges: ['基础工具使用', '每日使用次数限制'] },
            { level: 2, name: '青铜会员', minPoints: 1000, maxPoints: 2999, color: '#C0C0C0', icon: 'fa-user', privileges: ['基础工具使用', '普通下载速度', '更多使用次数'] },
            { level: 3, name: '白银会员', minPoints: 3000, maxPoints: 4999, color: '#C0C0C0', icon: 'fa-user', privileges: ['基础工具使用', '普通下载速度', '10GB云存储空间', '无使用次数限制'] },
            { level: 4, name: '黄金会员', minPoints: 5000, maxPoints: 9999, color: '#FFD700', icon: 'fa-crown', privileges: ['基础工具使用', '快速下载速度', '50GB云存储空间', '优先客服', '高级工具使用权'] },
            { level: 5, name: '铂金会员', minPoints: 10000, maxPoints: 14999, color: '#E5E4E2', icon: 'fa-crown', privileges: ['基础工具使用', '快速下载速度', '100GB云存储空间', '优先客服', '无广告体验', '高级工具使用权'] },
            { level: 6, name: '钻石会员', minPoints: 15000, maxPoints: 19999, color: '#B9F2FF', icon: 'fa-gem', privileges: ['基础工具使用', '极速下载速度', '200GB云存储空间', '优先客服', '无广告体验', 'AI助手基础版', '高级工具使用权', '专属工具'] },
            { level: 7, name: '星耀会员', minPoints: 20000, maxPoints: 24999, color: '#00FF7F', icon: 'fa-gem', privileges: ['基础工具使用', '极速下载速度', '300GB云存储空间', '专属客服', '无广告体验', 'AI助手高级版', '高级工具使用权', '专属工具'] },
            { level: 8, name: '王者会员', minPoints: 25000, maxPoints: 29999, color: '#0000FF', icon: 'fa-gem', privileges: ['基础工具使用', '极速下载速度', '500GB云存储空间', '专属客服', '无广告体验', 'AI助手高级版', '高级工具使用权', '专属工具', '工具定制'] },
            { level: 9, name: '荣耀会员', minPoints: 30000, maxPoints: 39999, color: '#FF0000', icon: 'fa-gem', privileges: ['基础工具使用', '极速下载速度', '1TB云存储空间', '专属客服', '无广告体验', 'AI助手高级版', '高级工具使用权', '专属工具', '工具定制', '线下活动'] },
            { level: 10, name: '至尊会员', minPoints: 40000, maxPoints: Infinity, color: '#FFD700', icon: 'fa-crown', privileges: ['基础工具使用', '极速下载速度', '2TB云存储空间', '专属客服', '无广告体验', 'AI助手高级版', '高级工具使用权', '专属工具', '工具定制', '线下活动', 'VIP客服'] }
        ];
    }

    /**
     * 初始化用户会员数据
     * @private
     * @returns {Object} 用户会员数据
     */
    initUserMembership() {
        // 先从localStorage获取初始数据，后续会从Supabase加载
        const storedMembership = localStorage.getItem('userMembership');
        if (storedMembership) {
            return JSON.parse(storedMembership);
        }
        return {};
    }

    /**
     * 初始化模块
     * @public
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('MembershipSystem已经初始化');
            return;
        }

        try {
            this.setupEventListeners();
            await this.loadMembershipContent();
            this.isInitialized = true;
            console.log('MembershipSystem模块初始化完成');
        } catch (error) {
            console.error('MembershipSystem初始化失败:', error);
        }
    }

    /**
     * 设置事件监听
     * @private
     */
    setupEventListeners() {
        // 监听会员中心模态框打开事件
        const membershipCenterModal = document.getElementById('membershipCenterModal');
        if (membershipCenterModal) {
            membershipCenterModal.addEventListener('modal:open', () => {
                this.loadMembershipContent();
            });
        }
    }

    /**
     * 加载会员中心内容
     * @public
     */
    async loadMembershipContent() {
        const membershipContent = document.getElementById('membershipContent');
        if (!membershipContent) return;

        // 获取当前用户信息
        const currentUser = window.userManagement ? window.userManagement.getCurrentUser() : null;
        let userMembership = null;
        
        if (currentUser) {
            // 从Supabase加载最新的会员数据
            await this.loadUserMembershipFromSupabase(currentUser.username);
            userMembership = this.getUserMembership(currentUser.username);
        }
        
        const currentLevel = userMembership ? this.getMemberLevel(userMembership.points) : this.memberLevels[0];

        // 构建会员中心HTML
        const html = `
            <div class="membership-container">
                <div class="membership-header">
                    <div class="current-member-info">
                        <div class="member-icon" style="color: ${currentLevel.color};">
                            <i class="fas ${currentLevel.icon}"></i>
                        </div>
                        <div class="member-details">
                            <h3 class="membership-title">${currentLevel.name}</h3>
                            <p class="membership-subtitle">等级 ${currentLevel.level} | ${currentLevel.minPoints} - ${currentLevel.maxPoints === Infinity ? '∞' : currentLevel.maxPoints} 积分</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${this.calculateProgress(userMembership?.points || 0, currentLevel)}%"></div>
                            </div>
                            <p class="progress-text">当前积分: ${userMembership?.points || 0} | 距离下一级: ${currentLevel.maxPoints === Infinity ? '0' : (currentLevel.maxPoints - (userMembership?.points || 0))} 积分</p>
                        </div>
                    </div>
                </div>

                <div class="membership-content">
                    <div class="membership-section">
                        <h4>会员特权</h4>
                        <div class="privileges-list">
                            ${currentLevel.privileges.map(privilege => `
                                <div class="privilege-item">
                                    <i class="fas fa-check-circle privilege-icon"></i>
                                    <span class="privilege-text">${privilege}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="membership-section">
                        <h4>会员等级</h4>
                        <div class="membership-levels">
                            ${this.memberLevels.map(level => `
                                <div class="membership-level-item ${level.level === currentLevel.level ? 'active' : ''}" 
                                     style="border-color: ${level.color};">
                                    <div class="level-icon" style="color: ${level.color};">
                                        <i class="fas ${level.icon}"></i>
                                    </div>
                                    <div class="level-info">
                                        <div class="level-name">${level.name}</div>
                                        <div class="level-points">${level.minPoints} - ${level.maxPoints === Infinity ? '∞' : level.maxPoints} 积分</div>
                                    </div>
                                    <div class="level-privileges">
                                        ${level.privileges.slice(0, 3).map(privilege => `
                                            <span class="privilege-tag">${privilege}</span>
                                        `).join('')}${level.privileges.length > 3 ? ` <span class="more-privileges">+${level.privileges.length - 3}</span>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="membership-section">
                        <h4>快速升级</h4>
                        <div class="upgrade-options">
                            <div class="upgrade-option">
                                <h5>月度会员</h5>
                                <p class="upgrade-price">¥29.9/月</p>
                                <p class="upgrade-benefits">立即获得1000积分 + 黄金会员特权</p>
                                <button class="btn btn-primary btn-block upgrade-btn" onclick="membershipSystem.purchaseMembership('monthly')">立即购买</button>
                            </div>
                            <div class="upgrade-option">
                                <h5>季度会员</h5>
                                <p class="upgrade-price">¥79.9/季</p>
                                <p class="upgrade-benefits">立即获得3000积分 + 铂金会员特权</p>
                                <button class="btn btn-primary btn-block upgrade-btn" onclick="membershipSystem.purchaseMembership('quarterly')">立即购买</button>
                            </div>
                            <div class="upgrade-option">
                                <h5>年度会员</h5>
                                <p class="upgrade-price">¥299/年</p>
                                <p class="upgrade-benefits">立即获得15000积分 + 会员level10特权</p>
                                <button class="btn btn-primary btn-block upgrade-btn" onclick="membershipSystem.purchaseMembership('annual')">立即购买</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        membershipContent.innerHTML = html;
    }

    /**
     * 计算升级进度
     * @private
     * @param {number} currentPoints - 当前积分
     * @param {Object} currentLevel - 当前等级
     * @returns {number} 升级进度百分比
     */
    calculateProgress(currentPoints, currentLevel) {
        if (currentLevel.maxPoints === Infinity) return 100;
        const range = currentLevel.maxPoints - currentLevel.minPoints;
        const progress = (currentPoints - currentLevel.minPoints) / range;
        return Math.min(Math.max(progress * 100, 0), 100);
    }

    /**
     * 获取用户会员信息
     * @public
     * @param {string} username - 用户名
     * @returns {Object|null} 用户会员信息
     */
    getUserMembership(username) {
        return this.userMembership[username] || { points: 0, joinDate: new Date().toISOString() };
    }

    /**
     * 更新用户积分
     * @public
     * @param {string} username - 用户名
     * @param {number} points - 积分变化量
     */
    async updatePoints(username, points) {
        if (!this.userMembership[username]) {
            this.userMembership[username] = { points: 0, joinDate: new Date().toISOString() };
        }
        this.userMembership[username].points += points;
        await this.saveUserMembership();
        
        // 如果用户在线，更新界面
        if (window.userManagement && window.userManagement.getCurrentUser()?.username === username) {
            await this.loadMembershipContent();
        }
    }

    /**
     * 获取会员等级
     * @public
     * @param {number} points - 积分
     * @returns {Object} 会员等级
     */
    getMemberLevel(points) {
        return this.memberLevels.find(level => points >= level.minPoints && points <= level.maxPoints) || this.memberLevels[0];
    }

    /**
     * 检查用户是否有权限使用特定工具
     * @public
     * @param {string} username - 用户名
     * @param {string} toolId - 工具ID
     * @returns {boolean} 是否有权限
     */
    hasToolPermission(username, toolId) {
        const userMembership = this.getUserMembership(username);
        const memberLevel = this.getMemberLevel(userMembership.points);
        const tool = window.toolManager ? window.toolManager.getToolById(toolId) : null;
        
        if (!tool) return true; // 默认允许使用
        
        return memberLevel.level >= (tool.requiredLevel || 1);
    }

    /**
     * 获取用户可用的工具列表
     * @public
     * @param {string} username - 用户名
     * @returns {Array} 可用工具列表
     */
    getAvailableTools(username) {
        const userMembership = this.getUserMembership(username);
        const memberLevel = this.getMemberLevel(userMembership.points);
        const allTools = window.toolManager ? window.toolManager.getTools() : [];
        
        return allTools.filter(tool => memberLevel.level >= (tool.requiredLevel || 1));
    }

    /**
     * 购买会员
     * @public
     * @param {string} type - 会员类型 (monthly, quarterly, annual)
     */
    async purchaseMembership(type) {
        const currentUser = window.userManagement ? window.userManagement.getCurrentUser() : null;
        if (!currentUser) {
            alert('请先登录');
            return;
        }

        const membershipOptions = {
            monthly: { points: 1000, price: 29.9, name: '月度青铜会员' },
            quarterly: { points: 3000, price: 79.9, name: '季度白银会员' },
            annual: { points: 15000, price: 299, name: '年度钻石会员' }
        };

        const option = membershipOptions[type];
        if (!option) return;

        // 这里可以添加支付逻辑
        alert(`购买${option.name}成功！获得${option.points}积分`);
        
        // 更新用户积分
        await this.updatePoints(currentUser.username, option.points);
        
        // 显示通知
        if (window.notificationSystem) {
            window.notificationSystem.showNotification(`购买${option.name}成功！获得${option.points}积分，解锁更多工具使用权`, 'success');
        }
    }

    /**
     * 从Supabase加载用户会员信息
     * @private
     * @param {string} username - 用户名
     */
    async loadUserMembershipFromSupabase(username) {
        if (!this.supabase || !window.userManagement) return;
        
        try {
            const currentUser = window.userManagement.getCurrentUser();
            if (!currentUser) return;
            
            const { data, error } = await this.supabase
                .from('user_memberships')
                .select('*')
                .eq('user_id', currentUser.id)
                .single();
            
            if (data) {
                this.userMembership[username] = {
                    points: data.points,
                    joinDate: data.join_date
                };
                // 同时更新localStorage
                localStorage.setItem('userMembership', JSON.stringify(this.userMembership));
            }
        } catch (error) {
            console.error('从Supabase加载会员信息失败:', error);
        }
    }
    
    /**
     * 保存用户会员信息
     * @private
     */
    async saveUserMembership() {
        // 先保存到localStorage
        localStorage.setItem('userMembership', JSON.stringify(this.userMembership));
        
        // 如果Supabase可用且用户已登录，同步到数据库
        if (this.supabase && window.userManagement) {
            const currentUser = window.userManagement.getCurrentUser();
            if (currentUser && this.userMembership[currentUser.username]) {
                const membership = this.userMembership[currentUser.username];
                
                try {
                    const { error } = await this.supabase
                        .from('user_memberships')
                        .upsert({
                            user_id: currentUser.id,
                            username: currentUser.username,
                            points: membership.points,
                            join_date: membership.joinDate,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'user_id' });
                    
                    if (error) {
                        console.error('保存会员信息到Supabase失败:', error);
                    }
                } catch (error) {
                    console.error('保存会员信息到Supabase时发生错误:', error);
                }
            }
        }
    }

    /**
     * 销毁模块
     * @public
     */
    destroy() {
        this.isInitialized = false;
        console.log('MembershipSystem模块已销毁');
    }
}

// 导出单例
const membershipSystem = new MembershipSystem();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = membershipSystem;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return membershipSystem; });
} else {
    window.membershipSystem = membershipSystem;
}
