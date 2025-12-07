/**
 * 主题切换系统 - 实现网站明暗主题切换功能
 * @module ThemeSystem
 */

/**
 * 主题系统类
 * @class ThemeSystem
 */
class ThemeSystem {
    /**
     * 构造函数
     * @constructor
     */
    constructor() {
        this.currentTheme = null;
        this.defaultTheme = 'light';
        this.themes = new Map();
        this.isInitialized = false;
        
        // 使用共享的Supabase客户端实例
        this.supabase = window.supabaseClient;
        
        if (!this.supabase) {
            console.warn('共享Supabase客户端未初始化，将使用localStorage模式');
        }
        
        // 默认主题配置
        this.themeConfigs = {
            light: {
                name: 'light',
                displayName: '明亮主题',
                colors: {
                    primary: '#3498db',
                    secondary: '#2ecc71',
                    background: '#ffffff',
                    surface: '#f8f9fa',
                    text: '#2c3e50',
                    textSecondary: '#6c757d',
                    border: '#dee2e6',
                    success: '#28a745',
                    warning: '#ffc107',
                    error: '#dc3545',
                    info: '#17a2b8'
                },
                font: {
                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }
            },
            dark: {
                name: 'dark',
                displayName: '暗黑主题',
                colors: {
                    primary: '#5dade2',
                    secondary: '#58d68d',
                    background: '#1a1a1a',
                    surface: '#2c2c2c',
                    text: '#ecf0f1',
                    textSecondary: '#bdc3c7',
                    border: '#444444',
                    success: '#5cb85c',
                    warning: '#f0ad4e',
                    error: '#d9534f',
                    info: '#5bc0de'
                },
                font: {
                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }
            }
        };
    }

    /**
     * 初始化主题系统
     * @public
     * @param {Object} [options] - 初始化选项
     */
    async initialize(options = {}) {
        if (this.isInitialized) {
            console.warn('ThemeSystem已经初始化');
            return;
        }

        try {
            // 合并选项
            this.defaultTheme = options.defaultTheme || this.defaultTheme;
            
            // 注册默认主题
            Object.values(this.themeConfigs).forEach(theme => {
                this.registerTheme(theme);
            });
            
            // 创建主题切换控件
            this.createThemeToggle();
            
            // 设置初始化标记
            this.isInitialized = true;
            
            // 应用保存的主题或默认主题
            await this.applySavedTheme();
            
            console.log('ThemeSystem初始化成功');
        } catch (error) {
            console.error('ThemeSystem初始化失败:', error);
        }
    }

