// 登录问题诊断脚本
console.log('=== 登录问题诊断脚本 ===');

// 1. 检查localStorage中的用户数据
console.log('1. 检查localStorage中的用户数据:');
const usersInStorage = localStorage.getItem('users');
if (usersInStorage) {
    const parsedUsers = JSON.parse(usersInStorage);
    console.log(`   用户数量: ${parsedUsers.length}`);
    console.log('   用户列表:');
    parsedUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. 用户名: ${user.username}, 密码: ${user.password}, 邮箱: ${user.email}, 角色: ${user.role}`);
    });
} else {
    console.log('   localStorage中没有用户数据');
}

// 2. 检查当前登录用户
console.log('\n2. 检查当前登录用户:');
const currentUser = localStorage.getItem('currentUser');
if (currentUser) {
    console.log('   当前登录用户:', JSON.parse(currentUser));
} else {
    console.log('   当前没有登录用户');
}

// 3. 测试登录功能
console.log('\n3. 测试登录功能:');
function testLogin(username, password) {
    console.log(`   测试登录: ${username}/${password}`);
    
    if (usersInStorage) {
        const parsedUsers = JSON.parse(usersInStorage);
        const foundUser = parsedUsers.find(u => u.username === username && u.password === password);
        
        if (foundUser) {
            console.log('   ✅ 登录成功!');
            return true;
        } else {
            console.log('   ❌ 登录失败: 用户名或密码错误');
            return false;
        }
    } else {
        console.log('   ❌ 登录失败: 没有用户数据');
        return false;
    }
}

// 4. 创建统一的诊断函数，供统一测试面板调用
console.log('\n4. 登录问题诊断功能已就绪...');
function runLoginDiagnosis() {
    // 重新运行诊断
    console.clear();
    console.log('=== 登录问题诊断脚本 ===');
    
    // 检查localStorage中的用户数据
    console.log('1. 检查localStorage中的用户数据:');
    const usersInStorage = localStorage.getItem('users');
    if (usersInStorage) {
        const parsedUsers = JSON.parse(usersInStorage);
        console.log(`   用户数量: ${parsedUsers.length}`);
        console.log('   用户列表:');
        parsedUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. 用户名: ${user.username}, 密码: ${user.password}, 邮箱: ${user.email}, 角色: ${user.role}`);
        });
    } else {
        console.log('   localStorage中没有用户数据');
    }
    
    // 检查当前登录用户
    console.log('\n2. 检查当前登录用户:');
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        console.log('   当前登录用户:', JSON.parse(currentUser));
    } else {
        console.log('   当前没有登录用户');
    }
    
    // 测试默认用户登录
    console.log('\n3. 测试默认用户登录:');
    testLogin('zhenglin', '123456');
    testLogin('admin', 'admin123');
    testLogin('test', 'test123');
    
    // 提示用户检查控制台
    alert('诊断完成！请检查浏览器控制台以查看详细信息。');
}

// 将诊断函数暴露给全局，供统一测试面板调用
window.runLoginDiagnosis = runLoginDiagnosis;

// 在页面加载完成后提示用户使用统一测试面板
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('登录问题诊断脚本已加载，请通过统一测试面板运行诊断');
        
        // 如果统一测试面板未加载，提供手动调用方式
        if (typeof window.unifiedTestPanel === 'undefined') {
            console.log('未检测到统一测试面板，您可以通过调用 runLoginDiagnosis() 手动运行诊断');
        }
    });
} else {
    console.log('登录问题诊断脚本已加载，请通过统一测试面板运行诊断');
    
    // 如果统一测试面板未加载，提供手动调用方式
    if (typeof window.unifiedTestPanel === 'undefined') {
        console.log('未检测到统一测试面板，您可以通过调用 runLoginDiagnosis() 手动运行诊断');
    }
}

// 5. 测试默认用户登录
console.log('\n5. 测试默认用户登录:');
testLogin('zhenglin', '123456');
testLogin('admin', 'admin123');
testLogin('test', 'test123');

console.log('\n=== 诊断完成 ===');
console.log('请点击页面右上角的"运行登录诊断"按钮重新运行诊断。');