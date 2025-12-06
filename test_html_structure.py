# 简单的HTML结构检查脚本

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 检查标签的闭合情况
open_tags = []
for i, char in enumerate(content):
    if char == '<':
        # 找到标签的开始
        tag_start = i
        tag_end = content.find('>', tag_start)
        if tag_end != -1:
            tag = content[tag_start+1:tag_end]
            # 跳过注释和自闭合标签
            if not tag.startswith('!--') and not tag.endswith('/'):
                # 检查是开始标签还是结束标签
                if tag.startswith('/'):
                    # 结束标签
                    tag_name = tag[1:].split()[0]
                    if open_tags and open_tags[-1] == tag_name:
                        open_tags.pop()
                    else:
                        print(f'错误: 不匹配的结束标签 </{tag_name}> 在位置 {i}')
                else:
                    # 开始标签
                    tag_name = tag.split()[0]
                    # 跳过某些不需要闭合的标签
                    if tag_name not in ['br', 'hr', 'img', 'input', 'meta', 'link']:
                        open_tags.append(tag_name)

print(f'未闭合的标签: {open_tags}')

# 特别检查main标签
main_start = content.find('<main')
main_end = content.rfind('</main>')
print(f'main标签开始位置: {main_start}')
print(f'main标签结束位置: {main_end}')

# 检查script标签的闭合情况
script_start = content.find('<script')
script_count = 0
while script_start != -1:
    script_end = content.find('</script>', script_start)
    if script_end != -1:
        script_count += 1
        script_start = content.find('<script', script_end)
    else:
        print(f'错误: 未闭合的script标签在位置 {script_start}')
        break

print(f'找到 {script_count} 个闭合的script标签')
