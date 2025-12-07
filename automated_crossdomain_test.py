import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

# 配置Chrome选项
chrome_options = Options()
chrome_options.add_argument("--headless")  # 无头模式运行
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# 启动浏览器
driver = webdriver.Chrome(options=chrome_options)

try:
    # 访问测试页面
    print("正在访问测试页面...")
    driver.get("http://localhost:8080/test_crossdomain_fix.html")
    
    # 等待页面加载
    time.sleep(3)
    
    # 检查控制台日志
    print("正在检查控制台日志...")
    logs = driver.get_log("browser")
    
    # 分析日志
    crossdomain_errors = []
    for log in logs:
        if log['level'] == 'SEVERE' and 'cross-origin' in log['message'].lower():
            crossdomain_errors.append(log)
    
    # 打印结果
    print("\n=== 跨域错误修复测试结果 ===")
    if crossdomain_errors:
        print("❌ 测试失败：发现跨域错误！")
        for error in crossdomain_errors:
            print(f"   错误：{error['message']}")
    else:
        print("✅ 测试通过：没有发现跨域错误！")
    
    # 打印所有日志（用于调试）
    print("\n=== 所有控制台日志 ===")
    for log in logs:
        level = log['level']
        message = log['message']
        if level in ['SEVERE', 'WARNING']:
            print(f"{level}: {message}")
    
    # 尝试重新加载iframe
    print("\n正在尝试重新加载iframe...")
    reload_button = driver.find_element(By.XPATH, "//button[text()='重新加载iframe']")
    reload_button.click()
    time.sleep(2)
    
    # 再次检查日志
    new_logs = driver.get_log("browser")
    new_crossdomain_errors = []
    for log in new_logs:
        if log['level'] == 'SEVERE' and 'cross-origin' in log['message'].lower():
            new_crossdomain_errors.append(log)
    
    if new_crossdomain_errors:
        print("❌ 重新加载iframe后发现跨域错误！")
        for error in new_crossdomain_errors:
            print(f"   错误：{error['message']}")
    else:
        print("✅ 重新加载iframe后没有发现跨域错误！")
        
finally:
    # 关闭浏览器
    driver.quit()
    print("\n测试完成，浏览器已关闭。")