    /**
     * 创建主题切换控件
     * @private
     */
    createThemeToggle() {
        // 检查是否已有主题切换控件
        const existingToggle = document.getElementById('themeToggle');
        if (existingToggle) {
            return;
        }

        // 创建切换按钮
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'theme-toggle-container';
        toggleContainer.innerHTML = `
            <button id="themeToggle" class="theme-toggle-btn" aria-label="切换主题">
                <i class="fas fa-moon" id="themeIcon"></i>
            </button>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .theme-toggle-container {
                position: relative;
            }
            
            .theme-toggle-btn {
                background: none;
                border: none;
                color: var(--text);
                font-size: 20px;
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .theme-toggle-btn:hover {
                background-color: var(--primary);
                color: white;
                transform: scale(1.1);
            }
            
            .theme-toggle-btn:focus {
                outline: none;
                box-shadow: 0 0 0 2px var(--primary);
            }
        `;
        document.head.appendChild(style);
        
        // 插入到导航栏中
        const nav = document.querySelector('.nav-container');
        if (nav) {
            // 找到用户链接区域并插入
            const userLinks = nav.querySelector('.user-links');
            if (userLinks) {
                userLinks.insertAdjacentElement('beforebegin', toggleContainer);
            } else {
                // 如果没有用户链接区域，添加到导航栏末尾
                nav.appendChild(toggleContainer);
            }
        }
        
        // 添加切换事件
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        } else {
            console.warn('主题切换按钮未找到，无法添加事件监听器');
        }
    }

    /**
     * 注册主题
     * @public
     * @param {Object} themeConfig - 主题配置
     */
    registerTheme(themeConfig) {
        if (!themeConfig || !themeConfig.name) {
            console.error('无效的主题配置: 缺少名称');
            return;
        }
        
        this.themes.set(themeConfig.name, themeConfig);
        console.log(`主题已注册: ${themeConfig.displayName}`);
    }

    /**
     * 应用主题
     * @public
     * @param {string} themeName - 主题名称
     */
    async applyTheme(themeName) {
        if (!this.isInitialized) {
            console.error('ThemeSystem尚未初始化');
            return;
        }
        
        const theme = this.themes.get(themeName);
        if (!theme) {
            console.error(`主题不存在: ${themeName}`);
            return;
        }
        
        try {
            // 获取或创建CSS变量样式
            let cssVariablesStyle = document.getElementById('css-variables');
            if (!cssVariablesStyle) {
                cssVariablesStyle = document.createElement('style');
                cssVariablesStyle.id = 'css-variables';
                document.head.appendChild(cssVariablesStyle);
            }
            
            // 构建CSS变量
            let cssVariables = `:root {`;
            
            // 添加颜色变量
            Object.entries(theme.colors).forEach(([key, value]) => {
                cssVariables += ` --${key}: ${value};`;
            });
            
            // 添加字体变量
            if (theme.font) {
                Object.entries(theme.font).forEach(([key, value]) => {
                    cssVariables += ` --font-${key}: ${value};`;
                });
            }
            
            cssVariables += `}`;
            
            // 应用CSS变量
            cssVariablesStyle.textContent = cssVariables;
            
            // 更新当前主题
            this.currentTheme = themeName;
            
            // 更新文档类名
            document.documentElement.className = themeName;
            
            // 更新主题图标
            this.updateThemeIcon();
            
            // 保存主题到存储
            await this.saveTheme(themeName);
            
            // 触发主题切换事件
            this.triggerThemeChangeEvent(themeName);
            
            console.log(`主题已应用: ${theme.displayName}`);
        } catch (error) {
            console.error(`应用主题 ${themeName} 失败:`, error);
        }
    }

    /**
     * 切换主题
     * @public
     * @returns {string} 新主题名称
     */
    toggleTheme() {
        if (!this.isInitialized) {
            console.error('ThemeSystem尚未初始化');
            return null;
        }
        
        const currentTheme = this.getCurrentTheme();
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.applyTheme(nextTheme);
        return nextTheme;
    }

    /**
     * 获取当前主题
     * @public
     * @returns {string} 当前主题名称
     */
    getCurrentTheme() {
        return this.currentTheme || this.defaultTheme;
    }

    /**
     * 获取主题配置
     * @public
     * @param {string} [themeName] - 主题名称（可选，默认为当前主题）
     * @returns {Object|null} 主题配置
     */
    getThemeConfig(themeName = null) {
        const name = themeName || this.getCurrentTheme();
        return this.themes.get(name) || null;
    }

    /**
     * 获取所有主题
     * @public
     * @returns {Array} 主题配置数组
     */
    getAllThemes() {
        return Array.from(this.themes.values());
    }

    /**
     * 保存主题到存储
     * @private
     * @param {string} themeName - 主题名称
     */
    async saveTheme(themeName) {
        try {
            // 优先保存到Supabase
            if (this.supabase && window.userManagement && window.userManagement.getCurrentUser()) {
                const userId = window.userManagement.getCurrentUser().id;
                
                // 尝试更新用户主题偏好
                const { error } = await this.supabase
                    .from('user_preferences')
                    .upsert({
                        user_id: userId,
                        theme: themeName,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });
                
                if (error) {
                    console.error('保存主题到Supabase失败:', error);
                    // 回退到localStorage
                    localStorage.setItem('app-theme', themeName);
                }
            } else {
                // 未登录用户或Supabase不可用，使用localStorage
                localStorage.setItem('app-theme', themeName);
            }
        } catch (error) {
            console.error('保存主题失败:', error);
            // 确保至少保存到localStorage
            localStorage.setItem('app-theme', themeName);
        }
    }

    /**
     * 应用保存的主题
     * @private
     */
    async applySavedTheme() {
        try {
            let savedTheme = null;
            
            // 优先从Supabase获取用户主题偏好
            if (this.supabase && window.userManagement && window.userManagement.getCurrentUser()) {
                const userId = window.userManagement.getCurrentUser().id;
                
                const { data, error } = await this.supabase
                    .from('user_preferences')
                    .select('theme')
                    .eq('user_id', userId)
                    .single();
                
                if (data && data.theme && this.themes.has(data.theme)) {
                    savedTheme = data.theme;
                    // 同时更新localStorage作为缓存
                    localStorage.setItem('app-theme', savedTheme);
                }
            }
            
            // 如果从Supabase获取失败，尝试从localStorage获取
            if (!savedTheme) {
                savedTheme = localStorage.getItem('app-theme');
            }
            
            if (savedTheme && this.themes.has(savedTheme)) {
                await this.applyTheme(savedTheme);
            } else {
                // 检查系统主题偏好
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const systemTheme = prefersDark ? 'dark' : this.defaultTheme;
                await this.applyTheme(systemTheme);
            }
        } catch (error) {
            console.error('应用保存主题失败:', error);
            await this.applyTheme(this.defaultTheme);
        }
    }

    /**
     * 更新主题图标
     * @private
     */
    updateThemeIcon() {
        const icon = document.getElementById('themeIcon');
        if (!icon) return;
        
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    /**
     * 触发主题切换事件
     * @private
     * @param {string} themeName - 新主题名称
     */
    triggerThemeChangeEvent(themeName) {
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: themeName,
                config: this.getThemeConfig(themeName)
            },
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * 添加主题切换监听器
     * @public
     * @param {Function} callback - 回调函数
     */
    addThemeChangeListener(callback) {
        if (typeof callback !== 'function') {
            console.error('回调必须是函数');
            return;
        }
        
        document.addEventListener('themeChanged', callback);
    }

    /**
     * 移除主题切换监听器
     * @public
     * @param {Function} callback - 回调函数
     */
    removeThemeChangeListener(callback) {
        document.removeEventListener('themeChanged', callback);
    }

    /**
     * 检测系统主题偏好变化
     * @private
     */
    detectSystemThemeChanges() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            if (e.matches && this.currentTheme !== 'dark') {
                this.applyTheme('dark');
            } else if (!e.matches && this.currentTheme !== 'light') {
                this.applyTheme('light');
            }
        });
    }

    /**
     * 更新主题配置
     * @public
     * @param {string} themeName - 主题名称
     * @param {Object} updates - 更新的配置
     */
    updateThemeConfig(themeName, updates) {
        const theme = this.themes.get(themeName);
        if (!theme) {
            console.error(`主题不存在: ${themeName}`);
            return;
        }
        
        const updatedTheme = { ...theme, ...updates };
        this.themes.set(themeName, updatedTheme);
        
        // 如果当前主题是更新的主题，重新应用
        if (this.currentTheme === themeName) {
            this.applyTheme(themeName);
        }
    }

    /**
     * 销毁主题系统
     * @public
     */
    destroy() {
        if (!this.isInitialized) return;
        
        try {
            // 移除主题切换按钮
            const toggleBtn = document.getElementById('themeToggle');
            if (toggleBtn) {
                toggleBtn.remove();
            }
            
            // 移除CSS变量
            const cssVariablesStyle = document.getElementById('css-variables');
            if (cssVariablesStyle) {
                cssVariablesStyle.remove();
            }
            
            // 移除文档类名
            document.documentElement.className = '';
            
            this.isInitialized = false;
            console.log('ThemeSystem已销毁');
        } catch (error) {
            console.error('销毁ThemeSystem失败:', error);
        }
    }
}

// 导出单例
const themeSystem = new ThemeSystem();

// 添加到全局对象以便其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = themeSystem;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return themeSystem; });
} else {
    window.themeSystem = themeSystem;
}
