import re

# 读取index.html文件内容
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 打印文件的一部分，以验证我们读取了正确的文件
print("文件开头1000个字符：")
print(content[:1000])
print("\n" + "="*50 + "\n")

# 使用正则表达式查找并删除有问题的代码块
# 我们将使用更简单的模式，只匹配开始的<script>标签和结束的</script>标签
pattern = r'<script>\s*this\.transactions = \[.*?</script>'
match = re.search(pattern, content, flags=re.DOTALL)

if match:
    print("找到有问题的代码块：")
    print(match.group(0))
    print("\n" + "="*50 + "\n")
    
    # 替换找到的代码块
    substituted_content = re.sub(pattern, '<!-- 财务功能已在 js/modules/FinancialManagement.js 中实现 -->', content, flags=re.DOTALL)
    
    # 写入修改后的内容
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(substituted_content)
    
    print('已删除有问题的财务功能代码块')
else:
    print('未找到有问题的代码块')

# 验证修改
with open('index.html', 'r', encoding='utf-8') as f:
    new_content = f.read()

print("\n" + "="*50 + "\n")
print("修改后的文件内容（从第690行开始）：")
lines = new_content.split('\n')
if len(lines) > 700:
    print('\n'.join(lines[690:710]))
