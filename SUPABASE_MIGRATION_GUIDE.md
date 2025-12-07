# Supabase迁移使用指南

## 一、Supabase配置

### 1. 创建Supabase项目
1. 访问[Supabase官网](https://supabase.com/)并登录
2. 点击"New project"创建新项目
3. 填写项目信息（名称、密码等）并选择区域
4. 点击"Create project"等待项目创建完成

### 2. 获取API密钥
1. 在项目仪表板中，点击左侧菜单的"Settings"
2. 选择"API"选项卡
3. 复制"Project URL"和"anon public"密钥

## 二、执行数据库迁移

### 1. 使用Supabase控制台
1. 登录到Supabase控制台
2. 点击左侧菜单的"SQL Editor"
3. 点击"New query"
4. 复制`database/migrations/001_initial_tables.sql`文件的内容
5. 点击"Run"执行迁移脚本
6. 验证表是否创建成功（点击左侧菜单的"Database" > "Tables"）

### 2. 使用命令行（可选）
```bash
# 安装Supabase CLI
npm install -g supabase

# 登录Supabase
supabase login

# 链接到项目
supabase link --project-ref <your-project-ref>

# 运行迁移脚本
supabase migration up
```

## 三、配置应用连接

### 1. 修改配置文件
编辑`js/config.js`文件，更新Supabase配置：

```javascript
services: {
    supabase: {
        url: 'https://your-project-url.supabase.co', // 替换为你的Project URL
        anonKey: 'your-anon-key', // 替换为你的anon public密钥
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    },
    // 其他服务配置...
}
```

### 2. 验证连接
1. 启动本地服务器：
   ```bash
   python -m http.server 8000
   ```
2. 在浏览器中访问`http://localhost:8000`
3. 打开浏览器开发者工具的控制台
4. 检查是否有Supabase连接成功的日志

## 四、测试功能

### 1. 用户认证
1. 点击页面顶部的"登录"按钮
2. 使用默认用户名密码登录：
   - 用户名：`admin`
   - 密码：`password`
3. 验证是否登录成功并显示用户信息

### 2. 主题设置
1. 登录后，点击右上角的用户头像
2. 选择"设置"
3. 切换主题（明亮/暗黑）
4. 刷新页面验证主题设置是否持久化

### 3. 应用安装
1. 点击左侧菜单的"应用中心"
2. 安装一个应用
3. 刷新页面验证应用是否仍然显示为已安装

### 4. 资源下载
1. 点击左侧菜单的"资源中心"
2. 下载一个资源
3. 点击"下载历史"验证记录是否保存

### 5. 会员积分
1. 点击左侧菜单的"会员中心"
2. 验证会员等级和积分是否正确显示

## 五、故障排除

### 1. 连接错误
- 检查`js/config.js`中的Supabase URL和密钥是否正确
- 确保Supabase项目处于活动状态
- 检查网络连接

### 2. 功能失效
- 检查浏览器控制台是否有错误信息
- 验证数据库表是否正确创建
- 检查用户权限设置

### 3. 数据不持久
- 确保用户已登录
- 检查Supabase表中的数据是否正确插入
- 验证网络连接是否稳定

## 六、注意事项

1. **默认密码**：迁移脚本中使用的默认密码为`password`，建议在生产环境中修改
2. **数据备份**：定期备份Supabase数据库以防止数据丢失
3. **性能优化**：根据实际使用情况调整索引和查询
4. **安全设置**：在生产环境中启用Supabase的安全功能（如Row Level Security）
5. **监控**：使用Supabase的监控功能跟踪应用性能和错误

## 七、后续维护

1. **添加新功能**：创建新的迁移脚本，不要修改现有脚本
2. **数据迁移**：如果需要修改表结构，创建新的迁移脚本
3. **性能监控**：定期检查数据库性能并优化查询
4. **安全更新**：及时更新Supabase客户端库和依赖

如果遇到任何问题，请参考[Supabase官方文档](https://supabase.com/docs)或查看应用的控制台日志。