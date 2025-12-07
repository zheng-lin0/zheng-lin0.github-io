# 修复index.html中的财务方法重复定义问题

# 使用更直接的方法
import re

# 打开文件
try:
    with open(r'c:\Users\HP\Desktop\新建文件夹 (5)\index.html', 'r', encoding='utf-8') as file:
        content = file.read()
    print("文件读取成功")
except Exception as e:
    print(f"文件读取失败: {e}")
    exit(1)

# 使用正则表达式匹配问题区域
pattern = r'<!--<!-- 财务功能已在 js/modules/FinancialManagement.js 中实现 -->.*?</script>'

# 替换匹配的内容
new_content = re.sub(pattern, '    <!-- 财务功能已在 js/modules/FinancialManagement.js 中实现 -->', content, flags=re.DOTALL)

# 写入文件
try:
    with open(r'c:\Users\HP\Desktop\新建文件夹 (5)\index.html', 'w', encoding='utf-8') as file:
        file.write(new_content)
    print("修复完成")
except Exception as e:
    print(f"文件写入失败: {e}")
    exit(1)
