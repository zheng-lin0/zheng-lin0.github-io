// Supabase管理员账号初始化脚本
// 用于将迁移脚本中的默认用户同步到Supabase Auth并设置密码

document.addEventListener('DOMContentLoaded', () => {
    console.log('Supabase管理员账号初始化脚本已加载');
    
    // 不自动创建界面，改为通过统一测试面板调用
    // 如果统一测试面板未加载，提供手动调用方式
    if (typeof window.unifiedTestPanel === 'undefined') {
        console.log('未检测到统一测试面板，您可以通过调用 createInitInterface() 手动创建初始化界面');
    }
});

// 创建初始化界面
function createInitInterface() {
    const interfaceDiv = document.createElement('div');
    interfaceDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1001;
        min-width: 300px;
    `;
    
    interfaceDiv.innerHTML = `
        <h3>Supabase管理员账号初始化</h3>
        <p>迁移脚本中的默认用户需要在Supabase Auth中设置密码后才能使用</p>
        
        <div style="margin: 15px 0;">
            <label>用户名 (默认为admin):</label>
            <input type="text" id="initUsername" value="admin" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        
        <div style="margin: 15px 0;">
            <label>设置新密码:</label>
            <input type="password" id="initPassword" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        
        <div style="margin: 15px 0;">
            <label>确认新密码:</label>
            <input type="password" id="initConfirmPassword" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        
        <button id="initBtn" style="background: #10b981; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; width: 100%; margin: 10px 0;">初始化管理员账号</button>
        <button id="closeBtn" style="background: #6b7280; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; width: 100%;">关闭</button>
        
        <div id="initMessage" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
    `;
    
    document.body.appendChild(interfaceDiv);
    
    // 绑定事件
    document.getElementById('initBtn').addEventListener('click', initAdminAccount);
    document.getElementById('closeBtn').addEventListener('click', () => {
        interfaceDiv.remove();
    });
}

// 初始化管理员账号
async function initAdminAccount() {
    const username = document.getElementById('initUsername').value.trim();
    const password = document.getElementById('initPassword').value;
    const confirmPassword = document.getElementById('initConfirmPassword').value;
    const messageDiv = document.getElementById('initMessage');
    
    // 验证输入
    if (!username) {
        showMessage('用户名不能为空', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('密码长度不能少于6位', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('两次输入的密码不一致', 'error');
        return;
    }
    
    // 检查UserManagement
    if (!window.userManagement || !window.userManagement.supabase) {
        showMessage('UserManagement未初始化或Supabase配置错误', 'error');
        return;
    }
    
    try {
        showMessage('正在初始化管理员账号...', 'info');
        
        // 1. 从数据库中获取用户信息
        const { data: user, error: userError } = await window.userManagement.supabase
            .from('users')
            .select('id, username, email')
            .eq('username', username)
            .single();
        
        if (userError || !user) {
            showMessage('未找到指定的用户，请先执行迁移脚本', 'error');
            return;
        }
        
        // 2. 在Supabase Auth中创建用户或更新密码
        let authData, authError;
        
        try {
            // 尝试登录，如果失败说明用户不存在
            ({ error: authError } = await window.userManagement.supabase.auth.signInWithPassword({
                email: user.email,
                password: password
            }));
            
            if (!authError) {
                showMessage('用户已存在且密码正确！', 'success');
                return;
            }
        } catch (err) {
            // 忽略错误，继续创建用户
        }
        
        // 3. 创建或更新用户
        try {
            // 尝试创建用户
            ({ data: authData, error: authError } = await window.userManagement.supabase.auth.admin.createUser({
                email: user.email,
                password: password,
                email_confirm: true
            }));
        } catch (err) {
            // 如果创建失败，尝试更新密码
            try {
                ({ data: authData, error: authError } = await window.userManagement.supabase.auth.admin.updateUserById(
                    user.id,
                    { password: password }
                ));
            } catch (updateErr) {
                authError = updateErr;
            }
        }
        
        if (authError) {
            showMessage(`操作失败: ${authError.message}`, 'error');
            console.error('Supabase Auth操作失败:', authError);
            return;
        }
        
        showMessage('管理员账号初始化成功！', 'success');
        console.log('管理员账号初始化成功:', authData);
        
    } catch (error) {
        showMessage(`初始化失败: ${error.message}`, 'error');
        console.error('初始化失败:', error);
    }
}

// 显示消息
function showMessage(message, type) {
    const messageDiv = document.getElementById('initMessage');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    // 设置样式
    if (type === 'error') {
        messageDiv.style.backgroundColor = '#fee2e2';
        messageDiv.style.color = '#991b1b';
    } else if (type === 'success') {
        messageDiv.style.backgroundColor = '#d1fae5';
        messageDiv.style.color = '#065f46';
    } else {
        messageDiv.style.backgroundColor = '#dbeafe';
        messageDiv.style.color = '#1e40af';
    }
}

// 导出为模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAdminAccount
    };
}
