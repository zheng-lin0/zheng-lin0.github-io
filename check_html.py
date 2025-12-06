from bs4 import BeautifulSoup

# 读取HTML文件
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 解析HTML
soup = BeautifulSoup(html, 'html.parser')

# 检查主要标签闭合情况
print('HTML结构检查完成，主要标签闭合情况:')
print('HTML标签:', '闭合' if soup.find('html') else '未闭合')
print('HEAD标签:', '闭合' if soup.find('head') else '未闭合')
print('BODY标签:', '闭合' if soup.find('body') else '未闭合')
print('MAIN标签:', '闭合' if soup.find('main') else '未闭合')

# 检查是否有解析错误
if hasattr(soup, 'errors') and soup.errors:
    print('解析错误:', soup.errors)
else:
    print('解析错误:', '无')

# 检查script标签
print('\nScript标签检查:')
scripts = soup.find_all('script')
print(f'共找到 {len(scripts)} 个script标签')

# 检查最后几个script标签的完整性
for i, script in enumerate(scripts[-5:], 1):
    print(f'第 {len(scripts)-5+i} 个script标签内容长度:', len(script.string) if script.string else 0)
