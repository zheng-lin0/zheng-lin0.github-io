import re

# 读取HTML文件
with open('c:\\Users\\HP\\Desktop\\新建文件夹 (5)\\index.html', 'r', encoding='utf-8') as file:
    html_content = file.read()

# 提取CSS内容
css_pattern = r'<style>(.*?)</style>'
css_match = re.search(css_pattern, html_content, re.DOTALL)

if css_match:
    css_content = css_match.group(1)
    # 保存CSS内容到文件
    with open('c:\\Users\\HP\\Desktop\\新建文件夹 (5)\\css\\main.css', 'w', encoding='utf-8') as css_file:
        css_file.write(css_content)
    print('CSS提取成功！')
    print(f'CSS文件大小: {len(css_content)} 字符')
else:
    print('未找到CSS内容！')
