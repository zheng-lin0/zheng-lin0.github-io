# 手动部署网站到GitHub Pages指南

由于自动化部署出现了一些技术问题，我们可以通过手动方式将网站部署到GitHub Pages。

## 步骤1：准备文件

确保你有以下文件准备就绪：
- `index.html` - 网站主页面
- `css/main.css` - 样式文件
- `js/` - JavaScript目录（包含所有必要的.js文件）
- `assets/` - 资源目录（如图片、图标等）

## 步骤2：登录GitHub

1. 访问 [GitHub](https://github.com/) 并登录你的账号
2. 打开仓库：https://github.com/zheng-lin0/zheng-lin0.github.io

## 步骤3：上传文件

1. 点击仓库页面的 "Add file" 按钮，选择 "Upload files"
2. 拖拽或选择所有网站文件和目录进行上传
3. 确保文件结构保持不变（如css/和js/目录）
4. 在页面底部，添加提交信息（如 "更新网站内容"）
5. 点击 "Commit changes" 按钮完成上传

## 步骤4：配置GitHub Pages

1. 在仓库页面，点击 "Settings" 选项卡
2. 在左侧菜单中，点击 "Pages"
3. 在 "Branch" 部分，选择要部署的分支（建议选择main或master）
4. 在 "Directory" 部分，选择 "/ (root)" 选项
5. 点击 "Save" 按钮保存设置

## 步骤5：等待部署完成

GitHub Pages通常需要几分钟时间来部署你的网站。部署完成后，你可以通过以下链接访问你的网站：

https://zheng-lin0.github.io

## 验证部署

1. 访问上述链接，确保网站能够正常加载
2. 检查网站的功能是否正常工作，特别是在线浏览器部分的跨域安全修复

## 常见问题排查

- 如果网站无法加载，请检查文件上传是否完整
- 如果出现404错误，请检查GitHub Pages的分支和目录配置是否正确
- 如果跨域错误仍然存在，请确保index.html中的iframe标签包含正确的sandbox属性：
  ```html
  <iframe id="browserIframe" src="https://www.baidu.com" frameborder="0" sandbox="allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"></iframe>
  ```

## 后续维护

- 每次更新网站内容时，重复步骤3的文件上传过程
- 确保所有必要的文件都已上传，包括CSS、JavaScript和资源文件