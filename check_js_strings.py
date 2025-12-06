# 检查JavaScript代码中是否有未闭合的字符串

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到所有script标签内容
script_contents = []
i = 0
while True:
    # 找到script标签开始
    script_start = content.find('<script', i)
    if script_start == -1:
        break
    
    # 找到script标签结束
    script_end = content.find('</script>', script_start)
    if script_end == -1:
        print(f'警告: 未找到script标签的结束，从位置 {script_start} 开始')
        break
    
    # 提取script内容
    script_content = content[script_start + 7:script_end]
    script_contents.append((script_start, script_content))
    
    i = script_end + 9  # 移动到下一个位置

# 检查每个script内容中的字符串
print(f'检查 {len(script_contents)} 个script标签的内容...')

for script_start, script_content in script_contents[-5:]:  # 只检查最后5个script标签，因为问题可能在底部
    # 检查单引号字符串
    single_quote_count = script_content.count("'")
    if single_quote_count % 2 != 0:
        print(f'在位置 {script_start} 附近的script标签中发现未闭合的单引号字符串')
    
    # 检查双引号字符串
    double_quote_count = script_content.count('"')
    if double_quote_count % 2 != 0:
        print(f'在位置 {script_start} 附近的script标签中发现未闭合的双引号字符串')
    
    # 检查模板字符串
    backtick_count = script_content.count('`')
    if backtick_count % 2 != 0:
        print(f'在位置 {script_start} 附近的script标签中发现未闭合的模板字符串')

print('检查完成!')
