// 用户数据迁移工具 - 将 localStorage 用户迁移到 Supabase

/**
 * 迁移工具主函数
 */
async function migrateUsersToSupabase() {
    console.log('开始将 localStorage 用户迁移到 Supabase...');
    
    // 获取Supabase实例
    const getSupabaseInstance = () => {
        if (window.userManagement && window.userManagement.supabase) {
            return window.userManagement.supabase;
        } else if (window.supabaseClient) {
            return window.supabaseClient;
        } else if (window.appConfig && window.appConfig.services && window.appConfig.services.supabase) {
            return supabase.createClient(
                window.appConfig.services.supabase.url,
                window.appConfig.services.supabase.anonKey,
                window.appConfig.services.supabase.auth
            );
        } else {
            console.error('Supabase配置未找到');
            return null;
        }
    };

    // 检查必要条件
    const supabase = getSupabaseInstance();
    if (!supabase) {
        return;
    }
    
    // 从 localStorage 获取现有用户
    const localStorageUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (localStorageUsers.length === 0) {
        console.log('localStorage 中没有用户数据');
        return;
    }
    
    console.log(`找到 ${localStorageUsers.length} 个需要迁移的用户`);
    
    // 迁移结果统计
    const migrationStats = {
        total: localStorageUsers.length,
        success: 0,
        failed: 0,
        errors: []
    };
    
    // 逐个迁移用户
    for (const user of localStorageUsers) {
        try {
            console.log(`迁移用户: ${user.username} (${user.email})`);
            
            // 检查用户是否已存在于 Supabase
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('username', user.username)
                .single();
            
            if (checkError && checkError.code !== 'PGRST116') {
                // 116 错误表示未找到记录，这是正常的
                throw checkError;
            }
            
            if (existingUser) {
                console.log(`用户 ${user.username} 已存在于 Supabase，跳过`);
                continue;
            }
            
            // 使用 Supabase Auth 创建用户
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: user.email,
                password: user.password
            }, {
                // 自动确认邮箱
                emailRedirectTo: window.location.origin,
                data: { email_confirm: true }
            });
            
            if (authError) {
                throw authError;
            }
            
            // 创建用户资料
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role || '普通用户',
                    created_at: user.createdAt || new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            
            if (profileError) {
                throw profileError;
            }
            
            console.log(`用户 ${user.username} 迁移成功`);
            migrationStats.success++;
            
        } catch (error) {
            console.error(`用户 ${user.username} 迁移失败:`, error);
            migrationStats.failed++;
            migrationStats.errors.push({
                username: user.username,
                error: error.message
            });
        }
    }
    
    // 显示迁移结果
    console.log('\n=== 用户迁移结果 ===');
    console.log(`总用户数: ${migrationStats.total}`);
    console.log(`成功迁移: ${migrationStats.success}`);
    console.log(`迁移失败: ${migrationStats.failed}`);
    
    if (migrationStats.errors.length > 0) {
        console.log('\n迁移失败的用户:');
        migrationStats.errors.forEach(err => {
            console.log(`${err.username}: ${err.error}`);
        });
    }
    
    console.log('\n迁移完成！');
}

/**
 * 初始化迁移工具
 */
function initMigrationTool() {
    // 全局访问
    window.migrateUsersToSupabase = migrateUsersToSupabase;
    
    console.log('用户迁移工具已加载。请通过统一测试工具面板或在控制台运行 migrateUsersToSupabase()');
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMigrationTool);
} else {
    initMigrationTool();
}