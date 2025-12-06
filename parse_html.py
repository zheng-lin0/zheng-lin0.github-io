# 使用BeautifulSoup解析HTML
from bs4 import BeautifulSoup

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')

# 检查基本结构
if soup.html is None:
    print('缺少html标签!')
else:
    print('找到html标签')

if soup.body is None:
    print('缺少body标签!')
else:
    print('找到body标签')

# 检查main标签
main_tags = soup.find_all('main')
print(f'找到 {len(main_tags)} 个main标签')
for i, main_tag in enumerate(main_tags):
    print(f'main标签 {i} 有 {len(list(main_tag.descendants))} 个子节点')

# 检查script标签
script_tags = soup.find_all('script')
print(f'找到 {len(script_tags)} 个script标签')

# 检查body标签的所有子标签
if soup.body:
    print('\nbody标签的直接子标签:')
    for child in soup.body.children:
        if child.name:
            print(f'  - {child.name}')

# 检查是否有文本内容在body标签的直接子级
if soup.body:
    print('\n检查body标签中是否有直接的文本内容:')
    for i, child in enumerate(soup.body.children):
        if isinstance(child, str) and child.strip():
            print(f'  找到直接文本内容: {repr(child.strip()[:50])}...')
            print(f'  位置: 大约在文件的中间部分')
