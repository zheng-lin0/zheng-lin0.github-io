// Supabase 用户保存功能测试脚本

/**
 * 测试 Supabase 用户保存功能
 */
async function testSupabaseUserSave() {
    console.log('=== 开始测试 Supabase 用户保存功能 ===');
    
    // 检查必要条件
    if (!window.userManagement) {
        console.error('❌ 用户管理模块未加载');
        return false;
    }
    
    // 使用共享的Supabase客户端实例
    let supabase = window.userManagement.supabase;
    if (!supabase) {
        // 如果userManagement中没有，尝试获取共享实例
        supabase = window.supabaseClient;
    }
    
    if (!supabase) {
        console.error('❌ Supabase 未配置');
        return false;
    }
    
    // 测试结果
    const testResults = {
        setup: false,
        userCreation: false,
        userRetrieval: false,
        cleanup: false
    };
    
    // 测试数据
    const testUser = {
        username: `test_user_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'Test123456!'
    };
    
    let createdUserId = null;
    
    try {
        // 1. 测试环境设置
        console.log('1. 测试环境设置...');
        
        // 检查 Supabase 连接
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            throw new Error('无法连接到 Supabase: ' + sessionError.message);
        }
        
        testResults.setup = true;
        console.log('✅ 测试环境设置成功');
        
        // 2. 测试用户创建
        console.log('2. 测试用户创建...');
        
        // 使用 Supabase Auth 创建用户
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: testUser.email,
            password: testUser.password
        }, {
            emailRedirectTo: window.location.origin,
            data: { email_confirm: true }
        });
        
        if (authError) {
            throw new Error('创建 Auth 用户失败: ' + authError.message);
        }
        
        // 创建用户资料
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                username: testUser.username,
                email: testUser.email,
                role: '测试用户',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        
        if (profileError) {
            throw new Error('创建用户资料失败: ' + profileError.message);
        }
        
        createdUserId = authData.user.id;
        testResults.userCreation = true;
        console.log('✅ 用户创建成功');
        console.log('   - User ID:', createdUserId);
        console.log('   - 用户名:', testUser.username);
        console.log('   - 邮箱:', testUser.email);
        
        // 3. 测试用户检索
        console.log('3. 测试用户检索...');
        
        // 从 users 表获取用户
        const { data: retrievedUser, error: retrieveError } = await supabase
            .from('users')
            .select('*')
            .eq('username', testUser.username)
            .single();
        
        if (retrieveError) {
            throw new Error('检索用户失败: ' + retrieveError.message);
        }
        
        if (!retrievedUser) {
            throw new Error('未找到创建的用户');
        }
        
        testResults.userRetrieval = true;
        console.log('✅ 用户检索成功');
        console.log('   - 检索到的用户:', retrievedUser);
        
        // 4. 测试登录功能
        console.log('4. 测试登录功能...');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testUser.email,
            password: testUser.password
        });
        
        if (loginError) {
            throw new Error('登录失败: ' + loginError.message);
        }
        
        console.log('✅ 登录功能测试成功');
        console.log('   - 登录用户 ID:', loginData.user.id);
        
        // 登出
        await supabase.auth.signOut();
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
    } finally {
        // 清理测试数据
        console.log('5. 清理测试数据...');
        
        if (createdUserId) {
            try {
                // 删除用户资料
                await supabase
                    .from('users')
                    .delete()
                    .eq('id', createdUserId);
                
                // 删除 Auth 用户
                await supabase.auth.admin.deleteUser(createdUserId);
                
                testResults.cleanup = true;
                console.log('✅ 测试数据清理成功');
            } catch (error) {
                console.error('❌ 清理测试数据失败:', error);
            }
        } else {
            console.log('⚠️  没有需要清理的数据');
        }
    }
    
    // 显示最终结果
    console.log('\n=== 测试结果汇总 ===');
    console.log(`环境设置: ${testResults.setup ? '✅' : '❌'}`);
    console.log(`用户创建: ${testResults.userCreation ? '✅' : '❌'}`);
    console.log(`用户检索: ${testResults.userRetrieval ? '✅' : '❌'}`);
    console.log(`数据清理: ${testResults.cleanup ? '✅' : '❌'}`);
    
    const allTestsPassed = Object.values(testResults).every(result => result);
    
    if (allTestsPassed) {
        console.log('\n🎉 所有测试通过！Supabase 用户保存功能正常工作');
    } else {
        console.log('\n❌ 部分测试失败，请检查错误信息');
    }
    
    return allTestsPassed;
}

/**
 * 初始化测试工具
 */
function initTestTool() {
    // 全局访问
    window.testSupabaseUserSave = testSupabaseUserSave;
    
    console.log('Supabase 用户保存测试工具已加载。请通过统一测试工具面板或在控制台运行 testSupabaseUserSave()');
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestTool);
} else {
    initTestTool();
}