// 统一测试工具面板 - 将所有测试和迁移工具整合到一个面板中

/**
 * 统一测试工具面板
 */
class UnifiedTestPanel {
    constructor() {
        this.panel = null;
        this.isOpen = false;
        this.buttons = [];
    }
    
    /**
     * 初始化面板
     */
    init() {
        console.log('初始化统一测试工具面板...');
        
        // 创建控制面板按钮
        this.createControlButton();
        
        // 创建面板
        this.createPanel();
        
        // 添加默认按钮
        this.addDefaultButtons();
        
        // 如果init_supabase_admin.js已加载，添加初始化管理员账号功能
        if (typeof window.createInitInterface === 'function') {
            this.addButton({
                text: '初始化Supabase管理员账号',
                color: '#10b981',
                action: window.createInitInterface
            });
        }
        
        // 如果diagnose_login_issue.js已加载，添加登录问题诊断功能
        if (typeof window.runLoginDiagnosis === 'function') {
            this.addButton({
                text: '运行登录问题诊断',
                color: '#2196f3',
                action: window.runLoginDiagnosis
            });
        }
        
        // 如果test_email_verification_disabled.js已加载，添加邮箱验证禁用测试功能
        if (typeof window.testEmailVerification === 'function') {
            this.addButton({
                text: '测试邮箱验证禁用',
                color: '#4CAF50',
                action: window.testEmailVerification
            });
        }
        
        // 如果test_login_detailed.js已加载，添加登录功能详细测试
        if (typeof window.runDetailedLoginTest === 'function') {
            this.addButton({
                text: '运行登录功能详细测试',
                color: '#3f51b5',
                action: window.runDetailedLoginTest
            });
        }
        
        // 如果verify_login_fix.js已加载，添加登录修复验证功能
        if (typeof window.runLoginFixVerification === 'function') {
            this.addButton({
                text: '运行登录修复验证',
                color: '#ff9800',
                action: window.runLoginFixVerification
            });
        }
        
        // 显示初始化信息
        console.log('统一测试工具面板已初始化');
    }
    
    /**
     * 创建控制面板按钮
     */
    createControlButton() {
        const controlButton = document.createElement('button');
        controlButton.id = 'unifiedTestPanelToggle';
        controlButton.textContent = '测试工具';
        controlButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px 20px;
            background-color: #ff9800;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 9999;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        
        // 绑定点击事件
        controlButton.addEventListener('click', () => {
            this.togglePanel();
        });
        
        // 添加到页面
        document.body.appendChild(controlButton);
    }
    
    /**
     * 创建面板
     */
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'unifiedTestPanel';
        this.panel.style.cssText = `
            position: fixed;
            top: 50px;
            right: 10px;
            width: 300px;
            max-height: 80vh;
            padding: 20px;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.15);
            z-index: 9998;
            font-family: Arial, sans-serif;
            display: none;
            overflow-y: auto;
        `;
        
        // 面板标题
        const title = document.createElement('h3');
        title.textContent = '测试与迁移工具';
        title.style.cssText = `
            margin-top: 0;
            margin-bottom: 20px;
            color: #333;
            font-size: 16px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        `;
        this.panel.appendChild(title);
        
        // 按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'testButtonsContainer';
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        this.panel.appendChild(buttonContainer);
        
