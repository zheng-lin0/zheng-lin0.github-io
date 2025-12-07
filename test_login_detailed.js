// 详细的登录功能测试脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('登录功能详细测试脚本已加载');
    
    // 1. 检查页面中是否有多个loginForm
    const loginForms = document.querySelectorAll('#loginForm');
    console.log('页面中ID为loginForm的元素数量:', loginForms.length);
    loginForms.forEach((form, index) => {
        console.log(`loginForm ${index}:`, form);
    });
    
    // 2. 检查登录表单的事件监听器
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // 使用getEventListeners查看事件监听器（仅在Chrome DevTools中可用）
        if (typeof getEventListeners === 'function') {
            const listeners = getEventListeners(loginForm);
            console.log('登录表单的事件监听器:', listeners);
        } else {
            console.log('请在Chrome浏览器中打开开发者工具以查看事件监听器');
        }
        
        // 3. 添加一个直接的submit事件监听器，看看是否能触发
        loginForm.addEventListener('submit', function(e) {
            console.log('直接添加的submit事件监听器被触发');
        });
        
        // 4. 检查登录按钮
        const loginBtn = loginForm.querySelector('button[type="submit"]');
        if (loginBtn) {
            console.log('登录按钮:', loginBtn);
            
            // 检查按钮的事件监听器
            if (typeof getEventListeners === 'function') {
                const btnListeners = getEventListeners(loginBtn);
                console.log('登录按钮的事件监听器:', btnListeners);
            }
            
            // 5. 添加按钮点击事件监听器
            loginBtn.addEventListener('click', function(e) {
                console.log('登录按钮点击事件被触发');
                console.log('事件是否被阻止:', e.defaultPrevented);
            });
        }
    }
    
    // 6. 检查UserManagement的handleLogin方法
    console.log('UserManagement.handleLogin:', userManagement.handleLogin);
    
    // 7. 添加一个全局的表单提交事件监听器
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'loginForm') {
            console.log('全局表单提交事件监听器捕获到loginForm提交');
        }
    }, true); // 使用捕获模式
    
    // 8. 检查modalSystem是否正确处理模态框
    console.log('modalSystem:', window.modalSystem);
    
    // 9. 检查closeModal函数是否存在
    console.log('closeModal函数:', typeof closeModal);
    
    // 10. 创建一个模拟登录的函数
    function simulateLogin() {
        console.log('开始模拟登录');
        
        // 填充表单
        const usernameInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        
        if (usernameInput && passwordInput) {
            usernameInput.value = 'zhenglin';
            passwordInput.value = '123456';
            
            // 创建模拟事件
            const submitEvent = new Event('submit', { 
                bubbles: true, 
                cancelable: true 
            });
            
            // 触发表单提交
            if (loginForm.dispatchEvent(submitEvent)) {
                console.log('表单提交事件未被阻止');
            } else {
                console.log('表单提交事件被阻止');
            }
        }
    }
    
    // 11. 将测试功能封装为可调用函数，供统一测试面板调用
    window.runDetailedLoginTest = simulateLogin;
    
    // 提示用户使用统一测试面板
    console.log('登录功能详细测试脚本初始化完成。请通过统一测试面板运行测试，或手动调用 runDetailedLoginTest() 函数。');
    
    console.log('登录功能详细测试脚本初始化完成');
});