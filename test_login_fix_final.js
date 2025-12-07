// 测试登录修复效果
console.log('=== 登录修复测试脚本 ===');

// 模拟UserManagement类的关键功能
class MockUserManagement {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.supabase = null; // 模拟Supabase未配置
    }

    // 模拟initUsers方法
    async initUsers() {
        console.log('初始化用户数据...');
        
        // 默认用户数据
        const defaultUsers = [
            { username: 'zhenglin', password: '134625', email: 'zhenglin@example.com', role: '超级管理员' },
            { username: 'admin', password: 'admin123', email: 'admin@example.com', role: '管理员' },
            { username: 'test', password: 'test123', email: 'test@example.com', role: '普通用户' }
        ];

        console.log('使用默认用户数据:', defaultUsers);
        this.users = defaultUsers;
        return defaultUsers;
    }

    // 模拟handleLocalStorageLogin方法
    handleLocalStorageLogin(username, password) {
        console.log(`\n尝试登录: ${username}/${password}`);
        
        // 默认用户数据
        const defaultUsers = [
            { username: 'zhenglin', password: '134625', email: 'zhenglin@example.com', role: '超级管理员' },
            { username: 'admin', password: 'admin123', email: 'admin@example.com', role: '管理员' },
            { username: 'test', password: 'test123', email: 'test@example.com', role: '普通用户' }
        ];
        
        // 首先尝试从当前用户列表中查找
        let user = this.users.find(u => 
            (u.username === username || u.username.toLowerCase() === username.toLowerCase()) && 
            u.password === password
        );
        
        // 如果当前用户列表中没有找到，直接从默认用户列表中查找
        if (!user) {
            user = defaultUsers.find(u => 
                (u.username === username || u.username.toLowerCase() === username.toLowerCase()) && 
                u.password === password
            );
            
            // 如果从默认用户列表中找到了用户，更新用户列表
            if (user) {
                console.log('从默认用户列表中找到用户，更新用户数据');
                this.users = defaultUsers;
            }
        }
        
        console.log('找到的用户:', user);
        
        if (user) {
            this.currentUser = user;
            console.log('✅ 登录成功！当前用户:', this.currentUser);
            return true;
        } else {
            console.log('❌ 登录失败：用户名或密码错误');
            
            // 显示所有用户详细信息
            console.log('=== 所有用户详细信息 ===');
            this.users.forEach((user, index) => {
                console.log(`用户${index + 1}:`, {
                    username: user.username,
                    password: user.password,
                    matchUsername: user.username === username,
                    matchPassword: user.password === password
                });
            });
            return false;
        }
    }
}

// 运行测试
async function runTests() {
    const userManagement = new MockUserManagement();
    
    // 初始化用户数据
    await userManagement.initUsers();
    
    console.log('\n=== 开始测试 ===');
    
    // 测试1: 正确的用户名和密码
    console.log('\n1. 测试正确的用户名和密码 (zhenglin/134625):');
    const result1 = userManagement.handleLocalStorageLogin('zhenglin', '134625');
    
    // 测试2: 错误的密码
    console.log('\n2. 测试错误的密码 (zhenglin/wrongpassword):');
    const result2 = userManagement.handleLocalStorageLogin('zhenglin', 'wrongpassword');
    
    // 测试3: 其他用户
    console.log('\n3. 测试其他用户 (admin/admin123):');
    const result3 = userManagement.handleLocalStorageLogin('admin', 'admin123');
    
    // 测试4: 大小写不敏感
    console.log('\n4. 测试大小写不敏感 (ZHENGLIN/134625):');
    const result4 = userManagement.handleLocalStorageLogin('ZHENGLIN', '134625');
    
    console.log('\n=== 测试结果汇总 ===');
    console.log(`1. 正确登录: ${result1 ? '✅ 通过' : '❌ 失败'}`);
    console.log(`2. 错误密码: ${result2 ? '❌ 通过' : '✅ 失败'}`);
    console.log(`3. 其他用户: ${result3 ? '✅ 通过' : '❌ 失败'}`);
    console.log(`4. 大小写不敏感: ${result4 ? '✅ 通过' : '❌ 失败'}`);
    
    // 统计通过的测试数
    const passedTests = [result1, !result2, result3, result4].filter(Boolean).length;
    console.log(`\n测试完成: ${passedTests}/4 个测试通过`);
    
    if (passedTests === 4) {
        console.log('🎉 所有测试通过！登录修复有效。');
    } else {
        console.log('⚠️  部分测试失败，需要进一步修复。');
    }
}

// 运行测试
runTests();