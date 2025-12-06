# 计算script标签的数量并找出不匹配

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到所有script标签的位置
start_indices = []
i = 0
while True:
    i = content.find('<script', i)
    if i == -1:
        break
    start_indices.append(i)
    i += 7  # 移动过 '<script' 字符串

# 找到所有</script>标签的位置
end_indices = []
i = 0
while True:
    i = content.find('</script>', i)
    if i == -1:
        break
    end_indices.append(i)
    i += 9  # 移动过 '</script>' 字符串

print(f'script开始标签数量: {len(start_indices)}')
print(f'script结束标签数量: {len(end_indices)}')

# 检查不匹配
if len(start_indices) != len(end_indices):
    print('发现不匹配的script标签!')
    
    # 检查是否有未闭合的script标签
    if len(start_indices) > len(end_indices):
        print(f'有 {len(start_indices) - len(end_indices)} 个未闭合的script标签')
        # 显示最后几个开始标签的内容
        for i in start_indices[-3:]:
            # 显示标签周围的内容
            start = max(0, i - 10)
            end = min(len(content), i + 100)
            print(f'位置 {i} 附近的内容: {content[start:end]}')
    
    # 检查是否有多余的结束标签
    else:
        print(f'有 {len(end_indices) - len(start_indices)} 个多余的script结束标签')
        # 显示最后几个结束标签的内容
        for i in end_indices[-3:]:
            # 显示标签周围的内容
            start = max(0, i - 10)
            end = min(len(content), i + 20)
            print(f'位置 {i} 附近的内容: {content[start:end]}')
