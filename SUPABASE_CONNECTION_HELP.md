# Supabase连接帮助

要将应用程序连接到Supabase，需要完成以下步骤：

## 步骤1：获取Supabase项目信息

1. 访问 [Supabase官网](https://supabase.com/) 并登录您的账户
2. 创建一个新项目或选择现有项目
3. 在项目仪表板中，点击左侧菜单的 `Settings`（设置）
4. 选择 `API` 选项卡
5. 在 `Project URL` 和 `anon public` 部分复制您的API密钥

## 步骤2：更新应用配置

1. 打开 `js/config.js` 文件
2. 找到 `services.supabase` 部分
3. 更新 `url` 和 `anonKey` 为您从Supabase获取的值

示例配置：
```javascript
services: {
    supabase: {
        url: 'https://your-project-id.supabase.co', // 替换为您的Project URL
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // 替换为您的anon public密钥
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    }
}
```

## 步骤3：执行数据库迁移

1. 登录Supabase控制台
2. 打开 `SQL Editor`
3. 点击 `New query`
4. 复制 `database/migrations/001_initial_tables.sql` 文件的所有内容
5. 点击 `Run` 执行迁移脚本
6. 验证表是否成功创建（在 `Table Editor` 中查看）

## 步骤4：测试连接

1. 启动本地服务器：
   ```bash
   # 使用Python启动简单的HTTP服务器
   python -m http.server 8000
   ```

2. 打开浏览器访问：`http://localhost:8000`

3. 测试核心功能：
   - 用户登录（默认用户名：admin，密码：password）
   - 应用安装/卸载
   - 资源下载
   - 主题切换

4. 在浏览器控制台查看是否有任何错误信息

## 常见问题排查

### 连接错误
如果应用程序无法连接到Supabase，请检查：
- `config.js` 中的URL和密钥是否正确
- Supabase项目是否已激活
- 网络连接是否正常
- Supabase项目的安全设置是否允许您的IP地址访问

### 认证错误
如果登录失败，请检查：
- 用户名和密码是否正确（默认：admin/password）
- Supabase中的用户表是否已正确创建
- 是否有相关的错误信息显示在浏览器控制台中

### 数据保存错误
如果数据无法保存，请检查：
- 相关表是否已正确创建
- 用户是否已登录
- 浏览器控制台是否有错误信息

## 获取进一步帮助

如果您在连接过程中遇到问题，请：
1. 检查浏览器控制台的错误信息
2. 查看 `SUPABASE_MIGRATION_GUIDE.md` 中的详细指南
3. 参考 [Supabase官方文档](https://supabase.com/docs)

## 注意事项

- 不要在公开代码中分享您的Supabase密钥
- 确保在生产环境中使用适当的安全设置
- 定期备份您的数据库

完成上述步骤后，您的应用程序应该能够成功连接到Supabase并使用其数据库服务。