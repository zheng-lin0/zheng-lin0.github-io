// 登录修复验证脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== 登录修复验证脚本 ===');
    
    // 不自动创建验证面板，改为通过统一测试面板调用
    console.log('登录修复验证功能已就绪，请通过统一测试面板运行验证');
    
    // 如果统一测试面板未加载，提供手动调用方式
    if (typeof window.unifiedTestPanel === 'undefined') {
        console.log('未检测到统一测试面板，您可以通过调用 runLoginFixVerification() 手动运行验证');
    }
});

// 运行登录修复验证的函数，供统一测试面板调用
function runLoginFixVerification() {
    console.log('=== 登录修复验证 ===');
    
    // 检查核心功能是否可用
    const checks = {
        userManagement: typeof userManagement !== 'undefined',
        loginFunction: typeof login !== 'undefined',
        loginForm: document.getElementById('loginForm') !== null,
        loginUsername: document.getElementById('loginUsername') !== null,
        loginPassword: document.getElementById('loginPassword') !== null,
        loginBtn: document.getElementById('loginForm')?.querySelector('button[type="submit"]') !== null
    };
    
    console.log('核心功能检查:', checks);
    
    // 创建验证结果模态框
    if (window.modalSystem && window.modalSystem.showModal) {
        // 使用模态系统显示验证结果
        let modalContent = '<h3>登录修复验证结果</h3>';
        
        Object.entries(checks).forEach(([key, value]) => {
            const status = value ? '✅' : '❌';
            modalContent += `<p>${status} ${key}</p>`;
        });
        
        // 如果所有核心功能都可用，添加测试登录按钮
        if (Object.values(checks).every(v => v)) {
            modalContent += '<h4>测试登录</h4>';
            
            // 测试用户列表
            const testUsers = [
                { username: 'zhenglin', password: '123456', role: '超级管理员' },
                { username: 'admin', password: 'admin123', role: '管理员' },
                { username: 'test', password: 'test123', role: '普通用户' }
            ];
            
            testUsers.forEach(user => {
                modalContent += `<button onclick="login('${user.username}', '${user.password}')" style="margin: 5px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">登录 ${user.username}/${user.password}</button>`;
            });
        }
        
        window.modalSystem.showModal({
            title: '登录修复验证',
            content: modalContent,
            width: '500px'
        });
    } else {
        // 如果没有模态系统，在控制台显示结果
        console.log('=== 登录修复验证结果 ===');
        Object.entries(checks).forEach(([key, value]) => {
            const status = value ? '✅' : '❌';
            console.log(`${status} ${key}`);
        });
        
        console.log('=== 登录修复验证完成 ===');
        console.log('如果您在使用登录功能时遇到问题，请检查浏览器控制台的错误信息');
        console.log('您可以使用全局的login()函数直接登录，例如: login("zhenglin", "123456")');
    }
}

// 将验证函数暴露给全局，供统一测试面板调用
window.runLoginFixVerification = runLoginFixVerification;