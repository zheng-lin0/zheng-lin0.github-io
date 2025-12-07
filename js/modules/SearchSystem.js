/**
 * 搜索系统 - 提供网站内容搜索功能
 * @module SearchSystem
 */

/**
 * 搜索系统类
 * @class SearchSystem
 */
class SearchSystem {
    /**
     * 构造函数
     * @constructor
     */
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.isInitialized = false;
        this.isSearching = false;
        this.currentSearch = '';
        
        // 默认配置
        this.config = {
            minSearchLength: 2,
            searchDelay: 300, // 防抖延迟
            maxResults: 10,
            highlight: true
        };
    }

    /**
     * 初始化搜索系统
     * @public
     * @param {Object} [options] - 配置选项
     */
    initialize(options = {}) {
        if (this.isInitialized) {
            console.warn('SearchSystem已经初始化');
            return;
        }

        try {
            // 合并配置
            this.config = { ...this.config, ...options };
            
            // 查找搜索相关元素
            this.searchInput = document.querySelector('.nav-search-input');
            this.searchResults = document.querySelector('.search-results');
            
            if (!this.searchInput) {
                console.error('未找到搜索输入框');
                return;
            }
            
            // 创建搜索结果容器（如果不存在）
            this.createSearchResultsContainer();
            
            // 设置搜索事件监听
            this.setupSearchListeners();
            
            this.isInitialized = true;
            console.log('SearchSystem初始化成功');
        } catch (error) {
            console.error('SearchSystem初始化失败:', error);
        }
    }

    /**
     * 创建搜索结果容器
     * @private
     */
    createSearchResultsContainer() {
        if (!this.searchResults) {
            // 创建搜索结果容器
            this.searchResults = document.createElement('div');
            this.searchResults.className = 'search-results';
            this.searchResults.style.position = 'absolute';
            this.searchResults.style.zIndex = '1000';
            this.searchResults.style.display = 'none';
            
            // 找到搜索容器并添加结果容器
            const searchContainer = this.searchInput.closest('.search-container');
            if (searchContainer) {
                searchContainer.style.position = 'relative';
                searchContainer.appendChild(this.searchResults);
            } else {
                // 如果没有搜索容器，添加到body
                this.searchInput.parentElement.style.position = 'relative';
                this.searchInput.parentElement.appendChild(this.searchResults);
            }
        }
        
        // 添加基础样式
        const style = document.createElement('style');
        style.textContent = `
            .search-results {
                background-color: var(--background);
                border: 1px solid var(--border);
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                max-height: 300px;
                overflow-y: auto;
            }
            
            .search-result-item {
                padding: 10px 12px;
                cursor: pointer;
                border-bottom: 1px solid var(--border);
                transition: background-color 0.2s ease;
            }
            
            .search-result-item:last-child {
                border-bottom: none;
            }
            
            .search-result-item:hover {
                background-color: var(--surface);
            }
            
            .search-result-item.active {
                background-color: var(--primary);
                color: white;
            }
            
            .search-result-title {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .search-result-content {
                font-size: 14px;
                color: var(--textSecondary);
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            
            .search-result-highlight {
                background-color: yellow;
                color: black;
                padding: 2px 4px;
                border-radius: 2px;
                font-weight: bold;
            }
            
            .search-no-results {
                padding: 15px;
                text-align: center;
                color: var(--textSecondary);
            }
            
            .search-loading {
                padding: 15px;
                text-align: center;
                color: var(--textSecondary);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 设置搜索事件监听
     * @private
     */
    setupSearchListeners() {
        // 搜索输入事件（使用防抖）
        this.searchInput.addEventListener('input', utils.debounce((e) => {
            this.handleSearch(e.target.value);
        }, this.config.searchDelay));

        // 焦点事件
        this.searchInput.addEventListener('focus', () => {
            this.showSearchResults();
        });

        // 失焦事件
        this.searchInput.addEventListener('blur', () => {
            // 延迟隐藏，以便点击结果
            setTimeout(() => {
                this.hideSearchResults();
            }, 200);
        });

        // 键盘事件
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // 搜索按钮点击事件
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch(this.searchInput.value);
            });
        }
    }

    /**
     * 处理搜索输入
     * @private
     * @param {string} query - 搜索查询
     */
    handleSearch(query) {
        query = query.trim();
        this.currentSearch = query;
        
        // 清空当前结果
        this.clearResults();
        
        if (query.length < this.config.minSearchLength) {
            this.hideSearchResults();
            return;
        }
        
        this.isSearching = true;
        this.showSearchResults();
        this.showLoading();
        
        // 执行搜索
        this.performSearch(query);
    }

    /**
     * 执行搜索
     * @private
     * @param {string} query - 搜索查询
     */
    performSearch(query) {
        // 模拟搜索过程
        setTimeout(() => {
            if (this.currentSearch !== query) {
                // 搜索已更新，忽略结果
                return;
            }
            
            // 从页面内容中搜索
            const results = this.searchPageContent(query);
            this.displayResults(results, query);
            
            this.isSearching = false;
        }, 500);
    }

    /**
     * 从页面内容中搜索
     * @private
     * @param {string} query - 搜索查询
     * @returns {Array} 搜索结果
     */
    searchPageContent(query) {
        const results = [];
        
        // 搜索页面中的标题和段落
        const contentElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li');
        
        contentElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            const queryLower = query.toLowerCase();
            
            if (text.includes(queryLower)) {
                // 查找父容器作为结果项
                let parent = element.closest('section, article, div');
                
                // 提取标题
                let title = element.textContent;
                if (element.tagName === 'P' || element.tagName === 'LI') {
                    // 对于段落和列表项，查找最近的标题
                    const nearestTitle = element.closest('section, article').querySelector('h1, h2, h3, h4, h5, h6');
                    if (nearestTitle) {
                        title = nearestTitle.textContent;
                    }
                }
                
                // 提取内容摘要
                let content = text;
                if (content.length > 100) {
                    // 找到查询词位置并提取前后内容
                    const index = text.indexOf(queryLower);
                    const start = Math.max(0, index - 30);
                    const end = Math.min(text.length, index + query.length + 70);
                    content = text.substring(start, end);
                    if (start > 0) content = '...' + content;
                    if (end < text.length) content = content + '...';
                }
                
                results.push({
                    title: title,
                    content: content,
                    element: element,
                    score: text.split(queryLower).length - 1 // 简单的匹配次数评分
                });
            }
        });
        
        // 按评分排序
        results.sort((a, b) => b.score - a.score);
        
        // 限制结果数量
        return results.slice(0, this.config.maxResults);
    }

    /**
     * 显示加载状态
     * @private
     */
    showLoading() {
        this.searchResults.innerHTML = '<div class="search-loading">搜索中...</div>';
    }

    /**
     * 显示搜索结果
     * @private
     * @param {Array} results - 搜索结果数组
     * @param {string} query - 搜索查询
     */
    displayResults(results, query) {
        if (!results || results.length === 0) {
            this.searchResults.innerHTML = '<div class="search-no-results">未找到匹配结果</div>';
            return;
        }
        
        // 清空结果
        this.clearResults();
        
        // 创建结果列表
        const resultList = document.createElement('div');
        
        results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.setAttribute('data-index', index);
            
            // 高亮匹配文本
            let title = result.title;
            let content = result.content;
            
            if (this.config.highlight) {
                const regex = new RegExp(`(${query})`, 'gi');
                title = title.replace(regex, '<span class="search-result-highlight">$1</span>');
                content = content.replace(regex, '<span class="search-result-highlight">$1</span>');
            }
            
            resultItem.innerHTML = `
                <div class="search-result-title">${title}</div>
                <div class="search-result-content">${content}</div>
            `;
            
            // 添加点击事件
            resultItem.addEventListener('click', () => {
                this.selectResult(result);
            });
            
            resultList.appendChild(resultItem);
        });
        
        this.searchResults.appendChild(resultList);
    }

    /**
     * 选择搜索结果
     * @private
     * @param {Object} result - 搜索结果
     */
    selectResult(result) {
        // 滚动到结果位置
        result.element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // 高亮结果元素
        this.highlightResult(result.element);
        
        // 清空搜索输入并隐藏结果
        this.searchInput.value = '';
        this.hideSearchResults();
        
        // 触发搜索结果选择事件
        this.triggerResultSelectEvent(result);
    }

    /**
     * 高亮结果元素
     * @private
     * @param {HTMLElement} element - 要高亮的元素
     */
    highlightResult(element) {
        // 添加高亮类
        element.classList.add('search-result-highlighted');
        
        // 添加高亮样式
        const style = document.createElement('style');
        style.textContent = `
            .search-result-highlighted {
                animation: highlight 2s ease;
            }
            
            @keyframes highlight {
                0% { background-color: rgba(255, 255, 0, 0.5); }
                100% { background-color: transparent; }
            }
        `;
        document.head.appendChild(style);
        
        // 一段时间后移除高亮
        setTimeout(() => {
            element.classList.remove('search-result-highlighted');
            style.remove();
        }, 2000);
    }

    /**
     * 处理键盘事件
     * @private
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyboard(e) {
        const results = this.searchResults.querySelectorAll('.search-result-item');
        if (!results.length) return;
        
        const activeItem = this.searchResults.querySelector('.search-result-item.active');
        let activeIndex = activeItem ? parseInt(activeItem.getAttribute('data-index')) : -1;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                activeIndex = (activeIndex + 1) % results.length;
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                activeIndex = (activeIndex - 1 + results.length) % results.length;
                break;
                
            case 'Enter':
                e.preventDefault();
                if (activeItem) {
                    const resultIndex = parseInt(activeItem.getAttribute('data-index'));
                    // 这里需要重新获取结果数据
                    // 简化处理，直接模拟点击
                    activeItem.click();
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                this.hideSearchResults();
                this.searchInput.value = '';
                break;
        }
        
        // 更新活动结果
        if (activeIndex >= 0) {
            results.forEach(item => item.classList.remove('active'));
            results[activeIndex].classList.add('active');
        }
    }

    /**
     * 显示搜索结果
     * @private
     */
    showSearchResults() {
        this.searchResults.style.display = 'block';
    }

    /**
     * 隐藏搜索结果
     * @private
     */
    hideSearchResults() {
        this.searchResults.style.display = 'none';
        this.clearResults();
    }

    /**
     * 清空搜索结果
     * @private
     */
    clearResults() {
        this.searchResults.innerHTML = '';
    }

    /**
     * 执行搜索
     * @public
     * @param {string} query - 搜索查询
     */
    search(query) {
        if (!this.isInitialized) {
            console.error('SearchSystem尚未初始化');
            return;
        }
        
        this.searchInput.value = query;
        this.handleSearch(query);
    }

    /**
     * 获取当前搜索查询
     * @public
     * @returns {string} 当前搜索查询
     */
    getCurrentSearch() {
        return this.currentSearch;
    }

    /**
     * 检查是否正在搜索
     * @public
     * @returns {boolean} 是否正在搜索
     */
    isSearching() {
        return this.isSearching;
    }

    /**
     * 更新配置
     * @public
     * @param {Object} options - 配置选项
     */
    updateConfig(options) {
        this.config = { ...this.config, ...options };
    }

    /**
     * 触发搜索结果选择事件
     * @private
     * @param {Object} result - 搜索结果
     */
    triggerResultSelectEvent(result) {
        const event = new CustomEvent('searchResultSelected', {
            detail: {
                result: result,
                query: this.currentSearch
            },
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * 添加搜索结果选择监听器
     * @public
     * @param {Function} callback - 回调函数
     */
    addResultSelectListener(callback) {
        if (typeof callback !== 'function') {
            console.error('回调必须是函数');
            return;
        }
        
        document.addEventListener('searchResultSelected', callback);
    }

    /**
     * 移除搜索结果选择监听器
     * @public
     * @param {Function} callback - 回调函数
     */
    removeResultSelectListener(callback) {
        document.removeEventListener('searchResultSelected', callback);
    }

    /**
     * 销毁搜索系统
     * @public
     */
    destroy() {
        if (!this.isInitialized) return;
        
        try {
            // 移除事件监听
            this.searchInput.removeEventListener('input', this.handleSearch);
            this.searchInput.removeEventListener('focus', this.showSearchResults);
            this.searchInput.removeEventListener('blur', this.hideSearchResults);
            this.searchInput.removeEventListener('keydown', this.handleKeyboard);
            
            // 隐藏并清空结果
            this.hideSearchResults();
            
            this.isInitialized = false;
            console.log('SearchSystem已销毁');
        } catch (error) {
            console.error('销毁SearchSystem失败:', error);
        }
    }
}

// 导出单例
const searchSystem = new SearchSystem();

// 添加到全局对象以便其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = searchSystem;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return searchSystem; });
} else {
    window.searchSystem = searchSystem;
}
