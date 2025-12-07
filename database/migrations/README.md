# 数据库迁移脚本

## 说明

本目录包含Supabase数据库的迁移脚本，用于创建应用所需的表结构和初始数据。

## 迁移脚本列表

### 001_initial_tables.sql
- 创建初始表结构
- 添加索引以提高查询性能
- 插入默认用户数据

## 表结构说明

### users (用户表)
- 存储用户基本信息
- 包含用户名、邮箱、密码、角色等字段

### user_sessions (用户会话表)
- 存储用户登录会话信息
- 包含会话令牌、过期时间等字段

### user_preferences (用户偏好设置表)
- 存储用户个性化设置
- 包含主题、通知设置、语言等字段

### user_installed_apps (用户安装的应用表)
- 存储用户已安装的应用列表
- 包含应用ID、安装时间等字段

### user_membership (用户会员表)
- 存储用户会员等级和积分信息
- 包含会员等级、积分、有效期等字段

### user_download_history (用户下载历史表)
- 存储用户资源下载记录
- 包含资源ID、资源标题、下载时间等字段

## 如何使用

### 在Supabase控制台执行迁移脚本

1. 登录到Supabase控制台
2. 打开SQL编辑器
3. 复制并粘贴迁移脚本内容
4. 点击执行按钮

### 使用Supabase CLI执行迁移

```bash
# 安装Supabase CLI
npm install -g supabase

# 登录到Supabase
supabase login

# 链接到项目
supabase link --project-ref <project-ref>

# 运行迁移
supabase migration up
```

## 注意事项

1. 迁移脚本中的密码是加密后的示例密码（密码：password）
2. 生产环境中请修改默认密码
3. 定期备份数据库以防止数据丢失
4. 修改表结构时请创建新的迁移脚本，不要直接修改现有脚本
