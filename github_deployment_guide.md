# GitHub部署详细操作指南

## 步骤1：在GitHub上创建新仓库

1. 打开浏览器访问 [GitHub官网](https://github.com/) 并登录你的账户
2. 点击右上角的「+」号图标，选择「New repository」
3. 在新建仓库页面填写以下信息：
   - **Repository name**: 输入仓库名称（例如：my-website）
   - **Description**: （可选）输入仓库描述
   - **Public/Private**: 选择公开(Public)或私有(Private)仓库
   - 不要勾选「Initialize this repository with a README」等选项
4. 点击「Create repository」按钮创建仓库

## 步骤2：将本地仓库与GitHub仓库关联

1. 创建成功后，GitHub会显示仓库页面
2. 在页面中找到仓库的URL地址，有两种选择：
   - HTTPS: `https://github.com/你的用户名/你的仓库名.git`
   - SSH: `git@github.com:你的用户名/你的仓库名.git`（需要配置SSH密钥）
3. 复制你选择的URL地址

4. 回到本地终端（终端ID 8），执行以下命令：

```bash
git remote add origin https://github.com/你的用户名/你的仓库名.git
```

将命令中的URL替换为你刚才复制的GitHub仓库URL。

## 步骤3：推送代码到GitHub

执行以下命令将本地代码推送到GitHub仓库：

```bash
git push -u origin master
```

- 如果你使用的是HTTPS URL，系统会提示你输入GitHub用户名和密码
- 如果你使用的是SSH URL，系统会使用你的SSH密钥进行认证（无需输入密码）

## 步骤4：设置GitHub Pages部署

1. 推送完成后，回到GitHub仓库页面
2. 点击上方导航栏的「Settings」选项
3. 在左侧菜单中点击「Pages」选项
4. 在「Source」部分：
   - 在「Branch」下拉菜单中选择「master」（或「main」）分支
   - 在「Folder」下拉菜单中选择「/(root)」
5. 点击「Save」按钮保存设置

## 步骤5：访问部署后的网站

1. 设置完成后，GitHub会开始构建和部署你的网站
2. 部署完成后，页面会显示网站的访问URL：`https://你的用户名.github.io/你的仓库名/`
3. 等待几分钟后，打开浏览器访问这个URL，就能看到你的网站了

## 常见问题解决

1. **推送失败提示「fatal: Could not read from remote repository」**
   - 检查URL是否正确
   - 如果使用SSH，检查SSH密钥是否正确配置

2. **GitHub Pages不显示网站**
   - 确保仓库中有index.html文件
   - 等待几分钟后刷新页面
   - 检查GitHub Pages设置是否正确

3. **网站样式或功能缺失**
   - 确保所有资源文件（CSS、JavaScript）路径正确
   - 检查是否有相对路径问题

## 注意事项

- 每次本地代码更新后，执行以下命令推送更新到GitHub：
  ```bash
  git add .
  git commit -m "更新描述"
  git push
  ```

- GitHub Pages会自动重新构建并部署你的网站

- 如果你想使用自定义域名，可以在GitHub Pages设置中配置