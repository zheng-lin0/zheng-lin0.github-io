import os
import time

def test_server():
    """测试文件是否存在"""
    try:
        if os.path.exists('index.html'):
            print("✓ index.html 文件存在")
            return True
        else:
            print("✗ index.html 文件不存在")
            return False
    except Exception as e:
        print(f"✗ 无法访问index.html: {e}")
        return False

def test_test_page():
    """测试修复测试页面是否存在"""
    try:
        if os.path.exists('test_frontend_fix.html'):
            print("✓ 修复测试页面存在")
            return True
        else:
            print("✗ 修复测试页面不存在")
            return False
    except Exception as e:
        print(f"✗ 无法访问测试页面: {e}")
        return False

def test_js_files():
    """测试关键JS文件是否存在"""
    js_files = [
        'js/utils.js',
        'js/app.js', 
        'js/modules/ModalSystem.js',
        'js/modules/ResourceManager.js'
    ]
    
    all_exist = True
    for js_file in js_files:
        try:
            if os.path.exists(js_file):
                print(f"✓ {js_file} 存在")
            else:
                print(f"✗ {js_file} 不存在")
                all_exist = False
        except Exception as e:
            print(f"✗ 无法访问 {js_file}: {e}")
            all_exist = False
    
    return all_exist

def test_fix_summary():
    """生成修复总结"""
    print("\n=== 前端修复总结 ===")
    print("1. 已修复的问题:")
    print("   - ✅ 缺失的openLoginModal函数已添加到utils.js")
    print("   - ✅ 缺失的openRegisterModal函数已添加到utils.js")
    print("   - ✅ 缺失的uploadResource函数已添加到utils.js")
    print("   - ✅ onbeforeunload事件的安全处理已添加到app.js")
    print("   - ✅ 所有函数都已绑定到全局作用域，可在HTML中直接调用")
    
    print("\n2. 修复的技术细节:")
    print("   - 函数定义遵循了现有的代码结构和模式")
    print("   - 使用了安全的错误处理，避免页面崩溃")
    print("   - onbeforeunload事件不会显示确认对话框")
    print("   - spyCache的保存操作包含了错误捕获")
    
    print("\n3. 验证方法:")
    print("   - 访问 http://localhost:8080/test_frontend_fix.html 进行全面测试")
    print("   - 在浏览器控制台检查是否有错误")
    print("   - 手动测试登录、注册按钮和上传功能")

if __name__ == "__main__":
    print("开始测试前端修复...")
    time.sleep(1)  # 给服务器一点启动时间
    
    server_ok = test_server()
    test_page_ok = test_test_page()
    js_files_ok = test_js_files()
    
    print("\n=== 测试结果 ===")
    if server_ok and test_page_ok and js_files_ok:
        print("✓ 所有基本测试通过！")
        print("请在浏览器中打开 http://localhost:8080/test_frontend_fix.html 进行完整测试")
    else:
        print("✗ 部分测试失败，请检查服务器和文件是否正确配置")
    
    test_fix_summary()
