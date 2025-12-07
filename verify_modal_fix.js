// 模态框修复验证脚本
console.log('=== 模态框修复验证开始 ===');

// 检查是否存在authModal的引用
const fs = require('fs');
const path = require('path');

const userManagementPath = path.join(__dirname, 'js', 'modules', 'UserManagement.js');
const indexHtmlPath = path.join(__dirname, 'index.html');

try {
    // 读取UserManagement.js文件
    const userManagementContent = fs.readFileSync(userManagementPath, 'utf8');
    
    // 检查是否还存在authModal的引用
    const authModalMatches = userManagementContent.match(/authModal/g) || [];
    
    console.log(`UserManagement.js中authModal的引用数量: ${authModalMatches.length}`);
    
    if (authModalMatches.length === 0) {
        console.log('✓ 成功移除了所有authModal的引用');
    } else {
        console.log('✗ 仍存在authModal的引用，需要进一步检查');
        
        // 显示所有authModal引用的位置
        const lines = userManagementContent.split('\n');
        lines.forEach((line, index) => {
            if (line.includes('authModal')) {
                console.log(`  第${index + 1}行: ${line.trim()}`);
            }
        });
    }
    
    // 检查loginModal和registerModal的引用
    const loginModalMatches = userManagementContent.match(/loginModal/g) || [];
    const registerModalMatches = userManagementContent.match(/registerModal/g) || [];
    
    console.log(`loginModal的引用数量: ${loginModalMatches.length}`);
    console.log(`registerModal的引用数量: ${registerModalMatches.length}`);
    
    // 检查index.html中是否存在loginModal和registerModal元素
    const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    const hasLoginModal = indexHtmlContent.includes('<div class="modal" id="loginModal">');
    const hasRegisterModal = indexHtmlContent.includes('<div class="modal" id="registerModal">');
    const hasAuthModal = indexHtmlContent.includes('<div class="modal" id="authModal">');
    
    console.log(`\nHTML文件检查:`);
    console.log(`loginModal元素存在: ${hasLoginModal ? '✓' : '✗'}`);
    console.log(`registerModal元素存在: ${hasRegisterModal ? '✓' : '✗'}`);
    console.log(`authModal元素存在: ${hasAuthModal ? '✗' : '✓ (不存在是预期的)'}`);
    
    // 综合评估
    console.log(`\n=== 修复评估 ===`);
    if (authModalMatches.length === 0 && hasLoginModal && hasRegisterModal && !hasAuthModal) {
        console.log('✓ 修复成功！所有authModal引用已替换为正确的模态框ID');
    } else {
        console.log('✗ 修复不完全，请检查上述问题');
    }
    
} catch (error) {
    console.error('验证过程中发生错误:', error);
}

console.log('=== 模态框修复验证结束 ===');