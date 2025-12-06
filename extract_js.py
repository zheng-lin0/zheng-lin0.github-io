import re

# 读取HTML文件
with open('c:\\Users\\HP\\Desktop\\新建文件夹 (5)\\index.html', 'r', encoding='utf-8') as file:
    html_content = file.read()

# 提取所有JavaScript内容
script_pattern = r'<script(?:\s+[^>]*)?>(.*?)</script>'
script_matches = re.findall(script_pattern, html_content, re.DOTALL)

# 过滤掉引入外部脚本的script标签（空内容或只包含注释的）
js_contents = []
for i, script_content in enumerate(script_matches):
    # 移除注释
    clean_content = re.sub(r'<!--|-->', '', script_content)
    # 移除多余空格
    clean_content = clean_content.strip()
    if clean_content:
        js_contents.append((i, clean_content))

print(f'找到 {len(js_contents)} 个JavaScript代码块')

# 保存主要的JavaScript代码块
for i, content in js_contents:
    if 'class ProjectManagementSystem' in content:
        with open('c:\\Users\\HP\\Desktop\\新建文件夹 (5)\\js\\modules\\ProjectManagement.js', 'w', encoding='utf-8') as f:
            f.write(content)
    elif 'class CRMService' in content:
        with open('c:\\Users\\HP\\Desktop\\新建文件夹 (5)\\js\\modules\\CRMService.js', 'w', encoding='utf-8') as f:
            f.write(content)
    elif 'class FinancialManagementSystem' in content:
        with open('c:\\Users\\HP\\Desktop\\新建文件夹 (5)\\js\\modules\\FinancialManagement.js', 'w', encoding='utf-8') as f:
            f.write(content)
    elif 'class CollaborationSystem' in content:
        with open('c:\\Users\\HP\\Desktop\\新建文件夹 (5)\\js\\modules\\CollaborationSystem.js', 'w', encoding='utf-8') as f:
            f.write(content)
    elif 'class DataAnalyticsSystem' in content:
        with open('c:\\Users\\HP\\Desktop\\新建文件夹 (5)\\js\\modules\\DataAnalyticsSystem.js', 'w', encoding='utf-8') as f:
            f.write(content)
    elif 'class APIIntegrationSystem' in content:
        with open('c:\\Users\\HP\\Desktop\\新建文件夹 (5)\\js\\modules\\APIIntegrationSystem.js', 'w', encoding='utf-8') as f:
            f.write(content)
    elif 'Element.prototype.closest' in content or 'Array.prototype' in content:
        with open('c:\\Users\\HP\\Desktop\\新建文件夹 (5)\\js\\utils.js', 'a', encoding='utf-8') as f:
            f.write(content + '\n\n')

print('JavaScript代码提取完成！')
