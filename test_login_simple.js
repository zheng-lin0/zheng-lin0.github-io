// 简单的登录功能测试脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('登录功能简单测试脚本已加载');
    
    // 检查UserManagement模块是否存在
    console.log('userManagement对象:', window.userManagement);
    console.log('userManagement是否初始化:', window.userManagement ? window.userManagement.isInitialized : '未定义');
    
    // 检查登录表单和事件监听器
    const loginForm = document.getElementById('loginForm');
    console.log('登录表单:', loginForm);
    
    // 检查登录按钮
    const loginBtn = loginForm.querySelector('button[type="submit"]');
    console.log('登录按钮:', loginBtn);
    
    // 添加一个直接调用登录功能的测试按钮
    const testBtn = document.createElement('button');
    testBtn.textContent = '测试直接登录';
    testBtn.id = 'testLoginBtn';
    testBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; padding: 10px 20px; background: red; color: white; border: none; cursor: pointer;';
    document.body.appendChild(testBtn);
    
    // 测试按钮点击事件
    testBtn.addEventListener('click', function() {
        console.log('测试直接登录按钮被点击');
        
        // 直接调用登录方法
        const username = 'zhenglin';
        const password = '123456';
        
        // 模拟表单提交
        const e = { preventDefault: () => console.log('阻止默认行为') };
        
        // 填充表单字段
        document.getElementById('loginUsername').value = username;
        document.getElementById('loginPassword').value = password;
        
        // 直接调用handleLogin方法
        userManagement.handleLogin(e);
    });
    
    // 添加登录表单提交事件的直接监听
    loginForm.addEventListener('submit', function(e) {
        console.log('登录表单直接监听的submit事件被触发');
    });
    
    console.log('登录功能测试脚本初始化完成');
});