# 查找main标签之后和body标签结束之前的内容

import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 使用正则表达式查找main标签之后和body标签结束之前的内容
pattern = r'</main>(.*?)</body>'
matches = re.findall(pattern, content, re.DOTALL)

if matches:
    print('找到main标签之后和body标签结束之前的内容:')
    print('-' * 50)
    
    # 检查内容中是否有script标签
    main_to_body = matches[0]
    script_count = main_to_body.count('<script')
    script_end_count = main_to_body.count('</script>')
    
    print(f'main到body之间的script开始标签数量: {script_count}')
    print(f'main到body之间的script结束标签数量: {script_end_count}')
    
    # 查找可能的文本内容
    text_content = re.sub(r'<[^>]+>', '', main_to_body)
    text_content = text_content.strip()
    
    if text_content:
        print('\n在main到body之间发现文本内容:')
        print(repr(text_content[:200]))  # 只显示前200个字符
    else:
        print('\n在main到body之间没有发现直接的文本内容')
        
    # 检查所有script标签的闭合
    script_starts = []
    i = 0
    while True:
        i = main_to_body.find('<script', i)
        if i == -1:
            break
        script_starts.append(i)
        i += 7
    
    script_ends = []
    i = 0
    while True:
        i = main_to_body.find('</script>', i)
        if i == -1:
            break
        script_ends.append(i)
        i += 9
    
    if script_starts and script_ends:
        if len(script_starts) == len(script_ends):
            print(f'\n所有script标签都已正确闭合: {len(script_starts)}个开始，{len(script_ends)}个结束')
        else:
            print(f'\nscript标签数量不匹配: {len(script_starts)}个开始，{len(script_ends)}个结束')
            
            # 显示最后一个未闭合的script标签附近的内容
            if len(script_starts) > len(script_ends):
                last_start = script_starts[-1]
                start_pos = max(0, last_start - 20)
                end_pos = min(len(main_to_body), last_start + 100)
                print('最后一个未闭合的script标签附近内容:')
                print(repr(main_to_body[start_pos:end_pos]))

else:
    print('未找到main标签之后和body标签结束之前的内容')
