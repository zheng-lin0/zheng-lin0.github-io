/**
 * 智能计算器工具组件
 * @module Calculator
 */

class Calculator {
    constructor() {
        this.currentInput = '';
        this.previousInput = '';
        this.operator = null;
        this.isNewInput = true;
        this.isScientific = false;
        this.history = [];
    }

    /**
     * 初始化计算器功能
     */
    init() {
        this.renderControls();
        this.setupEventListeners();
    }

    /**
     * 渲染计算器控制界面
     * @returns {string} HTML内容
     */
    renderControls() {
        return `
            <div class="calculator-container">
                <div class="calculator-header">
                    <div class="calculator-toggle">
                        <button id="calc-mode-toggle" class="btn btn-sm btn-secondary">
                            <i class="fas fa-science"></i> 科学模式
                        </button>
                    </div>
                </div>
                
                <div class="calculator-display">
                    <div id="calc-previous" class="calculator-previous">${this.previousInput} ${this.operator || ''}</div>
                    <div id="calc-current" class="calculator-current">${this.currentInput || '0'}</div>
                </div>
                
                <div class="calculator-buttons">
                    <!-- 基本计算按钮 -->
                    <div class="btn-row">
                        <button data-type="function" data-value="clear" class="btn btn-secondary btn-calc">C</button>
                        <button data-type="function" data-value="del" class="btn btn-secondary btn-calc">⌫</button>
                        <button data-type="function" data-value="percent" class="btn btn-secondary btn-calc">%</button>
                        <button data-type="operator" data-value="/" class="btn btn-primary btn-calc">÷</button>
                    </div>
                    
                    <div class="btn-row">
                        <button data-type="number" data-value="7" class="btn btn-light btn-calc">7</button>
                        <button data-type="number" data-value="8" class="btn btn-light btn-calc">8</button>
                        <button data-type="number" data-value="9" class="btn btn-light btn-calc">9</button>
                        <button data-type="operator" data-value="*" class="btn btn-primary btn-calc">×</button>
                    </div>
                    
                    <div class="btn-row">
                        <button data-type="number" data-value="4" class="btn btn-light btn-calc">4</button>
                        <button data-type="number" data-value="5" class="btn btn-light btn-calc">5</button>
                        <button data-type="number" data-value="6" class="btn btn-light btn-calc">6</button>
                        <button data-type="operator" data-value="-" class="btn btn-primary btn-calc">-</button>
                    </div>
                    
                    <div class="btn-row">
                        <button data-type="number" data-value="1" class="btn btn-light btn-calc">1</button>
                        <button data-type="number" data-value="2" class="btn btn-light btn-calc">2</button>
                        <button data-type="number" data-value="3" class="btn btn-light btn-calc">3</button>
                        <button data-type="operator" data-value="+" class="btn btn-primary btn-calc">+</button>
                    </div>
                    
                    <div class="btn-row">
                        <button data-type="number" data-value="0" class="btn btn-light btn-calc btn-wide">0</button>
                        <button data-type="number" data-value="." class="btn btn-light btn-calc">.</button>
                        <button data-type="function" data-value="equals" class="btn btn-primary btn-calc">=</button>
                    </div>
                    
                    <!-- 科学计算按钮 -->
                    <div id="scientific-buttons" class="scientific-buttons" style="display: none;">
                        <div class="btn-row">
                            <button data-type="scientific" data-value="sin" class="btn btn-info btn-calc">sin</button>
                            <button data-type="scientific" data-value="cos" class="btn btn-info btn-calc">cos</button>
                            <button data-type="scientific" data-value="tan" class="btn btn-info btn-calc">tan</button>
                            <button data-type="scientific" data-value="log" class="btn btn-info btn-calc">log</button>
                        </div>
                        
                        <div class="btn-row">
                            <button data-type="scientific" data-value="asin" class="btn btn-info btn-calc">asin</button>
                            <button data-type="scientific" data-value="acos" class="btn btn-info btn-calc">acos</button>
                            <button data-type="scientific" data-value="atan" class="btn btn-info btn-calc">atan</button>
                            <button data-type="scientific" data-value="ln" class="btn btn-info btn-calc">ln</button>
                        </div>
                        
                        <div class="btn-row">
                            <button data-type="scientific" data-value="sqrt" class="btn btn-info btn-calc">√</button>
                            <button data-type="scientific" data-value="pow" class="btn btn-info btn-calc">x²</button>
                            <button data-type="scientific" data-value="exp" class="btn btn-info btn-calc">e^x</button>
                            <button data-type="scientific" data-value="pi" class="btn btn-info btn-calc">π</button>
                        </div>
                        
                        <div class="btn-row">
                            <button data-type="scientific" data-value="factorial" class="btn btn-info btn-calc">x!</button>
                            <button data-type="scientific" data-value="1/x" class="btn btn-info btn-calc">1/x</button>
                            <button data-type="scientific" data-value="e" class="btn btn-info btn-calc">e</button>
                            <button data-type="scientific" data-value="rand" class="btn btn-info btn-calc">Rand</button>
                        </div>
                    </div>
                </div>
                
                <!-- 计算历史 -->
                <div class="calculator-history">
                    <h5>计算历史</h5>
                    <div id="calc-history" class="history-list">
                        ${this.history.length === 0 ? '<p class="history-empty">暂无历史记录</p>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 按钮点击事件委托
        const container = document.querySelector('.calculator-buttons');
        if (container) {
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-calc')) {
                    const type = e.target.dataset.type;
                    const value = e.target.dataset.value;
                    this.handleButtonClick(type, value);
                }
            });
        }

        // 模式切换按钮
        const modeToggle = document.getElementById('calc-mode-toggle');
        if (modeToggle) {
            modeToggle.addEventListener('click', () => {
                this.toggleScientificMode();
            });
        }

        // 键盘支持
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e.key);
        });
    }

    /**
     * 处理按钮点击
     */
    handleButtonClick(type, value) {
        switch (type) {
            case 'number':
                this.inputNumber(value);
                break;
            case 'operator':
                this.inputOperator(value);
                break;
            case 'function':
                this.inputFunction(value);
                break;
            case 'scientific':
                this.inputScientific(value);
                break;
        }
        this.updateDisplay();
    }

    /**
     * 处理数字输入
     */
    inputNumber(num) {
        if (this.isNewInput) {
            this.currentInput = num;
            this.isNewInput = false;
        } else {
            this.currentInput = this.currentInput + num;
        }
    }

    /**
     * 处理运算符输入
     */
    inputOperator(op) {
        if (this.operator && !this.isNewInput) {
            this.calculate();
        }
        this.previousInput = this.currentInput;
        this.operator = op;
        this.isNewInput = true;
    }

    /**
     * 处理功能按钮输入
     */
    inputFunction(func) {
        switch (func) {
            case 'clear':
                this.clear();
                break;
            case 'del':
                this.delete();
                break;
            case 'percent':
                this.percent();
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }

    /**
     * 处理科学计算按钮输入
     */
    inputScientific(func) {
        const num = parseFloat(this.currentInput);
        let result;

        switch (func) {
            case 'sin':
                result = Math.sin(num * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(num * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(num * Math.PI / 180);
                break;
            case 'asin':
                result = Math.asin(num) * 180 / Math.PI;
                break;
            case 'acos':
                result = Math.acos(num) * 180 / Math.PI;
                break;
            case 'atan':
                result = Math.atan(num) * 180 / Math.PI;
                break;
            case 'log':
                result = Math.log10(num);
                break;
            case 'ln':
                result = Math.log(num);
                break;
            case 'sqrt':
                result = Math.sqrt(num);
                break;
            case 'pow':
                result = Math.pow(num, 2);
                break;
            case 'exp':
                result = Math.exp(num);
                break;
            case 'pi':
                result = Math.PI;
                break;
            case 'factorial':
                result = this.factorial(num);
                break;
            case '1/x':
                result = 1 / num;
                break;
            case 'e':
                result = Math.E;
                break;
            case 'rand':
                result = Math.random();
                break;
        }

        if (result !== undefined) {
            this.currentInput = this.formatResult(result);
            this.isNewInput = true;
        }
    }

    /**
     * 计算阶乘
     */
    factorial(num) {
        if (num < 0) return NaN;
        if (num === 0 || num === 1) return 1;
        let result = 1;
        for (let i = 2; i <= num; i++) {
            result *= i;
        }
        return result;
    }

    /**
     * 执行计算
     */
    calculate() {
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);

        if (isNaN(prev) || isNaN(current)) return;

        let result;

        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = prev / current;
                break;
        }

        // 保存到历史记录
        this.history.push({
            expression: `${prev} ${this.operator} ${current}`,
            result: result,
            timestamp: new Date().toLocaleString()
        });

        this.currentInput = this.formatResult(result);
        this.previousInput = '';
        this.operator = null;
        this.isNewInput = true;

        this.updateHistory();
    }

    /**
     * 格式化计算结果
     */
    formatResult(result) {
        if (isNaN(result)) return '错误';
        if (result === Infinity) return '∞';
        if (result === -Infinity) return '-∞';
        
        // 限制小数位数
        return parseFloat(result.toPrecision(12)).toString();
    }

    /**
     * 清除计算器
     */
    clear() {
        this.currentInput = '';
        this.previousInput = '';
        this.operator = null;
        this.isNewInput = true;
    }

    /**
     * 删除最后一个字符
     */
    delete() {
        if (this.isNewInput || this.currentInput.length === 0) return;
        this.currentInput = this.currentInput.slice(0, -1);
    }

    /**
     * 百分比计算
     */
    percent() {
        const num = parseFloat(this.currentInput);
        if (!isNaN(num)) {
            this.currentInput = (num / 100).toString();
        }
    }

    /**
     * 切换科学计算模式
     */
    toggleScientificMode() {
        this.isScientific = !this.isScientific;
        const scientificButtons = document.getElementById('scientific-buttons');
        const modeToggle = document.getElementById('calc-mode-toggle');
        
        if (scientificButtons) {
            scientificButtons.style.display = this.isScientific ? 'block' : 'none';
        }
        
        if (modeToggle) {
            modeToggle.innerHTML = this.isScientific 
                ? '<i class="fas fa-calculator"></i> 基本模式' 
                : '<i class="fas fa-science"></i> 科学模式';
        }
    }

    /**
     * 处理键盘输入
     */
    handleKeyboardInput(key) {
        if (key >= '0' && key <= '9') {
            this.inputNumber(key);
        } else if (['+', '-', '*', '/'].includes(key)) {
            this.inputOperator(key === '*' ? '*' : key === '/' ? '/' : key);
        } else if (key === '.') {
            this.inputNumber('.');
        } else if (key === 'Enter' || key === '=') {
            this.inputFunction('equals');
        } else if (key === 'Escape') {
            this.inputFunction('clear');
        } else if (key === 'Backspace') {
            this.inputFunction('del');
        } else if (key === '%') {
            this.inputFunction('percent');
        }
        this.updateDisplay();
    }

    /**
     * 更新计算器显示
     */
    updateDisplay() {
        const previousDisplay = document.getElementById('calc-previous');
        const currentDisplay = document.getElementById('calc-current');
        
        if (previousDisplay) {
            previousDisplay.textContent = `${this.previousInput} ${this.operator || ''}`;
        }
        
        if (currentDisplay) {
            currentDisplay.textContent = this.currentInput || '0';
        }
    }

    /**
     * 更新计算历史
     */
    updateHistory() {
        const historyContainer = document.getElementById('calc-history');
        if (historyContainer) {
            if (this.history.length === 0) {
                historyContainer.innerHTML = '<p class="history-empty">暂无历史记录</p>';
            } else {
                const historyHTML = this.history
                    .slice(-10) // 只显示最近10条
                    .reverse()
                    .map(item => `
                        <div class="history-item">
                            <div class="history-expression">${item.expression}</div>
                            <div class="history-result">= ${item.result}</div>
                            <div class="history-time">${item.timestamp}</div>
                        </div>
                    `).join('');
                
                historyContainer.innerHTML = historyHTML;
            }
        }
    }

    /**
     * 销毁计算器功能
     */
    destroy() {
        this.currentInput = '';
        this.previousInput = '';
        this.operator = null;
        this.isNewInput = true;
        this.isScientific = false;
        this.history = [];
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculator;
} else {
    window.Calculator = Calculator;
}
