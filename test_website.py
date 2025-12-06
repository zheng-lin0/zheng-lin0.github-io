#!/usr/bin/env python3
# 测试网站是否能正常运行的脚本

import http.server
import socketserver
import webbrowser
import os
import time

PORT = 8000

def start_server():
    print(f"启动本地HTTP服务器在端口 {PORT}...")
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"服务器已启动: http://localhost:{PORT}")
            print("\n请在浏览器中访问以上URL来测试网站。")
            print("按 Ctrl+C 停止服务器。")
            
            # 尝试自动打开浏览器
            try:
                webbrowser.open(f"http://localhost:{PORT}")
                print("\n浏览器已自动打开。")
            except Exception as e:
                print(f"\n无法自动打开浏览器: {e}")
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止。")
    except OSError as e:
        print(f"\n错误: 无法启动服务器 - {e}")
        print("可能是端口 {PORT} 已被占用。请尝试关闭占用该端口的程序，或修改脚本中的PORT变量。")

def main():
    print("=" * 60)
    print("网站测试工具")
    print("=" * 60)
    print("此脚本将启动一个本地HTTP服务器来测试网站。")
    print("\n功能检查点:")
    print("1. 网站是否能正常加载")
    print("2. 页面底部是否还有代码显示")
    print("3. 所有JavaScript功能是否正常工作")
    print("4. 模态框、性能监控等功能是否可用")
    print("\n" + "=" * 60)
    
    print("自动开始测试...")
    start_server()

if __name__ == "__main__":
    main()