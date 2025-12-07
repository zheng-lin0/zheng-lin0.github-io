// 登录修复测试脚本
// 用于验证UserManagement.js中的登录修复是否有效

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('登录修复测试脚本已加载');
    
    // 测试配置
    const testConfig = {
        username: 'admin',
        password: 'admin123' // 注意：迁移脚本中使用的是加密密码，实际登录需要Supabase Auth中的密码
    };
    
    // 测试1: 检查Supabase配置
    function testSupabaseConfig() {
        console.log('\n=== 测试1: 检查Supabase配置 ===');
        if (window.appConfig && window.appConfig.services && window.appConfig.services.supabase) {
            console.log('✓ Supabase配置已找到');
            console.log('URL:', window.appConfig.services.supabase.url);
            console.log('Anon Key:', window.appConfig.services.supabase.anonKey ? '已设置' : '未设置');
            return true;
        } else {
            console.error('✗ Supabase配置未找到');
            return false;
        }
    }
    
    // 测试2: 尝试初始化UserManagement
    function testUserManagementInit() {
        console.log('\n=== 测试2: 初始化UserManagement ===');
        if (window.userManagement) {
            console.log('✓ UserManagement已初始化');
            console.log('Supabase客户端:', window.userManagement.supabase ? '已创建' : '未创建');
            return true;
        } else {
            console.error('✗ UserManagement未初始化');
            return false;
        }
    }
    
    // 测试3: 检查users表是否存在
    async function testUsersTable() {
        console.log('\n=== 测试3: 检查users表 ===');
        if (!window.userManagement || !window.userManagement.supabase) {
            console.error('✗ 无法测试，Supabase客户端未初始化');
            return false;
        }
        
        try {
            const { data, error } = await window.userManagement.supabase
                .from('users')
                .select('id, username, email')
                .limit(5);
            
            if (error) {
                console.error('✗ 查询users表失败:', error);
                return false;
            } else {
                console.log('✓ 查询users表成功，找到', data.length, '个用户');
                console.log('用户列表:', data);
                return true;
            }
        } catch (err) {
            console.error('✗ 查询users表出错:', err);
            return false;
        }
    }
    
    // 测试4: 尝试通过用户名查找用户
    async function testFindUserByUsername(username) {
        console.log('\n=== 测试4: 通过用户名查找用户 ===');
        if (!window.userManagement || !window.userManagement.supabase) {
            console.error('✗ 无法测试，Supabase客户端未初始化');
            return false;
        }
        
        try {
            const { data, error } = await window.userManagement.supabase
                .from('users')
                .select('id, username, email')
                .eq('username', username)
                .single();
            
            if (error) {
                console.error('✗ 查找用户失败:', error);
                return false;
            } else {
                console.log('✓ 找到用户:', data);
                return data;
            }
        } catch (err) {
            console.error('✗ 查找用户出错:', err);
            return false;
        }
    }
    
    // 显示测试结果
    function showTestResults(results) {
        console.log('\n=== 测试总结 ===');
        let passed = 0;
        let total = results.length;
        
        results.forEach((result, index) => {
            if (result.passed) {
                console.log(`✓ 测试${index + 1}: ${result.message}`);
                passed++;
            } else {
                console.log(`✗ 测试${index + 1}: ${result.message}`);
            }
        });
        
        console.log(`\n总计: ${passed}/${total} 个测试通过`);
        
        if (passed === total) {
            console.log('\n🎉 所有测试通过！登录功能应该可以正常工作了。');
        } else {
            console.log('\n⚠️  部分测试失败，可能需要进一步检查。');
        }
    }
    
    // 运行所有测试
    async function runAllTests() {
        const results = [];
        
        // 测试1
        const configResult = testSupabaseConfig();
        results.push({ passed: configResult, message: 'Supabase配置检查' });
        
        // 测试2
        const initResult = testUserManagementInit();
        results.push({ passed: initResult, message: 'UserManagement初始化' });
        
        // 测试3
        const tableResult = await testUsersTable();
        results.push({ passed: tableResult, message: 'users表检查' });
        
        // 测试4
        const userResult = await testFindUserByUsername(testConfig.username);
        results.push({ passed: !!userResult, message: '通过用户名查找用户' });
        
        // 显示结果
        showTestResults(results);
        
        // 提供建议
        console.log('\n=== 建议 ===');
        console.log('1. 确保您已经在Supabase控制台执行了迁移脚本 (database/migrations/001_initial_tables.sql)');
        console.log('2. 检查默认用户是否已经存在于users表中');
        console.log('3. 注意：迁移脚本中的密码是加密的，您需要在Supabase Auth中设置对应的密码');
        console.log('4. 如果登录失败，请检查浏览器控制台获取详细错误信息');
    }
    
    // 全局访问
    window.runLoginFixTests = runAllTests;
    
    console.log('\n=== 登录修复测试已准备就绪 ===');
    console.log('请通过统一测试工具面板或在控制台运行 runLoginFixTests() 开始测试');
});