        // 添加到页面
        document.body.appendChild(this.panel);
    }
    
    /**
     * 切换面板显示状态
     */
    togglePanel() {
        this.isOpen = !this.isOpen;
        this.panel.style.display = this.isOpen ? 'block' : 'none';
    }
    
    /**
     * 添加默认按钮
     */
    addDefaultButtons() {
        // 迁移用户按钮
        this.addButton({
            id: 'migrateUsersBtn',
            text: '迁移用户到 Supabase',
            color: '#4CAF50',
            onClick: () => {
                if (typeof window.migrateUsersToSupabase === 'function') {
                    window.migrateUsersToSupabase();
                    this.togglePanel();
                } else {
                    alert('迁移工具未加载，请先加载 migrate_users_to_supabase.js');
                }
            }
        });
        
        // 测试Supabase保存按钮
        this.addButton({
            id: 'testSupabaseSaveBtn',
            text: '测试 Supabase 用户保存',
            color: '#2196F3',
            onClick: () => {
                if (typeof window.testSupabaseUserSave === 'function') {
                    window.testSupabaseUserSave();
                    this.togglePanel();
                } else {
                    alert('测试工具未加载，请先加载 test_supabase_user_save.js');
                }
            }
        });
        
        // 登录修复测试按钮
        this.addButton({
            id: 'loginFixTestBtn',
            text: '运行登录修复测试',
            color: '#FF9800',
            onClick: () => {
                if (typeof window.runLoginFixTests === 'function') {
                    window.runLoginFixTests();
                    this.togglePanel();
                } else {
                    alert('登录修复测试工具未加载');
                }
            }
        });
        
        // 分隔线
        this.addSeparator();
        
        // 关闭面板按钮
        this.addButton({
            id: 'closePanelBtn',
            text: '关闭面板',
            color: '#f44336',
            onClick: () => {
                this.togglePanel();
            }
        });
    }
    
    /**
     * 添加按钮
     */
    addButton(buttonConfig) {
        const button = document.createElement('button');
        button.id = buttonConfig.id;
        button.textContent = buttonConfig.text;
        button.style.cssText = `
            padding: 10px 15px;
            background-color: ${buttonConfig.color || '#607d8b'};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            transition: background-color 0.2s;
        `;
        
        // 添加悬停效果
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = this.darkenColor(buttonConfig.color || '#607d8b', 0.1);
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = buttonConfig.color || '#607d8b';
        });
        
        // 绑定点击事件
        button.addEventListener('click', buttonConfig.onClick);
        
        // 添加到容器
        const buttonContainer = document.getElementById('testButtonsContainer');
        if (buttonContainer) {
            buttonContainer.appendChild(button);
        }
        
        // 保存到按钮列表
        this.buttons.push(button);
    }
    
    /**
     * 添加分隔线
     */
    addSeparator() {
        const separator = document.createElement('div');
        separator.style.cssText = `
            height: 1px;
            background-color: #eee;
            margin: 10px 0;
        `;
        
        const buttonContainer = document.getElementById('testButtonsContainer');
        if (buttonContainer) {
            buttonContainer.appendChild(separator);
        }
    }
    
    /**
     * 使颜色变暗
     */
    darkenColor(color, factor) {
        // 简单的颜色变暗函数
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        const newR = Math.max(0, Math.floor(r * (1 - factor)));
        const newG = Math.max(0, Math.floor(g * (1 - factor)));
        const newB = Math.max(0, Math.floor(b * (1 - factor)));
        
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * 移除旧的测试按钮
     */
    removeOldButtons() {
        console.log('移除旧的测试按钮...');
        
        // 获取所有按钮
        const buttons = document.querySelectorAll('button');
        const buttonsToRemove = [];
        
        // 收集需要移除的按钮
        buttons.forEach(button => {
            const text = button.textContent.trim();
            const styles = window.getComputedStyle(button);
            const isFixed = styles.position === 'fixed';
            
            // 移除旧的测试和迁移按钮
            if (isFixed && (text.includes('迁移用户到 Supabase') || 
                           text.includes('测试 Supabase 用户保存') ||
                           text.includes('运行登录修复测试'))) {
                buttonsToRemove.push(button);
            }
        });
        
        // 移除按钮
        buttonsToRemove.forEach(button => button.remove());
        
        // 移除测试结果区域
        const resultDiv = document.getElementById('supabase-test-results');
        if (resultDiv) {
            resultDiv.remove();
        }
        
        console.log(`已移除 ${buttonsToRemove.length} 个旧按钮`);
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // 创建统一测试面板
        window.unifiedTestPanel = new UnifiedTestPanel();
        window.unifiedTestPanel.init();
        
        // 移除旧的测试按钮
        setTimeout(() => {
            window.unifiedTestPanel.removeOldButtons();
        }, 1000);
    });
} else {
    // 创建统一测试面板
    window.unifiedTestPanel = new UnifiedTestPanel();
    window.unifiedTestPanel.init();
    
    // 移除旧的测试按钮
    setTimeout(() => {
        window.unifiedTestPanel.removeOldButtons();
    }, 1000);
}

console.log('统一测试工具面板已加载');