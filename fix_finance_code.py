# 修复index.html中的财务方法重复定义问题

# 打开文件
try:
    with open(r'c:\Users\HP\Desktop\新建文件夹 (5)\index.html', 'r', encoding='utf-8') as file:
        content = file.read()
    print("文件读取成功")
except Exception as e:
    print(f"文件读取失败: {e}")
    exit(1)

# 找到问题区域的开始和结束位置
# 使用更简单的搜索方式
start_marker = '<!-- 财务功能已在 js/modules/FinancialManagement.js 中实现 -->'
end_marker = '</script>'

# 找到开始位置
start_pos = content.find(start_marker)
if start_pos == -1:
    print("未找到开始标记")
    exit(1)
print(f"开始位置: {start_pos}")

# 找到结束位置
end_pos = content.find(end_marker, start_pos)
if end_pos == -1:
    print("未找到结束标记")
    exit(1)
print(f"结束位置: {end_pos}")

# 计算结束位置，包括</script>标签
end_pos += len(end_marker)

# 替换问题区域的内容
new_content = content[:start_pos] + '    <!-- 财务功能已在 js/modules/FinancialManagement.js 中实现 -->' + content[end_pos:]

# 写入文件
try:
    with open(r'c:\Users\HP\Desktop\新建文件夹 (5)\index.html', 'w', encoding='utf-8') as file:
        file.write(new_content)
    print("修复完成")
except Exception as e:
    print(f"文件写入失败: {e}")
    exit(1)
