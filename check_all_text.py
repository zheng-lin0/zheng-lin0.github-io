# 检查文件中的所有文本内容

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 移除所有HTML标签
import re
text_content = re.sub(r'<[^>]+>', '', content)

# 移除所有空白字符
clean_text = text_content.strip()

print(f'文件总长度: {len(content)} 字符')
print(f'移除所有HTML标签后的文本长度: {len(clean_text)} 字符')

# 显示前200个字符和后200个字符
if clean_text:
    print('\n文本内容的前200个字符:')
    print(repr(clean_text[:200]))
    
    print('\n文本内容的后200个字符:')
    print(repr(clean_text[-200:]))
    
    # 查找可能的JavaScript代码
    js_keywords = ['function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'return', 'console.log']
    print('\n检查后500个字符中是否包含JavaScript关键字:')
    
    last_500 = clean_text[-500:]
    found_keywords = []
    for keyword in js_keywords:
        if keyword in last_500:
            found_keywords.append(keyword)
    
    if found_keywords:
        print(f'发现以下JavaScript关键字: {found_keywords}')
    else:
        print('未发现JavaScript关键字')

# 检查文件末尾
print('\n文件末尾的100个字符:')
print(repr(content[-100:]))
