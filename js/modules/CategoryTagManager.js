class CategoryTagManager {
    constructor() {
        this.categories = [];
        this.tags = new Map(); // tag名称 -> 使用次数
        this.loadData();
    }
    
    // 加载分类和标签数据
    loadData() {
        try {
            const savedCategories = localStorage.getItem('resourceCategories');
            const savedTags = localStorage.getItem('resourceTags');
            
            if (savedCategories) {
                this.categories = JSON.parse(savedCategories);
            } else {
                // 默认分类
                this.categories = ['全部', '教程', '文档', '模板', '素材', '工具', '代码', '视频', '音频', '软件'];
            }
            
            if (savedTags) {
                this.tags = new Map(JSON.parse(savedTags));
            }
        } catch (error) {
            console.error('加载分类和标签数据失败:', error);
            this.categories = ['全部', '教程', '文档', '模板', '素材', '工具', '代码', '视频', '音频', '软件'];
            this.tags = new Map();
        }
    }
    
    // 保存分类和标签数据
    saveData() {
        try {
            localStorage.setItem('resourceCategories', JSON.stringify(this.categories));
            localStorage.setItem('resourceTags', JSON.stringify(Array.from(this.tags.entries())));
        } catch (error) {
            console.error('保存分类和标签数据失败:', error);
        }
    }
    
    // 添加新分类
    addCategory(category) {
        if (!this.categories.includes(category)) {
            this.categories.push(category);
            this.saveData();
            return true;
        }
        return false;
    }
    
    // 删除分类
    removeCategory(category) {
        if (category !== '全部' && this.categories.includes(category)) {
            this.categories = this.categories.filter(cat => cat !== category);
            this.saveData();
            return true;
        }
        return false;
    }
    
    // 更新标签使用次数
    updateTagUsage(tag, increment = 1) {
        const currentCount = this.tags.get(tag) || 0;
        this.tags.set(tag, currentCount + increment);
        this.saveData();
    }
    
    // 批量更新标签使用次数
    updateTagsUsage(tags, increment = 1) {
        tags.forEach(tag => {
            this.updateTagUsage(tag, increment);
        });
    }
    
    // 获取热门标签（按使用次数排序）
    getPopularTags(limit = 20) {
        return Array.from(this.tags.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([tag, count]) => ({ name: tag, count }));
    }
    
    // 获取所有标签（按字母排序）
    getAllTags() {
        return Array.from(this.tags.keys()).sort();
    }
    
    // 搜索标签
    searchTags(query) {
        if (!query) return [];
        const searchTerm = query.toLowerCase();
        return Array.from(this.tags.keys())
            .filter(tag => tag.toLowerCase().includes(searchTerm))
            .sort();
    }
    
    // 生成标签云HTML
    generateTagCloud(containerId, limit = 30) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const popularTags = this.getPopularTags(limit);
        
        if (popularTags.length === 0) {
            container.innerHTML = '<p class="no-tags">暂无标签</p>';
            return;
        }
        
        // 计算字体大小范围
        const maxCount = popularTags[0].count;
        const minCount = popularTags[popularTags.length - 1].count;
        const fontSizeRange = 1.5; // 最大字体是最小字体的1.5倍
        
        const tagCloudHTML = popularTags.map(tag => {
            // 计算相对大小
            let fontSize;
            if (maxCount === minCount) {
                fontSize = 1; // 所有标签大小相同
            } else {
                fontSize = 1 + ((tag.count - minCount) / (maxCount - minCount)) * fontSizeRange;
            }
            
            return `
                <span class="tag-cloud-item" 
                      style="font-size: ${fontSize.toFixed(2)}rem;" 
                      onclick="categoryTagManager.filterByTag('${tag.name}')">
                    ${tag.name} (${tag.count})
                </span>
            `;
        }).join('');
        
        container.innerHTML = `
            <div class="tag-cloud">
                <h4>热门标签</h4>
                <div class="tag-cloud-container">
                    ${tagCloudHTML}
                </div>
            </div>
        `;
    }
    
    // 生成分类筛选HTML
    generateCategoryFilters(containerId, currentCategory = '全部') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const filtersHTML = this.categories.map(category => `
            <button class="category-filter ${currentCategory === category ? 'active' : ''}" 
                    data-category="${category}" 
                    onclick="categoryTagManager.filterByCategory('${category}')">
                ${category}
            </button>
        `).join('');
        
        container.innerHTML = `
            <div class="category-filters">
                ${filtersHTML}
            </div>
        `;
    }
    
    // 筛选资源（由其他模块实现具体逻辑）
    filterByCategory(category) {
        // 触发自定义事件，由ResourceManager或ResourceCenter处理
        const event = new CustomEvent('filterByCategory', { detail: { category } });
        document.dispatchEvent(event);
    }
    
    // 按标签筛选资源（由其他模块实现具体逻辑）
    filterByTag(tag) {
        // 触发自定义事件，由ResourceManager或ResourceCenter处理
        const event = new CustomEvent('filterByTag', { detail: { tag } });
        document.dispatchEvent(event);
    }
    
    // 初始化资源标签（用于导入现有资源）
    initializeResourceTags(resources) {
        resources.forEach(resource => {
            if (resource.tags && resource.tags.length > 0) {
                this.updateTagsUsage(resource.tags);
            }
        });
    }
}

// 创建全局实例
const categoryTagManager = new CategoryTagManager();