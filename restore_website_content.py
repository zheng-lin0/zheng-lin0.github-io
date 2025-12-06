#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
恢复网站内容脚本
将备份文件中的实际内容与当前的外部资源引用结构结合起来
"""

import os
import re

# 读取当前干净的HTML文件（包含外部资源引用）
with open('index.html', 'r', encoding='utf-8') as f:
    current_html = f.read()

# 读取备份文件（包含所有实际内容）
with open('index.html.bak', 'r', encoding='utf-8') as f:
    backup_html = f.read()

# 提取备份文件中的实际内容（在<body>标签内）
body_pattern = r'<body[^>]*>([\s\S]*?)</body>'
body_match = re.search(body_pattern, backup_html, re.IGNORECASE)
if not body_match:
    print("无法从备份文件中提取body内容！")
    exit(1)

body_content = body_match.group(1)

# 提取当前文件中的<body>标签结构
current_body_pattern = r'(<body[^>]*>)([\s\S]*?)(</body>)'
current_body_match = re.search(current_body_pattern, current_html, re.IGNORECASE)
if not current_body_match:
    print("无法从当前文件中提取body结构！")
    exit(1)

# 替换当前文件中的body内容为备份文件的内容
new_html = current_html.replace(
    current_body_match.group(0),
    f'{current_body_match.group(1)}{body_content}{current_body_match.group(3)}'
)

# 移除内联的style和script标签
# 移除内联style标签
new_html = re.sub(r'<style[^>]*>[\s\S]*?</style>', '', new_html, flags=re.IGNORECASE)
# 移除内联script标签
new_html = re.sub(r'<script[^>]*>[\s\S]*?</script>', '', new_html, flags=re.IGNORECASE)

# 提取当前文件中的外部资源引用
head_pattern = r'(<head[^>]*>[\s\S]*?</head>)'
head_match = re.search(head_pattern, current_html, re.IGNORECASE)
if not head_match:
    print("无法从当前文件中提取head内容！")
    exit(1)

current_head_content = head_match.group(1)

# 提取备份文件中的head部分（不含内联style）
backup_head_pattern = r'(<head[^>]*>)([\s\S]*?)(</head>)'
backup_head_match = re.search(backup_head_pattern, backup_html, re.IGNORECASE)
if not backup_head_match:
    print("无法从备份文件中提取head结构！")
    exit(1)

# 替换为当前文件的head部分（包含正确的外部资源引用）
new_html = re.sub(
    backup_head_pattern, 
    current_head_content, 
    new_html, 
    flags=re.IGNORECASE
)

# 保存新的HTML文件
with open('index.html.new', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("网站内容已恢复并保存为index.html.new！")
print("请检查文件内容后，将其重命名为index.html并推送到GitHub")