# 测试网站功能的Python脚本
# 此脚本用于验证网站文件结构和基本配置

import os
import re

def test_file_structure():
    print("=== 网站功能测试开始 ===\n")
    
    # 测试1：检查基本文件结构
    print("1. 检查基本文件结构：")
    required_files = [
        'index.html',
        'css/main.css',
        'js/config.js',
        'js/utils.js',
        'js/app.js'
    ]
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✓ {file_path} 存在")
        else:
            print(f"✗ {file_path} 不存在")
    
    # 测试2：检查模块文件
    print("\n2. 检查模块文件：")
    modules_dir = 'js/modules'
    if os.path.exists(modules_dir):
        module_files = os.listdir(modules_dir)
        print(f"✓ 模块目录存在，包含 {len(module_files)} 个模块文件")
        for module_file in module_files:
            print(f"   ✓ {module_file}")
    else:
        print(f"✗ 模块目录 {modules_dir} 不存在")
    
    # 测试3：检查HTML文件结构
    print("\n3. 检查HTML文件结构：")
    if os.path.exists('index.html'):
        with open('index.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # 检查外部CSS引用
        css_links = re.findall(r'<link\s+[^>]*rel=["\']stylesheet["\'][^>]*>', html_content)
        print(f"✓ 发现 {len(css_links)} 个外部CSS引用")
        
        # 检查外部JS引用
        js_scripts = re.findall(r'<script\s+[^>]*src=["\'][^"\']+["\'][^>]*>', html_content)
        print(f"✓ 发现 {len(js_scripts)} 个外部JavaScript引用")
        
        # 检查是否有内联style和script标签
        inline_styles = re.findall(r'<style[^>]*>.*?</style>', html_content, re.DOTALL)
        if inline_styles:
            print(f"✗ 发现 {len(inline_styles)} 个内联<style>标签")
        else:
            print("✓ 未发现内联<style>标签")
            
        inline_scripts = re.findall(r'<script[^>]*>(?!<\/script>).*?</script>', html_content, re.DOTALL)
        if inline_scripts:
            print(f"✗ 发现 {len(inline_scripts)} 个内联<script>标签")
        else:
            print("✓ 未发现内联<script>标签")
            
    else:
        print("✗ index.html 文件不存在")
    
    # 测试4：检查CSS文件内容
    print("\n4. 检查CSS文件内容：")
    if os.path.exists('css/main.css'):
        with open('css/main.css', 'r', encoding='utf-8') as f:
            css_content = f.read()
        
        print(f"✓ CSS文件大小: {len(css_content)} 字符")
        
        # 检查是否包含基础样式
        if 'body' in css_content and 'html' in css_content:
            print("✓ 包含基础HTML/body样式")
        
        if 'header' in css_content and 'footer' in css_content:
            print("✓ 包含页面结构样式")
            
    else:
        print("✗ css/main.css 文件不存在")
    
    # 测试5：检查JavaScript模块内容
    print("\n5. 检查JavaScript模块内容：")
    if os.path.exists('js/modules'):
        module_files = [f for f in os.listdir('js/modules') if f.endswith('.js')]
        for module_file in module_files:
            module_path = os.path.join('js/modules', module_file)
            with open(module_path, 'r', encoding='utf-8') as f:
                module_content = f.read()
            
            # 检查是否包含类定义
            if 'class ' in module_content:
                print(f"✓ {module_file} 包含类定义")
            else:
                print(f"✗ {module_file} 不包含类定义")
                
    print("\n=== 网站功能测试结束 ===")

if __name__ == "__main__":
    test_file_structure();
