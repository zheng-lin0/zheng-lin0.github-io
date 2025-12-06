# 查看HTML文件中最后几个script标签的内容

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到所有script标签的位置
script_starts = []
i = 0
while True:
    i = content.find('<script', i)
    if i == -1:
        break
    script_starts.append(i)
    i += 7

# 只查看最后3个script标签
print(f'总共有 {len(script_starts)} 个script标签')
for i in range(max(0, len(script_starts) - 3), len(script_starts)):
    script_start = script_starts[i]
    
    # 找到script标签的结束
    script_end = content.find('</script>', script_start)
    if script_end == -1:
        print(f'警告: 未找到script标签的结束，从位置 {script_start} 开始')
        break
    
    print(f'\nscript标签 {i+1} (位置 {script_start}-{script_end}):')
    print('-' * 70)
    script_content = content[script_start:script_end + 9]
    print(script_content)
    print('-' * 70)
