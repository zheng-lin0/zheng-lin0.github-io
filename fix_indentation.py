import os
import re

def fix_module_indentation(directory):
    """修复模块文件中的缩进问题"""
    for filename in os.listdir(directory):
        if filename.endswith('.js'):
            file_path = os.path.join(directory, filename)
            
            # 读取文件内容
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 修复缩进问题 - 移除类定义前的额外空格
            # 匹配类定义行
            lines = content.split('\n')
            fixed_lines = []
            for line in lines:
                # 修复类定义
                if line.strip().startswith('class '):
                    # 只保留必要的缩进（如果有的话）
                    leading_spaces = len(line) - len(line.lstrip())
                    if leading_spaces > 4:
                        # 移除多余的缩进
                        fixed_line = ' ' * 4 + line.lstrip()
                        fixed_lines.append(fixed_line)
                    else:
                        fixed_lines.append(line)
                else:
                    fixed_lines.append(line)
            
            # 重新组合内容
            fixed_content = '\n'.join(fixed_lines)
            
            # 保存修复后的内容
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            
            print(f'修复了 {filename} 的缩进问题')

# 修复modules目录下的所有JavaScript文件
fix_module_indentation('js/modules')
print('所有模块文件修复完成！')
