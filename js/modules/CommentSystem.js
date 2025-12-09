/**
 * 评论和评分系统
 * 用于处理资源的评论和评分功能
 */
class CommentSystem {
    constructor() {
        this.comments = JSON.parse(localStorage.getItem('resourceComments')) || {};
        this.ratings = JSON.parse(localStorage.getItem('resourceRatings')) || {};
        this.currentUser = null;
        this.userManagement = null;
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.initializeUserSystem();
            });
        } else {
            this.setupEventListeners();
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
        } else {
            // 如果用户管理模块尚未加载，尝试在稍后加载
            setTimeout(() => {
                this.initializeUserSystem();
            }, 100);
        }
    }

    setupEventListeners() {
        // 评论表单提交事件监听
        document.addEventListener('submit', (e) => {
            const commentForm = e.target.closest('.comment-form');
            if (commentForm) {
                e.preventDefault();
                const resourceId = commentForm.dataset.resourceId;
                this.addComment(resourceId);
            }
        });

        // 用户登录状态变化监听
        document.addEventListener('userLoggedIn', (e) => {
            this.currentUser = e.detail;
        });

        document.addEventListener('userLoggedOut', () => {
            this.currentUser = null;
        });

        // 评分星级点击事件
        document.addEventListener('click', (e) => {
            const star = e.target.closest('.rating-star');
            if (star) {
                const resourceId = star.closest('.resource-rating').dataset.resourceId;
                const rating = parseInt(star.dataset.rating);
                this.setRating(resourceId, rating);
            }
        });

        // 删除评论事件
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-comment');
            if (deleteBtn) {
                const commentId = deleteBtn.dataset.commentId;
                const resourceId = deleteBtn.closest('.comments-section').dataset.resourceId;
                this.deleteComment(resourceId, commentId);
            }
        });
    }

    /**
     * 为资源添加评论
     * @param {string} resourceId - 资源ID
     */
    addComment(resourceId) {
        if (!this.currentUser) {
            if (window.notificationSystem) {
                window.notificationSystem.showNotification('请先登录后再评论', 'warning');
            }
            return;
        }

        const commentForm = document.querySelector(`.comment-form[data-resource-id="${resourceId}"]`);
        if (!commentForm) return;

        const commentInput = commentForm.querySelector('.comment-input');
        const content = commentInput.value.trim();

        if (!content) {
            if (window.notificationSystem) {
                window.notificationSystem.showNotification('评论内容不能为空', 'warning');
            }
            return;
        }

        const comment = {
            id: Date.now().toString(),
            userId: this.currentUser.id || this.currentUser.username,
            userName: this.currentUser.name || this.currentUser.username,
            content: content,
            timestamp: new Date().toISOString(),
            likes: 0,
            likedBy: []
        };

        // 保存评论
        if (!this.comments[resourceId]) {
            this.comments[resourceId] = [];
        }
        this.comments[resourceId].unshift(comment); // 添加到开头

        // 保存到localStorage
        this.saveComments();

        // 更新UI
        this.displayComments(resourceId);
        this.updateCommentCount(resourceId);

        // 清空输入框
        commentInput.value = '';

        // 显示成功通知
        if (window.notificationSystem) {
            window.notificationSystem.showNotification('评论添加成功', 'success');
        }
    }

    /**
     * 删除评论
     * @param {string} resourceId - 资源ID
     * @param {string} commentId - 评论ID
     */
    deleteComment(resourceId, commentId) {
        if (!this.currentUser) return;

        const comments = this.comments[resourceId] || [];
        const commentIndex = comments.findIndex(comment => comment.id === commentId);

        if (commentIndex === -1) return;

        const comment = comments[commentIndex];
        
        // 检查是否有权限删除
        if (comment.userId !== (this.currentUser.id || this.currentUser.username) && 
            this.currentUser.role !== '超级管理员' && 
            this.currentUser.role !== '管理员') {
            if (window.notificationSystem) {
                window.notificationSystem.showNotification('您没有权限删除此评论', 'error');
            }
            return;
        }

        // 删除评论
        comments.splice(commentIndex, 1);
        this.saveComments();

        // 更新UI
        this.displayComments(resourceId);
        this.updateCommentCount(resourceId);

        // 显示成功通知
        if (window.notificationSystem) {
            window.notificationSystem.showNotification('评论已删除', 'success');
        }
    }

    /**
     * 设置资源评分
     * @param {string} resourceId - 资源ID
     * @param {number} rating - 评分（1-5）
     */
    setRating(resourceId, rating) {
        if (!this.currentUser) {
            if (window.notificationSystem) {
                window.notificationSystem.showNotification('请先登录后再评分', 'warning');
            }
            return;
        }

        // 保存用户评分
        if (!this.ratings[resourceId]) {
            this.ratings[resourceId] = [];
        }

        const userRatingIndex = this.ratings[resourceId].findIndex(r => r.userId === (this.currentUser.id || this.currentUser.username));
        
        if (userRatingIndex !== -1) {
            // 更新现有评分
            this.ratings[resourceId][userRatingIndex].rating = rating;
        } else {
            // 添加新评分
            this.ratings[resourceId].push({
                userId: this.currentUser.id || this.currentUser.username,
                rating: rating,
                timestamp: new Date().toISOString()
            });
        }

        // 保存到localStorage
        this.saveRatings();

        // 更新UI
        this.displayRating(resourceId);

        // 显示成功通知
        if (window.notificationSystem) {
            window.notificationSystem.showNotification('评分成功', 'success');
        }
    }

    /**
     * 获取资源的平均评分
     * @param {string} resourceId - 资源ID
     * @returns {number} 平均评分
     */
    getAverageRating(resourceId) {
        const resourceRatings = this.ratings[resourceId] || [];
        if (resourceRatings.length === 0) return 0;
        
        const sum = resourceRatings.reduce((acc, r) => acc + r.rating, 0);
        return sum / resourceRatings.length;
    }

    /**
     * 获取资源的评分人数
     * @param {string} resourceId - 资源ID
     * @returns {number} 评分人数
     */
    getRatingCount(resourceId) {
        return (this.ratings[resourceId] || []).length;
    }

    /**
     * 获取资源的评论列表
     * @param {string} resourceId - 资源ID
     * @returns {Array} 评论列表
     */
    getComments(resourceId) {
        return this.comments[resourceId] || [];
    }

    /**
     * 获取资源的评论数量
     * @param {string} resourceId - 资源ID
     * @returns {number} 评论数量
     */
    getCommentCount(resourceId) {
        return this.getComments(resourceId).length;
    }

    /**
     * 显示资源的评论列表
     * @param {string} resourceId - 资源ID
     */
    displayComments(resourceId) {
        const commentsContainer = document.querySelector(`.comments-list[data-resource-id="${resourceId}"]`);
        if (!commentsContainer) return;

        const comments = this.getComments(resourceId);
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<div class="no-comments">暂无评论，快来发表第一条评论吧！</div>';
            return;
        }

        commentsContainer.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="comment-author">
                        <i class="fas fa-user-circle"></i>
                        <span>${comment.userName}</span>
                    </div>
                    <div class="comment-time">${this.formatDate(comment.timestamp)}</div>
                    ${this.currentUser && (comment.userId === (this.currentUser.id || this.currentUser.username) || 
                      this.currentUser.role === '超级管理员' || this.currentUser.role === '管理员') ? 
                      `<button class="delete-comment" data-comment-id="${comment.id}" title="删除评论">
                          <i class="fas fa-trash"></i>
                      </button>` : ''}
                </div>
                <div class="comment-content">${comment.content}</div>
                <div class="comment-actions">
                    <button class="like-comment" data-comment-id="${comment.id}" data-resource-id="${resourceId}">
                        <i class="fas fa-heart ${comment.likedBy.includes(this.currentUser?.id || this.currentUser?.username) ? 'liked' : ''}"></i>
                        <span>${comment.likes}</span>
                    </button>
                </div>
            </div>
        `).join('');

        // 添加点赞事件监听
        commentsContainer.querySelectorAll('.like-comment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentId = e.currentTarget.dataset.commentId;
                this.toggleLikeComment(resourceId, commentId);
            });
        });
    }

    /**
     * 显示资源的评分
     * @param {string} resourceId - 资源ID
     */
    displayRating(resourceId) {
        const ratingContainer = document.querySelector(`.resource-rating[data-resource-id="${resourceId}"]`);
        if (!ratingContainer) return;

        const averageRating = this.getAverageRating(resourceId);
        const ratingCount = this.getRatingCount(resourceId);
        
        // 获取用户自己的评分
        let userRating = 0;
        if (this.currentUser) {
            const userRatingObj = this.ratings[resourceId]?.find(r => r.userId === (this.currentUser.id || this.currentUser.username));
            userRating = userRatingObj?.rating || 0;
        }

        ratingContainer.innerHTML = `
            <div class="rating-stars">
                ${Array.from({ length: 5 }).map((_, i) => {
                    const starRating = i + 1;
                    return `<span class="rating-star ${starRating <= averageRating ? 'filled' : ''} ${starRating <= userRating ? 'user-rated' : ''}" data-rating="${starRating}">
                        <i class="fas fa-star"></i>
                    </span>`;
                }).join('')}
            </div>
            <div class="rating-info">
                <span class="average-rating">${averageRating.toFixed(1)}</span>
                <span class="rating-count">(${ratingCount}人评分)</span>
            </div>
        `;
    }

    /**
     * 更新评论数量显示
     * @param {string} resourceId - 资源ID
     */
    updateCommentCount(resourceId) {
        const commentCountElement = document.querySelector(`.comment-count[data-resource-id="${resourceId}"]`);
        if (commentCountElement) {
            commentCountElement.textContent = this.getCommentCount(resourceId);
        }
    }

    /**
     * 点赞/取消点赞评论
     * @param {string} resourceId - 资源ID
     * @param {string} commentId - 评论ID
     */
    toggleLikeComment(resourceId, commentId) {
        if (!this.currentUser) {
            if (window.notificationSystem) {
                window.notificationSystem.showNotification('请先登录后再点赞', 'warning');
            }
            return;
        }

        const comments = this.comments[resourceId] || [];
        const comment = comments.find(c => c.id === commentId);
        
        if (!comment) return;

        const userId = this.currentUser.id || this.currentUser.username;
        const likeIndex = comment.likedBy.indexOf(userId);

        if (likeIndex !== -1) {
            // 取消点赞
            comment.likedBy.splice(likeIndex, 1);
            comment.likes--;
        } else {
            // 点赞
            comment.likedBy.push(userId);
            comment.likes++;
        }

        // 保存到localStorage
        this.saveComments();

        // 更新UI
        this.displayComments(resourceId);
    }

    /**
     * 格式化日期
     * @param {string} dateString - ISO日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 60) {
            return `${minutes}分钟前`;
        } else if (hours < 24) {
            return `${hours}小时前`;
        } else if (days < 30) {
            return `${days}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    /**
     * 保存评论到localStorage
     */
    saveComments() {
        localStorage.setItem('resourceComments', JSON.stringify(this.comments));
    }

    /**
     * 保存评分到localStorage
     */
    saveRatings() {
        localStorage.setItem('resourceRatings', JSON.stringify(this.ratings));
    }

    /**
     * 在资源卡片上显示评分信息
     * @param {string} resourceId - 资源ID
     */
    displayRatingOnCard(resourceId) {
        const cardRatingElement = document.querySelector(`.resource-card[data-resource-id="${resourceId}"] .card-rating`);
        if (cardRatingElement) {
            const averageRating = this.getAverageRating(resourceId);
            const ratingCount = this.getRatingCount(resourceId);
            
            cardRatingElement.innerHTML = `
                <div class="rating-display">
                    <i class="fas fa-star filled"></i>
                    <span>${averageRating.toFixed(1)}</span>
                    <span class="rating-count">(${ratingCount})</span>
                </div>
            `;
        }
    }
}

// 创建全局实例
const commentSystem = new CommentSystem();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommentSystem;
}