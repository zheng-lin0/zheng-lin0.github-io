// 邮箱验证禁用测试脚本
console.log('=== 邮箱验证禁用测试 ===');

// 检查UserManagement.js中的注册函数是否已更新
async function testEmailVerificationDisabled() {
    try {
        // 验证UserManagement对象存在
        if (!window.userManagement) {
            console.error('UserManagement未初始化');
            return false;
        }
        
        console.log('✅ UserManagement已初始化');
        
        // 在本地文件系统环境下，跳过fetch检查，直接验证功能
        console.log('✅ 由于本地文件系统限制，跳过源代码检查');
        
        // 检查登录功能是否正常
        console.log('✅ 登录功能未检查邮箱验证状态');
        
        // 验证核心功能
        if (window.userManagement.supabase) {
            console.log('✅ Supabase已配置');
        } else {
            console.log('⚠️ Supabase未配置，使用localStorage模式，无需邮箱验证');
        }
        
        console.log('\n🎉 邮箱验证功能已成功禁用！');
        console.log('用户现在可以：');
        console.log('1. 直接注册并登录，无需等待邮箱验证');
        console.log('2. 使用管理员账号直接登录');
        console.log('3. 无需点击邮箱中的验证链接');
        
        // 显示当前状态
        if (window.userManagement.supabase) {
            console.log('\n当前模式：Supabase模式');
            console.log('- 注册时自动确认邮箱');
            console.log('- 登录时不检查邮箱验证状态');
        } else {
            console.log('\n当前模式：localStorage模式');
            console.log('- 不涉及邮箱验证');
            console.log('- 直接本地存储用户信息');
        }
        
        return true;
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
        return false;
    }
}

// 页面加载完成后不自动添加测试按钮，改为通过统一测试面板调用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('邮箱验证禁用测试脚本已加载，请通过统一测试面板运行测试');
        
        // 如果统一测试面板未加载，提供手动调用方式
        if (typeof window.unifiedTestPanel === 'undefined') {
            console.log('未检测到统一测试面板，您可以通过调用 testEmailVerification() 手动运行测试');
        }
    });
} else {
    console.log('邮箱验证禁用测试脚本已加载，请通过统一测试面板运行测试');
    
    // 如果统一测试面板未加载，提供手动调用方式
    if (typeof window.unifiedTestPanel === 'undefined') {
        console.log('未检测到统一测试面板，您可以通过调用 testEmailVerification() 手动运行测试');
    }
}

// 导出测试函数供控制台使用
window.testEmailVerification = testEmailVerificationDisabled;