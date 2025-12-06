import re

# 读取原始HTML文件
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 移除所有内联style标签和内容 - 使用更严格的模式
content = re.sub(r'<style[^>]*>[^<]*</style>', '', content, flags=re.IGNORECASE)

# 处理多行style标签
while re.search(r'<style[^>]*>[^<]*<[^/][^>]*[^<]*</style>', content, flags=re.IGNORECASE):
    content = re.sub(r'<style[^>]*>(.*?)</style>', '', content, flags=re.DOTALL | re.IGNORECASE)

# 移除所有内联script标签和内容 - 使用更严格的模式
content = re.sub(r'<script[^>]*>[^<]*</script>', '', content, flags=re.IGNORECASE)

# 处理多行script标签
while re.search(r'<script[^>]*>[^<]*<[^/][^>]*[^<]*</script>', content, flags=re.IGNORECASE):
    content = re.sub(r'<script[^>]*>(.*?)</script>', '', content, flags=re.DOTALL | re.IGNORECASE)

# 在</body>标签前添加外部JavaScript文件引用
external_scripts = '''
<script src="js/config.js"></script>
<script src="js/modules/ProjectManagement.js"></script>
<script src="js/modules/CRMService.js"></script>
<script src="js/modules/FinancialManagement.js"></script>
<script src="js/modules/CollaborationSystem.js"></script>
<script src="js/modules/DataAnalyticsSystem.js"></script>
<script src="js/modules/APIIntegrationSystem.js"></script>
<script src="js/app.js"></script>
'''
content = re.sub(r'</body>', f'{external_scripts}</body>', content)

# 保存修改后的文件
with open('index.html.new', 'w', encoding='utf-8') as f:
    f.write(content)

print('HTML文件处理完成！')
