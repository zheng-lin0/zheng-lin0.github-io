// 验证修复脚本
// 在浏览器控制台中运行此脚本以测试修复效果

console.log('=== 开始验证修复效果 ===');

// 1. 检查UserManagement模块是否加载
console.log('1. 检查UserManagement模块:');
if (typeof UserManagement !== 'undefined') {
    console.log('   ✓ UserManagement模块加载成功');
} else {
    console.log('   ✗ UserManagement模块未加载');
}

// 2. 检查userManagement实例
console.log('\n2. 检查userManagement实例:');
if (typeof userManagement !== 'undefined') {
    console.log('   ✓ userManagement实例存在');
    console.log('   实例是否已初始化:', userManagement.isInitialized);
    
    // 3. 检查用户列表
    console.log('\n3. 检查用户列表:');
    if (userManagement.users && userManagement.users.length > 0) {
        console.log('   ✓ 用户列表已加载，共', userManagement.users.length, '个用户');
        console.log('   用户列表:', userManagement.users);
    } else {
        console.log('   ✗ 用户列表未加载');
    }
    
    // 4. 检查当前用户
    console.log('\n4. 检查当前用户:');
    if (userManagement.currentUser) {
        console.log('   ✓ 当前用户已登录:', userManagement.currentUser);
    } else {
        console.log('   ✗ 当前用户未登录');
    }
    
    // 5. 测试登录功能
    console.log('\n5. 测试登录功能:');
    
    // 模拟登录表单
    const mockDocument = {
        getElementById: function(id) {
            if (id === 'loginUsername') {
                return { value: 'zhenglin' };
            } else if (id === 'loginPassword') {
                return { value: '123456' };
            } else if (id === 'loginUsernameError') {
                return { textContent: '' };
            }
            return null;
        }
    };
    
    // 保存原始getElementById
    const originalGetElementById = document.getElementById;
    
    // 替换为模拟函数
    document.getElementById = mockDocument.getElementById;
    
    // 模拟事件对象
    const mockEvent = {
        preventDefault: function() {}
    };
    
    try {
        // 尝试登录
        userManagement.handleLogin(mockEvent);
        
        if (userManagement.currentUser) {
            console.log('   ✓ 登录测试成功:', userManagement.currentUser);
        } else {
            console.log('   ✗ 登录测试失败');
        }
    } catch (error) {
        console.log('   ✗ 登录测试抛出错误:', error);
    }
    
    // 恢复原始getElementById
    document.getElementById = originalGetElementById;
    
} else {
    console.log('   ✗ userManagement实例不存在');
}

// 6. 检查toolsModal修复
console.log('\n6. 检查toolsModal修复:');

// 读取index.html内容
fetch('index.html')
    .then(response => response.text())
    .then(html => {
        if (html.includes("openModal('toolsModal')") || html.includes('openModal("toolsModal")')) {
            console.log('   ✗ index.html中仍然存在对toolsModal的引用');
        } else {
            console.log('   ✓ 已成功移除所有对toolsModal的引用');
        }
        
        console.log('\n=== 修复验证完成 ===');
    })
    .catch(error => {
        console.log('   ✗ 无法加载index.html:', error);
        console.log('\n=== 修复验证完成 ===');
    });
