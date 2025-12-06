from bs4 import BeautifulSoup

# 读取原始HTML文件
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 使用BeautifulSoup解析HTML
soup = BeautifulSoup(content, 'html.parser')

# 移除所有内联style标签
for style_tag in soup.find_all('style'):
    style_tag.extract()

# 移除所有内联script标签
for script_tag in soup.find_all('script'):
    script_tag.extract()

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

# 查找body标签并在其内部末尾添加脚本
body_tag = soup.find('body')
if body_tag:
    # 创建BeautifulSoup对象来解析脚本字符串
    scripts_soup = BeautifulSoup(external_scripts, 'html.parser')
    # 将脚本添加到body标签末尾
    for script in scripts_soup.find_all('script'):
        body_tag.append(script)

# 保存修改后的文件
with open('index.html.new', 'w', encoding='utf-8') as f:
    f.write(str(soup))

print('HTML文件处理完成！')