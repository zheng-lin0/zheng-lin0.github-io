// 工具功能验证脚本
// 这个脚本将测试所有工具的核心功能

console.log('=== 开始验证所有工具功能 ===');

// 测试函数
function testTool(toolId, toolName, testFunction) {
    console.log(`\n--- 测试 ${toolName} (${toolId}) ---`);
    try {
        const result = testFunction();
        console.log(`✅ ${toolName} 测试成功: ${result}`);
        return true;
    } catch (error) {
        console.error(`❌ ${toolName} 测试失败:`, error);
        return false;
    }
}

// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始验证工具...');
    
    // 测试1: 检查工具类是否已正确加载到全局作用域
    testTool('global-classes', '工具类加载', function() {
        const toolsToCheck = [
            'TextToSpeech',
            'Calculator',
            'UnitConverter', 
            'PasswordGenerator',
            'AgeCalculator'
        ];
        
        const missingTools = [];
        for (const toolClass of toolsToCheck) {
            if (typeof window[toolClass] === 'undefined') {
                missingTools.push(toolClass);
            }
        }
        
        if (missingTools.length > 0) {
            throw new Error(`缺少以下工具类: ${missingTools.join(', ')}`);
        }
        
        return `所有工具类已成功加载: ${toolsToCheck.join(', ')}`;
    });
    
    // 测试2: 测试TextToSpeech工具
    testTool('text-to-speech', '文字转语音工具', function() {
        if (typeof window.textToSpeech === 'undefined') {
            window.textToSpeech = new window.TextToSpeech();
        }
        
        // 测试初始化
        window.textToSpeech.init();
        
        // 测试renderControls方法
        const controls = window.textToSpeech.renderControls();
        if (!controls || controls.length === 0) {
            throw new Error('renderControls方法返回空内容');
        }
        
        return '文字转语音工具初始化和渲染成功';
    });
    
    // 测试3: 测试Calculator工具
    testTool('calculator', '计算器工具', function() {
        if (typeof window.calculator === 'undefined') {
            window.calculator = new window.Calculator();
        }
        
        // 测试renderControls方法
        const controls = window.calculator.renderControls();
        if (!controls || controls.length === 0) {
            throw new Error('renderControls方法返回空内容');
        }
        
        // 测试基本计算功能
        window.calculator.currentInput = '2+2';
        const result = window.calculator.calculate();
        if (result !== 4) {
            throw new Error(`基本计算错误，2+2应该等于4，实际得到${result}`);
        }
        
        return '计算器工具渲染和基本计算功能成功';
    });
    
    // 测试4: 测试PasswordGenerator工具
    testTool('password-generator', '密码生成器工具', function() {
        if (typeof window.passwordGenerator === 'undefined') {
            window.passwordGenerator = new window.PasswordGenerator();
        }
        
        // 测试renderControls方法
        const controls = window.passwordGenerator.renderControls();
        if (!controls || controls.length === 0) {
            throw new Error('renderControls方法返回空内容');
        }
        
        // 测试生成密码功能
        const password = window.passwordGenerator.generatePassword(12, true, true, true, true);
        if (!password || password.length !== 12) {
            throw new Error(`密码生成错误，应该生成12位密码，实际得到${password}`);
        }
        
        return '密码生成器工具渲染和密码生成功能成功';
    });
    
    // 测试5: 测试AgeCalculator工具
    testTool('age-calculator', '年龄计算器工具', function() {
        if (typeof window.ageCalculator === 'undefined') {
            window.ageCalculator = new window.AgeCalculator();
        }
        
        // 测试renderControls方法
        const controls = window.ageCalculator.renderControls();
        if (!controls || controls.length === 0) {
            throw new Error('renderControls方法返回空内容');
        }
        
        // 测试计算年龄功能
        const birthDate = '1990-01-01';
        const age = window.ageCalculator.calculateAge(birthDate);
        if (!age || typeof age.years !== 'number') {
            throw new Error(`年龄计算错误，应该返回包含years属性的对象，实际得到${JSON.stringify(age)}`);
        }
        
        return '年龄计算器工具渲染和年龄计算功能成功';
    });
    
    // 测试6: 测试openTool函数
    testTool('open-tool', 'openTool函数', function() {
        if (typeof window.openTool === 'undefined') {
            throw new Error('openTool函数未定义');
        }
        
        return 'openTool函数已成功定义';
    });
    
    // 测试7: 测试closeToolComponent函数
    testTool('close-tool', 'closeToolComponent函数', function() {
        if (typeof window.closeToolComponent === 'undefined') {
            throw new Error('closeToolComponent函数未定义');
        }
        
        return 'closeToolComponent函数已成功定义';
    });
    
    console.log('\n=== 工具功能验证完成 ===');
    console.log('请在浏览器中打开 http://localhost:8000/test_all_tools.html 进行完整测试。');
});

// 添加到全局作用域，以便在浏览器控制台中使用
window.verifyTools = function() {
    console.log('手动触发工具验证...');
    // 重新运行所有测试
    const script = document.createElement('script');
    script.textContent = 'document.dispatchEvent(new Event(\'DOMContentLoaded\'));';
    document.body.appendChild(script);
    document.body.removeChild(script);
};