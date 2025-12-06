# 创建一个全新的、干净的HTML文件

new_html_content = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>企业资源管理系统</title>
    
    <!-- 外部资源引用 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    <!-- 主要应用容器 -->
    <div id="app-container">
        <!-- 顶部导航栏 -->
        <nav id="top-nav">
            <!-- 导航栏内容 -->
        </nav>
        
        <!-- 主内容区域 -->
        <main id="main-content">
            <!-- 主要内容 -->
        </main>
        
        <!-- 底部信息栏 -->
        <footer id="footer">
            <!-- 底部内容 -->
        </footer>
    </div>
    
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

# 将新内容写入文件
with open('index.html.new', 'w', encoding='utf-8') as f:
    f.write(new_html_content)

print("HTML文件已创建完成！")
