import re

# 读取原始HTML文件
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取HTML body内容
body_match = re.search(r'<body\b[^>]*>([\s\S]*?)</body>', content, flags=re.IGNORECASE)
body_content = body_match.group(1) if body_match else ''

# 使用循环移除所有内联style标签 - 确保完全清理
while True:
    new_content = re.sub(r'<style\b[^>]*>([\s\S]*?)</style>', '', body_content, flags=re.IGNORECASE)
    if new_content == body_content:
        break
    body_content = new_content

# 使用循环移除所有内联script标签 - 确保完全清理
while True:
    new_content = re.sub(r'<script\b[^>]*>([\s\S]*?)</script>', '', body_content, flags=re.IGNORECASE)
    if new_content == body_content:
        break
    body_content = new_content

# 创建全新的HTML结构
new_html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <meta name="description" content="智能导航中心 - 多功能集成平台，包含在线浏览器、26+实用工具、AI助手、会员系统等">
    <meta name="keywords" content="在线工具,浏览器,AI助手,应用商店,资源中心">
    <meta name="author" content="智能导航中心">
    <title>智能导航中心 v2.0 - 多功能集成平台</title>
    
    <!-- 字体和图标 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/brands.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- 外部CSS文件 -->
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
{body_content}

<!-- 外部JavaScript文件引用 -->
<script src="js/config.js"></script>
<script src="js/modules/ProjectManagement.js"></script>
<script src="js/modules/CRMService.js"></script>
<script src="js/modules/FinancialManagement.js"></script>
<script src="js/modules/CollaborationSystem.js"></script>
<script src="js/modules/DataAnalyticsSystem.js"></script>
<script src="js/modules/APIIntegrationSystem.js"></script>
<script src="js/app.js"></script>
</body>
</html>'''

# 保存修改后的文件
with open('index.html.new', 'w', encoding='utf-8') as f:
    f.write(new_html)

print('HTML文件重建完成！')