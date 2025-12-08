-- Supabase数据库迁移脚本
-- 版本: 001
-- 描述: 创建初始表结构

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar TEXT,
    bio TEXT,
    role VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    level VARCHAR(20) DEFAULT '会员level1',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户偏好设置表
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light',
    notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    language VARCHAR(10) DEFAULT 'zh-CN',
    privacy_settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户安装的应用表
CREATE TABLE IF NOT EXISTS user_installed_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    app_id VARCHAR(50) NOT NULL,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- 添加唯一约束，确保每个用户只能安装同一个应用一次
    UNIQUE(user_id, app_id)
);

-- 创建用户会员表
CREATE TABLE IF NOT EXISTS user_membership (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    level VARCHAR(20) DEFAULT 'basic',
    points INTEGER DEFAULT 0,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expire_date TIMESTAMP WITH TIME ZONE,
    membership_status VARCHAR(20) DEFAULT 'active',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户下载历史表
CREATE TABLE IF NOT EXISTS user_download_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_id VARCHAR(50) NOT NULL,
    resource_title VARCHAR(255) NOT NULL,
    download_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_installed_apps_user_id ON user_installed_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_download_history_user_id ON user_download_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_download_history_download_date ON user_download_history(download_date);

-- 插入默认用户数据
INSERT INTO users (id, username, email, password, full_name, role, status)
VALUES 
    ('1a75e102-83b1-4f12-8b3f-555f7a8c9d11', 'admin', 'admin@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '管理员', 'admin', 'active'),
    ('2c5b2a4d-6e8f-0a1b-2c3d-4e5f-6a7b-8c9d', 'user1', 'user1@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '用户1', 'user', 'active'),
    ('3d4e5f6a-7b8c-9d0e-1f2a-3b4c-5d6e-7f8a', 'user2', 'user2@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '用户2', 'user', 'active'),
    ('4d5e6f7a-8b9c-0d1e-2f3a-4b5c-6d7e-8f9a', 'zhenglin', 'zhenglin@example.com', '134625', '郑林', 'user', 'active')
ON CONFLICT (id) DO NOTHING;

-- 为默认用户插入会员数据
INSERT INTO user_membership (user_id, level, points, join_date)
VALUES 
    ('1a75e102-83b1-4f12-8b3f-555f7a8c9d11', 'premium', 1000, NOW()),
    ('2c5b2a4d-6e8f-0a1b-2c3d-4e5f-6a7b-8c9d', 'basic', 0, NOW()),
    ('3d4e5f6a-7b8c-9d0e-1f2a-3b4c-5d6e-7f8a', 'basic', 50, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- 为默认用户插入偏好设置数据
INSERT INTO user_preferences (user_id, theme, notifications, language)
VALUES 
    ('1a75e102-83b1-4f12-8b3f-555f7a8c9d11', 'dark', true, 'zh-CN'),
    ('2c5b2a4d-6e8f-0a1b-2c3d-4e5f-6a7b-8c9d', 'light', true, 'zh-CN'),
    ('3d4e5f6a-7b8c-9d0e-1f2a-3b4c-5d6e-7f8a', 'light', false, 'zh-CN')
ON CONFLICT (user_id) DO NOTHING;
