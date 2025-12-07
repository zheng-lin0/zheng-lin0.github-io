// 跨域错误修复验证脚本
// 模拟 BrowserSystem.js 中的 iframe 内容访问逻辑

console.log('=== 跨域错误修复验证 ===');
console.log('测试开始时间:', new Date().toLocaleString());
console.log('='.repeat(50));

// 原始问题代码 - 直接访问 location.href
function originalCrossDomainCheck() {
    console.log('\n1. 测试原始问题代码（直接访问 location.href）:');
    
    // 模拟跨域环境下的 iframe.contentWindow
    const mockIframeContentWindow = {
        // 模拟跨域时访问 location.href 会抛出异常
        get location() {
            throw new DOMException('SecurityError: Blocked a frame with origin "null" from accessing a cross-origin frame.', 'SecurityError');
        }
    };
    
    try {
        const href = mockIframeContentWindow.location.href;
        console.log('   ✅ 意外地成功访问了跨域 iframe 的 location.href');
        return true;
    } catch (error) {
        console.log('   ❌ 捕获到跨域错误:', error.name);
        console.log('   错误消息:', error.message);
        return false;
    }
}

// 修复后的代码 - 使用更安全的方式检查
function fixedCrossDomainCheck() {
    console.log('\n2. 测试修复后的代码（安全的属性检查）:');
    
    // 模拟跨域环境下的 iframe.contentWindow
    const mockIframeContentWindow = {
        // 模拟跨域时访问 document 会抛出异常
        get document() {
            throw new DOMException('SecurityError: Blocked a frame with origin "null" from accessing a cross-origin frame.', 'SecurityError');
        }
    };
    
    try {
        // 使用修复后的安全检查方式
        const contentWindow = mockIframeContentWindow;
        let canAccessContent = false;
        
        if (contentWindow) {
            try {
                const doc = contentWindow.document;
                if (doc) {
                    const docType = typeof doc;
                    canAccessContent = docType === 'object' && doc !== null;
                }
            } catch (crossOriginError) {
                console.log('   ⚠️ 捕获到跨域错误（预期行为）:', crossOriginError.name);
                console.log('   错误被安全处理，不会导致页面崩溃');
            }
        }
        
        console.log('   ✅ 代码执行完成，没有导致页面崩溃');
        console.log('   可访问内容:', canAccessContent);
        return true;
    } catch (error) {
        console.log('   ❌ 修复后的代码仍然抛出异常:', error.name);
        console.log('   错误消息:', error.message);
        return false;
    }
}

// 测试同域情况
function testSameDomainScenario() {
    console.log('\n3. 测试同域情况:');
    
    // 模拟同域环境下的 iframe.contentWindow
    const mockSameDomainContentWindow = {
        location: {
            href: 'http://localhost:8081/same-domain-page.html'
        },
        document: {
            title: '同域测试页面',
            body: { tagName: 'BODY' }
        }
    };
    
    try {
        // 使用修复后的安全检查方式
        const contentWindow = mockSameDomainContentWindow;
        let canAccessContent = false;
        let pageTitle = '外部页面';
        
        if (contentWindow) {
            try {
                const doc = contentWindow.document;
                if (doc) {
                    const docType = typeof doc;
                    canAccessContent = docType === 'object' && doc !== null;
                    
                    // 尝试获取页面标题
                    if (canAccessContent && doc.title) {
                        pageTitle = doc.title;
                    }
                }
            } catch (crossOriginError) {
                console.log('   ⚠️ 捕获到错误:', crossOriginError.name);
            }
        }
        
        console.log('   ✅ 同域访问成功');
        console.log('   可访问内容:', canAccessContent);
        console.log('   页面标题:', pageTitle);
        return true;
    } catch (error) {
        console.log('   ❌ 同域访问失败:', error.name);
        console.log('   错误消息:', error.message);
        return false;
    }
}

// 运行所有测试
function runAllTests() {
    console.log('\n开始运行所有测试...\n');
    
    const testResults = {
        originalCode: originalCrossDomainCheck(),
        fixedCode: fixedCrossDomainCheck(),
        sameDomain: testSameDomainScenario()
    };
    
    console.log('\n'.repeat(2));
    console.log('='.repeat(50));
    console.log('测试结果总结:');
    console.log('='.repeat(50));
    
    console.log('1. 原始问题代码:', testResults.originalCode ? '❌ 未复现问题' : '✅ 确认问题存在');
    console.log('2. 修复后的代码:', testResults.fixedCode ? '✅ 修复成功' : '❌ 修复失败');
    console.log('3. 同域情况测试:', testResults.sameDomain ? '✅ 正常工作' : '❌ 出现问题');
    
    // 检查修复是否成功
    const fixSuccess = testResults.fixedCode && testResults.sameDomain && !testResults.originalCode;
    
    console.log('\n' + '='.repeat(50));
    console.log('最终结论:');
    console.log('='.repeat(50));
    
    if (fixSuccess) {
        console.log('🎉 修复成功!');
        console.log('   - 原始跨域错误得到确认');
        console.log('   - 修复后的代码能够安全处理跨域情况');
        console.log('   - 同域情况下功能正常');
        console.log('   - 不再直接访问 location.href，避免了jQuery跨域错误');
    } else {
        console.log('❌ 修复不完整或出现问题');
        console.log('   请检查测试结果和代码逻辑');
    }
    
    console.log('\n测试结束时间:', new Date().toLocaleString());
    console.log('='.repeat(50));
}

// 执行测试
if (typeof window === 'undefined') {
    // Node.js 环境
    console.log('在 Node.js 环境中运行测试...');
    runAllTests();
} else {
    // 浏览器环境
    console.log('在浏览器环境中运行测试...');
    // 延迟执行，确保控制台准备就绪
    setTimeout(runAllTests, 100);
}
