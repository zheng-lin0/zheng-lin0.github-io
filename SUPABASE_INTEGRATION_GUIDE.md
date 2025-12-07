# Supabase 账号信息保存指南

本指南将详细说明如何将用户账号信息保存到 Supabase 数据库中，并确保安全配置。

## 一、当前系统配置状态

### 1.1 Supabase 配置检查

系统已经在 `config.js` 中配置了 Supabase 客户端信息：

```javascript
// 第三方服务配置
services: {
    supabase: {
        url: 'https://zrxtmrsfnycdcfolgwiq.supabase.co', // 替换为你的Supabase项目URL
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeHRtcnNmbnljZGNmb2xnd2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzg4MzUsImV4cCI6MjA4MDY1NDgzNX0.dOrxsRZR9zE-BZ1s_t-RT418sOyAdUmbeNG_1G7-NV4', // 替换为你的Supabase匿名密钥
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    },
    // ...
}
```

### 1.2 当前实现状态

`UserManagement.js` 模块已经实现了与 Supabase 的集成：

- ✅ Supabase 客户端初始化
- ✅ 用户注册功能 (保存到 Supabase)
- ✅ 用户登录功能 (从 Supabase 验证)
- ✅ 用户信息读取功能

## 二、如何使用 Supabase 保存账号信息

### 2.1 通过注册表单保存

系统默认提供了注册表单，用户可以通过以下方式将账号信息保存到 Supabase：

1. 打开应用登录页面
2. 点击"注册"按钮
3. 填写用户名、邮箱和密码
4. 点击"注册"按钮

系统会自动：
- 创建 Supabase Auth 用户
- 在 `users` 表中保存用户资料
- 自动确认邮箱（当前配置）

### 2.2 通过 JavaScript API 保存

系统提供了全局 `register` 函数，可以通过 JavaScript 代码直接调用：

```javascript
// 使用全局注册函数
register("username", "user@example.com", "password");
```

### 2.3 通过用户管理模块保存

也可以直接调用用户管理模块的方法：

```javascript
// 使用用户管理模块
window.userManagement.handleRegister(event);
```

## 三、系统架构说明

### 3.1 用户数据流向

```
用户输入 → 表单验证 → Supabase Auth 注册 → users 表插入 → 返回结果
```

### 3.2 数据库结构

系统在 Supabase 中需要以下表结构：

#### users 表
```
id: uuid (主键)
username: text (用户名)
email: text (邮箱)
role: text (角色)
created_at: timestamp (创建时间)
updated_at: timestamp (更新时间)
```

## 四、安全配置与注意事项

### 4.1 修复密码存储安全问题

**重要安全提醒：** 当前实现中存在密码明文存储的安全问题！

在 `UserManagement.js` 第 470-480 行，密码被明文存储到 `users` 表中。这是不安全的做法，因为：

1. Supabase Auth 已经安全存储了密码
2. 明文存储密码违反安全最佳实践
3. 可能导致数据泄露风险

**修复方法：**

```javascript
// 将用户资料创建代码修改为：
const { error: profileError } = await this.supabase
    .from('users')
    .insert({
        id: authData.user.id,
        username: username,
        email: email,
        // 移除密码字段！
        role: '普通用户',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
```

### 4.2 配置 Supabase 安全规则

为确保数据安全，需要配置 Supabase 的 RLS (Row Level Security) 规则：

1. 打开 Supabase 控制台
2. 导航到 "Authentication" > "Policies"
3. 为 `users` 表创建以下策略：

#### 允许用户查看自己的资料
```sql
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT
    USING (auth.uid() = id);
```

#### 允许用户更新自己的资料
```sql
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);
```

### 4.3 配置邮箱验证

当前系统配置已禁用邮箱验证：

```javascript
// 添加自动确认邮箱配置
emailRedirectTo: window.location.origin, // 重定向到当前网站
data: { email_confirm: true } // 标记邮箱已确认
```

**生产环境建议：** 启用邮箱验证以提高安全性：

```javascript
// 移除自动确认配置
const { data: authData, error: authError } = await this.supabase.auth.signUp({
    email: email,
    password: password
});
```

## 五、故障排除

### 5.1 常见问题

#### Supabase 连接失败
- 检查 `config.js` 中的 Supabase URL 和密钥是否正确
- 确保 Supabase 项目已启用
- 检查网络连接

#### 用户注册失败
- 检查邮箱格式是否正确
- 确保用户名和邮箱不重复
- 查看浏览器控制台的错误信息

#### 密码验证问题
- 检查密码长度和复杂度要求
- 确保密码输入一致

### 5.2 调试工具

系统提供了详细的调试信息，可以通过浏览器控制台查看：

```javascript
// 启用详细日志
console.log(window.userManagement);
console.log(window.userManagement.supabase);
```

## 六、高级配置

### 6.1 自定义用户角色

可以在注册时指定用户角色：

```javascript
// 创建用户资料时指定角色
const { error: profileError } = await this.supabase
    .from('users')
    .insert({
        id: authData.user.id,
        username: username,
        email: email,
        role: '管理员', // 自定义角色
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
```

### 6.2 扩展用户资料

可以向 `users` 表添加更多字段：

```sql
ALTER TABLE public.users ADD COLUMN bio text;
ALTER TABLE public.users ADD COLUMN avatar_url text;
ALTER TABLE public.users ADD COLUMN last_login timestamp;
```

然后在注册时更新这些字段：

```javascript
const { error: profileError } = await this.supabase
    .from('users')
    .insert({
        id: authData.user.id,
        username: username,
        email: email,
        role: '普通用户',
        bio: '个人简介',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
```

## 七、总结

系统已经完整实现了将账号信息保存到 Supabase 的功能，包括：

- ✅ Supabase 客户端配置
- ✅ 用户注册与登录功能
- ✅ 自动邮箱确认
- ✅ 全局 API 支持

**建议：**
1. 立即修复密码明文存储问题
2. 配置 Supabase RLS 安全规则
3. 生产环境启用邮箱验证
4. 根据需求扩展用户资料字段

通过以上配置，用户账号信息将安全地保存到 Supabase 数据库中，并提供可靠的用户认证功能。